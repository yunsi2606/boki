package com.boki.infrastructure.persistence.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "orders")
public class OrderJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "buyer_id", nullable = false)
    private UUID buyerId;

    @Column(name = "total_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal totalAmount;

    @Column(nullable = false, length = 3)
    private String currency = "VND";

    @Enumerated(EnumType.STRING)
    @org.hibernate.annotations.JdbcType(org.hibernate.dialect.PostgreSQLEnumJdbcType.class)
    @Column(nullable = false, columnDefinition = "order_status")
    private OrderStatusJpa status = OrderStatusJpa.PENDING;

    @Column(name = "shipping_address", columnDefinition = "TEXT")
    private String shippingAddress;

    // Carrier & Shipping tracking fields
    @Column(name = "carrier_name", length = 50)
    private String carrierName;

    @Column(name = "tracking_number", length = 100)
    private String trackingNumber;

    @Column(name = "shipping_fee", precision = 12, scale = 2)
    private BigDecimal shippingFee = BigDecimal.ZERO;

    @Column(name = "estimated_delivery")
    private Instant estimatedDelivery;

    @Column(name = "weight_grams")
    private Integer weightGrams = 500;

    @Column(name = "cancel_reason", columnDefinition = "TEXT")
    private String cancelReason;

    @Column(name = "cancelled_by")
    private String cancelledBy;

    @Column(name = "carrier_status", length = 50)
    private String carrierStatus;

    @Column(name = "payment_method", length = 30)
    private String paymentMethod = "COD";

    @Column(name = "payment_status", length = 30)
    private String paymentStatus = "UNPAID";

    @Column(name = "payment_code", length = 50)
    private String paymentCode;

    @Column(name = "paid_at")
    private Instant paidAt;

    @Column(name = "risk_score")
    private Integer riskScore = 0;

    @Column(name = "risk_level", length = 20)
    private String riskLevel = "SAFE";

    @Column(name = "risk_reasons", columnDefinition = "TEXT")
    private String riskReasons;

    @Column(name = "is_flagged")
    private Boolean isFlagged = false;

    @Column(name = "is_guest")
    private Boolean isGuest = false;

    @Column(name = "guest_email")
    private String guestEmail;

    @Column(name = "guest_name")
    private String guestName;

    @Column(name = "guest_phone", length = 50)
    private String guestPhone;

    @Column(name = "subtotal_amount", precision = 14, scale = 2)
    private BigDecimal subtotalAmount;

    @Column(name = "member_tier", length = 30)
    private String memberTier;

    @Column(name = "member_discount_amount", precision = 14, scale = 2)
    private BigDecimal memberDiscountAmount = BigDecimal.ZERO;

    @Column(name = "voucher_code", length = 50)
    private String voucherCode;

    @Column(name = "voucher_discount_amount", precision = 14, scale = 2)
    private BigDecimal voucherDiscountAmount = BigDecimal.ZERO;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @Column(name = "created_by")
    private String createdBy;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<OrderItemJpaEntity> items = new ArrayList<>();

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("createdAt ASC")
    private List<OrderTimelineJpaEntity> timelines = new ArrayList<>();

    public enum OrderStatusJpa {
        PENDING, CONFIRMED, SHIPPED, DELIVERED, COMPLETED, CANCELLED, RETURNED
    }

    // --- Helper methods for relationship ---
    public void addItem(OrderItemJpaEntity item) {
        items.add(item);
        item.setOrder(this);
    }

    public void removeItem(OrderItemJpaEntity item) {
        items.remove(item);
        item.setOrder(null);
    }

    public void addTimeline(OrderTimelineJpaEntity timeline) {
        timelines.add(timeline);
        timeline.setOrder(this);
    }

    public void removeTimeline(OrderTimelineJpaEntity timeline) {
        timelines.remove(timeline);
        timeline.setOrder(null);
    }

    // --- Getters & Setters ---

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getBuyerId() { return buyerId; }
    public void setBuyerId(UUID buyerId) { this.buyerId = buyerId; }

    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public OrderStatusJpa getStatus() { return status; }
    public void setStatus(OrderStatusJpa status) { this.status = status; }

    public String getShippingAddress() { return shippingAddress; }
    public void setShippingAddress(String shippingAddress) { this.shippingAddress = shippingAddress; }

    public String getCarrierName() { return carrierName; }
    public void setCarrierName(String carrierName) { this.carrierName = carrierName; }

    public String getTrackingNumber() { return trackingNumber; }
    public void setTrackingNumber(String trackingNumber) { this.trackingNumber = trackingNumber; }

    public BigDecimal getShippingFee() { return shippingFee; }
    public void setShippingFee(BigDecimal shippingFee) { this.shippingFee = shippingFee; }

    public Instant getEstimatedDelivery() { return estimatedDelivery; }
    public void setEstimatedDelivery(Instant estimatedDelivery) { this.estimatedDelivery = estimatedDelivery; }

    public Integer getWeightGrams() { return weightGrams; }
    public void setWeightGrams(Integer weightGrams) { this.weightGrams = weightGrams; }

    public String getCancelReason() { return cancelReason; }
    public void setCancelReason(String cancelReason) { this.cancelReason = cancelReason; }

    public String getCancelledBy() { return cancelledBy; }
    public void setCancelledBy(String cancelledBy) { this.cancelledBy = cancelledBy; }

    public String getCarrierStatus() { return carrierStatus; }
    public void setCarrierStatus(String carrierStatus) { this.carrierStatus = carrierStatus; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }

    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public String getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(String paymentStatus) { this.paymentStatus = paymentStatus; }

    public String getPaymentCode() { return paymentCode; }
    public void setPaymentCode(String paymentCode) { this.paymentCode = paymentCode; }

    public Instant getPaidAt() { return paidAt; }
    public void setPaidAt(Instant paidAt) { this.paidAt = paidAt; }

    public Integer getRiskScore() { return riskScore; }
    public void setRiskScore(Integer riskScore) { this.riskScore = riskScore; }

    public String getRiskLevel() { return riskLevel; }
    public void setRiskLevel(String riskLevel) { this.riskLevel = riskLevel; }

    public String getRiskReasons() { return riskReasons; }
    public void setRiskReasons(String riskReasons) { this.riskReasons = riskReasons; }

    public Boolean getIsFlagged() { return isFlagged; }
    public void setIsFlagged(Boolean isFlagged) { this.isFlagged = isFlagged; }

    public Boolean getIsGuest() { return isGuest; }
    public void setIsGuest(Boolean isGuest) { this.isGuest = isGuest; }

    public String getGuestEmail() { return guestEmail; }
    public void setGuestEmail(String guestEmail) { this.guestEmail = guestEmail; }

    public String getGuestName() { return guestName; }
    public void setGuestName(String guestName) { this.guestName = guestName; }

    public String getGuestPhone() { return guestPhone; }
    public void setGuestPhone(String guestPhone) { this.guestPhone = guestPhone; }

    public List<OrderItemJpaEntity> getItems() { return items; }
    public void setItems(List<OrderItemJpaEntity> items) { this.items = items; }

    public List<OrderTimelineJpaEntity> getTimelines() { return timelines; }
    public void setTimelines(List<OrderTimelineJpaEntity> timelines) { this.timelines = timelines; }

    public BigDecimal getSubtotalAmount() { return subtotalAmount; }
    public void setSubtotalAmount(BigDecimal subtotalAmount) { this.subtotalAmount = subtotalAmount; }

    public String getMemberTier() { return memberTier; }
    public void setMemberTier(String memberTier) { this.memberTier = memberTier; }

    public BigDecimal getMemberDiscountAmount() { return memberDiscountAmount; }
    public void setMemberDiscountAmount(BigDecimal memberDiscountAmount) { this.memberDiscountAmount = memberDiscountAmount; }

    public String getVoucherCode() { return voucherCode; }
    public void setVoucherCode(String voucherCode) { this.voucherCode = voucherCode; }

    public BigDecimal getVoucherDiscountAmount() { return voucherDiscountAmount; }
    public void setVoucherDiscountAmount(BigDecimal voucherDiscountAmount) { this.voucherDiscountAmount = voucherDiscountAmount; }
}
