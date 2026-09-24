package com.boki.application.chat.tools.admin;

import com.boki.application.chat.confirmation.ChatConfirmationService;
import com.boki.domain.chat.model.ChatAction;
import com.boki.domain.chat.model.ChatActionType;
import com.boki.domain.chat.tool.*;
import com.boki.infrastructure.persistence.entity.OrderJpaEntity;
import com.boki.infrastructure.persistence.repository.OrderJpaRepository;
import org.springframework.stereotype.Component;

import java.util.*;

@Component
public class ProposeOrderActionTool implements ChatTool {

    private final OrderJpaRepository orderRepository;
    private final ChatConfirmationService confirmationService;

    public ProposeOrderActionTool(
            OrderJpaRepository orderRepository,
            ChatConfirmationService confirmationService
    ) {
        this.orderRepository = orderRepository;
        this.confirmationService = confirmationService;
    }

    @Override
    public String getName() {
        return "proposeOrderAction";
    }

    @Override
    public ToolMetadata getMetadata() {
        return ToolMetadata.admin(
                "proposeOrderAction",
                "Đề xuất thực hiện thao tác nhạy cảm trên đơn hàng (duyệt đơn, huỷ đơn, gửi vận chuyển) và khởi tạo vé xác nhận 2 bước (two-step confirmation ticket) cho Quản trị viên.",
                Map.of(
                        "orderCode", "Mã đơn hàng hoặc mã rút gọn BK-XXXXXX",
                        "actionType", "Loại thao tác: APPROVE_ORDER, CANCEL_ORDER, SHIP_ORDER"
                ),
                List.of("orderCode", "actionType")
        );
    }

    @Override
    public ToolPermission getRequiredPermission() {
        return ToolPermission.SELLER_OR_ADMIN;
    }

    @Override
    public ToolResult execute(ToolExecutionContext context, Map<String, Object> arguments) {
        String orderCode = (String) arguments.get("orderCode");
        String actionType = (String) arguments.getOrDefault("actionType", "APPROVE_ORDER");

        if (orderCode == null || orderCode.isBlank()) {
            return ToolResult.error("Vui lòng cung cấp mã đơn hàng cần thực hiện thao tác.");
        }

        Optional<OrderJpaEntity> orderOpt;
        try {
            UUID orderId = UUID.fromString(orderCode.trim());
            orderOpt = orderRepository.findById(orderId);
        } catch (IllegalArgumentException e) {
            orderOpt = orderRepository.findAll().stream()
                    .filter(o -> {
                        String shortCode = "BK-" + o.getId().toString().substring(0, 6).toUpperCase();
                        return shortCode.equalsIgnoreCase(orderCode.trim());
                    })
                    .findFirst();
        }

        if (orderOpt.isEmpty()) {
            return ToolResult.error("Không tìm thấy đơn hàng nào tương ứng với mã **" + orderCode + "** trong hệ thống.");
        }

        OrderJpaEntity order = orderOpt.get();
        String fullOrderId = order.getId().toString();
        String shortCode = "BK-" + fullOrderId.substring(0, 6).toUpperCase();

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("orderId", fullOrderId);
        payload.put("orderCode", shortCode);
        payload.put("currentStatus", order.getStatus().name());
        payload.put("totalAmount", order.getTotalAmount());

        String ticketId = confirmationService.createTicket(context.userId(), actionType, payload);

        String actionName = switch (actionType) {
            case "CANCEL_ORDER" -> "HUỶ ĐƠN HÀNG";
            case "SHIP_ORDER" -> "BÀN GIAO VẬN CHUYỂN";
            default -> "DUYỆT & XÁC NHẬN ĐƠN HÀNG";
        };

        String warningText = String.format(
                "Cảnh báo thao tác quản trị: Bạn đang yêu cầu **%s** cho đơn **%s**.\n" +
                "• Trạng thái hiện tại: `%s`\n" +
                "• Tổng tiền: **%,d %s**\n" +
                "• Mã xác thực 2 bước: `%s` (hiệu lực 10 phút)\n\n" +
                "Nhấn nút **Xác nhận thực thi** bên dưới để mở giao diện phê duyệt bảo mật.",
                actionName, shortCode, order.getStatus().name(),
                order.getTotalAmount().longValue(), order.getCurrency(),
                ticketId
        );

        ChatAction confirmAction = ChatAction.of(
                ChatActionType.REQUIRE_CONFIRMATION,
                "Xác nhận thực thi (" + ticketId + ")",
                Map.of(
                        "ticketId", ticketId,
                        "actionType", actionType,
                        "orderId", fullOrderId,
                        "orderCode", shortCode,
                        "actionName", actionName
                )
        );

        return ToolResult.ok(
                warningText,
                payload,
                ChatActionType.REQUIRE_CONFIRMATION,
                List.of(payload),
                List.of(confirmAction)
        );
    }
}
