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

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"linkedBooks"})
    Optional<BlogJpaEntity> findBySlug(String slug);

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"linkedBooks"})
    @Override
    Optional<BlogJpaEntity> findById(UUID id);

    Page<BlogJpaEntity> findByStatus(String status, Pageable pageable);

    Page<BlogJpaEntity> findByStatusOrderByPublishedAtDesc(String status, Pageable pageable);

    Page<BlogJpaEntity> findByStatusAndCategoryOrderByPublishedAtDesc(String status, String category, Pageable pageable);

    Page<BlogJpaEntity> findByStatusAndPostTypeOrderByPublishedAtDesc(String status, String postType, Pageable pageable);

    Page<BlogJpaEntity> findByStatusAndCategoryAndPostTypeOrderByPublishedAtDesc(String status, String category, String postType, Pageable pageable);

    @Query("SELECT b FROM BlogJpaEntity b WHERE b.isFeatured = true AND b.status = 'PUBLISHED' ORDER BY b.publishedAt DESC")
    List<BlogJpaEntity> findFeatured(Pageable pageable);

    @Query("SELECT b FROM BlogJpaEntity b WHERE b.status = 'PUBLISHED' AND LOWER(b.title) LIKE LOWER(CONCAT('%', :query, '%')) ORDER BY b.publishedAt DESC")
    Page<BlogJpaEntity> searchPublishedByQuery(@Param("query") String query, Pageable pageable);

    @Query("SELECT b FROM BlogJpaEntity b WHERE b.status = 'PUBLISHED' AND b.category = :category AND LOWER(b.title) LIKE LOWER(CONCAT('%', :query, '%')) ORDER BY b.publishedAt DESC")
    Page<BlogJpaEntity> searchPublishedByCategoryAndQuery(@Param("category") String category, @Param("query") String query, Pageable pageable);

    @Query("SELECT b FROM BlogJpaEntity b WHERE b.status = 'PUBLISHED' AND b.postType = :postType AND LOWER(b.title) LIKE LOWER(CONCAT('%', :query, '%')) ORDER BY b.publishedAt DESC")
    Page<BlogJpaEntity> searchPublishedByPostTypeAndQuery(@Param("postType") String postType, @Param("query") String query, Pageable pageable);

    @Query("SELECT b FROM BlogJpaEntity b WHERE b.status = 'PUBLISHED' AND b.category = :category AND b.postType = :postType AND LOWER(b.title) LIKE LOWER(CONCAT('%', :query, '%')) ORDER BY b.publishedAt DESC")
    Page<BlogJpaEntity> searchPublishedByCategoryAndPostTypeAndQuery(@Param("category") String category, @Param("postType") String postType, @Param("query") String query, Pageable pageable);

    @Query("SELECT DISTINCT b FROM BlogJpaEntity b JOIN b.linkedBooks lb WHERE lb.id = :bookId AND b.status = 'PUBLISHED' ORDER BY b.publishedAt DESC")
    List<BlogJpaEntity> findPublishedPreviewsByBookId(@Param("bookId") UUID bookId);

    @Query("SELECT DISTINCT b FROM BlogJpaEntity b JOIN b.linkedBooks lb WHERE lb.slug = :slug AND b.status = 'PUBLISHED' ORDER BY b.publishedAt DESC")
    List<BlogJpaEntity> findPublishedPreviewsByBookSlug(@Param("slug") String slug);

    @Query("SELECT b FROM BlogJpaEntity b WHERE LOWER(b.title) LIKE LOWER(CONCAT('%', :query, '%')) ORDER BY b.updatedAt DESC")
    Page<BlogJpaEntity> searchAllByQuery(@Param("query") String query, Pageable pageable);

    @Query("SELECT b FROM BlogJpaEntity b WHERE b.postType = :postType AND LOWER(b.title) LIKE LOWER(CONCAT('%', :query, '%')) ORDER BY b.updatedAt DESC")
    Page<BlogJpaEntity> searchAllByPostTypeAndQuery(@Param("postType") String postType, @Param("query") String query, Pageable pageable);

    @Query("SELECT b FROM BlogJpaEntity b ORDER BY b.updatedAt DESC")
    Page<BlogJpaEntity> findAllOrdered(Pageable pageable);

    @Query("SELECT b FROM BlogJpaEntity b WHERE b.postType = :postType ORDER BY b.updatedAt DESC")
    Page<BlogJpaEntity> findAllByPostTypeOrdered(@Param("postType") String postType, Pageable pageable);

    @Modifying
    @Transactional
    @Query("UPDATE BlogJpaEntity b SET b.viewsCount = b.viewsCount + 1 WHERE b.id = :id")
    void incrementViewsCount(@Param("id") UUID id);
}
