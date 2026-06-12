package com.boki.application.port.in;

/**
 * Use case port for initiating the password reset flow.
 * Sends a reset link to the user's email.
 */
public interface ForgotPasswordUseCase {

    void forgotPassword(String email);
}
