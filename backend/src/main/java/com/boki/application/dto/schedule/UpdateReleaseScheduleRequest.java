package com.boki.application.dto.schedule;

import com.boki.domain.model.schedule.ReleaseEditionType;
import com.boki.domain.model.schedule.ReleaseScheduleStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateReleaseScheduleRequest {
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
}
