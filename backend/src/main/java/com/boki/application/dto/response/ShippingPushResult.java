package com.boki.application.dto.response;

import java.math.BigDecimal;
import java.time.Instant;

public record ShippingPushResult(
        String trackingNumber,
        BigDecimal fee,
        Instant estimatedDelivery,
        String carrierStatus,
        String notes
) {
}
