package com.boki.application.chat.tools.admin;

import com.boki.domain.chat.model.ChatAction;
import com.boki.domain.chat.model.ChatActionType;
import com.boki.domain.chat.tool.*;
import com.boki.infrastructure.persistence.entity.BookJpaEntity;
import com.boki.infrastructure.persistence.entity.BookVariantJpaEntity;
import com.boki.infrastructure.persistence.entity.OrderJpaEntity;
import com.boki.infrastructure.persistence.repository.BookJpaRepository;
import com.boki.infrastructure.persistence.repository.BookVariantJpaRepository;
import com.boki.infrastructure.persistence.repository.OrderJpaRepository;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Component
public class DailyBriefingTool implements ChatTool {

    private final OrderJpaRepository orderRepository;
    private final BookJpaRepository bookRepository;
    private final BookVariantJpaRepository variantRepository;

    public DailyBriefingTool(OrderJpaRepository orderRepository, BookJpaRepository bookRepository, BookVariantJpaRepository variantRepository) {
        this.orderRepository = orderRepository;
        this.bookRepository = bookRepository;
        this.variantRepository = variantRepository;
    }

    @Override
    public String getName() {
        return "getDailyBriefing";
    }

    @Override
    public ToolMetadata getMetadata() {
        return ToolMetadata.admin(
                "getDailyBriefing",
                "Tạo bản tin tóm tắt hoạt động kinh doanh tổng hợp hàng ngày (Daily Briefing): đơn mới, doanh thu, cảnh báo kho và các tiêu điểm quan trọng.",
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
        Instant now = Instant.now();
        Instant startOfToday = now.truncatedTo(ChronoUnit.DAYS);

        List<OrderJpaEntity> allOrders = orderRepository.findAll();
        List<OrderJpaEntity> todayOrders = allOrders.stream()
                .filter(o -> o.getCreatedAt() != null && o.getCreatedAt().isAfter(startOfToday))
                .toList();

        int newOrdersCount = todayOrders.size();
        BigDecimal revenueToday = todayOrders.stream()
                .filter(o -> o.getStatus() != OrderJpaEntity.OrderStatusJpa.CANCELLED)
                .map(OrderJpaEntity::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long pendingApprovalCount = todayOrders.stream()
                .filter(o -> o.getStatus() == OrderJpaEntity.OrderStatusJpa.PENDING)
                .count();

        // Tồn kho
        List<BookJpaEntity> allBooks = bookRepository.findAll();
        List<BookVariantJpaEntity> allVariants = variantRepository.findAll();

        long lowStockBooks = allBooks.stream().filter(b -> b.getStockQuantity() > 0 && b.getStockQuantity() <= 5).count();
        long lowStockVariants = allVariants.stream().filter(v -> v.getStockQuantity() > 0 && v.getStockQuantity() <= 5).count();
        long totalLowStock = lowStockBooks + lowStockVariants;

        long outOfStockBooks = allBooks.stream().filter(b -> b.getStockQuantity() == 0).count();
        long outOfStockVariants = allVariants.stream().filter(v -> v.getStockQuantity() == 0).count();
        long totalOutOfStock = outOfStockBooks + outOfStockVariants;

        // Vouchers used
        long vouchersUsedToday = todayOrders.stream()
                .filter(o -> o.getVoucherCode() != null && !o.getVoucherCode().isBlank())
                .count();

        Map<String, Object> briefingData = new LinkedHashMap<>();
        briefingData.put("newOrdersCount", newOrdersCount);
        briefingData.put("pendingApprovalCount", pendingApprovalCount);
        briefingData.put("revenueToday", revenueToday);
        briefingData.put("totalLowStock", totalLowStock);
        briefingData.put("totalOutOfStock", totalOutOfStock);
        briefingData.put("vouchersUsedToday", vouchersUsedToday);

        StringBuilder sb = new StringBuilder();
        sb.append("🌅 **Boki AI – Bản Tin Điều Hành Hôm Nay**\n");
        sb.append("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
        sb.append(String.format("📦 **Đơn hàng mới:** %d đơn (%d đơn đang chờ duyệt đóng gói)\n", newOrdersCount, pendingApprovalCount));
        sb.append(String.format("💰 **Doanh thu hôm nay:** %,.0f ₫\n", revenueToday.doubleValue()));
        sb.append(String.format("⚠️ **Tồn kho thấp (≤ 5):** %d mặt hàng\n", totalLowStock));
        sb.append(String.format("🔴 **Đã hết hàng (0):** %d mặt hàng\n", totalOutOfStock));
        sb.append(String.format("🎟️ **Voucher đã áp dụng:** %d lượt\n\n", vouchersUsedToday));

        sb.append("📌 **Tiêu điểm đáng chú ý:**\n");
        if (pendingApprovalCount > 0) {
            sb.append(String.format("• Có **%d** đơn hàng mới đang chờ duyệt để kịp bàn giao cho bưu cục GHN/Viettel Post trong ngày.\n", pendingApprovalCount));
        }
        if (totalOutOfStock > 0) {
            sb.append(String.format("• Có **%d** sản phẩm đã hết hàng trong kho, cần lên kế hoạch nhập tái bản từ NXB.\n", totalOutOfStock));
        }
        if (pendingApprovalCount == 0 && totalOutOfStock == 0) {
            sb.append("• Mọi chỉ số vận hành đang ở mức tối ưu, không có tồn đọng xử lý đơn hàng.\n");
        }

        List<ChatAction> actions = new ArrayList<>();
        if (pendingApprovalCount > 0) {
            actions.add(ChatAction.of(ChatActionType.NAVIGATE, "Duyệt " + pendingApprovalCount + " đơn chờ", Map.of("path", "/admin/orders?status=PENDING")));
        }
        if (totalLowStock > 0 || totalOutOfStock > 0) {
            actions.add(ChatAction.of(ChatActionType.NAVIGATE, "Kiểm tra kho hàng", Map.of("path", "/admin/books")));
        }

        return ToolResult.ok(sb.toString(), briefingData, ChatActionType.DAILY_BRIEFING, List.of(briefingData), actions);
    }
}
