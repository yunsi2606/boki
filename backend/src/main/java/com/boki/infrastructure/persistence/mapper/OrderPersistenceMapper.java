package com.boki.infrastructure.persistence.mapper;

import com.boki.domain.model.book.BookId;
import com.boki.domain.model.order.*;
import com.boki.domain.model.user.UserId;
import com.boki.infrastructure.persistence.entity.OrderItemJpaEntity;
import com.boki.infrastructure.persistence.entity.OrderJpaEntity;
import com.boki.infrastructure.persistence.entity.OrderTimelineJpaEntity;

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
        entity.setCarrierName(order.getCarrierName());
        entity.setTrackingNumber(order.getTrackingNumber());
        entity.setShippingFee(order.getShippingFee());
        entity.setEstimatedDelivery(order.getEstimatedDelivery());
        entity.setWeightGrams(order.getWeightGrams());
        entity.setCancelReason(order.getCancelReason());
        entity.setCancelledBy(order.getCancelledBy());
        entity.setCarrierStatus(order.getCarrierStatus());
        entity.setPaymentMethod(order.getPaymentMethod() != null ? order.getPaymentMethod().name() : "COD");
        entity.setPaymentStatus(order.getPaymentStatus() != null ? order.getPaymentStatus().name() : "UNPAID");
        entity.setPaymentCode(order.getPaymentCode());
        entity.setPaidAt(order.getPaidAt());
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

        if (order.getTimelines() != null) {
            for (OrderTimeline tl : order.getTimelines()) {
                OrderTimelineJpaEntity tlEntity = new OrderTimelineJpaEntity(
                        tl.getId(),
                        entity,
                        tl.getStatus(),
                        tl.getTitle(),
                        tl.getDescription(),
                        tl.getActor(),
                        tl.getCreatedAt()
                );
                entity.addTimeline(tlEntity);
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

        List<OrderTimeline> timelines = new ArrayList<>();
        if (entity.getTimelines() != null) {
            for (OrderTimelineJpaEntity tlEntity : entity.getTimelines()) {
                timelines.add(new OrderTimeline(
                        tlEntity.getId(),
                        OrderId.of(entity.getId()),
                        tlEntity.getStatus(),
                        tlEntity.getTitle(),
                        tlEntity.getDescription(),
                        tlEntity.getActor(),
                        tlEntity.getCreatedAt()
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
                entity.getCreatedBy(),
                entity.getCarrierName(),
                entity.getTrackingNumber(),
                entity.getShippingFee(),
                entity.getEstimatedDelivery(),
                entity.getWeightGrams(),
                entity.getCancelReason(),
                entity.getCancelledBy(),
                entity.getCarrierStatus(),
                com.boki.domain.model.order.PaymentMethod.fromString(entity.getPaymentMethod()),
                com.boki.domain.model.order.PaymentStatus.fromString(entity.getPaymentStatus()),
                entity.getPaymentCode(),
                entity.getPaidAt(),
                timelines
        );
    }
}
