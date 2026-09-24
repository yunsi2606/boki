package com.boki.interfaces.rest;

import com.boki.application.dto.response.BlogCategoryResponse;
import com.boki.application.dto.response.BlogResponse;
import com.boki.application.port.in.GetBlogCategoriesUseCase;
import com.boki.application.port.in.GetBlogsUseCase;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/blogs")
public class BlogController {

    private final GetBlogsUseCase getBlogsUseCase;
    private final GetBlogCategoriesUseCase getBlogCategoriesUseCase;

    public BlogController(GetBlogsUseCase getBlogsUseCase, GetBlogCategoriesUseCase getBlogCategoriesUseCase) {
        this.getBlogsUseCase = getBlogsUseCase;
        this.getBlogCategoriesUseCase = getBlogCategoriesUseCase;
    }

    @GetMapping("/categories")
    public ResponseEntity<List<BlogCategoryResponse>> getCategories() {
        return ResponseEntity.ok(getBlogCategoriesUseCase.getAllCategories());
    }

    @GetMapping
    public ResponseEntity<List<BlogResponse>> searchBlogs(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size
    ) {
        return ResponseEntity.ok(getBlogsUseCase.searchPublishedBlogs(category, search, page, size));
    }

    @GetMapping("/featured")
    public ResponseEntity<List<BlogResponse>> getFeaturedBlogs(
            @RequestParam(defaultValue = "3") int limit
    ) {
        return ResponseEntity.ok(getBlogsUseCase.getFeaturedBlogs(limit));
    }

    @GetMapping("/{slug}")
    public ResponseEntity<BlogResponse> getBlogBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(getBlogsUseCase.getBlogBySlug(slug));
    }

    @PostMapping("/{slug}/views")
    public ResponseEntity<Void> incrementViews(@PathVariable String slug) {
        getBlogsUseCase.incrementViews(slug);
        return ResponseEntity.ok().build();
    }
}
