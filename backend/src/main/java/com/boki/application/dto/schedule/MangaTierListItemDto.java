package com.boki.application.dto.schedule;

import lombok.*;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MangaTierListItemDto {
    private UUID id;
    private UUID scheduleId;
    private String title;
    private String coverUrl;
    private String publisher;
    private String tierRank;
    private int sortOrder;
}
