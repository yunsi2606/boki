package com.boki.application.dto.excel;

import java.util.List;

public record BookExcelImportResultResponse(
        int totalRows,
        int totalBooks,
        int validBooksCount,
        int errorCount,
        List<BookExcelRowError> errors,
        List<BookExcelGroupedBook> books,
        boolean isDryRun
) {}
