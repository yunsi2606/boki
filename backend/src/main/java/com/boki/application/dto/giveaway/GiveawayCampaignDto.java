package com.boki.application.dto.giveaway;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GiveawayCampaignDto {
    private UUID id;
    private String title;
    private String slug;
    private String description;
    private String bannerUrl;
    private UUID scheduleId;
    private String scheduleTitle;
    private String prizeStructureType;
    private String status;
    private OffsetDateTime startDate;
    private OffsetDateTime endDate;
    private OffsetDateTime drawDate;
    private Integer winningNumber;
    private Integer totalWinnersCount;
    private Long totalEntriesCount;
    private OffsetDateTime createdAt;
}
