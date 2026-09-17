package com.boki.application.port.in;

import com.boki.application.dto.request.RefreshTokenRequest;
import com.boki.application.dto.response.AuthResponse;

public interface RefreshTokenUseCase {
    AuthResponse refreshToken(RefreshTokenRequest request);
}
