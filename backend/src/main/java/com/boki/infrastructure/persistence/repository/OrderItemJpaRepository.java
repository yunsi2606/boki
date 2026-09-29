package com.boki.infrastructure.persistence.repository;

import com.boki.infrastructure.persistence.entity.OrderItemJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface OrderItemJpaRepository extends JpaRepository<OrderItemJpaEntity, UUID> {

    @Query("SELECT i1.bookId, i2.bookId, COUNT(DISTINCT i1.order.id) " +
           "FROM OrderItemJpaEntity i1, OrderItemJpaEntity i2 " +
           "WHERE i1.order.id = i2.order.id AND i1.bookId <> i2.bookId " +
           "GROUP BY i1.bookId, i2.bookId " +
           "HAVING COUNT(DISTINCT i1.order.id) >= 1")
    List<Object[]> findCoPurchasedPairs();
}
