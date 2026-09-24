package com.boki.interfaces.rest.chat.dto;

import com.boki.domain.chat.model.ChatAction;
import com.boki.domain.chat.model.ChatActionType;

import java.time.Instant;
import java.util.List;

public record ChatResponseDto(
        String id,
        String sender,
        String text,
        ChatActionType actionType,
        List<Object> cards,
        List<ChatAction> actions,
        List<String> suggestions,
        Instant timestamp,
        Integer latencyMs
) {
    public static ChatResponseDto of(
            String id,
            String text,
            ChatActionType actionType,
            List<Object> cards,
            List<ChatAction> actions,
            List<String> suggestions,
            Integer latencyMs
    ) {
        return new ChatResponseDto(
                id,
                "BOT",
                text,
                actionType != null ? actionType : ChatActionType.NONE,
                cards != null ? cards : List.of(),
                actions != null ? actions : List.of(),
                suggestions != null ? suggestions : List.of(),
                Instant.now(),
                latencyMs != null ? latencyMs : 0
        );
    }
}
