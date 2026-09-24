package com.boki.application.chat.tools.admin;

import com.boki.domain.chat.model.ChatAction;
import com.boki.domain.chat.model.ChatActionType;
import com.boki.domain.chat.tool.*;
import com.boki.infrastructure.persistence.entity.OrderJpaEntity;
import com.boki.infrastructure.persistence.repository.OrderJpaRepository;
import org.springframework.stereotype.Component;

import java.util.*;

@Component
public class GetOrderMetricsTool implements ChatTool {

    private final OrderJpaRepository orderRepository;

    public GetOrderMetricsTool(OrderJpaRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    @Override
    public String getName() {
        return "getOrderMetrics";
    }

    @Override
    public ToolMetadata getMetadata() {
        return ToolMetadata.admin(
                "getOrderMetrics",
                "Thống kê số lượng đơn hàng theo các trạng thái xử lý: Chờ duyệt, Đang đóng gói, Đang giao, Đã hủy, và Đơn bị cảnh báo rủi ro.",
                Map.of(),
                List.of()
        );
    }

    @Override
    public ToolPermission getRequiredPermission() {
        return ToolPermission.SELLER_OR_ADMIN;
    }

    @Override
    public ToolResult execute(ToolExecutionContext context, Map<String, Object> params) {
        List<OrderJpaEntity> allOrders = orderRepository.findAll();

        long pendingCount = allOrders.stream().filter(o -> o.getStatus() == OrderJpaEntity.OrderStatusJpa.PENDING).count();
        long confirmedCount = allOrders.stream().filter(o -> o.getStatus() == OrderJpaEntity.OrderStatusJpa.CONFIRMED).count();
        long shippingCount = allOrders.stream().filter(o -> o.getStatus() == OrderJpaEntity.OrderStatusJpa.SHIPPED).count();
        long deliveredCount = allOrders.stream().filter(o -> o.getStatus() == OrderJpaEntity.OrderStatusJpa.DELIVERED || o.getStatus() == OrderJpaEntity.OrderStatusJpa.COMPLETED).count();
        long cancelledCount = allOrders.stream().filter(o -> o.getStatus() == OrderJpaEntity.OrderStatusJpa.CANCELLED).count();
        long flaggedCount = allOrders.stream().filter(o -> Boolean.TRUE.equals(o.getIsFlagged())).count();

        Map<String, Object> counts = new LinkedHashMap<>();
        counts.put("pending", pendingCount);
        counts.put("confirmed", confirmedCount);
        counts.put("shipping", shippingCount);
        counts.put("delivered", deliveredCount);
        counts.put("cancelled", cancelledCount);
        counts.put("flagged", flaggedCount);
        counts.put("total", allOrders.size());

        StringBuilder sb = new StringBuilder();
        sb.append("📦 **Tổng quan Tình hình Vận hành Đơn hàng:**\n\n");
        sb.append(String.format("• ⏳ **Chờ duyệt:** %d đơn (cần xử lý sớm)\n", pendingCount));
        sb.append(String.format("• 📦 **Đang đóng gói:** %d đơn\n", confirmedCount));
        sb.append(String.format("• 🚚 **Đang giao:** %d đơn\n", shippingCount));
        sb.append(String.format("• ✅ **Hoàn tất:** %d đơn\n", deliveredCount));
        sb.append(String.format("• ❌ **Đã hủy:** %d đơn\n", cancelledCount));
        if (flaggedCount > 0) {
            sb.append(String.format("• ⚠️ **Đơn hàng nghi vấn rủi ro (Flagged):** %d đơn\n", flaggedCount));
        }

        List<ChatAction> actions = new ArrayList<>();
        if (pendingCount > 0) {
            actions.add(ChatAction.of(ChatActionType.NAVIGATE, "Duyệt đơn chờ (" + pendingCount + ")", Map.of("path", "/admin/orders?status=PENDING")));
        }
        if (flaggedCount > 0) {
            actions.add(ChatAction.of(ChatActionType.NAVIGATE, "Kiểm tra rủi ro (" + flaggedCount + ")", Map.of("path", "/admin/orders?flagged=true")));
        }

        return ToolResult.ok(sb.toString(), counts, ChatActionType.ADMIN_METRIC, List.of(counts), actions);
    }
}
