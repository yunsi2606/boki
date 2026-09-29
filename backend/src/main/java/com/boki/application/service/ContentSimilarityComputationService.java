package com.boki.application.service;

import com.boki.infrastructure.persistence.entity.BookJpaEntity;
import com.boki.infrastructure.persistence.entity.BookSimilarityJpaEntity;
import com.boki.infrastructure.persistence.repository.BookJpaRepository;
import com.boki.infrastructure.persistence.repository.BookSimilarityJpaRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

@Service
public class ContentSimilarityComputationService {

    private static final Logger log = LoggerFactory.getLogger(ContentSimilarityComputationService.class);
    private final BookJpaRepository bookRepository;
    private final BookSimilarityJpaRepository similarityRepository;

    public ContentSimilarityComputationService(
            BookJpaRepository bookRepository,
            BookSimilarityJpaRepository similarityRepository
    ) {
        this.bookRepository = bookRepository;
        this.similarityRepository = similarityRepository;
    }

    @Transactional
    public void recomputeContentSimilarities() {
        log.info("[RecommendationEngine] Starting Content Similarity recomputation...");
        List<BookJpaEntity> activeBooks = bookRepository.findAll();
        if (activeBooks.isEmpty()) return;

        similarityRepository.deleteAllInBatch();
        List<BookSimilarityJpaEntity> batch = new ArrayList<>();

        for (BookJpaEntity source : activeBooks) {
            List<ScoredTarget> scoredTargets = new ArrayList<>();
            for (BookJpaEntity target : activeBooks) {
                if (source.getId().equals(target.getId())) continue;
                double score = computeSimilarityScore(source, target);
                if (score >= 0.25) {
                    scoredTargets.add(new ScoredTarget(target, score, determineReason(source, target)));
                }
            }

            scoredTargets.sort((a, b) -> Double.compare(b.score, a.score));
            int limit = Math.min(12, scoredTargets.size());
            for (int i = 0; i < limit; i++) {
                ScoredTarget st = scoredTargets.get(i);
                batch.add(new BookSimilarityJpaEntity(
                        source, st.target,
                        BigDecimal.valueOf(st.score).setScale(4, RoundingMode.HALF_UP),
                        st.reason.code, st.reason.label
                ));
            }

            if (batch.size() >= 500) {
                similarityRepository.saveAll(batch);
                batch.clear();
            }
        }

        if (!batch.isEmpty()) {
            similarityRepository.saveAll(batch);
        }
        log.info("[RecommendationEngine] Content Similarity matrix updated successfully.");
    }

    private double computeSimilarityScore(BookJpaEntity a, BookJpaEntity b) {
        double score = 0.0;
        // Same category (highest weight: 0.40)
        if (a.getCategoryId() != null && a.getCategoryId().equals(b.getCategoryId())) {
            score += 0.40;
        }
        // Same author (weight: 0.35)
        if (a.getAuthor() != null && b.getAuthor() != null &&
            a.getAuthor().trim().equalsIgnoreCase(b.getAuthor().trim())) {
            score += 0.35;
        }
        // Price bracket similarity (weight: 0.15)
        if (a.getPrice() != null && b.getPrice() != null && a.getPrice().compareTo(BigDecimal.ZERO) > 0) {
            double ratio = b.getPrice().doubleValue() / a.getPrice().doubleValue();
            if (ratio >= 0.7 && ratio <= 1.3) {
                score += 0.15;
            }
        }
        // Title token overlap (weight: 0.10)
        Set<String> wordsA = extractTokens(a.getTitle());
        Set<String> wordsB = extractTokens(b.getTitle());
        if (!wordsA.isEmpty() && !wordsB.isEmpty()) {
            Set<String> intersection = new HashSet<>(wordsA);
            intersection.retainAll(wordsB);
            if (!intersection.isEmpty()) {
                score += 0.10 * Math.min(1.0, (double) intersection.size() / 2.0);
            }
        }
        return score;
    }

    private Reason determineReason(BookJpaEntity a, BookJpaEntity b) {
        if (a.getAuthor() != null && b.getAuthor() != null &&
            a.getAuthor().trim().equalsIgnoreCase(b.getAuthor().trim())) {
            return new Reason("SAME_AUTHOR", "Cùng tác giả " + a.getAuthor().trim());
        }
        if (a.getCategoryId() != null && a.getCategoryId().equals(b.getCategoryId())) {
            return new Reason("SAME_CATEGORY", "Cùng thể loại");
        }
        return new Reason("SIMILAR_CONTENT", "Độc giả cũng quan tâm");
    }

    private Set<String> extractTokens(String text) {
        if (text == null) return Collections.emptySet();
        Set<String> tokens = new HashSet<>();
        String[] parts = text.toLowerCase().split("[^\\p{L}\\p{Nd}]+");
        for (String p : parts) {
            if (p.length() >= 3) tokens.add(p);
        }
        return tokens;
    }

    private record ScoredTarget(BookJpaEntity target, double score, Reason reason) {}
    private record Reason(String code, String label) {}
}
