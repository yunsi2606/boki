package com.boki.application.dto.response;

public record PrintWaybillResponse(
        String orderCode,
        String carrierName,
        String printUrl,
        String paperSize,
        String token
) {}
