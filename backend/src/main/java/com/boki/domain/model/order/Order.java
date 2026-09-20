package com.boki.domain.model.order;

import com.boki.domain.model.user.UserId;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * Order aggregate root with strict state machine and carrier shipping management.
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

    // Carrier & Shipping details
    private String carrierName;
    private String trackingNumber;
    private BigDecimal shippingFee;
    private Instant estimatedDelivery;
    private Integer weightGrams;
    private String cancelReason;
    private String cancelledBy;
    private String carrierStatus;

    // Payment details
    private PaymentMethod paymentMethod;
    private PaymentStatus paymentStatus;
    private String paymentCode;
    private Instant paidAt;

    // Fraud Detection & Risk fields
    private Integer riskScore;
    private String riskLevel;
    private String riskReasons;
    private Boolean isFlagged;

    // Guest checkout fields
    private Boolean isGuest;
    private String guestName;
    private String guestPhone;
    private String guestEmail;

    // Timeline / Audit events
    private List<OrderTimeline> timelines;

    // Server Pricing Breakdown
    private BigDecimal subtotalAmount;
    private String memberTier;
    private BigDecimal memberDiscountAmount;
    private String voucherCode;
    private BigDecimal voucherDiscountAmount;

    private Order() {
        this.items = new ArrayList<>();
        this.timelines = new ArrayList<>();
        this.shippingFee = BigDecimal.ZERO;
        this.weightGrams = 500;
        this.paymentMethod = PaymentMethod.COD;
        this.paymentStatus = PaymentStatus.UNPAID;
        this.riskScore = 0;
        this.riskLevel = "SAFE";
        this.riskReasons = null;
        this.isFlagged = false;
        this.isGuest = false;
        this.subtotalAmount = BigDecimal.ZERO;
        this.memberTier = "STANDARD";
        this.memberDiscountAmount = BigDecimal.ZERO;
        this.voucherCode = null;
        this.voucherDiscountAmount = BigDecimal.ZERO;
    }

    public static Order create(UserId buyerId, List<OrderItem> items, String shippingAddress, String currency, PaymentMethod paymentMethod) {
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
        order.subtotalAmount = items.stream()
                .map(OrderItem::subtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        order.totalAmount = order.subtotalAmount;
        order.memberTier = "STANDARD";
        order.memberDiscountAmount = BigDecimal.ZERO;
        order.voucherCode = null;
        order.voucherDiscountAmount = BigDecimal.ZERO;
        order.currency = currency != null ? currency : "VND";
        order.status = OrderStatus.PENDING;
        order.shippingAddress = shippingAddress;
        order.createdAt = Instant.now();
        order.updatedAt = Instant.now();
        order.createdBy = buyerId.toString();
        order.shippingFee = BigDecimal.ZERO;
        order.weightGrams = 500;
        order.riskScore = 0;
        order.riskLevel = "SAFE";
        order.isFlagged = false;
        order.isGuest = false;

        order.paymentMethod = paymentMethod != null ? paymentMethod : PaymentMethod.COD;
        order.paymentStatus = PaymentStatus.UNPAID;
        String rawId = order.id.value().toString().replace("-", "").substring(0, 8).toUpperCase();
        order.paymentCode = "BOKI" + rawId;

        order.timelines.add(OrderTimeline.create(
                order.id,
                OrderStatus.PENDING.name(),
                "Đặt hàng thành công (" + order.paymentMethod.name() + ")",
                "Đơn hàng đã được tạo bởi khách hàng. Phương thức thanh toán: " + order.paymentMethod.name() + ".",
                "Customer"
        ));

        return order;
    }

    public static Order create(UserId buyerId, List<OrderItem> items, String shippingAddress, String currency) {
        return create(buyerId, items, shippingAddress, currency, PaymentMethod.COD);
    }

    public static Order reconstitute(
            OrderId id, UserId buyerId, List<OrderItem> items,
            BigDecimal totalAmount, String currency, OrderStatus status,
            String shippingAddress, Instant createdAt, Instant updatedAt, String createdBy,
            String carrierName, String trackingNumber, BigDecimal shippingFee,
            Instant estimatedDelivery, Integer weightGrams, String cancelReason,
            String cancelledBy, String carrierStatus,
            PaymentMethod paymentMethod, PaymentStatus paymentStatus, String paymentCode, Instant paidAt,
            Integer riskScore, String riskLevel, String riskReasons, Boolean isFlagged,
            Boolean isGuest, String guestName, String guestPhone, String guestEmail,
            List<OrderTimeline> timelines,
            BigDecimal subtotalAmount, String memberTier, BigDecimal memberDiscountAmount,
            String voucherCode, BigDecimal voucherDiscountAmount
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
        order.carrierName = carrierName;
        order.trackingNumber = trackingNumber;
        order.shippingFee = shippingFee != null ? shippingFee : BigDecimal.ZERO;
        order.estimatedDelivery = estimatedDelivery;
        order.weightGrams = weightGrams != null ? weightGrams : 500;
        order.cancelReason = cancelReason;
        order.cancelledBy = cancelledBy;
        order.carrierStatus = carrierStatus;
        order.paymentMethod = paymentMethod != null ? paymentMethod : PaymentMethod.COD;
        order.paymentStatus = paymentStatus != null ? paymentStatus : PaymentStatus.UNPAID;
        order.paymentCode = paymentCode;
        order.paidAt = paidAt;
        order.riskScore = riskScore != null ? riskScore : 0;
        order.riskLevel = riskLevel != null ? riskLevel : "SAFE";
        order.riskReasons = riskReasons;
        order.isFlagged = isFlagged != null ? isFlagged : false;
        order.isGuest = isGuest != null ? isGuest : false;
        order.guestName = guestName;
        order.guestPhone = guestPhone;
        order.guestEmail = guestEmail;
        order.timelines = timelines != null ? new ArrayList<>(timelines) : new ArrayList<>();
        order.subtotalAmount = subtotalAmount != null ? subtotalAmount : totalAmount;
        order.memberTier = memberTier != null ? memberTier : "STANDARD";
        order.memberDiscountAmount = memberDiscountAmount != null ? memberDiscountAmount : BigDecimal.ZERO;
        order.voucherCode = voucherCode;
        order.voucherDiscountAmount = voucherDiscountAmount != null ? voucherDiscountAmount : BigDecimal.ZERO;
        return order;
    }

    public void applyServerPricing(BigDecimal subtotal, String memberTier, BigDecimal memberDiscount, String voucherCode, BigDecimal voucherDiscount) {
        this.subtotalAmount = subtotal != null ? subtotal : BigDecimal.ZERO;
        this.memberTier = memberTier != null ? memberTier : "STANDARD";
        this.memberDiscountAmount = memberDiscount != null ? memberDiscount : BigDecimal.ZERO;
        this.voucherCode = voucherCode;
        this.voucherDiscountAmount = voucherDiscount != null ? voucherDiscount : BigDecimal.ZERO;

        BigDecimal payable = this.subtotalAmount
                .subtract(this.memberDiscountAmount)
                .subtract(this.voucherDiscountAmount);
        if (payable.compareTo(BigDecimal.ZERO) < 0) {
            payable = BigDecimal.ZERO;
        }
        this.totalAmount = payable.add(this.shippingFee != null ? this.shippingFee : BigDecimal.ZERO);
        this.updatedAt = Instant.now();
    }

    // ---- State Machine & Business Methods ----

    public void markAsGuest(String name, String phone, String email) {
        this.isGuest = true;
        this.guestName = name;
        this.guestPhone = phone;
        this.guestEmail = email;
    }

    public void applyRiskAssessment(int score, String level, String reasons, boolean flagged) {
        this.riskScore = score;
        this.riskLevel = level != null ? level : "SAFE";
        this.riskReasons = reasons;
        this.isFlagged = flagged;
        this.updatedAt = Instant.now();
    }

    public void dismissFlag(String actor, String reason) {
        this.isFlagged = false;
        this.updatedAt = Instant.now();
        this.timelines.add(OrderTimeline.create(
                this.id,
                this.status.name(),
                "Gỡ cờ cảnh báo rủi ro",
                "Quản trị viên đã kiểm tra thủ công và gỡ cờ rủi ro gian lận. Lý do: " + (reason != null ? reason : "Đã xác minh thông tin khách hàng an toàn."),
                actor != null ? actor : "Admin"
        ));
    }

    public void confirm(String actor) {
        if (status != OrderStatus.PENDING) {
            throw new IllegalStateException("Chỉ đơn hàng ở trạng thái CHỜ XÁC NHẬN (PENDING) mới có thể duyệt xác nhận.");
        }
        this.status = OrderStatus.CONFIRMED;
        this.updatedAt = Instant.now();

        this.timelines.add(OrderTimeline.create(
                this.id,
                OrderStatus.CONFIRMED.name(),
                "Đã xác nhận đơn hàng",
                "Người bán đã duyệt đơn và đang chuẩn bị đóng gói sách.",
                actor != null ? actor : "Admin"
        ));
    }

    public void shipWithCarrier(
            String carrierName,
            String trackingNumber,
            BigDecimal shippingFee,
            Instant estimatedDelivery,
            Integer weightGrams,
            String actor
    ) {
        if (status != OrderStatus.CONFIRMED) {
            throw new IllegalStateException("Chỉ đơn hàng đã XÁC NHẬN (CONFIRMED) mới có thể bàn giao cho đơn vị vận chuyển.");
        }
        if (carrierName == null || carrierName.isBlank()) {
            throw new IllegalArgumentException("Tên đơn vị vận chuyển không được để trống.");
        }
        if (trackingNumber == null || trackingNumber.isBlank()) {
            throw new IllegalArgumentException("Mã vận đơn không được để trống.");
        }

        this.status = OrderStatus.SHIPPED;
        this.carrierName = carrierName.trim();
        this.trackingNumber = trackingNumber.trim();
        this.shippingFee = shippingFee != null ? shippingFee : BigDecimal.ZERO;
        this.estimatedDelivery = estimatedDelivery;
        this.weightGrams = weightGrams != null ? weightGrams : 500;
        this.carrierStatus = "PICKED_UP";
        this.updatedAt = Instant.now();

        this.timelines.add(OrderTimeline.create(
                this.id,
                OrderStatus.SHIPPED.name(),
                "Đã giao cho ĐVVC " + this.carrierName,
                "Mã vận đơn: " + this.trackingNumber + ". Kiện hàng đang trên đường vận chuyển.",
                actor != null ? actor : "Admin"
        ));
    }

    public void deliver(String actor) {
        if (status != OrderStatus.SHIPPED) {
            throw new IllegalStateException("Chỉ đơn hàng ĐANG GIAO (SHIPPED) mới có thể cập nhật đã giao thành công.");
        }
        this.status = OrderStatus.DELIVERED;
        this.carrierStatus = "DELIVERED";
        this.updatedAt = Instant.now();

        // Auto-mark payment as PAID if not already paid (e.g. COD cash collected upon delivery)
        if (this.paymentStatus != PaymentStatus.PAID) {
            this.paymentStatus = PaymentStatus.PAID;
            this.paidAt = Instant.now();
        }

        this.timelines.add(OrderTimeline.create(
                this.id,
                OrderStatus.DELIVERED.name(),
                "Giao hàng thành công",
                "Đơn vị vận chuyển đã giao kiện hàng đến người nhận.",
                actor != null ? actor : "Carrier"
        ));
    }

    public void complete(String actor) {
        if (status != OrderStatus.DELIVERED && status != OrderStatus.SHIPPED) {
            throw new IllegalStateException("Chỉ đơn hàng ĐÃ GIAO (DELIVERED) hoặc ĐANG GIAO (SHIPPED) mới có thể chuyển sang HOÀN THÀNH.");
        }
        this.status = OrderStatus.COMPLETED;
        this.carrierStatus = "DELIVERED";
        this.updatedAt = Instant.now();

        if (this.paymentStatus != PaymentStatus.PAID) {
            this.paymentStatus = PaymentStatus.PAID;
            this.paidAt = Instant.now();
        }

        this.timelines.add(OrderTimeline.create(
                this.id,
                OrderStatus.COMPLETED.name(),
                "Đơn hàng hoàn tất",
                "Đơn hàng đã được xác nhận hoàn tất thành công. Tiền chi tiêu đã được tích lũy vào tài khoản khách hàng.",
                actor != null ? actor : "System"
        ));
    }

    public void markReturned(String returnReason, String actor) {
        if (status != OrderStatus.SHIPPED) {
            throw new IllegalStateException("Chỉ đơn hàng ĐANG GIAO (SHIPPED) mới có thể chuyển trạng thái hoàn trả/thất bại.");
        }
        this.status = OrderStatus.RETURNED;
        this.carrierStatus = "RETURNED_TO_SENDER";
        this.cancelReason = returnReason;
        this.updatedAt = Instant.now();

        this.timelines.add(OrderTimeline.create(
                this.id,
                OrderStatus.RETURNED.name(),
                "Giao hàng thất bại / Hoàn hàng",
                "Lý do: " + (returnReason != null ? returnReason : "Khách không nhận hàng hoặc không liên lạc được."),
                actor != null ? actor : "Carrier"
        ));
    }

    public void cancelWithReason(String reason, String cancelledBy) {
        if (status == OrderStatus.DELIVERED || status == OrderStatus.COMPLETED || status == OrderStatus.CANCELLED || status == OrderStatus.RETURNED) {
            throw new IllegalStateException("Không thể hủy đơn hàng đã ở trạng thái: " + status);
        }
        this.status = OrderStatus.CANCELLED;
        this.cancelReason = reason != null ? reason : "Hủy theo yêu cầu";
        this.cancelledBy = cancelledBy != null ? cancelledBy : "Admin";
        this.updatedAt = Instant.now();

        this.timelines.add(OrderTimeline.create(
                this.id,
                OrderStatus.CANCELLED.name(),
                "Đơn hàng đã hủy",
                "Lý do: " + this.cancelReason + " (Bởi: " + this.cancelledBy + "). Tồn kho các sản phẩm đã được tự động hoàn trả.",
                this.cancelledBy
        ));
    }

    public void updateShippingDetails(String newAddress, Integer newWeight, String actor) {
        if (newAddress != null && !newAddress.isBlank()) {
            this.shippingAddress = newAddress.trim();
        }
        if (newWeight != null && newWeight > 0) {
            this.weightGrams = newWeight;
        }
        this.updatedAt = Instant.now();
        this.timelines.add(OrderTimeline.create(
                this.id,
                this.status.name(),
                "Cập nhật thông tin giao hàng",
                "Đã cập nhật địa chỉ/trọng lượng giao hàng.",
                actor != null ? actor : "Admin"
        ));
    }

    public void updateCodAmount(BigDecimal newCod, String actor) {
        if (newCod != null && newCod.compareTo(BigDecimal.ZERO) >= 0) {
            BigDecimal oldTotal = this.totalAmount;
            this.totalAmount = newCod;
            this.updatedAt = Instant.now();
            this.timelines.add(OrderTimeline.create(
                    this.id,
                    this.status.name(),
                    "Cập nhật tiền thu hộ (COD)",
                    "Tiền thu hộ COD được cập nhật từ " + oldTotal + " " + currency + " sang " + newCod + " " + currency + ".",
                    actor != null ? actor : "Admin"
            ));
        }
    }

    public void handleCarrierWebhook(
            String carrierStatus,
            String eventType,
            String description,
            BigDecimal actualFee,
            BigDecimal codAmount,
            String shipperName,
            String shipperPhone,
            String podUrl,
            String reason
    ) {
        if (carrierStatus != null && !carrierStatus.isBlank()) {
            this.carrierStatus = carrierStatus.trim().toLowerCase();
        }
        this.updatedAt = Instant.now();

        if (actualFee != null && actualFee.compareTo(BigDecimal.ZERO) > 0) {
            this.shippingFee = actualFee;
        }

        if (codAmount != null && codAmount.compareTo(BigDecimal.ZERO) >= 0 && "update_cod".equalsIgnoreCase(eventType)) {
            this.totalAmount = codAmount;
        }

        String lowerStatus = this.carrierStatus != null ? this.carrierStatus : "";
        if ("delivered".equalsIgnoreCase(lowerStatus)) {
            if (this.status != OrderStatus.DELIVERED && this.status != OrderStatus.COMPLETED) {
                this.status = OrderStatus.DELIVERED;
            }
        } else if ("cancel".equalsIgnoreCase(lowerStatus)) {
            if (this.status != OrderStatus.CANCELLED) {
                this.status = OrderStatus.CANCELLED;
                this.cancelReason = reason != null && !reason.isBlank() ? reason : "GHN báo hủy đơn hàng";
                this.cancelledBy = "GHN";
            }
        } else if (lowerStatus.contains("returned") || "return".equalsIgnoreCase(lowerStatus)) {
            if (this.status != OrderStatus.RETURNED) {
                this.status = OrderStatus.RETURNED;
                this.cancelReason = reason != null && !reason.isBlank() ? reason : "Đơn hàng hoàn về người gửi";
            }
        } else if (this.status == OrderStatus.PENDING || this.status == OrderStatus.CONFIRMED) {
            this.status = OrderStatus.SHIPPED;
        }

        StringBuilder detail = new StringBuilder();
        if (description != null && !description.isBlank()) {
            detail.append(description);
        } else {
            detail.append("Sự kiện ĐVVC: ").append(eventType != null ? eventType : carrierStatus);
        }

        if (shipperName != null && !shipperName.isBlank()) {
            detail.append(" | Bưu tá: ").append(shipperName);
            if (shipperPhone != null && !shipperPhone.isBlank()) {
                detail.append(" (").append(shipperPhone).append(")");
            }
        }
        if (reason != null && !reason.isBlank()) {
            detail.append(" | Lý do: ").append(reason);
        }
        if (podUrl != null && !podUrl.isBlank()) {
            detail.append(" | Ảnh POD: ").append(podUrl);
        }

        this.timelines.add(OrderTimeline.create(
                this.id,
                this.status.name(),
                "Webhook GHN: " + (carrierStatus != null ? carrierStatus : eventType),
                detail.toString(),
                "GHN Webhook"
        ));
    }

    public void markAsPaid(String transactionCode, String method, String actor) {
        if (this.paymentStatus == PaymentStatus.PAID) {
            return; // Idempotent
        }
        this.paymentStatus = PaymentStatus.PAID;
        this.paidAt = Instant.now();
        this.updatedAt = Instant.now();

        // Auto-confirm order if pending
        if (this.status == OrderStatus.PENDING) {
            this.status = OrderStatus.CONFIRMED;
        }

        String transInfo = (transactionCode != null && !transactionCode.isBlank()) ? " (Mã GD: " + transactionCode + ")" : "";
        String methodInfo = method != null ? method : (this.paymentMethod != null ? this.paymentMethod.name() : "Thanh toán");
        this.timelines.add(OrderTimeline.create(
                this.id,
                this.status.name(),
                "Thanh toán thành công qua " + methodInfo,
                "Đơn hàng đã được thanh toán thành công" + transInfo + ". Trạng thái: " + this.status.name(),
                actor != null ? actor : "System"
        ));
    }

    public void updatePaymentMethod(PaymentMethod method) {
        if (method != null) {
            this.paymentMethod = method;
            this.updatedAt = Instant.now();
        }
    }

    public void addTimeline(OrderTimeline timeline) {
        if (timeline != null) {
            this.timelines.add(timeline);
        }
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

    public String getCarrierName() { return carrierName; }
    public String getTrackingNumber() { return trackingNumber; }
    public BigDecimal getShippingFee() { return shippingFee; }
    public Instant getEstimatedDelivery() { return estimatedDelivery; }
    public Integer getWeightGrams() { return weightGrams; }
    public String getCancelReason() { return cancelReason; }
    public String getCancelledBy() { return cancelledBy; }
    public String getCarrierStatus() { return carrierStatus; }

    public PaymentMethod getPaymentMethod() { return paymentMethod; }
    public PaymentStatus getPaymentStatus() { return paymentStatus; }
    public String getPaymentCode() { return paymentCode; }
    public Instant getPaidAt() { return paidAt; }

    public Integer getRiskScore() { return riskScore != null ? riskScore : 0; }
    public String getRiskLevel() { return riskLevel != null ? riskLevel : "SAFE"; }
    public String getRiskReasons() { return riskReasons; }
    public Boolean getIsFlagged() { return isFlagged != null ? isFlagged : false; }
    public Boolean getIsGuest() { return isGuest != null ? isGuest : false; }
    public String getGuestName() { return guestName; }
    public String getGuestPhone() { return guestPhone; }
    public String getGuestEmail() { return guestEmail; }

    public BigDecimal getSubtotalAmount() { return subtotalAmount != null ? subtotalAmount : totalAmount; }
    public String getMemberTier() { return memberTier != null ? memberTier : "STANDARD"; }
    public BigDecimal getMemberDiscountAmount() { return memberDiscountAmount != null ? memberDiscountAmount : BigDecimal.ZERO; }
    public String getVoucherCode() { return voucherCode; }
    public BigDecimal getVoucherDiscountAmount() { return voucherDiscountAmount != null ? voucherDiscountAmount : BigDecimal.ZERO; }

    public List<OrderTimeline> getTimelines() { return Collections.unmodifiableList(timelines); }
}
