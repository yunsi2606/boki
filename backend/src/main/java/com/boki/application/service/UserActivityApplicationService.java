package com.boki.application.service;

import com.boki.application.dto.request.BatchActivityRequest;
import com.boki.application.dto.request.RecordActivityRequest;
import com.boki.application.dto.response.ActivityAnalyticsResponse;
import com.boki.application.dto.response.UserActivityResponse;
import com.boki.domain.model.activity.ActivityEventCategory;
import com.boki.domain.model.activity.ActivityEventType;
import com.boki.infrastructure.persistence.entity.UserActivityJpaEntity;
import com.boki.infrastructure.persistence.repository.UserActivityJpaRepository;
import com.boki.infrastructure.persistence.repository.UserJpaRepository;
import com.boki.infrastructure.security.AuthenticatedUser;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.concurrent.CompletableFuture;

@Service
public class UserActivityApplicationService {

    private static final Logger log = LoggerFactory.getLogger(UserActivityApplicationService.class);

    private final UserActivityJpaRepository activityRepository;
    private final UserJpaRepository userRepository;

    public UserActivityApplicationService(
            UserActivityJpaRepository activityRepository,
            UserJpaRepository userRepository
    ) {
        this.activityRepository = activityRepository;
        this.userRepository = userRepository;
    }

    /**
     * Records a single activity event asynchronously.
     */
    @Async
    @Transactional
    public CompletableFuture<Void> recordActivityAsync(
            RecordActivityRequest req,
            AuthenticatedUser principal,
            String ipAddress,
            String userAgent
    ) {
        try {
            UserActivityJpaEntity entity = buildEntity(req, principal, ipAddress, userAgent);
            activityRepository.save(entity);
        } catch (Exception e) {
            log.warn("Failed to record activity log asynchronously: {}", e.getMessage());
        }
        return CompletableFuture.completedFuture(null);
    }

    /**
     * Records a batch of activity events asynchronously (client flush/sendBeacon).
     */
    @Async
    @Transactional
    public CompletableFuture<Void> recordBatchAsync(
            BatchActivityRequest req,
            AuthenticatedUser principal,
            String ipAddress,
            String userAgent
    ) {
        try {
            if (req.events() == null || req.events().isEmpty()) {
                return CompletableFuture.completedFuture(null);
            }

            List<UserActivityJpaEntity> entities = new ArrayList<>();
            for (RecordActivityRequest eventReq : req.events()) {
                // If event does not specify sessionId, use the batch's top-level sessionId
                String resolvedSession = (eventReq.sessionId() != null && !eventReq.sessionId().isBlank())
                        ? eventReq.sessionId()
                        : req.sessionId();

                RecordActivityRequest normalizedReq = new RecordActivityRequest(
                        resolvedSession,
                        eventReq.eventType(),
                        eventReq.eventCategory(),
                        eventReq.pagePath(),
                        eventReq.pageTitle(),
                        eventReq.referrerUrl(),
                        eventReq.targetId(),
                        eventReq.targetName(),
                        eventReq.metadataJson(),
                        eventReq.durationSeconds()
                );

                entities.add(buildEntity(normalizedReq, principal, ipAddress, userAgent));
            }

            activityRepository.saveAll(entities);
        } catch (Exception e) {
            log.warn("Failed to record activity batch asynchronously: {}", e.getMessage());
        }
        return CompletableFuture.completedFuture(null);
    }

    /**
     * Search and page activity logs for Admin.
     */
    @Transactional(readOnly = true)
    public Page<UserActivityResponse> searchActivities(
            String eventType,
            String eventCategory,
            String sessionId,
            UUID userId,
            String search,
            Instant fromTime,
            Instant toTime,
            Pageable pageable
    ) {
        String normalizedEventType = (eventType != null && !eventType.isBlank() && !"ALL".equalsIgnoreCase(eventType))
                ? eventType.trim().toUpperCase() : null;
        String normalizedCategory = (eventCategory != null && !eventCategory.isBlank() && !"ALL".equalsIgnoreCase(eventCategory))
                ? eventCategory.trim().toUpperCase() : null;
        String normalizedSession = (sessionId != null && !sessionId.isBlank()) ? sessionId.trim() : null;
        String normalizedSearch = (search != null && !search.isBlank()) ? search.trim() : null;

        return activityRepository.searchActivities(
                normalizedEventType,
                normalizedCategory,
                normalizedSession,
                userId,
                normalizedSearch,
                fromTime,
                toTime,
                pageable
        ).map(this::toResponse);
    }

    /**
     * Retrieves full chronological timeline of a specific user session.
     */
    @Transactional(readOnly = true)
    public List<UserActivityResponse> getSessionJourney(String sessionId) {
        if (sessionId == null || sessionId.isBlank()) return Collections.emptyList();
        return activityRepository.findBySessionIdOrderByCreatedAtAsc(sessionId.trim())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    /**
     * Aggregates real-time statistics and conversion funnels for Admin dashboard.
     */
    @Transactional(readOnly = true)
    public ActivityAnalyticsResponse getAnalytics() {
        Instant now = Instant.now();
        Instant thirtyMinsAgo = now.minus(30, ChronoUnit.MINUTES);
        Instant startOfToday = now.truncatedTo(ChronoUnit.DAYS);

        long activeSessions30m = activityRepository.countActiveSessionsSince(thirtyMinsAgo);
        long totalEventsToday = activityRepository.countByCreatedAtAfter(startOfToday);

        long viewBookCountToday = activityRepository.countByEventTypeAndCreatedAtAfter("VIEW_BOOK", startOfToday);
        long addToCartCountToday = activityRepository.countByEventTypeAndCreatedAtAfter("ADD_TO_CART", startOfToday);
        long initiateCheckoutCountToday = activityRepository.countByEventTypeAndCreatedAtAfter("INITIATE_CHECKOUT", startOfToday);
        long placeOrderCountToday = activityRepository.countByEventTypeAndCreatedAtAfter("PLACE_ORDER", startOfToday);

        double cartConversionRate = viewBookCountToday > 0
                ? Math.round(((double) addToCartCountToday / viewBookCountToday) * 1000.0) / 10.0
                : 0.0;
        double orderConversionRate = viewBookCountToday > 0
                ? Math.round(((double) placeOrderCountToday / viewBookCountToday) * 1000.0) / 10.0
                : 0.0;

        List<String> topSearchKeywords = activityRepository.findTopSearchKeywords(PageRequest.of(0, 5))
                .stream()
                .map(row -> (String) row[0])
                .filter(Objects::nonNull)
                .toList();

        List<String> topViewedBooks = activityRepository.findTopViewedBooks(PageRequest.of(0, 5))
                .stream()
                .map(row -> (String) row[0])
                .filter(Objects::nonNull)
                .toList();

        Map<String, Long> deviceBreakdown = new LinkedHashMap<>();
        for (Object[] row : activityRepository.countByDeviceTypeSince(startOfToday)) {
            String device = row[0] != null ? (String) row[0] : "UNKNOWN";
            Long count = row[1] != null ? (Long) row[1] : 0L;
            deviceBreakdown.put(device, count);
        }

        return new ActivityAnalyticsResponse(
                activeSessions30m,
                totalEventsToday,
                viewBookCountToday,
                addToCartCountToday,
                initiateCheckoutCountToday,
                placeOrderCountToday,
                cartConversionRate,
                orderConversionRate,
                topSearchKeywords,
                topViewedBooks,
                deviceBreakdown
        );
    }

    // --- Helper builders and parsers ---

    private UserActivityJpaEntity buildEntity(
            RecordActivityRequest req,
            AuthenticatedUser principal,
            String ipAddress,
            String userAgent
    ) {
        UserActivityJpaEntity entity = new UserActivityJpaEntity();
        entity.setId(UUID.randomUUID());
        entity.setSessionId((req.sessionId() != null && !req.sessionId().isBlank())
                ? req.sessionId().trim() : UUID.randomUUID().toString());

        if (principal != null) {
            entity.setUserId(principal.userId());
            entity.setUserEmail(principal.email());
            userRepository.findById(principal.userId()).ifPresent(u -> entity.setUserRole(u.getRole().name()));
        } else {
            entity.setUserRole("GUEST");
        }

        ActivityEventType type = ActivityEventType.fromString(req.eventType());
        ActivityEventCategory category = (req.eventCategory() != null && !req.eventCategory().isBlank())
                ? ActivityEventCategory.fromString(req.eventCategory())
                : type.getDefaultCategory();

        entity.setEventType(type.name());
        entity.setEventCategory(category.name());
        entity.setPagePath(sanitize(req.pagePath(), 500));
        entity.setPageTitle(sanitize(req.pageTitle(), 255));
        entity.setReferrerUrl(sanitize(req.referrerUrl(), 500));
        entity.setTargetId(sanitize(req.targetId(), 100));
        entity.setTargetName(sanitize(req.targetName(), 255));
        entity.setMetadataJson(sanitizeMetadata(req.metadataJson()));
        entity.setIpAddress(sanitize(ipAddress, 64));
        entity.setUserAgent(userAgent);

        ParsedUserAgent parsedUa = parseUserAgent(userAgent);
        entity.setDeviceType(parsedUa.deviceType());
        entity.setBrowser(parsedUa.browser());
        entity.setOs(parsedUa.os());

        entity.setDurationSeconds(req.durationSeconds() != null ? Math.max(0, req.durationSeconds()) : 0);
        entity.setCreatedAt(Instant.now());

        return entity;
    }

    private UserActivityResponse toResponse(UserActivityJpaEntity e) {
        return new UserActivityResponse(
                e.getId(),
                e.getSessionId(),
                e.getUserId(),
                e.getUserEmail(),
                e.getUserRole(),
                e.getEventType(),
                e.getEventCategory(),
                e.getPagePath(),
                e.getPageTitle(),
                e.getReferrerUrl(),
                e.getTargetId(),
                e.getTargetName(),
                e.getMetadataJson(),
                e.getIpAddress(),
                e.getUserAgent(),
                e.getDeviceType(),
                e.getBrowser(),
                e.getOs(),
                e.getDurationSeconds(),
                e.getCreatedAt()
        );
    }

    public static String extractClientIp(HttpServletRequest request) {
        String[] headers = {
                "X-Forwarded-For",
                "Proxy-Client-IP",
                "WL-Proxy-Client-IP",
                "HTTP_CLIENT_IP",
                "HTTP_X_FORWARDED_FOR",
                "X-Real-IP"
        };
        for (String header : headers) {
            String ip = request.getHeader(header);
            if (ip != null && !ip.isEmpty() && !"unknown".equalsIgnoreCase(ip)) {
                return ip.split(",")[0].trim();
            }
        }
        return request.getRemoteAddr();
    }

    private record ParsedUserAgent(String deviceType, String browser, String os) {}

    private ParsedUserAgent parseUserAgent(String ua) {
        if (ua == null || ua.isBlank()) {
            return new ParsedUserAgent("DESKTOP", "Unknown", "Unknown");
        }
        String lower = ua.toLowerCase();

        // Device detection
        String device = "DESKTOP";
        if (lower.contains("mobile") || lower.contains("android") || lower.contains("iphone")) {
            device = "MOBILE";
        } else if (lower.contains("ipad") || lower.contains("tablet")) {
            device = "TABLET";
        }

        // Browser detection
        String browser = "Other";
        if (lower.contains("edg")) browser = "Edge";
        else if (lower.contains("chrome") && !lower.contains("edg")) browser = "Chrome";
        else if (lower.contains("safari") && !lower.contains("chrome")) browser = "Safari";
        else if (lower.contains("firefox")) browser = "Firefox";
        else if (lower.contains("opr") || lower.contains("opera")) browser = "Opera";

        // OS detection
        String os = "Other";
        if (lower.contains("windows")) os = "Windows";
        else if (lower.contains("mac os") || lower.contains("macintosh")) os = "macOS";
        else if (lower.contains("iphone") || lower.contains("ipad")) os = "iOS";
        else if (lower.contains("android")) os = "Android";
        else if (lower.contains("linux")) os = "Linux";

        return new ParsedUserAgent(device, browser, os);
    }

    private String sanitize(String val, int maxLen) {
        if (val == null) return null;
        val = val.trim();
        return val.length() > maxLen ? val.substring(0, maxLen) : val;
    }

    private String sanitizeMetadata(String json) {
        if (json == null || json.isBlank()) return null;
        // Strip common sensitive keywords if present
        return json.replaceAll("(?i)\"(password|secret|token|otp|cvv)\"\\s*:\\s*\"[^\"]+\"", "\"$1\":\"***\"");
    }
}
