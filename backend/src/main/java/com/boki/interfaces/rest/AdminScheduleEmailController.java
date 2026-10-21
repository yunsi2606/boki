package com.boki.interfaces.rest;

import com.boki.application.dto.notification.ComposeBroadcastRequest;
import com.boki.application.dto.notification.EmailJobResponse;
import com.boki.application.dto.notification.SmtpConfigDto;
import com.boki.application.dto.notification.SubscriptionResponse;
import com.boki.application.service.AdminEmailManagementService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/schedule/email")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'SELLER')")
public class AdminScheduleEmailController {

    private final AdminEmailManagementService adminEmailService;

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        return ResponseEntity.ok(adminEmailService.getOverviewStats());
    }

    @GetMapping("/jobs")
    public ResponseEntity<Page<EmailJobResponse>> getJobs(
            @RequestParam(name = "status", required = false) String status,
            @RequestParam(name = "emailType", required = false) String emailType,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(adminEmailService.getJobs(status, emailType, PageRequest.of(page, size)));
    }

    @PostMapping("/jobs/{id}/retry")
    public ResponseEntity<Map<String, Object>> retryJob(@PathVariable("id") UUID id) {
        adminEmailService.retryJob(id);
        return ResponseEntity.ok(Map.of("message", "Job đã được đưa lại vào hàng đợi PENDING."));
    }

    @PostMapping("/broadcast")
    public ResponseEntity<Map<String, Object>> broadcast(@Valid @RequestBody ComposeBroadcastRequest request) {
        int count = adminEmailService.broadcast(request);
        return ResponseEntity.ok(Map.of(
                "message", "Đã xếp " + count + " email vào hàng đợi outbox thành công.",
                "enqueuedCount", count
        ));
    }

    @GetMapping("/smtp")
    public ResponseEntity<SmtpConfigDto> getSmtpConfig() {
        return ResponseEntity.ok(adminEmailService.getSmtpConfig());
    }

    @PutMapping("/smtp")
    public ResponseEntity<Map<String, Object>> updateSmtpConfig(@Valid @RequestBody SmtpConfigDto dto) {
        adminEmailService.updateSmtpConfig(dto);
        return ResponseEntity.ok(Map.of("message", "Cập nhật cấu hình SMTP thành công."));
    }

    @PostMapping("/smtp/test")
    public ResponseEntity<Map<String, Object>> testSmtpConnection(@RequestBody SmtpConfigDto dto) {
        try {
            adminEmailService.testConnection(dto);
            return ResponseEntity.ok(Map.of("success", true, "message", "Kết nối SMTP máy chủ thành công!"));
        } catch (Exception ex) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Lỗi kết nối SMTP: " + ex.getMessage()
            ));
        }
    }

    @GetMapping("/subscriptions")
    public ResponseEntity<Page<SubscriptionResponse>> getSubscriptions(
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(adminEmailService.getSubscriptions(PageRequest.of(page, size)));
    }
}
