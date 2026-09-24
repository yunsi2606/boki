package com.boki.application.service;

import com.boki.application.dto.request.CreateBlogCategoryRequest;
import com.boki.application.dto.response.BlogCategoryResponse;
import com.boki.application.port.in.GetBlogCategoriesUseCase;
import com.boki.application.port.in.ManageBlogCategoryUseCase;
import com.boki.infrastructure.persistence.entity.BlogCategoryJpaEntity;
import com.boki.infrastructure.persistence.repository.BlogCategoryJpaRepository;
import com.boki.infrastructure.util.SlugUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class BlogCategoryApplicationService implements GetBlogCategoriesUseCase, ManageBlogCategoryUseCase {

    private final BlogCategoryJpaRepository blogCategoryRepository;

    public BlogCategoryApplicationService(BlogCategoryJpaRepository blogCategoryRepository) {
        this.blogCategoryRepository = blogCategoryRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<BlogCategoryResponse> getAllCategories() {
        return blogCategoryRepository.findAllByOrderByNameAsc().stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public BlogCategoryResponse createCategory(CreateBlogCategoryRequest request) {
        String trimmedName = request.name().trim();
        if (blogCategoryRepository.existsByNameIgnoreCase(trimmedName)) {
            throw new IllegalArgumentException("Danh mục bài viết '" + trimmedName + "' đã tồn tại.");
        }

        String baseSlug = SlugUtils.slugify(trimmedName);
        if (baseSlug.isBlank()) {
            baseSlug = "danh-muc-" + System.currentTimeMillis();
        }

        String slug = baseSlug;
        int counter = 1;
        while (blogCategoryRepository.findBySlug(slug).isPresent()) {
            slug = baseSlug + "-" + counter++;
        }

        BlogCategoryJpaEntity entity = new BlogCategoryJpaEntity(
                trimmedName,
                slug,
                request.description() != null ? request.description().trim() : null
        );

        BlogCategoryJpaEntity saved = blogCategoryRepository.save(entity);
        return toResponse(saved);
    }

    @Override
    @Transactional
    public void deleteCategory(Integer id) {
        blogCategoryRepository.deleteById(id);
    }

    private BlogCategoryResponse toResponse(BlogCategoryJpaEntity entity) {
        return new BlogCategoryResponse(
                entity.getId(),
                entity.getName(),
                entity.getSlug(),
                entity.getDescription(),
                entity.getCreatedAt()
        );
    }
}
