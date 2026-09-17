package com.boki.application.service;

import com.boki.application.dto.payment.*;
import com.boki.application.dto.response.OrderResponse;
import com.boki.application.mapper.OrderDtoMapper;
import com.boki.domain.model.order.*;
import com.boki.domain.port.out.OrderRepository;
import com.boki.infrastructure.persistence.entity.OrderJpaEntity;
import com.boki.infrastructure.persistence.entity.PaymentJpaEntity;
import com.boki.infrastructure.persistence.mapper.OrderPersistenceMapper;
import com.boki.infrastructure.persistence.repository.OrderJpaRepository;
import com.boki.infrastructure.persistence.repository.PaymentJpaRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
public class PaymentApplicationService {

    private static final Logger log = LoggerFactory.getLogger(PaymentApplicationService.class);

    private final OrderRepository orderRepository;
    private final OrderJpaRepository orderJpaRepository;
    private final PaymentJpaRepository paymentJpaRepository;
    private final SePayPaymentService sePayPaymentService;
    private final MoMoPaymentService moMoPaymentService;
    private final VNPayPaymentService vnPayPaymentService;
    private final OrderDtoMapper orderDtoMapper;

    public PaymentApplicationService(
            OrderRepository orderRepository,
            OrderJpaRepository orderJpaRepository,
            PaymentJpaRepository paymentJpaRepository,
            SePayPaymentService sePayPaymentService,
            MoMoPaymentService moMoPaymentService,
            VNPayPaymentService vnPayPaymentService,
            OrderDtoMapper orderDtoMapper
    ) {
        this.orderRepository = orderRepository;
        this.orderJpaRepository = orderJpaRepository;
        this.paymentJpaRepository = paymentJpaRepository;
        this.sePayPaymentService = sePayPaymentService;
        this.moMoPaymentService = moMoPaymentService;
        this.vnPayPaymentService = vnPayPaymentService;
        this.orderDtoMapper = orderDtoMapper;
    }

    /**
     * Initializes payment for an order and returns gateway URLs / VietQR data.
     */
    @Transactional
    public PaymentInitResponse initiatePayment(CreatePaymentRequest request, String clientIp, String origin) {
        Order order = orderRepository.findById(OrderId.of(request.orderId()))
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy đơn hàng: " + request.orderId()));

        PaymentMethod method = request.paymentMethod() != null
                ? PaymentMethod.fromString(request.paymentMethod())
                : order.getPaymentMethod();

        if (method != order.getPaymentMethod()) {
            order.updatePaymentMethod(method);
            orderRepository.save(order);
        }

        String baseOrigin = (origin != null && !origin.isBlank()) ? origin : "http://localhost:3000";

        switch (method) {
            case BANKING: {
                String qrUrl = sePayPaymentService.generateVietQrUrl(order.getTotalAmount(), order.getPaymentCode());
                return new PaymentInitResponse(
                        order.getId().value(),
                        method.name(),
                        order.getPaymentStatus().name(),
                        order.getTotalAmount(),
                        order.getCurrency(),
                        order.getPaymentCode(),
                        qrUrl,
                        null,
                        sePayPaymentService.getBankCode(),
                        sePayPaymentService.getAccountNumber(),
                        sePayPaymentService.getAccountName(),
                        "Quét mã VietQR chuyển khoản nhanh 24/7. Đơn hàng sẽ tự động xác nhận."
                );
            }
            case MOMO: {
                String redirectUrl = baseOrigin + "/checkout/payment-return";
                String ipnUrl = baseOrigin + "/api/webhooks/momo";
                Map<String, Object> momoResp = moMoPaymentService.createPayment(
                        order.getId().value(),
                        order.getTotalAmount(),
                        "Thanh toan don hang Boki #" + order.getPaymentCode(),
                        redirectUrl,
                        ipnUrl
                );
                String payUrl = (String) momoResp.get("payUrl");
                String qrUrl = (String) momoResp.get("qrCodeUrl");
                return new PaymentInitResponse(
                        order.getId().value(),
                        method.name(),
                        order.getPaymentStatus().name(),
                        order.getTotalAmount(),
                        order.getCurrency(),
                        order.getPaymentCode(),
                        qrUrl,
                        payUrl,
                        null,
                        null,
                        null,
                        "Chuyển hướng sang cổng thanh toán Ví MoMo..."
                );
            }
            case VNPAY: {
                String returnUrl = baseOrigin + "/checkout/payment-return";
                String paymentUrl = vnPayPaymentService.createPaymentUrl(
                        order.getId().value(),
                        order.getTotalAmount(),
                        "Thanh toan don hang Boki #" + order.getPaymentCode(),
                        returnUrl,
                        clientIp
                );
                return new PaymentInitResponse(
                        order.getId().value(),
                        method.name(),
                        order.getPaymentStatus().name(),
                        order.getTotalAmount(),
                        order.getCurrency(),
                        order.getPaymentCode(),
                        null,
                        paymentUrl,
                        null,
                        null,
                        null,
                        "Chuyển hướng sang cổng thanh toán VNPay..."
                );
            }
            case COD:
            default: {
                return new PaymentInitResponse(
                        order.getId().value(),
                        PaymentMethod.COD.name(),
                        order.getPaymentStatus().name(),
                        order.getTotalAmount(),
                        order.getCurrency(),
                        order.getPaymentCode(),
                        null,
                        null,
                        null,
                        null,
                        null,
                        "Thanh toán tiền mặt trực tiếp khi nhận hàng."
                );
            }
        }
    }

    /**
     * Checks current payment status of an order for live client polling.
     */
    @Transactional(readOnly = true)
    public PaymentStatusResponse getPaymentStatus(UUID orderId) {
        Order order = orderRepository.findById(OrderId.of(orderId))
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy đơn hàng: " + orderId));

        return new PaymentStatusResponse(
                order.getId().value(),
                order.getPaymentStatus().name(),
                order.getPaymentMethod().name(),
                order.getPaymentCode(),
                order.getTotalAmount(),
                order.getPaidAt()
        );
    }

    /**
     * Handles SePay transaction webhook callback.
     */
    @Transactional
    public OrderResponse processSePayWebhook(SePayWebhookPayload payload, String authHeader) {
        if (authHeader != null && !sePayPaymentService.validateAuth(authHeader)) {
            log.warn("SePay Webhook rejected: Invalid authorization header");
            throw new SecurityException("Invalid SePay authorization credentials");
        }

        if (payload.transferType() != null && !"in".equalsIgnoreCase(payload.transferType())) {
            log.info("Ignoring SePay outgoing transfer id={}", payload.id());
            return null;
        }

        String paymentCode = sePayPaymentService.extractPaymentCode(payload);
        log.info("Processing SePay transaction: id={}, amount={}, extracted paymentCode={}",
                payload.id(), payload.transferAmount(), paymentCode);

        if (paymentCode == null || paymentCode.isBlank()) {
            log.warn("Could not determine payment code from SePay payload: {}", payload.content());
            return null;
        }

        // Find matching order by paymentCode
        Optional<OrderJpaEntity> entityOpt = orderJpaRepository.findByPaymentCode(paymentCode);
        if (entityOpt.isEmpty()) {
            // Also attempt to find by UUID if paymentCode is a UUID string
            try {
                entityOpt = orderJpaRepository.findById(UUID.fromString(paymentCode));
            } catch (Exception ignored) {
            }
        }

        if (entityOpt.isEmpty()) {
            log.warn("No order found matching SePay payment code: {}", paymentCode);
            return null;
        }

        OrderJpaEntity entity = entityOpt.get();
        Order order = OrderPersistenceMapper.toDomainModel(entity);

        // Verify transfer amount
        if (payload.transferAmount() != null && payload.transferAmount().compareTo(order.getTotalAmount()) < 0) {
            log.warn("SePay transfer amount ({}) is less than order total ({}) for order {}",
                    payload.transferAmount(), order.getTotalAmount(), order.getId().value());
            // Record timeline of partial payment
            order.addTimeline(OrderTimeline.create(
                    order.getId(),
                    order.getStatus().name(),
                    "Thanh toán không đủ số tiền",
                    "Đã nhận chuyển khoản " + payload.transferAmount() + " VND từ SePay nhưng thiếu so với tổng tiền đơn hàng " + order.getTotalAmount() + " VND.",
                    "SePay Webhook"
            ));
            Order saved = orderRepository.save(order);
            return orderDtoMapper.toResponse(saved);
        }

        order.markAsPaid(payload.referenceCode(), "Chuyển khoản SePay (" + payload.gateway() + ")", "SePay Webhook");
        Order savedOrder = orderRepository.save(order);

        // Log payment record
        PaymentJpaEntity payment = new PaymentJpaEntity(
                entity,
                PaymentMethod.BANKING.name(),
                PaymentStatus.PAID.name(),
                payload.transferAmount() != null ? payload.transferAmount() : order.getTotalAmount(),
                payload.referenceCode(),
                paymentCode,
                "SePay ref: " + payload.referenceCode() + " | Bank: " + payload.gateway(),
                Instant.now()
        );
        paymentJpaRepository.save(payment);

        log.info("Order {} successfully marked as PAID via SePay webhook", savedOrder.getId().value());
        return orderDtoMapper.toResponse(savedOrder);
    }

    /**
     * Handles MoMo IPN Webhook callback.
     */
    @Transactional
    public OrderResponse processMoMoWebhook(MoMoWebhookPayload payload) {
        log.info("Processing MoMo IPN callback for orderId={}, transId={}, resultCode={}",
                payload.orderId(), payload.transId(), payload.resultCode());

        if (payload.orderId() == null) {
            return null;
        }

        UUID orderId;
        try {
            orderId = UUID.fromString(payload.orderId());
        } catch (Exception e) {
            log.warn("Invalid MoMo orderId format: {}", payload.orderId());
            return null;
        }

        Order order = orderRepository.findById(OrderId.of(orderId)).orElse(null);
        if (order == null) {
            log.warn("MoMo IPN: Order not found for id {}", orderId);
            return null;
        }

        if (payload.resultCode() != null && payload.resultCode() == 0) {
            order.markAsPaid(String.valueOf(payload.transId()), "Ví MoMo", "MoMo IPN");
            Order savedOrder = orderRepository.save(order);

            OrderJpaEntity entity = orderJpaRepository.findById(orderId).orElse(null);
            if (entity != null) {
                PaymentJpaEntity payment = new PaymentJpaEntity(
                        entity,
                        PaymentMethod.MOMO.name(),
                        PaymentStatus.PAID.name(),
                        payload.amount() != null ? BigDecimal.valueOf(payload.amount()) : order.getTotalAmount(),
                        String.valueOf(payload.transId()),
                        order.getPaymentCode(),
                        "MoMo transId: " + payload.transId() + " | payType: " + payload.payType(),
                        Instant.now()
                );
                paymentJpaRepository.save(payment);
            }

            return orderDtoMapper.toResponse(savedOrder);
        } else {
            log.warn("MoMo payment unsuccessful: code={}, message={}", payload.resultCode(), payload.message());
            order.addTimeline(OrderTimeline.create(
                    order.getId(),
                    order.getStatus().name(),
                    "Thanh toán MoMo thất bại",
                    "Giao dịch MoMo không thành công (Lý do: " + payload.message() + ")",
                    "MoMo IPN"
            ));
            Order saved = orderRepository.save(order);
            return orderDtoMapper.toResponse(saved);
        }
    }

    /**
     * Handles VNPay IPN Webhook and Return URL processing.
     */
    @Transactional
    public OrderResponse processVNPayCallback(Map<String, String> params) {
        String txnRef = params.get("vnp_TxnRef");
        String responseCode = params.get("vnp_ResponseCode");
        String transactionStatus = params.get("vnp_TransactionStatus");
        String transactionNo = params.get("vnp_TransactionNo");

        log.info("Processing VNPay callback: txnRef={}, responseCode={}, transactionNo={}",
                txnRef, responseCode, transactionNo);

        if (txnRef == null || txnRef.isBlank()) {
            return null;
        }

        UUID orderId;
        try {
            orderId = UUID.fromString(txnRef);
        } catch (Exception e) {
            log.warn("Invalid VNPay txnRef format: {}", txnRef);
            return null;
        }

        Order order = orderRepository.findById(OrderId.of(orderId)).orElse(null);
        if (order == null) {
            log.warn("VNPay callback: Order not found for id {}", orderId);
            return null;
        }

        // ResponseCode "00" indicates success in VNPay
        if ("00".equals(responseCode) && ("00".equals(transactionStatus) || transactionStatus == null)) {
            order.markAsPaid(transactionNo, "Cổng VNPay", "VNPay IPN");
            Order savedOrder = orderRepository.save(order);

            OrderJpaEntity entity = orderJpaRepository.findById(orderId).orElse(null);
            if (entity != null) {
                PaymentJpaEntity payment = new PaymentJpaEntity(
                        entity,
                        PaymentMethod.VNPAY.name(),
                        PaymentStatus.PAID.name(),
                        order.getTotalAmount(),
                        transactionNo,
                        order.getPaymentCode(),
                        "VNPay transNo: " + transactionNo + " | bankCode: " + params.get("vnp_BankCode"),
                        Instant.now()
                );
                paymentJpaRepository.save(payment);
            }

            return orderDtoMapper.toResponse(savedOrder);
        } else {
            log.warn("VNPay payment failed with responseCode: {}", responseCode);
            order.addTimeline(OrderTimeline.create(
                    order.getId(),
                    order.getStatus().name(),
                    "Thanh toán VNPay không thành công",
                    "Giao dịch VNPay thất bại hoặc bị hủy bởi khách hàng (Mã lỗi: " + responseCode + ")",
                    "VNPay IPN"
            ));
            Order saved = orderRepository.save(order);
            return orderDtoMapper.toResponse(saved);
        }
    }

    /**
     * Admin manual confirmation of payment (e.g. for direct bank transfer).
     */
    @Transactional
    public OrderResponse markPaymentManually(UUID orderId, String note, String actor) {
        Order order = orderRepository.findById(OrderId.of(orderId))
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy đơn hàng: " + orderId));

        order.markAsPaid(note != null ? note : "ADMIN_CONFIRM", order.getPaymentMethod().name(), actor);
        Order saved = orderRepository.save(order);

        OrderJpaEntity entity = orderJpaRepository.findById(orderId).orElse(null);
        if (entity != null) {
            PaymentJpaEntity payment = new PaymentJpaEntity(
                    entity,
                    order.getPaymentMethod().name(),
                    PaymentStatus.PAID.name(),
                    order.getTotalAmount(),
                    note != null ? note : "MANUAL",
                    order.getPaymentCode(),
                    "Xác nhận thanh toán thủ công bởi: " + actor,
                    Instant.now()
            );
            paymentJpaRepository.save(payment);
        }

        return orderDtoMapper.toResponse(saved);
    }
}
