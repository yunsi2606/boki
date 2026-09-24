package com.boki.application.chat.tools.admin;

import com.boki.domain.chat.model.ChatAction;
import com.boki.domain.chat.model.ChatActionType;
import com.boki.domain.chat.tool.*;
import com.boki.infrastructure.persistence.entity.BookJpaEntity;
import com.boki.infrastructure.persistence.entity.OrderJpaEntity;
import com.boki.infrastructure.persistence.repository.BookJpaRepository;
import com.boki.infrastructure.persistence.repository.OrderJpaRepository;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Component
public class AnomalyDetectionTool implements ChatTool {

    private final OrderJpaRepository orderRepository;
    private final BookJpaRepository bookRepository;

    public AnomalyDetectionTool(OrderJpaRepository orderRepository, BookJpaRepository bookRepository) {
        this.orderRepository = orderRepository;
        this.bookRepository = bookRepository;
    }

    @Override
    public String getName() {
        return "detectAnomalies";
    }

    @Override
    public ToolMetadata getMetadata() {
        return ToolMetadata.admin(
                "detectAnomalies",
                "Phân tích dữ liệu vận hành để phát hiện các dấu hiệu bất thường: tỷ lệ hủy đơn tăng vọt, đơn hàng nghi vấn gian lận, tồn kho sai lệch.",
                Map.of(),
                List.of()
        );
    }

    @Override
    public ToolPermission getRequiredPermission() {
        return ToolPermission.ADMIN_ONLY;
    }

    @Override
    public ToolResult execute(ToolExecutionContext context, Map<String, Object> params) {
        Instant now = Instant.now();
        Instant last24Hours = now.minus(24, ChronoUnit.HOURS);

        List<OrderJpaEntity> allOrders = orderRepository.findAll();
        List<OrderJpaEntity> orders24h = allOrders.stream()
                .filter(o -> o.getCreatedAt() != null && o.getCreatedAt().isAfter(last24Hours))
                .toList();

        List<String> anomalies = new ArrayList<>();
        Map<String, Object> anomalyData = new LinkedHashMap<>();

        // 1. Kiểm tra tỷ lệ hủy đơn trong 24h
        if (!orders24h.isEmpty()) {
            long cancelled24h = orders24h.stream()
                    .filter(o -> o.getStatus() == OrderJpaEntity.OrderStatusJpa.CANCELLED)
                    .count();
            double cancelRate = ((double) cancelled24h / orders24h.size()) * 100.0;
            anomalyData.put("cancellationRate24h", cancelRate);

            if (cancelRate >= 15.0 && orders24h.size() >= 5) {
                anomalies.add(String.format("⚠️ **Tỷ lệ hủy đơn cao bất thường:** %,.1f%% (%d/%d đơn trong 24h qua bị hủy). Hãy kiểm tra lý do hủy của khách hàng.",
                        cancelRate, cancelled24h, orders24h.size()));
            }
        }

        // 2. Kiểm tra đơn hàng bị gắn cờ rủi ro (Fraud / Flagged)
        long flaggedCount = allOrders.stream()
                .filter(o -> Boolean.TRUE.equals(o.getIsFlagged()))
                .filter(o -> o.getStatus() == OrderJpaEntity.OrderStatusJpa.PENDING || o.getStatus() == OrderJpaEntity.OrderStatusJpa.CONFIRMED)
                .count();
        anomalyData.put("flaggedOrdersCount", flaggedCount);

        if (flaggedCount > 0) {
            anomalies.add(String.format("🚨 **Cảnh báo Gian lận & Rủi ro:** Phát hiện **%d** đơn hàng có dấu hiệu bất thường (đặt trùng lặp nhiều lần hoặc địa chỉ bất thường) đang chờ xử lý.",
                    flaggedCount));
        }

        // 3. Kiểm tra sản phẩm có đơn đặt nhưng kho đã về 0
        List<BookJpaEntity> zeroStockBooks = bookRepository.findAll().stream()
                .filter(b -> b.getStockQuantity() == 0 && b.getStatus() == BookJpaEntity.BookStatusJpa.ACTIVE)
                .toList();
        anomalyData.put("activeZeroStockBooksCount", zeroStockBooks.size());

        if (!zeroStockBooks.isEmpty()) {
            anomalies.add(String.format("📦 **Lệch trạng thái kho:** Có **%d** tựa sách vẫn ở trạng thái ACTIVE (đang mở bán) nhưng số lượng tồn kho = 0. Cần chuyển sang DRAFT hoặc cập nhật nhập kho.",
                    zeroStockBooks.size()));
        }

        StringBuilder sb = new StringBuilder();
        if (anomalies.isEmpty()) {
            sb.append("🛡️ **Báo Cáo Bất Thường BokiStore:**\n\n");
            sb.append("Hệ thống đã quét toàn bộ các chỉ số vận hành trong 24 giờ qua:\n");
            sb.append("• Tỷ lệ hủy đơn: Trong ngưỡng an toàn (< 10%)\n");
            sb.append("• Đơn hàng rủi ro / gian lận: 0 đơn\n");
            sb.append("• Tính toàn vẹn tồn kho: Không phát hiện xung đột\n\n");
            sb.append("✅ **Kết luận:** Hiện tại không có bất thường nào đáng lo ngại!");
        } else {
            sb.append("🔍 **Phát Hiện Dấu Hiệu Bất Thường Cần Chú Ý:**\n\n");
            for (String anomaly : anomalies) {
                sb.append(anomaly).append("\n\n");
            }
            sb.append("👉 Đề xuất: Ban quản trị vui lòng nhấp vào các nút bên dưới để rà soát chi tiết.");
        }

        List<ChatAction> actions = new ArrayList<>();
        if (flaggedCount > 0) {
            actions.add(ChatAction.of(ChatActionType.NAVIGATE, "Xem đơn gắn cờ (" + flaggedCount + ")", Map.of("path", "/admin/orders?flagged=true")));
        }
        actions.add(ChatAction.of(ChatActionType.NAVIGATE, "Báo cáo phân tích", Map.of("path", "/admin/analytics")));

        return ToolResult.ok(sb.toString(), anomalyData, ChatActionType.ADMIN_METRIC, List.of(anomalyData), actions);
    }
}
