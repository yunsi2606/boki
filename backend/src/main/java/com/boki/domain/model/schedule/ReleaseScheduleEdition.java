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
public class ReleaseScheduleEdition {
    private UUID id;
    private UUID scheduleId;
    private String editionName;
    private ReleaseEditionType editionType;
    private LocalDate releaseDate;
    private LocalDate preOrderDate;
    private BigDecimal estimatedPrice;
    private String gifts;
    private String coverUrl;
    private ReleaseScheduleStatus status;
    private UUID bookId;
    private Integer sortOrder;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
