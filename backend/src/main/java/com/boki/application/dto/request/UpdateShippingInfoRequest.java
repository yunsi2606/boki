package com.boki.application.dto.request;

public record UpdateShippingInfoRequest(
        String toName,
        String toPhone,
        String toAddress,
        String toWardName,
        String toDistrictName,
        String toProvinceName,
        String notes,
        Integer weightGrams
) {}
