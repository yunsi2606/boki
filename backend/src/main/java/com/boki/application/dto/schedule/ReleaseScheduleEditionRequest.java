package com.boki.application.dto.schedule;

import com.boki.domain.model.schedule.ReleaseEditionType;
import com.boki.domain.model.schedule.ReleaseScheduleStatus;
import jakarta.validation.constraints.NotBlank;
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
public class ReleaseScheduleEditionRequest {
    private UUID id;
    @NotBlank(message = "Tên phiên bản không được để trống")
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
}
