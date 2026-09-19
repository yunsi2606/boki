package com.boki.application.dto.response;

import java.util.List;
import java.util.Map;

public record ActivityAnalyticsResponse(
        long activeSessions30m,
        long totalEventsToday,
        long viewBookCountToday,
        long addToCartCountToday,
        long initiateCheckoutCountToday,
        long placeOrderCountToday,
        double cartConversionRate,
        double orderConversionRate,
        List<String> topSearchKeywords,
        List<String> topViewedBooks,
        Map<String, Long> deviceBreakdown
) {}
