package com.boki.application.dto.user;

import java.util.Map;

public record AdminUserStatsResponse(
        long totalUsers,
        long activeUsers,
        long blockedUsers,
        long phoneVerifiedUsers,
        long vipUsers,
        Map<String, Long> tierCounts
) {}
