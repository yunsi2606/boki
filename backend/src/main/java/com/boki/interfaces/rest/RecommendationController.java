package com.boki.interfaces.rest;

import com.boki.application.dto.request.CartAddonsRequest;
import com.boki.application.dto.request.TrackRecommendationEventRequest;
import com.boki.application.dto.response.FrequentlyBoughtTogetherResponse;
import com.boki.application.dto.response.RecommendationBookResponse;
import com.boki.application.port.in.GetRecommendationsUseCase;
import com.boki.infrastructure.security.AuthenticatedUser;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recommendations")
public class RecommendationController {

    private final GetRecommendationsUseCase getRecommendationsUseCase;

    public RecommendationController(GetRecommendationsUseCase getRecommendationsUseCase) {
        this.getRecommendationsUseCase = getRecommendationsUseCase;
    }

    @GetMapping("/personalized")
    public ResponseEntity<List<RecommendationBookResponse>> getPersonalized(
            @RequestParam(required = false) String sessionId,
            @RequestParam(defaultValue = "10") int limit,
            @AuthenticationPrincipal AuthenticatedUser principal
    ) {
        String userEmail = principal != null ? principal.email() : null;
        return ResponseEntity.ok(getRecommendationsUseCase.getPersonalized(userEmail, sessionId, limit));
    }

    @GetMapping("/similar/{idOrSlug}")
    public ResponseEntity<List<RecommendationBookResponse>> getSimilar(
            @PathVariable String idOrSlug,
            @RequestParam(defaultValue = "8") int limit
    ) {
        return ResponseEntity.ok(getRecommendationsUseCase.getSimilarBooks(idOrSlug, limit));
    }

    @GetMapping("/frequently-bought-together/{idOrSlug}")
    public ResponseEntity<FrequentlyBoughtTogetherResponse> getFrequentlyBoughtTogether(
            @PathVariable String idOrSlug
    ) {
        return ResponseEntity.ok(getRecommendationsUseCase.getFrequentlyBoughtTogether(idOrSlug));
    }

    @PostMapping("/cart-addons")
    public ResponseEntity<List<RecommendationBookResponse>> getCartAddons(
            @RequestBody CartAddonsRequest request
    ) {
        int limit = request.limit() > 0 ? request.limit() : 6;
        return ResponseEntity.ok(getRecommendationsUseCase.getCartAddons(request.bookIds(), request.cartTotal(), limit));
    }

    @GetMapping("/trending")
    public ResponseEntity<List<RecommendationBookResponse>> getTrending(
            @RequestParam(defaultValue = "7") int days,
            @RequestParam(defaultValue = "12") int limit
    ) {
        return ResponseEntity.ok(getRecommendationsUseCase.getTrending(days, limit));
    }

    @PostMapping("/track-interaction")
    public ResponseEntity<Void> trackInteraction(
            @Valid @RequestBody TrackRecommendationEventRequest request,
            @AuthenticationPrincipal AuthenticatedUser principal
    ) {
        String userEmail = principal != null ? principal.email() : null;
        getRecommendationsUseCase.trackInteraction(request, userEmail);
        return ResponseEntity.ok().build();
    }
}
