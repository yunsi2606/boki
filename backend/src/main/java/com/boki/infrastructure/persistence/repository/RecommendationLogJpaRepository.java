package com.boki.infrastructure.persistence.repository;

import com.boki.infrastructure.persistence.entity.RecommendationLogJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RecommendationLogJpaRepository extends JpaRepository<RecommendationLogJpaEntity, UUID> {

    Optional<RecommendationLogJpaEntity> findTopBySessionIdAndBookIdOrderByCreatedAtDesc(String sessionId, UUID bookId);

    @Query("SELECT r.widgetType, COUNT(r), " +
           "SUM(CASE WHEN r.clicked = true THEN 1 ELSE 0 END), " +
           "SUM(CASE WHEN r.convertedToCart = true THEN 1 ELSE 0 END), " +
           "SUM(CASE WHEN r.convertedToOrder = true THEN 1 ELSE 0 END) " +
           "FROM RecommendationLogJpaEntity r " +
           "WHERE r.createdAt >= :since " +
           "GROUP BY r.widgetType")
    List<Object[]> getMetricsGroupedByWidget(@Param("since") Instant since);
}
