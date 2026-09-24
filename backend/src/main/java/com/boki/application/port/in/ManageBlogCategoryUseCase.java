package com.boki.application.port.in;

import com.boki.application.dto.request.CreateBlogCategoryRequest;
import com.boki.application.dto.response.BlogCategoryResponse;

public interface ManageBlogCategoryUseCase {

    BlogCategoryResponse createCategory(CreateBlogCategoryRequest request);

    void deleteCategory(Integer id);
}
