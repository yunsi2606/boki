package com.boki.infrastructure.persistence.repository;

import com.boki.infrastructure.persistence.entity.ChatConfirmationTicketJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public interface ChatConfirmationTicketJpaRepository extends JpaRepository<ChatConfirmationTicketJpaEntity, String> {

    Optional<ChatConfirmationTicketJpaEntity> findByIdAndStatus(String id, String status);

    List<ChatConfirmationTicketJpaEntity> findByStatusAndExpiresAtBefore(String status, Instant before);
}
