package com.boki.domain.model.book;

import com.boki.domain.model.user.UserId;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * Book aggregate root.
 * <p>
 * Business rules:
 * - Price must be non-negative
 * - Stock must be non-negative
 * - Only the seller can modify the book
 * - A book can only be sold if it is ACTIVE and has stock > 0
 */
public class Book {

    private BookId id;
    private UserId sellerId;
    private Integer categoryId;
    private String title;
    private String author;
    private String isbn;
    private String description;
    private Price price;
    private BookCondition condition;
    private BookStatus status;
    private int stockQuantity;
    private List<String> imageUrls = new ArrayList<>();
    private Instant createdAt;
    private Instant updatedAt;
    private String createdBy;

    private Book() {
    }

    /**
     * Factory: create a new book listing.
     */
    public static Book create(
            UserId sellerId, String title, String author,
            Price price, BookCondition condition, int stockQuantity,
            List<String> imageUrls
    ) {
        if (title == null || title.isBlank()) {
            throw new IllegalArgumentException("Book title cannot be empty");
        }
        if (author == null || author.isBlank()) {
            throw new IllegalArgumentException("Book author cannot be empty");
        }
        if (stockQuantity < 0) {
            throw new IllegalArgumentException("Stock quantity cannot be negative");
        }

        Book book = new Book();
        book.id = BookId.generate();
        book.sellerId = sellerId;
        book.title = title.trim();
        book.author = author.trim();
        book.price = price;
        book.condition = condition;
        book.status = BookStatus.DRAFT;
        book.stockQuantity = stockQuantity;
        book.imageUrls = imageUrls != null ? new ArrayList<>(imageUrls) : new ArrayList<>();
        book.createdAt = Instant.now();
        book.updatedAt = Instant.now();
        book.createdBy = sellerId.toString();
        return book;
    }

    /**
     * Reconstitute from persistence.
     */
    public static Book reconstitute(
            BookId id, UserId sellerId, Integer categoryId,
            String title, String author, String isbn, String description,
            Price price, BookCondition condition, BookStatus status,
            int stockQuantity, List<String> imageUrls, Instant createdAt, Instant updatedAt, String createdBy
    ) {
        Book book = new Book();
        book.id = id;
        book.sellerId = sellerId;
        book.categoryId = categoryId;
        book.title = title;
        book.author = author;
        book.isbn = isbn;
        book.description = description;
        book.price = price;
        book.condition = condition;
        book.status = status;
        book.stockQuantity = stockQuantity;
        book.imageUrls = imageUrls != null ? new ArrayList<>(imageUrls) : new ArrayList<>();
        book.createdAt = createdAt;
        book.updatedAt = updatedAt;
        book.createdBy = createdBy;
        return book;
    }

    // ---- Business Methods ----

    public void publish() {
        if (this.status != BookStatus.DRAFT) {
            throw new IllegalStateException("Only DRAFT books can be published");
        }
        this.status = BookStatus.ACTIVE;
        this.updatedAt = Instant.now();
    }

    public void archive() {
        this.status = BookStatus.ARCHIVED;
        this.updatedAt = Instant.now();
    }

    public boolean isAvailableForPurchase() {
        return status == BookStatus.ACTIVE && stockQuantity > 0;
    }

    public void decrementStock(int quantity) {
        if (quantity <= 0) {
            throw new IllegalArgumentException("Quantity must be positive");
        }
        if (this.stockQuantity < quantity) {
            throw new IllegalStateException("Insufficient stock: available=" + stockQuantity + ", requested=" + quantity);
        }
        this.stockQuantity -= quantity;
        if (this.stockQuantity == 0) {
            this.status = BookStatus.SOLD;
        }
        this.updatedAt = Instant.now();
    }

    public void updateDetails(String title, String author, String isbn, String description, Integer categoryId) {
        if (title != null && !title.isBlank()) this.title = title.trim();
        if (author != null && !author.isBlank()) this.author = author.trim();
        this.isbn = isbn;
        this.description = description;
        this.categoryId = categoryId;
        this.updatedAt = Instant.now();
    }

    public void updatePrice(Price newPrice) {
        this.price = newPrice;
        this.updatedAt = Instant.now();
    }

    public void updateImages(List<String> imageUrls) {
        this.imageUrls = imageUrls != null ? new ArrayList<>(imageUrls) : new ArrayList<>();
        this.updatedAt = Instant.now();
    }

    public void updateCondition(BookCondition newCondition) {
        if (newCondition == null) {
            throw new IllegalArgumentException("Book condition cannot be null");
        }
        this.condition = newCondition;
        this.updatedAt = Instant.now();
    }

    public void updateStockQuantity(int newStock) {
        if (newStock < 0) {
            throw new IllegalArgumentException("Stock quantity cannot be negative");
        }
        this.stockQuantity = newStock;
        if (this.stockQuantity == 0 && this.status == BookStatus.ACTIVE) {
            this.status = BookStatus.SOLD;
        } else if (this.stockQuantity > 0 && this.status == BookStatus.SOLD) {
            this.status = BookStatus.ACTIVE;
        }
        this.updatedAt = Instant.now();
    }

    // ---- Getters ----

    public BookId getId() { return id; }
    public UserId getSellerId() { return sellerId; }
    public Integer getCategoryId() { return categoryId; }
    public String getTitle() { return title; }
    public String getAuthor() { return author; }
    public String getIsbn() { return isbn; }
    public String getDescription() { return description; }
    public Price getPrice() { return price; }
    public BookCondition getCondition() { return condition; }
    public BookStatus getStatus() { return status; }
    public int getStockQuantity() { return stockQuantity; }
    public List<String> getImageUrls() { return Collections.unmodifiableList(imageUrls); }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public String getCreatedBy() { return createdBy; }
}
