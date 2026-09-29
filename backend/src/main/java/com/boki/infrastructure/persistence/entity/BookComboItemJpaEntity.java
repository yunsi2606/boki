package com.boki.infrastructure.persistence.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "book_combo_items")
public class BookComboItemJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "combo_book_id", nullable = false)
    private BookJpaEntity comboBook;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "single_book_id", nullable = false)
    private BookJpaEntity singleBook;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "variant_id")
    private BookVariantJpaEntity variant;

    @Column(nullable = false)
    private int quantity = 1;

    @Column(name = "sort_order", nullable = false)
    private int sortOrder = 0;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public BookComboItemJpaEntity() {
    }

    public BookComboItemJpaEntity(BookJpaEntity comboBook, BookJpaEntity singleBook, BookVariantJpaEntity variant, int quantity, int sortOrder) {
        this.comboBook = comboBook;
        this.singleBook = singleBook;
        this.variant = variant;
        this.quantity = quantity;
        this.sortOrder = sortOrder;
        this.createdAt = Instant.now();
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public BookJpaEntity getComboBook() { return comboBook; }
    public void setComboBook(BookJpaEntity comboBook) { this.comboBook = comboBook; }

    public BookJpaEntity getSingleBook() { return singleBook; }
    public void setSingleBook(BookJpaEntity singleBook) { this.singleBook = singleBook; }

    public BookVariantJpaEntity getVariant() { return variant; }
    public void setVariant(BookVariantJpaEntity variant) { this.variant = variant; }

    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }

    public int getSortOrder() { return sortOrder; }
    public void setSortOrder(int sortOrder) { this.sortOrder = sortOrder; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
