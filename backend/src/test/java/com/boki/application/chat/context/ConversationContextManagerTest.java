package com.boki.application.chat.context;

import com.boki.domain.chat.model.ConversationState;
import com.boki.domain.chat.model.PageContext;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class ConversationContextManagerTest {

    private ConversationContextManager contextManager;

    @BeforeEach
    void setUp() {
        contextManager = new ConversationContextManager();
    }

    @Test
    @DisplayName("Parse book detail slug path into BOOK_DETAIL PageContext")
    void testParseBookDetailSlug() {
        PageContext ctx = contextManager.parsePageContext("/books/one-piece-tap-102");
        assertEquals(PageContext.PageType.BOOK_DETAIL, ctx.pageType());
        assertEquals("one-piece-tap-102", ctx.entitySlug());
        assertNull(ctx.entityId());
    }

    @Test
    @DisplayName("Parse book detail UUID path into BOOK_DETAIL PageContext with entityId")
    void testParseBookDetailUuid() {
        UUID id = UUID.randomUUID();
        PageContext ctx = contextManager.parsePageContext("/books/" + id);
        assertEquals(PageContext.PageType.BOOK_DETAIL, ctx.pageType());
        assertEquals(id.toString(), ctx.entityId());
    }

    @Test
    @DisplayName("Parse cart, checkout and admin paths")
    void testParseVariousPaths() {
        assertEquals(PageContext.PageType.CART, contextManager.parsePageContext("/cart").pageType());
        assertEquals(PageContext.PageType.CHECKOUT, contextManager.parsePageContext("/checkout").pageType());
        assertEquals(PageContext.PageType.ADMIN_DASHBOARD, contextManager.parsePageContext("/admin").pageType());
        assertEquals(PageContext.PageType.ADMIN_ORDERS, contextManager.parsePageContext("/admin/orders").pageType());
        assertEquals(PageContext.PageType.HOME, contextManager.parsePageContext("/").pageType());
    }

    @Test
    @DisplayName("Resolve follow-up ordinals accurately")
    void testResolveFollowUpOrdinal() {
        assertEquals(1, contextManager.resolveFollowUpOrdinal("cuốn đầu tiên bao nhiêu tiền?"));
        assertEquals(1, contextManager.resolveFollowUpOrdinal("bộ thứ nhất"));
        assertEquals(2, contextManager.resolveFollowUpOrdinal("bộ thứ 2 có giảm giá không"));
        assertEquals(2, contextManager.resolveFollowUpOrdinal("cuốn thứ 2"));
        assertEquals(3, contextManager.resolveFollowUpOrdinal("bộ thứ 3 tác giả là ai?"));
        assertNull(contextManager.resolveFollowUpOrdinal("giá cuốn sách này thế nào"));
    }

    @Test
    @DisplayName("Session state maintains history and recommended books")
    void testSessionStateManagement() {
        UUID userId = UUID.randomUUID();
        ConversationState state = contextManager.getOrCreateSession("sess-1", userId, "BUYER", "/books/naruto");

        assertEquals(userId, state.getUserId());
        assertEquals("BUYER", state.getUserRole());
        assertEquals(PageContext.PageType.BOOK_DETAIL, state.getPageContext().pageType());

        UUID book1 = UUID.randomUUID();
        UUID book2 = UUID.randomUUID();
        state.addRecommendedBooks(List.of(book1, book2));

        assertEquals(2, state.getRecommendedBooks().size());
        assertEquals(book2, state.getRecommendedBooks().get(1));

        state.addTurn("user", "Tìm sách hay", List.of());
        state.addTurn("assistant", "Đây là sách cho bạn", List.of("searchBooks"));

        assertEquals(2, state.getRecentMessages().size());
        assertEquals("user", state.getRecentMessages().get(0).role());
    }
}
