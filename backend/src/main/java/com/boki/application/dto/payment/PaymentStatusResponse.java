package com.boki.application.dto.payment;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record PaymentStatusResponse(
        UUID orderId,
        String paymentStatus,
        String paymentMethod,
        String paymentCode,
        BigDecimal amount,
        Instant paidAt
) {
}
