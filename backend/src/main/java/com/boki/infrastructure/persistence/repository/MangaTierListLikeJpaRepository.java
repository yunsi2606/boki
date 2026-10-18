package com.boki.infrastructure.persistence.repository;

import com.boki.infrastructure.persistence.entity.MangaTierListLikeJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface MangaTierListLikeJpaRepository extends JpaRepository<MangaTierListLikeJpaEntity, UUID> {
    Optional<MangaTierListLikeJpaEntity> findByUserIdAndTierListId(UUID userId, UUID tierListId);
    boolean existsByUserIdAndTierListId(UUID userId, UUID tierListId);
    void deleteByUserIdAndTierListId(UUID userId, UUID tierListId);
}
