package com.boki.application.service;

import com.boki.infrastructure.persistence.entity.BookCoOccurrenceJpaEntity;
import com.boki.infrastructure.persistence.entity.BookJpaEntity;
import com.boki.infrastructure.persistence.repository.BookCoOccurrenceJpaRepository;
import com.boki.infrastructure.persistence.repository.BookJpaRepository;
import com.boki.infrastructure.persistence.repository.OrderItemJpaRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

@Service
public class CoOccurrenceComputationService {

    private static final Logger log = LoggerFactory.getLogger(CoOccurrenceComputationService.class);

    private final OrderItemJpaRepository orderItemRepository;
    private final BookJpaRepository bookRepository;
    private final BookCoOccurrenceJpaRepository coOccurrenceRepository;

    public CoOccurrenceComputationService(
            OrderItemJpaRepository orderItemRepository,
            BookJpaRepository bookRepository,
            BookCoOccurrenceJpaRepository coOccurrenceRepository
    ) {
        this.orderItemRepository = orderItemRepository;
        this.bookRepository = bookRepository;
        this.coOccurrenceRepository = coOccurrenceRepository;
    }

    @Transactional
    public void recomputeCoOccurrences() {
        log.info("[RecommendationEngine] Starting Co-occurrence matrix recomputation...");
        List<Object[]> rawPairs = orderItemRepository.findCoPurchasedPairs();
        if (rawPairs.isEmpty()) {
            log.info("[RecommendationEngine] No order items co-occurrences found.");
            return;
        }

        coOccurrenceRepository.deleteAllInBatch();
        Map<UUID, BookJpaEntity> bookCache = new HashMap<>();
        List<BookCoOccurrenceJpaEntity> batch = new ArrayList<>();

        for (Object[] row : rawPairs) {
            UUID bookAId = (UUID) row[0];
            UUID bookBId = (UUID) row[1];
            long count = ((Number) row[2]).longValue();

            BookJpaEntity bookA = bookCache.computeIfAbsent(bookAId, id -> bookRepository.findById(id).orElse(null));
            BookJpaEntity bookB = bookCache.computeIfAbsent(bookBId, id -> bookRepository.findById(id).orElse(null));

            if (bookA != null && bookB != null) {
                // Calculate simple confidence score: count / (count + 2)
                double confidence = (double) count / (double) (count + 2);
                batch.add(new BookCoOccurrenceJpaEntity(
                        bookA, bookB, (int) count, 0,
                        BigDecimal.valueOf(confidence).setScale(4, RoundingMode.HALF_UP)
                ));
            }

            if (batch.size() >= 500) {
                coOccurrenceRepository.saveAll(batch);
                batch.clear();
            }
        }

        if (!batch.isEmpty()) {
            coOccurrenceRepository.saveAll(batch);
        }
        log.info("[RecommendationEngine] Co-occurrence matrix updated with {} pairs.", rawPairs.size());
    }
}
