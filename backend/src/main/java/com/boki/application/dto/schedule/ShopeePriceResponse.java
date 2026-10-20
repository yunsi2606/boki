package com.boki.application.dto.schedule;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShopeePriceResponse {
    private boolean success;
    private Long shopId;
    private Long itemId;
    private String productName;
    private String storeName;
    private BigDecimal price;
    private BigDecimal priceBeforeDiscount;
    private Integer historicalSold;
    private String productUrl;
    private String message;
}
