package com.boki.application.dto.schedule;

import jakarta.validation.constraints.NotBlank;
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
public class ReleaseStoreLinkRequest {
    private UUID id;
    private UUID editionId;
    @NotBlank(message = "Nền tảng sàn không được để trống")
    private String platform;
    private String storeName;
    @NotBlank(message = "Đường dẫn sản phẩm không được để trống")
    private String productUrl;
    private BigDecimal marketPrice;
    private Boolean isPreorder;
    private Integer sortOrder;
}
