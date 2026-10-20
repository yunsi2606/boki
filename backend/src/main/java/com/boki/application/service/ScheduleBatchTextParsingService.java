package com.boki.application.service;

import com.boki.application.dto.schedule.BatchParseTextRequest;
import com.boki.application.dto.schedule.OcrParsedBookItemDto;
import com.boki.application.dto.schedule.OcrScheduleScanResponse;
import com.boki.domain.model.schedule.ReleaseEditionType;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;

@Slf4j
@Service
public class ScheduleBatchTextParsingService {

    @Value("${boki.ai.gemini.api-key:}")
    private String configuredGeminiKey;

    @Value("${boki.ai.gemini.model:gemini-3.8-flash}")
    private String geminiModel;

    private final ScheduleSeriesMatchingService matchingService;
    private final RestClient restClient;
    private final ObjectMapper objectMapper;

    public ScheduleBatchTextParsingService(ScheduleSeriesMatchingService matchingService, ObjectMapper objectMapper) {
        this.matchingService = matchingService;
        this.objectMapper = objectMapper;
        this.restClient = RestClient.builder().build();
    }

    public OcrScheduleScanResponse parseBatchText(BatchParseTextRequest req) {
        if (req == null || req.getText() == null || req.getText().isBlank()) {
            throw new IllegalArgumentException("Nội dung văn bản không được để trống");
        }

        String activeKey = (req.getApiKey() != null && !req.getApiKey().isBlank())
                ? req.getApiKey().trim() : configuredGeminiKey;

        if (activeKey == null || activeKey.isBlank()) {
            throw new IllegalArgumentException("Chưa cấu hình Gemini API Key. Vui lòng nhập API Key.");
        }

        try {
            String rawJson = callGeminiWithFallback(req, activeKey);
            return processJsonResponse(rawJson, req);
        } catch (Exception e) {
            log.error("Failed to parse schedule batch text via Gemini AI: {}", e.getMessage(), e);
            throw new RuntimeException("Lỗi phân tích văn bản AI: " + e.getMessage(), e);
        }
    }

    private String callGeminiWithFallback(BatchParseTextRequest req, String apiKey) throws Exception {
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
                return executeGeminiCall(modelName, req, apiKey);
            } catch (Exception e) {
                lastEx = e;
                log.warn("Model {} failed for batch text parsing: {}, trying next candidate...", modelName, e.getMessage());
            }
        }
        throw lastEx != null ? lastEx : new IllegalStateException("Không có model Gemini nào phản hồi");
    }

    private String executeGeminiCall(String modelName, BatchParseTextRequest req, String apiKey) {
        String url = String.format("https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s",
                modelName, apiKey);

        int targetYear = req.getYear() != null ? req.getYear() : LocalDate.now().getYear();
        int targetMonth = req.getMonth() != null ? req.getMonth() : LocalDate.now().getMonthValue();
        String targetPub = req.getPublisher() != null && !req.getPublisher().isBlank() ? req.getPublisher().trim() : "IPM";

        String prompt = "Bạn là chuyên gia bóc tách lịch xuất bản manga / sách hàng tháng tại Việt Nam từ văn bản plain text (thường từ bài đăng fanpage của IPM, Kim Đồng, Trẻ, Nhã Nam, AZ...).\n"
                + "Nhiệm vụ:\n"
                + "1. Nhận diện các ngày phát hành trong văn bản (ví dụ '1.9', '1/9', '01/09', 'Ngày 1' => ngày 1; '9.9' => ngày 9).\n"
                + "2. Với mỗi ngày, bóc tách các đầu sách được liệt kê bên dưới ngày đó:\n"
                + "   - day: số ngày trong tháng (1-31)\n"
                + "   - title: Tựa đề sách/truyện. Hãy chuẩn hóa viết hoa chữ cái đầu (Title Case) thay vì IN HOA TOÀN BỘ. Bỏ emoji (như ✏️, 🌸, ⚡). Kèm số tập trong ngoặc nếu có, ví dụ: 'Phải Lòng Chị Của Bạn Thân (Tập 4)'.\n"
                + "   - volume: số tập (ví dụ 'Tập 4', 'Tập 1').\n"
                + "   - isNew: true nếu có từ khóa (NEW), [NEW], MỚI; ngược lại false.\n"
                + "   - price: giá bìa (số nguyên VND). Nếu văn bản KHÔNG GHI GIÁ TIỀN, bắt buộc để null.\n"
                + "3. QUY TẮC ĐẶC BIỆT: Nếu gặp dải tập như 'CHẠY TRỐN CÓ ĐÔI - 1 ĐẾN 4' hoặc '1 - 4', hãy TỰ ĐỘNG TÁCH THÀNH 4 ĐẦU SÁCH RIÊNG BIỆT (Tập 1, Tập 2, Tập 3, Tập 4) cùng ngày đó.\n"
                + "Thông tin mặc định: Năm = " + targetYear + ", Tháng = " + targetMonth + ", NXB = '" + targetPub + "'.\n"
                + "Chỉ trả về JSON thuần hợp lệ:\n"
                + "{\"detectedPublisher\":\"" + targetPub + "\",\"year\":" + targetYear + ",\"month\":" + targetMonth + ",\"books\":[{\"day\":1,\"title\":\"Phải Lòng Chị Của Bạn Thân (Tập 4)\",\"volume\":\"Tập 4\",\"price\":null,\"isNew\":false}]}";

        Map<String, Object> payload = Map.of(
                "contents", List.of(Map.of("role", "user", "parts", List.of(
                        Map.of("text", prompt + "\n\nVĂN BẢN ĐẦU VÀO:\n" + req.getText())
                ))),
                "generationConfig", Map.of("responseMimeType", "application/json", "temperature", 0.1)
        );

        Map<?, ?> response = restClient.post()
                .uri(url)
                .contentType(MediaType.APPLICATION_JSON)
                .body(payload)
                .retrieve()
                .body(Map.class);

        if (response != null && response.containsKey("candidates")) {
            List<?> responseCandidates = (List<?>) response.get("candidates");
            if (!responseCandidates.isEmpty()) {
                Map<?, ?> first = (Map<?, ?>) responseCandidates.get(0);
                Map<?, ?> content = (Map<?, ?>) first.get("content");
                if (content != null && content.containsKey("parts")) {
                    List<?> parts = (List<?>) content.get("parts");
                    for (Object pObj : parts) {
                        Map<?, ?> part = (Map<?, ?>) pObj;
                        if (part.containsKey("text")) return (String) part.get("text");
                    }
                }
            }
        }
        throw new IllegalStateException("Không nhận được nội dung từ Gemini");
    }

    private OcrScheduleScanResponse processJsonResponse(String rawJson, BatchParseTextRequest req) throws Exception {
        JsonNode root = objectMapper.readTree(rawJson);
        String detectedPublisher = req.getPublisher() != null && !req.getPublisher().isBlank()
                ? req.getPublisher().trim()
                : (root.hasNonNull("detectedPublisher") ? root.get("detectedPublisher").asText() : "IPM");

        int year = req.getYear() != null ? req.getYear()
                : (root.hasNonNull("year") ? root.get("year").asInt(LocalDate.now().getYear()) : LocalDate.now().getYear());
        int month = req.getMonth() != null ? req.getMonth()
                : (root.hasNonNull("month") ? root.get("month").asInt(LocalDate.now().getMonthValue()) : LocalDate.now().getMonthValue());

        List<OcrParsedBookItemDto> items = new ArrayList<>();
        JsonNode booksNode = root.get("books");

        if (booksNode != null && booksNode.isArray()) {
            for (JsonNode b : booksNode) {
                int day = b.hasNonNull("day") ? b.get("day").asInt(1) : 1;
                LocalDate date = createSafeDate(year, month, day);

                String rawTitle = b.hasNonNull("title") ? b.get("title").asText() : "";
                String volume = b.hasNonNull("volume") ? b.get("volume").asText() : "";
                String title = cleanTitle(rawTitle, volume);
                BigDecimal price = (b.hasNonNull("price") && b.get("price").asLong(0) > 0)
                        ? BigDecimal.valueOf(b.get("price").asLong()) : null;

                OcrParsedBookItemDto item = OcrParsedBookItemDto.builder()
                        .tempId(UUID.randomUUID().toString())
                        .releaseDate(date)
                        .rawText(rawTitle)
                        .title(title)
                        .volume(volume)
                        .publisher(detectedPublisher)
                        .estimatedPrice(price)
                        .editionType(ReleaseEditionType.STANDARD)
                        .editionName("Bản thường")
                        .gifts("")
                        .coverUrl(null)
                        .selected(true)
                        .build();

                matchingService.enrichItemWithMatchingMetadata(item, detectedPublisher);
                items.add(item);
            }
        }

        matchingService.detectBatchDuplicatesAndConflicts(items);
        items.sort(Comparator.comparing(OcrParsedBookItemDto::getReleaseDate).thenComparing(OcrParsedBookItemDto::getTitle));

        return OcrScheduleScanResponse.builder()
                .detectedPublisher(detectedPublisher)
                .year(year)
                .month(month)
                .totalDetected(items.size())
                .items(items)
                .build();
    }

    private LocalDate createSafeDate(int year, int month, int day) {
        try {
            int validMonth = Math.min(Math.max(month, 1), 12);
            int maxDays = LocalDate.of(year, validMonth, 1).lengthOfMonth();
            int validDay = Math.min(Math.max(day, 1), maxDays);
            return LocalDate.of(year, validMonth, validDay);
        } catch (Exception e) {
            return LocalDate.now();
        }
    }

    private String cleanTitle(String title, String volume) {
        if (title == null || title.isBlank()) return "";
        String trimmed = title.trim();
        if (volume != null && !volume.isBlank() && !trimmed.toLowerCase().contains(volume.toLowerCase())) {
            trimmed = trimmed + " (" + volume + ")";
        }
        return trimmed;
    }
}
