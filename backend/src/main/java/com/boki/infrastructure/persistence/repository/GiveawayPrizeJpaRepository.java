package com.boki.infrastructure.persistence.repository;

import com.boki.infrastructure.persistence.entity.GiveawayPrizeJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface GiveawayPrizeJpaRepository extends JpaRepository<GiveawayPrizeJpaEntity, UUID> {

    List<GiveawayPrizeJpaEntity> findByCampaignIdOrderByDisplayOrderAsc(UUID campaignId);

    void deleteByCampaignId(UUID campaignId);
}
