package com.boki.application.dto.response;

import java.math.BigDecimal;
import java.util.UUID;

public record ComboItemResponse(
        UUID id,
        UUID singleBookId,
        UUID variantId,
        String variantName,
        String title,
        String slug,
        String author,
        BigDecimal price,
        BigDecimal originalPrice,
        String coverImage,
        int quantity,
        int stockQuantity
) {
}
