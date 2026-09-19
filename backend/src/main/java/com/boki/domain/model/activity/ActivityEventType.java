package com.boki.domain.model.activity;

/**
 * Standardized activity and audit event types.
 */
public enum ActivityEventType {
    PAGE_VIEW(ActivityEventCategory.NAVIGATION),
    SEARCH(ActivityEventCategory.ENGAGEMENT),
    VIEW_BOOK(ActivityEventCategory.ENGAGEMENT),
    ADD_TO_CART(ActivityEventCategory.ECOMMERCE),
    REMOVE_FROM_CART(ActivityEventCategory.ECOMMERCE),
    UPDATE_CART_QTY(ActivityEventCategory.ECOMMERCE),
    INITIATE_CHECKOUT(ActivityEventCategory.ECOMMERCE),
    APPLY_VOUCHER(ActivityEventCategory.ECOMMERCE),
    PLACE_ORDER(ActivityEventCategory.ECOMMERCE),
    CANCEL_ORDER(ActivityEventCategory.ECOMMERCE),
    LOGIN(ActivityEventCategory.AUTH),
    LOGOUT(ActivityEventCategory.AUTH),
    REGISTER(ActivityEventCategory.AUTH),
    ADMIN_ACTION(ActivityEventCategory.ADMIN);

    private final ActivityEventCategory defaultCategory;

    ActivityEventType(ActivityEventCategory defaultCategory) {
        this.defaultCategory = defaultCategory;
    }

    public ActivityEventCategory getDefaultCategory() {
        return defaultCategory;
    }

    public static ActivityEventType fromString(String val) {
        if (val == null || val.isBlank()) return PAGE_VIEW;
        try {
            return ActivityEventType.valueOf(val.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            return PAGE_VIEW;
        }
    }
}
