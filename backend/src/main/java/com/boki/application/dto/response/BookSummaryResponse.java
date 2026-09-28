package com.boki.application.dto.response;

import java.math.BigDecimal;
import java.util.UUID;

public record BookSummaryResponse(
        UUID id,
        String title,
        String slug,
        String author,
        BigDecimal price,
        BigDecimal originalPrice,
        BigDecimal rating,
        int viewsCount,
        String coverImage,
        Integer categoryId
) {
}
