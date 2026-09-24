package com.boki.application.service;

import com.boki.application.dto.request.CreateBlogRequest;
import com.boki.application.dto.request.UpdateBlogRequest;
import com.boki.application.dto.response.BlogResponse;
import com.boki.application.exception.ResourceNotFoundException;
import com.boki.application.port.in.GetBlogsUseCase;
import com.boki.application.port.in.ManageBlogUseCase;
import com.boki.domain.model.blog.Blog;
import com.boki.domain.model.blog.BlogId;
import com.boki.domain.model.blog.BlogStatus;
import com.boki.domain.model.user.Email;
import com.boki.domain.model.user.User;
import com.boki.domain.port.out.BlogRepository;
import com.boki.domain.port.out.UserRepository;
import com.boki.infrastructure.storage.CloudflareR2StorageService;
import com.boki.infrastructure.util.SlugUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class BlogApplicationService implements ManageBlogUseCase, GetBlogsUseCase {

    private static final Logger log = LoggerFactory.getLogger(BlogApplicationService.class);

    private final BlogRepository blogRepository;
    private final UserRepository userRepository;
    private final CloudflareR2StorageService storageService;

    public BlogApplicationService(
            BlogRepository blogRepository,
            UserRepository userRepository,
            CloudflareR2StorageService storageService
    ) {
        this.blogRepository = blogRepository;
        this.userRepository = userRepository;
        this.storageService = storageService;
    }

    // ========== ManageBlogUseCase ==========

    @Override
    @Transactional
    public BlogResponse createBlog(CreateBlogRequest request, String authorEmail) {
        User author = findUserByEmail(authorEmail);

        String slug = SlugUtils.slugify(request.title());
        // Ensure slug uniqueness
        if (blogRepository.findBySlug(slug).isPresent()) {
            slug = slug + "-" + UUID.randomUUID().toString().substring(0, 8);
        }

        Blog blog = Blog.create(
                author.getId(), author.getDisplayName(),
                request.title(), slug,
                request.excerpt(), request.content(),
                request.coverImage(), request.category(),
                request.tags()
        );

        if (Boolean.TRUE.equals(request.publish())) {
            blog.publish();
        }

        Blog saved = blogRepository.save(blog);

        // Track media refs for R2 GC
        syncMediaRefs(saved);

        return toResponse(saved);
    }

    @Override
    @Transactional
    public BlogResponse updateBlog(UUID blogId, UpdateBlogRequest request, String authorEmail) {
        Blog blog = findBlogById(blogId);

        String newSlug = null;
        if (request.title() != null && !request.title().isBlank()) {
            newSlug = SlugUtils.slugify(request.title());
            if (!newSlug.equals(blog.getSlug()) && blogRepository.findBySlug(newSlug).isPresent()) {
                newSlug = newSlug + "-" + UUID.randomUUID().toString().substring(0, 8);
            }
        }

        blog.updateDetails(
                request.title(), newSlug,
                request.excerpt(), request.content(),
                request.coverImage(), request.category(),
                request.tags()
        );

        if (request.status() != null) {
            applyStatusChange(blog, request.status());
        }

        Blog saved = blogRepository.save(blog);

        // Sync media refs: remove orphaned images, add new ones
        syncMediaRefsWithGarbageCollection(saved);

        return toResponse(saved);
    }

    @Override
    @Transactional
    public void deleteBlog(UUID blogId, String authorEmail) {
        Blog blog = findBlogById(blogId);

        // R2 Garbage Collection: delete all media files
        garbageCollectAllMedia(blog);

        blogRepository.deleteById(blog.getId());
        log.info("Blog deleted: id={}, title={}", blogId, blog.getTitle());
    }

    @Override
    @Transactional
    public BlogResponse changeStatus(UUID blogId, String newStatus, String authorEmail) {
        Blog blog = findBlogById(blogId);
        applyStatusChange(blog, newStatus);
        Blog saved = blogRepository.save(blog);
        return toResponse(saved);
    }

    @Override
    @Transactional
    public BlogResponse toggleFeatured(UUID blogId, String authorEmail) {
        Blog blog = findBlogById(blogId);
        blog.toggleFeatured();
        Blog saved = blogRepository.save(blog);
        return toResponse(saved);
    }

    // ========== GetBlogsUseCase ==========

    @Override
    @Transactional(readOnly = true)
    public List<BlogResponse> searchPublishedBlogs(String category, String query, int page, int size) {
        return blogRepository.searchPublished(category, query, page, size).stream()
                .map(this::toSummaryResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<BlogResponse> getFeaturedBlogs(int limit) {
        return blogRepository.findFeatured(limit).stream()
                .map(this::toSummaryResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public BlogResponse getBlogBySlug(String slug) {
        Blog blog = blogRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Blog", "slug", slug));
        return toResponse(blog);
    }

    @Override
    @Transactional(readOnly = true)
    public BlogResponse getBlogById(UUID id) {
        Blog blog = findBlogById(id);
        return toResponse(blog);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BlogResponse> getAdminBlogs(String query, int page, int size) {
        return blogRepository.findAll(query, page, size).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void incrementViews(String slug) {
        Blog blog = blogRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Blog", "slug", slug));
        blogRepository.incrementViews(blog.getId());
    }

    // ========== Private Helpers ==========

    private User findUserByEmail(String email) {
        return userRepository.findByEmail(Email.of(email))
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
    }

    private Blog findBlogById(UUID blogId) {
        return blogRepository.findById(BlogId.of(blogId))
                .orElseThrow(() -> new ResourceNotFoundException("Blog", "id", blogId.toString()));
    }

    private void applyStatusChange(Blog blog, String newStatus) {
        BlogStatus status = BlogStatus.valueOf(newStatus.toUpperCase());
        switch (status) {
            case PUBLISHED -> blog.publish();
            case ARCHIVED -> blog.archive();
            case DRAFT -> blog.moveToDraft();
        }
    }

    /**
     * Sync media refs on first save (create).
     */
    private void syncMediaRefs(Blog blog) {
        List<String> contentImages = blog.extractAllImageUrls();
        List<String> r2Images = filterR2Urls(contentImages);
        if (!r2Images.isEmpty()) {
            blogRepository.saveMediaRefs(blog.getId(), r2Images);
            log.info("Tracked {} R2 media refs for blog: {}", r2Images.size(), blog.getId());
        }
    }

    /**
     * Sync media refs on update: remove orphaned R2 images, add new ones.
     */
    private void syncMediaRefsWithGarbageCollection(Blog blog) {
        List<String> currentContentImages = filterR2Urls(blog.extractAllImageUrls());
        List<String> existingRefs = blogRepository.findMediaRefsByBlogId(blog.getId());

        Set<String> currentSet = new HashSet<>(currentContentImages);
        Set<String> existingSet = new HashSet<>(existingRefs);

        // Find orphaned images (in existing refs but not in current content)
        List<String> orphaned = existingRefs.stream()
                .filter(url -> !currentSet.contains(url))
                .collect(Collectors.toList());

        // Find new images (in current content but not in existing refs)
        List<String> newImages = currentContentImages.stream()
                .filter(url -> !existingSet.contains(url))
                .collect(Collectors.toList());

        // Delete orphaned images from R2
        if (!orphaned.isEmpty()) {
            deleteR2Files(orphaned);
            blogRepository.deleteMediaRefsByUrls(blog.getId(), orphaned);
            log.info("GC: Deleted {} orphaned R2 images for blog: {}", orphaned.size(), blog.getId());
        }

        // Track new images
        if (!newImages.isEmpty()) {
            blogRepository.saveMediaRefs(blog.getId(), newImages);
            log.info("Tracked {} new R2 media refs for blog: {}", newImages.size(), blog.getId());
        }
    }

    /**
     * Delete all R2 media associated with a blog (used on blog deletion).
     */
    private void garbageCollectAllMedia(Blog blog) {
        List<String> mediaUrls = blogRepository.findMediaRefsByBlogId(blog.getId());
        if (!mediaUrls.isEmpty()) {
            deleteR2Files(mediaUrls);
            log.info("GC: Deleted {} R2 media files for deleted blog: {}", mediaUrls.size(), blog.getId());
        }
    }

    /**
     * Filter URLs to only include R2-hosted URLs.
     */
    private List<String> filterR2Urls(List<String> urls) {
        return urls.stream()
                .filter(url -> url.contains("bokistore") || url.contains("r2") || url.contains("localhost:8080/uploads"))
                .collect(Collectors.toList());
    }

    /**
     * Delete files from R2 storage.
     */
    private void deleteR2Files(List<String> urls) {
        for (String url : urls) {
            try {
                storageService.deleteFile(url);
            } catch (Exception e) {
                log.warn("Failed to delete R2 file: {} - {}", url, e.getMessage());
            }
        }
    }

    private BlogResponse toSummaryResponse(Blog blog) {
        return new BlogResponse(
                blog.getId().value(),
                blog.getAuthorId().value(),
                blog.getAuthorName(),
                blog.getTitle(),
                blog.getSlug(),
                blog.getExcerpt(),
                "",
                blog.getCoverImage(),
                blog.resolveEffectiveCoverImage(),
                blog.getCategory(),
                blog.getTags(),
                blog.getStatus().name(),
                blog.getViewsCount(),
                blog.getLikesCount(),
                blog.getReadingTimeMinutes(),
                blog.isFeatured(),
                blog.getPublishedAt(),
                blog.getCreatedAt(),
                blog.getUpdatedAt()
        );
    }

    private BlogResponse toResponse(Blog blog) {
        return new BlogResponse(
                blog.getId().value(),
                blog.getAuthorId().value(),
                blog.getAuthorName(),
                blog.getTitle(),
                blog.getSlug(),
                blog.getExcerpt(),
                blog.getContent(),
                blog.getCoverImage(),
                blog.resolveEffectiveCoverImage(),
                blog.getCategory(),
                blog.getTags(),
                blog.getStatus().name(),
                blog.getViewsCount(),
                blog.getLikesCount(),
                blog.getReadingTimeMinutes(),
                blog.isFeatured(),
                blog.getPublishedAt(),
                blog.getCreatedAt(),
                blog.getUpdatedAt()
        );
    }
}
