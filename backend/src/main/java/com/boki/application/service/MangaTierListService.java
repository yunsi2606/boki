package com.boki.application.service;

import com.boki.application.dto.schedule.MangaTierListDetailDto;
import com.boki.application.dto.schedule.MangaTierListItemDto;
import com.boki.application.dto.schedule.MangaTierListSummaryDto;
import com.boki.infrastructure.persistence.entity.MangaTierListJpaEntity;
import com.boki.infrastructure.persistence.entity.MangaTierListItemJpaEntity;
import com.boki.infrastructure.persistence.repository.MangaTierListItemJpaRepository;
import com.boki.infrastructure.persistence.repository.MangaTierListJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MangaTierListService {

    private final MangaTierListJpaRepository tierListRepo;
    private final MangaTierListItemJpaRepository itemRepo;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yy");

    @Transactional(readOnly = true)
    public List<MangaTierListSummaryDto> getTopPublicTierLists(int limit) {
        int safeLimit = Math.min(Math.max(limit, 1), 20);
        List<MangaTierListJpaEntity> entities = tierListRepo.findTopPublicTierLists(PageRequest.of(0, safeLimit));
        if (entities.isEmpty()) {
            return Collections.emptyList();
        }

        List<UUID> listIds = entities.stream().map(MangaTierListJpaEntity::getId).toList();
        List<MangaTierListItemJpaEntity> allItems = itemRepo.findByTierListIdIn(listIds);

        Map<UUID, List<MangaTierListItemJpaEntity>> itemsByListId = allItems.stream()
                .collect(Collectors.groupingBy(MangaTierListItemJpaEntity::getTierListId));

        return entities.stream().map(t -> {
            List<MangaTierListItemJpaEntity> items = itemsByListId.getOrDefault(t.getId(), Collections.emptyList());
            List<String> topCovers = items.stream()
                    .map(i -> i.getSchedule() != null ? i.getSchedule().getCoverUrl() : null)
                    .filter(Objects::nonNull)
                    .filter(c -> !c.isBlank())
                    .limit(3)
                    .toList();

            String authorName = t.getUser() != null ? t.getUser().getDisplayName() : "Độc giả";
            String handle = authorName.startsWith("@") ? authorName : "@" + authorName;

            return MangaTierListSummaryDto.builder()
                    .id(t.getId())
                    .title(t.getTitle())
                    .description(t.getDescription())
                    .authorHandle(handle)
                    .authorDisplayName(authorName)
                    .authorAvatarUrl(t.getUser() != null ? t.getUser().getAvatarUrl() : null)
                    .totalItems(items.size())
                    .topCovers(topCovers)
                    .likesCount(t.getLikesCount())
                    .isPublic(t.getIsPublic())
                    .createdAt(t.getCreatedAt())
                    .timeAgo(formatTimeAgo(t.getCreatedAt()))
                    .build();
        }).toList();
    }

    @Transactional(readOnly = true)
    public MangaTierListDetailDto getTierListDetail(UUID id) {
        MangaTierListJpaEntity t = tierListRepo.findByIdWithDetails(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy danh sách tuyển chọn: " + id));

        String authorName = t.getUser() != null ? t.getUser().getDisplayName() : "Độc giả";
        String handle = authorName.startsWith("@") ? authorName : "@" + authorName;

        List<MangaTierListItemDto> itemDtos = t.getItems().stream().map(i -> MangaTierListItemDto.builder()
                .id(i.getId())
                .scheduleId(i.getScheduleId())
                .title(i.getSchedule() != null ? i.getSchedule().getTitle() : "Truyện")
                .coverUrl(i.getSchedule() != null ? i.getSchedule().getCoverUrl() : null)
                .publisher(i.getSchedule() != null ? i.getSchedule().getPublisher() : null)
                .tierRank(i.getTierRank())
                .sortOrder(i.getSortOrder())
                .build()
        ).toList();

        return MangaTierListDetailDto.builder()
                .id(t.getId())
                .title(t.getTitle())
                .description(t.getDescription())
                .authorHandle(handle)
                .authorDisplayName(authorName)
                .authorAvatarUrl(t.getUser() != null ? t.getUser().getAvatarUrl() : null)
                .totalItems(itemDtos.size())
                .likesCount(t.getLikesCount())
                .isPublic(t.getIsPublic())
                .createdAt(t.getCreatedAt())
                .items(itemDtos)
                .build();
    }

    private String formatTimeAgo(OffsetDateTime dateTime) {
        if (dateTime == null) return "Gần đây";
        Duration diff = Duration.between(dateTime, OffsetDateTime.now());
        long days = diff.toDays();
        if (days == 0) {
            long hours = diff.toHours();
            if (hours == 0) return "Vừa xong";
            return hours + " giờ trước";
        }
        if (days < 7) {
            return days + " ngày trước";
        }
        return dateTime.format(DATE_FORMATTER);
    }
}
