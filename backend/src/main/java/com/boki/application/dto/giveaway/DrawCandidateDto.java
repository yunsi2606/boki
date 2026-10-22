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
public class DrawCandidateDto {
    private Integer rank;
    private UUID entryId;
    private String fullName;
    private String email;
    private String phone;
    private Integer luckyNumber;
    private Integer distance;
    private OffsetDateTime submittedAt;
    private UUID prizeId;
    private String prizeName;
    private String prizeTier;
    private Boolean isWinner;
}
