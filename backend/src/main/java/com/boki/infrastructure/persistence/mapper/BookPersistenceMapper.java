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
        entity.setId(book.getId().value());
        entity.setSellerId(book.getSellerId().value());
        entity.setCategoryId(book.getCategoryId());
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
        entity.setCreatedAt(book.getCreatedAt());
        entity.setUpdatedAt(book.getUpdatedAt());
        entity.setCreatedBy(book.getCreatedBy());

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
        if (entity.getImages() != null) {
            entity.getImages().stream()
                    .sorted((a, b) -> Integer.compare(a.getSortOrder(), b.getSortOrder()))
                    .map(BookImageJpaEntity::getImageUrl)
                    .forEach(imageUrls::add);
        }

        return Book.reconstitute(
                BookId.of(entity.getId()),
                UserId.of(entity.getSellerId()),
                entity.getCategoryId(),
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
    }
}
