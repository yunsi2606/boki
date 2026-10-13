package com.boki.application.dto.excel;

import java.math.BigDecimal;

public record BookExcelVariantData(
        int rowNumber,
        String name,
        String sku,
        BigDecimal price,
        BigDecimal originalPrice,
        int stockQuantity,
        String imageRef,
        String resolvedImageUrl
) {
    public BookExcelVariantData withResolvedImage(String r2Url) {
        return new BookExcelVariantData(rowNumber, name, sku, price, originalPrice, stockQuantity, imageRef, r2Url);
    }
}
