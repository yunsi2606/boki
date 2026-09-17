package com.boki.application.dto.request;

import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record UpdateOrderCodRequest(
        @NotNull(message = "Số tiền COD không được để trống")
        BigDecimal codAmount
) {}
