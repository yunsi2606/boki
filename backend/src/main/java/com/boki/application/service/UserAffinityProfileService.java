package com.boki.application.service;

import com.boki.infrastructure.persistence.entity.BookJpaEntity;
import com.boki.infrastructure.persistence.entity.UserActivityJpaEntity;
import com.boki.infrastructure.persistence.repository.BookJpaRepository;
import com.boki.infrastructure.persistence.repository.UserActivityJpaRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class UserAffinityProfileService {

    private final UserActivityJpaRepository activityRepository;
    private final BookJpaRepository bookRepository;

    public UserAffinityProfileService(
            UserActivityJpaRepository activityRepository,
            BookJpaRepository bookRepository
    ) {
        this.activityRepository = activityRepository;
        this.bookRepository = bookRepository;
    }

    public UserAffinity getUserAffinity(UUID userId, String sessionId) {
        List<UserActivityJpaEntity> activities = Collections.emptyList();

        if (userId != null) {
            activities = activityRepository.findByUserIdOrderByCreatedAtDesc(userId, PageRequest.of(0, 50));
        } else if (sessionId != null && !sessionId.isBlank()) {
            activities = activityRepository.findBySessionIdOrderByCreatedAtDesc(sessionId, PageRequest.of(0, 50));
        }

        Map<Integer, Double> categoryScores = new HashMap<>();
        Map<String, Double> authorScores = new HashMap<>();
        List<UUID> recentBookIds = new ArrayList<>();
        Set<UUID> seenBooks = new HashSet<>();

        for (UserActivityJpaEntity act : activities) {
            if (act.getTargetId() == null || act.getTargetId().isBlank()) continue;
            UUID bookId;
            try {
                bookId = UUID.fromString(act.getTargetId());
            } catch (IllegalArgumentException e) {
                continue;
            }

            if (!seenBooks.contains(bookId)) {
                seenBooks.add(bookId);
                recentBookIds.add(bookId);
            }

            double weight = switch (act.getEventType()) {
                case "ADD_TO_CART" -> 3.0;
                case "ORDER_PLACED" -> 5.0;
                case "VIEW_BOOK" -> 1.0;
                default -> 0.5;
            };

            BookJpaEntity book = bookRepository.findById(bookId).orElse(null);
            if (book != null) {
                if (book.getCategoryId() != null) {
                    categoryScores.merge(book.getCategoryId(), weight, Double::sum);
                }
                if (book.getAuthor() != null && !book.getAuthor().isBlank()) {
                    authorScores.merge(book.getAuthor().trim().toLowerCase(), weight, Double::sum);
                }
            }
        }

        return new UserAffinity(categoryScores, authorScores, recentBookIds);
    }

    public record UserAffinity(
            Map<Integer, Double> categoryScores,
            Map<String, Double> authorScores,
            List<UUID> recentBookIds
    ) {
        public boolean isEmpty() {
            return categoryScores.isEmpty() && authorScores.isEmpty();
        }
    }
}
