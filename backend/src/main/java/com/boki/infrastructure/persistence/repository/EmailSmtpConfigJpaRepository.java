package com.boki.infrastructure.persistence.repository;

import com.boki.infrastructure.persistence.entity.EmailSmtpConfigJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface EmailSmtpConfigJpaRepository extends JpaRepository<EmailSmtpConfigJpaEntity, UUID> {

    default Optional<EmailSmtpConfigJpaEntity> findActiveConfig() {
        return findAll().stream().findFirst();
    }
}
