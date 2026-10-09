package com.boki.application.dto.schedule;

import com.boki.domain.model.schedule.ReleaseEditionType;
import com.boki.domain.model.schedule.ReleaseScheduleStatus;
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
public class ReleaseScheduleEditionDto {
    private UUID id;
    private UUID scheduleId;
    private String editionName;
    private ReleaseEditionType editionType;
    private LocalDate releaseDate;
    private LocalDate preOrderDate;
    private LocalDate effectiveReleaseDate;
    private LocalDate effectivePreOrderDate;
    private BigDecimal estimatedPrice;
    private String gifts;
    private String coverUrl;
    private ReleaseScheduleStatus status;
    private UUID bookId;
    private ReleaseScheduleDto.LinkedBookDto linkedBook;
    private Integer sortOrder;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
