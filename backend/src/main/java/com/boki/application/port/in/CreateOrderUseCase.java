package com.boki.application.port.in;

import com.boki.application.dto.request.CreateOrderRequest;
import com.boki.application.dto.response.OrderResponse;

import com.boki.application.dto.request.CalculatePricingRequest;
import com.boki.application.dto.response.PricingResponse;

public interface CreateOrderUseCase {

    OrderResponse createOrder(CreateOrderRequest request, String buyerEmail);

    PricingResponse calculatePricing(CalculatePricingRequest request, String buyerEmail);
}
