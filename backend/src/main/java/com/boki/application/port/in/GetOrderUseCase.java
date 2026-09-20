package com.boki.application.port.in;

import com.boki.application.dto.response.OrderResponse;
import java.util.List;
import java.util.UUID;

public interface GetOrderUseCase {

    OrderResponse getOrder(UUID orderId, String email);

    List<OrderResponse> getBuyerOrders(String buyerEmail);
    
    OrderResponse confirmOrderReceived(UUID orderId, String buyerEmail);
}
