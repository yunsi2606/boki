package com.boki.application.chat.tools;

import com.boki.application.chat.tools.client.CheckShippingFeeTool;
import com.boki.domain.chat.model.ConversationState;
import com.boki.domain.chat.model.PageContext;
import com.boki.domain.chat.tool.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class ToolRouterTest {

    private ToolRouter toolRouter;

    // Dummy mock tools for permission testing
    private static class DummyPublicTool implements ChatTool {
        @Override public String getName() { return "dummyPublic"; }
        @Override public ToolMetadata getMetadata() { return ToolMetadata.client("dummyPublic", "test", Map.of(), List.of()); }
        @Override public ToolPermission getRequiredPermission() { return ToolPermission.PUBLIC; }
        @Override public ToolResult execute(ToolExecutionContext context, Map<String, Object> params) {
            return ToolResult.ok("Success public", null);
        }
    }

    private static class DummyBuyerTool implements ChatTool {
        @Override public String getName() { return "dummyBuyer"; }
        @Override public ToolMetadata getMetadata() { return ToolMetadata.client("dummyBuyer", "test", Map.of(), List.of()); }
        @Override public ToolPermission getRequiredPermission() { return ToolPermission.BUYER_ONLY; }
        @Override public ToolResult execute(ToolExecutionContext context, Map<String, Object> params) {
            return ToolResult.ok("Success buyer", null);
        }
    }

    private static class DummyAdminTool implements ChatTool {
        @Override public String getName() { return "dummyAdmin"; }
        @Override public ToolMetadata getMetadata() { return ToolMetadata.admin("dummyAdmin", "test", Map.of(), List.of()); }
        @Override public ToolPermission getRequiredPermission() { return ToolPermission.ADMIN_ONLY; }
        @Override public ToolResult execute(ToolExecutionContext context, Map<String, Object> params) {
            return ToolResult.ok("Success admin", null);
        }
    }

    @BeforeEach
    void setUp() {
        toolRouter = new ToolRouter(List.of(
                new DummyPublicTool(),
                new DummyBuyerTool(),
                new DummyAdminTool(),
                new CheckShippingFeeTool()
        ));
    }

    @Test
    @DisplayName("Guest calling PUBLIC tool should succeed")
    void testPublicToolAllowedForGuest() {
        ToolExecutionContext guestContext = new ToolExecutionContext(
                null, "GUEST", "session-1", "/", PageContext.unknown(), new ConversationState("session-1")
        );

        ToolResult result = toolRouter.executeTool("dummyPublic", guestContext, Map.of());
        assertTrue(result.success());
        assertEquals("Success public", result.message());
    }

    @Test
    @DisplayName("CheckShippingFeeTool should calculate correctly for guest")
    void testCheckShippingFeeTool() {
        ToolExecutionContext guestContext = new ToolExecutionContext(
                null, "GUEST", "session-1", "/cart", PageContext.unknown(), new ConversationState("session-1")
        );

        ToolResult result = toolRouter.executeTool("checkShippingFee", guestContext, Map.of("orderTotal", "300000"));
        assertTrue(result.success());
        assertTrue(result.message().contains("MIỄN PHÍ VẬN CHUYỂN"));
    }

    @Test
    @DisplayName("Guest calling BUYER_ONLY or ADMIN_ONLY tool should be denied")
    void testGuestDeniedForRestrictedTools() {
        ToolExecutionContext guestContext = new ToolExecutionContext(
                null, "GUEST", "session-1", "/", PageContext.unknown(), new ConversationState("session-1")
        );

        ToolResult buyerResult = toolRouter.executeTool("dummyBuyer", guestContext, Map.of());
        assertFalse(buyerResult.success());
        assertTrue(buyerResult.message().contains("Truy cập bị từ chối"));

        ToolResult adminResult = toolRouter.executeTool("dummyAdmin", guestContext, Map.of());
        assertFalse(adminResult.success());
        assertTrue(adminResult.message().contains("Truy cập bị từ chối"));
    }

    @Test
    @DisplayName("Authenticated Buyer calling BUYER_ONLY tool should succeed, but denied for ADMIN_ONLY")
    void testBuyerPermissions() {
        UUID buyerId = UUID.randomUUID();
        ToolExecutionContext buyerContext = new ToolExecutionContext(
                buyerId, "BUYER", "session-2", "/", PageContext.unknown(), new ConversationState("session-2")
        );

        ToolResult buyerResult = toolRouter.executeTool("dummyBuyer", buyerContext, Map.of());
        assertTrue(buyerResult.success());

        ToolResult adminResult = toolRouter.executeTool("dummyAdmin", buyerContext, Map.of());
        assertFalse(adminResult.success());
        assertTrue(adminResult.message().contains("Truy cập bị từ chối"));
    }

    @Test
    @DisplayName("Admin calling ADMIN_ONLY tool should succeed")
    void testAdminPermissions() {
        UUID adminId = UUID.randomUUID();
        ToolExecutionContext adminContext = new ToolExecutionContext(
                adminId, "ADMIN", "session-3", "/admin", PageContext.unknown(), new ConversationState("session-3")
        );

        ToolResult adminResult = toolRouter.executeTool("dummyAdmin", adminContext, Map.of());
        assertTrue(adminResult.success());
        assertEquals("Success admin", adminResult.message());
    }

    @Test
    @DisplayName("Available tools list should filter by caller permission")
    void testAvailableToolsFiltering() {
        ToolExecutionContext guestContext = new ToolExecutionContext(
                null, "GUEST", "session-1", "/", PageContext.unknown(), new ConversationState("session-1")
        );
        List<ToolMetadata> guestTools = toolRouter.getAvailableTools(guestContext);
        assertEquals(2, guestTools.size()); // dummyPublic + checkShippingFee

        ToolExecutionContext adminContext = new ToolExecutionContext(
                UUID.randomUUID(), "ADMIN", "session-admin", "/admin", PageContext.unknown(), new ConversationState("session-admin")
        );
        List<ToolMetadata> adminTools = toolRouter.getAvailableTools(adminContext);
        assertEquals(4, adminTools.size()); // All tools available
    }

    @Test
    @DisplayName("Calling unknown tool should return descriptive error")
    void testUnknownTool() {
        ToolExecutionContext context = new ToolExecutionContext(
                null, "GUEST", "session-1", "/", PageContext.unknown(), new ConversationState("session-1")
        );
        ToolResult result = toolRouter.executeTool("nonExistentTool", context, Map.of());
        assertFalse(result.success());
        assertTrue(result.message().contains("Hệ thống không tìm thấy công cụ"));
    }
}
