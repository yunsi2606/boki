package com.boki.application.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record TrackRecommendationEventRequest(
        @NotBlank(message = "Session ID is required")
        String sessionId,

        @NotNull(message = "Book ID is required")
        UUID bookId,

        @NotBlank(message = "Widget type is required")
        String widgetType,

        @NotBlank(message = "Event action is required")
        String eventAction, // IMPRESSION, CLICK, ADD_TO_CART, ORDER

        Integer positionIndex
) {
}
