package com.boki.application.port.in;

import com.boki.application.dto.response.UserResponse;

import java.util.UUID;

/**
 * Inbound port: get current authenticated user profile.
 */
public interface GetCurrentUserUseCase {

    UserResponse getCurrentUser(UUID userId);
}
