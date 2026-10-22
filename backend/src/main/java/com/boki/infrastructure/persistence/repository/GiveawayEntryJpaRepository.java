package com.boki.infrastructure.persistence.repository;

import com.boki.infrastructure.persistence.entity.GiveawayEntryJpaEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface GiveawayEntryJpaRepository extends JpaRepository<GiveawayEntryJpaEntity, UUID> {

    boolean existsByCampaignIdAndEmail(UUID campaignId, String email);

    boolean existsByCampaignIdAndPhone(UUID campaignId, String phone);

    long countByCampaignId(UUID campaignId);

    Page<GiveawayEntryJpaEntity> findByCampaignIdOrderByCreatedAtDesc(UUID campaignId, Pageable pageable);

    @Query("SELECT e FROM GiveawayEntryJpaEntity e LEFT JOIN FETCH e.prize WHERE e.campaign.id = :campaignId AND e.isWinner = true ORDER BY e.prizeRank ASC")
    List<GiveawayEntryJpaEntity> findWinnersByCampaignId(@Param("campaignId") UUID campaignId);

    @Query("SELECT e FROM GiveawayEntryJpaEntity e WHERE e.campaign.id = :campaignId " +
           "ORDER BY ABS(e.luckyNumber - :winningNumber) ASC, e.luckyNumber ASC, e.createdAt ASC")
    List<GiveawayEntryJpaEntity> findRankedEntriesForDraw(
            @Param("campaignId") UUID campaignId,
            @Param("winningNumber") Integer winningNumber
    );
}
