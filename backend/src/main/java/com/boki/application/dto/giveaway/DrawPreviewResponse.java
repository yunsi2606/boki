package com.boki.application.dto.giveaway;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DrawPreviewResponse {
    private UUID campaignId;
    private String campaignTitle;
    private Integer winningNumber;
    private Integer totalPrizes;
    private Integer totalEntries;
    private List<DrawCandidateDto> candidates;
}
