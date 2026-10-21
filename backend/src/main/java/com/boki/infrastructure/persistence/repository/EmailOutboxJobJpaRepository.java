package com.boki.infrastructure.persistence.repository;

import com.boki.infrastructure.persistence.entity.EmailOutboxJobJpaEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface EmailOutboxJobJpaRepository extends JpaRepository<EmailOutboxJobJpaEntity, UUID> {

    @Query("SELECT j FROM EmailOutboxJobJpaEntity j " +
           "WHERE j.status = 'PENDING' AND j.scheduledAt <= :now " +
           "ORDER BY j.scheduledAt ASC")
    List<EmailOutboxJobJpaEntity> findPendingJobs(@Param("now") OffsetDateTime now, Pageable pageable);

    Optional<EmailOutboxJobJpaEntity> findByIdempotencyKey(String idempotencyKey);

    @Query("SELECT j FROM EmailOutboxJobJpaEntity j " +
           "WHERE (:status IS NULL OR j.status = :status) " +
           "AND (:emailType IS NULL OR j.emailType = :emailType) " +
           "ORDER BY j.createdAt DESC")
    Page<EmailOutboxJobJpaEntity> findFilteredJobs(
            @Param("status") String status,
            @Param("emailType") String emailType,
            Pageable pageable
    );

    @Query("SELECT j.status, COUNT(j) FROM EmailOutboxJobJpaEntity j GROUP BY j.status")
    List<Object[]> countJobsByStatus();
}
