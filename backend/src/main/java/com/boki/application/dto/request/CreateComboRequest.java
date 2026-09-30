package com.boki.application.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.List;

public record CreateComboRequest(
        @NotBlank(message = "Tên combo không được để trống")
        String title,

        String description,

        Integer categoryId,
        List<Integer> categoryIds,

        @NotNull(message = "Giá combo không được để trống")
        BigDecimal price,

        Integer stockQuantity,

        List<String> imageUrls,

        @NotEmpty(message = "Combo phải có ít nhất một sản phẩm")
        List<ComboItemInput> items
) {
        public List<Integer> effectiveCategoryIds() {
                if (categoryIds != null && !categoryIds.isEmpty()) {
                        return categoryIds;
                }
                if (categoryId != null) {
                        return List.of(categoryId);
                }
                return List.of();
        }

        public Integer effectivePrimaryCategoryId() {
                if (categoryId != null) return categoryId;
                if (categoryIds != null && !categoryIds.isEmpty()) return categoryIds.get(0);
                return null;
        }
}
