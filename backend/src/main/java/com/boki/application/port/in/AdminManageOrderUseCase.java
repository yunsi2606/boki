package com.boki.application.port.in;

import com.boki.application.dto.request.CalculateFeeRequest;
import com.boki.application.dto.request.PushShippingRequest;
import com.boki.application.dto.request.UpdateShippingInfoRequest;
import com.boki.application.dto.response.CarrierFeeEstimateResponse;
import com.boki.application.dto.response.OrderResponse;
import com.boki.application.dto.response.OrderTimelineResponse;
import com.boki.application.dto.response.PrintWaybillResponse;
import com.boki.domain.model.order.OrderStatus;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public interface AdminManageOrderUseCase {

    List<OrderResponse> getAllOrdersForAdmin(OrderStatus status, String search, int page, int size);

    OrderResponse updateOrderStatus(UUID orderId, OrderStatus newStatus, String reason, String actor);

    OrderResponse pushOrderToCarrier(UUID orderId, PushShippingRequest request, String actor);

    OrderResponse cancelOrder(UUID orderId, String reason, String actor);

    List<OrderTimelineResponse> getOrderTimelines(UUID orderId);

    PrintWaybillResponse getPrintWaybillUrl(UUID orderId, String paperSize);

    OrderResponse cancelOrderWithCarrier(UUID orderId, String reason, String actor);

    OrderResponse returnOrderWithCarrier(UUID orderId, String reason, String actor);

    OrderResponse updateOrderCod(UUID orderId, BigDecimal newCod, String actor);

    OrderResponse updateOrderShippingInfo(UUID orderId, UpdateShippingInfoRequest request, String actor);

    CarrierFeeEstimateResponse estimateCarrierFee(CalculateFeeRequest request);

    OrderResponse processCarrierWebhook(com.boki.application.dto.request.GhnWebhookPayload payload);
}
