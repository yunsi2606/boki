package com.boki.infrastructure.persistence.repository;

import com.boki.infrastructure.persistence.entity.UserMangaCollectionJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserMangaCollectionJpaRepository extends JpaRepository<UserMangaCollectionJpaEntity, UUID> {

    List<UserMangaCollectionJpaEntity> findByUserIdOrderByUpdatedAtDesc(UUID userId);

    List<UserMangaCollectionJpaEntity> findByUserIdAndStatusOrderByUpdatedAtDesc(UUID userId, String status);

    Optional<UserMangaCollectionJpaEntity> findByUserIdAndScheduleId(UUID userId, UUID scheduleId);

    @Query("SELECT COUNT(c) FROM UserMangaCollectionJpaEntity c WHERE c.userId = :userId AND c.status = :status")
    long countByUserIdAndStatus(@Param("userId") UUID userId, @Param("status") String status);

    void deleteByUserIdAndScheduleId(UUID userId, UUID scheduleId);
}
