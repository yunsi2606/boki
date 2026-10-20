package com.boki.application.service;

import com.boki.application.dto.schedule.ReleaseScheduleEditionRequest;
import com.boki.application.mapper.ReleaseScheduleMapper;
import com.boki.domain.model.schedule.ReleaseEditionType;
import com.boki.domain.model.schedule.ReleaseScheduleStatus;
import com.boki.infrastructure.persistence.entity.ReleaseScheduleEditionJpaEntity;
import com.boki.infrastructure.persistence.entity.ReleaseScheduleJpaEntity;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class ScheduleEditionSyncService {

    private final ReleaseScheduleMapper releaseScheduleMapper;

    public void syncEditions(ReleaseScheduleJpaEntity schedule, List<ReleaseScheduleEditionRequest> requests) {
        if (requests == null) return;
        if (schedule.getEditions() == null) {
            schedule.setEditions(new ArrayList<>());
        }

        Map<UUID, ReleaseScheduleEditionJpaEntity> existingById = new HashMap<>();
        Map<String, ReleaseScheduleEditionJpaEntity> existingByNameType = new HashMap<>();

        for (ReleaseScheduleEditionJpaEntity ed : schedule.getEditions()) {
            if (ed.getId() != null) {
                existingById.put(ed.getId(), ed);
            }
            String key = buildEditionKey(ed.getEditionName(), ed.getEditionType());
            existingByNameType.putIfAbsent(key, ed);
        }

        List<ReleaseScheduleEditionJpaEntity> retained = new ArrayList<>();
        Set<UUID> matchedIds = new HashSet<>();

        for (int i = 0; i < requests.size(); i++) {
            ReleaseScheduleEditionRequest req = requests.get(i);
            ReleaseScheduleEditionJpaEntity target = null;

            if (req.getId() != null && existingById.containsKey(req.getId())) {
                target = existingById.get(req.getId());
            } else {
                String key = buildEditionKey(req.getEditionName(), req.getEditionType());
                if (existingByNameType.containsKey(key)) {
                    ReleaseScheduleEditionJpaEntity candidate = existingByNameType.get(key);
                    if (!matchedIds.contains(candidate.getId())) {
                        target = candidate;
                    }
                }
            }

            if (target != null) {
                matchedIds.add(target.getId());
                updateEditionInPlace(target, req, i);
                retained.add(target);
            } else {
                ReleaseScheduleEditionJpaEntity newEd = releaseScheduleMapper.toEditionEntity(req, schedule, i);
                retained.add(newEd);
            }
        }

        // Detach removed elements so Hibernate orphanRemoval cascades cleanly
        Iterator<ReleaseScheduleEditionJpaEntity> it = schedule.getEditions().iterator();
        while (it.hasNext()) {
            ReleaseScheduleEditionJpaEntity ed = it.next();
            if (ed.getId() != null && !matchedIds.contains(ed.getId())) {
                ed.setSchedule(null);
                it.remove();
            }
        }

        // Retain exactly synced items
        schedule.getEditions().clear();
        schedule.getEditions().addAll(retained);
    }

    public boolean deduplicateEditions(ReleaseScheduleJpaEntity schedule) {
        if (schedule.getEditions() == null || schedule.getEditions().size() <= 1) return false;

        Map<String, ReleaseScheduleEditionJpaEntity> uniqueMap = new LinkedHashMap<>();
        List<ReleaseScheduleEditionJpaEntity> toRemove = new ArrayList<>();

        for (ReleaseScheduleEditionJpaEntity ed : schedule.getEditions()) {
            String key = buildEditionKey(ed.getEditionName(), ed.getEditionType());
            if (!uniqueMap.containsKey(key)) {
                uniqueMap.put(key, ed);
            } else {
                // If collision, prefer one with linked book or earlier created
                ReleaseScheduleEditionJpaEntity existing = uniqueMap.get(key);
                if (existing.getBookId() == null && ed.getBookId() != null) {
                    toRemove.add(existing);
                    uniqueMap.put(key, ed);
                } else {
                    toRemove.add(ed);
                }
            }
        }

        if (toRemove.isEmpty()) return false;

        for (ReleaseScheduleEditionJpaEntity ed : toRemove) {
            ed.setSchedule(null);
            schedule.getEditions().remove(ed);
        }
        log.info("Deduplicated {} duplicate editions from schedule id={}", toRemove.size(), schedule.getId());
        return true;
    }

    private void updateEditionInPlace(ReleaseScheduleEditionJpaEntity target, ReleaseScheduleEditionRequest req, int sortOrder) {
        target.setEditionName(req.getEditionName().trim());
        target.setEditionType(req.getEditionType() != null ? req.getEditionType() : ReleaseEditionType.STANDARD);
        target.setReleaseDate(req.getReleaseDate());
        target.setPreOrderDate(req.getPreOrderDate());
        target.setEstimatedPrice(req.getEstimatedPrice());
        target.setGifts(req.getGifts() != null ? req.getGifts().trim() : null);
        target.setCoverUrl(req.getCoverUrl() != null ? req.getCoverUrl().trim() : null);
        target.setStatus(req.getStatus() != null ? req.getStatus() : ReleaseScheduleStatus.SCHEDULED);
        target.setBookId(req.getBookId());
        target.setSortOrder(req.getSortOrder() != null ? req.getSortOrder() : sortOrder);
        target.setUpdatedAt(OffsetDateTime.now());
    }

    private String buildEditionKey(String name, ReleaseEditionType type) {
        String cleanName = name != null ? name.trim().toLowerCase() : "";
        ReleaseEditionType cleanType = type != null ? type : ReleaseEditionType.STANDARD;
        return cleanName + "_" + cleanType.name();
    }
}
