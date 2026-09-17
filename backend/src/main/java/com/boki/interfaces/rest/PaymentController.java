package com.boki.interfaces.rest;

import com.boki.application.dto.payment.CreatePaymentRequest;
import com.boki.application.dto.payment.PaymentInitResponse;
import com.boki.application.dto.payment.PaymentStatusResponse;
import com.boki.application.dto.response.OrderResponse;
import com.boki.application.service.PaymentApplicationService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentApplicationService paymentApplicationService;

    public PaymentController(PaymentApplicationService paymentApplicationService) {
        this.paymentApplicationService = paymentApplicationService;
    }

    /**
     * Initiates payment for an order and returns payment URLs or VietQR payload.
     */
    @PostMapping("/create")
    public ResponseEntity<PaymentInitResponse> createPayment(
            @Valid @RequestBody CreatePaymentRequest request,
            HttpServletRequest servletRequest
    ) {
        String clientIp = servletRequest.getRemoteAddr();
        String origin = servletRequest.getHeader("Origin");
        if (origin == null || origin.isBlank()) {
            origin = "http://localhost:3000";
        }

        PaymentInitResponse response = paymentApplicationService.initiatePayment(request, clientIp, origin);
        return ResponseEntity.ok(response);
    }

    /**
     * Checks current payment status of an order for live polling.
     */
    @GetMapping("/order/{orderId}/status")
    public ResponseEntity<PaymentStatusResponse> getPaymentStatus(@PathVariable UUID orderId) {
        PaymentStatusResponse response = paymentApplicationService.getPaymentStatus(orderId);
        return ResponseEntity.ok(response);
    }

    /**
     * Optional backend endpoint to verify and process VNPay return query parameters.
     */
    @GetMapping("/vnpay/return")
    public ResponseEntity<OrderResponse> handleVNPayReturn(@RequestParam Map<String, String> allParams) {
        OrderResponse updated = paymentApplicationService.processVNPayCallback(allParams);
        return ResponseEntity.ok(updated);
    }
}
