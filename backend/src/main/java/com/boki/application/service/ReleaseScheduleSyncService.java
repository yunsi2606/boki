package com.boki.application.service;

import com.boki.infrastructure.persistence.entity.ReleaseScheduleEditionJpaEntity;
import com.boki.infrastructure.persistence.entity.ReleaseScheduleJpaEntity;
import com.boki.infrastructure.persistence.repository.ReleaseScheduleJpaRepository;
import com.boki.infrastructure.util.SlugUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReleaseScheduleSyncService {

    private final ReleaseScheduleJpaRepository releaseScheduleRepo;

    private static final Pattern VOLUME_PATTERN = Pattern.compile(
            "^(.*?)(?:\\s*-\\s*|\\s+|\\s*[\\(\\[])(?:tập|vol\\.?|volume|quyển)\\s*(\\d+).*$",
            Pattern.CASE_INSENSITIVE
    );

    public void normalizeScheduleFields(ReleaseScheduleJpaEntity s) {
        String title = s.getTitle();
        if (title == null || title.isBlank()) return;

        Matcher matcher = VOLUME_PATTERN.matcher(title.trim());
        if (matcher.find()) {
            String seriesName = matcher.group(1).trim();
            int volumeNumber = Integer.parseInt(matcher.group(2));
            String seriesSlug = SlugUtils.slugify(seriesName);
            String slug = seriesSlug + "-tap-" + volumeNumber;

            s.setSeriesName(seriesName);
            s.setSeriesSlug(seriesSlug);
            s.setVolumeNumber(volumeNumber);
            s.setSlug(slug);
        } else {
            String seriesName = title.contains(" - ") ? title.split(" - ")[0].trim() : title.trim();
            String seriesSlug = SlugUtils.slugify(seriesName);
            s.setSeriesName(seriesName);
            s.setSeriesSlug(seriesSlug);
            if (s.getSlug() == null || s.getSlug().isBlank() || s.getSlug().startsWith("tap-")) {
                s.setSlug(SlugUtils.slugify(title));
            }
        }
    }

    @Transactional
    public Map<String, Object> syncAndNormalizeSeries() {
        List<ReleaseScheduleJpaEntity> all = releaseScheduleRepo.findAllWithEditions();
        int updatedCount = 0;

        for (ReleaseScheduleJpaEntity s : all) {
            String title = s.getTitle();
            if (title == null || title.isBlank()) continue;

            normalizeScheduleFields(s);

            // Ensure editions exist
            if (s.getEditions() == null || s.getEditions().isEmpty()) {
                ReleaseScheduleEditionJpaEntity defaultEdition = ReleaseScheduleEditionJpaEntity.builder()
                        .schedule(s)
                        .editionName("Bản Phổ Thông")
                        .editionType(com.boki.domain.model.schedule.ReleaseEditionType.STANDARD)
                        .releaseDate(s.getReleaseDate())
                        .coverUrl(s.getCoverUrl())
                        .status(s.getStatus())
                        .sortOrder(0)
                        .build();
                if (s.getEditions() == null) {
                    s.setEditions(new ArrayList<>());
                }
                s.getEditions().add(defaultEdition);
            }

            releaseScheduleRepo.save(s);
            updatedCount++;
        }

        Map<String, Object> result = new HashMap<>();
        result.put("status", "SUCCESS");
        result.put("totalSynced", updatedCount);
        result.put("message", "Đã chuẩn hóa và đồng bộ " + updatedCount + " tập truyện theo Series thành công.");
        log.info("[ReleaseScheduleSyncService] Synced and normalized {} release schedules into series.", updatedCount);
        return result;
    }
}
