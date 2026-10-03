package com.boki.application.dto.response;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public record BookResponse(
        UUID id,
        UUID sellerId,
        String sellerName,
        Integer categoryId,
        List<Integer> categoryIds,
        String title,
        String slug,
        String author,
        String isbn,
        String publisher,
        String supplier,
        Map<String, String> publicationDetails,
        String description,
        BigDecimal price,
        BigDecimal originalPrice,
        String currency,
        String condition,
        String status,
        int stockQuantity,
        Integer maxOrderQuantity,
        boolean isPreOrder,
        Integer preOrderDays,
        int viewsCount,
        BigDecimal rating,
        int reviewsCount,
        List<String> imageUrls,
        List<BookVariantResponse> variants,
        boolean isCombo,
        List<ComboItemResponse> comboItems,
        BigDecimal originalTotalAmount,
        BigDecimal savingsAmount,
        Integer savingsPercent,
        Instant createdAt,
        Instant updatedAt,
        String categoryCoverUrl
) {
    public BookResponse(
            UUID id,
            UUID sellerId,
            String sellerName,
            Integer categoryId,
            String title,
            String slug,
            String author,
            String isbn,
            String publisher,
            String supplier,
            Map<String, String> publicationDetails,
            String description,
            BigDecimal price,
            BigDecimal originalPrice,
            String currency,
            String condition,
            String status,
            int stockQuantity,
            Integer maxOrderQuantity,
            boolean isPreOrder,
            Integer preOrderDays,
            int viewsCount,
            BigDecimal rating,
            int reviewsCount,
            List<String> imageUrls,
            List<BookVariantResponse> variants,
            boolean isCombo,
            List<ComboItemResponse> comboItems,
            BigDecimal originalTotalAmount,
            BigDecimal savingsAmount,
            Integer savingsPercent,
            Instant createdAt,
            Instant updatedAt
    ) {
        this(
                id, sellerId, sellerName, categoryId,
                categoryId != null ? List.of(categoryId) : List.of(),
                title, slug, author, isbn, publisher, supplier, publicationDetails,
                description, price, originalPrice, currency, condition, status,
                stockQuantity, maxOrderQuantity, isPreOrder, preOrderDays,
                viewsCount, rating, reviewsCount, imageUrls, variants, isCombo,
                comboItems, originalTotalAmount, savingsAmount, savingsPercent,
                createdAt, updatedAt, null
        );
    }

    public BookResponse(
            UUID id,
            UUID sellerId,
            String sellerName,
            Integer categoryId,
            String title,
            String slug,
            String author,
            String isbn,
            String publisher,
            String supplier,
            Map<String, String> publicationDetails,
            String description,
            BigDecimal price,
            BigDecimal originalPrice,
            String currency,
            String condition,
            String status,
            int stockQuantity,
            Integer maxOrderQuantity,
            boolean isPreOrder,
            Integer preOrderDays,
            int viewsCount,
            BigDecimal rating,
            int reviewsCount,
            List<String> imageUrls,
            List<BookVariantResponse> variants,
            Instant createdAt,
            Instant updatedAt
    ) {
        this(
                id, sellerId, sellerName, categoryId,
                categoryId != null ? List.of(categoryId) : List.of(),
                title, slug, author, isbn, publisher, supplier, publicationDetails,
                description, price, originalPrice, currency, condition, status,
                stockQuantity, maxOrderQuantity, isPreOrder, preOrderDays,
                viewsCount, rating, reviewsCount, imageUrls, variants, false,
                List.of(), null, null, null, createdAt, updatedAt, null
        );
    }
}
