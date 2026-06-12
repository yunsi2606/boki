package com.boki.application.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

/**
 * Request DTO for initiating the password reset flow.
 */
public record ForgotPasswordRequest(
        @NotBlank(message = "Email is required")
        @Email(message = "Must be a valid email address")
        String email
) {
}
