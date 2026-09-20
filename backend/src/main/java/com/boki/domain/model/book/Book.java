package com.boki.domain.model.book;

import com.boki.domain.model.user.UserId;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * Book aggregate root.
 */
public class Book {

    private BookId id;
    private UserId sellerId;
    private Integer categoryId;
    private String title;
    private String author;
    private String isbn;
    private String publisher;
    private String supplier;
    private Integer publicationYear;
    private String language;
    private String format;
    private Integer numberOfPages;
    private Integer weightGrams;
    private String dimensions;
    private String translator;
    private String description;
    private Price price;
    private Price originalPrice;
    private int viewsCount = 0;
    private java.math.BigDecimal rating = java.math.BigDecimal.valueOf(5.0);
    private int reviewsCount = 0;
    private BookCondition condition;
    private BookStatus status;
    private int stockQuantity;
    private boolean isPreOrder = false;
    private Integer preOrderDays;
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
            String title, String author, String isbn,
            String publisher, String supplier, Integer publicationYear,
            String language, String format, Integer numberOfPages,
            Integer weightGrams, String dimensions, String translator,
            String description, Price price, Price originalPrice,
            int viewsCount, java.math.BigDecimal rating, int reviewsCount,
            BookCondition condition, BookStatus status,
            int stockQuantity, List<String> imageUrls, Instant createdAt, Instant updatedAt, String createdBy
    ) {
        return reconstitute(
                id, sellerId, categoryId, title, author, isbn, publisher, supplier,
                publicationYear, language, format, numberOfPages, weightGrams, dimensions,
                translator, description, price, originalPrice, viewsCount, rating,
                reviewsCount, condition, status, stockQuantity, false, null, imageUrls, createdAt, updatedAt, createdBy
        );
    }

    public static Book reconstitute(
            BookId id, UserId sellerId, Integer categoryId,
            String title, String author, String isbn,
            String publisher, String supplier, Integer publicationYear,
            String language, String format, Integer numberOfPages,
            Integer weightGrams, String dimensions, String translator,
            String description, Price price, Price originalPrice,
            int viewsCount, java.math.BigDecimal rating, int reviewsCount,
            BookCondition condition, BookStatus status,
            int stockQuantity, boolean isPreOrder, Integer preOrderDays,
            List<String> imageUrls, Instant createdAt, Instant updatedAt, String createdBy
    ) {
        Book book = new Book();
        book.id = id;
        book.sellerId = sellerId;
        book.categoryId = categoryId;
        book.title = title;
        book.author = author;
        book.isbn = isbn;
        book.publisher = publisher;
        book.supplier = supplier;
        book.publicationYear = publicationYear;
        book.language = language;
        book.format = format;
        book.numberOfPages = numberOfPages;
        book.weightGrams = weightGrams;
        book.dimensions = dimensions;
        book.translator = translator;
        book.description = description;
        book.price = price;
        book.originalPrice = originalPrice;
        book.viewsCount = viewsCount;
        book.rating = rating != null ? rating : java.math.BigDecimal.valueOf(5.0);
        book.reviewsCount = reviewsCount;
        book.condition = condition;
        book.status = status;
        book.stockQuantity = stockQuantity;
        book.isPreOrder = isPreOrder;
        book.preOrderDays = preOrderDays;
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
        return status == BookStatus.ACTIVE && (stockQuantity > 0 || isPreOrder);
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

    public void updateDetails(
            String title, String author, String isbn, String description, Integer categoryId,
            String publisher, String supplier, Integer publicationYear, String language,
            String format, Integer numberOfPages, Integer weightGrams, String dimensions, String translator
    ) {
        if (title != null && !title.isBlank()) this.title = title.trim();
        if (author != null && !author.isBlank()) this.author = author.trim();
        this.isbn = isbn;
        this.description = description;
        this.categoryId = categoryId;
        this.publisher = publisher;
        this.supplier = supplier;
        this.publicationYear = publicationYear;
        this.language = language;
        this.format = format;
        this.numberOfPages = numberOfPages;
        this.weightGrams = weightGrams;
        this.dimensions = dimensions;
        this.translator = translator;
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
    public String getPublisher() { return publisher; }
    public String getSupplier() { return supplier; }
    public Integer getPublicationYear() { return publicationYear; }
    public String getLanguage() { return language; }
    public String getFormat() { return format; }
    public Integer getNumberOfPages() { return numberOfPages; }
    public Integer getWeightGrams() { return weightGrams; }
    public String getDimensions() { return dimensions; }
    public String getTranslator() { return translator; }
    public String getDescription() { return description; }
    public Price getPrice() { return price; }
    public Price getOriginalPrice() { return originalPrice; }
    public int getViewsCount() { return viewsCount; }
    public java.math.BigDecimal getRating() { return rating; }
    public int getReviewsCount() { return reviewsCount; }
    public BookCondition getCondition() { return condition; }
    public BookStatus getStatus() { return status; }
    public int getStockQuantity() { return stockQuantity; }
    public boolean isPreOrder() { return isPreOrder; }
    public Integer getPreOrderDays() { return preOrderDays; }
    public List<String> getImageUrls() { return Collections.unmodifiableList(imageUrls); }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public String getCreatedBy() { return createdBy; }

    public void updatePreOrder(Boolean isPreOrder, Integer preOrderDays) {
        this.isPreOrder = Boolean.TRUE.equals(isPreOrder);
        if (!this.isPreOrder) {
            this.preOrderDays = null;
        } else {
            this.preOrderDays = (preOrderDays != null && preOrderDays > 0) ? preOrderDays : null;
        }
        this.updatedAt = Instant.now();
    }
}
