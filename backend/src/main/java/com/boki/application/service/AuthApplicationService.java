package com.boki.application.service;

import com.boki.application.dto.request.LoginRequest;
import com.boki.application.dto.request.RegisterRequest;
import com.boki.application.dto.request.VerifyPhoneRequest;
import com.boki.application.dto.response.AuthResponse;
import com.boki.application.dto.response.UserResponse;
import com.boki.application.exception.AuthenticationException;
import com.boki.application.exception.BusinessRuleException;
import com.boki.application.exception.ResourceNotFoundException;
import com.boki.application.mapper.UserDtoMapper;
import com.boki.application.port.in.GetCurrentUserUseCase;
import com.boki.application.port.in.LoginUserUseCase;
import com.boki.application.port.in.RegisterUserUseCase;
import com.boki.application.port.in.VerifyPhoneUseCase;
import com.boki.application.port.out.OtpService;
import com.boki.application.port.out.PasswordEncoder;
import com.boki.application.port.out.TokenService;
import com.boki.domain.model.user.Email;
import com.boki.domain.model.user.PhoneNumber;
import com.boki.domain.model.user.User;
import com.boki.domain.model.user.UserId;
import com.boki.domain.port.out.UserRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * Application service implementing auth use cases.
 * <p>
 * Orchestrates domain logic and infrastructure ports.
 * Transactions are managed here (Application layer).
 */
@Service
public class AuthApplicationService
        implements RegisterUserUseCase, LoginUserUseCase, VerifyPhoneUseCase, GetCurrentUserUseCase,
                   com.boki.application.port.in.LoginOAuthUseCase, com.boki.application.port.in.VerifyEmailUseCase,
                   com.boki.application.port.in.UpdateUserProfileUseCase {

    private final UserRepository userRepository;
    private final TokenService tokenService;
    private final PasswordEncoder passwordEncoder;
    private final OtpService otpService;
    private final com.boki.application.port.out.EmailService emailService;
    private final com.boki.application.port.out.OAuthProvider oauthProvider;

    public AuthApplicationService(
            UserRepository userRepository,
            TokenService tokenService,
            PasswordEncoder passwordEncoder,
            OtpService otpService,
            com.boki.application.port.out.EmailService emailService,
            com.boki.application.port.out.OAuthProvider oauthProvider
    ) {
        this.userRepository = userRepository;
        this.tokenService = tokenService;
        this.passwordEncoder = passwordEncoder;
        this.otpService = otpService;
        this.emailService = emailService;
        this.oauthProvider = oauthProvider;
    }

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        Email email = Email.of(request.email());

        if (userRepository.existsByEmail(email)) {
            throw new BusinessRuleException("An account with this email already exists");
        }

        String hashedPassword = passwordEncoder.encode(request.password());
        User user = User.register(email, hashedPassword, request.displayName());
        User savedUser = userRepository.save(user);

        // Send email verification token
        String emailToken = tokenService.generateToken(
                savedUser.getId().value(),
                savedUser.getEmail().value(),
                savedUser.getPhoneVerified()
        );
        emailService.sendVerificationEmail(savedUser.getEmail().value(), emailToken);

        String token = tokenService.generateToken(
                savedUser.getId().value(),
                savedUser.getEmail().value(),
                savedUser.getPhoneVerified()
        );

        return AuthResponse.of(token, UserDtoMapper.toResponse(savedUser));
    }

    @Override
    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        Email email = Email.of(request.email());

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AuthenticationException("Invalid email or password"));

        if (!user.isActive()) {
            throw new AuthenticationException("Account is deactivated");
        }

        if (user.getPasswordHash() == null) {
            throw new AuthenticationException("This account uses OAuth login. Please sign in with your social provider.");
        }

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new AuthenticationException("Invalid email or password");
        }

        String token = tokenService.generateToken(
                user.getId().value(),
                user.getEmail().value(),
                user.getPhoneVerified()
        );

        return AuthResponse.of(token, UserDtoMapper.toResponse(user));
    }

    @Override
    @Transactional
    public AuthResponse verifyPhone(UUID userId, VerifyPhoneRequest request) {
        User user = userRepository.findById(UserId.of(userId))
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        // Validate OTP server-side via Firebase
        otpService.verifyOtp(request.verificationId(), request.code());

        // Update domain model
        PhoneNumber phone = PhoneNumber.of(request.phoneNumber());
        user.verifyPhone(phone);
        User savedUser = userRepository.save(user);

        // Issue new token with updated phone_verified claim
        String token = tokenService.generateToken(
                savedUser.getId().value(),
                savedUser.getEmail().value(),
                savedUser.getPhoneVerified()
        );

        return AuthResponse.of(token, UserDtoMapper.toResponse(savedUser));
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getCurrentUser(UUID userId) {
        User user = userRepository.findById(UserId.of(userId))
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        return UserDtoMapper.toResponse(user);
    }

    @Override
    @Transactional
    public AuthResponse loginOAuth(com.boki.application.dto.request.OAuthLoginRequest request) {
        com.boki.application.dto.response.OAuthUserInfo userInfo = oauthProvider.verifyToken(request.provider(), request.token(), request.redirectUri());

        Email email = Email.of(userInfo.email());
        java.util.Optional<User> existingUser = userRepository.findByOAuth(request.provider(), userInfo.providerUserId());
        
        User user;
        if (existingUser.isPresent()) {
            user = existingUser.get();
        } else {
            // Check if user exists by email (registered via email/password or another provider)
            java.util.Optional<User> userByEmail = userRepository.findByEmail(email);
            if (userByEmail.isPresent()) {
                user = userByEmail.get();
            } else {
                // Register a new user from OAuth
                user = User.fromOAuth(email, userInfo.displayName(), userInfo.avatarUrl());
                user = userRepository.save(user);
            }
            // Link the OAuth account
            userRepository.linkOAuthAccount(user.getId(), request.provider(), userInfo.providerUserId());
        }

        if (!user.isActive()) {
            throw new AuthenticationException("Account is deactivated");
        }

        String token = tokenService.generateToken(
                user.getId().value(),
                user.getEmail().value(),
                user.getPhoneVerified()
        );

        return AuthResponse.of(token, UserDtoMapper.toResponse(user));
    }

    @Override
    @Transactional
    public void verifyEmail(com.boki.application.dto.request.VerifyEmailRequest request) {
        // Validate email token using TokenService
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
    public UserResponse updateProfile(UUID userId, com.boki.application.dto.request.UpdateProfileRequest request) {
        User user = userRepository.findById(UserId.of(userId))
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        user.updateProfile(request.displayName(), request.avatarUrl());
        User savedUser = userRepository.save(user);
        return UserDtoMapper.toResponse(savedUser);
    }
}
