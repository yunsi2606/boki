package com.boki.application.service;

import com.boki.application.dto.response.FlashSaleItemResponse;
import com.boki.application.dto.response.FlashSaleResponse;
import com.boki.application.dto.response.PublicFlashSaleResponse;
import com.boki.domain.model.book.Book;
import com.boki.domain.model.book.BookId;
import com.boki.domain.port.out.BookRepository;
import com.boki.infrastructure.persistence.entity.FlashSaleItemJpaEntity;
import com.boki.infrastructure.persistence.entity.FlashSaleJpaEntity;
import com.boki.infrastructure.util.SlugUtils;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

@Component
public class FlashSaleMapper {

    private final BookRepository bookRepository;

    public FlashSaleMapper(BookRepository bookRepository) {
        this.bookRepository = bookRepository;
    }

    public FlashSaleResponse toResponse(FlashSaleJpaEntity sale) {
        int totalItems = sale.getItems() != null ? sale.getItems().size() : 0;
        int totalSold = 0;
        int totalLimit = 0;
        List<FlashSaleItemResponse> itemResponses = List.of();

        if (sale.getItems() != null) {
            itemResponses = sale.getItems().stream()
                    .map(this::toItemResponse)
                    .toList();

            for (FlashSaleItemJpaEntity it : sale.getItems()) {
                totalSold += it.getSoldQuantity();
                totalLimit += it.getQuantityLimit();
            }
        }

        return new FlashSaleResponse(
                sale.getId(),
                sale.getName(),
                sale.getDescription(),
                sale.getBannerUrl(),
                sale.getStartTime(),
                sale.getEndTime(),
                sale.getStatus(),
                totalItems,
                totalLimit,
                totalSold,
                itemResponses,
                sale.getCreatedAt()
        );
    }

    public FlashSaleItemResponse toItemResponse(FlashSaleItemJpaEntity item) {
        String bookTitle = "Sách ID: " + item.getBookId();
        String bookAuthor = "";
        String bookImageUrl = "";
        String bookSlug = "";

        Optional<Book> bookOpt = bookRepository.findById(BookId.of(item.getBookId()));
        if (bookOpt.isPresent()) {
            Book book = bookOpt.get();
            bookTitle = book.getTitle();
            bookAuthor = book.getAuthor() != null ? book.getAuthor() : "";
            bookSlug = book.getTitle() != null ? SlugUtils.slugify(book.getTitle()) : "";
            if (book.getImageUrls() != null && !book.getImageUrls().isEmpty()) {
                bookImageUrl = book.getImageUrls().get(0);
            }
        }

        int discountPercent = 0;
        if (item.getOriginalPrice() != null && item.getOriginalPrice().compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal diff = item.getOriginalPrice().subtract(item.getFlashSalePrice());
            discountPercent = diff.multiply(BigDecimal.valueOf(100))
                    .divide(item.getOriginalPrice(), 0, RoundingMode.HALF_UP)
                    .intValue();
        }

        boolean isSoldOut = item.getSoldQuantity() >= item.getQuantityLimit();

        return new FlashSaleItemResponse(
                item.getId(),
                item.getBookId(),
                bookTitle,
                bookSlug,
                bookAuthor,
                bookImageUrl,
                item.getOriginalPrice(),
                item.getFlashSalePrice(),
                discountPercent,
                item.getQuantityLimit(),
                item.getSoldQuantity(),
                item.getUserLimit(),
                isSoldOut
        );
    }

    public PublicFlashSaleResponse toPublicResponse(FlashSaleJpaEntity sale, OffsetDateTime now) {
        long remainingSeconds = 0;
        if (sale.getEndTime() != null && sale.getEndTime().isAfter(now)) {
            remainingSeconds = Duration.between(now, sale.getEndTime()).getSeconds();
        }

        List<FlashSaleItemResponse> activeItems = List.of();
        if (sale.getItems() != null) {
            activeItems = sale.getItems().stream()
                    .map(this::toItemResponse)
                    .toList();
        }

        return new PublicFlashSaleResponse(
                sale.getId(),
                sale.getName(),
                sale.getStartTime(),
                sale.getEndTime(),
                sale.getStatus(),
                remainingSeconds,
                activeItems
        );
    }
}
