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
    private final com.boki.infrastructure.persistence.repository.BookJpaRepository bookJpaRepository;

    public BlogRepositoryAdapter(BlogJpaRepository blogJpaRepository,
                                 BlogMediaRefJpaRepository mediaRefRepository,
                                 com.boki.infrastructure.persistence.repository.BookJpaRepository bookJpaRepository) {
        this.blogJpaRepository = blogJpaRepository;
        this.mediaRefRepository = mediaRefRepository;
        this.bookJpaRepository = bookJpaRepository;
    }

    @Override
    public Blog save(Blog blog) {
        BlogJpaEntity entity = BlogPersistenceMapper.toJpaEntity(blog);
        if (blog.getLinkedBookIds() != null && !blog.getLinkedBookIds().isEmpty()) {
            List<com.boki.infrastructure.persistence.entity.BookJpaEntity> books =
                    bookJpaRepository.findAllById(blog.getLinkedBookIds());
            entity.setLinkedBooks(books);
        } else {
            entity.setLinkedBooks(new java.util.ArrayList<>());
        }
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
        return searchPublished(category, query, null, page, size);
    }

    @Override
    public List<Blog> searchPublished(String category, String query, String postType, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        boolean hasCategory = category != null && !category.isBlank() && !category.equalsIgnoreCase("Tất cả");
        boolean hasQuery = query != null && !query.isBlank();
        boolean hasType = postType != null && !postType.isBlank() && !postType.equalsIgnoreCase("ALL");

        org.springframework.data.domain.Page<BlogJpaEntity> resultPage;
        if (hasType) {
            String type = postType.trim().toUpperCase();
            if (hasCategory && hasQuery) {
                resultPage = blogJpaRepository.searchPublishedByCategoryAndPostTypeAndQuery(category.trim(), type, query.trim(), pageable);
            } else if (hasCategory) {
                resultPage = blogJpaRepository.findByStatusAndCategoryAndPostTypeOrderByPublishedAtDesc("PUBLISHED", category.trim(), type, pageable);
            } else if (hasQuery) {
                resultPage = blogJpaRepository.searchPublishedByPostTypeAndQuery(type, query.trim(), pageable);
            } else {
                resultPage = blogJpaRepository.findByStatusAndPostTypeOrderByPublishedAtDesc("PUBLISHED", type, pageable);
            }
        } else {
            if (hasCategory && hasQuery) {
                resultPage = blogJpaRepository.searchPublishedByCategoryAndQuery(category.trim(), query.trim(), pageable);
            } else if (hasCategory) {
                resultPage = blogJpaRepository.findByStatusAndCategoryOrderByPublishedAtDesc("PUBLISHED", category.trim(), pageable);
            } else if (hasQuery) {
                resultPage = blogJpaRepository.searchPublishedByQuery(query.trim(), pageable);
            } else {
                resultPage = blogJpaRepository.findByStatusOrderByPublishedAtDesc("PUBLISHED", pageable);
            }
        }

        return resultPage.getContent().stream()
                .map(BlogPersistenceMapper::toDomainModel)
                .collect(Collectors.toList());
    }

    @Override
    public List<Blog> findAll(String query, int page, int size) {
        return findAll(query, null, page, size);
    }

    @Override
    public List<Blog> findAll(String query, String postType, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        boolean hasType = postType != null && !postType.isBlank() && !postType.equalsIgnoreCase("ALL");
        boolean hasQuery = query != null && !query.isBlank();

        org.springframework.data.domain.Page<BlogJpaEntity> resultPage;
        if (hasType) {
            String type = postType.trim().toUpperCase();
            if (hasQuery) {
                resultPage = blogJpaRepository.searchAllByPostTypeAndQuery(type, query.trim(), pageable);
            } else {
                resultPage = blogJpaRepository.findAllByPostTypeOrdered(type, pageable);
            }
        } else {
            if (hasQuery) {
                resultPage = blogJpaRepository.searchAllByQuery(query.trim(), pageable);
            } else {
                resultPage = blogJpaRepository.findAllOrdered(pageable);
            }
        }

        return resultPage.getContent().stream()
                .map(BlogPersistenceMapper::toDomainModel)
                .collect(Collectors.toList());
    }

    @Override
    public List<Blog> findPublishedPreviewsByBookId(java.util.UUID bookId) {
        return blogJpaRepository.findPublishedPreviewsByBookId(bookId).stream()
                .map(BlogPersistenceMapper::toDomainModel)
                .collect(Collectors.toList());
    }

    @Override
    public List<Blog> findPublishedPreviewsByBookSlug(String slug) {
        return blogJpaRepository.findPublishedPreviewsByBookSlug(slug).stream()
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
