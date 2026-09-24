package com.boki.domain.chat.model;

import java.util.Map;

public record PageContext(
        PageType pageType,
        String entityId,
        String entitySlug,
        Map<String, Object> metadata
) {
    public enum PageType {
        HOME,
        BOOK_DETAIL,
        BOOK_LIST,
        CATEGORY,
        CART,
        CHECKOUT,
        ORDER_TRACKING,
        BLOG_DETAIL,
        ADMIN_DASHBOARD,
        ADMIN_ORDERS,
        ADMIN_BOOKS,
        ADMIN_VOUCHERS,
        UNKNOWN
    }

    public static PageContext unknown() {
        return new PageContext(PageType.UNKNOWN, null, null, Map.of());
    }

    public static PageContext of(PageType pageType, String entityId, String entitySlug, Map<String, Object> metadata) {
        return new PageContext(pageType, entityId, entitySlug, metadata != null ? metadata : Map.of());
    }
}
