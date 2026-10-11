package com.boki.infrastructure.persistence.repository;

import com.boki.infrastructure.persistence.entity.UserJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserJpaRepository extends JpaRepository<UserJpaEntity, UUID>, JpaSpecificationExecutor<UserJpaEntity> {

    Optional<UserJpaEntity> findByEmail(String email);

    boolean existsByEmail(String email);

    @Query("SELECT DISTINCT u FROM UserJpaEntity u LEFT JOIN FETCH u.dynamicRoles r LEFT JOIN FETCH r.permissions WHERE u.id = :id")
    Optional<UserJpaEntity> findByIdWithRolesAndPermissions(@Param("id") UUID id);

    long countByActiveTrue();
    long countByActiveFalse();
    long countByPhoneVerifiedTrue();
}
