package com.boki.application.service;

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
public class ScheduleOcrService {

    @Value("${boki.ai.gemini.api-key:}")
    private String configuredGeminiKey;

    @Value("${boki.ai.gemini.model:gemini-1.5-flash}")
    private String geminiModel;

    private final ScheduleSeriesMatchingService matchingService;
    private final RestClient restClient;
    private final ObjectMapper objectMapper;

    public ScheduleOcrService(ScheduleSeriesMatchingService matchingService, ObjectMapper objectMapper) {
        this.matchingService = matchingService;
        this.objectMapper = objectMapper;
        this.restClient = RestClient.builder().build();
    }

    public OcrScheduleScanResponse parseScheduleImage(
            byte[] imageBytes, String mimeType, String publisherOverride, String customApiKey) {

        String activeKey = (customApiKey != null && !customApiKey.isBlank())
                ? customApiKey.trim()
                : configuredGeminiKey;

        if (activeKey == null || activeKey.isBlank()) {
            throw new IllegalArgumentException("Chưa cấu hình Gemini API Key. Vui lòng nhập API Key hoặc cấu hình GEMINI_API_KEY trong hệ thống.");
        }

        try {
            String base64Image = Base64.getEncoder().encodeToString(imageBytes);
            String rawJson = callGeminiVision(base64Image, mimeType, activeKey);
            return processJsonResponse(rawJson, publisherOverride);
        } catch (Exception e) {
            log.error("Failed to parse schedule image via Gemini Vision: {}", e.getMessage(), e);
            throw new RuntimeException("Lỗi phân tích ảnh lịch phát hành: " + e.getMessage(), e);
        }
    }

    private String callGeminiVision(String base64Image, String mimeType, String apiKey) throws Exception {
        String url = String.format("https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s",
                geminiModel != null && !geminiModel.isBlank() ? geminiModel : "gemini-1.5-flash", apiKey);

        String prompt = "Bạn là trợ lý AI chuyên gia bóc tách lịch phát hành sách/manga của các nhà xuất bản Việt Nam (Kim Đồng, Trẻ, IPM, Wings Books, Nhã Nam, Amak...).\n"
                + "Ảnh có thể theo BẤT KỲ bố cục nào (bảng biểu nhiều cột, lưới lịch tháng calendar, các khối thẻ chia theo ngày, hoặc dòng thời gian timeline).\n"
                + "Nhiệm vụ:\n"
                + "1. Nhận diện Nhà xuất bản (detectedPublisher) và Thời gian (năm: year, tháng: month).\n"
                + "2. Bóc tách từng đầu sách phát hành, gồm:\n"
                + "   - day: số ngày phát hành trong tháng (1-31)\n"
                + "   - title: tên sách đầy đủ kèm số tập (ví dụ: 'Ao Ashi - Tân binh sân cỏ - Tập 7')\n"
                + "   - volume: số tập (ví dụ: 'Tập 7', 'Tập 25+26', 'Tập 1', hoặc để trống nếu sách lẻ)\n"
                + "   - price: giá bìa dạng số nguyên VND (ví dụ: 35000, 105000)\n"
                + "   - editionName: tên phiên bản (ví dụ: 'Bản thường', 'Bản đặc biệt 2 in 1', 'Box Set 3 tập')\n"
                + "   - editionType: một trong các giá trị [STANDARD, SPECIAL, LIMITED, BOXSET]\n"
                + "   - gifts: quà tặng kèm nếu có ghi trên ảnh (hoặc rỗng)\n"
                + "   - isNew: true nếu có nhãn NEW hoặc là tập 1 bộ mới, ngược lại false\n"
                + "Trả về CHÍNH XÁC định dạng JSON thuần:\n"
                + "{\"detectedPublisher\":\"...\",\"year\":2026,\"month\":10,\"books\":[{\"day\":2,\"title\":\"...\",\"volume\":\"...\",\"price\":35000,\"editionName\":\"Bản thường\",\"editionType\":\"STANDARD\",\"gifts\":\"\",\"isNew\":false}]}";

        Map<String, Object> imagePart = Map.of(
                "inline_data", Map.of(
                        "mime_type", mimeType != null ? mimeType : "image/jpeg",
                        "data", base64Image
                )
        );
        Map<String, Object> textPart = Map.of("text", prompt);

        Map<String, Object> payload = Map.of(
                "contents", List.of(Map.of("role", "user", "parts", List.of(textPart, imagePart))),
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
                            return (String) part.get("text");
                        }
                    }
                }
            }
        }
        throw new IllegalStateException("Không nhận được phản hồi hợp lệ từ Gemini Vision");
    }

    private OcrScheduleScanResponse processJsonResponse(String rawJson, String publisherOverride) throws Exception {
        JsonNode root = objectMapper.readTree(rawJson);
        String detectedPublisher = root.hasNonNull("detectedPublisher") ? root.get("detectedPublisher").asText() : "NXB Kim Đồng";
        if (publisherOverride != null && !publisherOverride.isBlank()) {
            detectedPublisher = publisherOverride.trim();
        }

        int currentYear = LocalDate.now().getYear();
        int currentMonth = LocalDate.now().getMonthValue();
        int year = root.hasNonNull("year") ? root.get("year").asInt(currentYear) : currentYear;
        int month = root.hasNonNull("month") ? root.get("month").asInt(currentMonth) : currentMonth;

        List<OcrParsedBookItemDto> items = new ArrayList<>();
        JsonNode booksNode = root.get("books");

        if (booksNode != null && booksNode.isArray()) {
            for (JsonNode b : booksNode) {
                int day = b.hasNonNull("day") ? b.get("day").asInt(1) : 1;
                LocalDate date = createSafeDate(year, month, day);

                String title = b.hasNonNull("title") ? b.get("title").asText() : "";
                String volume = b.hasNonNull("volume") ? b.get("volume").asText() : "";
                long priceVal = b.hasNonNull("price") ? b.get("price").asLong(0) : 0;
                String editionName = b.hasNonNull("editionName") ? b.get("editionName").asText("Bản thường") : "Bản thường";
                String edTypeStr = b.hasNonNull("editionType") ? b.get("editionType").asText("STANDARD") : "STANDARD";
                String gifts = b.hasNonNull("gifts") ? b.get("gifts").asText("") : "";

                ReleaseEditionType edType = parseEditionType(edTypeStr);

                OcrParsedBookItemDto item = OcrParsedBookItemDto.builder()
                        .tempId(UUID.randomUUID().toString())
                        .releaseDate(date)
                        .rawText(title)
                        .title(title)
                        .volume(volume)
                        .publisher(detectedPublisher)
                        .estimatedPrice(priceVal > 0 ? BigDecimal.valueOf(priceVal) : null)
                        .editionType(edType)
                        .editionName(editionName)
                        .gifts(gifts)
                        .selected(true)
                        .build();

                matchingService.enrichItemWithMatchingMetadata(item, detectedPublisher);
                items.add(item);
            }
        }

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

    private ReleaseEditionType parseEditionType(String typeStr) {
        if (typeStr == null) return ReleaseEditionType.STANDARD;
        try {
            return ReleaseEditionType.valueOf(typeStr.toUpperCase().trim());
        } catch (IllegalArgumentException e) {
            return ReleaseEditionType.STANDARD;
        }
    }
}
