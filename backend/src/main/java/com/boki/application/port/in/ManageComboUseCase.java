package com.boki.application.port.in;

import com.boki.application.dto.request.CreateComboRequest;
import com.boki.application.dto.request.UpdateComboRequest;
import com.boki.application.dto.response.BookResponse;

import java.util.UUID;

public interface ManageComboUseCase {
    BookResponse createCombo(CreateComboRequest request, String sellerEmail);
    BookResponse updateCombo(UUID comboId, UpdateComboRequest request, String sellerEmail);
    void deleteCombo(UUID comboId, String sellerEmail);
}
