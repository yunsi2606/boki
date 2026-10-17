package com.boki.application.dto.schedule;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateMangaTierListRequest {

    @NotBlank(message = "Tiêu đề không được để trống")
    private String title;

    private String description;

    @Builder.Default
    private Boolean isPublic = true;

    @Builder.Default
    private List<UUID> scheduleIds = new ArrayList<>();
}
