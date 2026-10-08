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

    @Query("SELECT r FROM ReleaseScheduleJpaEntity r LEFT JOIN FETCH r.book WHERE r.id = :id")
    Optional<ReleaseScheduleJpaEntity> findByIdWithBook(@Param("id") UUID id);

    @Query("SELECT DISTINCT r.publisher FROM ReleaseScheduleJpaEntity r ORDER BY r.publisher ASC")
    List<String> findDistinctPublishers();
}
