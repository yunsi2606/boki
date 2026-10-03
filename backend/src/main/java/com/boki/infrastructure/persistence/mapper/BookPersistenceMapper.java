package com.boki.infrastructure.persistence.mapper;

import com.boki.domain.model.book.*;
import com.boki.domain.model.user.UserId;
import com.boki.infrastructure.persistence.entity.BookImageJpaEntity;
import com.boki.infrastructure.persistence.entity.BookJpaEntity;

import java.util.ArrayList;
import java.util.List;

public final class BookPersistenceMapper {

    private BookPersistenceMapper() {
    }

    public static BookJpaEntity toJpaEntity(Book book) {
        if (book == null) {
            return null;
        }

        BookJpaEntity entity = new BookJpaEntity();
        if (book.getId() != null) {
            entity.setId(book.getId().value());
        }
        entity.setSellerId(book.getSellerId().value());
        entity.setCategoryId(book.getCategoryId());
        if (book.getCategoryIds() != null && !book.getCategoryIds().isEmpty()) {
            entity.setCategoryIds(new java.util.LinkedHashSet<>(book.getCategoryIds()));
        }
        entity.setTitle(book.getTitle());
        entity.setSlug(com.boki.infrastructure.util.SlugUtils.slugify(book.getTitle()));
        entity.setAuthor(book.getAuthor());
        entity.setIsbn(book.getIsbn());
        entity.setPublicationDetails(book.getPublicationDetails());
        entity.setDescription(book.getDescription());
        entity.setPrice(book.getPrice().amount());
        entity.setOriginalPrice(book.getOriginalPrice() != null ? book.getOriginalPrice().amount() : null);
        entity.setViewsCount(book.getViewsCount());
        entity.setRating(book.getRating());
        entity.setReviewsCount(book.getReviewsCount());
        entity.setCurrency(book.getPrice().currency());
        entity.setCondition(BookJpaEntity.BookConditionJpa.valueOf(book.getCondition().name()));
        entity.setStatus(BookJpaEntity.BookStatusJpa.valueOf(book.getStatus().name()));
        entity.setStockQuantity(book.getStockQuantity());
        entity.setMaxOrderQuantity(book.getMaxOrderQuantity());
        entity.setPreOrder(book.isPreOrder());
        entity.setPreOrderDays(book.getPreOrderDays());
        entity.setCombo(book.isCombo());
        entity.setCreatedAt(book.getCreatedAt());
        entity.setUpdatedAt(book.getUpdatedAt());
        entity.setCreatedBy(book.getCreatedBy());
        entity.setCategoryCoverUrl(book.getCategoryCoverUrl());

        if (book.getImageUrls() != null) {
            for (int i = 0; i < book.getImageUrls().size(); i++) {
                BookImageJpaEntity imgEntity = new BookImageJpaEntity();
                imgEntity.setImageUrl(book.getImageUrls().get(i));
                imgEntity.setSortOrder(i);
                imgEntity.setPrimary(i == 0);
                entity.addImage(imgEntity);
            }
        }

        return entity;
    }

    public static Book toDomainModel(BookJpaEntity entity) {
        if (entity == null) {
            return null;
        }

        List<String> imageUrls = new ArrayList<>();
        try {
            if (entity.getImages() != null) {
                entity.getImages().stream()
                        .sorted((a, b) -> Integer.compare(a.getSortOrder(), b.getSortOrder()))
                        .map(BookImageJpaEntity::getImageUrl)
                        .forEach(imageUrls::add);
            }
        } catch (org.hibernate.LazyInitializationException ignored) {
            // Lazy images collection not initialized and no open Hibernate session
        }

        List<Integer> categoryIds = new ArrayList<>();
        try {
            if (entity.getCategoryIds() != null && !entity.getCategoryIds().isEmpty()) {
                categoryIds.addAll(entity.getCategoryIds());
            }
        } catch (Exception ignored) {
        }
        if (categoryIds.isEmpty() && entity.getCategoryId() != null) {
            categoryIds.add(entity.getCategoryId());
        }

        Book book = Book.reconstitute(
                BookId.of(entity.getId()),
                UserId.of(entity.getSellerId()),
                entity.getCategoryId(),
                categoryIds,
                entity.getTitle(),
                entity.getAuthor(),
                entity.getIsbn(),
                entity.getPublicationDetails(),
                entity.getDescription(),
                Price.of(entity.getPrice(), entity.getCurrency()),
                entity.getOriginalPrice() != null ? Price.of(entity.getOriginalPrice(), entity.getCurrency()) : null,
                entity.getViewsCount(),
                entity.getRating(),
                entity.getReviewsCount(),
                BookCondition.valueOf(entity.getCondition().name()),
                BookStatus.valueOf(entity.getStatus().name()),
                entity.getStockQuantity(),
                entity.getMaxOrderQuantity(),
                entity.isPreOrder(),
                entity.getPreOrderDays(),
                imageUrls,
                entity.getCreatedAt(),
                entity.getUpdatedAt(),
                entity.getCreatedBy()
        );
        book.setCombo(entity.isCombo());
        book.setCategoryCoverUrl(entity.getCategoryCoverUrl());
        return book;
    }
}
