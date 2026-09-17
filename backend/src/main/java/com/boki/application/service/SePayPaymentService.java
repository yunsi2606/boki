package com.boki.application.service;

import com.boki.application.dto.payment.SePayWebhookPayload;
import com.boki.infrastructure.persistence.entity.StoreConfigJpaEntity;
import com.boki.infrastructure.persistence.repository.StoreConfigJpaRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class SePayPaymentService {

    private static final Logger log = LoggerFactory.getLogger(SePayPaymentService.class);
    private static final Pattern PAYMENT_CODE_PATTERN = Pattern.compile("BOKI[A-Z0-9]{4,12}", Pattern.CASE_INSENSITIVE);

    private final StoreConfigJpaRepository storeConfigRepository;

    public SePayPaymentService(StoreConfigJpaRepository storeConfigRepository) {
        this.storeConfigRepository = storeConfigRepository;
    }

    public String getBankCode() {
        return getConfig("sepay_bank_code", "MBBank");
    }

    public String getAccountNumber() {
        return getConfig("sepay_account_number", "0868889999");
    }

    public String getAccountName() {
        return getConfig("sepay_account_name", "CONG TY CO PHAN BOKI STORE");
    }

    public String getApiKey() {
        return getConfig("sepay_api_key", "BOKI_SEPAY_SECURE_TOKEN_2026");
    }

    /**
     * Generates a dynamic VietQR image URL with order paymentCode and amount.
     * Uses SePay's official QR generator endpoint.
     */
    public String generateVietQrUrl(BigDecimal amount, String paymentCode) {
        String bank = getBankCode();
        String acc = getAccountNumber();
        String des = paymentCode != null ? paymentCode : "";
        String amountStr = amount != null ? amount.toBigInteger().toString() : "0";

        try {
            return String.format(
                    "https://qr.sepay.vn/img?bank=%s&acc=%s&template=compact&amount=%s&des=%s",
                    URLEncoder.encode(bank, StandardCharsets.UTF_8),
                    URLEncoder.encode(acc, StandardCharsets.UTF_8),
                    amountStr,
                    URLEncoder.encode(des, StandardCharsets.UTF_8)
            );
        } catch (Exception e) {
            log.error("Failed to generate SePay QR URL: {}", e.getMessage());
            return "https://qr.sepay.vn/img?bank=" + bank + "&acc=" + acc + "&amount=" + amountStr + "&des=" + des;
        }
    }

    /**
     * Extracts the BOKI payment code from SePay payload code or content string.
     */
    public String extractPaymentCode(SePayWebhookPayload payload) {
        if (payload == null) {
            return null;
        }

        // 1. Direct code field from SePay
        if (payload.code() != null && !payload.code().isBlank()) {
            String c = payload.code().trim().toUpperCase();
            if (c.startsWith("BOKI")) {
                return c;
            }
        }

        // 2. Scan transfer content for BOKI...
        if (payload.content() != null && !payload.content().isBlank()) {
            Matcher matcher = PAYMENT_CODE_PATTERN.matcher(payload.content());
            if (matcher.find()) {
                return matcher.group().toUpperCase();
            }
        }

        return payload.code();
    }

    /**
     * Validates incoming Authorization header against configured SePay API key (if set).
     */
    public boolean validateAuth(String authHeader) {
        String configuredKey = getApiKey();
        if (configuredKey == null || configuredKey.isBlank()) {
            return true; // No key restriction set
        }
        if (authHeader == null || authHeader.isBlank()) {
            return false;
        }
        // Accepts either "Apikey <TOKEN>" or "Bearer <TOKEN>" or direct "<TOKEN>"
        String token = authHeader.replace("Apikey ", "")
                .replace("apikey ", "")
                .replace("Bearer ", "")
                .replace("bearer ", "")
                .trim();
        return configuredKey.equals(token);
    }

    private String getConfig(String key, String defaultValue) {
        return storeConfigRepository.findById(key)
                .map(StoreConfigJpaEntity::getConfigValue)
                .filter(v -> !v.isBlank())
                .orElse(defaultValue);
    }
}
