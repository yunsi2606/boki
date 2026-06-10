package com.boki.application.dto.request;

import jakarta.validation.constraints.NotBlank;

public record VerifyPhoneRequest(
        @NotBlank(message = "Phone number is required")
        String phoneNumber,

        @NotBlank(message = "Verification ID is required")
        String verificationId,

        @NotBlank(message = "OTP code is required")
        String code
) {}
