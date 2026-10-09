package com.boki.domain.model.schedule;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
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
    private LocalDate preOrderDate;
    private String coverUrl;
    private String description;
    private ReleaseScheduleStatus status;
    private List<ReleaseScheduleEdition> editions;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
