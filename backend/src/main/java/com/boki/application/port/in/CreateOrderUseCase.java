package com.boki.application.port.in;

import com.boki.application.dto.request.CreateOrderRequest;
import com.boki.application.dto.response.OrderResponse;

public interface CreateOrderUseCase {

    OrderResponse createOrder(CreateOrderRequest request, String buyerEmail);
}
