package com.boki.application.port.in;

import com.boki.application.dto.request.OAuthLoginRequest;
import com.boki.application.dto.response.AuthResponse;

/**
 * Inbound port for OAuth login use case.
 */
public interface LoginOAuthUseCase {
    AuthResponse loginOAuth(OAuthLoginRequest request);
}
