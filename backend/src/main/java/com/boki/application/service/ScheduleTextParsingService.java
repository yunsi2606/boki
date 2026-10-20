package com.boki.application.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.*;

@Slf4j
@Service
public class ScheduleTextParsingService {

    @Value("${boki.ai.gemini.api-key:}")
    private String configuredGeminiKey;

    @Value("${boki.ai.gemini.model:gemini-3.8-flash}")
    private String geminiModel;

    private final RestClient restClient;
    private final ObjectMapper objectMapper;

    public ScheduleTextParsingService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
        this.restClient = RestClient.builder().build();
    }

    public Map<String, Object> parseScheduleText(String text, String customApiKey) {
        if (text == null || text.isBlank()) {
            return Collections.emptyMap();
        }

        String activeKey = (customApiKey != null && !customApiKey.isBlank())
                ? customApiKey.trim()
                : configuredGeminiKey;

        if (activeKey == null || activeKey.isBlank()) {
            throw new IllegalArgumentException("Chưa cấu hình Gemini API Key.");
        }

        try {
            String rawJson = callGeminiWithFallback(text, activeKey);
            return objectMapper.readValue(rawJson, new TypeReference<Map<String, Object>>() {});
        } catch (Exception e) {
            log.error("Failed to parse schedule text via Gemini AI: {}", e.getMessage(), e);
            throw new RuntimeException("Lỗi phân tích văn bản AI: " + e.getMessage(), e);
        }
    }

    private String callGeminiWithFallback(String userText, String apiKey) throws Exception {
        List<String> candidates = new ArrayList<>();
        if (geminiModel != null && !geminiModel.isBlank() && !geminiModel.contains("1.5")) {
            candidates.add(geminiModel.trim());
        }
        if (!candidates.contains("gemini-3.8-flash")) candidates.add("gemini-3.8-flash");
        if (!candidates.contains("gemini-flash-latest")) candidates.add("gemini-flash-latest");
        if (!candidates.contains("gemini-1.5-flash")) candidates.add("gemini-1.5-flash");
        if (!candidates.contains("gemini-2.0-flash")) candidates.add("gemini-2.0-flash");

        Exception lastEx = null;
        for (String modelName : candidates) {
            try {
                return executeGeminiCall(modelName, userText, apiKey);
            } catch (Exception e) {
                lastEx = e;
                log.warn("Model {} failed for text parsing: {}, trying next candidate...", modelName, e.getMessage());
            }
        }
        throw lastEx != null ? lastEx : new IllegalStateException("Không có model Gemini nào phản hồi");
    }

    private String executeGeminiCall(String modelName, String userText, String apiKey) {
        String url = String.format("https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s",
                modelName, apiKey);

        String prompt = "Bạn là trợ lý AI chuyên gia bóc tách thông tin xuất bản sách / manga của Việt Nam từ đoạn văn bản người dùng cung cấp.\n"
                + "LƯU Ý QUAN TRỌNG: Văn bản có thể KHÔNG ĐẦY ĐỦ THÔNG TIN, chỉ có 1 vài trường ngắn.\n"
                + "Nhiệm vụ: Bóc tách các trường sau NẾU CÓ TRONG VĂN BẢN (trường nào không có thì BỎ QUA hoặc ĐỂ NULL, KHÔNG TỰ BỊA RA):\n"
                + "- title: tựa đề sách/truyện\n"
                + "- originalTitle: tên gốc tiếng Nhật/Anh nếu có\n"
                + "- publisher: nhà xuất bản (Kim Đồng, Trẻ, IPM, Nhã Nam, AZ Việt Nam...)\n"
                + "- author: tác giả (nếu có)\n"
                + "- artist: họa sĩ (nếu có)\n"
                + "- imprint: nhãn/đơn vị phát hành (nếu có)\n"
                + "- genres: chuỗi các thể loại cách nhau bởi dấu phẩy nếu có\n"
                + "- format: MANGA hoặc LIGHT_NOVEL hoặc COMIC hoặc ARTBOOK\n"
                + "- releaseDate: ngày phát hành định dạng YYYY-MM-DD\n"
                + "- preOrderDate: ngày đặt trước YYYY-MM-DD (nếu có)\n"
                + "- specs: object chứa thông số kỹ thuật (ví dụ: {\"Khổ sách\": \"...\", \"Số trang\": \"...\", \"Loại bìa\": \"...\", \"Dịch giả\": \"...\"})\n"
                + "- editions: mảng phiên bản (mỗi phần tử: {\"editionName\": \"Bản Phổ Thông\", \"editionType\": \"STANDARD\", \"estimatedPrice\": 35000, \"gifts\": \"...\"})\n"
                + "- description: tóm tắt/mô tả nếu có.\n"
                + "Chỉ trả về JSON thuần hợp lệ:\n"
                + "VĂN BẢN ĐẦU VÀO:\n" + userText;

        Map<String, Object> payload = Map.of(
                "contents", List.of(Map.of("role", "user", "parts", List.of(Map.of("text", prompt)))),
                "generationConfig", Map.of("responseMimeType", "application/json", "temperature", 0.1)
        );

        Map<?, ?> response = restClient.post()
                .uri(url)
                .contentType(MediaType.APPLICATION_JSON)
                .body(payload)
                .retrieve()
                .body(Map.class);

        if (response != null && response.containsKey("candidates")) {
            List<?> candidates = (List<?>) response.get("candidates");
            if (!candidates.isEmpty()) {
                Map<?, ?> first = (Map<?, ?>) candidates.get(0);
                Map<?, ?> content = (Map<?, ?>) first.get("content");
                if (content != null && content.containsKey("parts")) {
                    List<?> parts = (List<?>) content.get("parts");
                    for (Object pObj : parts) {
                        Map<?, ?> part = (Map<?, ?>) pObj;
                        if (part.containsKey("text")) {
                            return cleanJson((String) part.get("text"));
                        }
                    }
                }
            }
        }
        throw new IllegalStateException("Không nhận được nội dung từ Gemini");
    }

    private String cleanJson(String raw) {
        if (raw == null) return "{}";
        String cleaned = raw.trim();
        if (cleaned.startsWith("```json")) {
            cleaned = cleaned.substring(7);
        } else if (cleaned.startsWith("```")) {
            cleaned = cleaned.substring(3);
        }
        if (cleaned.endsWith("```")) {
            cleaned = cleaned.substring(0, cleaned.length() - 3);
        }
        return cleaned.trim();
    }
}
