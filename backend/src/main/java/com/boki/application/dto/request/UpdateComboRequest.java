package com.boki.application.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.List;

public record UpdateComboRequest(
        @NotBlank(message = "Tên combo không được để trống")
        String title,

        String description,

        Integer categoryId,

        @NotNull(message = "Giá combo không được để trống")
        BigDecimal price,

        Integer stockQuantity,

        List<String> imageUrls,

        String status,

        @NotEmpty(message = "Combo phải có ít nhất một sản phẩm")
        List<ComboItemInput> items
) {
}
