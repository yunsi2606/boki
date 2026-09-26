package com.boki.application.dto.request;

import jakarta.validation.constraints.NotBlank;
import java.util.UUID;

/**
 * Request payload for AI-assisted blog content generation.
 */
public record AiGenerateBlogRequest(
        /**
         * Action mode:
         * FULL_ARTICLE - Generate complete blog post (title, excerpt, HTML content, tags)
         * OUTLINE - Generate comprehensive article outline
         * POLISH - Polish & enrich existing title and content
         * SEO_OPTIMIZE - Optimize existing title, excerpt and tags for search engines
         * GENERATE_EXCERPT - Generate compelling short summary from content
         */
        @NotBlank(message = "Action is required")
        String action,

        /**
         * Main topic or premise of the article.
         */
        String topic,

        /**
         * Optional reference book ID from Boki catalog to enrich with real book metadata.
         */
        UUID bookId,

        /**
         * Target blog category (e.g. "Đánh giá sách", "Góc đọc", "Tin tức", etc.)
         */
        String category,

        /**
         * Writing tone: INSPIRING, PROFESSIONAL, CONVERSATIONAL, ANALYTICAL, HUMOROUS
         */
        String tone,

        /**
         * Content length: SHORT (~500 words), MEDIUM (~1000 words), DETAILED (~1800 words)
         */
        String length,

        /**
         * Target audience: GENERAL, STUDENTS, PROFESSIONALS, BOOK_LOVERS
         */
        String targetAudience,

        /**
         * Existing title (used for POLISH, SEO_OPTIMIZE)
         */
        String existingTitle,

        /**
         * Existing content (used for POLISH, SEO_OPTIMIZE, GENERATE_EXCERPT)
         */
        String existingContent,

        /**
         * Optional custom instructions or specific focus points from admin.
         */
        String customPrompt
) {
    public String resolveAction() {
        return action != null ? action.trim().toUpperCase() : "FULL_ARTICLE";
    }

    public String resolveTone() {
        return tone != null && !tone.isBlank() ? tone.trim().toUpperCase() : "INSPIRING";
    }

    public String resolveLength() {
        return length != null && !length.isBlank() ? length.trim().toUpperCase() : "MEDIUM";
    }

    public String resolveTargetAudience() {
        return targetAudience != null && !targetAudience.isBlank() ? targetAudience.trim().toUpperCase() : "BOOK_LOVERS";
    }
}
