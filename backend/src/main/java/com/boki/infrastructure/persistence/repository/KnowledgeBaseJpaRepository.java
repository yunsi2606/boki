package com.boki.infrastructure.persistence.repository;

import com.boki.infrastructure.persistence.entity.KnowledgeBaseJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface KnowledgeBaseJpaRepository extends JpaRepository<KnowledgeBaseJpaEntity, Long> {

    List<KnowledgeBaseJpaEntity> findByActiveTrue();

    List<KnowledgeBaseJpaEntity> findByCategoryAndActiveTrue(String category);

    @Query("SELECT k FROM KnowledgeBaseJpaEntity k WHERE k.active = true AND (" +
           "LOWER(k.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(k.content) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<KnowledgeBaseJpaEntity> searchActiveKnowledge(@Param("query") String query);
}
