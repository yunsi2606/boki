package com.boki.infrastructure.persistence.repository;

import com.boki.infrastructure.persistence.entity.BlogCategoryJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BlogCategoryJpaRepository extends JpaRepository<BlogCategoryJpaEntity, Integer> {

    Optional<BlogCategoryJpaEntity> findByNameIgnoreCase(String name);

    Optional<BlogCategoryJpaEntity> findBySlug(String slug);

    boolean existsByNameIgnoreCase(String name);

    List<BlogCategoryJpaEntity> findAllByOrderByNameAsc();
}
