package com.boki.application.dto.request;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public record CreateBookRequest(
        @NotBlank(message = "Title is required")
        String title,

        @NotBlank(message = "Author is required")
        String author,

        String isbn,
        String description,
        Map<String, String> publicationDetails,

        @NotNull(message = "Price is required")
        @DecimalMin(value = "0.0", inclusive = true, message = "Price must be non-negative")
        BigDecimal price,

        @DecimalMin(value = "0.0", inclusive = true, message = "Original price must be non-negative")
        BigDecimal originalPrice,

        @NotBlank(message = "Condition is required (NEW, LIKE_NEW, GOOD, FAIR, POOR)")
        String condition,

        @Min(value = 0, message = "Stock quantity must be non-negative")
        int stockQuantity,

        Integer maxOrderQuantity,

        Integer categoryId,
        List<Integer> categoryIds,

        List<String> imageUrls,
        String categoryCoverUrl,

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
                return List.of();
        }

        public Integer effectivePrimaryCategoryId() {
                if (categoryId != null) return categoryId;
                if (categoryIds != null && !categoryIds.isEmpty()) return categoryIds.get(0);
                return null;
        }
}
