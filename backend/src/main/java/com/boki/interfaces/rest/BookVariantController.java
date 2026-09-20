package com.boki.interfaces.rest;

import com.boki.application.dto.request.BookVariantRequest;
import com.boki.application.dto.response.BookVariantResponse;
import com.boki.infrastructure.persistence.entity.BookJpaEntity;
import com.boki.infrastructure.persistence.entity.BookVariantJpaEntity;
import com.boki.infrastructure.persistence.repository.BookJpaRepository;
import com.boki.infrastructure.persistence.repository.BookVariantJpaRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/books/{bookId}/variants")
public class BookVariantController {

    private final BookVariantJpaRepository variantRepository;
    private final BookJpaRepository bookRepository;
    private final ObjectMapper objectMapper;

    public BookVariantController(
            BookVariantJpaRepository variantRepository,
            BookJpaRepository bookRepository,
            ObjectMapper objectMapper
    ) {
        this.variantRepository = variantRepository;
        this.bookRepository = bookRepository;
        this.objectMapper = objectMapper;
    }

    @GetMapping
    public ResponseEntity<List<BookVariantResponse>> getVariants(@PathVariable String bookId) {
        UUID uuid = parseUUID(bookId);
        if (uuid == null) {
            return ResponseEntity.ok(Collections.emptyList());
        }

        List<BookVariantResponse> variants = variantRepository.findByBookId(uuid)
                .stream()
                .map(this::mapToResponse)
                .toList();
        return ResponseEntity.ok(variants);
    }

    @PutMapping
    @Transactional
    public ResponseEntity<List<BookVariantResponse>> updateVariants(
            @PathVariable String bookId,
            @RequestBody List<@Valid BookVariantRequest> requests
    ) {
        UUID uuid = parseUUID(bookId);
        if (uuid == null) {
            // For frontend local mock items (e.g., 'b1', 'b2')
            List<BookVariantResponse> mockResponse = (requests != null ? requests : Collections.<BookVariantRequest>emptyList())
                    .stream()
                    .map(req -> new BookVariantResponse(
                            req.id() != null ? req.id() : "v_" + UUID.randomUUID(),
                            bookId,
                            req.sku(),
                            req.name(),
                            req.price(),
                            req.originalPrice(),
                            req.stockQuantity(),
                            req.imageUrl(),
                            req.attributes(),
                            req.attributesJson(),
                            req.isStandaloneDisplay() != null ? req.isStandaloneDisplay() : true,
                            java.time.Instant.now(),
                            java.time.Instant.now()
                    ))
                    .toList();
            return ResponseEntity.ok(mockResponse);
        }

        BookJpaEntity book = bookRepository.findById(uuid)
                .orElseThrow(() -> new IllegalArgumentException("Book not found with id: " + bookId));

        // Remove existing variants for this book
        List<BookVariantJpaEntity> existing = variantRepository.findByBookId(uuid);
        if (!existing.isEmpty()) {
            variantRepository.deleteAll(existing);
            variantRepository.flush();
        }

        // Save new variants list
        List<BookVariantJpaEntity> toSave = new ArrayList<>();
        if (requests != null) {
            for (BookVariantRequest req : requests) {
                BookVariantJpaEntity entity = new BookVariantJpaEntity();
                entity.setBook(book);
                entity.setName(req.name());
                entity.setSku(req.sku());
                entity.setPrice(req.price());
                entity.setOriginalPrice(req.originalPrice());
                entity.setStockQuantity(req.stockQuantity());
                entity.setImageUrl(req.imageUrl());

                // Convert attributes Map to JSON string if present
                String jsonAttr = req.attributesJson();
                if ((jsonAttr == null || jsonAttr.isBlank()) && req.attributes() != null) {
                    try {
                        jsonAttr = objectMapper.writeValueAsString(req.attributes());
                    } catch (Exception ignored) {}
                }
                entity.setAttributesJson(jsonAttr);
                entity.setStandaloneDisplay(req.isStandaloneDisplay() != null ? req.isStandaloneDisplay() : true);
                toSave.add(entity);
            }
        }

        List<BookVariantJpaEntity> saved = variantRepository.saveAll(toSave);

        // Synchronize parent book stock quantity and status with the sum of variants
        if (!toSave.isEmpty()) {
            int totalVariantStock = toSave.stream().mapToInt(BookVariantJpaEntity::getStockQuantity).sum();
            book.setStockQuantity(totalVariantStock);
            if (totalVariantStock == 0 && !book.isPreOrder()) {
                book.setStatus(BookJpaEntity.BookStatusJpa.SOLD);
            } else if (totalVariantStock > 0 && book.getStatus() == BookJpaEntity.BookStatusJpa.SOLD) {
                book.setStatus(BookJpaEntity.BookStatusJpa.ACTIVE);
            }
            book.setUpdatedAt(java.time.Instant.now());
            bookRepository.save(book);
        }

        List<BookVariantResponse> response = saved.stream()
                .map(this::mapToResponse)
                .toList();

        return ResponseEntity.ok(response);
    }

    private BookVariantResponse mapToResponse(BookVariantJpaEntity v) {
        Map<String, String> attrMap = null;
        if (v.getAttributesJson() != null && !v.getAttributesJson().isBlank()) {
            try {
                attrMap = objectMapper.readValue(v.getAttributesJson(), new TypeReference<Map<String, String>>() {});
            } catch (Exception ignored) {}
        }

        return new BookVariantResponse(
                v.getId().toString(),
                v.getBook().getId().toString(),
                v.getSku(),
                v.getName(),
                v.getPrice(),
                v.getOriginalPrice(),
                v.getStockQuantity(),
                v.getImageUrl(),
                attrMap,
                v.getAttributesJson(),
                v.isStandaloneDisplay(),
                v.getCreatedAt(),
                v.getUpdatedAt()
        );
    }

    private UUID parseUUID(String str) {
        try {
            return UUID.fromString(str);
        } catch (Exception e) {
            return null;
        }
    }
}
