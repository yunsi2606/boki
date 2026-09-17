package com.boki.application.service;

import com.boki.infrastructure.persistence.entity.StoreConfigJpaEntity;
import com.boki.infrastructure.persistence.repository.StoreConfigJpaRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;

@Service
public class VNPayPaymentService {

    private static final Logger log = LoggerFactory.getLogger(VNPayPaymentService.class);
    private static final String HMAC_SHA512 = "HmacSHA512";

    private final StoreConfigJpaRepository storeConfigRepository;

    public VNPayPaymentService(StoreConfigJpaRepository storeConfigRepository) {
        this.storeConfigRepository = storeConfigRepository;
    }

    public String getTmnCode() {
        return getConfig("vnpay_tmn_code", "BOKIST01");
    }

    public String getHashSecret() {
        return getConfig("vnpay_hash_secret", "BOKIVNPAYSECRETKEYHASH2026XYZABC");
    }

    public boolean isSandbox() {
        return "true".equalsIgnoreCase(getConfig("vnpay_sandbox_enabled", "true"));
    }

    public String getPaymentUrl() {
        return isSandbox()
                ? "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html"
                : "https://pay.vnpay.vn/vpcpay.html";
    }

    /**
     * Generates a signed VNPay payment URL conforming to VNPay API v2.1.0 specifications.
     */
    public String createPaymentUrl(UUID orderId, BigDecimal amount, String orderInfo, String returnUrl, String clientIp) {
        String vnp_Version = "2.1.0";
        String vnp_Command = "pay";
        String vnp_TmnCode = getTmnCode();

        // VNPay amount is multiplied by 100
        long amountVal = amount != null ? amount.multiply(BigDecimal.valueOf(100)).longValue() : 0L;

        Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        String vnp_CreateDate = formatter.format(cld.getTime());

        cld.add(Calendar.MINUTE, 15);
        String vnp_ExpireDate = formatter.format(cld.getTime());

        Map<String, String> vnp_Params = new HashMap<>();
        vnp_Params.put("vnp_Version", vnp_Version);
        vnp_Params.put("vnp_Command", vnp_Command);
        vnp_Params.put("vnp_TmnCode", vnp_TmnCode);
        vnp_Params.put("vnp_Amount", String.valueOf(amountVal));
        vnp_Params.put("vnp_CurrCode", "VND");
        vnp_Params.put("vnp_TxnRef", orderId.toString());
        vnp_Params.put("vnp_OrderInfo", orderInfo != null && !orderInfo.isBlank() ? orderInfo : "Thanh toan don hang Boki Store");
        vnp_Params.put("vnp_OrderType", "other");
        vnp_Params.put("vnp_Locale", "vn");
        vnp_Params.put("vnp_ReturnUrl", returnUrl);
        vnp_Params.put("vnp_IpAddr", clientIp != null && !clientIp.isBlank() ? clientIp : "127.0.0.1");
        vnp_Params.put("vnp_CreateDate", vnp_CreateDate);
        vnp_Params.put("vnp_ExpireDate", vnp_ExpireDate);

        // Sort parameters by key alphabetically (mandatory requirement of VNPay)
        List<String> fieldNames = new ArrayList<>(vnp_Params.keySet());
        Collections.sort(fieldNames);

        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();

        for (Iterator<String> itr = fieldNames.iterator(); itr.hasNext(); ) {
            String fieldName = itr.next();
            String fieldValue = vnp_Params.get(fieldName);
            if (fieldValue != null && !fieldValue.isEmpty()) {
                // Build hash data
                hashData.append(fieldName);
                hashData.append('=');
                hashData.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII));

                // Build query string
                query.append(URLEncoder.encode(fieldName, StandardCharsets.US_ASCII));
                query.append('=');
                query.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII));

                if (itr.hasNext()) {
                    query.append('&');
                    hashData.append('&');
                }
            }
        }

        String queryUrl = query.toString();
        String vnp_SecureHash = hmacSha512(getHashSecret(), hashData.toString());
        queryUrl += "&vnp_SecureHash=" + vnp_SecureHash;

        return getPaymentUrl() + "?" + queryUrl;
    }

    /**
     * Validates HMAC-SHA512 checksum on return callback / IPN from VNPay.
     */
    public boolean verifySignature(Map<String, String> fields) {
        if (fields == null || !fields.containsKey("vnp_SecureHash")) {
            return false;
        }

        String vnp_SecureHash = fields.get("vnp_SecureHash");

        Map<String, String> copy = new HashMap<>(fields);
        copy.remove("vnp_SecureHash");
        copy.remove("vnp_SecureHashType");

        List<String> fieldNames = new ArrayList<>(copy.keySet());
        Collections.sort(fieldNames);

        StringBuilder hashData = new StringBuilder();
        for (Iterator<String> itr = fieldNames.iterator(); itr.hasNext(); ) {
            String fieldName = itr.next();
            String fieldValue = copy.get(fieldName);
            if (fieldValue != null && !fieldValue.isEmpty()) {
                hashData.append(fieldName);
                hashData.append('=');
                hashData.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII));
                if (itr.hasNext()) {
                    hashData.append('&');
                }
            }
        }

        String checkHash = hmacSha512(getHashSecret(), hashData.toString());
        return checkHash.equalsIgnoreCase(vnp_SecureHash);
    }

    private String hmacSha512(String key, String data) {
        try {
            Mac mac = Mac.getInstance(HMAC_SHA512);
            SecretKeySpec secretKey = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), HMAC_SHA512);
            mac.init(secretKey);
            byte[] hash = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception e) {
            throw new RuntimeException("HMAC-SHA512 calculation failed", e);
        }
    }

    private String getConfig(String key, String defaultValue) {
        return storeConfigRepository.findById(key)
                .map(StoreConfigJpaEntity::getConfigValue)
                .filter(v -> !v.isBlank())
                .orElse(defaultValue);
    }
}
