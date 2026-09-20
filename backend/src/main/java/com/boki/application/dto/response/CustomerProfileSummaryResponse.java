package com.boki.application.dto.response;

import java.util.List;

public record CustomerProfileSummaryResponse(
        UserResponse user,
        MemberRankingResponse ranking,
        SpendingStatsResponse stats,
        List<OrderResponse> recentOrders
) {}
