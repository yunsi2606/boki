package com.boki.infrastructure.persistence.repository;

import com.boki.infrastructure.persistence.entity.MangaTierListItemJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface MangaTierListItemJpaRepository extends JpaRepository<MangaTierListItemJpaEntity, UUID> {

    List<MangaTierListItemJpaEntity> findByTierListIdOrderBySortOrderAsc(UUID tierListId);

    @Query("SELECT i FROM MangaTierListItemJpaEntity i " +
           "JOIN FETCH i.schedule s " +
           "WHERE i.tierListId IN :tierListIds " +
           "ORDER BY i.sortOrder ASC")
    List<MangaTierListItemJpaEntity> findByTierListIdIn(@Param("tierListIds") List<UUID> tierListIds);
}
