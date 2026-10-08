package com.boki.application.dto.schedule;

import com.boki.domain.model.schedule.ReleaseEditionType;
import com.boki.domain.model.schedule.ReleaseScheduleStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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
public class CreateReleaseScheduleRequest {
    @NotBlank(message = "Tên tập sách không được để trống")
    private String title;
    private String originalTitle;
    @NotBlank(message = "Nhà xuất bản không được để trống")
    private String publisher;
    private String author;
    @NotNull(message = "Ngày phát hành không được để trống")
    private LocalDate releaseDate;
    private BigDecimal estimatedPrice;
    private ReleaseEditionType editionType;
    private String gifts;
    private String coverUrl;
    private String description;
    private ReleaseScheduleStatus status;
    private UUID bookId;
}
