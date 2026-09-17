package com.boki.application.dto.response;

import java.math.BigDecimal;
import java.time.Instant;

public record CarrierFeeEstimateResponse(
        String carrierName,
        BigDecimal fee,
        Instant estimatedDelivery,
        String deliveryDays,
        String note
) {}
