package com.boki.infrastructure.security;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;

/**
 * Utility for managing secure, tamper-resistant HttpOnly cookies.
 * Prevents identity spoofing (anti-XSS / anti-credential tampering) by ensuring
 * tokens are transported via HttpOnly cookies rather than untrusted client payload fields.
 */
public final class CookieUtil {

    public static final String AUTH_COOKIE_NAME = "boki_token";
    public static final int COOKIE_MAX_AGE_SECONDS = 7 * 24 * 60 * 60; // 7 days

    private CookieUtil() {}

    /**
     * Sets an HttpOnly, SameSite=Lax cookie with the JWT token.
     */
    public static void setAuthCookie(HttpServletResponse response, String token) {
        ResponseCookie cookie = ResponseCookie.from(AUTH_COOKIE_NAME, token)
                .httpOnly(true)
                .secure(false) // Set to false for dev/localhost, can be dynamic based on request
                .path("/")
                .maxAge(COOKIE_MAX_AGE_SECONDS)
                .sameSite("Lax")
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    /**
     * Clears the authentication HttpOnly cookie upon logout.
     */
    public static void clearAuthCookie(HttpServletResponse response) {
        ResponseCookie cookie = ResponseCookie.from(AUTH_COOKIE_NAME, "")
                .httpOnly(true)
                .secure(false)
                .path("/")
                .maxAge(0)
                .sameSite("Lax")
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    /**
     * Extracts a named cookie value from the incoming HTTP request.
     */
    public static String extractCookie(HttpServletRequest request, String name) {
        if (request.getCookies() == null) {
            return null;
        }
        for (Cookie cookie : request.getCookies()) {
            if (name.equalsIgnoreCase(cookie.getName())) {
                return cookie.getValue();
            }
        }
        return null;
    }
}
