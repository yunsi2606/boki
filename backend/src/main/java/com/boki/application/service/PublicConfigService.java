package com.boki.application.service;

import com.boki.infrastructure.persistence.entity.StoreConfigJpaEntity;
import com.boki.infrastructure.persistence.repository.StoreConfigJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.Set;

/**
 * Exposes only whitelisted store configuration keys to unauthenticated clients.
 * Secrets (payment keys, carrier tokens...) must never be returned here.
 */
@Service
@RequiredArgsConstructor
public class PublicConfigService {

    private static final Set<String> PUBLIC_KEYS = Set.of("homepage_config", "store_general");

    private final StoreConfigJpaRepository storeConfigRepository;

    public Map<String, String> getPublicConfig() {
        Map<String, String> result = new HashMap<>();
        for (StoreConfigJpaEntity config : storeConfigRepository.findAllById(PUBLIC_KEYS)) {
            result.put(config.getConfigKey(), config.getConfigValue());
        }
        return result;
    }
}
