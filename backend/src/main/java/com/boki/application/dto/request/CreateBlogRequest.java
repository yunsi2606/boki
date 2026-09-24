package com.boki.application.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.List;

public record CreateBlogRequest(
        @NotBlank(message = "Title is required")
        @Size(max = 255)
        String title,

        @Size(max = 500)
        String excerpt,

        @NotBlank(message = "Content is required")
        String content,

        String coverImage,

        @Size(max = 100)
        String category,

        List<String> tags,

        /** If true, publish immediately. If false/null, save as draft. */
        Boolean publish
) {
}
