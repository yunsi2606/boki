package com.boki.interfaces.rest;

import com.boki.application.dto.request.CreateBlogCategoryRequest;
import com.boki.application.dto.request.CreateBlogRequest;
import com.boki.application.dto.request.UpdateBlogRequest;
import com.boki.application.dto.response.BlogCategoryResponse;
import com.boki.application.dto.response.BlogResponse;
import com.boki.application.port.in.GetBlogsUseCase;
import com.boki.application.port.in.ManageBlogCategoryUseCase;
import com.boki.application.port.in.ManageBlogUseCase;
import com.boki.infrastructure.security.AuthenticatedUser;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/blogs")
public class AdminBlogController {

    private final ManageBlogUseCase manageBlogUseCase;
    private final GetBlogsUseCase getBlogsUseCase;
    private final ManageBlogCategoryUseCase manageBlogCategoryUseCase;

    public AdminBlogController(
            ManageBlogUseCase manageBlogUseCase,
            GetBlogsUseCase getBlogsUseCase,
            ManageBlogCategoryUseCase manageBlogCategoryUseCase
    ) {
        this.manageBlogUseCase = manageBlogUseCase;
        this.getBlogsUseCase = getBlogsUseCase;
        this.manageBlogCategoryUseCase = manageBlogCategoryUseCase;
    }

    @PostMapping("/categories")
    public ResponseEntity<BlogCategoryResponse> createCategory(
            @Valid @RequestBody CreateBlogCategoryRequest request
    ) {
        BlogCategoryResponse response = manageBlogCategoryUseCase.createCategory(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @DeleteMapping("/categories/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Integer id) {
        manageBlogCategoryUseCase.deleteCategory(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<List<BlogResponse>> getAdminBlogs(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size
    ) {
        return ResponseEntity.ok(getBlogsUseCase.getAdminBlogs(search, page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<BlogResponse> getAdminBlogById(@PathVariable UUID id) {
        return ResponseEntity.ok(getBlogsUseCase.getBlogById(id));
    }

    @PostMapping
    public ResponseEntity<BlogResponse> createBlog(
            @AuthenticationPrincipal AuthenticatedUser principal,
            @Valid @RequestBody CreateBlogRequest request
    ) {
        BlogResponse response = manageBlogUseCase.createBlog(request, principal.email());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<BlogResponse> updateBlog(
            @PathVariable UUID id,
            @AuthenticationPrincipal AuthenticatedUser principal,
            @Valid @RequestBody UpdateBlogRequest request
    ) {
        return ResponseEntity.ok(manageBlogUseCase.updateBlog(id, request, principal.email()));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<BlogResponse> changeStatus(
            @PathVariable UUID id,
            @AuthenticationPrincipal AuthenticatedUser principal,
            @RequestBody Map<String, String> body
    ) {
        String newStatus = body.get("status");
        return ResponseEntity.ok(manageBlogUseCase.changeStatus(id, newStatus, principal.email()));
    }

    @PatchMapping("/{id}/featured")
    public ResponseEntity<BlogResponse> toggleFeatured(
            @PathVariable UUID id,
            @AuthenticationPrincipal AuthenticatedUser principal
    ) {
        return ResponseEntity.ok(manageBlogUseCase.toggleFeatured(id, principal.email()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBlog(
            @PathVariable UUID id,
            @AuthenticationPrincipal AuthenticatedUser principal
    ) {
        manageBlogUseCase.deleteBlog(id, principal.email());
        return ResponseEntity.noContent().build();
    }
}
