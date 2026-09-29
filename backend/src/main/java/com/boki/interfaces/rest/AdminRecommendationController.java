package com.boki.interfaces.rest;

import com.boki.application.dto.response.RecommendationMetricsResponse;
import com.boki.application.port.in.ManageRecommendationUseCase;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/recommendations")
public class AdminRecommendationController {

    private final ManageRecommendationUseCase manageRecommendationUseCase;

    public AdminRecommendationController(ManageRecommendationUseCase manageRecommendationUseCase) {
        this.manageRecommendationUseCase = manageRecommendationUseCase;
    }

    @GetMapping("/metrics")
    public ResponseEntity<RecommendationMetricsResponse> getMetrics(
            @RequestParam(defaultValue = "30") int days
    ) {
        return ResponseEntity.ok(manageRecommendationUseCase.getMetrics(days));
    }

    @PostMapping("/recompute")
    public ResponseEntity<String> recomputeModels() {
        manageRecommendationUseCase.recomputeAllModels();
        return ResponseEntity.ok("Recommendation models recomputation triggered successfully");
    }
}
