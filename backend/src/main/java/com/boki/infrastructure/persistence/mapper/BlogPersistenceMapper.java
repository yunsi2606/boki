package com.boki.infrastructure.persistence.mapper;

import com.boki.domain.model.blog.Blog;
import com.boki.domain.model.blog.BlogId;
import com.boki.domain.model.blog.BlogStatus;
import com.boki.domain.model.user.UserId;
import com.boki.infrastructure.persistence.entity.BlogJpaEntity;

import java.util.Arrays;
import java.util.List;

/**
 * Maps between Blog domain model and BlogJpaEntity.
 */
public final class BlogPersistenceMapper {

    private BlogPersistenceMapper() {
    }

    public static BlogJpaEntity toJpaEntity(Blog blog) {
        if (blog == null) return null;

        BlogJpaEntity entity = new BlogJpaEntity();
        entity.setId(blog.getId().value());
        entity.setAuthorId(blog.getAuthorId().value());
        entity.setAuthorName(blog.getAuthorName());
        entity.setTitle(blog.getTitle());
        entity.setSlug(blog.getSlug());
        entity.setExcerpt(blog.getExcerpt());
        entity.setContent(blog.getContent());
        entity.setCoverImage(blog.getCoverImage());
        entity.setCategory(blog.getCategory());
        entity.setTags(blog.getTags().toArray(new String[0]));
        entity.setStatus(blog.getStatus().name());
        entity.setViewsCount(blog.getViewsCount());
        entity.setLikesCount(blog.getLikesCount());
        entity.setReadingTimeMinutes(blog.getReadingTimeMinutes());
        entity.setFeatured(blog.isFeatured());
        entity.setPublishedAt(blog.getPublishedAt());
        entity.setCreatedAt(blog.getCreatedAt());
        entity.setUpdatedAt(blog.getUpdatedAt());
        return entity;
    }

    public static Blog toDomainModel(BlogJpaEntity entity) {
        if (entity == null) return null;

        List<String> tags = entity.getTags() != null
                ? Arrays.asList(entity.getTags())
                : List.of();

        return Blog.reconstitute(
                BlogId.of(entity.getId()),
                UserId.of(entity.getAuthorId()),
                entity.getAuthorName(),
                entity.getTitle(),
                entity.getSlug(),
                entity.getExcerpt(),
                entity.getContent(),
                entity.getCoverImage(),
                entity.getCategory(),
                tags,
                BlogStatus.valueOf(entity.getStatus()),
                entity.getViewsCount(),
                entity.getLikesCount(),
                entity.getReadingTimeMinutes(),
                entity.isFeatured(),
                entity.getPublishedAt(),
                entity.getCreatedAt(),
                entity.getUpdatedAt()
        );
    }
}
