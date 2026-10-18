package com.boki.application.service;

import com.boki.application.dto.schedule.CreateMangaTierListRequest;
import com.boki.application.dto.schedule.MangaTierListDetailDto;
import com.boki.application.dto.schedule.MangaTierListSummaryDto;
import com.boki.application.dto.schedule.UpdateMangaTierListRequest;
import com.boki.infrastructure.persistence.entity.MangaTierListJpaEntity;
import com.boki.infrastructure.persistence.entity.MangaTierListItemJpaEntity;
import com.boki.infrastructure.persistence.repository.MangaTierListItemJpaRepository;
import com.boki.infrastructure.persistence.repository.MangaTierListJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminMangaTierListService {

    private final MangaTierListJpaRepository tierListRepo;
    private final MangaTierListItemJpaRepository itemRepo;
    private final MangaTierListService clientTierListService;

    @Transactional(readOnly = true)
    public List<MangaTierListSummaryDto> getAllForAdmin(String keyword) {
        String kw = (keyword != null && !keyword.trim().isEmpty()) ? keyword.trim() : null;
        List<MangaTierListJpaEntity> entities = tierListRepo.findAllForAdmin(kw);
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

            String authorName = t.getUser() != null ? t.getUser().getDisplayName() : "Quản trị viên";
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
                    .timeAgo(t.getCreatedAt().toString())
                    .build();
        }).toList();
    }

    @Transactional
    public MangaTierListDetailDto createTierList(UUID userId, CreateMangaTierListRequest req) {
        MangaTierListJpaEntity entity = MangaTierListJpaEntity.builder()
                .userId(userId)
                .title(req.getTitle().trim())
                .description(req.getDescription())
                .isPublic(req.getIsPublic() != null ? req.getIsPublic() : true)
                .likesCount(0)
                .viewsCount(0)
                .createdAt(OffsetDateTime.now())
                .updatedAt(OffsetDateTime.now())
                .build();

        MangaTierListJpaEntity saved = tierListRepo.save(entity);

        if (req.getScheduleIds() != null && !req.getScheduleIds().isEmpty()) {
            List<MangaTierListItemJpaEntity> items = new ArrayList<>();
            for (int i = 0; i < req.getScheduleIds().size(); i++) {
                UUID scheduleId = req.getScheduleIds().get(i);
                items.add(MangaTierListItemJpaEntity.builder()
                        .tierListId(saved.getId())
                        .scheduleId(scheduleId)
                        .tierRank("S")
                        .sortOrder(i + 1)
                        .createdAt(OffsetDateTime.now())
                        .build());
            }
            itemRepo.saveAll(items);
        }

        return clientTierListService.getTierListDetail(saved.getId(), null);
    }

    @Transactional
    public MangaTierListDetailDto updateTierList(UUID id, UpdateMangaTierListRequest req) {
        MangaTierListJpaEntity entity = tierListRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy danh sách tuyển chọn ID: " + id));

        entity.setTitle(req.getTitle().trim());
        entity.setDescription(req.getDescription());
        if (req.getIsPublic() != null) {
            entity.setIsPublic(req.getIsPublic());
        }
        entity.setUpdatedAt(OffsetDateTime.now());
        tierListRepo.save(entity);

        // Update items: delete old items and re-insert
        List<MangaTierListItemJpaEntity> existingItems = itemRepo.findByTierListIdOrderBySortOrderAsc(id);
        if (!existingItems.isEmpty()) {
            itemRepo.deleteAll(existingItems);
        }

        if (req.getScheduleIds() != null && !req.getScheduleIds().isEmpty()) {
            List<MangaTierListItemJpaEntity> items = new ArrayList<>();
            for (int i = 0; i < req.getScheduleIds().size(); i++) {
                UUID scheduleId = req.getScheduleIds().get(i);
                items.add(MangaTierListItemJpaEntity.builder()
                        .tierListId(id)
                        .scheduleId(scheduleId)
                        .tierRank("S")
                        .sortOrder(i + 1)
                        .createdAt(OffsetDateTime.now())
                        .build());
            }
            itemRepo.saveAll(items);
        }

        return clientTierListService.getTierListDetail(id, null);
    }

    @Transactional
    public void deleteTierList(UUID id) {
        if (!tierListRepo.existsById(id)) {
            throw new IllegalArgumentException("Không tìm thấy danh sách tuyển chọn ID: " + id);
        }
        tierListRepo.deleteById(id);
    }

    @Transactional
    public boolean togglePublic(UUID id) {
        MangaTierListJpaEntity entity = tierListRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy danh sách tuyển chọn ID: " + id));
        boolean newStatus = !Boolean.TRUE.equals(entity.getIsPublic());
        entity.setIsPublic(newStatus);
        entity.setUpdatedAt(OffsetDateTime.now());
        tierListRepo.save(entity);
        return newStatus;
    }
}
