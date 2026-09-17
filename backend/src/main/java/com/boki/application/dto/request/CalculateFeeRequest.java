package com.boki.application.dto.request;

import com.boki.domain.model.order.ShippingCarrier;

public record CalculateFeeRequest(
        ShippingCarrier carrier,
        Integer weightGrams,
        Integer toDistrictId,
        String toWardCode,
        String toProvinceName,
        String toDistrictName,
        String toWardName
) {}
