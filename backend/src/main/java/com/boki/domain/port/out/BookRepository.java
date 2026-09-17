package com.boki.domain.port.out;

import com.boki.domain.model.book.Book;
import com.boki.domain.model.book.BookId;
import com.boki.domain.model.book.BookStatus;
import com.boki.domain.model.user.UserId;

import java.util.List;
import java.util.Optional;

/**
 * Port (outbound) for book persistence.
 */
public interface BookRepository {

    Book save(Book book);

    Optional<Book> findById(BookId id);

    Optional<Book> findBySlug(String slug);

    List<Book> findByStatus(BookStatus status, int page, int size);

    List<Book> findBySellerId(UserId sellerId);

    List<Book> searchActive(Integer categoryId, String query, int page, int size);

    List<Book> searchAll(String query, int page, int size);

    void deleteById(BookId id);

    void incrementViews(BookId id);
}
