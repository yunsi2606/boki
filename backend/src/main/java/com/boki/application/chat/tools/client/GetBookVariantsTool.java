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
public class GetBookVariantsTool implements ChatTool {

    private final BookVariantJpaRepository variantRepository;
    private final BookJpaRepository bookRepository;

    public GetBookVariantsTool(BookVariantJpaRepository variantRepository, BookJpaRepository bookRepository) {
        this.variantRepository = variantRepository;
        this.bookRepository = bookRepository;
    }

    @Override
    public String getName() {
        return "getBookVariants";
    }

    @Override
    public ToolMetadata getMetadata() {
        return ToolMetadata.client(
                "getBookVariants",
                "Tra cứu các phân loại hoặc ấn bản của sách (Boxset, Bản đặc biệt, Bìa áo rời, Tặng kèm Bookmark...).",
                Map.of(
                        "bookId", "UUID của sách cần tìm phân loại",
                        "variantKeyword", "Từ khóa phân loại (e.g. 'boxset', 'đặc biệt', 'limited')"
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

        if (params != null && params.get("bookId") != null) {
            try {
                bookId = UUID.fromString(params.get("bookId").toString());
            } catch (Exception ignored) {}
        }

        // Tự động suy luận từ sách vừa xem hoặc trang hiện tại
        if (bookId == null && context.conversationState() != null && !context.conversationState().getViewedBooks().isEmpty()) {
            bookId = context.conversationState().getViewedBooks().get(context.conversationState().getViewedBooks().size() - 1);
        }

        if (bookId == null && context.pageContext() != null && context.pageContext().entityId() != null) {
            try {
                bookId = UUID.fromString(context.pageContext().entityId());
            } catch (Exception ignored) {}
        }

        if (bookId == null) {
            return ToolResult.error("Vui lòng cho Boki biết bạn muốn tìm phân loại hoặc ấn bản của tựa sách nào nhé!");
        }

        Optional<BookJpaEntity> bookOpt = bookRepository.findById(bookId);
        String bookTitle = bookOpt.map(BookJpaEntity::getTitle).orElse("cuốn sách");

        List<BookVariantJpaEntity> variants = variantRepository.findByBookId(bookId);
        String keyword = params != null && params.get("variantKeyword") != null ? params.get("variantKeyword").toString().toLowerCase().trim() : null;

        if (keyword != null && !keyword.isEmpty()) {
            variants = variants.stream()
                    .filter(v -> (v.getName() != null && v.getName().toLowerCase().contains(keyword)) ||
                                 (v.getSku() != null && v.getSku().toLowerCase().contains(keyword)))
                    .toList();
        }

        if (variants.isEmpty()) {
            return ToolResult.ok(
                    String.format("Hiện tại **%s** chưa có phân loại nào %s. Sách hiện chỉ có bản tiêu chuẩn với giá %,.0f ₫.",
                            bookTitle, keyword != null ? "khớp với '" + keyword + "'" : "khác",
                            bookOpt.map(b -> b.getPrice().doubleValue()).orElse(0.0)),
                    List.of(),
                    ChatActionType.NONE,
                    List.of(),
                    List.of()
            );
        }

        List<Object> variantCards = new ArrayList<>();
        List<ChatAction> actions = new ArrayList<>();

        for (BookVariantJpaEntity v : variants) {
            Map<String, Object> card = new LinkedHashMap<>();
            card.put("variantId", v.getId());
            card.put("name", v.getName());
            card.put("sku", v.getSku());
            card.put("price", v.getPrice());
            card.put("originalPrice", v.getOriginalPrice());
            card.put("stock", v.getStockQuantity());
            card.put("bookTitle", bookTitle);
            variantCards.add(card);

            if (v.getStockQuantity() > 0) {
                actions.add(ChatAction.of(
                        ChatActionType.ADD_TO_CART,
                        "Chọn " + v.getName(),
                        Map.of("bookId", bookId.toString(), "variantId", v.getId().toString(), "quantity", 1)
                ));
            }
        }

        String msg = String.format("BokiStore có %d phân loại/ấn bản cho **%s**:", variants.size(), bookTitle);
        return ToolResult.ok(msg, variantCards, ChatActionType.BOOK_LIST, variantCards, actions);
    }
}
