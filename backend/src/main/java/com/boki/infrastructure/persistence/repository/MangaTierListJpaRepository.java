package com.boki.infrastructure.persistence.repository;

import com.boki.infrastructure.persistence.entity.MangaTierListJpaEntity;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface MangaTierListJpaRepository extends JpaRepository<MangaTierListJpaEntity, UUID> {

    @Query("SELECT t FROM MangaTierListJpaEntity t " +
           "LEFT JOIN FETCH t.user u " +
           "WHERE t.isPublic = true " +
           "ORDER BY t.likesCount DESC, t.createdAt DESC")
    List<MangaTierListJpaEntity> findTopPublicTierLists(Pageable pageable);

    @Query("SELECT t FROM MangaTierListJpaEntity t " +
           "LEFT JOIN FETCH t.user u " +
           "WHERE t.userId = :userId " +
           "ORDER BY t.createdAt DESC")
    List<MangaTierListJpaEntity> findByUserId(@Param("userId") UUID userId);

    @Query("SELECT t FROM MangaTierListJpaEntity t " +
           "LEFT JOIN FETCH t.user u " +
           "LEFT JOIN FETCH t.items i " +
           "LEFT JOIN FETCH i.schedule s " +
           "WHERE t.id = :id")
    Optional<MangaTierListJpaEntity> findByIdWithDetails(@Param("id") UUID id);

    @Query("SELECT t FROM MangaTierListJpaEntity t " +
           "LEFT JOIN FETCH t.user u " +
           "WHERE (:keyword IS NULL OR LOWER(t.title) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "ORDER BY t.createdAt DESC")
    List<MangaTierListJpaEntity> findAllForAdmin(@Param("keyword") String keyword);
}
