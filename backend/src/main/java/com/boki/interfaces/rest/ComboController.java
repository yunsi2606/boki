package com.boki.interfaces.rest;

import com.boki.application.dto.request.CreateComboRequest;
import com.boki.application.dto.request.UpdateComboRequest;
import com.boki.application.dto.response.BookResponse;
import com.boki.application.port.in.GetComboUseCase;
import com.boki.application.port.in.ManageComboUseCase;
import com.boki.infrastructure.security.AuthenticatedUser;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/combos")
public class ComboController {

    private final ManageComboUseCase manageComboUseCase;
    private final GetComboUseCase getComboUseCase;

    public ComboController(ManageComboUseCase manageComboUseCase, GetComboUseCase getComboUseCase) {
        this.manageComboUseCase = manageComboUseCase;
        this.getComboUseCase = getComboUseCase;
    }

    @GetMapping
    public ResponseEntity<List<BookResponse>> getCombos(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(getComboUseCase.getCombos(page, size));
    }

    @GetMapping("/for-book/{idOrSlug}")
    public ResponseEntity<List<BookResponse>> getCombosForBook(@PathVariable String idOrSlug) {
        return ResponseEntity.ok(getComboUseCase.getCombosForBook(idOrSlug));
    }

    @PostMapping
    public ResponseEntity<BookResponse> createCombo(
            @AuthenticationPrincipal AuthenticatedUser principal,
            @Valid @RequestBody CreateComboRequest request
    ) {
        BookResponse response = manageComboUseCase.createCombo(request, principal.email());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<BookResponse> updateCombo(
            @PathVariable UUID id,
            @AuthenticationPrincipal AuthenticatedUser principal,
            @Valid @RequestBody UpdateComboRequest request
    ) {
        BookResponse response = manageComboUseCase.updateCombo(id, request, principal.email());
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCombo(
            @PathVariable UUID id,
            @AuthenticationPrincipal AuthenticatedUser principal
    ) {
        manageComboUseCase.deleteCombo(id, principal.email());
        return ResponseEntity.noContent().build();
    }
}
