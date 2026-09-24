package com.boki.domain.chat.tool;

import com.boki.domain.chat.model.ChatAction;
import com.boki.domain.chat.model.ChatActionType;

import java.util.List;

public record ToolResult(
        boolean success,
        String message,
        Object data,
        ChatActionType actionType,
        List<Object> cards,
        List<ChatAction> actions
) {
    public static ToolResult ok(String message, Object data, ChatActionType actionType, List<Object> cards, List<ChatAction> actions) {
        return new ToolResult(true, message, data, actionType, cards != null ? cards : List.of(), actions != null ? actions : List.of());
    }

    public static ToolResult ok(String message, Object data) {
        return new ToolResult(true, message, data, ChatActionType.NONE, List.of(), List.of());
    }

    public static ToolResult error(String errorMessage) {
        return new ToolResult(false, errorMessage, null, ChatActionType.NONE, List.of(), List.of());
    }

    public static ToolResult accessDenied(String toolName, ToolPermission required) {
        return new ToolResult(
                false,
                "Truy cập bị từ chối: Công cụ [" + toolName + "] yêu cầu quyền tối thiểu là " + required,
                null,
                ChatActionType.NONE,
                List.of(),
                List.of()
        );
    }
}
