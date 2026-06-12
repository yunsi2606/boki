package com.boki.infrastructure.persistence.adapter;

import com.boki.domain.model.category.Category;
import com.boki.domain.port.out.CategoryRepository;
import com.boki.infrastructure.persistence.entity.CategoryJpaEntity;
import com.boki.infrastructure.persistence.repository.CategoryJpaRepository;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Adapter implementing the domain CategoryRepository port using JPA.
 */
@Component
public class CategoryRepositoryAdapter implements CategoryRepository {

    private final CategoryJpaRepository jpaRepository;

    public CategoryRepositoryAdapter(CategoryJpaRepository jpaRepository) {
        this.jpaRepository = jpaRepository;
    }

    @Override
    public List<Category> findAll() {
        return jpaRepository.findAll()
                .stream()
                .map(this::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public Optional<Category> findById(int id) {
        return jpaRepository.findById(id).map(this::toDomain);
    }

    private Category toDomain(CategoryJpaEntity entity) {
        return Category.reconstitute(
                entity.getId(),
                entity.getName(),
                entity.getSlug(),
                entity.getDescription(),
                entity.getParentId()
        );
    }
}
