package com.boki.interfaces.rest.chat.dto;

import jakarta.validation.constraints.NotBlank;

public record ChatRequestDto(
        @NotBlank(message = "Nội dung tin nhắn không được để trống")
        String message,
        String sessionId,
        String currentPath
) {}
