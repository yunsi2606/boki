package com.boki.domain.model.order;

import com.boki.domain.model.book.BookId;

import java.math.BigDecimal;

/**
 * Value Object representing a single item in an order.
 */
public record OrderItem(
        BookId bookId,
        int quantity,
        BigDecimal unitPrice
) {
    public OrderItem {
        if (bookId == null) {
            throw new IllegalArgumentException("Book ID cannot be null");
        }
        if (quantity <= 0) {
            throw new IllegalArgumentException("Quantity must be positive");
        }
        if (unitPrice == null || unitPrice.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Unit price cannot be null or negative");
        }
    }

    public BigDecimal subtotal() {
        return unitPrice.multiply(BigDecimal.valueOf(quantity));
    }
}
