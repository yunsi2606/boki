package com.boki.domain.port.out;

import com.boki.domain.model.category.Category;

import java.util.List;
import java.util.Optional;

/**
 * Port (outbound) for category persistence.
 */
public interface CategoryRepository {

    List<Category> findAll();

    Optional<Category> findById(int id);

    Category save(Category category);

    boolean existsByNameIgnoreCase(String name);

    boolean existsBySlug(String slug);

    Optional<Category> findByNameIgnoreCase(String name);
}
