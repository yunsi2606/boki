package com.boki.application.dto.response;

import java.util.List;

/**
 * Response payload for AI-assisted blog content generation.
 */
public record AiGenerateBlogResponse(
        String title,
        String excerpt,
        String content,
        String category,
        List<String> tags,
        List<String> outline,
        String metaKeywords,
        Integer estimatedReadingTime,
        String providerName
) {
    public static AiGenerateBlogResponse of(
            String title,
            String excerpt,
            String content,
            String category,
            List<String> tags,
            List<String> outline,
            String metaKeywords,
            Integer estimatedReadingTime,
            String providerName
    ) {
        return new AiGenerateBlogResponse(
                title != null ? title : "",
                excerpt != null ? excerpt : "",
                content != null ? content : "",
                category != null ? category : "Chung",
                tags != null ? tags : List.of(),
                outline != null ? outline : List.of(),
                metaKeywords != null ? metaKeywords : "",
                estimatedReadingTime != null && estimatedReadingTime > 0 ? estimatedReadingTime : 3,
                providerName != null ? providerName : "Boki AI Engine"
        );
    }
}
