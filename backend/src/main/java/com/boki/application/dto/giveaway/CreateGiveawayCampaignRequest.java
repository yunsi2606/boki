package com.boki.application.dto.giveaway;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateGiveawayCampaignRequest {

    @NotBlank(message = "Tiêu đề không được để trống")
    private String title;

    private String slug;

    private String description;

    private String bannerUrl;

    private UUID scheduleId;

    @NotBlank(message = "Loại cơ cấu giải không được để trống")
    private String prizeStructureType; // TIERED, FLAT

    private String status; // UPCOMING, OPEN, CLOSED

    @NotNull(message = "Thời gian bắt đầu không được để trống")
    private OffsetDateTime startDate;

    @NotNull(message = "Thời gian kết thúc không được để trống")
    private OffsetDateTime endDate;

    @NotEmpty(message = "Phải có ít nhất 1 giải thưởng")
    private List<GiveawayPrizeDto> prizes;
}
