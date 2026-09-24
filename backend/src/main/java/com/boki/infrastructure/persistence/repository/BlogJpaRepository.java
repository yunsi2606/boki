package com.boki.infrastructure.persistence.repository;

import com.boki.infrastructure.persistence.entity.BlogJpaEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface BlogJpaRepository extends JpaRepository<BlogJpaEntity, UUID> {

    Optional<BlogJpaEntity> findBySlug(String slug);

    Page<BlogJpaEntity> findByStatus(String status, Pageable pageable);

    Page<BlogJpaEntity> findByStatusOrderByPublishedAtDesc(String status, Pageable pageable);

    Page<BlogJpaEntity> findByStatusAndCategoryOrderByPublishedAtDesc(String status, String category, Pageable pageable);

    @Query("SELECT b FROM BlogJpaEntity b WHERE b.isFeatured = true AND b.status = 'PUBLISHED' ORDER BY b.publishedAt DESC")
    List<BlogJpaEntity> findFeatured(Pageable pageable);

    @Query("SELECT b FROM BlogJpaEntity b WHERE b.status = 'PUBLISHED' AND LOWER(b.title) LIKE LOWER(CONCAT('%', :query, '%')) ORDER BY b.publishedAt DESC")
    Page<BlogJpaEntity> searchPublishedByQuery(@Param("query") String query, Pageable pageable);

    @Query("SELECT b FROM BlogJpaEntity b WHERE b.status = 'PUBLISHED' AND b.category = :category AND LOWER(b.title) LIKE LOWER(CONCAT('%', :query, '%')) ORDER BY b.publishedAt DESC")
    Page<BlogJpaEntity> searchPublishedByCategoryAndQuery(@Param("category") String category, @Param("query") String query, Pageable pageable);

    @Query("SELECT b FROM BlogJpaEntity b WHERE LOWER(b.title) LIKE LOWER(CONCAT('%', :query, '%')) ORDER BY b.updatedAt DESC")
    Page<BlogJpaEntity> searchAllByQuery(@Param("query") String query, Pageable pageable);

    @Query("SELECT b FROM BlogJpaEntity b ORDER BY b.updatedAt DESC")
    Page<BlogJpaEntity> findAllOrdered(Pageable pageable);

    @Modifying
    @Transactional
    @Query("UPDATE BlogJpaEntity b SET b.viewsCount = b.viewsCount + 1 WHERE b.id = :id")
    void incrementViewsCount(@Param("id") UUID id);
}
