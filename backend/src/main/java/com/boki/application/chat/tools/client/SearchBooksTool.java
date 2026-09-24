package com.boki.application.chat.tools.client;

import com.boki.domain.chat.model.ChatAction;
import com.boki.domain.chat.model.ChatActionType;
import com.boki.domain.chat.tool.*;
import com.boki.infrastructure.persistence.entity.BookImageJpaEntity;
import com.boki.infrastructure.persistence.entity.BookJpaEntity;
import com.boki.infrastructure.persistence.repository.BookJpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.*;

@Component
public class SearchBooksTool implements ChatTool {

    private final BookJpaRepository bookRepository;

    public SearchBooksTool(BookJpaRepository bookRepository) {
        this.bookRepository = bookRepository;
    }

    @Override
    public String getName() {
        return "searchBooks";
    }

    @Override
    public ToolMetadata getMetadata() {
        return ToolMetadata.client(
                "searchBooks",
                "Tìm kiếm sách theo từ khóa (tên sách, tác giả), thể loại, mức giá tối đa, hoặc đánh giá.",
                Map.of(
                        "query", "Từ khóa tìm kiếm (tên sách, nhân vật, tác giả)",
                        "categoryId", "ID thể loại sách (nếu có)",
                        "maxPrice", "Mức giá tối đa mong muốn (VND)",
                        "limit", "Số lượng kết quả tối đa cần lấy (mặc định 4)"
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
        String query = params != null && params.get("query") != null ? params.get("query").toString().trim() : "";
        Integer categoryId = null;
        if (params != null && params.get("categoryId") != null) {
            try {
                categoryId = Integer.parseInt(params.get("categoryId").toString());
            } catch (NumberFormatException ignored) {}
        }

        BigDecimal maxPrice = null;
        if (params != null && params.get("maxPrice") != null) {
            try {
                maxPrice = new BigDecimal(params.get("maxPrice").toString());
            } catch (Exception ignored) {}
        }

        int limit = 4;
        if (params != null && params.get("limit") != null) {
            try {
                limit = Math.min(10, Math.max(1, Integer.parseInt(params.get("limit").toString())));
            } catch (Exception ignored) {}
        }

        Pageable pageable = PageRequest.of(0, limit, Sort.by(Sort.Direction.DESC, "viewsCount", "rating"));
        Page<BookJpaEntity> page;

        if (query.isEmpty() && categoryId == null) {
            page = bookRepository.findByStatus(BookJpaEntity.BookStatusJpa.ACTIVE, pageable);
        } else if (categoryId != null && !query.isEmpty()) {
            page = bookRepository.searchActiveBooksByCategory(BookJpaEntity.BookStatusJpa.ACTIVE, categoryId, query, pageable);
        } else if (categoryId != null) {
            page = bookRepository.findByStatusAndCategoryId(BookJpaEntity.BookStatusJpa.ACTIVE, categoryId, pageable);
        } else {
            page = bookRepository.searchActiveBooks(BookJpaEntity.BookStatusJpa.ACTIVE, query, pageable);
            if (page.isEmpty() && query.contains(" ")) {
                String[] words = query.split("\\s+");
                String longest = Arrays.stream(words).max(Comparator.comparingInt(String::length)).orElse(query);
                if (longest.length() >= 3) {
                    page = bookRepository.searchActiveBooks(BookJpaEntity.BookStatusJpa.ACTIVE, longest, pageable);
                }
            }
        }

        List<BookJpaEntity> books = page.getContent();
        if (maxPrice != null) {
            final BigDecimal filterPrice = maxPrice;
            books = books.stream()
                    .filter(b -> b.getPrice() != null && b.getPrice().compareTo(filterPrice) <= 0)
                    .toList();
        }

        if (books.isEmpty()) {
            return ToolResult.ok(
                    "Không tìm thấy tựa sách nào phù hợp với yêu cầu: " + (query.isEmpty() ? "các tiêu chí lọc" : "\"" + query + "\""),
                    List.of(),
                    ChatActionType.NONE,
                    List.of(),
                    List.of()
            );
        }

        // Lưu danh sách sách vừa gợi ý vào Conversation State để hỗ trợ câu hỏi tiếp nối ("bộ thứ 2 bao nhiêu?")
        List<UUID> foundIds = books.stream().map(BookJpaEntity::getId).toList();
        if (context.conversationState() != null) {
            context.conversationState().addRecommendedBooks(foundIds);
        }

        List<Object> cards = new ArrayList<>();
        for (BookJpaEntity book : books) {
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
            card.put("stock", book.getStockQuantity());
            card.put("isPreOrder", book.isPreOrder());
            card.put("coverUrl", coverUrl);

            List<ChatAction> itemActions = List.of(
                    ChatAction.of(ChatActionType.ADD_TO_CART, "Thêm vào giỏ", Map.of("bookId", book.getId().toString(), "quantity", 1)),
                    ChatAction.of(ChatActionType.NAVIGATE, "Xem chi tiết", Map.of("path", "/books/" + (book.getSlug() != null ? book.getSlug() : book.getId().toString())))
            );
            card.put("actions", itemActions);
            cards.add(card);
        }

        String summary = String.format("BokiStore tìm thấy %d tựa sách phù hợp với bạn:", books.size());
        return ToolResult.ok(summary, books, ChatActionType.BOOK_LIST, cards, List.of());
    }
}
