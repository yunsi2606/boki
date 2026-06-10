package com.boki.application.port.out;

/**
 * Port (outbound) for OTP verification.
 * Implemented by FirebaseOtpAdapter in infrastructure.
 */
public interface OtpService {

    /**
     * Verify an OTP code server-side.
     *
     * @param verificationId the verification session ID from Firebase
     * @param code           the OTP code entered by the user
     * @return the verified phone number, or throws if invalid
     */
    String verifyOtp(String verificationId, String code);
}
