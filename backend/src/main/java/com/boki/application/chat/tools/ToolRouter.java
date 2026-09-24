package com.boki.application.chat.tools;

import com.boki.domain.chat.tool.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class ToolRouter {

    private static final Logger log = LoggerFactory.getLogger(ToolRouter.class);

    private final Map<String, ChatTool> toolRegistry = new ConcurrentHashMap<>();

    public ToolRouter(List<ChatTool> tools) {
        if (tools != null) {
            for (ChatTool tool : tools) {
                toolRegistry.put(tool.getName().toLowerCase(), tool);
                log.info("Registered ChatTool: {} [category: {}, permission: {}]",
                        tool.getName(), tool.getMetadata().category(), tool.getRequiredPermission());
            }
        }
    }

    /**
     * Thực thi một Tool theo tên kèm theo kiểm tra phân quyền nghiêm ngặt.
     */
    public ToolResult executeTool(String toolName, ToolExecutionContext context, Map<String, Object> params) {
        if (toolName == null || toolName.isBlank()) {
            return ToolResult.error("Tên công cụ (toolName) không được để trống.");
        }

        ChatTool tool = toolRegistry.get(toolName.toLowerCase().trim());
        if (tool == null) {
            log.warn("Tool not found: {}", toolName);
            return ToolResult.error("Hệ thống không tìm thấy công cụ yêu cầu: " + toolName);
        }

        // 1. Kiểm tra quyền ở cấp Tool (Tool-Level Permission Check)
        if (!hasPermission(context, tool.getRequiredPermission())) {
            log.warn("Access denied for tool {} by user {} [role: {}]",
                    tool.getName(), context.userId(), context.userRole());
            return ToolResult.accessDenied(tool.getName(), tool.getRequiredPermission());
        }

        // 2. Thực thi Tool
        long startTime = System.currentTimeMillis();
        try {
            ToolResult result = tool.execute(context, params);
            long duration = System.currentTimeMillis() - startTime;
            log.debug("Tool {} executed successfully in {} ms", tool.getName(), duration);
            return result;
        } catch (Exception e) {
            log.error("Error executing tool: " + tool.getName(), e);
            return ToolResult.error("Đã xảy ra sự cố khi thực thi công cụ " + tool.getName() + ": " + e.getMessage());
        }
    }

    /**
     * Lấy danh sách metadata của các công cụ mà người dùng hiện tại có đủ quyền sử dụng.
     * Dùng để cung cấp cho AI Orchestrator / LLM Function Calling.
     */
    public List<ToolMetadata> getAvailableTools(ToolExecutionContext context) {
        List<ToolMetadata> available = new ArrayList<>();
        for (ChatTool tool : toolRegistry.values()) {
            if (hasPermission(context, tool.getRequiredPermission())) {
                available.add(tool.getMetadata());
            }
        }
        return available;
    }

    /**
     * Lấy tool cụ thể theo tên (nếu có).
     */
    public Optional<ChatTool> getTool(String toolName) {
        if (toolName == null) return Optional.empty();
        return Optional.ofNullable(toolRegistry.get(toolName.toLowerCase().trim()));
    }

    private boolean hasPermission(ToolExecutionContext context, ToolPermission required) {
        if (required == ToolPermission.PUBLIC) {
            return true;
        }
        if (required == ToolPermission.BUYER_ONLY) {
            return context.isAuthenticated();
        }
        if (required == ToolPermission.SELLER_OR_ADMIN) {
            return context.isSellerOrAdmin();
        }
        if (required == ToolPermission.ADMIN_ONLY) {
            return context.isAdmin();
        }
        return false;
    }
}
