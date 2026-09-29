package com.boki.application.mapper;

import com.boki.application.dto.response.ComboItemResponse;
import com.boki.infrastructure.persistence.entity.BookComboItemJpaEntity;
import com.boki.infrastructure.persistence.entity.BookJpaEntity;
import com.boki.infrastructure.persistence.entity.BookVariantJpaEntity;
import com.boki.infrastructure.util.SlugUtils;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

@Component
public class ComboDtoMapper {

    public List<ComboItemResponse> toComboItemResponses(List<BookComboItemJpaEntity> entities) {
        if (entities == null || entities.isEmpty()) {
            return List.of();
        }
        List<ComboItemResponse> responses = new ArrayList<>();
        for (BookComboItemJpaEntity item : entities) {
            BookJpaEntity single = item.getSingleBook();
            BookVariantJpaEntity variant = item.getVariant();
            if (single == null) continue;

            String cover = null;
            if (variant != null && variant.getImageUrl() != null && !variant.getImageUrl().isBlank()) {
                cover = variant.getImageUrl();
            } else if (single.getImages() != null && !single.getImages().isEmpty()) {
                cover = single.getImages().get(0).getImageUrl();
            }

            BigDecimal price = variant != null ? variant.getPrice() : single.getPrice();
            BigDecimal origPrice = variant != null ? variant.getOriginalPrice() : single.getOriginalPrice();
            int stock = variant != null ? variant.getStockQuantity() : single.getStockQuantity();

            responses.add(new ComboItemResponse(
                    item.getId(),
                    single.getId(),
                    variant != null ? variant.getId() : null,
                    variant != null ? variant.getName() : null,
                    single.getTitle(),
                    SlugUtils.slugify(single.getTitle()),
                    single.getAuthor(),
                    price,
                    origPrice,
                    cover,
                    item.getQuantity(),
                    stock
            ));
        }
        return responses;
    }

    public BigDecimal calculateOriginalTotal(List<ComboItemResponse> items) {
        if (items == null || items.isEmpty()) return BigDecimal.ZERO;
        BigDecimal total = BigDecimal.ZERO;
        for (ComboItemResponse it : items) {
            if (it.price() != null) {
                total = total.add(it.price().multiply(BigDecimal.valueOf(it.quantity())));
            }
        }
        return total;
    }

    public BigDecimal calculateSavingsAmount(BigDecimal originalTotal, BigDecimal comboPrice) {
        if (originalTotal == null || comboPrice == null) return BigDecimal.ZERO;
        BigDecimal savings = originalTotal.subtract(comboPrice);
        return savings.compareTo(BigDecimal.ZERO) > 0 ? savings : BigDecimal.ZERO;
    }

    public Integer calculateSavingsPercent(BigDecimal originalTotal, BigDecimal savingsAmount) {
        if (originalTotal == null || originalTotal.compareTo(BigDecimal.ZERO) <= 0
                || savingsAmount == null || savingsAmount.compareTo(BigDecimal.ZERO) <= 0) {
            return 0;
        }
        return savingsAmount.multiply(BigDecimal.valueOf(100))
                .divide(originalTotal, 0, RoundingMode.HALF_UP)
                .intValue();
    }
}
