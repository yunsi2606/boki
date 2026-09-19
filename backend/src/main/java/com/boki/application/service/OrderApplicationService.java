package com.boki.application.service;

import com.boki.application.dto.request.CalculateFeeRequest;
import com.boki.application.dto.request.CalculatePricingRequest;
import com.boki.application.dto.request.CreateOrderRequest;
import com.boki.application.dto.request.OrderItemRequest;
import com.boki.application.dto.request.PushShippingRequest;
import com.boki.application.dto.request.UpdateShippingInfoRequest;
import com.boki.application.dto.response.CarrierFeeEstimateResponse;
import com.boki.application.dto.response.OrderResponse;
import com.boki.application.dto.response.OrderTimelineResponse;
import com.boki.application.dto.response.PricingResponse;
import com.boki.application.dto.response.PrintWaybillResponse;
import com.boki.application.exception.BusinessRuleException;
import com.boki.application.exception.ResourceNotFoundException;
import com.boki.application.mapper.OrderDtoMapper;
import com.boki.application.port.in.AdminManageOrderUseCase;
import com.boki.application.port.in.CreateOrderUseCase;
import com.boki.application.port.in.GetOrderUseCase;
import com.boki.domain.model.book.Book;
import com.boki.domain.model.book.BookId;
import com.boki.domain.model.order.*;
import com.boki.domain.model.user.Email;
import com.boki.domain.model.user.User;
import com.boki.domain.model.user.UserId;
import com.boki.domain.port.out.BookRepository;
import com.boki.domain.port.out.OrderRepository;
import com.boki.domain.port.out.UserRepository;
import com.boki.infrastructure.persistence.repository.BookVariantJpaRepository;
import com.boki.infrastructure.persistence.entity.BookVariantJpaEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class OrderApplicationService implements CreateOrderUseCase, GetOrderUseCase, AdminManageOrderUseCase {

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(OrderApplicationService.class);

    private final OrderRepository orderRepository;
    private final BookRepository bookRepository;
    private final UserRepository userRepository;
    private final BookVariantJpaRepository variantRepository;
    private final ShippingCarrierService shippingCarrierService;
    private final OrderDtoMapper orderDtoMapper;
    private final FraudDetectionService fraudDetectionService;
    private final AutopilotOrderService autopilotOrderService;
    private final ServerPricingService serverPricingService;
    private final MemberTierService memberTierService;

    public OrderApplicationService(
            OrderRepository orderRepository,
            BookRepository bookRepository,
            UserRepository userRepository,
            BookVariantJpaRepository variantRepository,
            ShippingCarrierService shippingCarrierService,
            OrderDtoMapper orderDtoMapper,
            FraudDetectionService fraudDetectionService,
            AutopilotOrderService autopilotOrderService,
            ServerPricingService serverPricingService,
            MemberTierService memberTierService
    ) {
        this.orderRepository = orderRepository;
        this.bookRepository = bookRepository;
        this.userRepository = userRepository;
        this.variantRepository = variantRepository;
        this.shippingCarrierService = shippingCarrierService;
        this.orderDtoMapper = orderDtoMapper;
        this.fraudDetectionService = fraudDetectionService;
        this.autopilotOrderService = autopilotOrderService;
        this.serverPricingService = serverPricingService;
        this.memberTierService = memberTierService;
    }

    @Override
    @Transactional
    public OrderResponse createOrder(CreateOrderRequest request, String buyerEmail) {
        boolean isGuest = Boolean.TRUE.equals(request.isGuest()) || buyerEmail == null || buyerEmail.isBlank();
        UserId buyerUserId;

        if (isGuest) {
            buyerUserId = UserId.of(UUID.fromString("00000000-0000-0000-0000-000000000001"));
        } else {
            User buyer = userRepository.findByEmail(Email.of(buyerEmail))
                    .orElseThrow(() -> new ResourceNotFoundException("User", "email", buyerEmail));

            if (!buyer.isPhoneVerified()) {
                throw new BusinessRuleException("Số điện thoại của bạn chưa được xác thực. Vui lòng xác thực SĐT trước khi đặt hàng.");
            }
            buyerUserId = buyer.getId();
        }

        List<OrderItem> domainItems = new ArrayList<>();
        
        for (OrderItemRequest itemReq : request.items()) {
            Book book = bookRepository.findById(BookId.of(itemReq.bookId()))
                    .orElseThrow(() -> new ResourceNotFoundException("Book", "id", itemReq.bookId()));

            if (!book.isAvailableForPurchase()) {
                throw new BusinessRuleException("Sách '" + book.getTitle() + "' hiện không khả dụng để đặt mua (Hết hàng hoặc tạm ẩn).");
            }

            // Deduct variant stock if variantId is specified
            if (itemReq.variantId() != null) {
                BookVariantJpaEntity variant = variantRepository.findById(itemReq.variantId()).orElse(null);
                if (variant != null) {
                    if (variant.getStockQuantity() < itemReq.quantity()) {
                        throw new BusinessRuleException("Phân loại '" + variant.getName() + "' không đủ số lượng trong kho (Còn " + variant.getStockQuantity() + ")");
                    }
                    variant.setStockQuantity(variant.getStockQuantity() - itemReq.quantity());
                    variantRepository.save(variant);
                }
            }

            // Decrement parent book inventory
            book.decrementStock(itemReq.quantity());
            bookRepository.save(book);

            OrderItem domainItem = new OrderItem(
                    book.getId(),
                    itemReq.quantity(),
                    book.getPrice().amount()
            );
            domainItems.add(domainItem);
        }

        Order order = Order.create(
                buyerUserId,
                domainItems,
                request.shippingAddress(),
                "VND",
                com.boki.domain.model.order.PaymentMethod.fromString(request.paymentMethod())
        );

        if (isGuest) {
            order.markAsGuest(request.guestName(), request.guestPhone(), request.guestEmail());
        }

        // --- SERVER-AUTHORITATIVE PRICING & VOUCHER VERIFICATION ---
        ServerPricingService.ServerPricingResult pricing = serverPricingService.calculatePricing(
                request.items(),
                buyerUserId.value(),
                request.voucherCode(),
                order.getShippingFee()
        );

        order.applyServerPricing(
                pricing.subtotal(),
                pricing.memberTier().name(),
                pricing.memberDiscountAmount(),
                pricing.voucherCode(),
                pricing.voucherDiscountAmount()
        );

        if (pricing.voucherCode() != null && pricing.voucherDiscountAmount().compareTo(BigDecimal.ZERO) > 0) {
            serverPricingService.recordVoucherUsage(pricing.voucherCode());
        }

        if (!isGuest) {
            memberTierService.recordCompletedOrderSpend(buyerUserId.value(), pricing.finalTotal());
        }

        // --- FRAUD DETECTION & AUTOPILOT ENGINE ---
        FraudDetectionService.RiskAssessmentResult risk = fraudDetectionService.evaluateOrderRisk(order);
        order.applyRiskAssessment(risk.riskScore(), risk.riskLevel(), risk.riskReasonsJson(), risk.isFlagged());
        autopilotOrderService.processAutopilotDecision(order, risk);

        Order savedOrder = orderRepository.save(order);
        return orderDtoMapper.toResponse(savedOrder);
    }

    @Override
    @Transactional(readOnly = true)
    public PricingResponse calculatePricing(CalculatePricingRequest request, String buyerEmail) {
        UUID buyerUserId = UUID.fromString("00000000-0000-0000-0000-000000000001");
        if (buyerEmail != null && !buyerEmail.isBlank()) {
            java.util.Optional<User> buyerOpt = userRepository.findByEmail(Email.of(buyerEmail));
            if (buyerOpt.isPresent()) {
                buyerUserId = buyerOpt.get().getId().value();
            }
        }

        ServerPricingService.ServerPricingResult res = serverPricingService.calculatePricing(
                request.items(),
                buyerUserId,
                request.voucherCode(),
                request.shippingFee()
        );

        return new PricingResponse(
                res.subtotal(),
                res.memberTier().name(),
                res.memberDiscountPercent(),
                res.memberDiscountAmount(),
                res.voucherCode(),
                res.voucherDiscountAmount(),
                res.shippingFee(),
                res.finalTotal(),
                res.pricingMessage()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponse getOrder(UUID orderId, String email) {
        User user = userRepository.findByEmail(Email.of(email))
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));

        Order order = orderRepository.findById(OrderId.of(orderId))
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        if (!order.getBuyerId().equals(user.getId())) {
            throw new BusinessRuleException("Bạn không có quyền xem chi tiết đơn hàng này.");
        }

        return orderDtoMapper.toResponse(order);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponse> getBuyerOrders(String buyerEmail) {
        User buyer = userRepository.findByEmail(Email.of(buyerEmail))
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", buyerEmail));

        return orderRepository.findByBuyerId(buyer.getId())
                .stream()
                .map(orderDtoMapper::toResponse)
                .collect(Collectors.toList());
    }

    // =========================================================================
    // Admin Order Management & Strict State Machine Operations
    // =========================================================================

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponse> getAllOrdersForAdmin(OrderStatus status, String search, int page, int size) {
        return orderRepository.searchOrders(status, search, page, size)
                .stream()
                .map(orderDtoMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public OrderResponse updateOrderStatus(UUID orderId, OrderStatus newStatus, String reason, String actor) {
        Order order = orderRepository.findById(OrderId.of(orderId))
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        if (newStatus == OrderStatus.CANCELLED) {
            return cancelOrder(orderId, reason != null ? reason : "Admin hủy đơn", actor != null ? actor : "Admin");
        }

        switch (newStatus) {
            case CONFIRMED -> order.confirm(actor != null ? actor : "Admin");
            case DELIVERED -> order.deliver(actor != null ? actor : "Admin");
            case RETURNED -> order.markReturned(reason != null ? reason : "Giao hàng thất bại / Hoàn trả", actor != null ? actor : "Admin");
            case SHIPPED -> {
                // If transitioning to SHIPPED directly, check if carrier info is present
                if (order.getCarrierName() == null || order.getTrackingNumber() == null) {
                    // Auto-assign default carrier if not set
                    String tracking = shippingCarrierService.generateTrackingNumber(ShippingCarrier.OTHER);
                    BigDecimal fee = shippingCarrierService.calculateShippingFee(ShippingCarrier.OTHER, order.getWeightGrams());
                    Instant est = shippingCarrierService.calculateEstimatedDelivery(ShippingCarrier.OTHER);
                    order.shipWithCarrier("Boki Express", tracking, fee, est, order.getWeightGrams(), actor != null ? actor : "Admin");
                } else {
                    order.shipWithCarrier(order.getCarrierName(), order.getTrackingNumber(), order.getShippingFee(), order.getEstimatedDelivery(), order.getWeightGrams(), actor != null ? actor : "Admin");
                }
            }
            default -> throw new IllegalArgumentException("Không thể chuyển đổi thủ công sang trạng thái: " + newStatus);
        }

        Order saved = orderRepository.save(order);
        return orderDtoMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public OrderResponse pushOrderToCarrier(UUID orderId, PushShippingRequest request, String actor) {
        Order order = orderRepository.findById(OrderId.of(orderId))
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        // Auto-confirm if pending
        if (order.getStatus() == OrderStatus.PENDING) {
            order.confirm(actor != null ? actor : "Admin");
        }

        // Call the official carrier gateway (Real Sandbox HTTP / Production / Manual)
        com.boki.application.dto.response.ShippingPushResult pushResult = shippingCarrierService.pushOrderToGateway(order, request);

        int weight = (request.weightGrams() != null && request.weightGrams() > 0) ? request.weightGrams() : 500;

        order.shipWithCarrier(
                request.carrier().getDisplayName(),
                pushResult.trackingNumber(),
                pushResult.fee(),
                pushResult.estimatedDelivery(),
                weight,
                actor != null ? actor : "Admin"
        );

        if (pushResult.notes() != null && !pushResult.notes().isBlank()) {
            order.addTimeline(OrderTimeline.create(
                    order.getId(),
                    OrderStatus.SHIPPED.name(),
                    "Cổng vận chuyển " + request.carrier().name(),
                    pushResult.notes(),
                    actor != null ? actor : "Admin"
            ));
        }

        if (request.notes() != null && !request.notes().isBlank()) {
            order.addTimeline(OrderTimeline.create(
                    order.getId(),
                    OrderStatus.SHIPPED.name(),
                    "Ghi chú giao hàng",
                    request.notes().trim(),
                    actor != null ? actor : "Admin"
            ));
        }

        Order saved = orderRepository.save(order);
        return orderDtoMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public OrderResponse cancelOrder(UUID orderId, String reason, String actor) {
        Order order = orderRepository.findById(OrderId.of(orderId))
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        if (order.getStatus() == OrderStatus.DELIVERED) {
            throw new BusinessRuleException("Không thể hủy đơn hàng đã giao thành công (DELIVERED).");
        }
        if (order.getStatus() == OrderStatus.CANCELLED) {
            throw new BusinessRuleException("Đơn hàng này đã được hủy trước đó.");
        }

        // --- AUTOMATIC INVENTORY RESTOCK ---
        for (OrderItem item : order.getItems()) {
            bookRepository.findById(item.bookId()).ifPresent(book -> {
                book.updateStockQuantity(book.getStockQuantity() + item.quantity());
                bookRepository.save(book);
            });
        }

        order.cancelWithReason(reason != null ? reason : "Admin hủy đơn", actor != null ? actor : "Admin");
        Order saved = orderRepository.save(order);
        return orderDtoMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderTimelineResponse> getOrderTimelines(UUID orderId) {
        Order order = orderRepository.findById(OrderId.of(orderId))
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        return order.getTimelines().stream()
                .map(tl -> new OrderTimelineResponse(
                        tl.getId(),
                        tl.getStatus(),
                        tl.getTitle(),
                        tl.getDescription(),
                        tl.getActor(),
                        tl.getCreatedAt()
                ))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public PrintWaybillResponse getPrintWaybillUrl(UUID orderId, String paperSize) {
        Order order = orderRepository.findById(OrderId.of(orderId))
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        if (order.getTrackingNumber() == null || order.getTrackingNumber().isBlank()) {
            throw new BusinessRuleException("Đơn hàng này chưa có mã vận đơn. Vui lòng bàn giao cho ĐVVC trước khi in.");
        }

        ShippingCarrier carrier = ShippingCarrier.fromDisplayName(order.getCarrierName());
        return shippingCarrierService.generatePrintWaybillUrl(carrier, order.getTrackingNumber(), paperSize);
    }

    @Override
    @Transactional
    public OrderResponse cancelOrderWithCarrier(UUID orderId, String reason, String actor) {
        Order order = orderRepository.findById(OrderId.of(orderId))
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        if (order.getCarrierName() != null && order.getTrackingNumber() != null) {
            ShippingCarrier carrier = ShippingCarrier.fromDisplayName(order.getCarrierName());
            shippingCarrierService.cancelCarrierOrder(carrier, order.getTrackingNumber(), reason);
        }

        return cancelOrder(orderId, reason != null ? reason : "Admin hủy đơn và đồng bộ ĐVVC", actor);
    }

    @Override
    @Transactional
    public OrderResponse returnOrderWithCarrier(UUID orderId, String reason, String actor) {
        Order order = orderRepository.findById(OrderId.of(orderId))
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        if (order.getCarrierName() != null && order.getTrackingNumber() != null) {
            ShippingCarrier carrier = ShippingCarrier.fromDisplayName(order.getCarrierName());
            shippingCarrierService.returnCarrierOrder(carrier, order.getTrackingNumber());
        }

        order.markReturned(reason != null ? reason : "Yêu cầu chuyển hoàn từ người bán / ĐVVC", actor != null ? actor : "Admin");
        Order saved = orderRepository.save(order);
        return orderDtoMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public OrderResponse updateOrderCod(UUID orderId, BigDecimal newCod, String actor) {
        Order order = orderRepository.findById(OrderId.of(orderId))
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        if (newCod == null || newCod.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Số tiền COD không hợp lệ");
        }

        if (order.getCarrierName() != null && order.getTrackingNumber() != null) {
            ShippingCarrier carrier = ShippingCarrier.fromDisplayName(order.getCarrierName());
            shippingCarrierService.updateOrderCod(carrier, order.getTrackingNumber(), newCod.longValue());
        }

        order.updateCodAmount(newCod, actor != null ? actor : "Admin");
        Order saved = orderRepository.save(order);
        return orderDtoMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public OrderResponse updateOrderShippingInfo(UUID orderId, UpdateShippingInfoRequest request, String actor) {
        Order order = orderRepository.findById(OrderId.of(orderId))
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        if (order.getCarrierName() != null && order.getTrackingNumber() != null) {
            ShippingCarrier carrier = ShippingCarrier.fromDisplayName(order.getCarrierName());
            shippingCarrierService.updateShippingInfo(carrier, order.getTrackingNumber(), request);
        }

        String fullAddress = request.toAddress();
        if (request.toName() != null && request.toPhone() != null) {
            fullAddress = request.toName() + " | SĐT: " + request.toPhone() + " | " + (request.toAddress() != null ? request.toAddress() : "");
        }

        order.updateShippingDetails(fullAddress, request.weightGrams(), actor != null ? actor : "Admin");
        if (request.notes() != null && !request.notes().isBlank()) {
            order.addTimeline(OrderTimeline.create(
                    order.getId(),
                    order.getStatus().name(),
                    "Ghi chú giao hàng mới",
                    request.notes().trim(),
                    actor != null ? actor : "Admin"
            ));
        }

        Order saved = orderRepository.save(order);
        return orderDtoMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public CarrierFeeEstimateResponse estimateCarrierFee(CalculateFeeRequest request) {
        return shippingCarrierService.estimateCarrierFeeAndLeadtime(request);
    }

    @Override
    @Transactional
    public OrderResponse processCarrierWebhook(com.boki.application.dto.request.GhnWebhookPayload payload) {
        if (payload == null) {
            throw new IllegalArgumentException("Payload webhook không được để trống.");
        }

        String tracking = payload.orderCode();
        String clientOrderCode = payload.clientOrderCode();

        log.info("Processing GHN Webhook callback: OrderCode={}, ClientOrderCode={}, Type={}, Status={}",
                tracking, clientOrderCode, payload.type(), payload.status());

        Order order = null;
        if (tracking != null && !tracking.isBlank()) {
            order = orderRepository.findByTrackingNumber(tracking.trim()).orElse(null);
        }

        if (order == null && clientOrderCode != null && !clientOrderCode.isBlank()) {
            try {
                String clean = clientOrderCode.trim().replace("#", "");
                if (clean.length() >= 36) {
                    order = orderRepository.findById(OrderId.of(UUID.fromString(clean.substring(0, 36)))).orElse(null);
                }
            } catch (Exception ignored) {}
        }

        if (order == null) {
            log.warn("No order found in Boki matching GHN callback: OrderCode={}, ClientOrderCode={}", tracking, clientOrderCode);
            return null;
        }

        BigDecimal fee = payload.totalFee() != null && payload.totalFee() > 0 ? BigDecimal.valueOf(payload.totalFee()) : null;
        BigDecimal cod = payload.codAmount() != null && payload.codAmount() >= 0 ? BigDecimal.valueOf(payload.codAmount()) : null;

        order.handleCarrierWebhook(
                payload.status(),
                payload.type(),
                payload.description(),
                fee,
                cod,
                payload.shipperName(),
                payload.shipperPhone(),
                payload.podUrl(),
                payload.reason()
        );

        Order saved = orderRepository.save(order);
        log.info("Order {} updated via GHN webhook -> Status={}, CarrierStatus={}", saved.getId().value(), saved.getStatus(), saved.getCarrierStatus());
        return orderDtoMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public OrderResponse dismissFraudFlag(UUID orderId, String reason, String actor) {
        Order order = orderRepository.findById(OrderId.of(orderId))
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        order.dismissFlag(actor != null ? actor : "Admin", reason);

        // If order was held in PENDING due to fraud flag, automatically confirm it upon manual dismissal
        if (order.getStatus() == OrderStatus.PENDING) {
            order.confirm(actor != null ? actor : "Admin");
        }

        Order saved = orderRepository.save(order);
        log.info("Fraud flag dismissed for order #{}: new status={}", order.getPaymentCode(), saved.getStatus());
        return orderDtoMapper.toResponse(saved);
    }
}
