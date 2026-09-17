package com.boki.domain.port.out;

import com.boki.domain.model.order.Order;
import com.boki.domain.model.order.OrderId;
import com.boki.domain.model.order.OrderStatus;
import com.boki.domain.model.user.UserId;

import java.util.List;
import java.util.Optional;

/**
 * Port (outbound) for order persistence.
 */
public interface OrderRepository {

    Order save(Order order);

    Optional<Order> findById(OrderId id);

    Optional<Order> findByTrackingNumber(String trackingNumber);

    List<Order> findByBuyerId(UserId buyerId);

    List<Order> searchOrders(OrderStatus status, String search, int page, int size);
}
