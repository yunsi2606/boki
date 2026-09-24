package com.boki.domain.chat.provider;

import java.util.List;
import java.util.Map;

public record AiResponse(
        String replyText,
        List<ToolCall> toolCalls,
        boolean requiresToolExecution,
        int tokenCount,
        String providerName
) {
    public record ToolCall(
            String toolName,
            Map<String, Object> arguments
    ) {}

    public static AiResponse direct(String replyText, String providerName) {
        return new AiResponse(replyText, List.of(), false, 0, providerName);
    }

    public static AiResponse withTool(String toolName, Map<String, Object> arguments, String replyText, String providerName) {
        return new AiResponse(replyText, List.of(new ToolCall(toolName, arguments != null ? arguments : Map.of())), true, 0, providerName);
    }
}
