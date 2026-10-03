package com.boki.interfaces.rest;

import com.boki.application.dto.request.FlashSaleRequest;
import com.boki.application.dto.response.FlashSaleResponse;
import com.boki.application.service.FlashSaleApplicationService;
import com.boki.domain.model.flashsale.FlashSaleStatus;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/flash-sales")
@PreAuthorize("hasAnyRole('ADMIN', 'SELLER')")
public class AdminFlashSaleController {

    private final FlashSaleApplicationService flashSaleService;

    public AdminFlashSaleController(FlashSaleApplicationService flashSaleService) {
        this.flashSaleService = flashSaleService;
    }

    @GetMapping
    public ResponseEntity<List<FlashSaleResponse>> getAllFlashSales() {
        return ResponseEntity.ok(flashSaleService.getAllFlashSales());
    }

    @GetMapping("/{id}")
    public ResponseEntity<FlashSaleResponse> getFlashSaleById(@PathVariable UUID id) {
        return ResponseEntity.ok(flashSaleService.getFlashSaleById(id));
    }

    @PostMapping
    public ResponseEntity<FlashSaleResponse> createFlashSale(@Valid @RequestBody FlashSaleRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(flashSaleService.createFlashSale(req));
    }

    @PutMapping("/{id}")
    public ResponseEntity<FlashSaleResponse> updateFlashSale(
            @PathVariable UUID id,
            @Valid @RequestBody FlashSaleRequest req
    ) {
        return ResponseEntity.ok(flashSaleService.updateFlashSale(id, req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFlashSale(@PathVariable UUID id) {
        flashSaleService.deleteFlashSale(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<FlashSaleResponse> updateStatus(
            @PathVariable UUID id,
            @RequestParam FlashSaleStatus status
    ) {
        return ResponseEntity.ok(flashSaleService.updateStatus(id, status));
    }
}
