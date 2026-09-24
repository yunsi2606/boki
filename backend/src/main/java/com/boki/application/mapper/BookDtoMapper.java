package com.boki.application.mapper;

import com.boki.application.dto.response.BookResponse;
import com.boki.application.dto.response.BookVariantResponse;
import com.boki.domain.model.book.Book;
import com.boki.domain.model.user.User;
import com.boki.domain.model.user.UserId;
import com.boki.domain.port.out.UserRepository;
import com.boki.infrastructure.persistence.entity.BookVariantJpaEntity;
import com.boki.infrastructure.persistence.repository.BookVariantJpaRepository;
import com.boki.infrastructure.util.SlugUtils;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.stream.Collectors;

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
        List<BookResponse> list = toResponseList(Collections.singletonList(book));
        return list.isEmpty() ? null : list.get(0);
    }

    public List<BookResponse> toResponseList(List<Book> books) {
        if (books == null || books.isEmpty()) {
            return Collections.emptyList();
        }

        // 1. Batch load / cache seller display names for all distinct sellers
        Map<UserId, String> sellerNameMap = new HashMap<>();
        for (Book book : books) {
            if (book != null && book.getSellerId() != null && !sellerNameMap.containsKey(book.getSellerId())) {
                String sellerName = userRepository.findById(book.getSellerId())
                        .map(User::getDisplayName)
                        .orElse("Người bán Boki");
                sellerNameMap.put(book.getSellerId(), sellerName);
            }
        }

        // 2. Batch load all variants for all books in a single database round-trip
        List<UUID> bookIds = books.stream()
                .filter(Objects::nonNull)
                .map(b -> b.getId().value())
                .collect(Collectors.toList());

        Map<UUID, List<BookVariantResponse>> variantsByBookId = new HashMap<>();
        if (variantRepository != null && !bookIds.isEmpty()) {
            List<BookVariantJpaEntity> variantEntities = variantRepository.findByBookIds(bookIds);
            for (BookVariantJpaEntity v : variantEntities) {
                if (v.getBook() != null && v.getBook().getId() != null) {
                    UUID bId = v.getBook().getId();
                    variantsByBookId.computeIfAbsent(bId, k -> new ArrayList<>())
                            .add(toVariantResponse(v));
                }
            }
        }

        // 3. Map books to BookResponse with pre-fetched relations
        return books.stream()
                .filter(Objects::nonNull)
                .map(book -> {
                    String sellerName = sellerNameMap.getOrDefault(book.getSellerId(), "Người bán Boki");
                    String slug = SlugUtils.slugify(book.getTitle());
                    List<BookVariantResponse> variants = variantsByBookId.getOrDefault(
                            book.getId().value(),
                            Collections.emptyList()
                    );

                    int effectiveStock = (!variants.isEmpty())
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
                })
                .collect(Collectors.toList());
    }

    private BookVariantResponse toVariantResponse(BookVariantJpaEntity v) {
        return new BookVariantResponse(
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
        );
    }
}
