package com.boki.domain.model.order;

public enum PaymentStatus {
    UNPAID,
    PAID,
    REFUNDED,
    FAILED;

    public static PaymentStatus fromString(String value) {
        if (value == null || value.isBlank()) {
            return UNPAID;
        }
        try {
            return PaymentStatus.valueOf(value.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            return UNPAID;
        }
    }
}
