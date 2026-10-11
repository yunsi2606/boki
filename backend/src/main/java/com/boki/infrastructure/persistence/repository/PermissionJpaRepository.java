package com.boki.infrastructure.persistence.repository;

import com.boki.infrastructure.persistence.entity.PermissionJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PermissionJpaRepository extends JpaRepository<PermissionJpaEntity, UUID> {
    Optional<PermissionJpaEntity> findByCode(String code);
    List<PermissionJpaEntity> findAllByOrderByModuleAscCodeAsc();
    List<PermissionJpaEntity> findByModuleOrderByCodeAsc(String module);
}
