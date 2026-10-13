package com.boki.application.dto.excel;

public record BookExcelRowError(
        int rowNumber,
        String title,
        String field,
        String errorMessage
) {}
