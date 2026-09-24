package com.boki.infrastructure.persistence.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "books")
public class BookJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "seller_id", nullable = false)
    private UUID sellerId;

    @Column(name = "category_id")
    private Integer categoryId;

    @Column(nullable = false)
    private String title;

    private String slug;

    @Column(nullable = false)
    private String author;

    private String isbn;

    @org.hibernate.annotations.JdbcTypeCode(org.hibernate.type.SqlTypes.JSON)
    @Column(name = "publication_details", columnDefinition = "jsonb")
    private Map<String, String> publicationDetails = new LinkedHashMap<>();

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal price;

    @Column(name = "original_price", precision = 12, scale = 2)
    private BigDecimal originalPrice;

    @Column(name = "views_count", nullable = false)
    private int viewsCount = 0;

    @Column(nullable = false, precision = 3, scale = 2)
    private BigDecimal rating = BigDecimal.valueOf(5.0);

    @Column(name = "reviews_count", nullable = false)
    private int reviewsCount = 0;

    @Column(nullable = false, length = 3)
    private String currency = "VND";

    @Enumerated(EnumType.STRING)
    @org.hibernate.annotations.JdbcType(org.hibernate.dialect.PostgreSQLEnumJdbcType.class)
    @Column(nullable = false, columnDefinition = "book_condition")
    private BookConditionJpa condition = BookConditionJpa.GOOD;

    @Enumerated(EnumType.STRING)
    @org.hibernate.annotations.JdbcType(org.hibernate.dialect.PostgreSQLEnumJdbcType.class)
    @Column(nullable = false, columnDefinition = "book_status")
    private BookStatusJpa status = BookStatusJpa.DRAFT;

    @Column(name = "stock_quantity", nullable = false)
    private int stockQuantity = 1;

    @Column(name = "is_pre_order", nullable = false)
    private boolean isPreOrder = false;

    @Column(name = "pre_order_days")
    private Integer preOrderDays;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @Column(name = "created_by")
    private String createdBy;

    @org.hibernate.annotations.BatchSize(size = 50)
    @OneToMany(mappedBy = "book", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<BookImageJpaEntity> images = new ArrayList<>();

    @org.hibernate.annotations.BatchSize(size = 50)
    @OneToMany(mappedBy = "book", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<BookVariantJpaEntity> variants = new ArrayList<>();

    public enum BookConditionJpa {
        NEW, LIKE_NEW, GOOD, FAIR, POOR
    }

    public enum BookStatusJpa {
        DRAFT, ACTIVE, SOLD, ARCHIVED
    }

    // --- Helper methods for relationship ---
    public void addImage(BookImageJpaEntity image) {
        images.add(image);
        image.setBook(this);
    }

    public void removeImage(BookImageJpaEntity image) {
        images.remove(image);
        image.setBook(null);
    }

    // --- Getters & Setters ---

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getSellerId() { return sellerId; }
    public void setSellerId(UUID sellerId) { this.sellerId = sellerId; }

    public Integer getCategoryId() { return categoryId; }
    public void setCategoryId(Integer categoryId) { this.categoryId = categoryId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }

    public String getAuthor() { return author; }
    public void setAuthor(String author) { this.author = author; }

    public String getIsbn() { return isbn; }
    public void setIsbn(String isbn) { this.isbn = isbn; }

    public Map<String, String> getPublicationDetails() { return publicationDetails; }
    public void setPublicationDetails(Map<String, String> publicationDetails) {
        this.publicationDetails = publicationDetails != null ? publicationDetails : new LinkedHashMap<>();
    }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }

    public BigDecimal getOriginalPrice() { return originalPrice; }
    public void setOriginalPrice(BigDecimal originalPrice) { this.originalPrice = originalPrice; }

    public int getViewsCount() { return viewsCount; }
    public void setViewsCount(int viewsCount) { this.viewsCount = viewsCount; }

    public BigDecimal getRating() { return rating; }
    public void setRating(BigDecimal rating) { this.rating = rating; }

    public int getReviewsCount() { return reviewsCount; }
    public void setReviewsCount(int reviewsCount) { this.reviewsCount = reviewsCount; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public BookConditionJpa getCondition() { return condition; }
    public void setCondition(BookConditionJpa condition) { this.condition = condition; }

    public BookStatusJpa getStatus() { return status; }
    public void setStatus(BookStatusJpa status) { this.status = status; }

    public int getStockQuantity() { return stockQuantity; }
    public void setStockQuantity(int stockQuantity) { this.stockQuantity = stockQuantity; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }

    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }

    public List<BookImageJpaEntity> getImages() { return images; }
    public void setImages(List<BookImageJpaEntity> images) { this.images = images; }

    public List<BookVariantJpaEntity> getVariants() { return variants; }
    public void setVariants(List<BookVariantJpaEntity> variants) { this.variants = variants; }

    public boolean isPreOrder() { return isPreOrder; }
    public void setPreOrder(boolean preOrder) { isPreOrder = preOrder; }

    public Integer getPreOrderDays() { return preOrderDays; }
    public void setPreOrderDays(Integer preOrderDays) { this.preOrderDays = preOrderDays; }
}
