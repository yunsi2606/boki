package com.boki.application.dto.user;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record AdminUserDetailResponse(
        UUID id,
        String email,
        String displayName,
        String phoneNumber,
        boolean phoneVerified,
        boolean emailVerified,
        String avatarUrl,
        String primaryRole,
        String memberTier,
        BigDecimal totalSpent,
        Integer loyaltyPoints,
        boolean active,
        Instant createdAt,
        Instant updatedAt,
        // Shipping address
        String shippingFullName,
        String shippingPhone,
        String shippingProvince,
        String shippingDistrict,
        String shippingWard,
        String shippingStreetAddress,
        String shippingDeliveryNote,
        // Roles & Permissions
        List<String> roleCodes,
        List<String> permissionCodes,
        List<String> smartTags,
        // Order 360 Stats
        long totalOrders,
        long completedOrders,
        long cancelledOrders,
        // Recent activities
        List<UserRecentActivityDto> recentActivities
) {
    public record UserRecentActivityDto(
            String actionType,
            String description,
            String ipAddress,
            Instant createdAt
    ) {}
}
