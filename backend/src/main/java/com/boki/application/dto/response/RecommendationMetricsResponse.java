package com.boki.application.dto.response;

import java.util.List;

public record RecommendationMetricsResponse(
        long totalImpressions,
        long totalClicks,
        double overallCtr,
        long totalCartConversions,
        long totalOrderConversions,
        double overallConversionRate,
        List<WidgetMetricItem> widgetMetrics
) {
    public record WidgetMetricItem(
            String widgetType,
            long impressions,
            long clicks,
            double ctr,
            long cartConversions,
            long orderConversions,
            double conversionRate
    ) {}
}
