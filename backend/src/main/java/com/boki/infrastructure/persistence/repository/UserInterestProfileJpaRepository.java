package com.boki.infrastructure.persistence.repository;

import com.boki.infrastructure.persistence.entity.UserInterestProfileJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserInterestProfileJpaRepository extends JpaRepository<UserInterestProfileJpaEntity, UUID> {

    Optional<UserInterestProfileJpaEntity> findByUserId(UUID userId);

    Optional<UserInterestProfileJpaEntity> findBySessionId(String sessionId);
}
