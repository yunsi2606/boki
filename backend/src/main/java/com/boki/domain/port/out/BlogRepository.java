package com.boki.domain.port.out;

import com.boki.domain.model.blog.Blog;
import com.boki.domain.model.blog.BlogId;
import com.boki.domain.model.blog.BlogStatus;

import java.util.List;
import java.util.Optional;

/**
 * Port (outbound) for blog persistence.
 */
public interface BlogRepository {

    Blog save(Blog blog);

    Optional<Blog> findById(BlogId id);

    Optional<Blog> findBySlug(String slug);

    List<Blog> findByStatus(BlogStatus status, int page, int size);

    List<Blog> findFeatured(int limit);

    List<Blog> searchPublished(String category, String query, int page, int size);

    List<Blog> findAll(String query, int page, int size);

    void deleteById(BlogId id);

    void incrementViews(BlogId id);

    /** Media ref tracking for R2 garbage collection */
    void saveMediaRefs(BlogId blogId, List<String> mediaUrls);

    List<String> findMediaRefsByBlogId(BlogId blogId);

    void deleteMediaRefsByBlogId(BlogId blogId);

    void deleteMediaRefsByUrls(BlogId blogId, List<String> urls);
}
