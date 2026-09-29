package com.boki.application.dto.request;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record CartAddonsRequest(
        List<UUID> bookIds,
        BigDecimal cartTotal,
        int limit
) {
}
