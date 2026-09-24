package com.boki.interfaces.rest.chat.dto;

import jakarta.validation.constraints.NotBlank;

public record ConfirmationRequestDto(
        @NotBlank(message = "ticketId không được để trống")
        String ticketId,
        boolean confirmed
) {}
