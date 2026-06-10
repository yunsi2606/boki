package com.boki.domain.model.order;

import com.boki.domain.model.user.UserId;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * Order aggregate root.
 */
public class Order {

    private OrderId id;
    private UserId buyerId;
    private List<OrderItem> items;
    private BigDecimal totalAmount;
    private String currency;
    private OrderStatus status;
    private String shippingAddress;
    private Instant createdAt;
    private Instant updatedAt;
    private String createdBy;

    private Order() {
        this.items = new ArrayList<>();
    }

    public static Order create(UserId buyerId, List<OrderItem> items, String shippingAddress, String currency) {
        if (buyerId == null) {
            throw new IllegalArgumentException("Buyer ID cannot be null");
        }
        if (items == null || items.isEmpty()) {
            throw new IllegalArgumentException("Order must have at least one item");
        }

        Order order = new Order();
        order.id = OrderId.generate();
        order.buyerId = buyerId;
        order.items = new ArrayList<>(items);
        order.totalAmount = items.stream()
                .map(OrderItem::subtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        order.currency = currency != null ? currency : "VND";
        order.status = OrderStatus.PENDING;
        order.shippingAddress = shippingAddress;
        order.createdAt = Instant.now();
        order.updatedAt = Instant.now();
        order.createdBy = buyerId.toString();
        return order;
    }

    public static Order reconstitute(
            OrderId id, UserId buyerId, List<OrderItem> items,
            BigDecimal totalAmount, String currency, OrderStatus status,
            String shippingAddress, Instant createdAt, Instant updatedAt, String createdBy
    ) {
        Order order = new Order();
        order.id = id;
        order.buyerId = buyerId;
        order.items = items != null ? new ArrayList<>(items) : new ArrayList<>();
        order.totalAmount = totalAmount;
        order.currency = currency;
        order.status = status;
        order.shippingAddress = shippingAddress;
        order.createdAt = createdAt;
        order.updatedAt = updatedAt;
        order.createdBy = createdBy;
        return order;
    }

    // ---- Business Methods ----

    public void confirm() {
        if (status != OrderStatus.PENDING) {
            throw new IllegalStateException("Only PENDING orders can be confirmed");
        }
        this.status = OrderStatus.CONFIRMED;
        this.updatedAt = Instant.now();
    }

    public void ship() {
        if (status != OrderStatus.CONFIRMED) {
            throw new IllegalStateException("Only CONFIRMED orders can be shipped");
        }
        this.status = OrderStatus.SHIPPED;
        this.updatedAt = Instant.now();
    }

    public void deliver() {
        if (status != OrderStatus.SHIPPED) {
            throw new IllegalStateException("Only SHIPPED orders can be delivered");
        }
        this.status = OrderStatus.DELIVERED;
        this.updatedAt = Instant.now();
    }

    public void cancel() {
        if (status == OrderStatus.DELIVERED || status == OrderStatus.CANCELLED) {
            throw new IllegalStateException("Cannot cancel a " + status + " order");
        }
        this.status = OrderStatus.CANCELLED;
        this.updatedAt = Instant.now();
    }

    // ---- Getters ----

    public OrderId getId() { return id; }
    public UserId getBuyerId() { return buyerId; }
    public List<OrderItem> getItems() { return Collections.unmodifiableList(items); }
    public BigDecimal getTotalAmount() { return totalAmount; }
    public String getCurrency() { return currency; }
    public OrderStatus getStatus() { return status; }
    public String getShippingAddress() { return shippingAddress; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public String getCreatedBy() { return createdBy; }
}
