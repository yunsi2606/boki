package com.boki.application.chat.orchestrator;

import com.boki.application.chat.context.ConversationContextManager;
import com.boki.application.chat.context.SmartFallbackProvider;
import com.boki.application.chat.tools.ToolRouter;
import com.boki.application.chat.tools.client.CheckShippingFeeTool;
import com.boki.domain.chat.model.ChatActionType;
import com.boki.domain.chat.tool.*;
import com.boki.infrastructure.chat.provider.MockAiProvider;
import com.boki.infrastructure.persistence.entity.ChatAuditLogJpaEntity;
import com.boki.infrastructure.persistence.repository.ChatAuditLogJpaRepository;
import com.boki.interfaces.rest.chat.dto.ChatRequestDto;
import com.boki.interfaces.rest.chat.dto.ChatResponseDto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

class AiOrchestratorTest {

    private AiOrchestrator orchestrator;
    private ChatAuditLogJpaRepository auditLogRepository;

    // Dummy test tool for orders
    private static class DummyOrderTool implements ChatTool {
        @Override public String getName() { return "getOrder"; }
        @Override public ToolMetadata getMetadata() { return ToolMetadata.client("getOrder", "test", Map.of(), List.of()); }
        @Override public ToolPermission getRequiredPermission() { return ToolPermission.PUBLIC; }
        @Override public ToolResult execute(ToolExecutionContext context, Map<String, Object> params) {
            String code = params != null ? String.valueOf(params.get("orderCode")) : "unknown";
            return ToolResult.ok("Đơn hàng " + code + " đang giao hàng", Map.of("orderCode", code), ChatActionType.ORDER_INFO, List.of(), List.of());
        }
    }

    // Dummy test tool for books
    private static class DummySearchBooksTool implements ChatTool {
        @Override public String getName() { return "searchBooks"; }
        @Override public ToolMetadata getMetadata() { return ToolMetadata.client("searchBooks", "test", Map.of(), List.of()); }
        @Override public ToolPermission getRequiredPermission() { return ToolPermission.PUBLIC; }
        @Override public ToolResult execute(ToolExecutionContext context, Map<String, Object> params) {
            UUID id1 = UUID.randomUUID();
            UUID id2 = UUID.randomUUID();
            if (context.conversationState() != null) {
                context.conversationState().addRecommendedBooks(List.of(id1, id2));
            }
            return ToolResult.ok("Tìm thấy 2 tựa sách", List.of(), ChatActionType.BOOK_LIST, List.of(), List.of());
        }
    }

    private static class DummyGetBookDetailTool implements ChatTool {
        @Override public String getName() { return "getBookDetail"; }
        @Override public ToolMetadata getMetadata() { return ToolMetadata.client("getBookDetail", "test", Map.of(), List.of()); }
        @Override public ToolPermission getRequiredPermission() { return ToolPermission.PUBLIC; }
        @Override public ToolResult execute(ToolExecutionContext context, Map<String, Object> params) {
            Object index = params.get("index");
            return ToolResult.ok("Chi tiết cuốn số " + index, Map.of(), ChatActionType.BOOK_LIST, List.of(), List.of());
        }
    }

    @BeforeEach
    void setUp() {
        ConversationContextManager contextManager = new ConversationContextManager();
        SmartFallbackProvider fallbackProvider = new SmartFallbackProvider();
        ToolRouter toolRouter = new ToolRouter(List.of(
                new DummyOrderTool(),
                new DummySearchBooksTool(),
                new DummyGetBookDetailTool(),
                new CheckShippingFeeTool()
        ));
        MockAiProvider mockAiProvider = new MockAiProvider(contextManager);

        auditLogRepository = Mockito.mock(ChatAuditLogJpaRepository.class);
        when(auditLogRepository.save(any(ChatAuditLogJpaEntity.class))).thenAnswer(invocation -> {
            ChatAuditLogJpaEntity entity = invocation.getArgument(0);
            entity.setId(101L);
            return entity;
        });

        orchestrator = new AiOrchestrator(
                contextManager, fallbackProvider, toolRouter, List.of(mockAiProvider), auditLogRepository
        );
    }

    @Test
    @DisplayName("Fast-path regex triggers order tracking with zero LLM overhead")
    void testFastPathOrderTracking() {
        ChatRequestDto req = new ChatRequestDto("BK-20260924-9999", "sess-test-1", "/");
        ChatResponseDto res = orchestrator.processMessage(req, null, "GUEST", "127.0.0.1");

        assertNotNull(res);
        assertEquals(ChatActionType.ORDER_INFO, res.actionType());
        assertTrue(res.text().contains("BK-20260924-9999"));
    }

    @Test
    @DisplayName("Natural shipping query invokes checkShippingFee tool")
    void testShippingQuery() {
        ChatRequestDto req = new ChatRequestDto("Phí ship đến Hà Nội là bao nhiêu?", "sess-test-2", "/cart");
        ChatResponseDto res = orchestrator.processMessage(req, null, "GUEST", "127.0.0.1");

        assertNotNull(res);
        assertTrue(res.text().contains("Phí giao hàng dự kiến"));
    }

    @Test
    @DisplayName("Multi-turn follow-up resolves ordinal index accurately")
    void testMultiTurnOrdinalResolution() {
        String sessionId = "sess-multi-turn";

        // Turn 1: Search books
        ChatRequestDto turn1 = new ChatRequestDto("Tìm manga thể thao hay", sessionId, "/");
        ChatResponseDto res1 = orchestrator.processMessage(turn1, null, "GUEST", "127.0.0.1");
        assertEquals(ChatActionType.BOOK_LIST, res1.actionType());

        // Turn 2: Follow-up on book #2
        ChatRequestDto turn2 = new ChatRequestDto("Bộ thứ 2 bao nhiêu tiền?", sessionId, "/");
        ChatResponseDto res2 = orchestrator.processMessage(turn2, null, "GUEST", "127.0.0.1");
        assertTrue(res2.text().contains("Chi tiết cuốn số 2"));
    }

    @Test
    @DisplayName("Ambiguous query returns smart fallback with helpful chips")
    void testSmartFallbackOnAmbiguousInput() {
        ChatRequestDto req = new ChatRequestDto("asdkjhqwuey123987???", "sess-test-3", "/cart");
        ChatResponseDto res = orchestrator.processMessage(req, null, "GUEST", "127.0.0.1");

        assertNotNull(res);
        assertTrue(res.text().contains("Boki chưa rõ câu hỏi"));
        assertFalse(res.actions().isEmpty());
        assertFalse(res.suggestions().isEmpty());
    }
}
