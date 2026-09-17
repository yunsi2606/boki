package com.boki.domain.model.order;

import java.time.Instant;
import java.util.UUID;

public class OrderTimeline {
    private final UUID id;
    private final OrderId orderId;
    private final String status;
    private final String title;
    private final String description;
    private final String actor;
    private final Instant createdAt;

    public OrderTimeline(UUID id, OrderId orderId, String status, String title, String description, String actor, Instant createdAt) {
        this.id = id != null ? id : UUID.randomUUID();
        this.orderId = orderId;
        this.status = status;
        this.title = title;
        this.description = description;
        this.actor = actor != null ? actor : "System";
        this.createdAt = createdAt != null ? createdAt : Instant.now();
    }

    public static OrderTimeline create(OrderId orderId, String status, String title, String description, String actor) {
        return new OrderTimeline(UUID.randomUUID(), orderId, status, title, description, actor, Instant.now());
    }

    public UUID getId() { return id; }
    public OrderId getOrderId() { return orderId; }
    public String getStatus() { return status; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public String getActor() { return actor; }
    public Instant getCreatedAt() { return createdAt; }
}
