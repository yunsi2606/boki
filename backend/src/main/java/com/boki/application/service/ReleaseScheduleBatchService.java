package com.boki.application.service;

import com.boki.application.dto.schedule.*;
import com.boki.domain.model.schedule.ReleaseEditionType;
import com.boki.infrastructure.persistence.entity.ReleaseScheduleEditionJpaEntity;
import com.boki.infrastructure.persistence.entity.ReleaseScheduleJpaEntity;
import com.boki.application.mapper.ReleaseScheduleMapper;
import com.boki.infrastructure.persistence.repository.ReleaseScheduleJpaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReleaseScheduleBatchService {

    private final ReleaseScheduleJpaRepository scheduleRepository;
    private final ReleaseScheduleMapper scheduleMapper;
    private final ReleaseScheduleSyncService syncService;

    @Transactional
    public List<ReleaseScheduleDto> batchCreateSchedules(BatchCreateScheduleRequest request) {
        if (request == null || request.getItems() == null || request.getItems().isEmpty()) {
            return List.of();
        }

        // 1. Group items in the batch by computed slug to prevent internal duplicate collision
        Map<String, List<CreateReleaseScheduleRequest>> groupedBySlug = new LinkedHashMap<>();
        for (CreateReleaseScheduleRequest item : request.getItems()) {
            String slug = syncService.computeScheduleSlug(item.getTitle());
            groupedBySlug.computeIfAbsent(slug, k -> new ArrayList<>()).add(item);
        }

        List<ReleaseScheduleDto> results = new ArrayList<>();

        for (Map.Entry<String, List<CreateReleaseScheduleRequest>> entry : groupedBySlug.entrySet()) {
            String slug = entry.getKey();
            List<CreateReleaseScheduleRequest> itemsForSlug = entry.getValue();
            CreateReleaseScheduleRequest primary = itemsForSlug.get(0);

            // Check if already exists in DB
            Optional<ReleaseScheduleJpaEntity> existingOpt = scheduleRepository.findBySlugWithEditions(slug);
            if (existingOpt.isPresent()) {
                ReleaseScheduleJpaEntity existing = existingOpt.get();
                mergeEditionsIntoSchedule(existing, itemsForSlug);
                existing.setUpdatedAt(OffsetDateTime.now());
                scheduleRepository.save(existing);
                results.add(scheduleMapper.toDto(existing));
                log.info("Batch merged into existing schedule id={}, slug={}", existing.getId(), slug);
            } else {
                ReleaseScheduleJpaEntity newSchedule = ReleaseScheduleJpaEntity.builder()
                        .title(primary.getTitle().trim())
                        .originalTitle(primary.getOriginalTitle() != null ? primary.getOriginalTitle().trim() : null)
                        .publisher(primary.getPublisher().trim())
                        .author(primary.getAuthor() != null ? primary.getAuthor().trim() : null)
                        .artist(primary.getArtist() != null ? primary.getArtist().trim() : null)
                        .imprint(primary.getImprint() != null ? primary.getImprint().trim() : null)
                        .genres(primary.getGenres() != null ? primary.getGenres().trim() : null)
                        .format(primary.getFormat() != null ? primary.getFormat().trim() : "MANGA")
                        .seriesStatus(primary.getSeriesStatus() != null ? primary.getSeriesStatus().trim() : "ONGOING")
                        .ageRating(primary.getAgeRating() != null ? primary.getAgeRating().trim() : "13+")
                        .specs(primary.getSpecs() != null ? primary.getSpecs().trim() : null)
                        .releaseDate(primary.getReleaseDate())
                        .preOrderDate(primary.getPreOrderDate())
                        .coverUrl(primary.getCoverUrl() != null && !primary.getCoverUrl().isBlank() ? primary.getCoverUrl().trim() : null)
                        .description(primary.getDescription())
                        .status(primary.getStatus() != null ? primary.getStatus() : com.boki.domain.model.schedule.ReleaseScheduleStatus.SCHEDULED)
                        .createdAt(OffsetDateTime.now())
                        .updatedAt(OffsetDateTime.now())
                        .build();
                syncService.normalizeScheduleFields(newSchedule);

                List<ReleaseScheduleEditionJpaEntity> editions = new ArrayList<>();
                int sortOrder = 0;
                Set<String> seenEditionKeys = new HashSet<>();

                for (CreateReleaseScheduleRequest reqItem : itemsForSlug) {
                    if (reqItem.getEditions() != null && !reqItem.getEditions().isEmpty()) {
                        for (ReleaseScheduleEditionRequest edReq : reqItem.getEditions()) {
                            String key = (edReq.getEditionName() != null ? edReq.getEditionName().trim().toLowerCase() : "")
                                    + "_" + edReq.getEditionType();
                            if (seenEditionKeys.add(key)) {
                                editions.add(scheduleMapper.toEditionEntity(edReq, newSchedule, sortOrder++));
                            }
                        }
                    } else {
                        String key = "bản phổ thông_STANDARD";
                        if (seenEditionKeys.add(key)) {
                            editions.add(ReleaseScheduleEditionJpaEntity.builder()
                                    .schedule(newSchedule)
                                    .editionName("Bản Phổ Thông")
                                    .editionType(ReleaseEditionType.STANDARD)
                                    .coverUrl(newSchedule.getCoverUrl())
                                    .sortOrder(sortOrder++)
                                    .build());
                        }
                    }
                }

                newSchedule.setEditions(editions);
                ReleaseScheduleJpaEntity saved = scheduleRepository.save(newSchedule);
                results.add(scheduleMapper.toDto(saved));
                log.info("Batch created schedule id={}, slug={}, total editions={}", saved.getId(), slug, editions.size());
            }
        }

        return results;
    }

    private void mergeEditionsIntoSchedule(ReleaseScheduleJpaEntity existing, List<CreateReleaseScheduleRequest> newItems) {
        if (existing.getEditions() == null) {
            existing.setEditions(new ArrayList<>());
        }
        Set<String> existingKeys = new HashSet<>();
        for (ReleaseScheduleEditionJpaEntity ed : existing.getEditions()) {
            existingKeys.add((ed.getEditionName() != null ? ed.getEditionName().trim().toLowerCase() : "")
                    + "_" + ed.getEditionType());
        }

        int currentSortOrder = existing.getEditions().size();
        for (CreateReleaseScheduleRequest reqItem : newItems) {
            if (reqItem.getEditions() != null) {
                for (ReleaseScheduleEditionRequest edReq : reqItem.getEditions()) {
                    String key = (edReq.getEditionName() != null ? edReq.getEditionName().trim().toLowerCase() : "")
                            + "_" + edReq.getEditionType();
                    if (!existingKeys.contains(key)) {
                        existing.getEditions().add(scheduleMapper.toEditionEntity(edReq, existing, currentSortOrder++));
                        existingKeys.add(key);
                    }
                }
            }
            if ((existing.getCoverUrl() == null || existing.getCoverUrl().isBlank()) && reqItem.getCoverUrl() != null) {
                existing.setCoverUrl(reqItem.getCoverUrl().trim());
            }
            if ((existing.getAuthor() == null || existing.getAuthor().isBlank()) && reqItem.getAuthor() != null) {
                existing.setAuthor(reqItem.getAuthor().trim());
            }
        }
    }

    @Transactional(readOnly = true)
    public Map<String, Object> checkDuplicate(String title) {
        String slug = syncService.computeScheduleSlug(title);
        Optional<ReleaseScheduleJpaEntity> existing = scheduleRepository.findBySlugWithEditions(slug);
        Map<String, Object> res = new HashMap<>();
        res.put("slug", slug);
        res.put("exists", existing.isPresent());
        if (existing.isPresent()) {
            res.put("existingId", existing.get().getId());
            res.put("existingTitle", existing.get().getTitle());
            res.put("releaseDate", existing.get().getReleaseDate());
            res.put("editionsCount", existing.get().getEditions() != null ? existing.get().getEditions().size() : 0);
        }
        return res;
    }
}
