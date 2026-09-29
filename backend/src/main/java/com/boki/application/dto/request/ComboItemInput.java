package com.boki.application.dto.request;

import java.util.UUID;

public record ComboItemInput(
        UUID singleBookId,
        UUID variantId,
        int quantity,
        int sortOrder
) {
}
