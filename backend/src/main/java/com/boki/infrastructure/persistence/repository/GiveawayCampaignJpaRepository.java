package com.boki.infrastructure.persistence.repository;

import com.boki.infrastructure.persistence.entity.GiveawayCampaignJpaEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface GiveawayCampaignJpaRepository extends JpaRepository<GiveawayCampaignJpaEntity, UUID> {

    Optional<GiveawayCampaignJpaEntity> findBySlug(String slug);

    @Query("SELECT c FROM GiveawayCampaignJpaEntity c LEFT JOIN FETCH c.prizes WHERE c.slug = :slug")
    Optional<GiveawayCampaignJpaEntity> findBySlugWithPrizes(@Param("slug") String slug);

    @Query("SELECT c FROM GiveawayCampaignJpaEntity c LEFT JOIN FETCH c.prizes WHERE c.id = :id")
    Optional<GiveawayCampaignJpaEntity> findByIdWithPrizes(@Param("id") UUID id);

    Page<GiveawayCampaignJpaEntity> findByStatusOrderByCreatedAtDesc(String status, Pageable pageable);

    Page<GiveawayCampaignJpaEntity> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
