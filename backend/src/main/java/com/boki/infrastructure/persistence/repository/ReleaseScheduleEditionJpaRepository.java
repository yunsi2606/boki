package com.boki.infrastructure.persistence.repository;

import com.boki.infrastructure.persistence.entity.ReleaseScheduleEditionJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ReleaseScheduleEditionJpaRepository extends JpaRepository<ReleaseScheduleEditionJpaEntity, UUID> {
}
