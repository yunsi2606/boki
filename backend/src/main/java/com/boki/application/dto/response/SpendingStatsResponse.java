package com.boki.application.dto.response;

import java.math.BigDecimal;

public record SpendingStatsResponse(
        BigDecimal lifetimeSpent,
        long totalOrders,
        long completedOrders,
        long activeOrders,
        long cancelledOrders,
        int loyaltyPoints,
        BigDecimal totalDiscountSaved
) {}
