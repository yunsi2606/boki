package com.boki.application.mapper;

import com.boki.application.dto.response.UserResponse;
import com.boki.domain.model.user.User;

/**
 * Maps between User domain model and application DTOs.
 * Hand-written for clarity and zero-framework dependency in application layer.
 */
public final class UserDtoMapper {

    private UserDtoMapper() {
    }

    public static UserResponse toResponse(User user) {
        return new UserResponse(
                user.getId().value(),
                user.getEmail().value(),
                user.getDisplayName(),
                user.getPhoneNumber() != null ? user.getPhoneNumber().value() : null,
                user.getPhoneVerified(),
                user.getAvatarUrl(),
                user.getRole().name(),
                user.isEmailVerified(),
                user.getCreatedAt(),
                user.getMemberTier() != null ? user.getMemberTier().name() : "STANDARD",
                user.getTotalSpent(),
                user.getLoyaltyPoints(),
                user.getTierUpgradedAt(),
                user.getTierExpiresAt(),
                user.getCycleSpent(),
                user.getShippingFullName(),
                user.getShippingPhone(),
                user.getShippingProvince(),
                user.getShippingProvinceCode(),
                user.getShippingDistrict(),
                user.getShippingDistrictCode(),
                user.getShippingWard(),
                user.getShippingWardCode(),
                user.getShippingStreetAddress(),
                user.getShippingDeliveryNote()
        );
    }

}
