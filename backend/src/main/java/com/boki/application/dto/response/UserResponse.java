package com.boki.application.dto.response;

import java.time.Instant;
import java.util.UUID;

public record UserResponse(
        UUID id,
        String email,
        String displayName,
        String phoneNumber,
        boolean phoneVerified,
        String avatarUrl,
        String role,
        boolean emailVerified,
        Instant createdAt
) {}
