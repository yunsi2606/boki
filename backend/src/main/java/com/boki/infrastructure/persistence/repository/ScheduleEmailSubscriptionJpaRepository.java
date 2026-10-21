package com.boki.infrastructure.persistence.repository;

import com.boki.infrastructure.persistence.entity.ScheduleEmailSubscriptionJpaEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ScheduleEmailSubscriptionJpaRepository extends JpaRepository<ScheduleEmailSubscriptionJpaEntity, UUID> {

    Optional<ScheduleEmailSubscriptionJpaEntity> findByEmailAndSubscriptionTypeAndTargetId(
            String email, String subscriptionType, String targetId
    );

    Optional<ScheduleEmailSubscriptionJpaEntity> findByUnsubscribeToken(String token);

    List<ScheduleEmailSubscriptionJpaEntity> findBySubscriptionTypeAndTargetIdAndActiveTrue(
            String subscriptionType, String targetId
    );

    List<ScheduleEmailSubscriptionJpaEntity> findBySubscriptionTypeAndActiveTrue(String subscriptionType);

    List<ScheduleEmailSubscriptionJpaEntity> findByEmail(String email);

    @Query("SELECT s FROM ScheduleEmailSubscriptionJpaEntity s ORDER BY s.createdAt DESC")
    Page<ScheduleEmailSubscriptionJpaEntity> findAllPaged(Pageable pageable);

    @Query("SELECT COUNT(s) FROM ScheduleEmailSubscriptionJpaEntity s WHERE s.active = true")
    long countActiveSubscriptions();
}
