package com.boki.application.dto.request;

import jakarta.validation.constraints.NotBlank;

public record OAuthLoginRequest(
        @NotBlank(message = "Provider is required")
        String provider,

        @NotBlank(message = "Token is required")
        String token
) {}
