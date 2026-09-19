package com.boki.application.dto.request;

import jakarta.validation.constraints.NotEmpty;
import java.math.BigDecimal;
import java.util.List;

public record CalculatePricingRequest(
        @NotEmpty(message = "Order must contain at least one item")
        List<OrderItemRequest> items,
        String voucherCode,
        BigDecimal shippingFee
) {}
