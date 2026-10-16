package com.boki.application.dto.schedule;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserMangaCollectionDto {
    private UUID id;
    private UUID userId;
    private UUID scheduleId;
    private UUID editionId;
    private String status;
    private BigDecimal purchasePrice;
    private String purchasePlace;
    private LocalDate purchasedAt;
    private String readingStatus;
    private Integer personalRating;
    private String notes;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    // Additional info for UI presentation
    private String scheduleTitle;
    private String seriesName;
    private String seriesSlug;
    private Integer volumeNumber;
    private String coverUrl;
    private String publisher;
    private BigDecimal estimatedPrice;
    private String editionName;
}
