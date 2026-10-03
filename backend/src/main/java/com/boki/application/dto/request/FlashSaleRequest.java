package com.boki.application.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.time.OffsetDateTime;
import java.util.List;

public record FlashSaleRequest(
        @NotBlank(message = "Tên chiến dịch không được để trống")
        String name,

        String description,
        String bannerUrl,

        @NotNull(message = "Thời gian bắt đầu không được để trống")
        OffsetDateTime startTime,

        @NotNull(message = "Thời gian kết thúc không được để trống")
        OffsetDateTime endTime,

        @NotEmpty(message = "Cần chọn ít nhất một sách tham gia Flash Sale")
        List<FlashSaleItemRequest> items
) {
}
