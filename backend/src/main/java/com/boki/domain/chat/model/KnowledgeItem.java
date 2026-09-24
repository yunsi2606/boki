package com.boki.domain.chat.model;

import java.time.Instant;
import java.util.List;

public record KnowledgeItem(
        Long id,
        String category,
        String title,
        String content,
        List<String> keywords,
        Integer version,
        Boolean isActive,
        Instant updatedAt
) {}
