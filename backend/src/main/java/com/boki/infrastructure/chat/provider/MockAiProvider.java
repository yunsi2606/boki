package com.boki.infrastructure.chat.provider;

import com.boki.application.chat.context.ConversationContextManager;
import com.boki.domain.chat.model.ConversationState;
import com.boki.domain.chat.model.PageContext;
import com.boki.domain.chat.provider.AiProvider;
import com.boki.domain.chat.provider.AiRequest;
import com.boki.domain.chat.provider.AiResponse;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
public class MockAiProvider implements AiProvider {

    private final ConversationContextManager contextManager;

    private static final Pattern ORDER_CODE_PATTERN = Pattern.compile("(BK-[A-Za-z0-9-]+|[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})");
    private static final Pattern PRICE_PATTERN = Pattern.compile("(\\d+)\\s*(k|nghìn|ngàn|000|đ|vnd)", Pattern.CASE_INSENSITIVE);

    public MockAiProvider(ConversationContextManager contextManager) {
        this.contextManager = contextManager;
    }

    @Override
    public String getProviderName() {
        return "MockAiProvider";
    }

    @Override
    public boolean isAvailable() {
        return true; // Luôn sẵn sàng hoạt động 100% offline
    }

    @Override
    public AiResponse generate(AiRequest request) {
        String msg = request.userMessage() != null ? request.userMessage().trim() : "";
        String lower = msg.toLowerCase();
        ConversationState state = request.conversationState();
        PageContext pageCtx = state != null ? state.getPageContext() : PageContext.unknown();
        boolean isAdmin = (state != null && ("ADMIN".equalsIgnoreCase(state.getUserRole()) || "SELLER".equalsIgnoreCase(state.getUserRole())))
                || (pageCtx != null && pageCtx.isAdministrative())
                || (state != null && state.getCurrentPath() != null && state.getCurrentPath().startsWith("/admin"));

        // --- 1. ADMIN INTENTS ---
        if (isAdmin) {
            // Specific: Doanh thu
            if (lower.contains("doanh thu") || lower.contains("doanh số") || lower.contains("bán được bao nhiêu") || lower.contains("thu nhập") || lower.contains("tiền thu")) {
                return AiResponse.withTool("getRevenue", Map.of(), "Đang phân tích số liệu doanh thu...", getProviderName());
            }

            // Specific: Cảnh báo bất thường / Gian lận
            if (lower.contains("bất thường") || lower.contains("nghi vấn") || lower.contains("gian lận") || lower.contains("có gì lạ")) {
                return AiResponse.withTool("detectAnomalies", Map.of(), "Đang quét các dấu hiệu vận hành bất thường...", getProviderName());
            }

            // Specific: Tồn kho thấp / Hết hàng
            if (lower.contains("tồn kho") || lower.contains("sắp hết") || lower.contains("hết hàng")) {
                boolean outOnly = lower.contains("đã hết") || lower.contains("hết sạch");
                return AiResponse.withTool("getLowStock", Map.of("outOfStockOnly", outOnly), "Đang kiểm tra dữ liệu kho hàng...", getProviderName());
            }

            // General: Bản tin điều hành / Tóm tắt tổng quan
            if (lower.contains("bản tin") || lower.contains("briefing") || lower.contains("tóm tắt") || lower.contains("hôm nay thế nào") || lower.contains("chào buổi sáng") || lower.contains("tổng quan hôm nay")) {
                return AiResponse.withTool("getDailyBriefing", Map.of(), "Đang tổng hợp Bản tin Hoạt động Điều hành...", getProviderName());
            }
            if ((lower.contains("duyệt đơn") || lower.contains("xác nhận đơn") || lower.contains("hủy đơn") || lower.contains("huỷ đơn") || lower.contains("giao đơn"))
                    && ORDER_CODE_PATTERN.matcher(msg).find()) {
                Matcher matcher = ORDER_CODE_PATTERN.matcher(msg);
                matcher.find();
                String code = matcher.group(1);
                String actionType = (lower.contains("hủy đơn") || lower.contains("huỷ đơn")) ? "CANCEL_ORDER"
                        : (lower.contains("giao đơn") ? "SHIP_ORDER" : "APPROVE_ORDER");
                return AiResponse.withTool("proposeOrderAction", Map.of("orderCode", code, "actionType", actionType), "Đang khởi tạo lệnh phê duyệt an toàn cho đơn " + code + "...", getProviderName());
            }
            if (lower.contains("chờ duyệt") || lower.contains("cần duyệt") || lower.contains("tình hình đơn") || lower.contains("trạng thái đơn")) {
                return AiResponse.withTool("getOrderMetrics", Map.of(), "Đang thống kê dữ liệu đơn hàng...", getProviderName());
            }
            if (lower.contains("khách hàng") || lower.contains("tìm khách") || lower.contains("tra cứu user")) {
                String query = extractSearchKeyword(msg, List.of("khách hàng", "tìm khách", "tra cứu user", "tìm"));
                return AiResponse.withTool("searchCustomer", Map.of("query", query), "Đang tra cứu hồ sơ khách hàng...", getProviderName());
            }
            if (lower.contains("tìm đơn") || lower.contains("tra cứu đơn") || lower.contains("danh sách đơn")) {
                String query = extractSearchKeyword(msg, List.of("tìm đơn", "tra cứu đơn", "danh sách đơn"));
                return AiResponse.withTool("searchOrders", Map.of("query", query), "Đang tìm kiếm đơn hàng trong hệ thống...", getProviderName());
            }
        }

        // --- 2. MULTI-TURN REFERENCE RESOLUTION (Câu hỏi tiếp nối) ---
        Integer ordinal = contextManager.resolveFollowUpOrdinal(msg);
        if (ordinal != null && state != null && !state.getRecommendedBooks().isEmpty()) {
            return AiResponse.withTool("getBookDetail", Map.of("index", ordinal), "Đang lấy thông tin cuốn thứ " + ordinal + " cho bạn...", getProviderName());
        }

        if ((lower.contains("boxset") || lower.contains("bản đặc biệt") || lower.contains("bản limited") || lower.contains("quà tặng"))
                && (lower.contains("có") || lower.contains("không") || lower.contains("tìm"))) {
            String variantKw = lower.contains("boxset") ? "boxset" : "đặc biệt";
            return AiResponse.withTool("getBookVariants", Map.of("variantKeyword", variantKw), "Đang tra cứu các ấn bản đặc biệt...", getProviderName());
        }

        if (lower.contains("còn hàng không") || lower.contains("tồn kho") || lower.contains("còn bao nhiêu cuốn") || lower.contains("còn quyển nào không")) {
            return AiResponse.withTool("checkStock", Map.of(), "Đang kiểm tra số lượng tồn kho thực tế...", getProviderName());
        }

        // --- 3. ORDER TRACKING & MY ORDERS ---
        Matcher orderMatcher = ORDER_CODE_PATTERN.matcher(msg);
        if (orderMatcher.find()) {
            String code = orderMatcher.group(1);
            return AiResponse.withTool("getOrder", Map.of("orderCode", code), "Đang tra cứu đơn hàng " + code + "...", getProviderName());
        }

        if (lower.contains("đơn hàng của tôi") || lower.contains("đơn của tôi") || lower.contains("đơn vừa đặt") || lower.contains("lịch sử đơn")) {
            return AiResponse.withTool("getMyOrders", Map.of("limit", 3), "Đang tải danh sách đơn hàng gần đây của bạn...", getProviderName());
        }

        // --- 4. VOUCHERS & PROMOTIONS ---
        if (lower.contains("mã giảm giá") || lower.contains("voucher") || lower.contains("khuyến mãi") || lower.contains("ưu đãi") || lower.contains("coupon")) {
            return AiResponse.withTool("getActiveVouchers", Map.of(), "Đang tìm kiếm mã giảm giá khả dụng...", getProviderName());
        }

        // --- 5. SHIPPING & FREESHIP ---
        if (lower.contains("phí ship") || lower.contains("tiền ship") || lower.contains("giao hàng") || lower.contains("freeship") || lower.contains("bao lâu nhận")) {
            boolean express = lower.contains("hỏa tốc") || lower.contains("gấp");
            String province = lower.contains("hồ chí minh") || lower.contains("hcm") || lower.contains("sài gòn") ? "TP. Hồ Chí Minh" : "Hà Nội";
            return AiResponse.withTool("checkShippingFee", Map.of("province", province, "isExpress", express), "Đang tính toán phí vận chuyển...", getProviderName());
        }

        // --- 6. STORE POLICIES (Knowledge Base) ---
        if (lower.contains("đổi trả") || lower.contains("hoàn tiền") || lower.contains("bảo hành") || lower.contains("sách rách") || lower.contains("lỗi in")) {
            return AiResponse.withTool("getStorePolicy", Map.of("category", "RETURN"), "Đang tra cứu chính sách đổi trả...", getProviderName());
        }
        if (lower.contains("thành viên") || lower.contains("vip") || lower.contains("tích điểm") || lower.contains("hạng")) {
            return AiResponse.withTool("getStorePolicy", Map.of("category", "VIP"), "Đang tra cứu chính sách thành viên...", getProviderName());
        }
        if (lower.contains("thanh toán") || lower.contains("chuyển khoản") || lower.contains("cod") || lower.contains("vnpay")) {
            return AiResponse.withTool("getStorePolicy", Map.of("category", "PAYMENT"), "Đang tra cứu phương thức thanh toán...", getProviderName());
        }
        if (lower.contains("đặt trước") || lower.contains("preorder") || lower.contains("pre-order")) {
            return AiResponse.withTool("getStorePolicy", Map.of("category", "PREORDER"), "Đang tra cứu quy định đặt trước sách...", getProviderName());
        }

        // --- 7. NATURAL SEARCH & GIFT / BUDGET RECOMMENDATIONS ---
        if (lower.contains("tìm") || lower.contains("mua") || lower.contains("có truyện") || lower.contains("có sách") ||
            lower.contains("giới thiệu") || lower.contains("gợi ý") || lower.contains("manga") || lower.contains("light novel") ||
            lower.contains("tặng") || lower.contains("quà") || lower.contains("giống")) {

            Map<String, Object> searchParams = new LinkedHashMap<>();

            // Trích xuất mức giá tối đa: e.g. "dưới 150k", "tầm 300k"
            Matcher priceMatcher = PRICE_PATTERN.matcher(msg);
            if (priceMatcher.find()) {
                try {
                    int val = Integer.parseInt(priceMatcher.group(1));
                    searchParams.put("maxPrice", val * 1000);
                } catch (Exception ignored) {}
            }

            // Trích xuất từ khóa tìm kiếm sạch
            String cleanedQuery = extractSearchKeyword(msg, List.of(
                    "tìm kiếm", "tìm giúp", "tìm", "gợi ý", "giới thiệu", "có cuốn nào", "có bộ nào", "có truyện nào", "mua làm quà"
            ));
            searchParams.put("query", cleanedQuery);

            return AiResponse.withTool("searchBooks", searchParams, "Boki đang tìm kiếm tựa sách phù hợp nhất cho bạn...", getProviderName());
        }

        // --- 8. GREETING & AMBIGUOUS FALLBACK ---
        if (lower.contains("xin chào") || lower.contains("hello") || lower.contains("hi") || lower.contains("boki ơi") || lower.contains("chào bạn")) {
            String greeting = isAdmin
                    ? "Xin chào Quản trị viên! Boki AI Copilot đã sẵn sàng hỗ trợ bạn theo dõi doanh thu, vận hành đơn hàng và cảnh báo tồn kho."
                    : "Xin chào bạn! Boki là trợ lý ảo của BokiStore. Mình có thể giúp bạn tìm kiếm sách theo sở thích, tra cứu đơn hàng hoặc săn mã voucher freeship!";
            return AiResponse.direct(greeting, getProviderName());
        }

        // Nếu không nhận diện được ý định rõ ràng -> trả về fallback để Orchestrator gọi SmartFallbackProvider
        return AiResponse.direct("", getProviderName());
    }

    private String extractSearchKeyword(String msg, List<String> prefixes) {
        String res = msg;
        for (String p : prefixes) {
            if (res.toLowerCase().contains(p)) {
                int idx = res.toLowerCase().indexOf(p) + p.length();
                res = res.substring(idx).trim();
            }
        }
        // Loại bỏ các từ đệm và từ chỉ loại sách chung chung
        res = res.replaceAll("(?i)(dưới|tầm|khoảng)\\s*\\d+\\s*(k|nghìn|ngàn|000|đ|vnd)", "")
                 .replaceAll("(?i)(cho em trai|cho bạn|làm quà|hay không|nhất|nhé|ạ|giúp mình|nào hay|hay)", "")
                 .replaceAll("(?i)^(sách|truyện|cuốn|bộ|tập)\\s*", "")
                 .replaceAll("(?i)(manga|light novel|tiểu thuyết)", "")
                 .trim();
        return res;
    }
}
