package com.boki.application.port.in;

import com.boki.application.dto.request.ResetPasswordRequest;

/**
 * Use case port for completing the password reset flow.
 * Validates the token and sets the new password.
 */
public interface ResetPasswordUseCase {

    void resetPassword(ResetPasswordRequest request);
}
