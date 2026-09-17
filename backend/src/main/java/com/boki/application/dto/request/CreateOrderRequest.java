package com.boki.application.dto.request;

import jakarta.validation.constraints.*;
import java.util.List;

public record CreateOrderRequest(
        @NotBlank(message = "Shipping address is required")
        String shippingAddress,

        @NotEmpty(message = "Order must contain at least one item")
        List<OrderItemRequest> items,

        String paymentMethod
) {
}
