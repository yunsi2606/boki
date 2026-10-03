package com.boki.application.dto.response;

import java.util.Collections;
import java.util.List;

/**
 * Response DTO for a book category with real book count and clean display covers.
 */
public record CategoryResponse(
        int id,
        String name,
        String slug,
        String description,
        Integer parentId,
        long bookCount,
        List<String> displayCovers
) {
    public CategoryResponse(int id, String name, String slug, String description, Integer parentId) {
        this(id, name, slug, description, parentId, 0L, Collections.emptyList());
    }
}
