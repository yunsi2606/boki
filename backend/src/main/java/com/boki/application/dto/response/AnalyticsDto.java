package com.boki.application.dto.response;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public class AnalyticsDto {

    public record DailyRevenuePoint(
            String date,
            BigDecimal revenue,
            long ordersCount
    ) {}

    public record CategoryRevenueShare(
            String categoryName,
            BigDecimal revenue,
            long unitsSold,
            double percentage
    ) {}

    public record TopSellingBook(
            UUID bookId,
            String title,
            String author,
            String coverUrl,
            long unitsSold,
            BigDecimal revenue
    ) {}

    public record RevenueTrendsResponse(
            int days,
            BigDecimal totalRevenuePeriod,
            long totalOrdersPeriod,
            List<DailyRevenuePoint> timeline
    ) {}
}
