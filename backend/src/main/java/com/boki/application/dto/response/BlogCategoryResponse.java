package com.boki.application.dto.response;

import java.time.Instant;

public record BlogCategoryResponse(
        Integer id,
        String name,
        String slug,
        String description,
        Instant createdAt
) {
}
