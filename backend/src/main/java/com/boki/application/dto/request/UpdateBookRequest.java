package com.boki.application.dto.request;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.util.List;

public record UpdateBookRequest(
        String title,
        String author,
        String isbn,
        String description,

        @DecimalMin(value = "0.0", inclusive = true, message = "Price must be non-negative")
        BigDecimal price,

        String condition,

        @Min(value = 0, message = "Stock quantity must be non-negative")
        Integer stockQuantity,

        Integer categoryId,
        
        List<String> imageUrls
) {
}
