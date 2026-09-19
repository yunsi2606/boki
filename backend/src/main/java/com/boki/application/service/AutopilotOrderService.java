package com.boki.application.service;

import com.boki.domain.model.order.Order;
import com.boki.domain.model.order.OrderStatus;
import com.boki.domain.model.order.OrderTimeline;
import com.boki.infrastructure.persistence.repository.StoreConfigJpaRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.text.DecimalFormat;
import java.time.Instant;

/**
 * Autopilot engine for order confirmation:
 * - Automatically confirms safe orders.
 * - Freezes and isolates suspicious / flagged orders for manual admin inspection.
 * - Emits real-time voice alerts when high-risk transactions are detected.
 */
@Service
public class AutopilotOrderService {

    private static final Logger log = LoggerFactory.getLogger(AutopilotOrderService.class);
    private static final DecimalFormat VND_FORMAT = new DecimalFormat("#,###");

    private final StoreConfigJpaRepository storeConfigRepository;
    private final FraudAlertStreamService alertStreamService;

    public AutopilotOrderService(
            StoreConfigJpaRepository storeConfigRepository,
            FraudAlertStreamService alertStreamService
    ) {
        this.storeConfigRepository = storeConfigRepository;
        this.alertStreamService = alertStreamService;
    }

    public void processAutopilotDecision(Order order, FraudDetectionService.RiskAssessmentResult risk) {
        if (order == null || risk == null) {
            return;
        }

        boolean autopilotEnabled = isAutopilotEnabled();
        String orderCode = order.getPaymentCode() != null ? order.getPaymentCode() : order.getId().value().toString().substring(0, 8).toUpperCase();
        String customerName = order.getGuestName() != null ? order.getGuestName() : (order.getIsGuest() ? "Khách vãng lai" : "Khách hàng");
        String customerPhone = order.getGuestPhone() != null ? order.getGuestPhone() : "---";

        if (risk.isFlagged()) {
            // STOP AUTOPILOT - HOLD & ISOLATE ORDER
            log.warn("Autopilot HOLDING order #{}: score={}, reasons={}", orderCode, risk.riskScore(), risk.reasons());

            order.addTimeline(OrderTimeline.create(
                    order.getId(),
                    order.getStatus().name(),
                    "🚨 Autopilot: Tạm dừng duyệt - Khoanh vùng đơn hàng bất thường",
                    String.format("Phát hiện rủi ro cao (Điểm rủi ro: %d/100 - %s). Yếu tố vi phạm: %s. Đơn hàng được giữ lại để Quản trị viên kiểm tra thủ công.",
                            risk.riskScore(), risk.riskLevel(), String.join("; ", risk.reasons())),
                    "Fraud Detection AI"
            ));

            // Generate Vietnamese Voice Alert Text
            String customerDesc = Boolean.TRUE.equals(order.getIsGuest()) ? "tài khoản vãng lai" : "khách hàng";
            String amountStr = order.getTotalAmount() != null ? VND_FORMAT.format(order.getTotalAmount()) : "0";
            String voiceMessage = String.format("Cảnh báo: Phát hiện đơn hàng khả nghi có rủi ro cao từ %s! Tổng giá trị %s đồng. Hệ thống Autopilot đã tạm giữ đơn, yêu cầu kiểm tra thủ công!",
                    customerDesc, amountStr);

            // Broadcast real-time alert event with voice message to Admin Dashboard
            alertStreamService.broadcastAlert(new FraudAlertStreamService.FraudAlertEvent(
                    order.getId().value(),
                    orderCode,
                    customerName,
                    customerPhone,
                    Boolean.TRUE.equals(order.getIsGuest()),
                    order.getTotalAmount(),
                    risk.riskScore(),
                    risk.riskLevel(),
                    risk.reasons(),
                    Instant.now(),
                    voiceMessage
            ));

        } else if (autopilotEnabled && order.getStatus() == OrderStatus.PENDING) {
            // SAFE ORDER - AUTO APPROVE
            log.info("Autopilot AUTO-APPROVING safe order #{}: score={}", orderCode, risk.riskScore());
            order.confirm("Autopilot AI");

            order.addTimeline(OrderTimeline.create(
                    order.getId(),
                    OrderStatus.CONFIRMED.name(),
                    "🤖 Autopilot: Tự động duyệt đơn hàng an toàn",
                    String.format("Đơn hàng đạt chỉ số an toàn (Điểm rủi ro: %d/100 - SAFE). Hệ thống Autopilot đã tự động xác nhận đơn để chuyển sang khâu đóng gói xuất kho.",
                            risk.riskScore()),
                    "Autopilot AI"
            ));
        }
    }

    private boolean isAutopilotEnabled() {
        return storeConfigRepository.findById("autopilot_enabled")
                .map(c -> !"false".equalsIgnoreCase(c.getConfigValue().trim()))
                .orElse(true);
    }
}
