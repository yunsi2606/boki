package com.boki.infrastructure.persistence.repository;

import com.boki.infrastructure.persistence.entity.BookComboItemJpaEntity;
import com.boki.infrastructure.persistence.entity.BookJpaEntity;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface BookComboItemJpaRepository extends JpaRepository<BookComboItemJpaEntity, UUID> {

    @EntityGraph(attributePaths = {"singleBook", "variant"})
    @Query("SELECT c FROM BookComboItemJpaEntity c WHERE c.comboBook.id = :comboBookId ORDER BY c.sortOrder ASC")
    List<BookComboItemJpaEntity> findByComboBookId(@Param("comboBookId") UUID comboBookId);

    @Query("SELECT DISTINCT c.comboBook FROM BookComboItemJpaEntity c WHERE c.singleBook.id = :singleBookId AND c.comboBook.status = 'ACTIVE'")
    List<BookJpaEntity> findCombosContainingSingleBook(@Param("singleBookId") UUID singleBookId);

    @Query("SELECT DISTINCT c.comboBook FROM BookComboItemJpaEntity c WHERE c.singleBook.slug = :slug AND c.comboBook.status = 'ACTIVE'")
    List<BookJpaEntity> findCombosContainingSingleBookSlug(@Param("slug") String slug);

    void deleteByComboBookId(UUID comboBookId);
}
