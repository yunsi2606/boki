package com.boki.interfaces.rest;

import com.boki.application.dto.payment.MoMoWebhookPayload;
import com.boki.application.dto.payment.SePayWebhookPayload;
import com.boki.application.dto.request.GhnWebhookPayload;
import com.boki.application.dto.response.OrderResponse;
import com.boki.application.port.in.AdminManageOrderUseCase;
import com.boki.application.service.PaymentApplicationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/webhooks")
public class WebhookController {

    private static final Logger log = LoggerFactory.getLogger(WebhookController.class);

    private final AdminManageOrderUseCase adminManageOrderUseCase;
    private final PaymentApplicationService paymentApplicationService;

    public WebhookController(
            AdminManageOrderUseCase adminManageOrderUseCase,
            PaymentApplicationService paymentApplicationService
    ) {
        this.adminManageOrderUseCase = adminManageOrderUseCase;
        this.paymentApplicationService = paymentApplicationService;
    }

    /**
     * Official GHN Order Status Callback Webhook
     * Documentation: https://developer.ghn.vn/en/docs/webhook/callback-order-status
     * Direction: GHN -> Boki Server (POST JSON)
     */
    @PostMapping("/ghn")
    public ResponseEntity<Map<String, Object>> handleGhnWebhook(@RequestBody GhnWebhookPayload payload) {
        log.info("Received GHN Webhook POST: OrderCode={}, Status={}, Type={}, Description={}",
                payload.orderCode(), payload.status(), payload.type(), payload.description());

        try {
            OrderResponse updated = adminManageOrderUseCase.processCarrierWebhook(payload);
            if (updated != null) {
                return ResponseEntity.ok(Map.of(
                        "code", 200,
                        "message", "Order " + updated.id() + " status synchronized successfully",
                        "status", updated.status(),
                        "carrierStatus", updated.carrierStatus() != null ? updated.carrierStatus() : ""
                ));
            } else {
                return ResponseEntity.ok(Map.of(
                        "code", 200,
                        "message", "Webhook received. No matching order found for tracking code: " + payload.orderCode()
                ));
            }
        } catch (Exception e) {
            log.error("Error processing GHN webhook callback: {}", e.getMessage(), e);
            return ResponseEntity.ok(Map.of(
                    "code", 200,
                    "message", "Callback processed with notice: " + e.getMessage()
            ));
        }
    }

    /**
     * Official SePay Transaction Webhook
     * Documentation: https://developer.sepay.vn
     * Responds with HTTP 200/201 and {"success": true} within 30 seconds.
     */
    @PostMapping("/sepay")
    public ResponseEntity<Map<String, Object>> handleSePayWebhook(
            @RequestBody SePayWebhookPayload payload,
            @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        log.info("Received SePay Webhook POST: id={}, amount={}, content={}",
                payload.id(), payload.transferAmount(), payload.content());

        try {
            OrderResponse updated = paymentApplicationService.processSePayWebhook(payload, authHeader);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "orderId", updated != null ? updated.id().toString() : "",
                    "paymentStatus", updated != null ? updated.paymentStatus() : ""
            ));
        } catch (SecurityException se) {
            log.warn("SePay Webhook rejected unauthorized: {}", se.getMessage());
            return ResponseEntity.status(401).body(Map.of("success", false, "error", se.getMessage()));
        } catch (Exception e) {
            log.error("Error processing SePay Webhook: {}", e.getMessage(), e);
            return ResponseEntity.ok(Map.of("success", true, "message", e.getMessage()));
        }
    }

    /**
     * Official MoMo Payment Gateway IPN Webhook
     * Documentation: https://developers.momo.vn
     */
    @PostMapping("/momo")
    public ResponseEntity<Map<String, Object>> handleMoMoWebhook(@RequestBody MoMoWebhookPayload payload) {
        log.info("Received MoMo IPN POST: orderId={}, transId={}, resultCode={}",
                payload.orderId(), payload.transId(), payload.resultCode());

        try {
            OrderResponse updated = paymentApplicationService.processMoMoWebhook(payload);
            return ResponseEntity.ok(Map.of(
                    "resultCode", 0,
                    "message", "Received MoMo IPN successfully",
                    "orderId", updated != null ? updated.id().toString() : ""
            ));
        } catch (Exception e) {
            log.error("Error processing MoMo IPN callback: {}", e.getMessage(), e);
            return ResponseEntity.ok(Map.of("resultCode", 0, "message", "Callback handled"));
        }
    }

    /**
     * Official VNPay IPN Webhook (GET / POST)
     * Documentation: https://sandbox.vnpayment.vn/apis/docs/thanh-toan-pay/pay.html
     * Responds with {"RspCode": "00", "Message": "Confirm Success"}
     */
    @RequestMapping(value = "/vnpay", method = {RequestMethod.GET, RequestMethod.POST})
    public ResponseEntity<Map<String, String>> handleVNPayIpn(@RequestParam Map<String, String> allParams) {
        log.info("Received VNPay IPN: txnRef={}, responseCode={}",
                allParams.get("vnp_TxnRef"), allParams.get("vnp_ResponseCode"));

        try {
            paymentApplicationService.processVNPayCallback(allParams);
            return ResponseEntity.ok(Map.of(
                    "RspCode", "00",
                    "Message", "Confirm Success"
            ));
        } catch (Exception e) {
            log.error("Error processing VNPay IPN: {}", e.getMessage(), e);
            return ResponseEntity.ok(Map.of(
                    "RspCode", "99",
                    "Message", "Unknown error: " + e.getMessage()
            ));
        }
    }
}
