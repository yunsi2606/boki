package com.boki.application.dto.response;

import java.util.List;

public record CategoryCheckResultResponse(
        boolean isValid,
        String suitabilityMessage,
        boolean isExactDuplicate,
        List<CategoryResponse> similarCategories
) {}
