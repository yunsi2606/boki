package com.boki.application.dto.schedule;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReleaseStoreLinkDto {
    private UUID id;
    private UUID scheduleId;
    private UUID editionId;
    private String platform;
    private String storeName;
    private String productUrl;
    private BigDecimal marketPrice;
    private Boolean isPreorder;
    private Integer sortOrder;
}
