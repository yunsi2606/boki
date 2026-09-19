package com.boki.application.dto.response;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record OrderResponse(
        UUID id,
        UUID buyerId,
        String customerName,
        String customerPhone,
        BigDecimal totalAmount,
        String currency,
        String status,
        String shippingAddress,
        String carrierName,
        String trackingNumber,
        BigDecimal shippingFee,
        Instant estimatedDelivery,
        Integer weightGrams,
        String cancelReason,
        String cancelledBy,
        String carrierStatus,
        String paymentMethod,
        String paymentStatus,
        String paymentCode,
        Instant paidAt,
        List<OrderItemResponse> items,
        List<OrderTimelineResponse> timelines,
        Instant createdAt,
        Instant updatedAt,
        Integer riskScore,
        String riskLevel,
        List<String> riskReasons,
        Boolean isFlagged,
        Boolean isGuest,
        BigDecimal subtotalAmount,
        String memberTier,
        BigDecimal memberDiscountAmount,
        String voucherCode,
        BigDecimal voucherDiscountAmount
) {
}
