package com.boki.application.chat.tools.client;

import com.boki.domain.chat.model.ChatAction;
import com.boki.domain.chat.model.ChatActionType;
import com.boki.domain.chat.tool.*;
import com.boki.infrastructure.persistence.entity.VoucherJpaEntity;
import com.boki.infrastructure.persistence.repository.VoucherJpaRepository;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.*;

@Component
public class GetActiveVouchersTool implements ChatTool {

    private final VoucherJpaRepository voucherRepository;

    public GetActiveVouchersTool(VoucherJpaRepository voucherRepository) {
        this.voucherRepository = voucherRepository;
    }

    @Override
    public String getName() {
        return "getActiveVouchers";
    }

    @Override
    public ToolMetadata getMetadata() {
        return ToolMetadata.client(
                "getActiveVouchers",
                "Lấy danh sách các mã giảm giá, khuyến mãi và voucher đang có hiệu lực. Có thể đối chiếu với giá trị giỏ hàng hiện tại.",
                Map.of(
                        "cartTotal", "Giá trị tạm tính của giỏ hàng (nếu có)"
                ),
                List.of()
        );
    }

    @Override
    public ToolPermission getRequiredPermission() {
        return ToolPermission.PUBLIC;
    }

    @Override
    public ToolResult execute(ToolExecutionContext context, Map<String, Object> params) {
        List<VoucherJpaEntity> activeVouchers = voucherRepository.findByIsActiveTrue();
        OffsetDateTime now = OffsetDateTime.now();

        // Lọc voucher còn hạn sử dụng và còn lượt dùng
        List<VoucherJpaEntity> validVouchers = activeVouchers.stream()
                .filter(v -> v.getEndDate() == null || v.getEndDate().isAfter(now))
                .filter(v -> v.getUsageLimit() == null || v.getUsedCount() < v.getUsageLimit())
                .toList();

        if (validVouchers.isEmpty()) {
            return ToolResult.ok(
                    "Hiện tại BokiStore chưa có mã giảm giá công khai mới. Hãy theo dõi trang chủ để đón đợt ưu đãi sắp tới nhé!",
                    List.of(),
                    ChatActionType.NONE,
                    List.of(),
                    List.of()
            );
        }

        BigDecimal cartTotal = null;
        if (params != null && params.get("cartTotal") != null) {
            try {
                cartTotal = new BigDecimal(params.get("cartTotal").toString());
            } catch (Exception ignored) {}
        }

        List<Object> cards = new ArrayList<>();
        List<ChatAction> actions = new ArrayList<>();

        for (VoucherJpaEntity v : validVouchers) {
            Map<String, Object> card = new LinkedHashMap<>();
            card.put("code", v.getCode());
            card.put("discountType", v.getDiscountType() != null ? v.getDiscountType() : "FIXED_AMOUNT");
            card.put("discountAmount", v.getDiscountAmount());
            card.put("minOrderAmount", v.getMinOrderAmount());
            card.put("maxDiscountAmount", v.getMaxDiscountAmount());
            card.put("title", v.getTitle());
            card.put("description", v.getDescription() != null ? v.getDescription() : "Mã ưu đãi BokiStore");
            card.put("endDate", v.getEndDate() != null ? v.getEndDate().toString() : null);

            boolean eligible = true;
            if (cartTotal != null && v.getMinOrderAmount() != null) {
                eligible = cartTotal.compareTo(v.getMinOrderAmount()) >= 0;
            }
            card.put("eligible", eligible);
            cards.add(card);

            actions.add(ChatAction.of(
                    ChatActionType.COPY_VOUCHER,
                    "Sao chép: " + v.getCode(),
                    Map.of("code", v.getCode())
            ));
        }

        String msg = String.format("BokiStore đang có %d mã ưu đãi đang hoạt động dành cho bạn:", validVouchers.size());
        return ToolResult.ok(msg, cards, ChatActionType.VOUCHER_LIST, cards, actions);
    }
}
