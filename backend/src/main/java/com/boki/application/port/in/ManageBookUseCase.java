package com.boki.application.port.in;

import com.boki.application.dto.request.CreateBookRequest;
import com.boki.application.dto.request.UpdateBookRequest;
import com.boki.application.dto.response.BookResponse;

import java.util.UUID;

public interface ManageBookUseCase {

    BookResponse createBook(CreateBookRequest request, String sellerEmail);

    BookResponse updateBook(UUID bookId, UpdateBookRequest request, String sellerEmail);

    void deleteBook(UUID bookId, String sellerEmail);
}
