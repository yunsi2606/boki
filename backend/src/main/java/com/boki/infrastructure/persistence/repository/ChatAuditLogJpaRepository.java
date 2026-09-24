package com.boki.infrastructure.persistence.repository;

import com.boki.infrastructure.persistence.entity.ChatAuditLogJpaEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

@Repository
public interface ChatAuditLogJpaRepository extends JpaRepository<ChatAuditLogJpaEntity, Long> {

    List<ChatAuditLogJpaEntity> findBySessionIdOrderByCreatedAtAsc(String sessionId);

    long countByCreatedAtAfter(Instant after);

    long countByFallbackTrueAndCreatedAtAfter(Instant after);

    @Query("SELECT AVG(c.latencyMs) FROM ChatAuditLogJpaEntity c WHERE c.createdAt >= :after")
    Double getAverageLatencySince(@Param("after") Instant after);

    Page<ChatAuditLogJpaEntity> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
