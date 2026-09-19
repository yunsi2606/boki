package com.boki.application.service;

import com.boki.domain.model.user.MemberTier;
import com.boki.infrastructure.persistence.entity.UserJpaEntity;
import com.boki.infrastructure.persistence.repository.UserJpaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.UUID;

/**
 * Service to manage customer loyalty Member Tiers (Standard, Silver, Gold, Platinum).
 * Handles automatic tier promotion, tier validation, and server-side member discount calculation.
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
    @Transactional(readOnly = true)
    public MemberTier getBuyerTier(UUID buyerUserId) {
        if (buyerUserId == null || isSystemGuest(buyerUserId)) {
            return MemberTier.STANDARD;
        }

        return userJpaRepository.findById(buyerUserId)
                .map(user -> {
                    // Check if explicit tier exists or calculate dynamically by total spent
                    MemberTier explicit = MemberTier.fromString(user.getMemberTier());
                    MemberTier calculated = MemberTier.resolveTierBySpent(user.getTotalSpent());
                    // Grant the higher of explicit or earned tier
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
            BigDecimal currentSpent = user.getTotalSpent() != null ? user.getTotalSpent() : BigDecimal.ZERO;
            BigDecimal updatedSpent = currentSpent.add(orderAmount);
            user.setTotalSpent(updatedSpent);

            // Auto-promote tier if new threshold attained
            MemberTier newTier = MemberTier.resolveTierBySpent(updatedSpent);
            MemberTier currentTier = MemberTier.fromString(user.getMemberTier());
            if (newTier.ordinal() > currentTier.ordinal()) {
                user.setMemberTier(newTier.name());
            }

            // Earn loyalty points: 1 point per 10,000 VND
            int pointsEarned = orderAmount.divide(BigDecimal.valueOf(10000), 0, RoundingMode.FLOOR).intValue();
            int currentPoints = user.getLoyaltyPoints() != null ? user.getLoyaltyPoints() : 0;
            user.setLoyaltyPoints(currentPoints + pointsEarned);

            userJpaRepository.save(user);
        });
    }

    private boolean isSystemGuest(UUID userId) {
        return UUID.fromString("00000000-0000-0000-0000-000000000001").equals(userId);
    }
}
