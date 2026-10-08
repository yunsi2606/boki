package com.boki.domain.model.schedule;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReleaseSchedule {
    private UUID id;
    private String title;
    private String originalTitle;
    private String publisher;
    private String author;
    private LocalDate releaseDate;
    private BigDecimal estimatedPrice;
    private ReleaseEditionType editionType;
    private String gifts;
    private String coverUrl;
    private String description;
    private ReleaseScheduleStatus status;
    private UUID bookId;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
