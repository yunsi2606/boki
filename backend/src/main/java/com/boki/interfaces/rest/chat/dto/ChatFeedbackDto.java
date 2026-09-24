package com.boki.interfaces.rest.chat.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ChatFeedbackDto(
        @NotNull(message = "logId không được null")
        Long logId,
        String sessionId,
        @NotBlank(message = "feedback không được để trống (LIKE hoặc DISLIKE)")
        String feedback,
        String reason
) {}
