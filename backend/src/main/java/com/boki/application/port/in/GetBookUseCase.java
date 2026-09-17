package com.boki.application.port.in;

import com.boki.application.dto.response.BookResponse;
import java.util.List;
import java.util.UUID;

public interface GetBookUseCase {

    BookResponse getBook(UUID bookId);

    BookResponse getBookBySlug(String slug);

    List<BookResponse> searchBooks(Integer categoryId, String query, int page, int size);

    List<BookResponse> getAdminBooks(String query, int page, int size);

    List<BookResponse> getSellerBooks(String sellerEmail);

    void incrementViews(String idOrSlug);
}
