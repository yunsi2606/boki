package com.boki.domain.chat.model;

import java.util.Map;

public record ChatAction(
        ChatActionType type,
        String label,
        Map<String, Object> payload,
        String icon,
        String style // "primary", "secondary", "danger"
) {
    public static ChatAction of(ChatActionType type, String label, Map<String, Object> payload) {
        return new ChatAction(type, label, payload, null, "primary");
    }

    public static ChatAction of(ChatActionType type, String label, Map<String, Object> payload, String icon, String style) {
        return new ChatAction(type, label, payload, icon, style);
    }
}
