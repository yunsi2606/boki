package com.boki.application.port.in;

import com.boki.application.dto.request.TrackRecommendationEventRequest;
import com.boki.application.dto.response.FrequentlyBoughtTogetherResponse;
import com.boki.application.dto.response.RecommendationBookResponse;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public interface GetRecommendationsUseCase {

    List<RecommendationBookResponse> getPersonalized(String userEmail, String sessionId, int limit);

    List<RecommendationBookResponse> getSimilarBooks(String idOrSlug, int limit);

    FrequentlyBoughtTogetherResponse getFrequentlyBoughtTogether(String idOrSlug);

    List<RecommendationBookResponse> getCartAddons(List<UUID> bookIds, BigDecimal cartTotal, int limit);

    List<RecommendationBookResponse> getTrending(int days, int limit);

    void trackInteraction(TrackRecommendationEventRequest request, String userEmail);
}
