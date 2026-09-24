package com.boki.interfaces.rest.chat;

import com.boki.application.chat.orchestrator.AiOrchestrator;
import com.boki.application.chat.tools.ToolRouter;
import com.boki.domain.chat.model.PageContext;
import com.boki.domain.chat.tool.ToolExecutionContext;
import com.boki.domain.chat.tool.ToolResult;
import com.boki.infrastructure.persistence.repository.ChatAuditLogJpaRepository;
import com.boki.infrastructure.security.AuthenticatedUser;
import com.boki.interfaces.rest.chat.dto.ChatRequestDto;
import com.boki.interfaces.rest.chat.dto.ChatResponseDto;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;

@RestController
@RequestMapping("/api/admin/chat")
@PreAuthorize("hasAnyRole('ADMIN', 'SELLER')")
public class AdminChatController {

    private final AiOrchestrator aiOrchestrator;
    private final ToolRouter toolRouter;
    private final ChatAuditLogJpaRepository auditLogRepository;
    private final com.boki.application.chat.confirmation.ChatConfirmationService chatConfirmationService;

    public AdminChatController(
            AiOrchestrator aiOrchestrator,
            ToolRouter toolRouter,
            ChatAuditLogJpaRepository auditLogRepository,
            com.boki.application.chat.confirmation.ChatConfirmationService chatConfirmationService
    ) {
        this.aiOrchestrator = aiOrchestrator;
        this.toolRouter = toolRouter;
        this.auditLogRepository = auditLogRepository;
        this.chatConfirmationService = chatConfirmationService;
    }

    @PostMapping("/message")
    public ResponseEntity<ChatResponseDto> sendAdminMessage(
            @Valid @RequestBody ChatRequestDto request,
            @AuthenticationPrincipal AuthenticatedUser authUser,
            Authentication authentication,
            HttpServletRequest servletRequest
    ) {
        UUID adminId = authUser.userId();
        String role = extractRole(authentication);
        String clientIp = servletRequest.getRemoteAddr();

        ChatResponseDto response = aiOrchestrator.processMessage(request, adminId, role, clientIp);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/confirm")
    public ResponseEntity<Map<String, Object>> confirmAction(
            @Valid @RequestBody com.boki.interfaces.rest.chat.dto.ConfirmationRequestDto request,
            @AuthenticationPrincipal AuthenticatedUser authUser
    ) {
        UUID adminId = authUser.userId();
        Map<String, Object> result = chatConfirmationService.processConfirmation(request, adminId);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/logs")
    public ResponseEntity<org.springframework.data.domain.Page<com.boki.infrastructure.persistence.entity.ChatAuditLogJpaEntity>> getAuditLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size
    ) {
        org.springframework.data.domain.PageRequest pageRequest = org.springframework.data.domain.PageRequest.of(page, size);
        return ResponseEntity.ok(auditLogRepository.findAllByOrderByCreatedAtDesc(pageRequest));
    }

    @GetMapping("/briefing")
    public ResponseEntity<ToolResult> getDailyBriefing(
            @AuthenticationPrincipal AuthenticatedUser authUser,
            Authentication authentication
    ) {
        String role = extractRole(authentication);
        ToolExecutionContext context = new ToolExecutionContext(
                authUser.userId(), role, "admin-briefing", "/admin", PageContext.unknown(), null
        );
        ToolResult result = toolRouter.executeTool("getDailyBriefing", context, Map.of());
        return ResponseEntity.ok(result);
    }

    @GetMapping("/shortcuts")
    public ResponseEntity<List<Map<String, String>>> getShortcuts() {
        return ResponseEntity.ok(List.of(
                Map.of("label", "Doanh thu hôm nay", "prompt", "Doanh thu hôm nay sao rồi?"),
                Map.of("label", "Đơn hàng cần duyệt", "prompt", "Có bao nhiêu đơn hàng đang chờ duyệt?"),
                Map.of("label", "Cảnh báo tồn kho thấp", "prompt", "Những tựa sách nào sắp hết hàng?"),
                Map.of("label", "Quét bất thường", "prompt", "Hôm nay có gì bất thường trong vận hành không?")
        ));
    }

    @GetMapping("/analytics")
    public ResponseEntity<Map<String, Object>> getChatAnalytics() {
        Instant past7Days = Instant.now().minus(7, ChronoUnit.DAYS);
        long totalConversations = auditLogRepository.countByCreatedAtAfter(past7Days);
        long fallbackCount = auditLogRepository.countByFallbackTrueAndCreatedAtAfter(past7Days);
        Double avgLatency = auditLogRepository.getAverageLatencySince(past7Days);

        double fallbackRate = totalConversations > 0 ? ((double) fallbackCount / totalConversations) * 100.0 : 0.0;
        double resolvedRate = Math.max(0.0, 100.0 - fallbackRate);

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("totalConversations7d", totalConversations);
        data.put("resolvedRate", Math.round(resolvedRate * 10.0) / 10.0);
        data.put("fallbackRate", Math.round(fallbackRate * 10.0) / 10.0);
        data.put("avgLatencyMs", avgLatency != null ? Math.round(avgLatency) : 0);

        return ResponseEntity.ok(data);
    }

    private String extractRole(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return "ADMIN";
        }
        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equalsIgnoreCase("ROLE_ADMIN"));
        if (isAdmin) return "ADMIN";

        boolean isSeller = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equalsIgnoreCase("ROLE_SELLER"));
        if (isSeller) return "SELLER";

        return "ADMIN";
    }
}
