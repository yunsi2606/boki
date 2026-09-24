package com.boki.domain.chat.tool;

import com.boki.domain.chat.model.ConversationState;
import com.boki.domain.chat.model.PageContext;

import java.util.UUID;

public record ToolExecutionContext(
        UUID userId,
        String userRole,
        String sessionId,
        String currentPath,
        PageContext pageContext,
        ConversationState conversationState
) {
    public boolean isAuthenticated() {
        return userId != null;
    }

    public boolean isAdmin() {
        return "ADMIN".equalsIgnoreCase(userRole);
    }

    public boolean isSellerOrAdmin() {
        return "ADMIN".equalsIgnoreCase(userRole) || "SELLER".equalsIgnoreCase(userRole);
    }
}
