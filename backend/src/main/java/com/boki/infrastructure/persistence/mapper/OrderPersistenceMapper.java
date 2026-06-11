package com.boki.infrastructure.persistence.mapper;

import com.boki.domain.model.book.BookId;
import com.boki.domain.model.order.*;
import com.boki.domain.model.user.UserId;
import com.boki.infrastructure.persistence.entity.OrderItemJpaEntity;
import com.boki.infrastructure.persistence.entity.OrderJpaEntity;

import java.util.ArrayList;
import java.util.List;

public final class OrderPersistenceMapper {

    private OrderPersistenceMapper() {
    }

    public static OrderJpaEntity toJpaEntity(Order order) {
        if (order == null) {
            return null;
        }

        OrderJpaEntity entity = new OrderJpaEntity();
        entity.setId(order.getId().value());
        entity.setBuyerId(order.getBuyerId().value());
        entity.setTotalAmount(order.getTotalAmount());
        entity.setCurrency(order.getCurrency());
        entity.setStatus(OrderJpaEntity.OrderStatusJpa.valueOf(order.getStatus().name()));
        entity.setShippingAddress(order.getShippingAddress());
        entity.setCreatedAt(order.getCreatedAt());
        entity.setUpdatedAt(order.getUpdatedAt());
        entity.setCreatedBy(order.getCreatedBy());

        if (order.getItems() != null) {
            for (OrderItem item : order.getItems()) {
                OrderItemJpaEntity itemEntity = new OrderItemJpaEntity();
                itemEntity.setBookId(item.bookId().value());
                itemEntity.setQuantity(item.quantity());
                itemEntity.setUnitPrice(item.unitPrice());
                entity.addItem(itemEntity);
            }
        }

        return entity;
    }

    public static Order toDomainModel(OrderJpaEntity entity) {
        if (entity == null) {
            return null;
        }

        List<OrderItem> items = new ArrayList<>();
        if (entity.getItems() != null) {
            for (OrderItemJpaEntity itemEntity : entity.getItems()) {
                items.add(new OrderItem(
                        BookId.of(itemEntity.getBookId()),
                        itemEntity.getQuantity(),
                        itemEntity.getUnitPrice()
                ));
            }
        }

        return Order.reconstitute(
                OrderId.of(entity.getId()),
                UserId.of(entity.getBuyerId()),
                items,
                entity.getTotalAmount(),
                entity.getCurrency(),
                OrderStatus.valueOf(entity.getStatus().name()),
                entity.getShippingAddress(),
                entity.getCreatedAt(),
                entity.getUpdatedAt(),
                entity.getCreatedBy()
        );
    }
}
