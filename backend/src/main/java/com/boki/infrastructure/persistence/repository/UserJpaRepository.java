package com.boki.infrastructure.persistence.repository;

import com.boki.infrastructure.persistence.entity.UserJpaEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserJpaRepository extends JpaRepository<UserJpaEntity, UUID> {

    Optional<UserJpaEntity> findByEmail(String email);

    boolean existsByEmail(String email);

    @Query("SELECT DISTINCT u FROM UserJpaEntity u LEFT JOIN FETCH u.dynamicRoles r LEFT JOIN FETCH r.permissions WHERE u.id = :id")
    Optional<UserJpaEntity> findByIdWithRolesAndPermissions(@Param("id") UUID id);

    @Query(value = "SELECT DISTINCT u FROM UserJpaEntity u LEFT JOIN FETCH u.dynamicRoles WHERE " +
            "(:keyword IS NULL OR :keyword = '' OR LOWER(u.email) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "  OR LOWER(u.displayName) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "  OR LOWER(u.phoneNumber) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
            "AND (:active IS NULL OR u.active = :active) " +
            "AND (:phoneVerified IS NULL OR u.phoneVerified = :phoneVerified) " +
            "AND (:memberTier IS NULL OR :memberTier = '' OR u.memberTier = :memberTier)",
            countQuery = "SELECT COUNT(u) FROM UserJpaEntity u WHERE " +
            "(:keyword IS NULL OR :keyword = '' OR LOWER(u.email) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "  OR LOWER(u.displayName) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "  OR LOWER(u.phoneNumber) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
            "AND (:active IS NULL OR u.active = :active) " +
            "AND (:phoneVerified IS NULL OR u.phoneVerified = :phoneVerified) " +
            "AND (:memberTier IS NULL OR :memberTier = '' OR u.memberTier = :memberTier)")
    Page<UserJpaEntity> findUsersForAdmin(
            @Param("keyword") String keyword,
            @Param("active") Boolean active,
            @Param("phoneVerified") Boolean phoneVerified,
            @Param("memberTier") String memberTier,
            Pageable pageable
    );

    long countByActiveTrue();
    long countByActiveFalse();
    long countByPhoneVerifiedTrue();
}
