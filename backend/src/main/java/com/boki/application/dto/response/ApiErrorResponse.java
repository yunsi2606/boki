package com.boki.application.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.Instant;
import java.util.List;

/**
 * Standardized API error response format.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ApiErrorResponse(
        int status,
        String error,
        String message,
        List<FieldError> details,
        Instant timestamp,
        String path
) {
    public record FieldError(String field, String message) {}

    public static ApiErrorResponse of(int status, String error, String message, String path) {
        return new ApiErrorResponse(status, error, message, null, Instant.now(), path);
    }

    public static ApiErrorResponse withDetails(int status, String error, String message, List<FieldError> details, String path) {
        return new ApiErrorResponse(status, error, message, details, Instant.now(), path);
    }
}
