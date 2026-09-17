package com.boki.application.dto.response;

import java.time.Instant;
import java.util.UUID;

public record OrderTimelineResponse(
        UUID id,
        String status,
        String title,
        String description,
        String actor,
        Instant createdAt
) {
}
