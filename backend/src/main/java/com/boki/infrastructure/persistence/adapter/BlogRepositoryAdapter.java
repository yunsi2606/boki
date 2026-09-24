package com.boki.infrastructure.persistence.adapter;

import com.boki.domain.model.blog.Blog;
import com.boki.domain.model.blog.BlogId;
import com.boki.domain.model.blog.BlogStatus;
import com.boki.domain.port.out.BlogRepository;
import com.boki.infrastructure.persistence.entity.BlogJpaEntity;
import com.boki.infrastructure.persistence.entity.BlogMediaRefJpaEntity;
import com.boki.infrastructure.persistence.mapper.BlogPersistenceMapper;
import com.boki.infrastructure.persistence.repository.BlogJpaRepository;
import com.boki.infrastructure.persistence.repository.BlogMediaRefJpaRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Component
public class BlogRepositoryAdapter implements BlogRepository {

    private final BlogJpaRepository blogJpaRepository;
    private final BlogMediaRefJpaRepository mediaRefRepository;

    public BlogRepositoryAdapter(BlogJpaRepository blogJpaRepository,
                                 BlogMediaRefJpaRepository mediaRefRepository) {
        this.blogJpaRepository = blogJpaRepository;
        this.mediaRefRepository = mediaRefRepository;
    }

    @Override
    public Blog save(Blog blog) {
        BlogJpaEntity entity = BlogPersistenceMapper.toJpaEntity(blog);
        BlogJpaEntity saved = blogJpaRepository.save(entity);
        return BlogPersistenceMapper.toDomainModel(saved);
    }

    @Override
    public Optional<Blog> findById(BlogId id) {
        return blogJpaRepository.findById(id.value())
                .map(BlogPersistenceMapper::toDomainModel);
    }

    @Override
    public Optional<Blog> findBySlug(String slug) {
        return blogJpaRepository.findBySlug(slug)
                .map(BlogPersistenceMapper::toDomainModel);
    }

    @Override
    public List<Blog> findByStatus(BlogStatus status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return blogJpaRepository.findByStatus(status.name(), pageable)
                .getContent().stream()
                .map(BlogPersistenceMapper::toDomainModel)
                .collect(Collectors.toList());
    }

    @Override
    public List<Blog> findFeatured(int limit) {
        Pageable pageable = PageRequest.of(0, limit);
        return blogJpaRepository.findFeatured(pageable).stream()
                .map(BlogPersistenceMapper::toDomainModel)
                .collect(Collectors.toList());
    }

    @Override
    public List<Blog> searchPublished(String category, String query, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        boolean hasCategory = category != null && !category.isBlank() && !category.equalsIgnoreCase("Tất cả");
        boolean hasQuery = query != null && !query.isBlank();

        org.springframework.data.domain.Page<BlogJpaEntity> resultPage;
        if (hasCategory && hasQuery) {
            resultPage = blogJpaRepository.searchPublishedByCategoryAndQuery(category.trim(), query.trim(), pageable);
        } else if (hasCategory) {
            resultPage = blogJpaRepository.findByStatusAndCategoryOrderByPublishedAtDesc("PUBLISHED", category.trim(), pageable);
        } else if (hasQuery) {
            resultPage = blogJpaRepository.searchPublishedByQuery(query.trim(), pageable);
        } else {
            resultPage = blogJpaRepository.findByStatusOrderByPublishedAtDesc("PUBLISHED", pageable);
        }

        return resultPage.getContent().stream()
                .map(BlogPersistenceMapper::toDomainModel)
                .collect(Collectors.toList());
    }

    @Override
    public List<Blog> findAll(String query, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        org.springframework.data.domain.Page<BlogJpaEntity> resultPage;
        if (query != null && !query.isBlank()) {
            resultPage = blogJpaRepository.searchAllByQuery(query.trim(), pageable);
        } else {
            resultPage = blogJpaRepository.findAllOrdered(pageable);
        }

        return resultPage.getContent().stream()
                .map(BlogPersistenceMapper::toDomainModel)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteById(BlogId id) {
        blogJpaRepository.deleteById(id.value());
    }

    @Override
    public void incrementViews(BlogId id) {
        blogJpaRepository.incrementViewsCount(id.value());
    }

    @Override
    public void saveMediaRefs(BlogId blogId, List<String> mediaUrls) {
        BlogJpaEntity blog = blogJpaRepository.findById(blogId.value()).orElse(null);
        if (blog == null) return;

        for (String url : mediaUrls) {
            BlogMediaRefJpaEntity ref = new BlogMediaRefJpaEntity();
            ref.setBlog(blog);
            ref.setMediaUrl(url);
            ref.setCreatedAt(Instant.now());
            mediaRefRepository.save(ref);
        }
    }

    @Override
    public List<String> findMediaRefsByBlogId(BlogId blogId) {
        return mediaRefRepository.findMediaUrlsByBlogId(blogId.value());
    }

    @Override
    public void deleteMediaRefsByBlogId(BlogId blogId) {
        mediaRefRepository.deleteByBlogId(blogId.value());
    }

    @Override
    public void deleteMediaRefsByUrls(BlogId blogId, List<String> urls) {
        if (urls == null || urls.isEmpty()) return;
        mediaRefRepository.deleteByBlogIdAndMediaUrlIn(blogId.value(), urls);
    }
}
