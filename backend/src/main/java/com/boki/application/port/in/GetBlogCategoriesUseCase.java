package com.boki.application.port.in;

import com.boki.application.dto.response.BlogCategoryResponse;

import java.util.List;

public interface GetBlogCategoriesUseCase {

    List<BlogCategoryResponse> getAllCategories();
}
