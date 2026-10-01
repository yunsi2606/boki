package com.boki.application.dto.request;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public record UpdateBookRequest(
        String title,
        String author,
        String isbn,
        String description,
        Map<String, String> publicationDetails,

        @DecimalMin(value = "0.0", inclusive = true, message = "Price must be non-negative")
        BigDecimal price,

        @DecimalMin(value = "0.0", inclusive = true, message = "Original price must be non-negative")
        BigDecimal originalPrice,

        String condition,

        @Min(value = 0, message = "Stock quantity must be non-negative")
        Integer stockQuantity,

        Integer maxOrderQuantity,

        Integer categoryId,
        List<Integer> categoryIds,
        
        List<String> imageUrls,

        Boolean isPreOrder,
        Integer preOrderDays
) {
        public List<Integer> effectiveCategoryIds() {
                if (categoryIds != null && !categoryIds.isEmpty()) {
                        return categoryIds;
                }
                if (categoryId != null) {
                        return List.of(categoryId);
                }
                return null;
        }

        public Integer effectivePrimaryCategoryId() {
                if (categoryId != null) return categoryId;
                if (categoryIds != null && !categoryIds.isEmpty()) return categoryIds.get(0);
                return null;
        }
}
