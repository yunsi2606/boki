package com.boki.application.dto.schedule;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BatchCreateScheduleRequest {

    @NotEmpty(message = "Danh sách mục lịch không được rỗng")
    @Valid
    @Builder.Default
    private List<CreateReleaseScheduleRequest> items = new ArrayList<>();
}
