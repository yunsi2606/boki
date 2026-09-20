package com.boki.application.service;

import com.boki.application.dto.response.MemberRankingResponse;
import com.boki.domain.model.user.MemberTier;
import com.boki.infrastructure.persistence.entity.UserJpaEntity;
import com.boki.infrastructure.persistence.repository.UserJpaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Service to manage customer loyalty Member Tiers (Standard, Silver, Gold, Platinum, Diamond).
 * Handles automatic tier promotion, tier validation, cycle expiration, and server-side member discount calculation.
 */
@Service
public class MemberTierService {

    private final UserJpaRepository userJpaRepository;

    public MemberTierService(UserJpaRepository userJpaRepository) {
        this.userJpaRepository = userJpaRepository;
    }

    public record TierDiscountResult(
            MemberTier tier,
            int discountPercent,
            BigDecimal discountAmount
    ) {}

    /**
     * Resolves the current tier for a buyer (or STANDARD for guests / unauthenticated users).
     */
    @Transactional
    public MemberTier getBuyerTier(UUID buyerUserId) {
        if (buyerUserId == null || isSystemGuest(buyerUserId)) {
            return MemberTier.STANDARD;
        }

        return userJpaRepository.findById(buyerUserId)
                .map(user -> {
                    checkAndHandleTierExpiry(user);
                    MemberTier explicit = MemberTier.fromString(user.getMemberTier());
                    BigDecimal cycleSpent = user.getCycleSpent() != null ? user.getCycleSpent() : BigDecimal.ZERO;
                    MemberTier calculated = MemberTier.resolveTierBySpent(cycleSpent);
                    return explicit.ordinal() >= calculated.ordinal() ? explicit : calculated;
                })
                .orElse(MemberTier.STANDARD);
    }

    /**
     * Calculates the member tier discount amount for a given order subtotal.
     */
    public TierDiscountResult calculateTierDiscount(MemberTier tier, BigDecimal subtotal) {
        if (tier == null || tier == MemberTier.STANDARD || subtotal == null || subtotal.compareTo(BigDecimal.ZERO) <= 0) {
            return new TierDiscountResult(MemberTier.STANDARD, 0, BigDecimal.ZERO);
        }

        BigDecimal rate = BigDecimal.valueOf(tier.getDiscountRate());
        BigDecimal discount = subtotal.multiply(rate).setScale(0, RoundingMode.HALF_UP);

        return new TierDiscountResult(tier, tier.getDiscountPercent(), discount);
    }

    /**
     * Records spending and automatically upgrades member tier if threshold is reached.
     */
    @Transactional
    public void recordCompletedOrderSpend(UUID buyerUserId, BigDecimal orderAmount) {
        if (buyerUserId == null || isSystemGuest(buyerUserId) || orderAmount == null || orderAmount.compareTo(BigDecimal.ZERO) <= 0) {
            return;
        }

        userJpaRepository.findById(buyerUserId).ifPresent(user -> {
            checkAndHandleTierExpiry(user);

            // 1. Update Lifetime Spent
            BigDecimal currentSpent = user.getTotalSpent() != null ? user.getTotalSpent() : BigDecimal.ZERO;
            BigDecimal updatedSpent = currentSpent.add(orderAmount);
            user.setTotalSpent(updatedSpent);

            // 2. Update Cycle Spent
            BigDecimal currentCycleSpent = user.getCycleSpent() != null ? user.getCycleSpent() : BigDecimal.ZERO;
            BigDecimal updatedCycleSpent = currentCycleSpent.add(orderAmount);
            user.setCycleSpent(updatedCycleSpent);

            // 3. Auto-promote tier if new threshold attained in current cycle
            MemberTier newTier = MemberTier.resolveTierBySpent(updatedCycleSpent);
            MemberTier currentTier = MemberTier.fromString(user.getMemberTier());

            if (newTier.ordinal() > currentTier.ordinal()) {
                user.setMemberTier(newTier.name());
                user.setTierUpgradedAt(Instant.now());
                user.setTierExpiresAt(Instant.now().plus(365, ChronoUnit.DAYS));
            }

            // 4. Earn loyalty points: 1 point per 10,000 VND
            int pointsEarned = orderAmount.divide(BigDecimal.valueOf(10000), 0, RoundingMode.FLOOR).intValue();
            int currentPoints = user.getLoyaltyPoints() != null ? user.getLoyaltyPoints() : 0;
            user.setLoyaltyPoints(currentPoints + pointsEarned);

            userJpaRepository.save(user);
        });
    }

    /**
     * Gets full ranking overview with time window, progress bar, and tier roadmap.
     */
    @Transactional
    public MemberRankingResponse getMemberRanking(UUID userId) {
        UserJpaEntity user = userJpaRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        checkAndHandleTierExpiry(user);

        MemberTier currentTier = MemberTier.fromString(user.getMemberTier());
        Instant upgradedAt = user.getTierUpgradedAt() != null ? user.getTierUpgradedAt() : user.getCreatedAt();
        Instant expiresAt = user.getTierExpiresAt() != null ? user.getTierExpiresAt() : Instant.now().plus(365, ChronoUnit.DAYS);

        long daysRemaining = 365;
        if (currentTier == MemberTier.STANDARD) {
            daysRemaining = 9999; // Standard tier never expires
        } else if (expiresAt != null) {
            daysRemaining = Math.max(0, ChronoUnit.DAYS.between(Instant.now(), expiresAt));
        }

        BigDecimal cycleSpent = user.getCycleSpent() != null ? user.getCycleSpent() : BigDecimal.ZERO;
        BigDecimal lifetimeSpent = user.getTotalSpent() != null ? user.getTotalSpent() : BigDecimal.ZERO;

        MemberTier nextTier = currentTier.getNextTier();
        String nextTierName = nextTier != null ? nextTier.name() : null;
        String nextTierDisplayName = nextTier != null ? nextTier.getDisplayName() : null;
        BigDecimal nextTierThreshold = nextTier != null ? nextTier.getMinSpentThreshold() : null;

        BigDecimal spentNeeded = BigDecimal.ZERO;
        double progressPercent = 100.0;

        if (nextTier != null && nextTierThreshold != null) {
            spentNeeded = nextTierThreshold.subtract(cycleSpent);
            if (spentNeeded.compareTo(BigDecimal.ZERO) < 0) {
                spentNeeded = BigDecimal.ZERO;
            }

            BigDecimal currentBase = currentTier.getMinSpentThreshold();
            BigDecimal range = nextTierThreshold.subtract(currentBase);
            if (range.compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal progressInRange = cycleSpent.subtract(currentBase);
                if (progressInRange.compareTo(BigDecimal.ZERO) <= 0) {
                    progressPercent = 0.0;
                } else if (progressInRange.compareTo(range) >= 0) {
                    progressPercent = 100.0;
                } else {
                    progressPercent = progressInRange.divide(range, 4, RoundingMode.HALF_UP)
                            .multiply(BigDecimal.valueOf(100))
                            .doubleValue();
                }
            }
        }

        // Build Roadmap of all tiers
        List<MemberRankingResponse.TierBenefit> roadmap = new ArrayList<>();
        for (MemberTier tier : MemberTier.values()) {
            boolean achieved = cycleSpent.compareTo(tier.getMinSpentThreshold()) >= 0 || currentTier.ordinal() >= tier.ordinal();
            boolean isCurrent = currentTier == tier;
            List<String> perks = getPerksForTier(tier);

            roadmap.add(new MemberRankingResponse.TierBenefit(
                    tier.name(),
                    tier.getDisplayName(),
                    tier.getMinSpentThreshold(),
                    tier.getDiscountPercent(),
                    perks,
                    achieved,
                    isCurrent
            ));
        }

        return new MemberRankingResponse(
                currentTier.name(),
                currentTier.getDisplayName(),
                currentTier.getDiscountPercent(),
                upgradedAt,
                expiresAt,
                daysRemaining,
                cycleSpent,
                lifetimeSpent,
                nextTierName,
                nextTierDisplayName,
                nextTierThreshold,
                spentNeeded,
                progressPercent,
                roadmap
        );
    }

    private List<String> getPerksForTier(MemberTier tier) {
        return switch (tier) {
            case STANDARD -> List.of("Ưu đãi giá gốc Boki Store", "Tích lũy 1 điểm thưởng / 10.000đ", "Hạn duy trì vĩnh viễn");
            case SILVER -> List.of("Giảm 3% mọi đơn hàng", "Tích lũy điểm thưởng x1.2", "Huy hiệu Bạc trên trang cá nhân", "Thời hạn duy trì 365 ngày");
            case GOLD -> List.of("Giảm 5% mọi đơn hàng", "Tích lũy điểm thưởng x1.5", "Voucher sinh nhật độc quyền 100.000đ", "Ưu tiên vận chuyển");
            case PLATINUM -> List.of("Giảm 10% mọi đơn hàng", "Miễn phí vận chuyển toàn quốc", "Hỗ trợ khách hàng VIP 24/7", "Đặc quyền tham gia Flash Sale sớm");
            case DIAMOND -> List.of("Giảm 15% mọi đơn hàng", "Quà tri ân độc quyền Boki VIP", "Quyền mua trước ấn bản giới hạn", "Miễn phí vận chuyển hỏa tốc");
        };
    }

    private void checkAndHandleTierExpiry(UserJpaEntity user) {
        if ("STANDARD".equalsIgnoreCase(user.getMemberTier())) {
            return;
        }

        Instant expiresAt = user.getTierExpiresAt();
        if (expiresAt != null && expiresAt.isBefore(Instant.now())) {
            // Cycle expired: re-evaluate tier based on current cycle spent
            BigDecimal cycleSpent = user.getCycleSpent() != null ? user.getCycleSpent() : BigDecimal.ZERO;
            MemberTier newTier = MemberTier.resolveTierBySpent(cycleSpent);
            user.setMemberTier(newTier.name());
            user.setTierUpgradedAt(Instant.now());
            user.setTierExpiresAt(Instant.now().plus(365, ChronoUnit.DAYS));
            user.setCycleSpent(BigDecimal.ZERO); // Reset cycle
            userJpaRepository.save(user);
        }
    }

    private boolean isSystemGuest(UUID userId) {
        return UUID.fromString("00000000-0000-0000-0000-000000000001").equals(userId);
    }
}

