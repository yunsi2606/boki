package com.boki.application.port.in;

import com.boki.application.dto.request.RegisterRequest;
import com.boki.application.dto.response.AuthResponse;

/**
 * Inbound port: register a new user.
 */
public interface RegisterUserUseCase {

    AuthResponse register(RegisterRequest request);
}
