package com.boki.application.dto.response;

import com.boki.domain.model.flashsale.FlashSaleStatus;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public record FlashSaleResponse(
        UUID id,
        String name,
        String description,
        String bannerUrl,
        OffsetDateTime startTime,
        OffsetDateTime endTime,
        FlashSaleStatus status,
        int totalItems,
        int totalQuantityLimit,
        int totalSoldQuantity,
        List<FlashSaleItemResponse> items,
        OffsetDateTime createdAt
) {
}
