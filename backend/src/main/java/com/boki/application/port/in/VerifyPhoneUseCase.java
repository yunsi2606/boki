package com.boki.application.port.in;

import com.boki.application.dto.request.VerifyPhoneRequest;
import com.boki.application.dto.response.AuthResponse;

import java.util.UUID;

/**
 * Inbound port: verify user phone number via OTP.
 */
public interface VerifyPhoneUseCase {

    AuthResponse verifyPhone(UUID userId, VerifyPhoneRequest request);
}
