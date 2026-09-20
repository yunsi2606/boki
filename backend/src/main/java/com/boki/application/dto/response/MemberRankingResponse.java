package com.boki.application.dto.response;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record MemberRankingResponse(
        String currentTier,
        String displayName,
        int discountPercent,
        Instant tierUpgradedAt,
        Instant tierExpiresAt,
        long daysRemaining,
        BigDecimal cycleSpent,
        BigDecimal lifetimeSpent,
        String nextTier,
        String nextTierDisplayName,
        BigDecimal nextTierThreshold,
        BigDecimal spentNeededForNextTier,
        double progressPercent,
        List<TierBenefit> tiersRoadmap
) {
    public record TierBenefit(
            String level,
            String displayName,
            BigDecimal minSpentThreshold,
            int discountPercent,
            List<String> perks,
            boolean isAchieved,
            boolean isCurrent
    ) {}
}
