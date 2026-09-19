package com.boki.application.dto.request;

import jakarta.validation.constraints.NotBlank;

public record RecordActivityRequest(
        String sessionId,

        @NotBlank(message = "eventType is required")
        String eventType,

        String eventCategory,
        String pagePath,
        String pageTitle,
        String referrerUrl,
        String targetId,
        String targetName,
        String metadataJson,
        Integer durationSeconds
) {}
