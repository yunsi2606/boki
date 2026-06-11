package com.boki.infrastructure.persistence.repository;

import com.boki.infrastructure.persistence.entity.UserOauthAccountJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserOauthAccountJpaRepository extends JpaRepository<UserOauthAccountJpaEntity, UUID> {
    Optional<UserOauthAccountJpaEntity> findByProviderAndProviderUserId(String provider, String providerUserId);
    boolean existsByUserIdAndProvider(UUID userId, String provider);
}
