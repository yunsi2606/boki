package com.boki.infrastructure.email;

import com.boki.application.port.out.EmailService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

/**
 * Stub email adapter for development.
 * <p>
 * TODO: Replace with SendGrid (or other provider) implementation.
 * Logs emails to console instead of sending.
 */
@Component
public class StubEmailAdapter implements EmailService {

    private static final Logger log = LoggerFactory.getLogger(StubEmailAdapter.class);

    @Override
    public void sendVerificationEmail(String toEmail, String verificationToken) {
        log.info("[STUB EMAIL] Verification email to={}, token={}", toEmail, verificationToken);
    }

    @Override
    public void sendPasswordResetEmail(String toEmail, String resetToken) {
        log.info("[STUB EMAIL] Password reset email to={}, token={}", toEmail, resetToken);
    }

    @Override
    public void sendWelcomeEmail(String toEmail, String displayName) {
        log.info("[STUB EMAIL] Welcome email to={}, name={}", toEmail, displayName);
    }
}
