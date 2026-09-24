package com.boki.domain.chat.provider;

import com.boki.domain.chat.model.ConversationState;
import com.boki.domain.chat.tool.ToolMetadata;

import java.util.List;
import java.util.Map;

public record AiRequest(
        String userMessage,
        ConversationState conversationState,
        List<ToolMetadata> availableTools,
        String systemPrompt,
        Map<String, Object> additionalContext
) {
    public record ToolCallRequest(
            String toolName,
            Map<String, Object> arguments
    ) {}
}
