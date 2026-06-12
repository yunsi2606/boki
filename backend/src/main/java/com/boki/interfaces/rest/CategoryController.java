package com.boki.interfaces.rest;

import com.boki.application.dto.response.CategoryResponse;
import com.boki.application.port.in.GetCategoriesUseCase;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for category endpoints.
 * <p>
 * All endpoints are public — categories are reference data needed for browsing and filtering.
 */
@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    private final GetCategoriesUseCase getCategoriesUseCase;

    public CategoryController(GetCategoriesUseCase getCategoriesUseCase) {
        this.getCategoriesUseCase = getCategoriesUseCase;
    }

    @GetMapping
    public ResponseEntity<List<CategoryResponse>> getCategories() {
        return ResponseEntity.ok(getCategoriesUseCase.getCategories());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CategoryResponse> getCategoryById(@PathVariable int id) {
        return ResponseEntity.ok(getCategoriesUseCase.getCategoryById(id));
    }
}
