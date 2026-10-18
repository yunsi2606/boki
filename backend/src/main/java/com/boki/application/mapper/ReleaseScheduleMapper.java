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

        List<com.boki.application.dto.schedule.ReleaseStoreLinkDto> storeLinkDtos = new ArrayList<>();
        if (entity.getStoreLinks() != null) {
            storeLinkDtos = entity.getStoreLinks().stream()
                    .map(s -> com.boki.application.dto.schedule.ReleaseStoreLinkDto.builder()
                            .id(s.getId())
                            .scheduleId(s.getScheduleId())
                            .editionId(s.getEditionId())
                            .platform(s.getPlatform())
                            .storeName(s.getStoreName())
                            .productUrl(s.getProductUrl())
                            .marketPrice(s.getMarketPrice())
                            .isPreorder(s.getIsPreorder())
                            .sortOrder(s.getSortOrder())
                            .build())
                    .collect(Collectors.toList());
        }

        List<com.boki.application.dto.schedule.ReleaseChangelogDto> changelogDtos = new ArrayList<>();
        if (entity.getChangelogs() != null) {
            changelogDtos = entity.getChangelogs().stream()
                    .map(c -> com.boki.application.dto.schedule.ReleaseChangelogDto.builder()
                            .id(c.getId())
                            .scheduleId(c.getScheduleId())
                            .editionId(c.getEditionId())
                            .changeType(c.getChangeType())
                            .oldValue(c.getOldValue())
                            .newValue(c.getNewValue())
                            .title(c.getTitle())
                            .reason(c.getReason())
                            .sourceUrl(c.getSourceUrl())
                            .createdAt(c.getCreatedAt())
                            .build())
                    .collect(Collectors.toList());
        }

        return ReleaseScheduleDto.builder()
                .id(entity.getId())
                .title(entity.getTitle())
                .originalTitle(entity.getOriginalTitle())
                .publisher(entity.getPublisher())
                .author(entity.getAuthor())
                .artist(entity.getArtist())
                .imprint(entity.getImprint())
                .genres(entity.getGenres())
                .format(entity.getFormat())
                .seriesStatus(entity.getSeriesStatus())
                .ageRating(entity.getAgeRating())
                .specs(entity.getSpecs())
                .releaseDate(entity.getReleaseDate())
                .preOrderDate(entity.getPreOrderDate())
                .coverUrl(entity.getCoverUrl())
                .description(entity.getDescription())
                .status(entity.getStatus())
                .slug(entity.getSlug())
                .seriesName(entity.getSeriesName())
                .seriesSlug(entity.getSeriesSlug())
                .volumeNumber(entity.getVolumeNumber())
                .totalVolumes(entity.getTotalVolumes())
                .editions(editionDtos)
                .storeLinks(storeLinkDtos)
                .changelogs(changelogDtos)
                .viewsCount(entity.getViewsCount())
                .likesCount(entity.getLikesCount())
                .rating(entity.getRating())
                .reviewsCount(entity.getReviewsCount())
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

    public ReleaseScheduleEditionJpaEntity toEditionEntity(
            com.boki.application.dto.schedule.ReleaseScheduleEditionRequest req,
            ReleaseScheduleJpaEntity parent, int sortOrder) {
        return ReleaseScheduleEditionJpaEntity.builder()
                .schedule(parent)
                .editionName(req.getEditionName().trim())
                .editionType(req.getEditionType() != null ? req.getEditionType() : com.boki.domain.model.schedule.ReleaseEditionType.STANDARD)
                .releaseDate(req.getReleaseDate())
                .preOrderDate(req.getPreOrderDate())
                .estimatedPrice(req.getEstimatedPrice())
                .gifts(req.getGifts())
                .coverUrl(req.getCoverUrl())
                .status(req.getStatus() != null ? req.getStatus() : com.boki.domain.model.schedule.ReleaseScheduleStatus.SCHEDULED)
                .bookId(req.getBookId())
                .sortOrder(req.getSortOrder() != null ? req.getSortOrder() : sortOrder)
                .createdAt(java.time.OffsetDateTime.now())
                .updatedAt(java.time.OffsetDateTime.now())
                .build();
    }
}
