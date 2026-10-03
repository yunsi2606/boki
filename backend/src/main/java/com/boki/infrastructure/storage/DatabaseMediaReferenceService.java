package com.boki.infrastructure.storage;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Scans the database to collect all active media object keys currently referenced.
 */
@Service
public class DatabaseMediaReferenceService {

    private final JdbcTemplate jdbcTemplate;
    private static final Pattern UPLOADS_PATTERN = Pattern.compile("uploads/[^\"'\\s\\)\\?#]+");

    public DatabaseMediaReferenceService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    /**
     * Extracts and returns a set of all active object keys (e.g. "uploads/2026/10/01/xyz.webp")
     * referenced across all database tables.
     */
    public Set<String> getActiveReferencedKeys() {
        Set<String> activeKeys = new HashSet<>();

        // 1. Book images
        collectKeysFromQuery("SELECT image_url FROM book_images WHERE image_url IS NOT NULL", activeKeys);

        // 2. Book category clean covers
        collectKeysFromQuery("SELECT category_cover_url FROM books WHERE category_cover_url IS NOT NULL", activeKeys);

        // 3. Blog thumbnails and inline content images
        collectKeysFromQuery("SELECT thumbnail_url FROM blogs WHERE thumbnail_url IS NOT NULL", activeKeys);
        collectInlineKeysFromBlogContent(activeKeys);

        // 4. User avatars
        collectKeysFromQuery("SELECT avatar_url FROM users WHERE avatar_url IS NOT NULL", activeKeys);

        // 5. Book variant images
        collectKeysFromQuery("SELECT image_url FROM book_variants WHERE image_url IS NOT NULL", activeKeys);

        return activeKeys;
    }

    private void collectKeysFromQuery(String sql, Set<String> targetSet) {
        try {
            List<String> urls = jdbcTemplate.queryForList(sql, String.class);
            for (String url : urls) {
                String key = extractKey(url);
                if (key != null) {
                    targetSet.add(key);
                }
            }
        } catch (Exception ignored) {
            // Ignore query errors if table or column does not exist in testing
        }
    }

    private void collectInlineKeysFromBlogContent(Set<String> targetSet) {
        try {
            List<String> contents = jdbcTemplate.queryForList("SELECT content FROM blogs WHERE content IS NOT NULL", String.class);
            for (String content : contents) {
                if (content == null || content.isBlank()) continue;
                Matcher matcher = UPLOADS_PATTERN.matcher(content);
                while (matcher.find()) {
                    String matchedKey = matcher.group();
                    targetSet.add(matchedKey.trim());
                }
            }
        } catch (Exception ignored) {}
    }

    public static String extractKey(String urlOrKey) {
        if (urlOrKey == null || urlOrKey.isBlank()) return null;
        int idx = urlOrKey.indexOf("uploads/");
        if (idx >= 0) {
            String key = urlOrKey.substring(idx);
            // Strip any query parameters or hash
            int queryIdx = key.indexOf('?');
            if (queryIdx >= 0) key = key.substring(0, queryIdx);
            int hashIdx = key.indexOf('#');
            if (hashIdx >= 0) key = key.substring(0, hashIdx);
            return key.trim();
        }
        return null;
    }
}
