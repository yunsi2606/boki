package com.boki.infrastructure.persistence.repository;

import com.boki.infrastructure.persistence.entity.OrderJpaEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface OrderJpaRepository extends JpaRepository<OrderJpaEntity, UUID> {

    List<OrderJpaEntity> findByBuyerIdOrderByCreatedAtDesc(UUID buyerId);
    java.util.Optional<OrderJpaEntity> findByTrackingNumber(String trackingNumber);
    java.util.Optional<OrderJpaEntity> findByPaymentCode(String paymentCode);

    List<OrderJpaEntity> findByIsFlaggedTrueOrderByCreatedAtDesc();
    long countByIsFlaggedTrue();

    long countByGuestPhoneAndCreatedAtAfter(String guestPhone, java.time.Instant after);
    long countByBuyerIdAndCreatedAtAfter(UUID buyerId, java.time.Instant after);
    long countByBuyerIdAndStatus(UUID buyerId, OrderJpaEntity.OrderStatusJpa status);

    Page<OrderJpaEntity> findAllByOrderByCreatedAtDesc(Pageable pageable);

    Page<OrderJpaEntity> findByStatusOrderByCreatedAtDesc(OrderJpaEntity.OrderStatusJpa status, Pageable pageable);

    @Query("SELECT o FROM OrderJpaEntity o WHERE " +
           "CAST(o.id AS string) LIKE CONCAT('%', :search, '%') OR " +
           "LOWER(o.shippingAddress) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(o.trackingNumber) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(o.paymentCode) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(o.carrierName) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "ORDER BY o.createdAt DESC")
    Page<OrderJpaEntity> searchByKeyword(@Param("search") String search, Pageable pageable);

    @Query("SELECT o FROM OrderJpaEntity o WHERE o.status = :status AND (" +
           "CAST(o.id AS string) LIKE CONCAT('%', :search, '%') OR " +
           "LOWER(o.shippingAddress) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(o.trackingNumber) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(o.paymentCode) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(o.carrierName) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "ORDER BY o.createdAt DESC")
    Page<OrderJpaEntity> searchByStatusAndKeyword(
            @Param("status") OrderJpaEntity.OrderStatusJpa status,
            @Param("search") String search,
            Pageable pageable
    );
}
