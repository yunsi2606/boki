package com.boki.application.port.in;

import com.boki.application.dto.request.CreateBlogRequest;
import com.boki.application.dto.request.UpdateBlogRequest;
import com.boki.application.dto.response.BlogResponse;

import java.util.UUID;

public interface ManageBlogUseCase {

    BlogResponse createBlog(CreateBlogRequest request, String authorEmail);

    BlogResponse updateBlog(UUID blogId, UpdateBlogRequest request, String authorEmail);

    void deleteBlog(UUID blogId, String authorEmail);

    BlogResponse changeStatus(UUID blogId, String newStatus, String authorEmail);

    BlogResponse toggleFeatured(UUID blogId, String authorEmail);
}
