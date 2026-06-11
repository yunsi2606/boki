package com.boki.application.dto.response;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record BookResponse(
        UUID id,
        UUID sellerId,
        String sellerName,
        Integer categoryId,
        String title,
        String author,
        String isbn,
        String description,
        BigDecimal price,
        String currency,
        String condition,
        String status,
        int stockQuantity,
        List<String> imageUrls,
        Instant createdAt,
        Instant updatedAt
) {
}
