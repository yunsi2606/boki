package com.boki.infrastructure.persistence.repository;

import com.boki.infrastructure.persistence.entity.RoleJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RoleJpaRepository extends JpaRepository<RoleJpaEntity, UUID> {
    Optional<RoleJpaEntity> findByCode(String code);
    boolean existsByCode(String code);

    @Query("SELECT DISTINCT r FROM RoleJpaEntity r LEFT JOIN FETCH r.permissions ORDER BY r.system DESC, r.name ASC")
    List<RoleJpaEntity> findAllWithPermissions();

    @Query("SELECT r FROM RoleJpaEntity r LEFT JOIN FETCH r.permissions WHERE r.id = :id")
    Optional<RoleJpaEntity> findByIdWithPermissions(@Param("id") UUID id);

    @Query("SELECT r FROM RoleJpaEntity r LEFT JOIN FETCH r.permissions WHERE r.code = :code")
    Optional<RoleJpaEntity> findByCodeWithPermissions(@Param("code") String code);
}
