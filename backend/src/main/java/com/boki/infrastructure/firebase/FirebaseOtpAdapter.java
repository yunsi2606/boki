package com.boki.infrastructure.firebase;

import com.boki.application.port.out.OtpService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

/**
 * Stub adapter for Firebase OTP verification.
 * <p>
 * TODO: Replace with actual Firebase Admin SDK integration.
 * In dev mode, accepts code "123456" for any verification ID.
 */
@Component
public class FirebaseOtpAdapter implements OtpService {

    private static final Logger log = LoggerFactory.getLogger(FirebaseOtpAdapter.class);
    private static final String DEV_BYPASS_CODE = "123456";

    @Override
    public String verifyOtp(String verificationId, String code) {
        log.warn("Using STUB Firebase OTP adapter — NOT for production use");

        if (DEV_BYPASS_CODE.equals(code)) {
            log.info("Dev OTP bypass accepted for verificationId={}", verificationId);
            return verificationId;
        }

        throw new RuntimeException("Invalid OTP code. In dev mode, use code: " + DEV_BYPASS_CODE);
    }
}
