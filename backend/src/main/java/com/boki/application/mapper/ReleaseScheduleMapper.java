package com.boki.application.mapper;

import com.boki.application.dto.schedule.ReleaseScheduleDto;
import com.boki.application.dto.schedule.ReleaseScheduleEditionDto;
import com.boki.infrastructure.persistence.entity.BookJpaEntity;
import com.boki.infrastructure.persistence.entity.ReleaseScheduleEditionJpaEntity;
import com.boki.infrastructure.persistence.entity.ReleaseScheduleJpaEntity;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class ReleaseScheduleMapper {

    public ReleaseScheduleDto toDto(ReleaseScheduleJpaEntity entity) {
        if (entity == null) {
            return null;
        }

        List<ReleaseScheduleEditionDto> editionDtos = new ArrayList<>();
        if (entity.getEditions() != null) {
            editionDtos = entity.getEditions().stream()
                    .map(e -> toEditionDto(e, entity))
                    .collect(Collectors.toList());
        }

        return ReleaseScheduleDto.builder()
                .id(entity.getId())
                .title(entity.getTitle())
                .originalTitle(entity.getOriginalTitle())
                .publisher(entity.getPublisher())
                .author(entity.getAuthor())
                .releaseDate(entity.getReleaseDate())
                .preOrderDate(entity.getPreOrderDate())
                .coverUrl(entity.getCoverUrl())
                .description(entity.getDescription())
                .status(entity.getStatus())
                .editions(editionDtos)
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    public ReleaseScheduleEditionDto toEditionDto(ReleaseScheduleEditionJpaEntity edition, ReleaseScheduleJpaEntity parent) {
        if (edition == null) return null;

        ReleaseScheduleDto.LinkedBookDto linkedBookDto = null;
        if (edition.getBook() != null) {
            BookJpaEntity book = edition.getBook();
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

        return ReleaseScheduleEditionDto.builder()
                .id(edition.getId())
                .scheduleId(edition.getScheduleId())
                .editionName(edition.getEditionName())
                .editionType(edition.getEditionType())
                .releaseDate(edition.getReleaseDate())
                .preOrderDate(edition.getPreOrderDate())
                .effectiveReleaseDate(edition.getEffectiveReleaseDate())
                .effectivePreOrderDate(edition.getEffectivePreOrderDate())
                .estimatedPrice(edition.getEstimatedPrice())
                .gifts(edition.getGifts())
                .coverUrl(edition.getCoverUrl())
                .status(edition.getStatus())
                .bookId(edition.getBookId())
                .linkedBook(linkedBookDto)
                .sortOrder(edition.getSortOrder())
                .createdAt(edition.getCreatedAt())
                .updatedAt(edition.getUpdatedAt())
                .build();
    }
}
