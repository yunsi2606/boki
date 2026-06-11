package com.boki.application.dto.request;

import jakarta.validation.constraints.*;
import java.util.UUID;

public record OrderItemRequest(
        @NotNull(message = "Book ID is required")
        UUID bookId,

        @Min(value = 1, message = "Quantity must be at least 1")
        int quantity
) {
}
