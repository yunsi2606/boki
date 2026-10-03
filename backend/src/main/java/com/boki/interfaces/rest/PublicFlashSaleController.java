package com.boki.interfaces.rest;

import com.boki.application.dto.response.PublicFlashSaleResponse;
import com.boki.application.service.FlashSaleApplicationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/flash-sales")
public class PublicFlashSaleController {

    private final FlashSaleApplicationService flashSaleService;

    public PublicFlashSaleController(FlashSaleApplicationService flashSaleService) {
        this.flashSaleService = flashSaleService;
    }

    @GetMapping("/active")
    public ResponseEntity<PublicFlashSaleResponse> getActiveFlashSale() {
        return flashSaleService.getActiveFlashSale()
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }

    @GetMapping("/upcoming")
    public ResponseEntity<List<PublicFlashSaleResponse>> getUpcomingOrActiveSales() {
        return ResponseEntity.ok(flashSaleService.getUpcomingOrActiveSales());
    }
}
