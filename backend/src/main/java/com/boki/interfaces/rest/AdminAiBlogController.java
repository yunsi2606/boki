package com.boki.interfaces.rest;

import com.boki.application.dto.request.AiGenerateBlogRequest;
import com.boki.application.dto.response.AiGenerateBlogResponse;
import com.boki.application.service.AdminAiBlogService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/blogs/ai")
public class AdminAiBlogController {

    private final AdminAiBlogService adminAiBlogService;

    public AdminAiBlogController(AdminAiBlogService adminAiBlogService) {
        this.adminAiBlogService = adminAiBlogService;
    }

    @PostMapping("/generate")
    public ResponseEntity<AiGenerateBlogResponse> generateBlog(
            @Valid @RequestBody AiGenerateBlogRequest request
    ) {
        AiGenerateBlogResponse response = adminAiBlogService.generateBlogContent(request);
        return ResponseEntity.ok(response);
    }
}
