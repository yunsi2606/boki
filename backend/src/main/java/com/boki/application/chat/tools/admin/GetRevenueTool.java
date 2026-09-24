package com.boki.application.chat.tools.admin;

import com.boki.domain.chat.model.ChatAction;
import com.boki.domain.chat.model.ChatActionType;
import com.boki.domain.chat.tool.*;
import com.boki.infrastructure.persistence.entity.OrderJpaEntity;
import com.boki.infrastructure.persistence.repository.OrderJpaRepository;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Component
public class GetRevenueTool implements ChatTool {

    private final OrderJpaRepository orderRepository;

    public GetRevenueTool(OrderJpaRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    @Override
    public String getName() {
        return "getRevenue";
    }

    @Override
    public ToolMetadata getMetadata() {
        return ToolMetadata.admin(
                "getRevenue",
                "Báo cáo doanh thu có giải trình (Explainable Metrics): đối chiếu hôm nay so với hôm qua và tuần trước, phân tích biến động số đơn và AOV.",
                Map.of(
                        "period", "Khoảng thời gian: 'today', 'yesterday', 'this_week', 'this_month'"
                ),
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
        Instant startOfToday = now.truncatedTo(ChronoUnit.DAYS);
        Instant startOfYesterday = startOfToday.minus(1, ChronoUnit.DAYS);
        Instant startOfSameDayLastWeek = startOfToday.minus(7, ChronoUnit.DAYS);

        // Lấy tất cả đơn hàng đã tạo gần đây để phân tích
        List<OrderJpaEntity> recentOrders = orderRepository.findAll();

        // Đơn hôm nay (trừ đơn hủy)
        List<OrderJpaEntity> ordersToday = recentOrders.stream()
                .filter(o -> o.getCreatedAt() != null && o.getCreatedAt().isAfter(startOfToday))
                .filter(o -> o.getStatus() != OrderJpaEntity.OrderStatusJpa.CANCELLED)
                .toList();

        // Đơn hôm qua
        List<OrderJpaEntity> ordersYesterday = recentOrders.stream()
                .filter(o -> o.getCreatedAt() != null && o.getCreatedAt().isAfter(startOfYesterday) && o.getCreatedAt().isBefore(startOfToday))
                .filter(o -> o.getStatus() != OrderJpaEntity.OrderStatusJpa.CANCELLED)
                .toList();

        // Đơn cùng ngày tuần trước
        List<OrderJpaEntity> ordersLastWeek = recentOrders.stream()
                .filter(o -> o.getCreatedAt() != null && o.getCreatedAt().isAfter(startOfSameDayLastWeek) && o.getCreatedAt().isBefore(startOfSameDayLastWeek.plus(1, ChronoUnit.DAYS)))
                .filter(o -> o.getStatus() != OrderJpaEntity.OrderStatusJpa.CANCELLED)
                .toList();

        BigDecimal revenueToday = ordersToday.stream().map(OrderJpaEntity::getTotalAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal revenueYesterday = ordersYesterday.stream().map(OrderJpaEntity::getTotalAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal revenueLastWeek = ordersLastWeek.stream().map(OrderJpaEntity::getTotalAmount).reduce(BigDecimal.ZERO, BigDecimal::add);

        int countToday = ordersToday.size();
        int countYesterday = ordersYesterday.size();

        BigDecimal aovToday = countToday > 0 ? revenueToday.divide(BigDecimal.valueOf(countToday), 0, RoundingMode.HALF_UP) : BigDecimal.ZERO;
        BigDecimal aovYesterday = countYesterday > 0 ? revenueYesterday.divide(BigDecimal.valueOf(countYesterday), 0, RoundingMode.HALF_UP) : BigDecimal.ZERO;

        double vsYesterdayPct = calculatePct(revenueToday, revenueYesterday);
        double vsLastWeekPct = calculatePct(revenueToday, revenueLastWeek);
        double orderChangePct = countYesterday > 0 ? ((double)(countToday - countYesterday) / countYesterday) * 100.0 : 0.0;

        Map<String, Object> metricData = new LinkedHashMap<>();
        metricData.put("revenueToday", revenueToday);
        metricData.put("ordersCountToday", countToday);
        metricData.put("aovToday", aovToday);
        metricData.put("vsYesterdayPct", vsYesterdayPct);
        metricData.put("vsLastWeekPct", vsLastWeekPct);
        metricData.put("orderChangePct", orderChangePct);

        StringBuilder sb = new StringBuilder();
        sb.append(String.format("📊 **Báo cáo Doanh thu Hôm nay:** %,.0f ₫\n\n", revenueToday.doubleValue()));
        sb.append("**So sánh tăng trưởng:**\n");
        sb.append(String.format("• So với hôm qua: %s %,.1f%%\n", vsYesterdayPct >= 0 ? "🟢 +" : "🔴 ", vsYesterdayPct));
        sb.append(String.format("• So với cùng ngày tuần trước: %s %,.1f%%\n\n", vsLastWeekPct >= 0 ? "🟢 +" : "🔴 ", vsLastWeekPct));
        sb.append("**Nguyên nhân dữ liệu (Explainable Metrics):**\n");
        sb.append(String.format("• Tổng số đơn hoàn tất: %d đơn (%s %,.1f%% so với hôm qua)\n", countToday, orderChangePct >= 0 ? "+" : "", orderChangePct));
        sb.append(String.format("• Giá trị đơn trung bình (AOV): %,.0f ₫ (hôm qua: %,.0f ₫)\n", aovToday.doubleValue(), aovYesterday.doubleValue()));

        List<ChatAction> actions = List.of(
                ChatAction.of(ChatActionType.NAVIGATE, "Xem đơn hàng", Map.of("path", "/admin/orders")),
                ChatAction.of(ChatActionType.NAVIGATE, "Xem báo cáo chi tiết", Map.of("path", "/admin/analytics"))
        );

        return ToolResult.ok(sb.toString(), metricData, ChatActionType.ADMIN_METRIC, List.of(metricData), actions);
    }

    private double calculatePct(BigDecimal current, BigDecimal previous) {
        if (previous == null || previous.compareTo(BigDecimal.ZERO) == 0) {
            return current.compareTo(BigDecimal.ZERO) > 0 ? 100.0 : 0.0;
        }
        return current.subtract(previous)
                .divide(previous, 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100))
                .doubleValue();
    }
}
