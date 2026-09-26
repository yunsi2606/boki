package com.boki.application.dto.response;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Map;

public record BookVariantResponse(
        String id,
        String bookId,
        String sku,
        String name,
        BigDecimal price,
        BigDecimal originalPrice,
        int stockQuantity,
        Integer maxOrderQuantity,
        String imageUrl,
        Map<String, String> attributes,
        String attributesJson,
        boolean isStandaloneDisplay,
        Instant createdAt,
        Instant updatedAt
) {
}
