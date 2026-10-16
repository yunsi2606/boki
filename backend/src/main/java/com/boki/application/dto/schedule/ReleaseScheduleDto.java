package com.boki.application.dto.schedule;

import com.boki.domain.model.schedule.ReleaseScheduleStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReleaseScheduleDto {
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
    private String slug;
    private String seriesName;
    private String seriesSlug;
    private Integer volumeNumber;
    private Integer totalVolumes;
    
    @Builder.Default
    private List<ReleaseScheduleEditionDto> editions = new ArrayList<>();

    @Builder.Default
    private List<ReleaseStoreLinkDto> storeLinks = new ArrayList<>();

    @Builder.Default
    private List<ReleaseChangelogDto> changelogs = new ArrayList<>();

    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LinkedBookDto {
        private UUID id;
        private String title;
        private String slug;
        private BigDecimal price;
        private Integer stockQuantity;
        private Boolean isPreOrder;
        private String coverUrl;
        private String status;
    }
}
