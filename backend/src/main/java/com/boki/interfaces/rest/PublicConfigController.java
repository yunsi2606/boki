package com.boki.interfaces.rest;

import com.boki.application.service.PublicConfigService;
import com.boki.infrastructure.persistence.entity.VoucherJpaEntity;
import com.boki.infrastructure.persistence.repository.VoucherJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/public")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PublicConfigController {

    private final PublicConfigService publicConfigService;
    private final VoucherJpaRepository voucherRepository;

    @GetMapping("/config")
    public ResponseEntity<Map<String, String>> getPublicConfig() {
        return ResponseEntity.ok(publicConfigService.getPublicConfig());
    }

    @GetMapping("/vouchers")
    public ResponseEntity<List<VoucherJpaEntity>> getActiveVouchers() {
        List<VoucherJpaEntity> activeVouchers = voucherRepository.findByIsActiveTrue();
        return ResponseEntity.ok(activeVouchers);
    }
}
