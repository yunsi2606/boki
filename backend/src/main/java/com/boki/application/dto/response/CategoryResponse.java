package com.boki.application.dto.response;

/**
 * Response DTO for a book category.
 */
public record CategoryResponse(
        int id,
        String name,
        String slug,
        String description,
        Integer parentId
) {
}
