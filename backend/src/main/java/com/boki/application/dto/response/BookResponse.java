package com.boki.application.dto.response;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Map;
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
        Map<String, String> publicationDetails,
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
