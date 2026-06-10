package com.boki.domain.model.book;

import java.math.BigDecimal;

/**
 * Value Object representing a monetary price with currency.
 */
public record Price(BigDecimal amount, String currency) {

    public static final String DEFAULT_CURRENCY = "VND";

    public Price {
        if (amount == null) {
            throw new IllegalArgumentException("Price amount cannot be null");
        }
        if (amount.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Price cannot be negative: " + amount);
        }
        if (currency == null || currency.isBlank()) {
            currency = DEFAULT_CURRENCY;
        }
        currency = currency.toUpperCase().trim();
        if (currency.length() != 3) {
            throw new IllegalArgumentException("Currency must be a 3-letter ISO code: " + currency);
        }
    }

    public static Price of(BigDecimal amount, String currency) {
        return new Price(amount, currency);
    }

    public static Price of(BigDecimal amount) {
        return new Price(amount, DEFAULT_CURRENCY);
    }

    @Override
    public String toString() {
        return amount.toPlainString() + " " + currency;
    }
}
