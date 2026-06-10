package com.boki.application.port.out;

/**
 * Port (outbound) for sending emails.
 * Implemented by email provider adapter (e.g., SendGrid) in infrastructure.
 */
public interface EmailService {

    void sendVerificationEmail(String toEmail, String verificationToken);

    void sendPasswordResetEmail(String toEmail, String resetToken);

    void sendWelcomeEmail(String toEmail, String displayName);
}
