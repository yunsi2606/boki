package com.boki.application.chat.tools.admin;

import com.boki.domain.chat.model.ChatAction;
import com.boki.domain.chat.model.ChatActionType;
import com.boki.domain.chat.tool.*;
import com.boki.infrastructure.persistence.entity.BookJpaEntity;
import com.boki.infrastructure.persistence.entity.BookVariantJpaEntity;
import com.boki.infrastructure.persistence.repository.BookJpaRepository;
import com.boki.infrastructure.persistence.repository.BookVariantJpaRepository;
import org.springframework.stereotype.Component;

import java.util.*;

@Component
public class GetLowStockTool implements ChatTool {

    private final BookJpaRepository bookRepository;
    private final BookVariantJpaRepository variantRepository;

    public GetLowStockTool(BookJpaRepository bookRepository, BookVariantJpaRepository variantRepository) {
        this.bookRepository = bookRepository;
        this.variantRepository = variantRepository;
    }

    @Override
    public String getName() {
        return "getLowStock";
    }

    @Override
    public ToolMetadata getMetadata() {
        return ToolMetadata.admin(
                "getLowStock",
                "Quét danh sách các tựa sách hoặc phân loại hàng sắp hết hàng (tồn kho < ngưỡng cảnh báo) hoặc đã hết hàng.",
                Map.of(
                        "threshold", "Ngưỡng số lượng tồn cảnh báo (mặc định là 5)",
                        "outOfStockOnly", "Chỉ lấy các sản phẩm đã hết hàng (true/false)"
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
        int threshold = 5;
        if (params != null && params.get("threshold") != null) {
            try {
                threshold = Math.max(1, Integer.parseInt(params.get("threshold").toString()));
            } catch (Exception ignored) {}
        }

        boolean outOfStockOnly = params != null && Boolean.parseBoolean(String.valueOf(params.get("outOfStockOnly")));

        List<BookJpaEntity> allBooks = bookRepository.findAll();
        List<BookVariantJpaEntity> allVariants = variantRepository.findAll();

        final int limitStock = threshold;
        List<Map<String, Object>> lowStockItems = new ArrayList<>();

        // 1. Quét sách chính
        for (BookJpaEntity book : allBooks) {
            if (outOfStockOnly && book.getStockQuantity() == 0) {
                lowStockItems.add(createStockEntry(book.getId().toString(), book.getTitle(), null, 0, "BOOK"));
            } else if (!outOfStockOnly && book.getStockQuantity() <= limitStock) {
                lowStockItems.add(createStockEntry(book.getId().toString(), book.getTitle(), null, book.getStockQuantity(), "BOOK"));
            }
        }

        // 2. Quét phân loại
        for (BookVariantJpaEntity v : allVariants) {
            if (outOfStockOnly && v.getStockQuantity() == 0) {
                lowStockItems.add(createStockEntry(v.getId().toString(), v.getName(), v.getSku(), 0, "VARIANT"));
            } else if (!outOfStockOnly && v.getStockQuantity() <= limitStock) {
                lowStockItems.add(createStockEntry(v.getId().toString(), v.getName(), v.getSku(), v.getStockQuantity(), "VARIANT"));
            }
        }

        if (lowStockItems.isEmpty()) {
            return ToolResult.ok(
                    String.format("Kho hàng hiện đang trong tình trạng rất tốt! Không có sản phẩm nào có số lượng tồn kho <= %d.", threshold),
                    List.of(),
                    ChatActionType.NONE,
                    List.of(),
                    List.of()
            );
        }

        StringBuilder sb = new StringBuilder();
        sb.append(String.format("⚠️ **Cảnh báo Tồn kho BokiStore (Ngưỡng <= %d):**\n\n", threshold));
        sb.append(String.format("Phát hiện tổng cộng **%d** mặt hàng/phân loại cần nhập thêm:\n", lowStockItems.size()));

        int displayCount = Math.min(6, lowStockItems.size());
        for (int i = 0; i < displayCount; i++) {
            Map<String, Object> item = lowStockItems.get(i);
            int stock = (int) item.get("stock");
            sb.append(String.format("• %s **%s**: Còn **%d** sản phẩm %s\n",
                    stock == 0 ? "🔴" : "🟡",
                    item.get("title"),
                    stock,
                    stock == 0 ? "(HẾT HÀNG)" : ""));
        }

        if (lowStockItems.size() > displayCount) {
            sb.append(String.format("... và còn **%d** sản phẩm khác.\n", lowStockItems.size() - displayCount));
        }

        List<ChatAction> actions = List.of(
                ChatAction.of(ChatActionType.NAVIGATE, "Quản lý kho sách", Map.of("path", "/admin/books"))
        );

        return ToolResult.ok(sb.toString(), lowStockItems, ChatActionType.ADMIN_METRIC, new ArrayList<>(lowStockItems), actions);
    }

    private Map<String, Object> createStockEntry(String id, String title, String sku, int stock, String type) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", id);
        map.put("title", title);
        map.put("sku", sku);
        map.put("stock", stock);
        map.put("type", type);
        return map;
    }
}
