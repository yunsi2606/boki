package com.boki.domain.model.user;

import java.util.regex.Pattern;

/**
 * Value Object representing a validated phone number.
 * Accepts international format (e.g., +84912345678).
 */
public record PhoneNumber(String value) {

    private static final Pattern PHONE_PATTERN =
            Pattern.compile("^\\+?[1-9]\\d{7,14}$");

    public PhoneNumber {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("Phone number cannot be empty");
        }
        value = value.trim().replaceAll("\\s+", "");
        if (!PHONE_PATTERN.matcher(value).matches()) {
            throw new IllegalArgumentException("Invalid phone number format: " + value);
        }
    }

    public static PhoneNumber of(String value) {
        return new PhoneNumber(value);
    }

    @Override
    public String toString() {
        return value;
    }
}
