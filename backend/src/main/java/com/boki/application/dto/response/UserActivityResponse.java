package com.boki.application.dto.response;

import java.time.Instant;
import java.util.UUID;

public record UserActivityResponse(
        UUID id,
        String sessionId,
        UUID userId,
        String userEmail,
        String userRole,
        String eventType,
        String eventCategory,
        String pagePath,
        String pageTitle,
        String referrerUrl,
        String targetId,
        String targetName,
        String metadataJson,
        String ipAddress,
        String userAgent,
        String deviceType,
        String browser,
        String os,
        Integer durationSeconds,
        Instant createdAt
) {}
