package com.boki.application.port.in;

import com.boki.application.dto.request.UpdateProfileRequest;
import com.boki.application.dto.response.UserResponse;

import java.util.UUID;

/**
 * Use case port for updating the authenticated user's profile.
 */
public interface UpdateUserProfileUseCase {

    UserResponse updateProfile(UUID userId, UpdateProfileRequest request);
}
