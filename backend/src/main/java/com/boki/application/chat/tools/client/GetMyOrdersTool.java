package com.boki.application.chat.tools.client;

import com.boki.domain.chat.model.ChatAction;
import com.boki.domain.chat.model.ChatActionType;
import com.boki.domain.chat.tool.*;
import com.boki.infrastructure.persistence.entity.OrderJpaEntity;
import com.boki.infrastructure.persistence.repository.OrderJpaRepository;
import org.springframework.stereotype.Component;

import java.util.*;

@Component
public class GetMyOrdersTool implements ChatTool {

    private final OrderJpaRepository orderRepository;

    public GetMyOrdersTool(OrderJpaRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    @Override
    public String getName() {
        return "getMyOrders";
    }

    @Override
    public ToolMetadata getMetadata() {
        return ToolMetadata.client(
                "getMyOrders",
                "Xem danh sách các đơn hàng gần đây của tài khoản khách hàng đang đăng nhập.",
                Map.of(
                        "limit", "Số lượng đơn hàng cần xem (tối đa 5, mặc định 3)"
                ),
                List.of()
        );
    }

    @Override
    public ToolPermission getRequiredPermission() {
        return ToolPermission.BUYER_ONLY;
    }

    @Override
    public ToolResult execute(ToolExecutionContext context, Map<String, Object> params) {
        if (!context.isAuthenticated()) {
            return ToolResult.error("Bạn cần đăng nhập để xem danh sách đơn hàng của mình nhé!");
        }

        int limit = 3;
        if (params != null && params.get("limit") != null) {
            try {
                limit = Math.min(5, Math.max(1, Integer.parseInt(params.get("limit").toString())));
            } catch (Exception ignored) {}
        }

        List<OrderJpaEntity> orders = orderRepository.findByBuyerIdOrderByCreatedAtDesc(context.userId());
        if (orders.isEmpty()) {
            return ToolResult.ok(
                    "Bạn chưa có đơn hàng nào tại BokiStore. Hãy khám phá và đặt mua tựa sách yêu thích ngay nhé!",
                    List.of(),
                    ChatActionType.NONE,
                    List.of(),
                    List.of(ChatAction.of(ChatActionType.NAVIGATE, "Khám phá sách", Map.of("path", "/books")))
            );
        }

        List<OrderJpaEntity> limitedOrders = orders.stream().limit(limit).toList();
        List<Object> cards = new ArrayList<>();
        List<ChatAction> actions = new ArrayList<>();

        for (OrderJpaEntity o : limitedOrders) {
            Map<String, Object> card = new LinkedHashMap<>();
            card.put("id", o.getId().toString());
            card.put("status", o.getStatus().name());
            card.put("totalAmount", o.getTotalAmount());
            card.put("trackingNumber", o.getTrackingNumber());
            card.put("createdAt", o.getCreatedAt() != null ? o.getCreatedAt().toString() : null);
            cards.add(card);

            actions.add(ChatAction.of(
                    ChatActionType.VIEW_ORDER,
                    "Xem đơn #" + o.getId().toString().substring(0, 8),
                    Map.of("orderId", o.getId().toString())
            ));
        }

        String msg = String.format("Bạn có tổng cộng %d đơn hàng. Dưới đây là %d đơn hàng mới nhất của bạn:", orders.size(), limitedOrders.size());
        return ToolResult.ok(msg, cards, ChatActionType.ORDER_INFO, cards, actions);
    }
}
