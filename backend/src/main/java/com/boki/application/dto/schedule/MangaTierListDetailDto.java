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
public class MangaTierListDetailDto {
    private UUID id;
    private String title;
    private String description;
    private String authorHandle;
    private String authorDisplayName;
    private String authorAvatarUrl;
    private UUID authorId;
    private int totalItems;
    private int likesCount;
    private int viewsCount;
    @JsonProperty("isLiked")
    private boolean isLiked;
    @JsonProperty("isPublic")
    private boolean isPublic;
    @JsonProperty("isOwner")
    private boolean isOwner;
    private String tiersConfig;
    private OffsetDateTime createdAt;
    @Builder.Default
    private List<MangaTierListItemDto> items = new ArrayList<>();
}
