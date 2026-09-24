package com.boki.application.chat.tools.admin;

import com.boki.domain.chat.model.ChatAction;
import com.boki.domain.chat.model.ChatActionType;
import com.boki.domain.chat.tool.*;
import com.boki.infrastructure.persistence.entity.OrderJpaEntity;
import com.boki.infrastructure.persistence.repository.OrderJpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Component;

import java.util.*;

@Component
public class SearchOrdersTool implements ChatTool {

    private final OrderJpaRepository orderRepository;

    public SearchOrdersTool(OrderJpaRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    @Override
    public String getName() {
        return "searchOrders";
    }

    @Override
    public ToolMetadata getMetadata() {
        return ToolMetadata.admin(
                "searchOrders",
                "Tìm kiếm đơn hàng trong trang quản trị theo từ khóa (mã đơn, địa chỉ, mã vận đơn, người mua) hoặc theo trạng thái xử lý.",
                Map.of(
                        "query", "Từ khóa tìm kiếm (mã đơn, SĐT, mã vận đơn)",
                        "status", "Trạng thái đơn: PENDING, CONFIRMED, SHIPPING, DELIVERED, CANCELLED"
                ),
                List.of()
        );
    }

    @Override
    public ToolPermission getRequiredPermission() {
        return ToolPermission.SELLER_OR_ADMIN;
    }

    @Override
    public ToolResult execute(ToolExecutionContext context, Map<String, Object> params) {
        String query = params != null && params.get("query") != null ? params.get("query").toString().trim() : "";
        String statusStr = params != null && params.get("status") != null ? params.get("status").toString().trim() : null;

        OrderJpaEntity.OrderStatusJpa status = null;
        if (statusStr != null && !statusStr.isEmpty()) {
            try {
                status = OrderJpaEntity.OrderStatusJpa.valueOf(statusStr.toUpperCase());
            } catch (IllegalArgumentException ignored) {}
        }

        PageRequest pageRequest = PageRequest.of(0, 5);
        Page<OrderJpaEntity> page;

        if (status != null && !query.isEmpty()) {
            page = orderRepository.searchByStatusAndKeyword(status, query, pageRequest);
        } else if (status != null) {
            page = orderRepository.findByStatusOrderByCreatedAtDesc(status, pageRequest);
        } else if (!query.isEmpty()) {
            page = orderRepository.searchByKeyword(query, pageRequest);
        } else {
            page = orderRepository.findAllByOrderByCreatedAtDesc(pageRequest);
        }

        List<OrderJpaEntity> orders = page.getContent();
        if (orders.isEmpty()) {
            return ToolResult.ok(
                    "Không tìm thấy đơn hàng nào khớp với tiêu chí tìm kiếm.",
                    List.of(),
                    ChatActionType.NONE,
                    List.of(),
                    List.of()
            );
        }

        StringBuilder sb = new StringBuilder();
        sb.append(String.format("📋 **Tìm thấy %d đơn hàng gần nhất:**\n\n", orders.size()));

        List<Object> cards = new ArrayList<>();
        List<ChatAction> actions = new ArrayList<>();

        for (OrderJpaEntity o : orders) {
            Map<String, Object> card = new LinkedHashMap<>();
            card.put("id", o.getId().toString());
            card.put("status", o.getStatus().name());
            card.put("totalAmount", o.getTotalAmount());
            card.put("shippingAddress", o.getShippingAddress());
            card.put("trackingNumber", o.getTrackingNumber());
            card.put("paymentMethod", o.getPaymentMethod());
            card.put("paymentStatus", o.getPaymentStatus());
            card.put("isFlagged", o.getIsFlagged());
            card.put("createdAt", o.getCreatedAt() != null ? o.getCreatedAt().toString() : null);
            cards.add(card);

            sb.append(String.format("• **#%s** | %,.0f ₫ | Trạng thái: **%s** | ĐVVC: %s\n",
                    o.getId().toString().substring(0, 8),
                    o.getTotalAmount().doubleValue(),
                    o.getStatus().name(),
                    o.getCarrierName() != null ? o.getCarrierName() : "N/A"));

            actions.add(ChatAction.of(ChatActionType.VIEW_ORDER, "Xem #" + o.getId().toString().substring(0, 8), Map.of("orderId", o.getId().toString())));
        }

        return ToolResult.ok(sb.toString(), cards, ChatActionType.ORDER_INFO, cards, actions);
    }
}
