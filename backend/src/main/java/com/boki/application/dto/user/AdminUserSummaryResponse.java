package com.boki.application.dto.user;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record AdminUserSummaryResponse(
        UUID id,
        String email,
        String displayName,
        String phoneNumber,
        boolean phoneVerified,
        boolean emailVerified,
        String avatarUrl,
        String primaryRole,
        String memberTier,
        BigDecimal totalSpent,
        Integer loyaltyPoints,
        boolean active,
        Instant createdAt,
        List<String> roleCodes,
        List<String> smartTags
) {}
