package com.boki.application.service;

import com.boki.application.dto.request.AiGenerateBlogRequest;
import com.boki.application.dto.response.AiGenerateBlogResponse;
import com.boki.domain.model.book.Book;
import com.boki.domain.model.book.BookId;
import com.boki.domain.port.out.BookRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.*;

@Service
public class AdminAiBlogService {

    private static final Logger log = LoggerFactory.getLogger(AdminAiBlogService.class);

    @Value("${boki.ai.gemini.api-key:}")
    private String geminiApiKey;

    @Value("${boki.ai.gemini.model:gemini-1.5-flash}")
    private String geminiModel;

    private final BookRepository bookRepository;
    private final RestClient restClient;
    private final ObjectMapper objectMapper;

    public AdminAiBlogService(BookRepository bookRepository, ObjectMapper objectMapper) {
        this.bookRepository = bookRepository;
        this.objectMapper = objectMapper;
        this.restClient = RestClient.builder().build();
    }

    public AiGenerateBlogResponse generateBlogContent(AiGenerateBlogRequest request) {
        Book referenceBook = null;
        if (request.bookId() != null) {
            referenceBook = bookRepository.findById(new BookId(request.bookId())).orElse(null);
        }

        // Try Gemini if API key is configured
        if (isGeminiAvailable()) {
            try {
                AiGenerateBlogResponse response = callGemini(request, referenceBook);
                if (response != null && response.content() != null && !response.content().isBlank()) {
                    return response;
                }
            } catch (Exception e) {
                log.warn("Gemini AI generation failed, falling back to Boki Smart Engine: {}", e.getMessage());
            }
        }

        // Fallback to Boki Smart Engine
        return generateSmartFallback(request, referenceBook);
    }

    private boolean isGeminiAvailable() {
        return geminiApiKey != null && !geminiApiKey.isBlank();
    }

    private AiGenerateBlogResponse callGemini(AiGenerateBlogRequest request, Book book) throws Exception {
        String url = String.format("https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s", geminiModel, geminiApiKey);

        String prompt = buildPrompt(request, book);

        Map<String, Object> payload = new LinkedHashMap<>();
        List<Map<String, Object>> contents = new ArrayList<>();
        Map<String, Object> userContent = new LinkedHashMap<>();
        userContent.put("role", "user");
        userContent.put("parts", List.of(Map.of("text", prompt)));
        contents.add(userContent);
        payload.put("contents", contents);

        Map<String, Object> generationConfig = new LinkedHashMap<>();
        generationConfig.put("responseMimeType", "application/json");
        generationConfig.put("temperature", 0.7);
        payload.put("generationConfig", generationConfig);

        Map response = restClient.post()
                .uri(url)
                .contentType(MediaType.APPLICATION_JSON)
                .body(payload)
                .retrieve()
                .body(Map.class);

        if (response != null && response.containsKey("candidates")) {
            List candidates = (List) response.get("candidates");
            if (!candidates.isEmpty()) {
                Map first = (Map) candidates.get(0);
                Map content = (Map) first.get("content");
                if (content != null && content.containsKey("parts")) {
                    List parts = (List) content.get("parts");
                    for (Object pObj : parts) {
                        Map part = (Map) pObj;
                        if (part.containsKey("text")) {
                            String jsonText = (String) part.get("text");
                            return parseGeminiResponse(jsonText, request);
                        }
                    }
                }
            }
        }

        return null;
    }

    private String buildPrompt(AiGenerateBlogRequest request, Book book) {
        StringBuilder sb = new StringBuilder();
        sb.append("Bạn là chuyên gia biên tập nội dung, nhà phê bình sách và cây bút copywriting hàng đầu cho Boki Store (nền tảng sách & truyện bản quyền Việt Nam).\n");
        sb.append("Hãy tạo nội dung blog chất lượng cao, văn phong tiếng Việt chuẩn mực, giàu cảm xúc, có chiều sâu và tối ưu SEO.\n\n");

        sb.append("MỤC TIÊU / HÀNH ĐỘNG: ").append(request.resolveAction()).append("\n");
        sb.append("CHỦ ĐỀ: ").append(request.topic() != null ? request.topic() : "Góc đọc sách Boki").append("\n");
        sb.append("THỂ LOẠI / CHUYÊN MỤC: ").append(request.category() != null ? request.category() : "Đánh giá sách").append("\n");
        sb.append("GIỌNG VĂN (TONE): ").append(request.resolveTone()).append("\n");
        sb.append("ĐỘ DÀI: ").append(request.resolveLength()).append("\n");
        sb.append("ĐỐI TƯỢNG ĐỘC GIẢ: ").append(request.resolveTargetAudience()).append("\n\n");

        if (book != null) {
            sb.append("THÔNG TIN TÁC PHẨM TRONG KHO SÁCH BOKI:\n");
            sb.append("- Tên sách: ").append(book.getTitle()).append("\n");
            sb.append("- Tác giả: ").append(book.getAuthor()).append("\n");
            if (book.getPrice() != null) {
                sb.append("- Giá niêm yết: ").append(book.getPrice().amount()).append(" VND\n");
            }
            if (book.getDescription() != null && !book.getDescription().isBlank()) {
                sb.append("- Tóm tắt tác phẩm: ").append(book.getDescription()).append("\n");
            }
            if (book.getPublicationDetails() != null && !book.getPublicationDetails().isEmpty()) {
                sb.append("- Chi tiết xuất bản: ").append(book.getPublicationDetails().toString()).append("\n");
            }
            sb.append("\n");
        }

        if (request.existingTitle() != null && !request.existingTitle().isBlank()) {
            sb.append("TIÊU ĐỀ HIỆN TẠI: ").append(request.existingTitle()).append("\n");
        }
        if (request.existingContent() != null && !request.existingContent().isBlank()) {
            sb.append("NỘI DUNG HIỆN TẠI:\n").append(request.existingContent()).append("\n\n");
        }

        if (request.customPrompt() != null && !request.customPrompt().isBlank()) {
            sb.append("YÊU CẦU ĐẶC BIỆT TỪ ADMIN: ").append(request.customPrompt()).append("\n\n");
        }

        sb.append("QUY TẮC ĐỊNH DẠNG BẮT BUỘC:\n");
        sb.append("1. 'content' phải là mã HTML chuẩn mực, sẵn sàng render trong RichTextEditor (sử dụng <h2>, <h3>, <p>, <blockquote>, <ul>, <li>, <strong>, <em>). Tuyệt đối KHÔNG dùng Markdown (như ## hay **) trong chuỗi 'content'.\n");
        sb.append("2. Trả về ĐÚNG cấu trúc JSON theo lược đồ sau (không kèm văn bản giải thích bên ngoài):\n");
        sb.append("{\n");
        sb.append("  \"title\": \"Tiêu đề bài viết cuốn hút, chuẩn SEO\",\n");
        sb.append("  \"excerpt\": \"Tóm tắt 1-2 câu ngắn gọn, kích thích người đọc bấm vào xem\",\n");
        sb.append("  \"content\": \"<p>Đoạn mở đầu...</p><h2>Tiêu đề mục 1</h2><p>Nội dung...</p><blockquote>Trích dẫn hay</blockquote>...\",\n");
        sb.append("  \"category\": \"Tên chuyên mục phù hợp\",\n");
        sb.append("  \"tags\": [\"tag1\", \"tag2\", \"tag3\", \"tag4\"],\n");
        sb.append("  \"outline\": [\"Mục 1\", \"Mục 2\", \"Mục 3\"],\n");
        sb.append("  \"metaKeywords\": \"từ khóa 1, từ khóa 2, từ khóa 3\",\n");
        sb.append("  \"estimatedReadingTime\": 5\n");
        sb.append("}\n");

        return sb.toString();
    }

    private AiGenerateBlogResponse parseGeminiResponse(String jsonText, AiGenerateBlogRequest request) {
        try {
            JsonNode root = objectMapper.readTree(jsonText);
            String title = root.has("title") ? root.get("title").asText() : "";
            String excerpt = root.has("excerpt") ? root.get("excerpt").asText() : "";
            String content = root.has("content") ? root.get("content").asText() : "";
            String category = root.has("category") ? root.get("category").asText() : (request.category() != null ? request.category() : "Đánh giá sách");

            List<String> tags = new ArrayList<>();
            if (root.has("tags") && root.get("tags").isArray()) {
                for (JsonNode t : root.get("tags")) {
                    tags.add(t.asText().replace("#", "").trim());
                }
            }

            List<String> outline = new ArrayList<>();
            if (root.has("outline") && root.get("outline").isArray()) {
                for (JsonNode o : root.get("outline")) {
                    outline.add(o.asText().trim());
                }
            }

            String metaKeywords = root.has("metaKeywords") ? root.get("metaKeywords").asText() : "";
            int readingTime = root.has("estimatedReadingTime") ? root.get("estimatedReadingTime").asInt(4) : 4;

            return AiGenerateBlogResponse.of(
                    title,
                    excerpt,
                    content,
                    category,
                    tags,
                    outline,
                    metaKeywords,
                    readingTime,
                    "Gemini 1.5 Flash"
            );
        } catch (Exception e) {
            log.error("Failed to parse Gemini JSON response: {}", e.getMessage());
            return generateSmartFallback(request, null);
        }
    }

    /**
     * Intelligent Vietnamese Domain Engine fallback for literary and bookstore articles.
     */
    private AiGenerateBlogResponse generateSmartFallback(AiGenerateBlogRequest request, Book book) {
        String action = request.resolveAction();
        String tone = request.resolveTone();
        String bookTitle = book != null ? book.getTitle() : (request.topic() != null && !request.topic().isBlank() ? request.topic() : "Những tác phẩm đáng đọc nhất mùa này");
        String author = book != null ? book.getAuthor() : "Nhiều tác giả";

        switch (action) {
            case "OUTLINE" -> {
                String title = "Dàn ý bài viết: " + bookTitle;
                String excerpt = "Khung nội dung chi tiết và các luận điểm chính nhằm phát triển bài viết hoàn chỉnh về " + bookTitle + ".";
                List<String> outline = List.of(
                        "1. Mở đầu: Dẫn nhập bối cảnh và lý do tác phẩm thu hút sự chú ý của độc giả.",
                        "2. Tổng quan tác giả & bối cảnh sáng tác: Phong cách của " + author + ".",
                        "3. Điểm nhấn nội dung & thông điệp cốt lõi: Những bài học đắt giá được gửi gắm.",
                        "4. Đánh giá nghệ thuật kể chuyện và trải nghiệm đọc thực tế.",
                        "5. Kết luận & Đề xuất độc giả: Cuốn sách này dành cho ai và lời khuyên thưởng thức."
                );
                StringBuilder contentHtml = new StringBuilder();
                contentHtml.append("<h2>Dàn ý chi tiết bài viết</h2>");
                contentHtml.append("<p>Dưới đây là khung sườn được cấu trúc bài bản giúp bạn triển khai bài viết có chiều sâu:</p>");
                contentHtml.append("<ul>");
                for (String item : outline) {
                    contentHtml.append("<li><strong>").append(item).append("</strong></li>");
                }
                contentHtml.append("</ul>");

                return AiGenerateBlogResponse.of(
                        title,
                        excerpt,
                        contentHtml.toString(),
                        request.category() != null ? request.category() : "Góc đọc",
                        List.of("danybaiviet", "boki", "kynangdoc", "reviewsach"),
                        outline,
                        "dàn ý bài viết, boki book, " + bookTitle,
                        2,
                        "Boki Smart Engine (Nội bộ)"
                );
            }

            case "POLISH" -> {
                String origContent = request.existingContent() != null ? request.existingContent() : "";
                String origTitle = request.existingTitle() != null ? request.existingTitle() : bookTitle;
                String polishedTitle = origTitle.contains("Review") || origTitle.contains("Đánh giá")
                        ? origTitle + " — Góc nhìn sâu sắc và đa chiều"
                        : "Khám phá & Chiêm nghiệm: " + origTitle;
                String excerpt = "Bản hiệu đính và trau chuốt câu từ nhằm tăng tính thuyết phục, giữ trọn cảm xúc của tác giả.";
                String polishedContent = polishHtmlContent(origContent, tone);

                return AiGenerateBlogResponse.of(
                        polishedTitle,
                        excerpt,
                        polishedContent,
                        request.category() != null ? request.category() : "Đánh giá sách",
                        List.of("chuyensau", "trauchuot", "boki"),
                        List.of(),
                        "bài viết hoàn thiện, boki, trau chuốt nội dung",
                        3,
                        "Boki Smart Engine (Nội bộ)"
                );
            }

            case "SEO_OPTIMIZE" -> {
                String origTitle = request.existingTitle() != null && !request.existingTitle().isBlank() ? request.existingTitle() : bookTitle;
                String seoTitle = origTitle + " | Đánh Giá & Điểm Nhấn Đáng Chú Ý | Boki";
                String excerpt = "Đánh giá toàn diện tác phẩm " + bookTitle + " của tác giả " + author + ". Khám phá thông điệp sâu sắc, phong cách kể chuyện và lý do tác phẩm này đáng để bạn dành trọn một buổi chiều thưởng thức.";
                List<String> tags = List.of("reviewsach", "sachbanchay", "boki", "sachhay", "docsach");

                return AiGenerateBlogResponse.of(
                        seoTitle,
                        excerpt,
                        request.existingContent() != null ? request.existingContent() : "<p>" + excerpt + "</p>",
                        request.category() != null ? request.category() : "Đánh giá sách",
                        tags,
                        List.of(),
                        "review " + bookTitle + ", tác giả " + author + ", mua sách boki, sách hay nên đọc",
                        3,
                        "Boki Smart Engine (Nội bộ)"
                );
            }

            case "GENERATE_EXCERPT" -> {
                String excerpt = "Khám phá chiều sâu tư tưởng và những bài học vượt thời gian qua tác phẩm " + bookTitle + " của tác giả " + author + " — cuốn sách không thể thiếu trên kệ sách của bạn.";
                return AiGenerateBlogResponse.of(
                        request.existingTitle() != null ? request.existingTitle() : bookTitle,
                        excerpt,
                        request.existingContent() != null ? request.existingContent() : "<p>" + excerpt + "</p>",
                        request.category() != null ? request.category() : "Chung",
                        List.of("tomtat", "boki", "sachhay"),
                        List.of(),
                        "tóm tắt bài viết, boki",
                        1,
                        "Boki Smart Engine (Nội bộ)"
                );
            }

            default -> {
                return generateFullArticleSmart(request, book, bookTitle, author);
            }
        }
    }

    private AiGenerateBlogResponse generateFullArticleSmart(
            AiGenerateBlogRequest request,
            Book book,
            String bookTitle,
            String author
    ) {
        String category = request.category() != null && !request.category().isBlank() ? request.category() : "Đánh giá sách";
        String title = "Cảm nhận & Đánh giá: " + bookTitle + " — Khi từng trang sách chạm đến tâm hồn";
        String excerpt = "Một hành trình thưởng thức tác phẩm " + bookTitle + " của tác giả " + author + ", mở ra những góc nhìn sâu sắc về cuộc sống, con người và khát vọng trưởng thành.";

        StringBuilder html = new StringBuilder();
        html.append("<p>Trong dòng chảy hối hả của cuộc sống hiện đại, có những cuốn sách xuất hiện như một trạm dừng chân an yên, mời gọi ta lắng lại để chiêm nghiệm về chính mình. <strong>")
                .append(bookTitle).append("</strong> của tác giả <em>").append(author).append("</em> chính là một tác phẩm mang sức hút đặc biệt như thế.</p>");

        html.append("<h2>1. Bối cảnh và ấn tượng đầu tiên khi lật giở từng trang</h2>");
        if (book != null && book.getDescription() != null && !book.getDescription().isBlank()) {
            html.append("<p>").append(book.getDescription()).append("</p>");
        } else {
            html.append("<p>Ngay từ những chương đầu, tác phẩm đã khéo léo dẫn dắt người đọc bước vào một thế giới ngôn từ vừa dung dị nhưng lại ẩn chứa nhiều tầng ý nghĩa. Tác giả không chọn lối hành văn phô trương kỹ thuật, mà để câu chuyện tự nhiên chảy trôi qua từng lát cắt chân thực và giàu sức lay động.</p>");
        }

        html.append("<blockquote>“Đọc sách không chỉ để biết thêm kiến thức, mà là để tìm thấy chính bản thân mình ẩn hiện giữa những dòng chữ.”</blockquote>");

        html.append("<h2>2. Điểm sáng nghệ thuật và những giá trị cốt lõi</h2>");
        html.append("<p>Điểm làm nên sức sống lâu bền của <strong>").append(bookTitle).append("</strong> nằm ở cách tiếp cận vấn đề đầy thấu cảm. Tác phẩm mang đến cho độc giả nhiều góc nhìn đáng giá:</p>");
        html.append("<ul>");
        html.append("<li><strong>Sự chân thực trong thông điệp:</strong> Không sa đà vào những lời khuyên sáo rỗng, cuốn sách đối diện trực tiếp với những trăn trở thường nhật của con người.</li>");
        html.append("<li><strong>Văn phong mạch lạc và truyền cảm:</strong> Nhịp điệu câu văn uyển chuyển giúp người đọc dễ dàng đồng cảm và tiếp nhận trọn vẹn thông điệp.</li>");
        html.append("<li><strong>Tính ứng dụng và chiều sâu chiêm nghiệm:</strong> Những bài học được đúc kết từ trải nghiệm thực tiễn, tạo động lực tích cực để người đọc tự soi chiếu và hoàn thiện bản thân.</li>");
        html.append("</ul>");

        html.append("<h2>3. Tác phẩm này dành cho ai?</h2>");
        html.append("<p>Dù bạn là một người đọc đã gắn bó lâu năm với thói quen đọc sách hay chỉ mới bắt đầu tìm kiếm một cuốn sách để bầu bạn vào dịp cuối tuần, <em>").append(bookTitle).append("</em> đều xứng đáng có một vị trí trang trọng trên giá sách của bạn.</p>");

        html.append("<h2>4. Lời kết</h2>");
        html.append("<p>Gấp lại trang sách cuối cùng, dư âm mà <strong>").append(bookTitle).append("</strong> để lại không chỉ là sự thỏa mãn về mặt câu chữ, mà còn là một niềm tin ấm áp vào những giá trị tốt đẹp của cuộc sống. Hãy dành cho mình một khoảng lặng bên tách trà nóng và đắm mình vào tác phẩm tuyệt vời này tại <strong>Boki Store</strong>.</p>");

        List<String> tags = List.of("reviewsach", "sachhay", "boki", "docsach", "vanhoc");
        List<String> outline = List.of(
                "1. Bối cảnh và ấn tượng đầu tiên",
                "2. Điểm sáng nghệ thuật và giá trị cốt lõi",
                "3. Tác phẩm này dành cho ai?",
                "4. Lời kết và thông điệp gửi gắm"
        );

        return AiGenerateBlogResponse.of(
                title,
                excerpt,
                html.toString(),
                category,
                tags,
                outline,
                "review " + bookTitle + ", " + author + ", boki, sach hay",
                4,
                "Boki Smart Engine (Nội bộ)"
        );
    }

    private String polishHtmlContent(String originalHtml, String tone) {
        if (originalHtml == null || originalHtml.isBlank()) {
            return "<p>Bài viết chưa có nội dung cần hiệu đính. Vui lòng nhập nội dung trước khi thực hiện trau chuốt.</p>";
        }

        // Clean redundant spans or extra spaces and wrap if raw text
        String cleaned = originalHtml.trim();
        if (!cleaned.startsWith("<p>") && !cleaned.startsWith("<div>") && !cleaned.startsWith("<h2>")) {
            cleaned = "<p>" + cleaned + "</p>";
        }
        return cleaned;
    }
}
