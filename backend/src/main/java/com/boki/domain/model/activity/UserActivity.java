package com.boki.domain.model.activity;

import java.time.Instant;
import java.util.UUID;

/**
 * Domain entity representing an audited user behavior event.
 */
public class UserActivity {

    private UUID id;
    private String sessionId;
    private UUID userId;
    private String userEmail;
    private String userRole;
    private ActivityEventType eventType;
    private ActivityEventCategory eventCategory;
    private String pagePath;
    private String pageTitle;
    private String referrerUrl;
    private String targetId;
    private String targetName;
    private String metadataJson;
    private String ipAddress;
    private String userAgent;
    private String deviceType;
    private String browser;
    private String os;
    private int durationSeconds;
    private Instant createdAt;

    public UserActivity() {
    }

    public static UserActivity record(
            String sessionId,
            UUID userId,
            String userEmail,
            String userRole,
            ActivityEventType eventType,
            ActivityEventCategory eventCategory,
            String pagePath,
            String pageTitle,
            String referrerUrl,
            String targetId,
            String targetName,
            String metadataJson,
            String ipAddress,
            String userAgent,
            String deviceType,
            String browser,
            String os,
            int durationSeconds
    ) {
        UserActivity activity = new UserActivity();
        activity.id = UUID.randomUUID();
        activity.sessionId = (sessionId != null && !sessionId.isBlank()) ? sessionId.trim() : UUID.randomUUID().toString();
        activity.userId = userId;
        activity.userEmail = userEmail;
        activity.userRole = userRole;
        activity.eventType = eventType != null ? eventType : ActivityEventType.PAGE_VIEW;
        activity.eventCategory = eventCategory != null ? eventCategory : (eventType != null ? eventType.getDefaultCategory() : ActivityEventCategory.NAVIGATION);
        activity.pagePath = pagePath;
        activity.pageTitle = pageTitle;
        activity.referrerUrl = referrerUrl;
        activity.targetId = targetId;
        activity.targetName = targetName;
        activity.metadataJson = metadataJson;
        activity.ipAddress = ipAddress;
        activity.userAgent = userAgent;
        activity.deviceType = (deviceType != null && !deviceType.isBlank()) ? deviceType.toUpperCase() : "DESKTOP";
        activity.browser = browser;
        activity.os = os;
        activity.durationSeconds = Math.max(0, durationSeconds);
        activity.createdAt = Instant.now();
        return activity;
    }

    public static UserActivity reconstitute(
            UUID id,
            String sessionId,
            UUID userId,
            String userEmail,
            String userRole,
            ActivityEventType eventType,
            ActivityEventCategory eventCategory,
            String pagePath,
            String pageTitle,
            String referrerUrl,
            String targetId,
            String targetName,
            String metadataJson,
            String ipAddress,
            String userAgent,
            String deviceType,
            String browser,
            String os,
            int durationSeconds,
            Instant createdAt
    ) {
        UserActivity activity = new UserActivity();
        activity.id = id;
        activity.sessionId = sessionId;
        activity.userId = userId;
        activity.userEmail = userEmail;
        activity.userRole = userRole;
        activity.eventType = eventType;
        activity.eventCategory = eventCategory;
        activity.pagePath = pagePath;
        activity.pageTitle = pageTitle;
        activity.referrerUrl = referrerUrl;
        activity.targetId = targetId;
        activity.targetName = targetName;
        activity.metadataJson = metadataJson;
        activity.ipAddress = ipAddress;
        activity.userAgent = userAgent;
        activity.deviceType = deviceType;
        activity.browser = browser;
        activity.os = os;
        activity.durationSeconds = durationSeconds;
        activity.createdAt = createdAt;
        return activity;
    }

    // Getters
    public UUID getId() { return id; }
    public String getSessionId() { return sessionId; }
    public UUID getUserId() { return userId; }
    public String getUserEmail() { return userEmail; }
    public String getUserRole() { return userRole; }
    public ActivityEventType getEventType() { return eventType; }
    public ActivityEventCategory getEventCategory() { return eventCategory; }
    public String getPagePath() { return pagePath; }
    public String getPageTitle() { return pageTitle; }
    public String getReferrerUrl() { return referrerUrl; }
    public String getTargetId() { return targetId; }
    public String getTargetName() { return targetName; }
    public String getMetadataJson() { return metadataJson; }
    public String getIpAddress() { return ipAddress; }
    public String getUserAgent() { return userAgent; }
    public String getDeviceType() { return deviceType; }
    public String getBrowser() { return browser; }
    public String getOs() { return os; }
    public int getDurationSeconds() { return durationSeconds; }
    public Instant getCreatedAt() { return createdAt; }
}
