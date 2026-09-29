package com.boki.application.dto.response;

import java.math.BigDecimal;
import java.util.List;

public record FrequentlyBoughtTogetherResponse(
        BookResponse mainBook,
        List<BookResponse> recommendedItems,
        BigDecimal totalRetailPrice,
        BigDecimal bundlePrice,
        BigDecimal savingsAmount,
        Integer savingsPercent
) {
}
