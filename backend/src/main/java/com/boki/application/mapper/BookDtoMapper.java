package com.boki.application.mapper;

import com.boki.application.dto.response.BookResponse;
import com.boki.domain.model.book.Book;
import com.boki.domain.port.out.UserRepository;
import org.springframework.stereotype.Component;

@Component
public class BookDtoMapper {

    private final UserRepository userRepository;

    public BookDtoMapper(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public BookResponse toResponse(Book book) {
        if (book == null) {
            return null;
        }

        String sellerName = userRepository.findById(book.getSellerId())
                .map(user -> user.getDisplayName())
                .orElse("Người bán Boki");

        return new BookResponse(
                book.getId().value(),
                book.getSellerId().value(),
                sellerName,
                book.getCategoryId(),
                book.getTitle(),
                book.getAuthor(),
                book.getIsbn(),
                book.getDescription(),
                book.getPrice().amount(),
                book.getPrice().currency(),
                book.getCondition().name(),
                book.getStatus().name(),
                book.getStockQuantity(),
                book.getImageUrls(),
                book.getCreatedAt(),
                book.getUpdatedAt()
        );
    }
}
