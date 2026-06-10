package com.boki.application.exception;

/**
 * Thrown when authentication fails (bad credentials, expired token, etc.).
 */
public class AuthenticationException extends RuntimeException {

    public AuthenticationException(String message) {
        super(message);
    }

    public AuthenticationException(String message, Throwable cause) {
        super(message, cause);
    }
}
