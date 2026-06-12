package com.boki.application.dto.request;

/**
 * Request DTO for updating the authenticated user's profile.
 * All fields are optional — only non-null fields are applied.
 */
public record UpdateProfileRequest(
        String displayName,
        String avatarUrl
) {
}
