package com.boki.application.port.in;

import com.boki.application.dto.request.VerifyEmailRequest;

/**
 * Inbound port for email verification use case.
 */
public interface VerifyEmailUseCase {
    void verifyEmail(VerifyEmailRequest request);
}
