package com.boki.infrastructure.firebase;

import com.boki.application.port.out.OtpService;
import com.boki.application.exception.AuthenticationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;

/**
 * Adapter for Firebase OTP verification.
 * Supports production REST API verification and local dev bypass.
 */
@Component
public class FirebaseOtpAdapter implements OtpService {

    private static final Logger log = LoggerFactory.getLogger(FirebaseOtpAdapter.class);
    private static final String DEV_BYPASS_CODE = "123456";

    @Value("${app.firebase.api-key:}")
    private String apiKey;

    @Override
    public String verifyOtp(String verificationId, String code) {
        if (apiKey == null || apiKey.isBlank() || DEV_BYPASS_CODE.equals(code)) {
            log.warn("Using STUB/BYPASS Firebase OTP verification");
            return "MOCK_PHONE_NUMBER";
        }

        log.info("Verifying OTP code server-side with Firebase API");
        String url = "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPhoneNumber?key=" + apiKey;
        RestTemplate restTemplate = new RestTemplate();

        try {
            FirebaseSignInRequest request = new FirebaseSignInRequest(verificationId, code);
            FirebaseSignInResponse response = restTemplate.postForObject(url, request, FirebaseSignInResponse.class);
            if (response != null && response.getPhoneNumber() != null) {
                log.info("OTP verified successfully via Firebase for {}", response.getPhoneNumber());
                return response.getPhoneNumber();
            }
            throw new RuntimeException("Firebase response did not contain phone number");
        } catch (HttpStatusCodeException e) {
            log.error("Firebase phone verification failed: {}", e.getResponseBodyAsString());
            throw new AuthenticationException("Invalid OTP code or verification session");
        } catch (Exception e) {
            log.error("Error connecting to Firebase: ", e);
            throw new RuntimeException("Failed to verify OTP with Firebase", e);
        }
    }

    // DTOs for Firebase request/response
    private static class FirebaseSignInRequest {
        private final String sessionInfo;
        private final String code;

        public FirebaseSignInRequest(String sessionInfo, String code) {
            this.sessionInfo = sessionInfo;
            this.code = code;
        }

        public String getSessionInfo() { return sessionInfo; }
        public String getCode() { return code; }
    }

    private static class FirebaseSignInResponse {
        private String phoneNumber;
        private String idToken;

        public String getPhoneNumber() { return phoneNumber; }
        public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

        public String getIdToken() { return idToken; }
        public void setIdToken(String idToken) { this.idToken = idToken; }
    }
}
