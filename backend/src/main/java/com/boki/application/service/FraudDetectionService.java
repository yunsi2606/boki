package com.boki.application.service;

import com.boki.domain.model.order.Order;
import com.boki.domain.model.order.OrderItem;
import com.boki.domain.model.order.PaymentMethod;
import com.boki.infrastructure.persistence.entity.OrderJpaEntity;
import com.boki.infrastructure.persistence.repository.OrderJpaRepository;
import com.boki.infrastructure.persistence.repository.StoreConfigJpaRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.text.DecimalFormat;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

/**
 * Evaluates order transaction risk in the background.
 * Detects guest high-value anomalies, COD risk, abnormal quantity, and velocity spikes.
 */
@Service
public class FraudDetectionService {

    private static final Logger log = LoggerFactory.getLogger(FraudDetectionService.class);
    private static final Pattern REPEATED_DIGITS = Pattern.compile("(\\d)\\1{5,}");
    private static final DecimalFormat VND_FORMAT = new DecimalFormat("#,###đ");

    private final StoreConfigJpaRepository storeConfigRepository;
    private final OrderJpaRepository orderJpaRepository;
    private final ObjectMapper objectMapper;

    public FraudDetectionService(
            StoreConfigJpaRepository storeConfigRepository,
            OrderJpaRepository orderJpaRepository,
            ObjectMapper objectMapper
    ) {
        this.storeConfigRepository = storeConfigRepository;
        this.orderJpaRepository = orderJpaRepository;
        this.objectMapper = objectMapper;
    }

    public record RiskAssessmentResult(
            int riskScore,
            String riskLevel,
            String riskReasonsJson,
            List<String> reasons,
            boolean isFlagged
    ) {}

    public RiskAssessmentResult evaluateOrderRisk(Order order) {
        if (order == null) {
            return new RiskAssessmentResult(0, "SAFE", "[]", List.of(), false);
        }

        BigDecimal guestMaxAmount = getDecimalConfig("fraud_guest_max_amount", new BigDecimal("1500000"));
        BigDecimal codMaxAmount = getDecimalConfig("fraud_cod_max_amount", new BigDecimal("2000000"));
        int riskThreshold = getIntConfig("fraud_risk_threshold", 60);

        int score = 0;
        List<String> reasons = new ArrayList<>();
        BigDecimal total = order.getTotalAmount() != null ? order.getTotalAmount() : BigDecimal.ZERO;

        // 1. Check Guest Account with High Value
        if (Boolean.TRUE.equals(order.getIsGuest())) {
            if (total.compareTo(guestMaxAmount) >= 0) {
                score += 50;
                reasons.add(String.format("Tài khoản vãng lai (Guest) đột ngột đặt đơn giá trị cao (%s, vượt ngưỡng an toàn %s)",
                        VND_FORMAT.format(total), VND_FORMAT.format(guestMaxAmount)));
            } else if (total.compareTo(guestMaxAmount.multiply(new BigDecimal("0.75"))) >= 0) {
                score += 25;
                reasons.add(String.format("Tài khoản vãng lai đặt đơn tiệm cận mức cảnh báo (%s)", VND_FORMAT.format(total)));
            }
        } else {
            // Check member with 0 completed orders
            try {
                long completed = orderJpaRepository.countByBuyerIdAndStatus(order.getBuyerId().value(), OrderJpaEntity.OrderStatusJpa.COMPLETED)
                        + orderJpaRepository.countByBuyerIdAndStatus(order.getBuyerId().value(), OrderJpaEntity.OrderStatusJpa.DELIVERED);
                if (completed == 0 && total.compareTo(new BigDecimal("1200000")) >= 0) {
                    score += 25;
                    reasons.add(String.format("Tài khoản thành viên mới chưa có lịch sử mua thành công đặt đơn giá trị lớn (%s)", VND_FORMAT.format(total)));
                }
            } catch (Exception e) {
                log.warn("Could not check buyer order history: {}", e.getMessage());
            }
        }

        // 2. High COD Amount Risk
        if (order.getPaymentMethod() == PaymentMethod.COD && total.compareTo(codMaxAmount) >= 0) {
            score += 25;
            reasons.add(String.format("Phương thức COD giá trị cao (%s), tiềm ẩn rủi ro boom hàng hoặc hoàn trả", VND_FORMAT.format(total)));
        }

        // 3. Abnormal Quantity / Bulk buying
        if (order.getItems() != null && !order.getItems().isEmpty()) {
            int totalQty = order.getItems().stream().mapToInt(OrderItem::quantity).sum();
            boolean hasSingleBulk = order.getItems().stream().anyMatch(i -> i.quantity() >= 5);
            if (totalQty >= 10 || hasSingleBulk) {
                score += 20;
                reasons.add(String.format("Số lượng sách đặt bất thường (Tổng %d cuốn, dấu hiệu mua gom hoặc đầu cơ)", totalQty));
            }
        }

        // 4. Contact & Shipping Address Anomalies
        String phoneToCheck = order.getGuestPhone();
        String address = order.getShippingAddress() != null ? order.getShippingAddress() : "";
        if (phoneToCheck == null && address.contains("SĐT:")) {
            try {
                String[] parts = address.split("\\|");
                if (parts.length > 1) {
                    phoneToCheck = parts[1].replace("SĐT:", "").trim();
                }
            } catch (Exception ignored) {}
        }

        if (phoneToCheck != null) {
            String cleanPhone = phoneToCheck.replaceAll("\\s+", "");
            if (REPEATED_DIGITS.matcher(cleanPhone).find()) {
                score += 30;
                reasons.add("Số điện thoại nhận hàng có dấu hiệu số ảo hoặc lặp chữ số (" + phoneToCheck + ")");
            } else if (cleanPhone.length() < 9 || cleanPhone.length() > 11) {
                score += 20;
                reasons.add("Độ dài số điện thoại không chuẩn (" + phoneToCheck + ")");
            }
        }

        if (address.trim().length() < 12) {
            score += 20;
            reasons.add("Địa chỉ giao hàng quá ngắn hoặc thiếu thông tin cụ thể (" + address.trim() + ")");
        }

        // 5. Velocity / Frequency Check (Spike within 10 minutes)
        Instant tenMinsAgo = Instant.now().minus(10, ChronoUnit.MINUTES);
        try {
            if (Boolean.TRUE.equals(order.getIsGuest()) && phoneToCheck != null && !phoneToCheck.isBlank()) {
                long recentCount = orderJpaRepository.countByGuestPhoneAndCreatedAtAfter(phoneToCheck.trim(), tenMinsAgo);
                if (recentCount >= 2) {
                    score += 35;
                    reasons.add(String.format("Tần suất đặt đơn dồn dập (%d đơn trong 10 phút) từ cùng số điện thoại", recentCount));
                }
            } else if (!Boolean.TRUE.equals(order.getIsGuest())) {
                long recentCount = orderJpaRepository.countByBuyerIdAndCreatedAtAfter(order.getBuyerId().value(), tenMinsAgo);
                if (recentCount >= 2) {
                    score += 35;
                    reasons.add(String.format("Tài khoản đặt dồn dập %d đơn hàng trong vòng 10 phút", recentCount));
                }
            }
        } catch (Exception e) {
            log.warn("Velocity check error: {}", e.getMessage());
        }

        int finalScore = Math.min(100, Math.max(0, score));
        boolean isFlagged = finalScore >= riskThreshold;
        String level = isFlagged ? "SUSPICIOUS" : (finalScore >= 35 ? "WARNING" : "SAFE");

        String reasonsJson = "[]";
        try {
            reasonsJson = objectMapper.writeValueAsString(reasons);
        } catch (Exception ignored) {}

        log.info("Fraud assessment for order {}: score={}, level={}, isFlagged={}, reasonsCount={}",
                order.getId().value(), finalScore, level, isFlagged, reasons.size());

        return new RiskAssessmentResult(finalScore, level, reasonsJson, reasons, isFlagged);
    }

    private BigDecimal getDecimalConfig(String key, BigDecimal defVal) {
        return storeConfigRepository.findById(key)
                .map(c -> {
                    try {
                        return new BigDecimal(c.getConfigValue().trim());
                    } catch (Exception e) {
                        return defVal;
                    }
                })
                .orElse(defVal);
    }

    private int getIntConfig(String key, int defVal) {
        return storeConfigRepository.findById(key)
                .map(c -> {
                    try {
                        return Integer.parseInt(c.getConfigValue().trim());
                    } catch (Exception e) {
                        return defVal;
                    }
                })
                .orElse(defVal);
    }
}
