package com.boki.infrastructure.persistence.repository;

import com.boki.infrastructure.persistence.entity.BookSimilarityJpaEntity;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface BookSimilarityJpaRepository extends JpaRepository<BookSimilarityJpaEntity, UUID> {

    @EntityGraph(attributePaths = {"targetBook"})
    @Query("SELECT s FROM BookSimilarityJpaEntity s WHERE s.sourceBook.id = :sourceBookId " +
           "AND s.targetBook.status = 'ACTIVE' ORDER BY s.similarityScore DESC")
    List<BookSimilarityJpaEntity> findBySourceBookId(@Param("sourceBookId") UUID sourceBookId, Pageable pageable);

    @Query("SELECT s FROM BookSimilarityJpaEntity s WHERE s.sourceBook.slug = :slug " +
           "AND s.targetBook.status = 'ACTIVE' ORDER BY s.similarityScore DESC")
    List<BookSimilarityJpaEntity> findBySourceBookSlug(@Param("slug") String slug, Pageable pageable);

    void deleteBySourceBookId(UUID sourceBookId);
}
