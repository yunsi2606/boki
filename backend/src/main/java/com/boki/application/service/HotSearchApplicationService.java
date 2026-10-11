package com.boki.application.service;

import com.boki.infrastructure.persistence.repository.CategoryJpaRepository;
import com.boki.infrastructure.persistence.repository.UserActivityJpaRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
@RequiredArgsConstructor
public class HotSearchApplicationService {

    private static final Logger log = LoggerFactory.getLogger(HotSearchApplicationService.class);
    private static final int TARGET_KEYWORDS_COUNT = 8;
    private static final long CACHE_TTL_MINUTES = 15;

    private static final List<String> CURATED_FALLBACKS = List.of(
            "Manga Shounen",
            "Light Novel",
            "One Piece",
            "Conan",
            "Doraemon",
            "Jujutsu Kaisen",
            "Spy x Family",
            "Truyện Tranh Màu"
    );

    private final UserActivityJpaRepository activityRepository;
    private final CategoryJpaRepository categoryRepository;

    private volatile List<String> cachedHotKeywords = null;
    private volatile Instant cacheExpiresAt = Instant.EPOCH;

    public List<String> getHotKeywords() {
        Instant now = Instant.now();
        if (cachedHotKeywords != null && now.isBefore(cacheExpiresAt)) {
            return cachedHotKeywords;
        }

        synchronized (this) {
            if (cachedHotKeywords != null && now.isBefore(cacheExpiresAt)) {
                return cachedHotKeywords;
            }

            List<String> computed = computeHotKeywords(now);
            this.cachedHotKeywords = computed;
            this.cacheExpiresAt = now.plus(CACHE_TTL_MINUTES, ChronoUnit.MINUTES);
            return computed;
        }
    }

    private List<String> computeHotKeywords(Instant now) {
        Set<String> resultSet = new LinkedHashSet<>();
        Instant oneDayAgo = now.minus(24, ChronoUnit.HOURS);
        Instant sevenDaysAgo = now.minus(7, ChronoUnit.DAYS);

        try {
            List<Object[]> rawHotList = activityRepository.findHotSearchKeywords(
                    oneDayAgo,
                    sevenDaysAgo,
                    PageRequest.of(0, 15)
            );

            for (Object[] row : rawHotList) {
                if (row == null || row.length == 0 || row[0] == null) continue;
                String kw = row[0].toString().trim();
                if (isValidKeyword(kw)) {
                    resultSet.add(capitalizeWords(kw));
                }
                if (resultSet.size() >= TARGET_KEYWORDS_COUNT) break;
            }
        } catch (Exception e) {
            log.warn("Failed to aggregate hot search keywords from activity log: {}", e.getMessage());
        }

        // Cold-start fallback from active categories if fewer than target count
        if (resultSet.size() < TARGET_KEYWORDS_COUNT) {
            try {
                categoryRepository.findAll().stream()
                        .map(c -> c.getName() != null ? c.getName().trim() : "")
                        .filter(this::isValidKeyword)
                        .forEach(catName -> {
                            if (resultSet.size() < TARGET_KEYWORDS_COUNT) {
                                resultSet.add(capitalizeWords(catName));
                            }
                        });
            } catch (Exception e) {
                log.warn("Failed to fetch category fallbacks: {}", e.getMessage());
            }
        }

        // Final curated fallback if database has few categories/logs
        for (String fallback : CURATED_FALLBACKS) {
            if (resultSet.size() >= TARGET_KEYWORDS_COUNT) break;
            resultSet.add(fallback);
        }

        return new ArrayList<>(resultSet);
    }

    private boolean isValidKeyword(String kw) {
        if (kw == null) return false;
        String trimmed = kw.trim();
        return trimmed.length() >= 2 && trimmed.length() <= 40;
    }

    private String capitalizeWords(String input) {
        if (input == null || input.isBlank()) return "";
        String[] words = input.trim().split("\\s+");
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < words.length; i++) {
            String word = words[i];
            if (word.isEmpty()) continue;
            sb.append(Character.toUpperCase(word.charAt(0)));
            if (word.length() > 1) {
                sb.append(word.substring(1).toLowerCase());
            }
            if (i < words.length - 1) {
                sb.append(" ");
            }
        }
        return sb.toString();
    }
}
