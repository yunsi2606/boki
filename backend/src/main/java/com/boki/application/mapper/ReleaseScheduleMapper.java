package com.boki.application.mapper;

import com.boki.application.dto.schedule.ReleaseScheduleDto;
import com.boki.infrastructure.persistence.entity.BookJpaEntity;
import com.boki.infrastructure.persistence.entity.ReleaseScheduleJpaEntity;
import org.springframework.stereotype.Component;

@Component
public class ReleaseScheduleMapper {

    public ReleaseScheduleDto toDto(ReleaseScheduleJpaEntity entity) {
        if (entity == null) {
            return null;
        }

        ReleaseScheduleDto.LinkedBookDto linkedBookDto = null;
        if (entity.getBook() != null) {
            BookJpaEntity book = entity.getBook();
            String cover = book.getCategoryCoverUrl();
            if ((cover == null || cover.isBlank()) && book.getImages() != null && !book.getImages().isEmpty()) {
                cover = book.getImages().get(0).getImageUrl();
            }

            linkedBookDto = ReleaseScheduleDto.LinkedBookDto.builder()
                    .id(book.getId())
                    .title(book.getTitle())
                    .slug(book.getSlug() != null ? book.getSlug() : book.getId().toString())
                    .price(book.getPrice())
                    .stockQuantity(book.getStockQuantity())
                    .isPreOrder(book.isPreOrder())
                    .coverUrl(cover)
                    .status(book.getStatus() != null ? book.getStatus().name() : "ACTIVE")
                    .build();
        }

        return ReleaseScheduleDto.builder()
                .id(entity.getId())
                .title(entity.getTitle())
                .originalTitle(entity.getOriginalTitle())
                .publisher(entity.getPublisher())
                .author(entity.getAuthor())
                .releaseDate(entity.getReleaseDate())
                .estimatedPrice(entity.getEstimatedPrice())
                .editionType(entity.getEditionType())
                .gifts(entity.getGifts())
                .coverUrl(entity.getCoverUrl())
                .description(entity.getDescription())
                .status(entity.getStatus())
                .bookId(entity.getBookId())
                .linkedBook(linkedBookDto)
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
