package com.boki.application.chat.tools.client;

import com.boki.domain.chat.model.ChatAction;
import com.boki.domain.chat.model.ChatActionType;
import com.boki.domain.chat.tool.*;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.*;

@Component
public class CheckShippingFeeTool implements ChatTool {

    private static final BigDecimal FREESHIP_THRESHOLD = new BigDecimal("250000");

    @Override
    public String getName() {
        return "checkShippingFee";
    }

    @Override
    public ToolMetadata getMetadata() {
        return ToolMetadata.client(
                "checkShippingFee",
                "Tính toán phí giao hàng dự kiến và kiểm tra điều kiện Miễn phí vận chuyển (FREESHIP).",
                Map.of(
                        "orderTotal", "Tổng giá trị đơn hàng (VND)",
                        "province", "Tỉnh/Thành phố nhận hàng (e.g. 'Hà Nội', 'TP. Hồ Chí Minh')",
                        "isExpress", "Có yêu cầu giao hỏa tốc 2-4h không (true/false)"
                ),
                List.of()
        );
    }

    @Override
    public ToolPermission getRequiredPermission() {
        return ToolPermission.PUBLIC;
    }

    @Override
    public ToolResult execute(ToolExecutionContext context, Map<String, Object> params) {
        BigDecimal orderTotal = BigDecimal.ZERO;
        if (params != null && params.get("orderTotal") != null) {
            try {
                orderTotal = new BigDecimal(params.get("orderTotal").toString());
            } catch (Exception ignored) {}
        }

        String province = params != null && params.get("province") != null ? params.get("province").toString().toLowerCase().trim() : "";
        boolean isExpress = params != null && Boolean.parseBoolean(String.valueOf(params.get("isExpress")));

        BigDecimal baseFee;
        String estimatedTime;

        if (isExpress) {
            baseFee = new BigDecimal("40000");
            estimatedTime = "2 - 4 giờ (Nội thành Hà Nội & TP.HCM)";
        } else if (province.contains("hà nội") || province.contains("hồ chí minh") || province.contains("hcm")) {
            baseFee = new BigDecimal("22000");
            estimatedTime = "1 - 2 ngày làm việc";
        } else {
            baseFee = new BigDecimal("30000");
            estimatedTime = "2 - 4 ngày làm việc";
        }

        BigDecimal finalFee = baseFee;
        boolean isFreeship = false;
        BigDecimal neededForFreeship = BigDecimal.ZERO;

        if (!isExpress && orderTotal.compareTo(FREESHIP_THRESHOLD) >= 0) {
            finalFee = BigDecimal.ZERO;
            isFreeship = true;
        } else if (!isExpress) {
            neededForFreeship = FREESHIP_THRESHOLD.subtract(orderTotal);
        }

        Map<String, Object> feeData = new LinkedHashMap<>();
        feeData.put("shippingFee", finalFee);
        feeData.put("isFreeship", isFreeship);
        feeData.put("freeshipThreshold", FREESHIP_THRESHOLD);
        feeData.put("neededForFreeship", neededForFreeship);
        feeData.put("estimatedTime", estimatedTime);

        StringBuilder sb = new StringBuilder();
        if (isFreeship) {
            sb.append("🎉 Đơn hàng của bạn đã đạt điều kiện **MIỄN PHÍ VẬN CHUYỂN** (Áp dụng cho đơn từ 250.000 ₫)!");
        } else if (neededForFreeship.compareTo(BigDecimal.ZERO) > 0) {
            sb.append(String.format("Phí giao hàng dự kiến: **%,.0f ₫** (%s).\n💡 Mẹo tiết kiệm: Bạn chỉ cần mua thêm **%,.0f ₫** nữa là được **FREESHIP** toàn quốc!",
                    finalFee.doubleValue(), estimatedTime, neededForFreeship.doubleValue()));
        } else {
            sb.append(String.format("Phí giao hàng dự kiến: **%,.0f ₫** (Thời gian nhận hàng: %s). Miễn phí ship cho đơn từ 250.000 ₫.",
                    finalFee.doubleValue(), estimatedTime));
        }

        return ToolResult.ok(sb.toString(), feeData, ChatActionType.NONE, List.of(feeData), List.of(
                ChatAction.of(ChatActionType.NAVIGATE, "Xem giỏ hàng", Map.of("path", "/cart"))
        ));
    }
}
