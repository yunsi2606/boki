package com.boki.application.dto.response;

import java.math.BigDecimal;

public record PricingResponse(
        BigDecimal subtotal,
        String memberTier,
        int memberDiscountPercent,
        BigDecimal memberDiscountAmount,
        String voucherCode,
        BigDecimal voucherDiscountAmount,
        BigDecimal shippingFee,
        BigDecimal finalTotal,
        String pricingMessage
) {}
