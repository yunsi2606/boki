package com.boki.application.dto.response;

import com.boki.domain.model.flashsale.FlashSaleStatus;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public record PublicFlashSaleResponse(
        UUID id,
        String name,
        OffsetDateTime startTime,
        OffsetDateTime endTime,
        FlashSaleStatus status,
        long remainingSeconds,
        List<FlashSaleItemResponse> items
) {
}
