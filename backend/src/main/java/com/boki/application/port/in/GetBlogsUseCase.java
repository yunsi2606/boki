package com.boki.application.port.in;

import com.boki.application.dto.response.BlogResponse;

import java.util.List;

public interface GetBlogsUseCase {

    List<BlogResponse> searchPublishedBlogs(String category, String query, int page, int size);

    List<BlogResponse> searchPublishedBlogs(String category, String query, String postType, int page, int size);

    List<BlogResponse> getFeaturedBlogs(int limit);

    BlogResponse getBlogBySlug(String slug);

    BlogResponse getBlogById(java.util.UUID id);

    List<BlogResponse> getAdminBlogs(String query, int page, int size);

    List<BlogResponse> getAdminBlogs(String query, String postType, int page, int size);

    List<BlogResponse> getPreviewsForBook(String idOrSlug);

    void incrementViews(String slug);
}
