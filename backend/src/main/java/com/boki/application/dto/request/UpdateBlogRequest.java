package com.boki.application.dto.request;

import jakarta.validation.constraints.Size;

import java.util.List;

public record UpdateBlogRequest(
        @Size(max = 255)
        String title,

        @Size(max = 500)
        String excerpt,

        String content,

        String coverImage,

        @Size(max = 100)
        String category,

        List<String> tags,

        /** If provided, change status. */
        String status
) {
}
