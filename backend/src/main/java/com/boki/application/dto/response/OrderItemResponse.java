package com.boki.application.dto.response;

import java.math.BigDecimal;
import java.util.UUID;

public record OrderItemResponse(
        UUID bookId,
        String bookTitle,
        String bookCover,
        int quantity,
        BigDecimal unitPrice,
        BigDecimal subtotal
) {
}
