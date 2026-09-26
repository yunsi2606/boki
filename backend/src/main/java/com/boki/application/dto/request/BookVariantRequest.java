package com.boki.application.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.Map;

public record BookVariantRequest(
        String id,
        String sku,
        @NotBlank(message = "Variant name is required")
        String name,
        @NotNull(message = "Variant price is required")
        BigDecimal price,
        BigDecimal originalPrice,
        int stockQuantity,
        Integer maxOrderQuantity,
        String imageUrl,
        Map<String, String> attributes,
        String attributesJson,
        Boolean isStandaloneDisplay
) {
}
