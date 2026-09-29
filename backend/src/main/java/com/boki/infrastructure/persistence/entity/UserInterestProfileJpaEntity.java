package com.boki.infrastructure.persistence.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "user_interest_profiles", indexes = {
        @Index(name = "idx_user_interest_session_id", columnList = "session_id")
})
public class UserInterestProfileJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id")
    private UUID userId;

    @Column(name = "session_id", length = 64)
    private String sessionId;

    @Column(name = "top_categories_json", columnDefinition = "jsonb")
    private String topCategoriesJson = "{}";

    @Column(name = "top_authors_json", columnDefinition = "jsonb")
    private String topAuthorsJson = "{}";

    @Column(name = "recent_viewed_book_ids", columnDefinition = "jsonb")
    private String recentViewedBookIds = "[]";

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    public UserInterestProfileJpaEntity() {
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }

    public String getSessionId() { return sessionId; }
    public void setSessionId(String sessionId) { this.sessionId = sessionId; }

    public String getTopCategoriesJson() { return topCategoriesJson; }
    public void setTopCategoriesJson(String topCategoriesJson) { this.topCategoriesJson = topCategoriesJson; }

    public String getTopAuthorsJson() { return topAuthorsJson; }
    public void setTopAuthorsJson(String topAuthorsJson) { this.topAuthorsJson = topAuthorsJson; }

    public String getRecentViewedBookIds() { return recentViewedBookIds; }
    public void setRecentViewedBookIds(String recentViewedBookIds) { this.recentViewedBookIds = recentViewedBookIds; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
