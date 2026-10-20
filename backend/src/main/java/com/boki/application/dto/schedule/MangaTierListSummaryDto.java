package com.boki.application.dto.schedule;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MangaTierListSummaryDto {
    private UUID id;
    private String title;
    private String description;
    private String authorHandle;
    private String authorDisplayName;
    private String authorAvatarUrl;
    private int totalItems;
    @Builder.Default
    private List<String> topCovers = new ArrayList<>();
    private int likesCount;
    private int viewsCount;
    @JsonProperty("isLiked")
    private boolean isLiked;
    @JsonProperty("isPublic")
    private boolean isPublic;
    private OffsetDateTime createdAt;
    private String timeAgo;
}
