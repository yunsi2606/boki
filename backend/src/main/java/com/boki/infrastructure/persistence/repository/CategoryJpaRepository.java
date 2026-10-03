package com.boki.infrastructure.persistence.repository;

import com.boki.infrastructure.persistence.entity.CategoryJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CategoryJpaRepository extends JpaRepository<CategoryJpaEntity, Integer> {
    boolean existsByNameIgnoreCase(String name);
    boolean existsBySlug(String slug);
    Optional<CategoryJpaEntity> findByNameIgnoreCase(String name);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query("UPDATE CategoryJpaEntity c SET c.parentId = null WHERE c.parentId = :parentId")
    void clearParentCategory(@org.springframework.data.repository.query.Param("parentId") Integer parentId);
}
