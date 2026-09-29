package com.boki.infrastructure.persistence.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "book_similarities", indexes = {
        @Index(name = "idx_book_similarities_source", columnList = "source_book_id, similarity_score DESC")
})
public class BookSimilarityJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "source_book_id", nullable = false)
    private BookJpaEntity sourceBook;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "target_book_id", nullable = false)
    private BookJpaEntity targetBook;

    @Column(name = "similarity_score", nullable = false, precision = 5, scale = 4)
    private BigDecimal similarityScore;

    @Column(name = "reason_code", nullable = false, length = 50)
    private String reasonCode;

    @Column(name = "reason_label")
    private String reasonLabel;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    public BookSimilarityJpaEntity() {
    }

    public BookSimilarityJpaEntity(BookJpaEntity sourceBook, BookJpaEntity targetBook,
                                  BigDecimal similarityScore, String reasonCode, String reasonLabel) {
        this.sourceBook = sourceBook;
        this.targetBook = targetBook;
        this.similarityScore = similarityScore;
        this.reasonCode = reasonCode;
        this.reasonLabel = reasonLabel;
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public BookJpaEntity getSourceBook() { return sourceBook; }
    public void setSourceBook(BookJpaEntity sourceBook) { this.sourceBook = sourceBook; }

    public BookJpaEntity getTargetBook() { return targetBook; }
    public void setTargetBook(BookJpaEntity targetBook) { this.targetBook = targetBook; }

    public BigDecimal getSimilarityScore() { return similarityScore; }
    public void setSimilarityScore(BigDecimal similarityScore) { this.similarityScore = similarityScore; }

    public String getReasonCode() { return reasonCode; }
    public void setReasonCode(String reasonCode) { this.reasonCode = reasonCode; }

    public String getReasonLabel() { return reasonLabel; }
    public void setReasonLabel(String reasonLabel) { this.reasonLabel = reasonLabel; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
