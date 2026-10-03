package com.boki.application.service;

import com.boki.application.dto.request.CreateCategoryRequest;
import com.boki.application.dto.response.CategoryCheckResultResponse;
import com.boki.application.dto.response.CategoryResponse;
import com.boki.application.exception.BusinessRuleException;
import com.boki.application.exception.ResourceNotFoundException;
import com.boki.application.port.in.CreateCategoryUseCase;
import com.boki.application.port.in.DeleteCategoryUseCase;
import com.boki.application.port.in.GetCategoriesUseCase;
import com.boki.domain.model.category.Category;
import com.boki.domain.port.out.CategoryRepository;
import com.boki.infrastructure.persistence.repository.BookJpaRepository;
import com.boki.infrastructure.persistence.repository.CategoryJpaRepository;
import com.boki.infrastructure.persistence.repository.VoucherJpaRepository;
import com.boki.infrastructure.util.SlugUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CategoryApplicationService implements GetCategoriesUseCase, CreateCategoryUseCase, DeleteCategoryUseCase {

    private final CategoryRepository categoryRepository;
    private final BookJpaRepository bookJpaRepository;
    private final VoucherJpaRepository voucherJpaRepository;
    private final CategoryJpaRepository categoryJpaRepository;
    private final CategorySuitabilityValidator suitabilityValidator;

    public CategoryApplicationService(CategoryRepository categoryRepository,
                                      BookJpaRepository bookJpaRepository,
                                      VoucherJpaRepository voucherJpaRepository,
                                      CategoryJpaRepository categoryJpaRepository,
                                      CategorySuitabilityValidator suitabilityValidator) {
        this.categoryRepository = categoryRepository;
        this.bookJpaRepository = bookJpaRepository;
        this.voucherJpaRepository = voucherJpaRepository;
        this.categoryJpaRepository = categoryJpaRepository;
        this.suitabilityValidator = suitabilityValidator;
    }

    @Override
    @Transactional(readOnly = true)
    public List<CategoryResponse> getCategories() {
        List<Category> categories = categoryRepository.findAll();

        // 1. Fetch real active book count per category in 1 query
        java.util.Map<Integer, Long> countMap = new java.util.HashMap<>();
        try {
            List<Object[]> counts = bookJpaRepository.countActiveBooksGroupedByCategory();
            for (Object[] row : counts) {
                if (row != null && row.length >= 2 && row[0] != null && row[1] != null) {
                    Integer catId = ((Number) row[0]).intValue();
                    Long count = ((Number) row[1]).longValue();
                    countMap.put(catId, count);
                }
            }
        } catch (Exception ignored) {}

        // 2. Fetch up to 2 clean category display covers per category in 1 query
        java.util.Map<Integer, List<String>> coversMap = new java.util.HashMap<>();
        try {
            List<Object[]> covers = bookJpaRepository.findTopCategoryDisplayCovers();
            for (Object[] row : covers) {
                if (row != null && row.length >= 2 && row[0] != null && row[1] != null) {
                    Integer catId = ((Number) row[0]).intValue();
                    String url = (String) row[1];
                    if (url != null && !url.isBlank()) {
                        coversMap.computeIfAbsent(catId, k -> new java.util.ArrayList<>()).add(url);
                    }
                }
            }
        } catch (Exception ignored) {}

        return categories.stream()
                .map(cat -> new CategoryResponse(
                        cat.getId(),
                        cat.getName(),
                        cat.getSlug(),
                        cat.getDescription(),
                        cat.getParentId(),
                        countMap.getOrDefault(cat.getId(), 0L),
                        coversMap.getOrDefault(cat.getId(), java.util.Collections.emptyList())
                ))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public CategoryResponse getCategoryById(int id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));
        return toResponse(category);
    }

    @Override
    @Transactional(readOnly = true)
    public CategoryCheckResultResponse checkCategory(String rawName) {
        List<Category> allCategories = categoryRepository.findAll();
        return suitabilityValidator.validate(rawName, allCategories);
    }

    @Override
    @Transactional
    public CategoryResponse createCategory(CreateCategoryRequest request) {
        CategoryCheckResultResponse check = checkCategory(request.name());
        if (!check.isValid()) {
            throw new BusinessRuleException(check.suitabilityMessage());
        }

        String name = request.name().trim();
        String baseSlug = SlugUtils.slugify(name);
        String finalSlug = baseSlug;

        int counter = 1;
        while (categoryRepository.existsBySlug(finalSlug)) {
            finalSlug = baseSlug + "-" + counter++;
        }

        Category category = Category.create(name, finalSlug, request.description(), request.parentId());
        Category saved = categoryRepository.save(category);
        return toResponse(saved);
    }

    @Override
    @Transactional
    public void deleteCategory(int id) {
        // Ensure category exists
        categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));

        // 1. Remove references in book_categories join table
        bookJpaRepository.removeCategoryFromBookCategories(id);

        // 2. Clear primary category reference on books (books themselves remain completely intact)
        bookJpaRepository.clearBookPrimaryCategory(id);

        // 3. Clear applicable category on vouchers
        voucherJpaRepository.clearApplicableCategory(id);

        // 4. Clear parent reference on child categories
        categoryJpaRepository.clearParentCategory(id);

        // 5. Delete category record
        categoryRepository.deleteById(id);
    }

    private CategoryResponse toResponse(Category category) {
        return new CategoryResponse(
                category.getId(),
                category.getName(),
                category.getSlug(),
                category.getDescription(),
                category.getParentId()
        );
    }
}
