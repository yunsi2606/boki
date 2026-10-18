package com.boki.application.dto.schedule;

import com.boki.domain.model.schedule.ReleaseScheduleStatus;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateReleaseScheduleRequest {
    private String title;
    private String originalTitle;
    private String publisher;
    private String author;
    private String artist;
    private String imprint;
    private String genres;
    private String format;
    private String seriesStatus;
    private String ageRating;
    private String specs;
    private LocalDate releaseDate;
    private LocalDate preOrderDate;
    private String coverUrl;
    private String description;
    private ReleaseScheduleStatus status;

    @Valid
    private List<ReleaseScheduleEditionRequest> editions;
}
