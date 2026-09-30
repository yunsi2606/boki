package com.boki.application.dto.response;

import java.math.BigDecimal;
import java.util.List;
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
        Integer categoryId,
        List<Integer> categoryIds
) {
    public BookSummaryResponse(
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
        this(
                id, title, slug, author, price, originalPrice, rating, viewsCount, coverImage,
                categoryId,
                categoryId != null ? List.of(categoryId) : List.of()
        );
    }
}
