package com.boki.application.port.in;

import com.boki.application.dto.response.BookResponse;

import java.util.List;

public interface GetComboUseCase {
    List<BookResponse> getCombos(int page, int size);
    List<BookResponse> getCombosForBook(String idOrSlug);
}
