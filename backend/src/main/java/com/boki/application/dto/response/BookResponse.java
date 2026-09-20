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
        String slug,
        String author,
        String isbn,
        String publisher,
        String supplier,
        Integer publicationYear,
        String language,
        String format,
        Integer numberOfPages,
        Integer weightGrams,
        String dimensions,
        String translator,
        String description,
        BigDecimal price,
        BigDecimal originalPrice,
        String currency,
        String condition,
        String status,
        int stockQuantity,
        boolean isPreOrder,
        Integer preOrderDays,
        int viewsCount,
        BigDecimal rating,
        int reviewsCount,
        List<String> imageUrls,
        List<BookVariantResponse> variants,
        Instant createdAt,
        Instant updatedAt
) {
}
