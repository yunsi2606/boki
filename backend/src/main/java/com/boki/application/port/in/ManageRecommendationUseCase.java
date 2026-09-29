package com.boki.application.port.in;

import com.boki.application.dto.response.RecommendationMetricsResponse;

public interface ManageRecommendationUseCase {

    RecommendationMetricsResponse getMetrics(int days);

    void recomputeAllModels();
}
