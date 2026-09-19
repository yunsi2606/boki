package com.boki.interfaces.rest;

import com.boki.application.dto.response.ActivityAnalyticsResponse;
import com.boki.application.dto.response.UserActivityResponse;
import com.boki.application.service.UserActivityApplicationService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * Admin endpoints for querying activity logs, funnel metrics, and user journeys.
 */
@RestController
@RequestMapping("/api/admin/activities")
public class AdminActivityController {

    private final UserActivityApplicationService activityService;

    public AdminActivityController(UserActivityApplicationService activityService) {
        this.activityService = activityService;
    }

    @GetMapping
    public ResponseEntity<Page<UserActivityResponse>> getActivities(
            @RequestParam(required = false) String eventType,
            @RequestParam(required = false) String eventCategory,
            @RequestParam(required = false) String sessionId,
            @RequestParam(required = false) UUID userId,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant fromTime,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant toTime,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, Math.min(100, Math.max(1, size)), Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<UserActivityResponse> result = activityService.searchActivities(
                eventType, eventCategory, sessionId, userId, search, fromTime, toTime, pageable
        );
        return ResponseEntity.ok(result);
    }

    @GetMapping("/analytics")
    public ResponseEntity<ActivityAnalyticsResponse> getAnalytics() {
        ActivityAnalyticsResponse response = activityService.getAnalytics();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/sessions/{sessionId}")
    public ResponseEntity<List<UserActivityResponse>> getSessionJourney(@PathVariable String sessionId) {
        List<UserActivityResponse> journey = activityService.getSessionJourney(sessionId);
        return ResponseEntity.ok(journey);
    }
}
