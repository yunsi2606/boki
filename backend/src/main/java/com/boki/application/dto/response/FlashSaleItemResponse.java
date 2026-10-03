package com.boki.application.dto.response;

import java.math.BigDecimal;
import java.util.UUID;

public record FlashSaleItemResponse(
        UUID id,
        UUID bookId,
        String bookTitle,
        String bookSlug,
        String bookAuthor,
        String bookImageUrl,
        BigDecimal originalPrice,
        BigDecimal flashSalePrice,
        int discountPercent,
        int quantityLimit,
        int soldQuantity,
        int userLimit,
        boolean isSoldOut
) {
}
