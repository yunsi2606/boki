package com.boki.application.dto.user;

import jakarta.validation.constraints.NotNull;

public record UpdateUserStatusRequest(
        @NotNull(message = "Trạng thái không được để trống")
        Boolean active,
        String reason
) {}
