package com.boki.application.dto.excel;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class BookExcelGroupedBook {
    private int rowNumber;
    private String title;
    private String author;
    private List<String> categoryNames = new ArrayList<>();
    private String isbn;
    private String publisher;
    private String supplier;
    private String publicationYear;
    private String coverType;
    private Integer pageCount;
    private String condition;
    private BigDecimal price;
    private BigDecimal originalPrice;
    private int stockQuantity;
    private String coverImageRef;
    private List<String> detailImagesRef = new ArrayList<>();
    private String resolvedCoverUrl;
    private List<String> resolvedDetailUrls = new ArrayList<>();
    private boolean isPreOrder;
    private Integer preOrderDays;
    private Integer maxOrderQuantity;
    private String description;
    private List<BookExcelVariantData> variants = new ArrayList<>();
    private List<String> validationErrors = new ArrayList<>();

    // Getters and Setters
    public int getRowNumber() { return rowNumber; }
    public void setRowNumber(int rowNumber) { this.rowNumber = rowNumber; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getAuthor() { return author; }
    public void setAuthor(String author) { this.author = author; }

    public List<String> getCategoryNames() { return categoryNames; }
    public void setCategoryNames(List<String> categoryNames) { this.categoryNames = categoryNames; }

    public String getIsbn() { return isbn; }
    public void setIsbn(String isbn) { this.isbn = isbn; }

    public String getPublisher() { return publisher; }
    public void setPublisher(String publisher) { this.publisher = publisher; }

    public String getSupplier() { return supplier; }
    public void setSupplier(String supplier) { this.supplier = supplier; }

    public String getPublicationYear() { return publicationYear; }
    public void setPublicationYear(String publicationYear) { this.publicationYear = publicationYear; }

    public String getCoverType() { return coverType; }
    public void setCoverType(String coverType) { this.coverType = coverType; }

    public Integer getPageCount() { return pageCount; }
    public void setPageCount(Integer pageCount) { this.pageCount = pageCount; }

    public String getCondition() { return condition; }
    public void setCondition(String condition) { this.condition = condition; }

    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }

    public BigDecimal getOriginalPrice() { return originalPrice; }
    public void setOriginalPrice(BigDecimal originalPrice) { this.originalPrice = originalPrice; }

    public int getStockQuantity() { return stockQuantity; }
    public void setStockQuantity(int stockQuantity) { this.stockQuantity = stockQuantity; }

    public String getCoverImageRef() { return coverImageRef; }
    public void setCoverImageRef(String coverImageRef) { this.coverImageRef = coverImageRef; }

    public List<String> getDetailImagesRef() { return detailImagesRef; }
    public void setDetailImagesRef(List<String> detailImagesRef) { this.detailImagesRef = detailImagesRef; }

    public String getResolvedCoverUrl() { return resolvedCoverUrl; }
    public void setResolvedCoverUrl(String resolvedCoverUrl) { this.resolvedCoverUrl = resolvedCoverUrl; }

    public List<String> getResolvedDetailUrls() { return resolvedDetailUrls; }
    public void setResolvedDetailUrls(List<String> resolvedDetailUrls) { this.resolvedDetailUrls = resolvedDetailUrls; }

    public boolean isPreOrder() { return isPreOrder; }
    public void setPreOrder(boolean preOrder) { isPreOrder = preOrder; }

    public Integer getPreOrderDays() { return preOrderDays; }
    public void setPreOrderDays(Integer preOrderDays) { this.preOrderDays = preOrderDays; }

    public Integer getMaxOrderQuantity() { return maxOrderQuantity; }
    public void setMaxOrderQuantity(Integer maxOrderQuantity) { this.maxOrderQuantity = maxOrderQuantity; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public List<BookExcelVariantData> getVariants() { return variants; }
    public void setVariants(List<BookExcelVariantData> variants) { this.variants = variants; }

    public List<String> getValidationErrors() { return validationErrors; }
    public void setValidationErrors(List<String> validationErrors) { this.validationErrors = validationErrors; }
}
