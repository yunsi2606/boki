package com.boki.infrastructure.persistence.repository;

import com.boki.infrastructure.persistence.entity.UserActivityJpaEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Repository
public interface UserActivityJpaRepository extends JpaRepository<UserActivityJpaEntity, UUID> {

    @Query("SELECT a FROM UserActivityJpaEntity a WHERE " +
            "(:eventType IS NULL OR a.eventType = :eventType) AND " +
            "(:eventCategory IS NULL OR a.eventCategory = :eventCategory) AND " +
            "(:sessionId IS NULL OR a.sessionId = :sessionId) AND " +
            "(:userId IS NULL OR a.userId = :userId) AND " +
            "(:search IS NULL OR LOWER(a.pagePath) LIKE LOWER(CONCAT('%', :search, '%')) " +
            "   OR LOWER(a.targetName) LIKE LOWER(CONCAT('%', :search, '%')) " +
            "   OR LOWER(a.userEmail) LIKE LOWER(CONCAT('%', :search, '%')) " +
            "   OR LOWER(a.ipAddress) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
            "(:fromTime IS NULL OR a.createdAt >= :fromTime) AND " +
            "(:toTime IS NULL OR a.createdAt <= :toTime) " +
            "ORDER BY a.createdAt DESC")
    Page<UserActivityJpaEntity> searchActivities(
            @Param("eventType") String eventType,
            @Param("eventCategory") String eventCategory,
            @Param("sessionId") String sessionId,
            @Param("userId") UUID userId,
            @Param("search") String search,
            @Param("fromTime") Instant fromTime,
            @Param("toTime") Instant toTime,
            Pageable pageable
    );

    List<UserActivityJpaEntity> findBySessionIdOrderByCreatedAtAsc(String sessionId);

    @Query("SELECT COUNT(DISTINCT a.sessionId) FROM UserActivityJpaEntity a WHERE a.createdAt >= :since")
    long countActiveSessionsSince(@Param("since") Instant since);

    long countByCreatedAtAfter(Instant since);

    long countByEventTypeAndCreatedAtAfter(String eventType, Instant since);

    @Query("SELECT a.targetName, COUNT(a) as cnt FROM UserActivityJpaEntity a WHERE a.eventType = 'SEARCH' AND a.targetName IS NOT NULL AND a.targetName <> '' GROUP BY a.targetName ORDER BY cnt DESC")
    List<Object[]> findTopSearchKeywords(Pageable pageable);

    @Query("SELECT a.targetName, COUNT(a) as cnt FROM UserActivityJpaEntity a WHERE a.eventType = 'VIEW_BOOK' AND a.targetName IS NOT NULL GROUP BY a.targetName ORDER BY cnt DESC")
    List<Object[]> findTopViewedBooks(Pageable pageable);

    @Query("SELECT a.deviceType, COUNT(a) FROM UserActivityJpaEntity a WHERE a.createdAt >= :since GROUP BY a.deviceType")
    List<Object[]> countByDeviceTypeSince(@Param("since") Instant since);
}
