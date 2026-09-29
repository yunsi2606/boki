package com.boki.infrastructure.persistence.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "recommendation_logs", indexes = {
        @Index(name = "idx_rec_logs_widget_created", columnList = "widget_type, created_at"),
        @Index(name = "idx_rec_logs_session_book", columnList = "session_id, book_id")
})
public class RecommendationLogJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id")
    private UUID userId;

    @Column(name = "session_id", nullable = false, length = 64)
    private String sessionId;

    @Column(name = "widget_type", nullable = false, length = 50)
    private String widgetType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "book_id", nullable = false)
    private BookJpaEntity book;

    @Column(name = "position_index", nullable = false)
    private int positionIndex = 0;

    @Column(name = "is_clicked", nullable = false)
    private boolean clicked = false;

    @Column(name = "is_converted_to_cart", nullable = false)
    private boolean convertedToCart = false;

    @Column(name = "is_converted_to_order", nullable = false)
    private boolean convertedToOrder = false;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public RecommendationLogJpaEntity() {
    }

    public RecommendationLogJpaEntity(UUID userId, String sessionId, String widgetType, BookJpaEntity book, int positionIndex) {
        this.userId = userId;
        this.sessionId = sessionId;
        this.widgetType = widgetType;
        this.book = book;
        this.positionIndex = positionIndex;
        this.createdAt = Instant.now();
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }

    public String getSessionId() { return sessionId; }
    public void setSessionId(String sessionId) { this.sessionId = sessionId; }

    public String getWidgetType() { return widgetType; }
    public void setWidgetType(String widgetType) { this.widgetType = widgetType; }

    public BookJpaEntity getBook() { return book; }
    public void setBook(BookJpaEntity book) { this.book = book; }

    public int getPositionIndex() { return positionIndex; }
    public void setPositionIndex(int positionIndex) { this.positionIndex = positionIndex; }

    public boolean isClicked() { return clicked; }
    public void setClicked(boolean clicked) { this.clicked = clicked; }

    public boolean isConvertedToCart() { return convertedToCart; }
    public void setConvertedToCart(boolean convertedToCart) { this.convertedToCart = convertedToCart; }

    public boolean isConvertedToOrder() { return convertedToOrder; }
    public void setConvertedToOrder(boolean convertedToOrder) { this.convertedToOrder = convertedToOrder; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
