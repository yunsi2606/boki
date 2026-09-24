package com.boki.infrastructure.persistence.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "chat_audit_log")
public class ChatAuditLogJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "session_id", nullable = false, length = 100)
    private String sessionId;

    @Column(name = "user_id")
    private UUID userId;

    @Column(name = "client_ip", length = 50)
    private String clientIp;

    @Column(name = "user_message", columnDefinition = "TEXT")
    private String userMessage;

    @Column(name = "intent_detected", length = 100)
    private String intentDetected;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "tools_called", columnDefinition = "text[]")
    private List<String> toolsCalled = new ArrayList<>();

    @Column(name = "bot_response", columnDefinition = "TEXT")
    private String botResponse;

    @Column(name = "latency_ms")
    private Integer latencyMs = 0;

    @Column(name = "token_count")
    private Integer tokenCount = 0;

    @Column(name = "is_fallback")
    private Boolean fallback = false;

    @Column(length = 20)
    private String feedback; // "LIKE", "DISLIKE"

    @Column(name = "feedback_reason", columnDefinition = "TEXT")
    private String feedbackReason;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    // Getters & Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getSessionId() { return sessionId; }
    public void setSessionId(String sessionId) { this.sessionId = sessionId; }
    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }
    public String getClientIp() { return clientIp; }
    public void setClientIp(String clientIp) { this.clientIp = clientIp; }
    public String getUserMessage() { return userMessage; }
    public void setUserMessage(String userMessage) { this.userMessage = userMessage; }
    public String getIntentDetected() { return intentDetected; }
    public void setIntentDetected(String intentDetected) { this.intentDetected = intentDetected; }
    public List<String> getToolsCalled() { return toolsCalled; }
    public void setToolsCalled(List<String> toolsCalled) { this.toolsCalled = toolsCalled; }
    public String getBotResponse() { return botResponse; }
    public void setBotResponse(String botResponse) { this.botResponse = botResponse; }
    public Integer getLatencyMs() { return latencyMs; }
    public void setLatencyMs(Integer latencyMs) { this.latencyMs = latencyMs; }
    public Integer getTokenCount() { return tokenCount; }
    public void setTokenCount(Integer tokenCount) { this.tokenCount = tokenCount; }
    public Boolean getFallback() { return fallback; }
    public void setFallback(Boolean fallback) { this.fallback = fallback; }
    public String getFeedback() { return feedback; }
    public void setFeedback(String feedback) { this.feedback = feedback; }
    public String getFeedbackReason() { return feedbackReason; }
    public void setFeedbackReason(String feedbackReason) { this.feedbackReason = feedbackReason; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
