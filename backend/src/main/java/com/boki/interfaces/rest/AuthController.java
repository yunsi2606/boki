package com.boki.interfaces.rest;

import com.boki.application.dto.request.LoginRequest;
import com.boki.application.dto.request.RefreshTokenRequest;
import com.boki.application.dto.request.RegisterRequest;
import com.boki.application.dto.request.VerifyPhoneRequest;
import com.boki.application.dto.response.AuthResponse;
import com.boki.application.dto.response.UserResponse;
import com.boki.application.port.in.GetCurrentUserUseCase;
import com.boki.application.port.in.LoginUserUseCase;
import com.boki.application.port.in.RefreshTokenUseCase;
import com.boki.application.port.in.RegisterUserUseCase;
import com.boki.application.port.in.VerifyPhoneUseCase;
import com.boki.infrastructure.security.AuthenticatedUser;
import com.boki.infrastructure.security.CookieUtil;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for authentication endpoints.
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final RegisterUserUseCase registerUseCase;
    private final LoginUserUseCase loginUseCase;
    private final RefreshTokenUseCase refreshTokenUseCase;
    private final VerifyPhoneUseCase verifyPhoneUseCase;
    private final GetCurrentUserUseCase getCurrentUserUseCase;
    private final com.boki.application.port.in.LoginOAuthUseCase loginOAuthUseCase;
    private final com.boki.application.port.in.VerifyEmailUseCase verifyEmailUseCase;
    private final com.boki.application.port.in.UpdateUserProfileUseCase updateProfileUseCase;
    private final com.boki.application.port.in.ForgotPasswordUseCase forgotPasswordUseCase;
    private final com.boki.application.port.in.ResetPasswordUseCase resetPasswordUseCase;

    public AuthController(
            RegisterUserUseCase registerUseCase,
            LoginUserUseCase loginUseCase,
            RefreshTokenUseCase refreshTokenUseCase,
            VerifyPhoneUseCase verifyPhoneUseCase,
            GetCurrentUserUseCase getCurrentUserUseCase,
            com.boki.application.port.in.LoginOAuthUseCase loginOAuthUseCase,
            com.boki.application.port.in.VerifyEmailUseCase verifyEmailUseCase,
            com.boki.application.port.in.UpdateUserProfileUseCase updateProfileUseCase,
            com.boki.application.port.in.ForgotPasswordUseCase forgotPasswordUseCase,
            com.boki.application.port.in.ResetPasswordUseCase resetPasswordUseCase
    ) {
        this.registerUseCase = registerUseCase;
        this.loginUseCase = loginUseCase;
        this.refreshTokenUseCase = refreshTokenUseCase;
        this.verifyPhoneUseCase = verifyPhoneUseCase;
        this.getCurrentUserUseCase = getCurrentUserUseCase;
        this.loginOAuthUseCase = loginOAuthUseCase;
        this.verifyEmailUseCase = verifyEmailUseCase;
        this.updateProfileUseCase = updateProfileUseCase;
        this.forgotPasswordUseCase = forgotPasswordUseCase;
        this.resetPasswordUseCase = resetPasswordUseCase;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(
            @Valid @RequestBody RegisterRequest request,
            HttpServletResponse httpResponse
    ) {
        AuthResponse response = registerUseCase.register(request);
        CookieUtil.setAuthCookie(httpResponse, response.accessToken());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletResponse httpResponse
    ) {
        AuthResponse response = loginUseCase.login(request);
        CookieUtil.setAuthCookie(httpResponse, response.accessToken());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refreshToken(
            @Valid @RequestBody RefreshTokenRequest request,
            HttpServletResponse httpResponse
    ) {
        AuthResponse response = refreshTokenUseCase.refreshToken(request);
        CookieUtil.setAuthCookie(httpResponse, response.accessToken());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletResponse httpResponse) {
        CookieUtil.clearAuthCookie(httpResponse);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/verify-phone")
    public ResponseEntity<AuthResponse> verifyPhone(
            @AuthenticationPrincipal AuthenticatedUser principal,
            @Valid @RequestBody VerifyPhoneRequest request,
            HttpServletResponse httpResponse
    ) {
        AuthResponse response = verifyPhoneUseCase.verifyPhone(principal.userId(), request);
        CookieUtil.setAuthCookie(httpResponse, response.accessToken());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/oauth")
    public ResponseEntity<AuthResponse> loginOAuth(
            @Valid @RequestBody com.boki.application.dto.request.OAuthLoginRequest request,
            HttpServletResponse httpResponse
    ) {
        AuthResponse response = loginOAuthUseCase.loginOAuth(request);
        CookieUtil.setAuthCookie(httpResponse, response.accessToken());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/verify-email")
    public ResponseEntity<Void> verifyEmail(@Valid @RequestBody com.boki.application.dto.request.VerifyEmailRequest request) {
        verifyEmailUseCase.verifyEmail(request);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser(
            @AuthenticationPrincipal AuthenticatedUser principal
    ) {
        UserResponse response = getCurrentUserUseCase.getCurrentUser(principal.userId());
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/me")
    public ResponseEntity<UserResponse> updateProfile(
            @AuthenticationPrincipal AuthenticatedUser principal,
            @RequestBody com.boki.application.dto.request.UpdateProfileRequest request
    ) {
        UserResponse response = updateProfileUseCase.updateProfile(principal.userId(), request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Void> forgotPassword(
            @Valid @RequestBody com.boki.application.dto.request.ForgotPasswordRequest request
    ) {
        forgotPasswordUseCase.forgotPassword(request.email());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Void> resetPassword(
            @Valid @RequestBody com.boki.application.dto.request.ResetPasswordRequest request
    ) {
        resetPasswordUseCase.resetPassword(request);
        return ResponseEntity.ok().build();
    }
}
