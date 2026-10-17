package com.boki.application.dto.schedule;

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
    private int totalItems;
    private int likesCount;
    private boolean isPublic;
    private OffsetDateTime createdAt;
    @Builder.Default
    private List<MangaTierListItemDto> items = new ArrayList<>();
}
