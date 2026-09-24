package com.boki.domain.model.blog;

import com.boki.domain.model.user.UserId;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Blog aggregate root.
 */
public class Blog {

    private static final Pattern IMG_SRC_PATTERN = Pattern.compile(
            "<img[^>]+src\\s*=\\s*\"([^\"]+)\"", Pattern.CASE_INSENSITIVE);

    private static final String DEFAULT_COVER_IMAGE = "/images/default-blog-cover.png";

    private BlogId id;
    private UserId authorId;
    private String authorName;
    private String title;
    private String slug;
    private String excerpt;
    private String content;
    private String coverImage;
    private String category;
    private List<String> tags;
    private BlogStatus status;
    private int viewsCount;
    private int likesCount;
    private int readingTimeMinutes;
    private boolean isFeatured;
    private Instant publishedAt;
    private Instant createdAt;
    private Instant updatedAt;

    private Blog() {
    }

    /**
     * Factory: create a new blog post draft.
     */
    public static Blog create(
            UserId authorId, String authorName,
            String title, String slug,
            String excerpt, String content,
            String coverImage, String category,
            List<String> tags
    ) {
        if (title == null || title.isBlank()) {
            throw new IllegalArgumentException("Blog title cannot be empty");
        }
        if (content == null || content.isBlank()) {
            throw new IllegalArgumentException("Blog content cannot be empty");
        }

        Blog blog = new Blog();
        blog.id = BlogId.generate();
        blog.authorId = authorId;
        blog.authorName = authorName;
        blog.title = title.trim();
        blog.slug = slug;
        blog.excerpt = excerpt;
        blog.content = content;
        blog.coverImage = coverImage;
        blog.category = category != null ? category.trim() : "Chung";
        blog.tags = tags != null ? new ArrayList<>(tags) : new ArrayList<>();
        blog.status = BlogStatus.DRAFT;
        blog.viewsCount = 0;
        blog.likesCount = 0;
        blog.readingTimeMinutes = calculateReadingTime(content);
        blog.isFeatured = false;
        blog.publishedAt = null;
        blog.createdAt = Instant.now();
        blog.updatedAt = Instant.now();
        return blog;
    }

    /**
     * Reconstitute from persistence.
     */
    public static Blog reconstitute(
            BlogId id, UserId authorId, String authorName,
            String title, String slug, String excerpt,
            String content, String coverImage, String category,
            List<String> tags, BlogStatus status,
            int viewsCount, int likesCount, int readingTimeMinutes,
            boolean isFeatured, Instant publishedAt,
            Instant createdAt, Instant updatedAt
    ) {
        Blog blog = new Blog();
        blog.id = id;
        blog.authorId = authorId;
        blog.authorName = authorName;
        blog.title = title;
        blog.slug = slug;
        blog.excerpt = excerpt;
        blog.content = content;
        blog.coverImage = coverImage;
        blog.category = category;
        blog.tags = tags != null ? new ArrayList<>(tags) : new ArrayList<>();
        blog.status = status;
        blog.viewsCount = viewsCount;
        blog.likesCount = likesCount;
        blog.readingTimeMinutes = readingTimeMinutes;
        blog.isFeatured = isFeatured;
        blog.publishedAt = publishedAt;
        blog.createdAt = createdAt;
        blog.updatedAt = updatedAt;
        return blog;
    }

    // ---- Business Methods ----

    public void publish() {
        this.status = BlogStatus.PUBLISHED;
        if (this.publishedAt == null) {
            this.publishedAt = Instant.now();
        }
        this.updatedAt = Instant.now();
    }

    public void archive() {
        this.status = BlogStatus.ARCHIVED;
        this.updatedAt = Instant.now();
    }

    public void moveToDraft() {
        this.status = BlogStatus.DRAFT;
        this.updatedAt = Instant.now();
    }

    public void toggleFeatured() {
        this.isFeatured = !this.isFeatured;
        this.updatedAt = Instant.now();
    }

    public void updateDetails(
            String title, String slug, String excerpt,
            String content, String coverImage, String category,
            List<String> tags
    ) {
        if (title != null && !title.isBlank()) this.title = title.trim();
        if (slug != null && !slug.isBlank()) this.slug = slug;
        this.excerpt = excerpt;
        if (content != null && !content.isBlank()) {
            this.content = content;
            this.readingTimeMinutes = calculateReadingTime(content);
        }
        this.coverImage = coverImage;
        if (category != null && !category.isBlank()) this.category = category.trim();
        if (tags != null) this.tags = new ArrayList<>(tags);
        this.updatedAt = Instant.now();
    }

    /**
     * Resolve effective cover image with 3-tier fallback:
     * 1. Manual cover image
     * 2. First <img> in content
     * 3. Default placeholder
     */
    public String resolveEffectiveCoverImage() {
        if (coverImage != null && !coverImage.isBlank()) {
            return coverImage;
        }
        String firstImage = extractFirstImageFromContent();
        if (firstImage != null) {
            return firstImage;
        }
        return DEFAULT_COVER_IMAGE;
    }

    /**
     * Extract all image URLs from HTML content (for media ref tracking).
     */
    public List<String> extractAllImageUrls() {
        List<String> urls = new ArrayList<>();
        if (content == null || content.isBlank()) {
            return urls;
        }
        Matcher matcher = IMG_SRC_PATTERN.matcher(content);
        while (matcher.find()) {
            urls.add(matcher.group(1));
        }
        return urls;
    }

    // ---- Private Helpers ----

    private String extractFirstImageFromContent() {
        if (content == null || content.isBlank()) {
            return null;
        }
        Matcher matcher = IMG_SRC_PATTERN.matcher(content);
        if (matcher.find()) {
            return matcher.group(1);
        }
        return null;
    }

    private static int calculateReadingTime(String htmlContent) {
        if (htmlContent == null || htmlContent.isBlank()) return 1;
        String textOnly = htmlContent.replaceAll("<[^>]+>", " ").replaceAll("\\s+", " ").trim();
        int wordCount = textOnly.split("\\s+").length;
        // Average reading speed: ~200 words/min for Vietnamese
        int minutes = Math.max(1, (int) Math.ceil(wordCount / 200.0));
        return minutes;
    }

    // ---- Getters ----

    public BlogId getId() { return id; }
    public UserId getAuthorId() { return authorId; }
    public String getAuthorName() { return authorName; }
    public String getTitle() { return title; }
    public String getSlug() { return slug; }
    public String getExcerpt() { return excerpt; }
    public String getContent() { return content; }
    public String getCoverImage() { return coverImage; }
    public String getCategory() { return category; }
    public List<String> getTags() { return Collections.unmodifiableList(tags); }
    public BlogStatus getStatus() { return status; }
    public int getViewsCount() { return viewsCount; }
    public int getLikesCount() { return likesCount; }
    public int getReadingTimeMinutes() { return readingTimeMinutes; }
    public boolean isFeatured() { return isFeatured; }
    public Instant getPublishedAt() { return publishedAt; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
}
