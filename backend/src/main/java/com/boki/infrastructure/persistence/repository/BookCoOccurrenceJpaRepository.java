package com.boki.infrastructure.persistence.repository;

import com.boki.infrastructure.persistence.entity.BookCoOccurrenceJpaEntity;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface BookCoOccurrenceJpaRepository extends JpaRepository<BookCoOccurrenceJpaEntity, UUID> {

    @EntityGraph(attributePaths = {"bookB"})
    @Query("SELECT c FROM BookCoOccurrenceJpaEntity c WHERE c.bookA.id = :bookAId " +
           "AND c.bookB.status = 'ACTIVE' ORDER BY c.confidenceScore DESC, c.coOrderCount DESC")
    List<BookCoOccurrenceJpaEntity> findByBookAId(@Param("bookAId") UUID bookAId, Pageable pageable);

    @Query("SELECT c FROM BookCoOccurrenceJpaEntity c WHERE c.bookA.id IN :bookIds " +
           "AND c.bookB.id NOT IN :bookIds AND c.bookB.status = 'ACTIVE' " +
           "ORDER BY c.confidenceScore DESC, c.coOrderCount DESC")
    List<BookCoOccurrenceJpaEntity> findByBookAIdInAndBookBIdNotIn(
            @Param("bookIds") List<UUID> bookIds,
            Pageable pageable
    );

    void deleteByBookAId(UUID bookAId);
}
