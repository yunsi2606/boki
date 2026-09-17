package com.boki.application.dto.request;

import com.boki.domain.model.order.OrderStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateOrderStatusRequest(
        @NotNull(message = "Trạng thái đơn hàng không được để trống")
        OrderStatus status,

        String reason
) {
}
