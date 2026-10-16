package com.boki.application.service;

import com.boki.application.dto.schedule.UpdateUserMangaCollectionRequest;
import com.boki.application.dto.schedule.UserMangaCollectionDto;
import com.boki.infrastructure.persistence.entity.ReleaseScheduleJpaEntity;
import com.boki.infrastructure.persistence.entity.UserMangaCollectionJpaEntity;
import com.boki.infrastructure.persistence.repository.ReleaseScheduleJpaRepository;
import com.boki.infrastructure.persistence.repository.UserMangaCollectionJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserMangaCollectionService {

    private final UserMangaCollectionJpaRepository collectionRepo;
    private final ReleaseScheduleJpaRepository scheduleRepo;

    @Transactional(readOnly = true)
    public List<UserMangaCollectionDto> getUserCollection(UUID userId, String status) {
        List<UserMangaCollectionJpaEntity> entities;
        if (status != null && !status.isBlank() && !status.equalsIgnoreCase("ALL")) {
            entities = collectionRepo.findByUserIdAndStatusOrderByUpdatedAtDesc(userId, status.toUpperCase());
        } else {
            entities = collectionRepo.findByUserIdOrderByUpdatedAtDesc(userId);
        }

        if (entities.isEmpty()) return Collections.emptyList();

        Set<UUID> scheduleIds = entities.stream()
                .map(UserMangaCollectionJpaEntity::getScheduleId)
                .collect(Collectors.toSet());

        Map<UUID, ReleaseScheduleJpaEntity> scheduleMap = scheduleRepo.findAllById(scheduleIds).stream()
                .collect(Collectors.toMap(ReleaseScheduleJpaEntity::getId, s -> s));

        return entities.stream().map(e -> {
            ReleaseScheduleJpaEntity s = scheduleMap.get(e.getScheduleId());
            return UserMangaCollectionDto.builder()
                    .id(e.getId())
                    .userId(e.getUserId())
                    .scheduleId(e.getScheduleId())
                    .editionId(e.getEditionId())
                    .status(e.getStatus())
                    .purchasePrice(e.getPurchasePrice())
                    .purchasePlace(e.getPurchasePlace())
                    .purchasedAt(e.getPurchasedAt())
                    .readingStatus(e.getReadingStatus())
                    .personalRating(e.getPersonalRating() != null ? e.getPersonalRating().intValue() : null)
                    .notes(e.getNotes())
                    .createdAt(e.getCreatedAt())
                    .updatedAt(e.getUpdatedAt())
                    .scheduleTitle(s != null ? s.getTitle() : null)
                    .seriesName(s != null ? s.getSeriesName() : null)
                    .seriesSlug(s != null ? s.getSeriesSlug() : null)
                    .volumeNumber(s != null ? s.getVolumeNumber() : null)
                    .coverUrl(s != null ? s.getCoverUrl() : null)
                    .publisher(s != null ? s.getPublisher() : null)
                    .build();
        }).collect(Collectors.toList());
    }

    @Transactional
    public UserMangaCollectionDto upsertCollectionItem(UUID userId, UpdateUserMangaCollectionRequest req) {
        UserMangaCollectionJpaEntity entity = collectionRepo.findByUserIdAndScheduleId(userId, req.getScheduleId())
                .orElseGet(() -> UserMangaCollectionJpaEntity.builder()
                        .userId(userId)
                        .scheduleId(req.getScheduleId())
                        .build());

        entity.setEditionId(req.getEditionId());
        entity.setStatus(req.getStatus().toUpperCase());
        entity.setPurchasePrice(req.getPurchasePrice());
        entity.setPurchasePlace(req.getPurchasePlace());
        entity.setPurchasedAt(req.getPurchasedAt());
        if (req.getReadingStatus() != null) {
            entity.setReadingStatus(req.getReadingStatus().toUpperCase());
        }
        entity.setPersonalRating(req.getPersonalRating() != null ? req.getPersonalRating().shortValue() : null);
        entity.setNotes(req.getNotes());
        entity.setUpdatedAt(OffsetDateTime.now());

        UserMangaCollectionJpaEntity saved = collectionRepo.save(entity);
        ReleaseScheduleJpaEntity s = scheduleRepo.findById(req.getScheduleId()).orElse(null);

        return UserMangaCollectionDto.builder()
                .id(saved.getId())
                .userId(saved.getUserId())
                .scheduleId(saved.getScheduleId())
                .editionId(saved.getEditionId())
                .status(saved.getStatus())
                .purchasePrice(saved.getPurchasePrice())
                .purchasePlace(saved.getPurchasePlace())
                .purchasedAt(saved.getPurchasedAt())
                .readingStatus(saved.getReadingStatus())
                .personalRating(saved.getPersonalRating() != null ? saved.getPersonalRating().intValue() : null)
                .notes(saved.getNotes())
                .createdAt(saved.getCreatedAt())
                .updatedAt(saved.getUpdatedAt())
                .scheduleTitle(s != null ? s.getTitle() : null)
                .seriesName(s != null ? s.getSeriesName() : null)
                .seriesSlug(s != null ? s.getSeriesSlug() : null)
                .volumeNumber(s != null ? s.getVolumeNumber() : null)
                .coverUrl(s != null ? s.getCoverUrl() : null)
                .publisher(s != null ? s.getPublisher() : null)
                .build();
    }

    @Transactional
    public void deleteCollectionItem(UUID userId, UUID scheduleId) {
        collectionRepo.deleteByUserIdAndScheduleId(userId, scheduleId);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getCollectionStats(UUID userId) {
        List<UserMangaCollectionJpaEntity> all = collectionRepo.findByUserIdOrderByUpdatedAtDesc(userId);
        long ownedCount = all.stream().filter(i -> "OWNED".equalsIgnoreCase(i.getStatus())).count();
        long seekingCount = all.stream().filter(i -> "SEEKING".equalsIgnoreCase(i.getStatus())).count();
        long wishlistCount = all.stream().filter(i -> "WISHLIST".equalsIgnoreCase(i.getStatus())).count();

        BigDecimal totalSpent = all.stream()
                .filter(i -> "OWNED".equalsIgnoreCase(i.getStatus()) && i.getPurchasePrice() != null)
                .map(UserMangaCollectionJpaEntity::getPurchasePrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long readCount = all.stream()
                .filter(i -> "OWNED".equalsIgnoreCase(i.getStatus()) && "COMPLETED".equalsIgnoreCase(i.getReadingStatus()))
                .count();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalItems", all.size());
        stats.put("ownedCount", ownedCount);
        stats.put("seekingCount", seekingCount);
        stats.put("wishlistCount", wishlistCount);
        stats.put("totalSpent", totalSpent);
        stats.put("readCount", readCount);
        return stats;
    }
}
