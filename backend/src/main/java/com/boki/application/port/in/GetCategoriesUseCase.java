package com.boki.application.port.in;

import com.boki.application.dto.response.CategoryResponse;

import java.util.List;

/**
 * Use case port for retrieving book categories.
 */
public interface GetCategoriesUseCase {

    List<CategoryResponse> getCategories();

    CategoryResponse getCategoryById(int id);
}
