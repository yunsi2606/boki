package com.boki.application.service;

import com.boki.application.dto.request.ResetPasswordRequest;
import com.boki.application.dto.request.UpdateProfileRequest;
import com.boki.application.dto.request.VerifyEmailRequest;
import com.boki.application.dto.response.UserResponse;
import com.boki.application.exception.BusinessRuleException;
import com.boki.application.exception.ResourceNotFoundException;
import com.boki.application.mapper.UserDtoMapper;
import com.boki.application.port.in.ForgotPasswordUseCase;
import com.boki.application.port.in.ResetPasswordUseCase;
import com.boki.application.port.in.UpdateUserProfileUseCase;
import com.boki.application.port.in.VerifyEmailUseCase;
import com.boki.application.port.out.EmailService;
import com.boki.application.port.out.PasswordEncoder;
import com.boki.application.port.out.TokenService;
import com.boki.domain.model.user.Email;
import com.boki.domain.model.user.User;
import com.boki.domain.model.user.UserId;
import com.boki.domain.port.out.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * Application service for user account profile management and password recovery.
 */
@Service
public class UserAccountApplicationService implements
        VerifyEmailUseCase, UpdateUserProfileUseCase, ForgotPasswordUseCase, ResetPasswordUseCase {

    private final UserRepository userRepository;
    private final TokenService tokenService;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    public UserAccountApplicationService(
            UserRepository userRepository,
            TokenService tokenService,
            PasswordEncoder passwordEncoder,
            EmailService emailService
    ) {
        this.userRepository = userRepository;
        this.tokenService = tokenService;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
    }

    @Override
    @Transactional
    public void verifyEmail(VerifyEmailRequest request) {
        if (!tokenService.validateToken(request.token())) {
            throw new BusinessRuleException("Invalid or expired email verification token");
        }

        String emailFromToken = tokenService.extractEmail(request.token());
        if (!emailFromToken.equalsIgnoreCase(request.email())) {
            throw new BusinessRuleException("Token does not match the provided email address");
        }

        User user = userRepository.findByEmail(Email.of(request.email()))
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", request.email()));

        user.verifyEmail();
        userRepository.save(user);
    }

    @Override
    @Transactional
    public UserResponse updateProfile(UUID userId, UpdateProfileRequest request) {
        User user = userRepository.findById(UserId.of(userId))
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        user.updateProfile(request.displayName(), request.avatarUrl());
        User savedUser = userRepository.save(user);
        return UserDtoMapper.toResponse(savedUser);
    }

    @Override
    @Transactional(readOnly = true)
    public void forgotPassword(String email) {
        userRepository.findByEmail(Email.of(email)).ifPresent(user -> {
            String resetToken = tokenService.generateToken(
                    user.getId().value(),
                    user.getEmail().value(),
                    user.getRole().name(),
                    user.getPhoneVerified()
            );
            emailService.sendPasswordResetEmail(user.getEmail().value(), resetToken);
        });
    }

    @Override
    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        if (!tokenService.validateToken(request.token())) {
            throw new BusinessRuleException("Invalid or expired password reset token");
        }

        String emailFromToken = tokenService.extractEmail(request.token());
        if (!emailFromToken.equalsIgnoreCase(request.email())) {
            throw new BusinessRuleException("Token does not match the provided email address");
        }

        User user = userRepository.findByEmail(Email.of(request.email()))
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", request.email()));

        if (user.getPasswordHash() == null) {
            throw new BusinessRuleException("This account uses OAuth login and does not have a password");
        }

        String newHash = passwordEncoder.encode(request.newPassword());
        user.changePassword(newHash);
        userRepository.save(user);
    }
}
