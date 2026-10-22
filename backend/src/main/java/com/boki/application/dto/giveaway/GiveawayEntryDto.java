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
public class GiveawayEntryDto {
    private UUID id;
    private UUID campaignId;
    private String fullName;
    private String email;
    private String phone;
    private Integer luckyNumber;
    private String comment;
    private Boolean isWinner;
    private UUID prizeId;
    private String prizeName;
    private String prizeTier;
    private Integer prizeRank;
    private OffsetDateTime createdAt;
}
