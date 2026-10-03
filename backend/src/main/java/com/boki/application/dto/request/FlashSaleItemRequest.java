package com.boki.application.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.UUID;

public record FlashSaleItemRequest(
        @NotNull(message = "bookId không được để trống")
        UUID bookId,

        @NotNull(message = "Giá gốc không được để trống")
        @DecimalMin(value = "0.0", inclusive = false, message = "Giá gốc phải lớn hơn 0")
        BigDecimal originalPrice,

        @NotNull(message = "Giá Flash Sale không được để trống")
        @DecimalMin(value = "0.0", inclusive = false, message = "Giá Flash Sale phải lớn hơn 0")
        BigDecimal flashSalePrice,

        @Min(value = 1, message = "Số lượng mở bán tối thiểu là 1")
        int quantityLimit,

        @Min(value = 1, message = "Giới hạn mua mỗi khách tối thiểu là 1")
        int userLimit
) {
}
