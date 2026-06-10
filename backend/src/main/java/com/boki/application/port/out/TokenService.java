package com.boki.application.port.out;

import java.util.UUID;

/**
 * Port (outbound) for JWT token operations.
 * Implemented by infrastructure (JwtTokenProvider).
 */
public interface TokenService {

    String generateToken(UUID userId, String email, boolean phoneVerified);

    UUID extractUserId(String token);

    String extractEmail(String token);

    boolean validateToken(String token);
}
