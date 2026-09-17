package com.boki.application.dto.payment;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record CreatePaymentRequest(
        @NotNull(message = "Order ID is required")
        UUID orderId,

        String paymentMethod
) {
}
