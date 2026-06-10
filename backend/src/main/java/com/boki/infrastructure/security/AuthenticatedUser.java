package com.boki.infrastructure.security;

import java.util.UUID;

/**
 * Represents the currently authenticated user principal.
 * Stored in SecurityContext after JWT validation.
 */
public record AuthenticatedUser(UUID userId, String email) {}
