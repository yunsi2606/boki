package com.boki.application.chat.tools.client;

import com.boki.domain.chat.model.ChatAction;
import com.boki.domain.chat.model.ChatActionType;
import com.boki.domain.chat.tool.*;
import com.boki.infrastructure.persistence.entity.BookJpaEntity;
import com.boki.infrastructure.persistence.entity.OrderItemJpaEntity;
import com.boki.infrastructure.persistence.entity.OrderJpaEntity;
import com.boki.infrastructure.persistence.repository.BookJpaRepository;
import com.boki.infrastructure.persistence.repository.OrderJpaRepository;
import org.springframework.stereotype.Component;

import java.util.*;

@Component
public class GetOrderTool implements ChatTool {

    private final OrderJpaRepository orderRepository;
    private final BookJpaRepository bookRepository;

    public GetOrderTool(OrderJpaRepository orderRepository, BookJpaRepository bookRepository) {
        this.orderRepository = orderRepository;
        this.bookRepository = bookRepository;
    }

    @Override
    public String getName() {
        return "getOrder";
    }

    @Override
    public ToolMetadata getMetadata() {
        return ToolMetadata.client(
                "getOrder",
                "Tra cứu chi tiết và trạng thái giao hàng của một đơn hàng qua mã đơn, mã vận đơn hoặc mã thanh toán.",
                Map.of(
                        "orderCode", "Mã đơn hàng (UUID hoặc tiền tố BK-...)",
                        "trackingNumber", "Mã vận đơn của đơn vị vận chuyển",
                        "paymentCode", "Mã thanh toán VNPAY/VietQR"
                ),
                List.of()
        );
    }

    @Override
    public ToolPermission getRequiredPermission() {
        return ToolPermission.PUBLIC;
    }

    @Override
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public ToolResult execute(ToolExecutionContext context, Map<String, Object> params) {
        String orderCode = params != null && params.get("orderCode") != null ? params.get("orderCode").toString().trim() : null;
        String trackingNumber = params != null && params.get("trackingNumber") != null ? params.get("trackingNumber").toString().trim() : null;
        String paymentCode = params != null && params.get("paymentCode") != null ? params.get("paymentCode").toString().trim() : null;

        Optional<OrderJpaEntity> orderOpt = Optional.empty();

        if (trackingNumber != null && !trackingNumber.isEmpty()) {
            orderOpt = orderRepository.findByTrackingNumber(trackingNumber);
        } else if (paymentCode != null && !paymentCode.isEmpty()) {
            orderOpt = orderRepository.findByPaymentCode(paymentCode);
        } else if (orderCode != null && !orderCode.isEmpty()) {
            try {
                orderOpt = orderRepository.findById(UUID.fromString(orderCode));
            } catch (IllegalArgumentException e) {
                // Thử tìm theo keyword
                var page = orderRepository.searchByKeyword(orderCode, org.springframework.data.domain.PageRequest.of(0, 1));
                if (!page.isEmpty()) {
                    orderOpt = Optional.of(page.getContent().get(0));
                }
            }
        }

        if (orderOpt.isEmpty()) {
            return ToolResult.ok(
                    "BokiStore không tìm thấy đơn hàng nào khớp với mã bạn vừa cung cấp. Vui lòng kiểm tra lại mã đơn hàng hoặc mã vận đơn nhé!",
                    null,
                    ChatActionType.NONE,
                    List.of(),
                    List.of()
            );
        }

        OrderJpaEntity order = orderOpt.get();

        // Kiểm tra quyền nếu là khách mua thông thường đã đăng nhập
        if (context.isAuthenticated() && !context.isSellerOrAdmin()) {
            if (order.getBuyerId() != null && !order.getBuyerId().equals(context.userId())) {
                return ToolResult.error("Bạn không có quyền truy cập thông tin đơn hàng này.");
            }
        }

        Map<String, Object> orderCard = new LinkedHashMap<>();
        orderCard.put("id", order.getId().toString());
        orderCard.put("status", order.getStatus().name());
        orderCard.put("totalAmount", order.getTotalAmount());
        orderCard.put("shippingFee", order.getShippingFee());
        orderCard.put("shippingAddress", order.getShippingAddress());
        orderCard.put("carrierName", order.getCarrierName() != null ? order.getCarrierName() : "Đang điều phối");
        orderCard.put("carrierStatus", order.getCarrierStatus());
        orderCard.put("trackingNumber", order.getTrackingNumber());
        orderCard.put("paymentMethod", order.getPaymentMethod());
        orderCard.put("paymentStatus", order.getPaymentStatus());
        orderCard.put("createdAt", order.getCreatedAt() != null ? order.getCreatedAt().toString() : null);

        List<Map<String, Object>> items = new ArrayList<>();
        if (order.getItems() != null) {
            for (OrderItemJpaEntity item : order.getItems()) {
                Map<String, Object> itemMap = new LinkedHashMap<>();
                String bookTitle = "Sách";
                if (item.getBookId() != null) {
                    bookTitle = bookRepository.findById(item.getBookId())
                            .map(BookJpaEntity::getTitle)
                            .orElse("Sách (" + item.getBookId().toString().substring(0, 8) + ")");
                }
                itemMap.put("title", bookTitle);
                itemMap.put("quantity", item.getQuantity());
                itemMap.put("price", item.getUnitPrice());
                items.add(itemMap);
            }
        }
        orderCard.put("items", items);

        List<ChatAction> actions = List.of(
                ChatAction.of(ChatActionType.TRACK_ORDER, "Xem tiến trình chi tiết", Map.of("orderId", order.getId().toString()))
        );

        String statusDesc = switch (order.getStatus()) {
            case PENDING -> "đang chờ xác nhận";
            case CONFIRMED -> "đã được xác nhận và đang đóng gói";
            case SHIPPED -> "đang trên đường giao đến bạn";
            case DELIVERED -> "đã giao hàng thành công";
            case COMPLETED -> "đã hoàn tất thành công";
            case CANCELLED -> "đã bị hủy (" + (order.getCancelReason() != null ? order.getCancelReason() : "Theo yêu cầu") + ")";
            default -> order.getStatus().name();
        };

        String msg = String.format("Đơn hàng **#%s** của bạn hiện **%s**.\n- Tổng tiền: %,.0f ₫\n- Đơn vị vận chuyển: %s\n- Mã vận đơn: %s",
                order.getId().toString().substring(0, 8),
                statusDesc,
                order.getTotalAmount().doubleValue(),
                order.getCarrierName() != null ? order.getCarrierName() : "Đang cập nhật",
                order.getTrackingNumber() != null ? order.getTrackingNumber() : "Chưa có");

        return ToolResult.ok(msg, orderCard, ChatActionType.ORDER_INFO, List.of(orderCard), actions);
    }
}
