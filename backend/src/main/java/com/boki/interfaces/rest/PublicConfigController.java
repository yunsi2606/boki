package com.boki.interfaces.rest;

import com.boki.infrastructure.persistence.entity.StoreConfigJpaEntity;
import com.boki.infrastructure.persistence.entity.VoucherJpaEntity;
import com.boki.infrastructure.persistence.repository.StoreConfigJpaRepository;
import com.boki.infrastructure.persistence.repository.VoucherJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/public")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PublicConfigController {

    private final StoreConfigJpaRepository storeConfigRepository;
    private final VoucherJpaRepository voucherRepository;

    @GetMapping("/config")
    public ResponseEntity<Map<String, String>> getPublicConfig() {
        List<StoreConfigJpaEntity> configs = storeConfigRepository.findAll();
        Map<String, String> configMap = new HashMap<>();
        for (StoreConfigJpaEntity config : configs) {
            configMap.put(config.getConfigKey(), config.getConfigValue());
        }
        return ResponseEntity.ok(configMap);
    }

    @GetMapping("/vouchers")
    public ResponseEntity<List<VoucherJpaEntity>> getActiveVouchers() {
        List<VoucherJpaEntity> activeVouchers = voucherRepository.findByIsActiveTrue();
        return ResponseEntity.ok(activeVouchers);
    }
}
