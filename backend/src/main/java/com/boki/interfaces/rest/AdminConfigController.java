package com.boki.interfaces.rest;

import com.boki.infrastructure.persistence.entity.StoreConfigJpaEntity;
import com.boki.infrastructure.persistence.repository.StoreConfigJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/config")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AdminConfigController {

    private final StoreConfigJpaRepository storeConfigRepository;

    @GetMapping
    public ResponseEntity<List<StoreConfigJpaEntity>> getAllConfigs() {
        return ResponseEntity.ok(storeConfigRepository.findAll());
    }

    @PutMapping
    public ResponseEntity<Map<String, String>> updateConfigs(@RequestBody Map<String, String> configs) {
        for (Map.Entry<String, String> entry : configs.entrySet()) {
            StoreConfigJpaEntity entity = storeConfigRepository.findById(entry.getKey())
                    .orElseGet(() -> StoreConfigJpaEntity.builder().configKey(entry.getKey()).build());
            entity.setConfigValue(entry.getValue());
            storeConfigRepository.save(entity);
        }
        return ResponseEntity.ok(configs);
    }
}
