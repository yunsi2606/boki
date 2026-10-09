package com.boki.application.dto.schedule;

import com.boki.domain.model.schedule.ReleaseScheduleStatus;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateReleaseScheduleRequest {
    @NotBlank(message = "Tên tập sách không được để trống")
    private String title;
    private String originalTitle;
    @NotBlank(message = "Nhà xuất bản không được để trống")
    private String publisher;
    private String author;
    @NotNull(message = "Ngày phát hành không được để trống")
    private LocalDate releaseDate;
    private LocalDate preOrderDate;
    private String coverUrl;
    private String description;
    private ReleaseScheduleStatus status;

    @Valid
    @Builder.Default
    private List<ReleaseScheduleEditionRequest> editions = new ArrayList<>();
}
