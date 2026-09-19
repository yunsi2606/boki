package com.boki.interfaces.rest;

import com.boki.application.dto.request.BatchActivityRequest;
import com.boki.application.dto.request.RecordActivityRequest;
import com.boki.application.service.UserActivityApplicationService;
import com.boki.infrastructure.security.AuthenticatedUser;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Public endpoint for ingesting user behavior events from browser clients and sendBeacon.
 */
@RestController
@RequestMapping("/api/activities")
public class ActivityTrackingController {

    private final UserActivityApplicationService activityService;

    public ActivityTrackingController(UserActivityApplicationService activityService) {
        this.activityService = activityService;
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> recordActivity(
            @Valid @RequestBody RecordActivityRequest request,
            @AuthenticationPrincipal AuthenticatedUser principal,
            HttpServletRequest servletRequest
    ) {
        String ipAddress = UserActivityApplicationService.extractClientIp(servletRequest);
        String userAgent = servletRequest.getHeader("User-Agent");

        activityService.recordActivityAsync(request, principal, ipAddress, userAgent);
        return ResponseEntity.ok(Map.of("status", "recorded"));
    }

    @PostMapping("/batch")
    public ResponseEntity<Map<String, Object>> recordBatch(
            @Valid @RequestBody BatchActivityRequest request,
            @AuthenticationPrincipal AuthenticatedUser principal,
            HttpServletRequest servletRequest
    ) {
        String ipAddress = UserActivityApplicationService.extractClientIp(servletRequest);
        String userAgent = servletRequest.getHeader("User-Agent");

        activityService.recordBatchAsync(request, principal, ipAddress, userAgent);
        return ResponseEntity.ok(Map.of("status", "batch_accepted", "count", request.events() != null ? request.events().size() : 0));
    }
}
