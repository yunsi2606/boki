package com.boki.infrastructure.scheduler;

import com.boki.application.service.CoOccurrenceComputationService;
import com.boki.application.service.ContentSimilarityComputationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class RecommendationRecomputeScheduler {

    private static final Logger log = LoggerFactory.getLogger(RecommendationRecomputeScheduler.class);

    private final ContentSimilarityComputationService similarityService;
    private final CoOccurrenceComputationService coOccurrenceService;

    public RecommendationRecomputeScheduler(
            ContentSimilarityComputationService similarityService,
            CoOccurrenceComputationService coOccurrenceService
    ) {
        this.similarityService = similarityService;
        this.coOccurrenceService = coOccurrenceService;
    }

    @Scheduled(cron = "0 0 3 * * ?")
    public void scheduledRecompute() {
        log.info("[RecommendationScheduler] Triggering scheduled daily recomputation...");
        recomputeAll();
    }

    public void recomputeAll() {
        try {
            similarityService.recomputeContentSimilarities();
            coOccurrenceService.recomputeCoOccurrences();
            log.info("[RecommendationScheduler] All recommendation models recomputed successfully.");
        } catch (Exception e) {
            log.error("[RecommendationScheduler] Error during recommendation recomputation:", e);
        }
    }
}
