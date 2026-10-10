package com.boki.infrastructure.persistence.repository;

import com.boki.infrastructure.persistence.entity.ReleaseScheduleJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ReleaseScheduleJpaRepository extends JpaRepository<ReleaseScheduleJpaEntity, UUID>,
        JpaSpecificationExecutor<ReleaseScheduleJpaEntity> {

    @Query("SELECT DISTINCT r FROM ReleaseScheduleJpaEntity r " +
           "LEFT JOIN FETCH r.editions e " +
           "LEFT JOIN FETCH e.book " +
           "WHERE r.id = :id")
    Optional<ReleaseScheduleJpaEntity> findByIdWithEditions(@Param("id") UUID id);

    @Query("SELECT DISTINCT r FROM ReleaseScheduleJpaEntity r " +
           "LEFT JOIN FETCH r.editions e " +
           "LEFT JOIN FETCH e.book " +
           "ORDER BY r.releaseDate ASC, r.title ASC")
    List<ReleaseScheduleJpaEntity> findAllWithEditions();

    @Query("SELECT DISTINCT r.publisher FROM ReleaseScheduleJpaEntity r ORDER BY r.publisher ASC")
    List<String> findDistinctPublishers();

    @Query("SELECT r FROM ReleaseScheduleJpaEntity r " +
           "WHERE LOWER(r.publisher) = LOWER(:publisher) " +
           "ORDER BY r.releaseDate DESC")
    List<ReleaseScheduleJpaEntity> findByPublisher(@Param("publisher") String publisher);
}
