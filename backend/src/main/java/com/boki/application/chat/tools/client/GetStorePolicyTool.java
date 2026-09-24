package com.boki.application.chat.tools.client;

import com.boki.domain.chat.model.ChatActionType;
import com.boki.domain.chat.tool.*;
import com.boki.infrastructure.persistence.entity.KnowledgeBaseJpaEntity;
import com.boki.infrastructure.persistence.repository.KnowledgeBaseJpaRepository;
import org.springframework.stereotype.Component;

import java.util.*;

@Component
public class GetStorePolicyTool implements ChatTool {

    private final KnowledgeBaseJpaRepository knowledgeRepository;

    public GetStorePolicyTool(KnowledgeBaseJpaRepository knowledgeRepository) {
        this.knowledgeRepository = knowledgeRepository;
    }

    @Override
    public String getName() {
        return "getStorePolicy";
    }

    @Override
    public ToolMetadata getMetadata() {
        return ToolMetadata.client(
                "getStorePolicy",
                "Tra cứu các chính sách cửa hàng từ cơ sở tri thức (Knowledge Base): đổi trả, bảo hành, phí ship, VIP, thanh toán, đặt trước.",
                Map.of(
                        "category", "Danh mục chính sách: SHIPPING, RETURN, VIP, PAYMENT, PREORDER, STORE_INFO",
                        "query", "Từ khóa cần tra cứu trong chính sách"
                ),
                List.of()
        );
    }

    @Override
    public ToolPermission getRequiredPermission() {
        return ToolPermission.PUBLIC;
    }

    @Override
    public ToolResult execute(ToolExecutionContext context, Map<String, Object> params) {
        String category = params != null && params.get("category") != null ? params.get("category").toString().toUpperCase().trim() : null;
        String query = params != null && params.get("query") != null ? params.get("query").toString().trim() : null;

        List<KnowledgeBaseJpaEntity> results;

        if (category != null && !category.isEmpty()) {
            results = knowledgeRepository.findByCategoryAndActiveTrue(category);
        } else if (query != null && !query.isEmpty()) {
            results = knowledgeRepository.searchActiveKnowledge(query);
        } else {
            results = knowledgeRepository.findByActiveTrue();
        }

        if (results.isEmpty()) {
            return ToolResult.ok(
                    "BokiStore luôn cam kết mang lại trải nghiệm tốt nhất cho bạn. Bạn có thể liên hệ hotline 1900-888-BOKI để được hỗ trợ trực tiếp mọi thắc mắc nhé!",
                    List.of(),
                    ChatActionType.NONE,
                    List.of(),
                    List.of()
            );
        }

        KnowledgeBaseJpaEntity item = results.get(0);
        String msg = String.format("### 📋 %s\n\n%s", item.getTitle(), item.getContent());

        return ToolResult.ok(msg, item, ChatActionType.NONE, List.of(item), List.of());
    }
}
