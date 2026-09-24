package com.boki.infrastructure.persistence.repository;

import com.boki.infrastructure.persistence.entity.BookJpaEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface BookJpaRepository extends JpaRepository<BookJpaEntity, UUID> {

    Page<BookJpaEntity> findByStatus(BookJpaEntity.BookStatusJpa status, Pageable pageable);

    List<BookJpaEntity> findBySellerId(UUID sellerId);

    java.util.Optional<BookJpaEntity> findBySlug(String slug);

    @Query("SELECT b FROM BookJpaEntity b WHERE b.status = :status AND " +
           "(LOWER(b.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(b.author) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<BookJpaEntity> searchActiveBooks(
            @Param("status") BookJpaEntity.BookStatusJpa status,
            @Param("query") String query,
            Pageable pageable
    );

    @Query("SELECT b FROM BookJpaEntity b WHERE b.status = :status AND b.categoryId = :categoryId")
    Page<BookJpaEntity> findByStatusAndCategoryId(
            @Param("status") BookJpaEntity.BookStatusJpa status,
            @Param("categoryId") Integer categoryId,
            Pageable pageable
    );

    @Query("SELECT b FROM BookJpaEntity b WHERE b.status = :status AND b.categoryId = :categoryId AND " +
           "(LOWER(b.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(b.author) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<BookJpaEntity> searchActiveBooksByCategory(
            @Param("status") BookJpaEntity.BookStatusJpa status,
            @Param("categoryId") Integer categoryId,
            @Param("query") String query,
            Pageable pageable
    );

    @Query("SELECT b FROM BookJpaEntity b WHERE " +
           "LOWER(b.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(b.author) LIKE LOWER(CONCAT('%', :query, '%'))")
    Page<BookJpaEntity> searchAllBooks(@Param("query") String query, Pageable pageable);

    @org.springframework.data.jpa.repository.Modifying
    @Query("UPDATE BookJpaEntity b SET b.viewsCount = b.viewsCount + 1 WHERE b.id = :id")
    void incrementViewsCount(@Param("id") UUID id);
}
