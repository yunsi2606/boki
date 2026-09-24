package com.boki.application.dto.response;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record BlogResponse(
        UUID id,
        UUID authorId,
        String authorName,
        String title,
        String slug,
        String excerpt,
        String content,
        String coverImage,
        String effectiveCoverImage,
        String category,
        List<String> tags,
        String status,
        int viewsCount,
        int likesCount,
        int readingTimeMinutes,
        boolean isFeatured,
        Instant publishedAt,
        Instant createdAt,
        Instant updatedAt
) {
}
