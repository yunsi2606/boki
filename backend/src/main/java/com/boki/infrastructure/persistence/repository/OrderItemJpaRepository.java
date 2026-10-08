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

    @Query(value = "SELECT oi.book_id AS bookId, " +
                   "b.title AS title, b.author AS author, " +
                   "COALESCE(NULLIF(b.category_cover_url, ''), " +
                   "(SELECT bi.image_url FROM book_images bi WHERE bi.book_id = b.id ORDER BY bi.is_primary DESC, bi.sort_order ASC LIMIT 1)) AS coverUrl, " +
                   "COALESCE(SUM(oi.quantity), 0) AS totalSold, " +
                   "COALESCE(SUM(oi.quantity * oi.unit_price), 0) AS totalRevenue " +
                   "FROM order_items oi " +
                   "JOIN orders o ON o.id = oi.order_id " +
                   "JOIN books b ON b.id = oi.book_id " +
                   "WHERE o.status != 'CANCELLED' " +
                   "GROUP BY oi.book_id, b.id, b.title, b.author, b.category_cover_url " +
                   "ORDER BY totalSold DESC " +
                   "LIMIT :limit", nativeQuery = true)
    List<Object[]> findTopSellingBooks(@org.springframework.data.repository.query.Param("limit") int limit);

    @Query(value = "SELECT COALESCE(c.name, 'Chung') AS categoryName, " +
                   "COALESCE(SUM(oi.quantity * oi.unit_price), 0) AS totalRevenue, " +
                   "COALESCE(SUM(oi.quantity), 0) AS totalUnitsSold " +
                   "FROM order_items oi " +
                   "JOIN orders o ON o.id = oi.order_id " +
                   "JOIN books b ON b.id = oi.book_id " +
                   "LEFT JOIN categories c ON c.id = b.category_id " +
                   "WHERE o.status != 'CANCELLED' " +
                   "GROUP BY c.id, c.name " +
                   "ORDER BY totalRevenue DESC", nativeQuery = true)
    List<Object[]> findCategoryRevenueDistribution();
}
