package com.boki.application.port.in;

import com.boki.application.dto.request.CreateCategoryRequest;
import com.boki.application.dto.response.CategoryCheckResultResponse;
import com.boki.application.dto.response.CategoryResponse;

/**
 * Use case port for creating and validating book categories.
 */
public interface CreateCategoryUseCase {

    CategoryResponse createCategory(CreateCategoryRequest request);

    CategoryCheckResultResponse checkCategory(String name);
}
