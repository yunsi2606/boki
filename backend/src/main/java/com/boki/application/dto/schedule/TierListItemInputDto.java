package com.boki.application.dto.schedule;

import lombok.*;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TierListItemInputDto {
    private UUID scheduleId;
    private String tierRank;
    private int sortOrder;
}
