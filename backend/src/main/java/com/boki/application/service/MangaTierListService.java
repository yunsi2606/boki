package com.boki.application.service;

import com.boki.application.dto.schedule.*;
import com.boki.infrastructure.persistence.entity.MangaTierListJpaEntity;
import com.boki.infrastructure.persistence.entity.MangaTierListItemJpaEntity;
import com.boki.infrastructure.persistence.entity.MangaTierListLikeJpaEntity;
import com.boki.infrastructure.persistence.repository.MangaTierListItemJpaRepository;
import com.boki.infrastructure.persistence.repository.MangaTierListJpaRepository;
import com.boki.infrastructure.persistence.repository.MangaTierListLikeJpaRepository;
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
    private final MangaTierListLikeJpaRepository likeRepo;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yy");

    @Transactional(readOnly = true)
    public List<MangaTierListSummaryDto> getTopPublicTierLists(int limit, UUID currentUserId) {
        int safeLimit = Math.min(Math.max(limit, 1), 20);
        List<MangaTierListJpaEntity> entities = tierListRepo.findTopPublicTierLists(PageRequest.of(0, safeLimit));
        return mapToSummaries(entities, currentUserId);
    }

    @Transactional(readOnly = true)
    public List<MangaTierListSummaryDto> getAllPublic(int page, int size, UUID currentUserId) {
        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), 50);
        List<MangaTierListJpaEntity> entities = tierListRepo.findAllPublic(PageRequest.of(safePage, safeSize));
        return mapToSummaries(entities, currentUserId);
    }

    @Transactional(readOnly = true)
    public List<MangaTierListSummaryDto> getMyTierLists(UUID userId) {
        List<MangaTierListJpaEntity> entities = tierListRepo.findByUserId(userId);
        return mapToSummaries(entities, userId);
    }

    @Transactional(readOnly = true)
    public MangaTierListDetailDto getTierListDetail(UUID id, UUID currentUserId) {
        MangaTierListJpaEntity t = tierListRepo.findByIdWithDetails(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy danh sách tuyển chọn: " + id));

        boolean isLiked = currentUserId != null && likeRepo.existsByUserIdAndTierListId(currentUserId, id);
        String authorName = t.getUser() != null ? t.getUser().getDisplayName() : "Độc giả";

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
                .authorHandle(authorName.startsWith("@") ? authorName : "@" + authorName)
                .authorDisplayName(authorName)
                .authorAvatarUrl(t.getUser() != null ? t.getUser().getAvatarUrl() : null)
                .totalItems(itemDtos.size())
                .likesCount(t.getLikesCount())
                .viewsCount(t.getViewsCount())
                .isLiked(isLiked)
                .isPublic(t.getIsPublic())
                .tiersConfig(t.getTiersConfig())
                .createdAt(t.getCreatedAt())
                .items(itemDtos)
                .build();
    }

    @Transactional
    public MangaTierListDetailDto createTierList(UUID userId, CreateMangaTierListRequest req) {
        MangaTierListJpaEntity entity = MangaTierListJpaEntity.builder()
                .userId(userId)
                .title(req.getTitle().trim())
                .description(req.getDescription())
                .tiersConfig(req.getTiersConfig())
                .isPublic(req.getIsPublic() != null ? req.getIsPublic() : true)
                .likesCount(0)
                .viewsCount(0)
                .createdAt(OffsetDateTime.now())
                .updatedAt(OffsetDateTime.now())
                .build();

        MangaTierListJpaEntity saved = tierListRepo.save(entity);
        saveItems(saved.getId(), req.getRankedItems(), req.getScheduleIds());
        return getTierListDetail(saved.getId(), userId);
    }

    @Transactional
    public MangaTierListDetailDto updateTierList(UUID userId, UUID id, UpdateMangaTierListRequest req) {
        MangaTierListJpaEntity entity = tierListRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy danh sách tuyển chọn: " + id));

        if (!entity.getUserId().equals(userId)) {
            throw new org.springframework.security.access.AccessDeniedException("Bạn không có quyền chỉnh sửa danh sách này");
        }

        entity.setTitle(req.getTitle().trim());
        entity.setDescription(req.getDescription());
        if (req.getTiersConfig() != null) entity.setTiersConfig(req.getTiersConfig());
        if (req.getIsPublic() != null) entity.setIsPublic(req.getIsPublic());
        entity.setUpdatedAt(OffsetDateTime.now());
        tierListRepo.save(entity);

        List<MangaTierListItemJpaEntity> existing = itemRepo.findByTierListIdOrderBySortOrderAsc(id);
        if (!existing.isEmpty()) itemRepo.deleteAll(existing);

        saveItems(id, req.getRankedItems(), req.getScheduleIds());
        return getTierListDetail(id, userId);
    }

    @Transactional
    public void deleteTierList(UUID userId, UUID id) {
        MangaTierListJpaEntity entity = tierListRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy danh sách tuyển chọn: " + id));
        if (!entity.getUserId().equals(userId)) {
            throw new org.springframework.security.access.AccessDeniedException("Bạn không có quyền xóa danh sách này");
        }
        tierListRepo.delete(entity);
    }

    @Transactional
    public boolean toggleLike(UUID userId, UUID id) {
        MangaTierListJpaEntity entity = tierListRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy danh sách tuyển chọn: " + id));

        boolean exists = likeRepo.existsByUserIdAndTierListId(userId, id);
        if (exists) {
            likeRepo.deleteByUserIdAndTierListId(userId, id);
            entity.setLikesCount(Math.max(0, entity.getLikesCount() - 1));
            tierListRepo.save(entity);
            return false;
        } else {
            likeRepo.save(MangaTierListLikeJpaEntity.builder().userId(userId).tierListId(id).build());
            entity.setLikesCount(entity.getLikesCount() + 1);
            tierListRepo.save(entity);
            return true;
        }
    }

    @Transactional
    public void recordView(UUID id) {
        tierListRepo.findById(id).ifPresent(e -> {
            e.setViewsCount(e.getViewsCount() + 1);
            tierListRepo.save(e);
        });
    }

    private void saveItems(UUID tierListId, List<TierListItemInputDto> ranked, List<UUID> scheduleIds) {
        List<MangaTierListItemJpaEntity> items = new ArrayList<>();
        if (ranked != null && !ranked.isEmpty()) {
            for (int i = 0; i < ranked.size(); i++) {
                TierListItemInputDto r = ranked.get(i);
                if (r.getScheduleId() != null) {
                    items.add(MangaTierListItemJpaEntity.builder()
                            .tierListId(tierListId)
                            .scheduleId(r.getScheduleId())
                            .tierRank(r.getTierRank() != null ? r.getTierRank() : "S")
                            .sortOrder(r.getSortOrder() > 0 ? r.getSortOrder() : i + 1)
                            .createdAt(OffsetDateTime.now())
                            .build());
                }
            }
        } else if (scheduleIds != null && !scheduleIds.isEmpty()) {
            for (int i = 0; i < scheduleIds.size(); i++) {
                items.add(MangaTierListItemJpaEntity.builder()
                        .tierListId(tierListId)
                        .scheduleId(scheduleIds.get(i))
                        .tierRank("S")
                        .sortOrder(i + 1)
                        .createdAt(OffsetDateTime.now())
                        .build());
            }
        }
        if (!items.isEmpty()) itemRepo.saveAll(items);
    }

    private List<MangaTierListSummaryDto> mapToSummaries(List<MangaTierListJpaEntity> entities, UUID currentUserId) {
        if (entities.isEmpty()) return Collections.emptyList();
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
                    .limit(4)
                    .toList();

            String author = t.getUser() != null ? t.getUser().getDisplayName() : "Độc giả";
            boolean isLiked = currentUserId != null && likeRepo.existsByUserIdAndTierListId(currentUserId, t.getId());

            return MangaTierListSummaryDto.builder()
                    .id(t.getId())
                    .title(t.getTitle())
                    .description(t.getDescription())
                    .authorHandle(author.startsWith("@") ? author : "@" + author)
                    .authorDisplayName(author)
                    .authorAvatarUrl(t.getUser() != null ? t.getUser().getAvatarUrl() : null)
                    .totalItems(items.size())
                    .topCovers(topCovers)
                    .likesCount(t.getLikesCount())
                    .viewsCount(t.getViewsCount())
                    .isLiked(isLiked)
                    .isPublic(t.getIsPublic())
                    .createdAt(t.getCreatedAt())
                    .timeAgo(formatTimeAgo(t.getCreatedAt()))
                    .build();
        }).toList();
    }

    private String formatTimeAgo(OffsetDateTime dt) {
        if (dt == null) return "Gần đây";
        Duration diff = Duration.between(dt, OffsetDateTime.now());
        if (diff.toDays() == 0) return diff.toHours() == 0 ? "Vừa xong" : diff.toHours() + " giờ trước";
        return diff.toDays() < 7 ? diff.toDays() + " ngày trước" : dt.format(DATE_FORMATTER);
    }
}
