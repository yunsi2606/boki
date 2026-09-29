package com.boki.infrastructure.persistence.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "book_co_occurrences", indexes = {
        @Index(name = "idx_book_co_occurrences_a", columnList = "book_a_id, confidence_score DESC")
})
public class BookCoOccurrenceJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "book_a_id", nullable = false)
    private BookJpaEntity bookA;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "book_b_id", nullable = false)
    private BookJpaEntity bookB;

    @Column(name = "co_order_count", nullable = false)
    private int coOrderCount = 1;

    @Column(name = "co_view_count", nullable = false)
    private int coViewCount = 0;

    @Column(name = "confidence_score", nullable = false, precision = 5, scale = 4)
    private BigDecimal confidenceScore = BigDecimal.ZERO;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    public BookCoOccurrenceJpaEntity() {
    }

    public BookCoOccurrenceJpaEntity(BookJpaEntity bookA, BookJpaEntity bookB, int coOrderCount, int coViewCount, BigDecimal confidenceScore) {
        this.bookA = bookA;
        this.bookB = bookB;
        this.coOrderCount = coOrderCount;
        this.coViewCount = coViewCount;
        this.confidenceScore = confidenceScore;
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public BookJpaEntity getBookA() { return bookA; }
    public void setBookA(BookJpaEntity bookA) { this.bookA = bookA; }

    public BookJpaEntity getBookB() { return bookB; }
    public void setBookB(BookJpaEntity bookB) { this.bookB = bookB; }

    public int getCoOrderCount() { return coOrderCount; }
    public void setCoOrderCount(int coOrderCount) { this.coOrderCount = coOrderCount; }

    public int getCoViewCount() { return coViewCount; }
    public void setCoViewCount(int coViewCount) { this.coViewCount = coViewCount; }

    public BigDecimal getConfidenceScore() { return confidenceScore; }
    public void setConfidenceScore(BigDecimal confidenceScore) { this.confidenceScore = confidenceScore; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
