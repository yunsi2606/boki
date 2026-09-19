package com.boki.interfaces.rest;

import com.boki.application.dto.request.CancelOrderRequest;
import com.boki.application.dto.request.PushShippingRequest;
import com.boki.application.dto.request.UpdateOrderStatusRequest;
import com.boki.application.dto.response.OrderResponse;
import com.boki.application.dto.response.OrderTimelineResponse;
import com.boki.application.port.in.AdminManageOrderUseCase;
import com.boki.domain.model.order.OrderStatus;
import com.boki.infrastructure.security.AuthenticatedUser;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/orders")
public class AdminOrderController {

    private final AdminManageOrderUseCase adminManageOrderUseCase;
    private final com.boki.application.service.PaymentApplicationService paymentApplicationService;
    private final com.boki.application.service.FraudAlertStreamService fraudAlertStreamService;

    public AdminOrderController(
            AdminManageOrderUseCase adminManageOrderUseCase,
            com.boki.application.service.PaymentApplicationService paymentApplicationService,
            com.boki.application.service.FraudAlertStreamService fraudAlertStreamService
    ) {
        this.adminManageOrderUseCase = adminManageOrderUseCase;
        this.paymentApplicationService = paymentApplicationService;
        this.fraudAlertStreamService = fraudAlertStreamService;
    }

    @GetMapping
    public ResponseEntity<List<OrderResponse>> getAllOrders(
            @RequestParam(required = false) OrderStatus status,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "100") int size
    ) {
        List<OrderResponse> orders = adminManageOrderUseCase.getAllOrdersForAdmin(status, search, page, size);
        return ResponseEntity.ok(orders);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<OrderResponse> updateOrderStatus(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateOrderStatusRequest request,
            @AuthenticationPrincipal AuthenticatedUser principal
    ) {
        String actor = principal != null ? principal.email() : "Admin";
        OrderResponse updated = adminManageOrderUseCase.updateOrderStatus(id, request.status(), request.reason(), actor);
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/{id}/ship")
    public ResponseEntity<OrderResponse> pushOrderToCarrier(
            @PathVariable UUID id,
            @Valid @RequestBody PushShippingRequest request,
            @AuthenticationPrincipal AuthenticatedUser principal
    ) {
        String actor = principal != null ? principal.email() : "Admin";
        OrderResponse shipped = adminManageOrderUseCase.pushOrderToCarrier(id, request, actor);
        return ResponseEntity.ok(shipped);
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<OrderResponse> cancelOrder(
            @PathVariable UUID id,
            @Valid @RequestBody CancelOrderRequest request,
            @AuthenticationPrincipal AuthenticatedUser principal
    ) {
        String actor = principal != null ? principal.email() : "Admin";
        OrderResponse cancelled = adminManageOrderUseCase.cancelOrder(id, request.reason(), actor);
        return ResponseEntity.ok(cancelled);
    }

    @GetMapping("/{id}/timeline")
    public ResponseEntity<List<OrderTimelineResponse>> getOrderTimeline(@PathVariable UUID id) {
        List<OrderTimelineResponse> timelines = adminManageOrderUseCase.getOrderTimelines(id);
        return ResponseEntity.ok(timelines);
    }

    @GetMapping("/{id}/print-url")
    public ResponseEntity<com.boki.application.dto.response.PrintWaybillResponse> getPrintWaybillUrl(
            @PathVariable UUID id,
            @RequestParam(defaultValue = "A5") String size
    ) {
        com.boki.application.dto.response.PrintWaybillResponse res = adminManageOrderUseCase.getPrintWaybillUrl(id, size);
        return ResponseEntity.ok(res);
    }

    @PostMapping("/{id}/carrier-cancel")
    public ResponseEntity<OrderResponse> cancelOrderWithCarrier(
            @PathVariable UUID id,
            @Valid @RequestBody CancelOrderRequest request,
            @AuthenticationPrincipal AuthenticatedUser principal
    ) {
        String actor = principal != null ? principal.email() : "Admin";
        OrderResponse res = adminManageOrderUseCase.cancelOrderWithCarrier(id, request.reason(), actor);
        return ResponseEntity.ok(res);
    }

    @PostMapping("/{id}/carrier-return")
    public ResponseEntity<OrderResponse> returnOrderWithCarrier(
            @PathVariable UUID id,
            @RequestParam(required = false, defaultValue = "Khách không nhận hàng / Yêu cầu chuyển hoàn") String reason,
            @AuthenticationPrincipal AuthenticatedUser principal
    ) {
        String actor = principal != null ? principal.email() : "Admin";
        OrderResponse res = adminManageOrderUseCase.returnOrderWithCarrier(id, reason, actor);
        return ResponseEntity.ok(res);
    }

    @PatchMapping("/{id}/cod")
    public ResponseEntity<OrderResponse> updateOrderCod(
            @PathVariable UUID id,
            @Valid @RequestBody com.boki.application.dto.request.UpdateOrderCodRequest request,
            @AuthenticationPrincipal AuthenticatedUser principal
    ) {
        String actor = principal != null ? principal.email() : "Admin";
        OrderResponse res = adminManageOrderUseCase.updateOrderCod(id, request.codAmount(), actor);
        return ResponseEntity.ok(res);
    }

    @PutMapping("/{id}/shipping-info")
    public ResponseEntity<OrderResponse> updateOrderShippingInfo(
            @PathVariable UUID id,
            @Valid @RequestBody com.boki.application.dto.request.UpdateShippingInfoRequest request,
            @AuthenticationPrincipal AuthenticatedUser principal
    ) {
        String actor = principal != null ? principal.email() : "Admin";
        OrderResponse res = adminManageOrderUseCase.updateOrderShippingInfo(id, request, actor);
        return ResponseEntity.ok(res);
    }

    @PostMapping("/calculate-fee")
    public ResponseEntity<com.boki.application.dto.response.CarrierFeeEstimateResponse> estimateCarrierFee(
            @Valid @RequestBody com.boki.application.dto.request.CalculateFeeRequest request
    ) {
        com.boki.application.dto.response.CarrierFeeEstimateResponse res = adminManageOrderUseCase.estimateCarrierFee(request);
        return ResponseEntity.ok(res);
    }

    @PostMapping("/simulate-webhook")
    public ResponseEntity<OrderResponse> simulateCarrierWebhook(
            @RequestBody com.boki.application.dto.request.GhnWebhookPayload payload
    ) {
        OrderResponse res = adminManageOrderUseCase.processCarrierWebhook(payload);
        return ResponseEntity.ok(res);
    }

    @PatchMapping("/{id}/payment")
    public ResponseEntity<OrderResponse> markOrderPaidManually(
            @PathVariable UUID id,
            @RequestBody(required = false) Map<String, String> body,
            @AuthenticationPrincipal AuthenticatedUser principal
    ) {
        String actor = principal != null ? principal.email() : "Admin";
        String note = (body != null && body.containsKey("note")) ? body.get("note") : "Xác nhận thủ công bởi Quản trị viên";
        OrderResponse updated = paymentApplicationService.markPaymentManually(id, note, actor);
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/simulate-sepay")
    public ResponseEntity<Map<String, Object>> simulateSePayWebhook(
            @RequestBody com.boki.application.dto.payment.SePayWebhookPayload payload
    ) {
        OrderResponse updated = paymentApplicationService.processSePayWebhook(payload, null);
        return ResponseEntity.ok(Map.of(
                "success", updated != null,
                "orderId", updated != null ? updated.id().toString() : "",
                "paymentStatus", updated != null ? updated.paymentStatus() : ""
        ));
    }

    // =========================================================================
    // Real-time Fraud Detection & Voice Alert Endpoints
    // =========================================================================

    @GetMapping(value = "/alerts/stream", produces = org.springframework.http.MediaType.TEXT_EVENT_STREAM_VALUE)
    public org.springframework.web.servlet.mvc.method.annotation.SseEmitter streamFraudAlerts() {
        return fraudAlertStreamService.createEmitter();
    }

    @GetMapping("/alerts")
    public ResponseEntity<List<com.boki.application.service.FraudAlertStreamService.FraudAlertEvent>> getRecentFraudAlerts() {
        return ResponseEntity.ok(fraudAlertStreamService.getRecentAlerts());
    }

    @PostMapping("/{id}/dismiss-flag")
    public ResponseEntity<OrderResponse> dismissFraudFlag(
            @PathVariable UUID id,
            @RequestBody(required = false) Map<String, String> body,
            @AuthenticationPrincipal AuthenticatedUser principal
    ) {
        String actor = principal != null ? principal.email() : "Admin";
        String reason = (body != null && body.containsKey("reason"))
                ? body.get("reason")
                : "Quản trị viên đã kiểm tra thông tin và phê duyệt gỡ cờ rủi ro";
        OrderResponse updated = adminManageOrderUseCase.dismissFraudFlag(id, reason, actor);
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/simulate-fraud")
    public ResponseEntity<com.boki.application.service.FraudAlertStreamService.FraudAlertEvent> simulateFraudOrder(
            @RequestBody(required = false) Map<String, Object> body
    ) {
        BigDecimal amount = new BigDecimal("2850000");
        String customer = "Khách vãng lai (Nguyễn Văn Hùng)";
        String phone = "0988889999";
        if (body != null) {
            if (body.get("amount") != null) {
                try {
                    amount = new BigDecimal(body.get("amount").toString());
                } catch (Exception ignored) {}
            }
            if (body.get("customerName") != null) {
                customer = body.get("customerName").toString();
            }
            if (body.get("customerPhone") != null) {
                phone = body.get("customerPhone").toString();
            }
        }

        UUID fakeOrderId = UUID.randomUUID();
        String fakeCode = "BOKI" + fakeOrderId.toString().substring(0, 8).toUpperCase();
        java.text.DecimalFormat df = new java.text.DecimalFormat("#,###");
        String voiceMsg = String.format("Cảnh báo: Phát hiện đơn hàng khả nghi có rủi ro cao từ tài khoản vãng lai! Tổng giá trị %s đồng. Hệ thống Autopilot đã tạm giữ đơn, yêu cầu kiểm tra thủ công!",
                df.format(amount));

        com.boki.application.service.FraudAlertStreamService.FraudAlertEvent event =
                new com.boki.application.service.FraudAlertStreamService.FraudAlertEvent(
                        fakeOrderId,
                        fakeCode,
                        customer,
                        phone,
                        true,
                        amount,
                        85,
                        "SUSPICIOUS",
                        List.of(
                                "Tài khoản vãng lai (Guest) đột ngột đặt đơn giá trị cao (" + df.format(amount) + "đ, vượt ngưỡng an toàn 1.500.000đ)",
                                "Phương thức thanh toán COD giá trị cao, tiềm ẩn rủi ro boom hàng",
                                "Số lượng sách đặt bất thường (Tổng 12 cuốn, dấu hiệu mua gom hoặc đầu cơ)"
                        ),
                        java.time.Instant.now(),
                        voiceMsg
                );

        fraudAlertStreamService.broadcastAlert(event);
        return ResponseEntity.ok(event);
    }
}
