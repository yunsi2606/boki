package com.boki.application.dto.payment;

import java.math.BigDecimal;
import java.util.UUID;

public record PaymentInitResponse(
        UUID orderId,
        String paymentMethod,
        String paymentStatus,
        BigDecimal amount,
        String currency,
        String paymentCode,
        String qrUrl,
        String payUrl,
        String bankCode,
        String accountNumber,
        String accountName,
        String message
) {
}
