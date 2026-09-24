package com.boki.application.chat.tools.client;

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
public class CheckStockTool implements ChatTool {

    private final BookJpaRepository bookRepository;
    private final BookVariantJpaRepository variantRepository;

    public CheckStockTool(BookJpaRepository bookRepository, BookVariantJpaRepository variantRepository) {
        this.bookRepository = bookRepository;
        this.variantRepository = variantRepository;
    }

    @Override
    public String getName() {
        return "checkStock";
    }

    @Override
    public ToolMetadata getMetadata() {
        return ToolMetadata.client(
                "checkStock",
                "Kiểm tra số lượng tồn kho thực tế của một cuốn sách hoặc phân loại cụ thể theo thời gian thực.",
                Map.of(
                        "bookId", "UUID của cuốn sách",
                        "variantId", "UUID của phân loại (nếu có)",
                        "title", "Tên sách (nếu không có ID)"
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
        UUID bookId = null;
        UUID variantId = null;

        if (params != null && params.get("bookId") != null) {
            try {
                bookId = UUID.fromString(params.get("bookId").toString());
            } catch (Exception ignored) {}
        }
        if (params != null && params.get("variantId") != null) {
            try {
                variantId = UUID.fromString(params.get("variantId").toString());
            } catch (Exception ignored) {}
        }

        // Tự động suy luận từ trang hiện tại nếu chưa có ID
        if (bookId == null && context.pageContext() != null && context.pageContext().entityId() != null) {
            try {
                bookId = UUID.fromString(context.pageContext().entityId());
            } catch (Exception ignored) {}
        }

        if (variantId != null) {
            Optional<BookVariantJpaEntity> variantOpt = variantRepository.findById(variantId);
            if (variantOpt.isPresent()) {
                BookVariantJpaEntity v = variantOpt.get();
                int stock = v.getStockQuantity();
                String msg = stock > 0
                        ? String.format("Ấn bản **%s** hiện còn **%d** sản phẩm sẵn sàng giao ngay.", v.getName(), stock)
                        : String.format("Ấn bản **%s** hiện tại đã tạm hết hàng trong kho.", v.getName());
                return ToolResult.ok(msg, Map.of("variantId", v.getId(), "stock", stock, "name", v.getName()));
            }
        }

        if (bookId == null && params != null && params.get("title") != null) {
            var page = bookRepository.searchActiveBooks(BookJpaEntity.BookStatusJpa.ACTIVE, params.get("title").toString(), org.springframework.data.domain.PageRequest.of(0, 1));
            if (!page.isEmpty()) {
                bookId = page.getContent().get(0).getId();
            }
        }

        if (bookId == null) {
            return ToolResult.error("Vui lòng cho Boki biết tựa sách bạn muốn kiểm tra số lượng tồn kho nhé!");
        }

        Optional<BookJpaEntity> bookOpt = bookRepository.findById(bookId);
        if (bookOpt.isEmpty()) {
            return ToolResult.error("Không tìm thấy tựa sách này trong hệ thống kho BokiStore.");
        }

        BookJpaEntity book = bookOpt.get();
        int stock = book.getStockQuantity();
        String msg = stock > 0
                ? String.format("Sách **%s** hiện còn **%d** cuốn trong kho.", book.getTitle(), stock)
                : String.format("Sách **%s** hiện đã tạm hết hàng. Bạn có thể nhấn theo dõi để nhận thông báo khi có hàng lại.", book.getTitle());

        return ToolResult.ok(msg, Map.of("bookId", book.getId(), "stock", stock, "title", book.getTitle()),
                ChatActionType.NONE, List.of(),
                stock > 0 ? List.of(ChatAction.of(ChatActionType.ADD_TO_CART, "Thêm vào giỏ", Map.of("bookId", book.getId().toString(), "quantity", 1))) : List.of()
        );
    }
}
