package com.boki.application.dto.request;

import jakarta.validation.constraints.NotBlank;

public record CancelOrderRequest(
        @NotBlank(message = "Vui lòng nhập lý do hủy đơn hàng")
        String reason
) {
}
