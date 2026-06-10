package com.boki.application.exception;

/**
 * Thrown when a business rule is violated (e.g., duplicate email).
 */
public class BusinessRuleException extends RuntimeException {

    public BusinessRuleException(String message) {
        super(message);
    }
}
