package com.boki.application.chat.tools.client;

import com.boki.domain.chat.model.ChatAction;
import com.boki.domain.chat.model.ChatActionType;
import com.boki.domain.chat.tool.*;
import com.boki.infrastructure.persistence.entity.BookImageJpaEntity;
import com.boki.infrastructure.persistence.entity.BookJpaEntity;
import com.boki.infrastructure.persistence.repository.BookJpaRepository;
import org.springframework.stereotype.Component;

import java.util.*;

@Component
public class GetBookDetailTool implements ChatTool {

    private final BookJpaRepository bookRepository;

    public GetBookDetailTool(BookJpaRepository bookRepository) {
        this.bookRepository = bookRepository;
    }

    @Override
    public String getName() {
        return "getBookDetail";
    }

    @Override
    public ToolMetadata getMetadata() {
        return ToolMetadata.client(
                "getBookDetail",
                "Lấy thông tin chi tiết một cuốn sách (giá, tồn kho, mô tả, tình trạng, quà tặng). Tự động lấy từ trang đang xem nếu không truyền id.",
                Map.of(
                        "bookId", "UUID của cuốn sách",
                        "slug", "Slug đường dẫn của sách",
                        "index", "Thứ tự sách trong danh sách vừa gợi ý (e.g. 1, 2, 3)"
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
        Optional<BookJpaEntity> bookOpt = Optional.empty();

        // 1. Kiểm tra nếu có index tham chiếu trong danh sách vừa gợi ý (e.g. "bộ thứ 2")
        if (params != null && params.get("index") != null && context.conversationState() != null) {
            try {
                int idx = Integer.parseInt(params.get("index").toString()) - 1; // 1-indexed to 0-indexed
                List<UUID> recs = context.conversationState().getRecommendedBooks();
                if (idx >= 0 && idx < recs.size()) {
                    bookOpt = bookRepository.findById(recs.get(idx));
                }
            } catch (Exception ignored) {}
        }

        // 2. Tra theo bookId nếu có
        if (bookOpt.isEmpty() && params != null && params.get("bookId") != null) {
            try {
                UUID id = UUID.fromString(params.get("bookId").toString());
                bookOpt = bookRepository.findById(id);
            } catch (IllegalArgumentException ignored) {}
        }

        // 3. Tra theo slug nếu có
        if (bookOpt.isEmpty() && params != null && params.get("slug") != null) {
            bookOpt = bookRepository.findBySlug(params.get("slug").toString());
        }

        // 4. Nếu vẫn trống, suy luận từ PageContext hiện tại (nếu khách đang ở trang chi tiết sách)
        if (bookOpt.isEmpty() && context.pageContext() != null) {
            if (context.pageContext().entityId() != null) {
                try {
                    bookOpt = bookRepository.findById(UUID.fromString(context.pageContext().entityId()));
                } catch (Exception ignored) {}
            }
            if (bookOpt.isEmpty() && context.pageContext().entitySlug() != null) {
                bookOpt = bookRepository.findBySlug(context.pageContext().entitySlug());
            }
        }

        if (bookOpt.isEmpty()) {
            return ToolResult.error("Không tìm thấy thông tin cuốn sách yêu cầu.");
        }

        BookJpaEntity book = bookOpt.get();
        if (context.conversationState() != null) {
            context.conversationState().addViewedBook(book.getId());
        }

        String coverUrl = null;
        if (book.getImages() != null && !book.getImages().isEmpty()) {
            coverUrl = book.getImages().stream()
                    .filter(BookImageJpaEntity::isPrimary)
                    .findFirst()
                    .map(BookImageJpaEntity::getImageUrl)
                    .orElse(book.getImages().get(0).getImageUrl());
        }

        Map<String, Object> card = new LinkedHashMap<>();
        card.put("id", book.getId());
        card.put("title", book.getTitle());
        card.put("slug", book.getSlug());
        card.put("author", book.getAuthor());
        card.put("price", book.getPrice());
        card.put("originalPrice", book.getOriginalPrice());
        card.put("rating", book.getRating());
        card.put("reviewsCount", book.getReviewsCount());
        card.put("stock", book.getStockQuantity());
        card.put("isPreOrder", book.isPreOrder());
        card.put("condition", book.getCondition() != null ? book.getCondition().name() : "GOOD");
        card.put("coverUrl", coverUrl);
        card.put("description", book.getDescription());

        List<ChatAction> actions = List.of(
                ChatAction.of(ChatActionType.ADD_TO_CART, "Thêm vào giỏ", Map.of("bookId", book.getId().toString(), "quantity", 1)),
                ChatAction.of(ChatActionType.NAVIGATE, "Xem trên web", Map.of("path", "/books/" + (book.getSlug() != null ? book.getSlug() : book.getId().toString())))
        );

        String message = String.format("Thông tin sách **%s** của tác giả **%s**:\n- Giá bán: %,.0f ₫\n- Tồn kho: %d cuốn\n- Đánh giá: %.1f ⭐ (%d lượt đánh giá)",
                book.getTitle(), book.getAuthor(), book.getPrice().doubleValue(), book.getStockQuantity(), book.getRating().doubleValue(), book.getReviewsCount());

        return ToolResult.ok(message, card, ChatActionType.BOOK_LIST, List.of(card), actions);
    }
}
