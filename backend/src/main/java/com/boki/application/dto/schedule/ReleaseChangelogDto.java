package com.boki.application.dto.schedule;

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
public class ReleaseChangelogDto {
    private UUID id;
    private UUID scheduleId;
    private UUID editionId;
    private String changeType;
    private String oldValue;
    private String newValue;
    private String title;
    private String reason;
    private String sourceUrl;
    private OffsetDateTime createdAt;
}
