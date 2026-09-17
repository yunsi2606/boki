package com.boki.infrastructure.persistence.repository;

import com.boki.infrastructure.persistence.entity.PaymentJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PaymentJpaRepository extends JpaRepository<PaymentJpaEntity, UUID> {

    List<PaymentJpaEntity> findByOrderIdOrderByCreatedAtDesc(UUID orderId);

    Optional<PaymentJpaEntity> findByTransactionCode(String transactionCode);

    Optional<PaymentJpaEntity> findByPaymentCode(String paymentCode);
}
