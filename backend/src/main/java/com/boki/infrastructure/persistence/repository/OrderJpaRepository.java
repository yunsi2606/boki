package com.boki.infrastructure.persistence.repository;

import com.boki.infrastructure.persistence.entity.OrderJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface OrderJpaRepository extends JpaRepository<OrderJpaEntity, UUID> {

    List<OrderJpaEntity> findByBuyerIdOrderByCreatedAtDesc(UUID buyerId);
}
