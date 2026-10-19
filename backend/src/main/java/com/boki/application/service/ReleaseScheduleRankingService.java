package com.boki.application.service;

import com.boki.application.dto.schedule.ReleaseScheduleDto;
import com.boki.infrastructure.persistence.entity.ReleaseScheduleJpaEntity;
import com.boki.application.mapper.ReleaseScheduleMapper;
import com.boki.infrastructure.persistence.repository.ReleaseScheduleJpaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReleaseScheduleRankingService {

    private final ReleaseScheduleJpaRepository scheduleRepository;
    private final ReleaseScheduleMapper scheduleMapper;

    @Transactional(readOnly = true)
    public List<ReleaseScheduleDto> getFeaturedSchedules(String mode, Integer limit) {
        int max = (limit != null && limit > 0 && limit <= 50) ? limit : 15;
        String activeMode = mode != null ? mode.toUpperCase().trim() : "SMART";

        List<ReleaseScheduleJpaEntity> allWithEditions = scheduleRepository.findAllWithEditions();
        if (allWithEditions.isEmpty()) {
            return List.of();
        }

        LocalDate today = LocalDate.now();

        List<ReleaseScheduleJpaEntity> selected;
        switch (activeMode) {
            case "UPCOMING":
                selected = getUpcomingReleases(allWithEditions, today, max);
                break;
            case "RECENTLY_ADDED":
                selected = getRecentlyAdded(allWithEditions, max);
                break;
            case "SPECIAL":
                selected = getSpecialEditions(allWithEditions, today, max);
                break;
            case "SMART":
            default:
                selected = getSmartRankedReleases(allWithEditions, today, max);
                break;
        }

        return selected.stream()
                .map(scheduleMapper::toDto)
                .collect(Collectors.toList());
    }

    private List<ReleaseScheduleJpaEntity> getUpcomingReleases(
            List<ReleaseScheduleJpaEntity> all, LocalDate today, int limit) {
        return all.stream()
                .filter(s -> s.getReleaseDate() != null && !s.getReleaseDate().isBefore(today))
                .sorted(Comparator.comparing(ReleaseScheduleJpaEntity::getReleaseDate)
                        .thenComparing(s -> -s.getViewsCount()))
                .limit(limit)
                .collect(Collectors.toList());
    }

    private List<ReleaseScheduleJpaEntity> getRecentlyAdded(
            List<ReleaseScheduleJpaEntity> all, int limit) {
        return all.stream()
                .sorted((a, b) -> {
                    var timeA = a.getUpdatedAt() != null ? a.getUpdatedAt() : a.getCreatedAt();
                    var timeB = b.getUpdatedAt() != null ? b.getUpdatedAt() : b.getCreatedAt();
                    if (timeA == null && timeB == null) return 0;
                    if (timeA == null) return 1;
                    if (timeB == null) return -1;
                    return timeB.compareTo(timeA);
                })
                .limit(limit)
                .collect(Collectors.toList());
    }

    private List<ReleaseScheduleJpaEntity> getSpecialEditions(
            List<ReleaseScheduleJpaEntity> all, LocalDate today, int limit) {
        return all.stream()
                .filter(s -> s.getEditions() != null && s.getEditions().stream().anyMatch(e ->
                        e.getEditionType() != null &&
                        List.of("SPECIAL", "LIMITED", "BOXSET").contains(e.getEditionType().name())))
                .sorted((a, b) -> {
                    boolean aUpcoming = a.getReleaseDate() != null && !a.getReleaseDate().isBefore(today);
                    boolean bUpcoming = b.getReleaseDate() != null && !b.getReleaseDate().isBefore(today);
                    if (aUpcoming != bUpcoming) return aUpcoming ? -1 : 1;
                    if (a.getReleaseDate() != null && b.getReleaseDate() != null) {
                        return a.getReleaseDate().compareTo(b.getReleaseDate());
                    }
                    return 0;
                })
                .limit(limit)
                .collect(Collectors.toList());
    }

    private List<ReleaseScheduleJpaEntity> getSmartRankedReleases(
            List<ReleaseScheduleJpaEntity> all, LocalDate today, int limit) {
        List<ScoredSchedule> scoredList = new ArrayList<>();

        for (ReleaseScheduleJpaEntity item : all) {
            int score = 0;

            if (item.getReleaseDate() != null) {
                long days = ChronoUnit.DAYS.between(today, item.getReleaseDate());
                if (days >= 0 && days <= 7) {
                    score += 120 - (int) (days * 5);
                } else if (days > 7 && days <= 14) {
                    score += 85;
                } else if (days > 14 && days <= 30) {
                    score += 55;
                } else if (days < 0 && days >= -7) {
                    score += 65;
                } else if (days < -7 && days >= -14) {
                    score += 25;
                } else {
                    score -= 50;
                }
            }

            var updateTime = item.getUpdatedAt() != null ? item.getUpdatedAt() : item.getCreatedAt();
            if (updateTime != null) {
                long hours = ChronoUnit.HOURS.between(updateTime, java.time.OffsetDateTime.now());
                if (hours >= 0 && hours <= 24) {
                    score += 50;
                } else if (hours <= 72) {
                    score += 30;
                } else if (hours <= 168) {
                    score += 15;
                }
            }

            if (item.getEditions() != null) {
                boolean hasSpecial = item.getEditions().stream().anyMatch(e ->
                        e.getEditionType() != null &&
                        List.of("SPECIAL", "LIMITED", "BOXSET").contains(e.getEditionType().name()));
                if (hasSpecial) score += 20;

                boolean hasBook = item.getEditions().stream().anyMatch(e ->
                        e.getBookId() != null || e.getBook() != null);
                if (hasBook) score += 15;
            }

            if (item.getLikesCount() > 0) {
                score += Math.min(item.getLikesCount() / 20, 15);
            }

            scoredList.add(new ScoredSchedule(item, score));
        }

        scoredList.sort((a, b) -> Integer.compare(b.score, a.score));

        List<ReleaseScheduleJpaEntity> ranked = new ArrayList<>();
        List<ScoredSchedule> pool = new ArrayList<>(scoredList);
        Map<String, Integer> pubCountMap = new HashMap<>();

        while (!pool.isEmpty() && ranked.size() < limit) {
            int chosenIdx = 0;
            for (int i = 0; i < Math.min(pool.size(), 6); i++) {
                String pub = pool.get(i).entity.getPublisher() != null ? pool.get(i).entity.getPublisher() : "Unknown";
                int recent = pubCountMap.getOrDefault(pub, 0);
                if (recent < 2) {
                    chosenIdx = i;
                    break;
                }
            }

            ReleaseScheduleJpaEntity chosen = pool.remove(chosenIdx).entity;
            ranked.add(chosen);

            String pub = chosen.getPublisher() != null ? chosen.getPublisher() : "Unknown";
            pubCountMap.put(pub, pubCountMap.getOrDefault(pub, 0) + 1);
            for (String p : pubCountMap.keySet()) {
                if (!p.equals(pub)) {
                    pubCountMap.put(p, Math.max(0, pubCountMap.get(p) - 1));
                }
            }
        }

        return ranked;
    }

    private record ScoredSchedule(ReleaseScheduleJpaEntity entity, int score) {}
}
