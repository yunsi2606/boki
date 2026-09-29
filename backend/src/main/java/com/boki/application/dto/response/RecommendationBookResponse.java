package com.boki.application.dto.response;

import java.math.BigDecimal;

public record RecommendationBookResponse(
        BookResponse book,
        BigDecimal matchScore,
        String reasonCode,
        String reasonLabel,
        String strategy
) {
}
