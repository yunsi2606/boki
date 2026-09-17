package com.boki.domain.model.order;

public enum PaymentMethod {
    COD,
    BANKING,
    MOMO,
    VNPAY;

    public static PaymentMethod fromString(String value) {
        if (value == null || value.isBlank()) {
            return COD;
        }
        try {
            return PaymentMethod.valueOf(value.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            return COD;
        }
    }
}
