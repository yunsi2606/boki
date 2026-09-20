package com.boki.application.mapper;

import com.boki.application.dto.response.BookResponse;
import com.boki.application.dto.response.BookVariantResponse;
import com.boki.domain.model.book.Book;
import com.boki.domain.port.out.UserRepository;
import com.boki.infrastructure.persistence.repository.BookVariantJpaRepository;
import com.boki.infrastructure.util.SlugUtils;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;

@Component
public class BookDtoMapper {

    private final UserRepository userRepository;
    private final BookVariantJpaRepository variantRepository;

    public BookDtoMapper(UserRepository userRepository, BookVariantJpaRepository variantRepository) {
        this.userRepository = userRepository;
        this.variantRepository = variantRepository;
    }

    public BookResponse toResponse(Book book) {
        if (book == null) {
            return null;
        }

        String sellerName = userRepository.findById(book.getSellerId())
                .map(user -> user.getDisplayName())
                .orElse("Người bán Boki");

        String slug = SlugUtils.slugify(book.getTitle());

        List<BookVariantResponse> variants = Collections.emptyList();
        if (variantRepository != null && book.getId() != null) {
            variants = variantRepository.findByBookId(book.getId().value())
                    .stream()
                    .map(v -> new BookVariantResponse(
                            v.getId().toString(),
                            v.getBook().getId().toString(),
                            v.getSku(),
                            v.getName(),
                            v.getPrice(),
                            v.getOriginalPrice(),
                            v.getStockQuantity(),
                            v.getImageUrl(),
                            null,
                            v.getAttributesJson(),
                            v.isStandaloneDisplay(),
                            v.getCreatedAt(),
                            v.getUpdatedAt()
                    ))
                    .toList();
        }

        int effectiveStock = (variants != null && !variants.isEmpty())
                ? variants.stream().mapToInt(BookVariantResponse::stockQuantity).sum()
                : book.getStockQuantity();

        return new BookResponse(
                book.getId().value(),
                book.getSellerId().value(),
                sellerName,
                book.getCategoryId(),
                book.getTitle(),
                slug,
                book.getAuthor(),
                book.getIsbn(),
                book.getPublisher(),
                book.getSupplier(),
                book.getPublicationDetails(),
                book.getDescription(),
                book.getPrice().amount(),
                book.getOriginalPrice() != null ? book.getOriginalPrice().amount() : null,
                book.getPrice().currency(),
                book.getCondition().name(),
                book.getStatus().name(),
                effectiveStock,
                book.isPreOrder(),
                book.getPreOrderDays(),
                book.getViewsCount(),
                book.getRating(),
                book.getReviewsCount(),
                book.getImageUrls(),
                variants,
                book.getCreatedAt(),
                book.getUpdatedAt()
        );
    }
}
