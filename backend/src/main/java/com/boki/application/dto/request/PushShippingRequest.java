package com.boki.application.dto.request;

import com.boki.domain.model.order.ShippingCarrier;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record PushShippingRequest(
        @NotNull(message = "Đơn vị vận chuyển không được để trống")
        ShippingCarrier carrier,

        String trackingNumber,

        Integer weightGrams,

        BigDecimal shippingFee,

        String notes,

        String estimatedDelivery
) {
}
