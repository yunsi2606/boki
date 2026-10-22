package com.boki.application.dto.giveaway;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GiveawayPrizeDto {
    private UUID id;
    private String prizeTier;
    private String prizeName;
    private Integer quantity;
    private Integer displayOrder;
    private UUID scheduleId;
    private String scheduleTitle;
    private String scheduleCoverUrl;
}
