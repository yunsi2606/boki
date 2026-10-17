package com.boki.application.service;

import com.boki.application.dto.request.LoginRequest;
import com.boki.application.dto.request.RefreshTokenRequest;
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
import com.boki.application.port.in.RefreshTokenUseCase;
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
import com.boki.infrastructure.persistence.entity.RefreshTokenJpaEntity;
import com.boki.infrastructure.persistence.repository.RefreshTokenJpaRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

/**
 * Application service implementing auth use cases.
 */
@Service
public class AuthApplicationService
        implements RegisterUserUseCase, LoginUserUseCase, VerifyPhoneUseCase, GetCurrentUserUseCase,
                   RefreshTokenUseCase, com.boki.application.port.in.LoginOAuthUseCase {

    private final UserRepository userRepository;
    private final TokenService tokenService;
    private final PasswordEncoder passwordEncoder;
    private final OtpService otpService;
    private final com.boki.application.port.out.EmailService emailService;
    private final com.boki.application.port.out.OAuthProvider oauthProvider;
    private final RefreshTokenJpaRepository refreshTokenRepository;

    public AuthApplicationService(
            UserRepository userRepository,
            TokenService tokenService,
            PasswordEncoder passwordEncoder,
            OtpService otpService,
            com.boki.application.port.out.EmailService emailService,
            com.boki.application.port.out.OAuthProvider oauthProvider,
            RefreshTokenJpaRepository refreshTokenRepository
    ) {
        this.userRepository = userRepository;
        this.tokenService = tokenService;
        this.passwordEncoder = passwordEncoder;
        this.otpService = otpService;
        this.emailService = emailService;
        this.oauthProvider = oauthProvider;
        this.refreshTokenRepository = refreshTokenRepository;
    }

    private String issueRefreshToken(User user) {
        RefreshTokenJpaEntity refreshEntity = new RefreshTokenJpaEntity();
        refreshEntity.setUserId(user.getId().value());
        refreshEntity.setToken(UUID.randomUUID().toString());
        refreshEntity.setExpiryDate(Instant.now().plus(14, ChronoUnit.DAYS));
        refreshTokenRepository.save(refreshEntity);
        return refreshEntity.getToken();
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
                savedUser.getRole().name(),
                savedUser.getPhoneVerified()
        );
        emailService.sendVerificationEmail(savedUser.getEmail().value(), emailToken);

        String accessToken = tokenService.generateToken(
                savedUser.getId().value(),
                savedUser.getEmail().value(),
                savedUser.getRole().name(),
                savedUser.getPhoneVerified()
        );
        String refreshToken = issueRefreshToken(savedUser);

        return AuthResponse.of(accessToken, refreshToken, UserDtoMapper.toResponse(savedUser));
    }

    @Override
    @Transactional
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

        String accessToken = tokenService.generateToken(
                user.getId().value(),
                user.getEmail().value(),
                user.getRole().name(),
                user.getPhoneVerified()
        );
        String refreshToken = issueRefreshToken(user);

        return AuthResponse.of(accessToken, refreshToken, UserDtoMapper.toResponse(user));
    }

    @Override
    @Transactional
    public AuthResponse refreshToken(RefreshTokenRequest request) {
        RefreshTokenJpaEntity refreshEntity = refreshTokenRepository.findByToken(request.refreshToken())
                .orElseThrow(() -> new AuthenticationException("Invalid or expired refresh token"));

        if (refreshEntity.getExpiryDate().isBefore(Instant.now())) {
            refreshTokenRepository.delete(refreshEntity);
            throw new AuthenticationException("Refresh token expired. Please login again.");
        }

        User user = userRepository.findById(UserId.of(refreshEntity.getUserId()))
                .orElseThrow(() -> new AuthenticationException("User not found"));

        if (!user.isActive()) {
            throw new AuthenticationException("Account is deactivated");
        }

        // Token rotation: delete old refresh token
        refreshTokenRepository.delete(refreshEntity);

        String newAccessToken = tokenService.generateToken(
                user.getId().value(),
                user.getEmail().value(),
                user.getRole().name(),
                user.getPhoneVerified()
        );
        String newRefreshToken = issueRefreshToken(user);

        return AuthResponse.of(newAccessToken, newRefreshToken, UserDtoMapper.toResponse(user));
    }

    @Override
    @Transactional
    public AuthResponse verifyPhone(UUID userId, VerifyPhoneRequest request) {
        User user = userRepository.findById(UserId.of(userId))
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        otpService.verifyOtp(request.verificationId(), request.code());

        PhoneNumber phone = PhoneNumber.of(request.phoneNumber());
        user.verifyPhone(phone);
        User savedUser = userRepository.save(user);

        String accessToken = tokenService.generateToken(
                savedUser.getId().value(),
                savedUser.getEmail().value(),
                savedUser.getRole().name(),
                savedUser.getPhoneVerified()
        );
        String refreshToken = issueRefreshToken(savedUser);

        return AuthResponse.of(accessToken, refreshToken, UserDtoMapper.toResponse(savedUser));
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
            boolean needSave = false;
            if (userInfo.avatarUrl() != null && (user.getAvatarUrl() == null || user.getAvatarUrl().isBlank())) {
                user.updateProfileDetails(user.getDisplayName(), userInfo.avatarUrl(), user.getPhoneNumber());
                needSave = true;
            }
            if (userInfo.displayName() != null && (user.getDisplayName() == null || user.getDisplayName().startsWith("Mock") || user.getDisplayName().endsWith("User"))) {
                user.updateProfileDetails(userInfo.displayName(), user.getAvatarUrl(), user.getPhoneNumber());
                needSave = true;
            }
            if (needSave) {
                user = userRepository.save(user);
            }
        } else {
            java.util.Optional<User> userByEmail = userRepository.findByEmail(email);
            if (userByEmail.isPresent()) {
                user = userByEmail.get();
                if (userInfo.avatarUrl() != null && (user.getAvatarUrl() == null || user.getAvatarUrl().isBlank())) {
                    user.updateProfileDetails(user.getDisplayName(), userInfo.avatarUrl(), user.getPhoneNumber());
                    user = userRepository.save(user);
                }
            } else {
                user = User.fromOAuth(email, userInfo.displayName(), userInfo.avatarUrl());
                user = userRepository.save(user);
            }
            userRepository.linkOAuthAccount(user.getId(), request.provider(), userInfo.providerUserId());
        }

        if (!user.isActive()) {
            throw new AuthenticationException("Account is deactivated");
        }

        String accessToken = tokenService.generateToken(
                user.getId().value(),
                user.getEmail().value(),
                user.getRole().name(),
                user.getPhoneVerified()
        );
        String refreshToken = issueRefreshToken(user);

        return AuthResponse.of(accessToken, refreshToken, UserDtoMapper.toResponse(user));
    }
}
