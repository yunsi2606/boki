package com.boki.interfaces.rest;

import com.boki.application.dto.request.CreateBookRequest;
import com.boki.application.dto.request.UpdateBookRequest;
import com.boki.application.dto.response.BookResponse;
import com.boki.application.port.in.GetBookUseCase;
import com.boki.application.port.in.ManageBookUseCase;
import com.boki.infrastructure.security.AuthenticatedUser;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/books")
public class BookController {

    private final ManageBookUseCase manageBookUseCase;
    private final GetBookUseCase getBookUseCase;

    public BookController(ManageBookUseCase manageBookUseCase, GetBookUseCase getBookUseCase) {
        this.manageBookUseCase = manageBookUseCase;
        this.getBookUseCase = getBookUseCase;
    }

    @GetMapping
    public ResponseEntity<List<BookResponse>> searchBooks(
            @RequestParam(required = false) Integer categoryId,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        List<BookResponse> response = getBookUseCase.searchBooks(categoryId, search, page, size);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/admin")
    public ResponseEntity<List<BookResponse>> getAdminBooks(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "100") int size
    ) {
        List<BookResponse> response = getBookUseCase.getAdminBooks(search, page, size);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{idOrSlug}")
    public ResponseEntity<BookResponse> getBook(@PathVariable String idOrSlug) {
        try {
            UUID uuid = UUID.fromString(idOrSlug);
            BookResponse response = getBookUseCase.getBook(uuid);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            BookResponse response = getBookUseCase.getBookBySlug(idOrSlug);
            return ResponseEntity.ok(response);
        }
    }

    @PostMapping("/{idOrSlug}/views")
    public ResponseEntity<Void> incrementViews(@PathVariable String idOrSlug) {
        getBookUseCase.incrementViews(idOrSlug);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/seller")
    public ResponseEntity<List<BookResponse>> getSellerBooks(
            @AuthenticationPrincipal AuthenticatedUser principal
    ) {
        List<BookResponse> response = getBookUseCase.getSellerBooks(principal.email());
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<BookResponse> createBook(
            @AuthenticationPrincipal AuthenticatedUser principal,
            @Valid @RequestBody CreateBookRequest request
    ) {
        BookResponse response = manageBookUseCase.createBook(request, principal.email());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<BookResponse> updateBook(
            @PathVariable UUID id,
            @AuthenticationPrincipal AuthenticatedUser principal,
            @Valid @RequestBody UpdateBookRequest request
    ) {
        BookResponse response = manageBookUseCase.updateBook(id, request, principal.email());
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBook(
            @PathVariable UUID id,
            @AuthenticationPrincipal AuthenticatedUser principal
    ) {
        manageBookUseCase.deleteBook(id, principal.email());
        return ResponseEntity.noContent().build();
    }
}
