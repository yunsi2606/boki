package com.boki.application.chat.orchestrator;

import com.boki.application.chat.context.ConversationContextManager;
import com.boki.application.chat.context.SmartFallbackProvider;
import com.boki.application.chat.tools.ToolRouter;
import com.boki.domain.chat.model.ChatAction;
import com.boki.domain.chat.model.ChatActionType;
import com.boki.domain.chat.model.ConversationState;
import com.boki.domain.chat.provider.AiProvider;
import com.boki.domain.chat.provider.AiRequest;
import com.boki.domain.chat.provider.AiResponse;
import com.boki.domain.chat.tool.ToolExecutionContext;
import com.boki.domain.chat.tool.ToolMetadata;
import com.boki.domain.chat.tool.ToolResult;
import com.boki.infrastructure.persistence.entity.ChatAuditLogJpaEntity;
import com.boki.infrastructure.persistence.repository.ChatAuditLogJpaRepository;
import com.boki.interfaces.rest.chat.dto.ChatRequestDto;
import com.boki.interfaces.rest.chat.dto.ChatResponseDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class AiOrchestrator {

    private static final Logger log = LoggerFactory.getLogger(AiOrchestrator.class);

    private final ConversationContextManager contextManager;
    private final SmartFallbackProvider fallbackProvider;
    private final ToolRouter toolRouter;
    private final List<AiProvider> aiProviders;
    private final ChatAuditLogJpaRepository auditLogRepository;

    private static final Pattern FASTPATH_ORDER_PATTERN = Pattern.compile("^(BK-[A-Za-z0-9-]+|[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$");

    public AiOrchestrator(
            ConversationContextManager contextManager,
            SmartFallbackProvider fallbackProvider,
            ToolRouter toolRouter,
            List<AiProvider> aiProviders,
            ChatAuditLogJpaRepository auditLogRepository
    ) {
        this.contextManager = contextManager;
        this.fallbackProvider = fallbackProvider;
        this.toolRouter = toolRouter;
        this.aiProviders = aiProviders;
        this.auditLogRepository = auditLogRepository;
    }

    /**
     * Điều phối xử lý hội thoại toàn diện cho cả Client và Admin.
     */
    public ChatResponseDto processMessage(ChatRequestDto request, UUID userId, String userRole, String clientIp) {
        long startTime = System.currentTimeMillis();
        String messageId = "msg-" + UUID.randomUUID().toString().substring(0, 8);
        String userMsg = request.message().trim();

        // 1. Khởi tạo / cập nhật Conversation Context & Page Context
        ConversationState state = contextManager.getOrCreateSession(request.sessionId(), userId, userRole, request.currentPath());
        ToolExecutionContext executionContext = new ToolExecutionContext(
                userId, userRole, state.getSessionId(), request.currentPath(), state.getPageContext(), state
        );

        boolean isAdmin = "ADMIN".equalsIgnoreCase(userRole) || "SELLER".equalsIgnoreCase(userRole);
        List<String> toolsInvoked = new ArrayList<>();
        String responseText;
        ChatActionType actionType = ChatActionType.NONE;
        List<Object> cards = new ArrayList<>();
        List<ChatAction> actions = new ArrayList<>();
        List<String> suggestions = new ArrayList<>();
        boolean isFallback = false;

        // 2. FAST-PATH: Kiểm tra mã đơn hàng trực tiếp bằng Regex
        Matcher fastOrderMatcher = FASTPATH_ORDER_PATTERN.matcher(userMsg);
        if (fastOrderMatcher.matches()) {
            log.info("Fast-path Order Tracking triggered for: {}", userMsg);
            ToolResult orderResult = toolRouter.executeTool("getOrder", executionContext, Map.of("orderCode", userMsg));
            toolsInvoked.add("getOrder");
            responseText = orderResult.message();
            actionType = orderResult.actionType();
            cards.addAll(orderResult.cards());
            actions.addAll(orderResult.actions());
        } else {
            // 3. AI ORCHESTRATION: Chọn Provider khả dụng (Ưu tiên Provider ngoài nếu có, fallback về Mock)
            AiProvider activeProvider = selectProvider();
            List<ToolMetadata> availableTools = toolRouter.getAvailableTools(executionContext);

            AiRequest aiRequest = new AiRequest(
                    userMsg, state, availableTools, "BokiStore AI Assistant", Map.of()
            );

            AiResponse aiResponse = activeProvider.generate(aiRequest);

            // 4. Nếu AI yêu cầu gọi Tool
            if (aiResponse.requiresToolExecution() && !aiResponse.toolCalls().isEmpty()) {
                AiResponse.ToolCall call = aiResponse.toolCalls().get(0);
                toolsInvoked.add(call.toolName());

                ToolResult toolResult = toolRouter.executeTool(call.toolName(), executionContext, call.arguments());
                responseText = toolResult.message();
                actionType = toolResult.actionType();
                cards.addAll(toolResult.cards());
                actions.addAll(toolResult.actions());

                state.setLastIntent(call.toolName());
            } else if (aiResponse.replyText() != null && !aiResponse.replyText().isBlank()) {
                // Phản hồi trực tiếp từ AI (như chào hỏi)
                responseText = aiResponse.replyText();
                if (!isAdmin) {
                    suggestions.addAll(List.of("Tìm sách hot tuần này", "Mã freeship hôm nay", "Tra cứu đơn hàng", "Chính sách đổi trả"));
                }
            } else {
                // 5. SMART FALLBACK: Không nhận diện được ý định rõ ràng
                isFallback = true;
                var fallback = fallbackProvider.buildSmartFallback(state.getPageContext(), isAdmin);
                responseText = fallback.message();
                actions.addAll(fallback.actions());
                suggestions.addAll(fallback.suggestions());
            }
        }

        int latencyMs = (int) (System.currentTimeMillis() - startTime);

        // 6. Ghi nhận lượt hội thoại vào Conversation State
        state.addTurn("user", userMsg, List.of());
        state.addTurn("assistant", responseText, toolsInvoked);

        // 7. Ghi nhận Audit Log (Observability & Telemetry)
        Long auditLogId = null;
        try {
            ChatAuditLogJpaEntity audit = new ChatAuditLogJpaEntity();
            audit.setSessionId(state.getSessionId());
            audit.setUserId(userId);
            audit.setClientIp(clientIp);
            audit.setUserMessage(userMsg);
            audit.setIntentDetected(state.getLastIntent());
            audit.setToolsCalled(toolsInvoked);
            audit.setBotResponse(responseText);
            audit.setLatencyMs(latencyMs);
            audit.setFallback(isFallback);
            ChatAuditLogJpaEntity savedAudit = auditLogRepository.save(audit);
            auditLogId = savedAudit.getId();
        } catch (Exception e) {
            log.error("Failed to save chat audit log: {}", e.getMessage());
        }

        String finalMsgId = auditLogId != null ? auditLogId.toString() : messageId;
        return ChatResponseDto.of(finalMsgId, responseText, actionType, cards, actions, suggestions, latencyMs);
    }

    private AiProvider selectProvider() {
        // Ưu tiên GeminiProvider nếu đã có cấu hình API Key
        for (AiProvider p : aiProviders) {
            if (!"MockAiProvider".equalsIgnoreCase(p.getProviderName()) && p.isAvailable()) {
                return p;
            }
        }
        // Fallback về MockAiProvider
        return aiProviders.stream()
                .filter(p -> "MockAiProvider".equalsIgnoreCase(p.getProviderName()))
                .findFirst()
                .orElse(aiProviders.get(0));
    }
}
