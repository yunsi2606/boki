package com.boki.interfaces.rest;

import com.boki.application.dto.request.LoginRequest;
import com.boki.application.dto.request.RegisterRequest;
import com.boki.application.dto.request.VerifyPhoneRequest;
import com.boki.application.dto.response.AuthResponse;
import com.boki.application.dto.response.UserResponse;
import com.boki.application.port.in.GetCurrentUserUseCase;
import com.boki.application.port.in.LoginUserUseCase;
import com.boki.application.port.in.RegisterUserUseCase;
import com.boki.application.port.in.VerifyPhoneUseCase;
import com.boki.infrastructure.security.AuthenticatedUser;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for authentication endpoints.
 * <p>
 * No business logic here — delegates entirely to use case ports.
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final RegisterUserUseCase registerUseCase;
    private final LoginUserUseCase loginUseCase;
    private final VerifyPhoneUseCase verifyPhoneUseCase;
    private final GetCurrentUserUseCase getCurrentUserUseCase;

    public AuthController(
            RegisterUserUseCase registerUseCase,
            LoginUserUseCase loginUseCase,
            VerifyPhoneUseCase verifyPhoneUseCase,
            GetCurrentUserUseCase getCurrentUserUseCase
    ) {
        this.registerUseCase = registerUseCase;
        this.loginUseCase = loginUseCase;
        this.verifyPhoneUseCase = verifyPhoneUseCase;
        this.getCurrentUserUseCase = getCurrentUserUseCase;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = registerUseCase.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = loginUseCase.login(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/verify-phone")
    public ResponseEntity<AuthResponse> verifyPhone(
            @AuthenticationPrincipal AuthenticatedUser principal,
            @Valid @RequestBody VerifyPhoneRequest request
    ) {
        AuthResponse response = verifyPhoneUseCase.verifyPhone(principal.userId(), request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser(
            @AuthenticationPrincipal AuthenticatedUser principal
    ) {
        UserResponse response = getCurrentUserUseCase.getCurrentUser(principal.userId());
        return ResponseEntity.ok(response);
    }
}
