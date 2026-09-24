package com.boki.application.chat.tools.admin;

import com.boki.domain.chat.model.ChatAction;
import com.boki.domain.chat.model.ChatActionType;
import com.boki.domain.chat.tool.*;
import com.boki.infrastructure.persistence.entity.UserJpaEntity;
import com.boki.infrastructure.persistence.repository.UserJpaRepository;
import org.springframework.stereotype.Component;

import java.util.*;

@Component
public class SearchCustomerTool implements ChatTool {

    private final UserJpaRepository userRepository;

    public SearchCustomerTool(UserJpaRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public String getName() {
        return "searchCustomer";
    }

    @Override
    public ToolMetadata getMetadata() {
        return ToolMetadata.admin(
                "searchCustomer",
                "Tra cứu hồ sơ khách hàng theo email, số điện thoại hoặc tên hiển thị. Hiển thị hạng thành viên VIP và tổng chi tiêu.",
                Map.of(
                        "query", "Email, số điện thoại hoặc tên khách hàng cần tìm"
                ),
                List.of("query")
        );
    }

    @Override
    public ToolPermission getRequiredPermission() {
        return ToolPermission.ADMIN_ONLY;
    }

    @Override
    public ToolResult execute(ToolExecutionContext context, Map<String, Object> params) {
        String query = params != null && params.get("query") != null ? params.get("query").toString().trim() : "";
        if (query.isEmpty()) {
            return ToolResult.error("Vui lòng cung cấp email, số điện thoại hoặc tên khách hàng cần tra cứu.");
        }

        List<UserJpaEntity> allUsers = userRepository.findAll();
        String lowerQuery = query.toLowerCase();

        List<UserJpaEntity> matched = allUsers.stream()
                .filter(u -> (u.getEmail() != null && u.getEmail().toLowerCase().contains(lowerQuery)) ||
                             (u.getPhoneNumber() != null && u.getPhoneNumber().contains(query)) ||
                             (u.getDisplayName() != null && u.getDisplayName().toLowerCase().contains(lowerQuery)))
                .limit(5)
                .toList();

        if (matched.isEmpty()) {
            return ToolResult.ok(
                    "Không tìm thấy hồ sơ khách hàng nào khớp với từ khóa: \"" + query + "\"",
                    List.of(),
                    ChatActionType.NONE,
                    List.of(),
                    List.of()
            );
        }

        StringBuilder sb = new StringBuilder();
        sb.append(String.format("👤 **Tìm thấy %d khách hàng khớp với từ khóa \"%s\":**\n\n", matched.size(), query));

        List<Object> userCards = new ArrayList<>();
        for (UserJpaEntity u : matched) {
            Map<String, Object> card = new LinkedHashMap<>();
            card.put("id", u.getId().toString());
            card.put("displayName", u.getDisplayName());
            card.put("email", u.getEmail());
            card.put("phone", u.getPhoneNumber() != null ? u.getPhoneNumber() : "Chưa có");
            card.put("memberTier", u.getMemberTier() != null ? u.getMemberTier() : "STANDARD");
            card.put("totalSpent", u.getTotalSpent());
            card.put("loyaltyPoints", u.getLoyaltyPoints());
            card.put("role", u.getRole() != null ? u.getRole().name() : "BUYER");
            userCards.add(card);

            sb.append(String.format("• **%s** (%s)\n  Hạng: **%s** | Chi tiêu: %,.0f ₫ | SĐT: %s\n",
                    u.getDisplayName(), u.getEmail(),
                    u.getMemberTier() != null ? u.getMemberTier() : "STANDARD",
                    u.getTotalSpent() != null ? u.getTotalSpent().doubleValue() : 0.0,
                    u.getPhoneNumber() != null ? u.getPhoneNumber() : "N/A"));
        }

        return ToolResult.ok(sb.toString(), userCards, ChatActionType.NONE, userCards, List.of(
                ChatAction.of(ChatActionType.NAVIGATE, "Quản lý người dùng", Map.of("path", "/admin/users"))
        ));
    }
}
