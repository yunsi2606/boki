package com.boki.application.chat.context;

import com.boki.domain.chat.model.ConversationState;
import com.boki.domain.chat.model.PageContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
public class ConversationContextManager {

    private static final Logger log = LoggerFactory.getLogger(ConversationContextManager.class);
    private static final Duration SESSION_TTL = Duration.ofMinutes(30);

    private final Map<String, ConversationState> sessions = new ConcurrentHashMap<>();

    private static final Pattern BOOK_PATH_PATTERN = Pattern.compile("^/books/([^/?#]+)");
    private static final Pattern CATEGORY_PATH_PATTERN = Pattern.compile("^/category/([^/?#]+)");
    private static final Pattern BLOG_PATH_PATTERN = Pattern.compile("^/blog/([^/?#]+)");

    /**
     * Lấy hoặc tạo mới ConversationState cho sessionId.
     * Tự động trích xuất PageContext từ currentPath.
     */
    public ConversationState getOrCreateSession(String sessionId, UUID userId, String userRole, String currentPath) {
        String key = (sessionId != null && !sessionId.isBlank()) ? sessionId : "anon-" + UUID.randomUUID();
        ConversationState state = sessions.computeIfAbsent(key, ConversationState::new);

        if (userId != null) {
            state.setUserId(userId);
        }
        if (userRole != null) {
            state.setUserRole(userRole);
        }
        if (currentPath != null && !currentPath.isBlank()) {
            state.setCurrentPath(currentPath);
            state.setPageContext(parsePageContext(currentPath));
        }
        state.setLastActiveAt(Instant.now());
        return state;
    }

    /**
     * Tự động phân tích currentPath thành PageContext.
     */
    public PageContext parsePageContext(String path) {
        if (path == null || path.isBlank() || "/".equals(path)) {
            return PageContext.of(PageContext.PageType.HOME, null, null, Map.of());
        }

        String cleanPath = path.trim();

        // 1. Chi tiết sách: /books/[slug] hoặc /books/[uuid]
        Matcher bookMatcher = BOOK_PATH_PATTERN.matcher(cleanPath);
        if (bookMatcher.find()) {
            String slugOrId = bookMatcher.group(1);
            try {
                UUID bookId = UUID.fromString(slugOrId);
                return PageContext.of(PageContext.PageType.BOOK_DETAIL, bookId.toString(), null, Map.of("slugOrId", slugOrId));
            } catch (IllegalArgumentException e) {
                return PageContext.of(PageContext.PageType.BOOK_DETAIL, null, slugOrId, Map.of("slugOrId", slugOrId));
            }
        }

        if (cleanPath.startsWith("/books")) {
            return PageContext.of(PageContext.PageType.BOOK_LIST, null, null, Map.of());
        }

        // 2. Thể loại
        Matcher catMatcher = CATEGORY_PATH_PATTERN.matcher(cleanPath);
        if (catMatcher.find()) {
            return PageContext.of(PageContext.PageType.CATEGORY, catMatcher.group(1), null, Map.of());
        }

        // 3. Giỏ hàng & Thanh toán
        if (cleanPath.startsWith("/cart")) {
            return PageContext.of(PageContext.PageType.CART, null, null, Map.of());
        }
        if (cleanPath.startsWith("/checkout")) {
            return PageContext.of(PageContext.PageType.CHECKOUT, null, null, Map.of());
        }
        if (cleanPath.startsWith("/orders")) {
            return PageContext.of(PageContext.PageType.ORDER_TRACKING, null, null, Map.of());
        }

        // 4. Bài viết blog
        Matcher blogMatcher = BLOG_PATH_PATTERN.matcher(cleanPath);
        if (blogMatcher.find()) {
            return PageContext.of(PageContext.PageType.BLOG_DETAIL, null, blogMatcher.group(1), Map.of());
        }

        // 5. Admin pages
        if (cleanPath.startsWith("/admin/orders")) {
            return PageContext.of(PageContext.PageType.ADMIN_ORDERS, null, null, Map.of());
        }
        if (cleanPath.startsWith("/admin/books")) {
            return PageContext.of(PageContext.PageType.ADMIN_BOOKS, null, null, Map.of());
        }
        if (cleanPath.startsWith("/admin/vouchers")) {
            return PageContext.of(PageContext.PageType.ADMIN_VOUCHERS, null, null, Map.of());
        }
        if (cleanPath.startsWith("/admin")) {
            return PageContext.of(PageContext.PageType.ADMIN_DASHBOARD, null, null, Map.of());
        }

        return PageContext.unknown();
    }

    /**
     * Giải quyết tham chiếu tiếp nối (Reference Resolution) từ câu nói người dùng.
     * Trả về số thứ tự index (1-based) nếu phát hiện các mẫu "bộ thứ 2", "cuốn đầu", "bộ thứ nhì"...
     */
    public Integer resolveFollowUpOrdinal(String text) {
        if (text == null) return null;
        String lower = text.toLowerCase().trim();

        if (lower.contains("bộ thứ nhất") || lower.contains("bộ thứ 1") || lower.contains("cuốn đầu") || lower.contains("bộ đầu tiên") || lower.contains("quyển đầu")) {
            return 1;
        }
        if (lower.contains("bộ thứ hai") || lower.contains("bộ thứ 2") || lower.contains("bộ thứ nhì") || lower.contains("cuốn thứ 2") || lower.contains("quyển 2")) {
            return 2;
        }
        if (lower.contains("bộ thứ ba") || lower.contains("bộ thứ 3") || lower.contains("cuốn thứ 3") || lower.contains("quyển 3")) {
            return 3;
        }
        if (lower.contains("bộ thứ tư") || lower.contains("bộ thứ 4") || lower.contains("cuốn thứ 4") || lower.contains("quyển 4")) {
            return 4;
        }
        return null;
    }

    /**
     * Dọn dẹp các session không hoạt động quá 30 phút.
     */
    @Scheduled(fixedRate = 600000) // Chạy mỗi 10 phút
    public void cleanupExpiredSessions() {
        Instant cutoff = Instant.now().minus(SESSION_TTL);
        int initialSize = sessions.size();
        sessions.entrySet().removeIf(entry -> entry.getValue().getLastActiveAt().isBefore(cutoff));
        int removed = initialSize - sessions.size();
        if (removed > 0) {
            log.info("Cleaned up {} expired chat sessions. Active remaining: {}", removed, sessions.size());
        }
    }
}
