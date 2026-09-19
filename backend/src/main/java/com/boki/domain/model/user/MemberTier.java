package com.boki.domain.model.user;

import java.math.BigDecimal;

/**
 * Member Tier classification representing customer loyalty level and exclusive discount benefits.
 */
public enum MemberTier {
    STANDARD("Thành Viên Tiêu Chuẩn", 0.00, BigDecimal.ZERO),
    SILVER("Thành Viên Bạc", 0.03, new BigDecimal("1000000")),
    GOLD("Thành Viên Vàng", 0.05, new BigDecimal("3000000")),
    PLATINUM("Thành Viên Bạch Kim (VIP)", 0.10, new BigDecimal("7000000"));

    private final String displayName;
    private final double discountRate;
    private final BigDecimal minSpentThreshold;

    MemberTier(String displayName, double discountRate, BigDecimal minSpentThreshold) {
        this.displayName = displayName;
        this.discountRate = discountRate;
        this.minSpentThreshold = minSpentThreshold;
    }

    public String getDisplayName() {
        return displayName;
    }

    public double getDiscountRate() {
        return discountRate;
    }

    public int getDiscountPercent() {
        return (int) (discountRate * 100);
    }

    public BigDecimal getMinSpentThreshold() {
        return minSpentThreshold;
    }

    public static MemberTier fromString(String value) {
        if (value == null || value.isBlank()) {
            return STANDARD;
        }
        try {
            return MemberTier.valueOf(value.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            return STANDARD;
        }
    }

    public static MemberTier resolveTierBySpent(BigDecimal totalSpent) {
        if (totalSpent == null || totalSpent.compareTo(BigDecimal.ZERO) <= 0) {
            return STANDARD;
        }
        if (totalSpent.compareTo(PLATINUM.minSpentThreshold) >= 0) {
            return PLATINUM;
        }
        if (totalSpent.compareTo(GOLD.minSpentThreshold) >= 0) {
            return GOLD;
        }
        if (totalSpent.compareTo(SILVER.minSpentThreshold) >= 0) {
            return SILVER;
        }
        return STANDARD;
    }
}
