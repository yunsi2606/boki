package com.boki.interfaces.rest.chat;

import com.boki.application.chat.orchestrator.AiOrchestrator;
import com.boki.infrastructure.persistence.entity.ChatAuditLogJpaEntity;
import com.boki.infrastructure.persistence.repository.ChatAuditLogJpaRepository;
import com.boki.infrastructure.security.AuthenticatedUser;
import com.boki.interfaces.rest.chat.dto.ChatFeedbackDto;
import com.boki.interfaces.rest.chat.dto.ChatRequestDto;
import com.boki.interfaces.rest.chat.dto.ChatResponseDto;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final AiOrchestrator aiOrchestrator;
    private final ChatAuditLogJpaRepository auditLogRepository;

    public ChatController(AiOrchestrator aiOrchestrator, ChatAuditLogJpaRepository auditLogRepository) {
        this.aiOrchestrator = aiOrchestrator;
        this.auditLogRepository = auditLogRepository;
    }

    @PostMapping("/message")
    public ResponseEntity<ChatResponseDto> sendMessage(
            @Valid @RequestBody ChatRequestDto request,
            @AuthenticationPrincipal AuthenticatedUser authUser,
            Authentication authentication,
            HttpServletRequest servletRequest
    ) {
        UUID userId = authUser != null ? authUser.userId() : null;
        String userRole = extractRole(authentication);
        String clientIp = servletRequest.getRemoteAddr();

        ChatResponseDto response = aiOrchestrator.processMessage(request, userId, userRole, clientIp);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/suggestions")
    public ResponseEntity<List<String>> getSuggestions(@RequestParam(required = false) String path) {
        if (path != null && path.startsWith("/cart")) {
            return ResponseEntity.ok(List.of(
                    "Có mã giảm giá nào cho giỏ này không?",
                    "Bao nhiêu tiền thì được freeship?",
                    "Chính sách đổi trả sách tại BokiStore"
            ));
        }
        if (path != null && path.startsWith("/books/")) {
            return ResponseEntity.ok(List.of(
                    "Sách này còn hàng không?",
                    "Có bản đặc biệt hoặc boxset không?",
                    "Giao đến Hà Nội/TP.HCM mất bao lâu?"
            ));
        }
        return ResponseEntity.ok(List.of(
                "🔥 Manga nào hot nhất tuần này?",
                "📦 Tra cứu đơn hàng của tôi",
                "🎟️ Mã giảm giá mới hôm nay",
                "🚚 Phí ship và thời gian giao hàng"
        ));
    }

    @PostMapping("/feedback")
    public ResponseEntity<Void> submitFeedback(@Valid @RequestBody ChatFeedbackDto dto) {
        Optional<ChatAuditLogJpaEntity> auditOpt = auditLogRepository.findById(dto.logId());
        if (auditOpt.isPresent()) {
            ChatAuditLogJpaEntity audit = auditOpt.get();
            audit.setFeedback(dto.feedback());
            audit.setFeedbackReason(dto.reason());
            auditLogRepository.save(audit);
        }
        return ResponseEntity.ok().build();
    }

    private String extractRole(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return "GUEST";
        }
        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equalsIgnoreCase("ROLE_ADMIN"));
        if (isAdmin) return "ADMIN";

        boolean isSeller = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equalsIgnoreCase("ROLE_SELLER"));
        if (isSeller) return "SELLER";

        boolean isBuyer = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equalsIgnoreCase("ROLE_BUYER"));
        if (isBuyer) return "BUYER";

        return "BUYER";
    }
}
