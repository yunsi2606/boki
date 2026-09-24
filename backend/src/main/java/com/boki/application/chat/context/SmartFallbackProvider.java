package com.boki.application.chat.context;

import com.boki.domain.chat.model.ChatAction;
import com.boki.domain.chat.model.ChatActionType;
import com.boki.domain.chat.model.PageContext;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Component
public class SmartFallbackProvider {

    /**
     * Tạo phản hồi fallback thông minh kèm các gợi ý phân loại cụ thể theo ngữ cảnh.
     */
    public FallbackResponse buildSmartFallback(PageContext pageContext, boolean isAdmin) {
        if (isAdmin) {
            String message = "Boki Copilot chưa rõ ý định của bạn. Bạn có muốn xem nhanh các tác vụ quản trị dưới đây không?";
            List<ChatAction> actions = List.of(
                    ChatAction.of(ChatActionType.NAVIGATE, "📊 Báo cáo doanh thu hôm nay", Map.of("tool", "getRevenue")),
                    ChatAction.of(ChatActionType.NAVIGATE, "📦 Tình hình đơn hàng chờ duyệt", Map.of("tool", "getOrderMetrics")),
                    ChatAction.of(ChatActionType.NAVIGATE, "⚠️ Cảnh báo tồn kho thấp", Map.of("tool", "getLowStock")),
                    ChatAction.of(ChatActionType.NAVIGATE, "🚨 Quét dữ liệu bất thường", Map.of("tool", "detectAnomalies"))
            );
            List<String> suggestions = List.of(
                    "Doanh thu hôm nay",
                    "Đơn hàng cần duyệt",
                    "Sách nào sắp hết hàng",
                    "Có gì bất thường hôm nay không"
            );
            return new FallbackResponse(message, actions, suggestions);
        }

        // Dành cho Client Storefront:
        String message;
        List<ChatAction> actions = new ArrayList<>();
        List<String> suggestions = new ArrayList<>();

        if (pageContext != null && pageContext.pageType() == PageContext.PageType.CART) {
            message = "Boki chưa rõ câu hỏi của bạn. Vì bạn đang ở giỏ hàng, bạn có muốn Boki hỗ trợ:";
            actions.add(ChatAction.of(ChatActionType.NAVIGATE, "🎟️ Tìm mã giảm giá tốt nhất", Map.of("tool", "getActiveVouchers")));
            actions.add(ChatAction.of(ChatActionType.NAVIGATE, "🚚 Kiểm tra điều kiện Freeship", Map.of("tool", "checkShippingFee")));
            suggestions.addAll(List.of("Mã giảm giá cho giỏ này", "Bao nhiêu tiền được freeship?", "Chính sách đổi trả"));
        } else if (pageContext != null && pageContext.pageType() == PageContext.PageType.BOOK_DETAIL) {
            message = "Boki chưa hiểu rõ yêu cầu của bạn về cuốn sách này. Bạn có muốn:";
            actions.add(ChatAction.of(ChatActionType.NAVIGATE, "📦 Kiểm tra số lượng còn trong kho", Map.of("tool", "checkStock")));
            actions.add(ChatAction.of(ChatActionType.NAVIGATE, "🎁 Xem bản đặc biệt / Boxset", Map.of("tool", "getBookVariants")));
            actions.add(ChatAction.of(ChatActionType.NAVIGATE, "🚚 Xem phí và thời gian giao hàng", Map.of("tool", "checkShippingFee")));
            suggestions.addAll(List.of("Sách này còn hàng không?", "Có bản đặc biệt không?", "Phí ship bao nhiêu?"));
        } else {
            message = "Boki chưa chắc chắn bạn đang cần tìm thông tin nào. Có phải bạn đang muốn:";
            actions.add(ChatAction.of(ChatActionType.NAVIGATE, "🔎 Tìm sách theo thể loại / sở thích", Map.of("action", "SEARCH_SUGGESTION")));
            actions.add(ChatAction.of(ChatActionType.NAVIGATE, "📦 Tra cứu trạng thái đơn hàng", Map.of("action", "ORDER_HELP")));
            actions.add(ChatAction.of(ChatActionType.NAVIGATE, "🎟️ Nhận mã giảm giá hôm nay", Map.of("tool", "getActiveVouchers")));
            actions.add(ChatAction.of(ChatActionType.NAVIGATE, "🚚 Biểu phí & Thời gian giao hàng", Map.of("tool", "checkShippingFee")));
            suggestions.addAll(List.of("Tìm manga thể thao", "Mã giảm giá hôm nay", "Tra cứu đơn hàng", "Chính sách đổi trả sách"));
        }

        return new FallbackResponse(message, actions, suggestions);
    }

    public record FallbackResponse(
            String message,
            List<ChatAction> actions,
            List<String> suggestions
    ) {}
}
