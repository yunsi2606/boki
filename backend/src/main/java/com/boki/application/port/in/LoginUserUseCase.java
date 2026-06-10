package com.boki.application.port.in;

import com.boki.application.dto.request.LoginRequest;
import com.boki.application.dto.response.AuthResponse;

/**
 * Inbound port: authenticate a user with email/password.
 */
public interface LoginUserUseCase {

    AuthResponse login(LoginRequest request);
}
