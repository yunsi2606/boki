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

    Page<BookJpaEntity> findByStatusAndIsCombo(BookJpaEntity.BookStatusJpa status, boolean isCombo, Pageable pageable);

    Page<BookJpaEntity> findByIsCombo(boolean isCombo, Pageable pageable);

    List<BookJpaEntity> findBySellerId(UUID sellerId);

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"images"})
    @Query("SELECT b FROM BookJpaEntity b WHERE b.id IN :ids")
    List<BookJpaEntity> findAllWithImagesByIdIn(@Param("ids") List<UUID> ids);

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"images"})
    @Override
    java.util.Optional<BookJpaEntity> findById(UUID id);

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"images"})
    java.util.Optional<BookJpaEntity> findBySlug(String slug);

    @Query("SELECT b FROM BookJpaEntity b WHERE b.status = :status AND " +
           "(LOWER(b.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(b.author) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<BookJpaEntity> searchActiveBooks(
            @Param("status") BookJpaEntity.BookStatusJpa status,
            @Param("query") String query,
            Pageable pageable
    );

    @Query("SELECT DISTINCT b FROM BookJpaEntity b LEFT JOIN b.categoryIds catId " +
           "WHERE b.status = :status AND (b.categoryId = :categoryId OR catId = :categoryId)")
    Page<BookJpaEntity> findByStatusAndCategoryId(
            @Param("status") BookJpaEntity.BookStatusJpa status,
            @Param("categoryId") Integer categoryId,
            Pageable pageable
    );

    @Query("SELECT DISTINCT b FROM BookJpaEntity b LEFT JOIN b.categoryIds catId " +
           "WHERE b.status = :status AND (b.categoryId = :categoryId OR catId = :categoryId) AND " +
           "(LOWER(b.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(b.author) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<BookJpaEntity> searchActiveBooksByCategory(
            @Param("status") BookJpaEntity.BookStatusJpa status,
            @Param("categoryId") Integer categoryId,
            @Param("query") String query,
            Pageable pageable
    );

    @Query("SELECT DISTINCT b FROM BookJpaEntity b LEFT JOIN b.categoryIds catId " +
           "WHERE b.status = :status AND (b.categoryId IN :categoryIds OR catId IN :categoryIds)")
    Page<BookJpaEntity> findByStatusAndCategoryIdsIn(
            @Param("status") BookJpaEntity.BookStatusJpa status,
            @Param("categoryIds") List<Integer> categoryIds,
            Pageable pageable
    );

    @Query("SELECT DISTINCT b FROM BookJpaEntity b LEFT JOIN b.categoryIds catId " +
           "WHERE b.status = :status AND (b.categoryId IN :categoryIds OR catId IN :categoryIds) AND " +
           "(LOWER(b.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(b.author) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<BookJpaEntity> searchActiveBooksByCategoryIdsIn(
            @Param("status") BookJpaEntity.BookStatusJpa status,
            @Param("categoryIds") List<Integer> categoryIds,
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

    @org.springframework.data.jpa.repository.Modifying
    @Query(value = "DELETE FROM book_categories WHERE category_id = :categoryId", nativeQuery = true)
    void removeCategoryFromBookCategories(@Param("categoryId") Integer categoryId);

    @org.springframework.data.jpa.repository.Modifying
    @Query("UPDATE BookJpaEntity b SET b.categoryId = null WHERE b.categoryId = :categoryId")
    void clearBookPrimaryCategory(@Param("categoryId") Integer categoryId);

    @Query(value = """
        SELECT c.id AS category_id, COUNT(DISTINCT b.id) AS book_count
        FROM categories c
        LEFT JOIN (
            SELECT id, category_id, status FROM books WHERE category_id IS NOT NULL
            UNION ALL
            SELECT bc.book_id AS id, bc.category_id, b2.status 
            FROM book_categories bc 
            JOIN books b2 ON bc.book_id = b2.id
        ) b ON b.category_id = c.id AND b.status = 'ACTIVE'
        GROUP BY c.id
    """, nativeQuery = true)
    List<Object[]> countActiveBooksGroupedByCategory();

    @Query(value = """
        SELECT ranked.cat_id, ranked.cover_url
        FROM (
            SELECT 
                b.cat_id,
                COALESCE(
                    NULLIF(b.category_cover_url, ''),
                    (SELECT bi.image_url FROM book_images bi WHERE bi.book_id = b.id ORDER BY bi.is_primary DESC, bi.sort_order ASC LIMIT 1)
                ) AS cover_url,
                ROW_NUMBER() OVER (PARTITION BY b.cat_id ORDER BY b.created_at DESC) as rn
            FROM (
                SELECT id, category_id AS cat_id, category_cover_url, created_at, status FROM books WHERE category_id IS NOT NULL
                UNION ALL
                SELECT b2.id, bc.category_id AS cat_id, b2.category_cover_url, b2.created_at, b2.status 
                FROM book_categories bc JOIN books b2 ON bc.book_id = b2.id
            ) b
            WHERE b.status = 'ACTIVE'
        ) ranked
        WHERE ranked.rn <= 2 AND ranked.cover_url IS NOT NULL
    """, nativeQuery = true)
    List<Object[]> findTopCategoryDisplayCovers();
}
