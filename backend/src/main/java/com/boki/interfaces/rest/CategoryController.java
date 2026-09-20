package com.boki.interfaces.rest;

import com.boki.application.dto.request.CreateCategoryRequest;
import com.boki.application.dto.response.CategoryCheckResultResponse;
import com.boki.application.dto.response.CategoryResponse;
import com.boki.application.port.in.CreateCategoryUseCase;
import com.boki.application.port.in.GetCategoriesUseCase;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for category endpoints.
 */
@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    private final GetCategoriesUseCase getCategoriesUseCase;
    private final CreateCategoryUseCase createCategoryUseCase;

    public CategoryController(GetCategoriesUseCase getCategoriesUseCase,
                              CreateCategoryUseCase createCategoryUseCase) {
        this.getCategoriesUseCase = getCategoriesUseCase;
        this.createCategoryUseCase = createCategoryUseCase;
    }

    @GetMapping
    public ResponseEntity<List<CategoryResponse>> getCategories() {
        return ResponseEntity.ok(getCategoriesUseCase.getCategories());
    }

    @GetMapping("/check")
    public ResponseEntity<CategoryCheckResultResponse> checkCategory(@RequestParam("name") String name) {
        return ResponseEntity.ok(createCategoryUseCase.checkCategory(name));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CategoryResponse> getCategoryById(@PathVariable int id) {
        return ResponseEntity.ok(getCategoriesUseCase.getCategoryById(id));
    }

    @PostMapping
    public ResponseEntity<CategoryResponse> createCategory(@Valid @RequestBody CreateCategoryRequest request) {
        CategoryResponse response = createCategoryUseCase.createCategory(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
