package com.boki.application.dto.request;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.util.List;

public record CreateBookRequest(
        @NotBlank(message = "Title is required")
        String title,

        @NotBlank(message = "Author is required")
        String author,

        String isbn,
        String publisher,
        String supplier,
        Integer publicationYear,
        String language,
        String format,
        Integer numberOfPages,
        Integer weightGrams,
        String dimensions,
        String translator,
        String description,

        @NotNull(message = "Price is required")
        @DecimalMin(value = "0.0", inclusive = true, message = "Price must be non-negative")
        BigDecimal price,

        @NotBlank(message = "Condition is required (NEW, LIKE_NEW, GOOD, FAIR, POOR)")
        String condition,

        @Min(value = 0, message = "Stock quantity must be non-negative")
        int stockQuantity,

        Integer categoryId,

        List<String> imageUrls
) {
}
