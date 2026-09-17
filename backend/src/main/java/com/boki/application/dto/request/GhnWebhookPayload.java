package com.boki.application.dto.request;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public record GhnWebhookPayload(
        @JsonProperty("ShopID")
        @JsonAlias({"shop_id", "shopId"})
        Integer shopId,

        @JsonProperty("Time")
        @JsonAlias({"time", "action_time"})
        String time,

        @JsonProperty("OrderCode")
        @JsonAlias({"order_code", "orderCode"})
        String orderCode,

        @JsonProperty("ClientOrderCode")
        @JsonAlias({"client_order_code", "clientOrderCode"})
        String clientOrderCode,

        @JsonProperty("Type")
        @JsonAlias({"type", "event_type"})
        String type,

        @JsonProperty("Description")
        @JsonAlias({"description", "desc"})
        String description,

        @JsonProperty("Status")
        @JsonAlias({"status", "order_status"})
        String status,

        @JsonProperty("Reason")
        @JsonAlias({"reason", "cancel_reason"})
        String reason,

        @JsonProperty("ReasonCode")
        @JsonAlias({"reason_code", "reasonCode"})
        String reasonCode,

        @JsonProperty("CODAmount")
        @JsonAlias({"cod_amount", "codAmount"})
        Long codAmount,

        @JsonProperty("CODTransferDate")
        @JsonAlias({"cod_transfer_date", "codTransferDate"})
        String codTransferDate,

        @JsonProperty("Weight")
        @JsonAlias({"weight"})
        Integer weight,

        @JsonProperty("ConvertedWeight")
        @JsonAlias({"converted_weight", "convertedWeight"})
        Integer convertedWeight,

        @JsonProperty("Length")
        @JsonAlias({"length"})
        Integer length,

        @JsonProperty("Width")
        @JsonAlias({"width"})
        Integer width,

        @JsonProperty("Height")
        @JsonAlias({"height"})
        Integer height,

        @JsonProperty("PaymentType")
        @JsonAlias({"payment_type", "paymentType"})
        Integer paymentType,

        @JsonProperty("IsPartialReturn")
        @JsonAlias({"is_partial_return", "isPartialReturn"})
        Boolean isPartialReturn,

        @JsonProperty("PartialReturnCode")
        @JsonAlias({"partial_return_code", "partialReturnCode"})
        String partialReturnCode,

        @JsonProperty("TotalFee")
        @JsonAlias({"total_fee", "totalFee"})
        Long totalFee,

        @JsonProperty("Warehouse")
        @JsonAlias({"warehouse"})
        String warehouse,

        @JsonProperty("ShipperName")
        @JsonAlias({"shipper_name", "shipperName"})
        String shipperName,

        @JsonProperty("ShipperPhone")
        @JsonAlias({"shipper_phone", "shipperPhone"})
        String shipperPhone,

        @JsonProperty("PodURL")
        @JsonAlias({"pod_url", "podUrl", "pod_link"})
        String podUrl
) {
}
