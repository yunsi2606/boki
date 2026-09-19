package com.boki.domain.model.activity;

/**
 * High-level grouping categories for user behaviors and audit logs.
 */
public enum ActivityEventCategory {
    NAVIGATION,
    ENGAGEMENT,
    ECOMMERCE,
    AUTH,
    ADMIN;

    public static ActivityEventCategory fromString(String val) {
        if (val == null || val.isBlank()) return NAVIGATION;
        try {
            return ActivityEventCategory.valueOf(val.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            return NAVIGATION;
        }
    }
}
