package com.boki.application.service;

import com.boki.application.dto.notification.ComposeBroadcastRequest;
import com.boki.application.dto.notification.EmailJobResponse;
import com.boki.application.dto.notification.SmtpConfigDto;
import com.boki.application.dto.notification.SubscriptionResponse;
import com.boki.infrastructure.email.EmailTemplateRenderer;
import com.boki.infrastructure.email.SmtpEmailSender;
import com.boki.infrastructure.persistence.entity.EmailOutboxJobJpaEntity;
import com.boki.infrastructure.persistence.entity.EmailSmtpConfigJpaEntity;
import com.boki.infrastructure.persistence.entity.ScheduleEmailSubscriptionJpaEntity;
import com.boki.infrastructure.persistence.repository.EmailOutboxJobJpaRepository;
import com.boki.infrastructure.persistence.repository.EmailSmtpConfigJpaRepository;
import com.boki.infrastructure.persistence.repository.ScheduleEmailSubscriptionJpaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminEmailManagementService {

    private final EmailOutboxJobJpaRepository outboxRepo;
    private final EmailSmtpConfigJpaRepository smtpConfigRepo;
    private final ScheduleEmailSubscriptionJpaRepository subscriptionRepo;
    private final SmtpEmailSender smtpSender;
    private final EmailTemplateRenderer templateRenderer;

    @Value("${app.schedule.frontend-url:https://schedule.boki.nhatcuong.io.vn}")
    private String scheduleFrontendUrl;

    @Transactional(readOnly = true)
    public Page<EmailJobResponse> getJobs(String status, String emailType, Pageable pageable) {
        String s = (status != null && !status.isBlank()) ? status.trim().toUpperCase() : null;
        String t = (emailType != null && !emailType.isBlank()) ? emailType.trim().toUpperCase() : null;
        return outboxRepo.findFilteredJobs(s, t, pageable).map(this::toJobResponse);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getOverviewStats() {
        Map<String, Object> stats = new HashMap<>();
        List<Object[]> counts = outboxRepo.countJobsByStatus();
        long pending = 0, sent = 0, failed = 0, bounced = 0;
        for (Object[] row : counts) {
            String st = (String) row[0];
            Long cnt = (Long) row[1];
            if ("PENDING".equalsIgnoreCase(st)) pending += cnt;
            else if ("SENT".equalsIgnoreCase(st)) sent += cnt;
            else if ("FAILED".equalsIgnoreCase(st)) failed += cnt;
            else if ("BOUNCED".equalsIgnoreCase(st)) bounced += cnt;
        }
        stats.put("pendingJobs", pending);
        stats.put("sentJobs", sent);
        stats.put("failedJobs", failed);
        stats.put("bouncedJobs", bounced);
        stats.put("totalSubscribers", subscriptionRepo.countActiveSubscriptions());
        return stats;
    }

    @Transactional
    public void retryJob(UUID jobId) {
        EmailOutboxJobJpaEntity job = outboxRepo.findById(jobId)
                .orElseThrow(() -> new IllegalArgumentException("Job not found: " + jobId));
        job.setStatus("PENDING");
        job.setRetryCount(0);
        job.setErrorMessage(null);
        job.setScheduledAt(OffsetDateTime.now());
        outboxRepo.save(job);
    }

    @Transactional
    public int broadcast(ComposeBroadcastRequest request) {
        List<String> emails = new ArrayList<>();
        if ("TEST_ONLY".equalsIgnoreCase(request.getTargetGroup())) {
            if (request.getTestEmail() != null && !request.getTestEmail().isBlank()) {
                emails.add(request.getTestEmail().trim().toLowerCase());
            }
        } else if ("SERIES_SUBSCRIBERS".equalsIgnoreCase(request.getTargetGroup())) {
            emails = subscriptionRepo.findBySubscriptionTypeAndTargetIdAndActiveTrue("SERIES", request.getTargetId())
                    .stream().map(ScheduleEmailSubscriptionJpaEntity::getEmail).distinct().toList();
        } else {
            emails = subscriptionRepo.findAll().stream()
                    .filter(ScheduleEmailSubscriptionJpaEntity::getActive)
                    .map(ScheduleEmailSubscriptionJpaEntity::getEmail).distinct().toList();
        }

        String batchId = UUID.randomUUID().toString().substring(0, 8);
        int enqueued = 0;
        for (String recipient : emails) {
            String unsubUrl = scheduleFrontendUrl + "/thong-bao-email";
            EmailTemplateRenderer.RenderedEmail rendered = templateRenderer.renderCustomBroadcast(
                    recipient, request.getSubject(), request.getContent(), unsubUrl
            );

            EmailOutboxJobJpaEntity job = EmailOutboxJobJpaEntity.builder()
                    .recipientEmail(recipient)
                    .subject(rendered.subject())
                    .bodyHtml(rendered.htmlBody())
                    .bodyText(rendered.textBody())
                    .emailType("ADMIN_BROADCAST")
                    .idempotencyKey("broadcast_" + batchId + "_" + recipient)
                    .unsubscribeUrl(unsubUrl)
                    .status("PENDING")
                    .build();
            outboxRepo.save(job);
            enqueued++;
        }
        return enqueued;
    }

    @Transactional(readOnly = true)
    public SmtpConfigDto getSmtpConfig() {
        return smtpConfigRepo.findActiveConfig().map(c -> SmtpConfigDto.builder()
                .host(c.getHost()).port(c.getPort()).username(c.getUsername())
                .password("")
                .passwordConfigured(c.getPassword() != null && !c.getPassword().isBlank())
                .authEnabled(c.getAuthEnabled()).starttlsEnabled(c.getStarttlsEnabled())
                .fromName(c.getFromName()).fromEmail(c.getFromEmail()).replyTo(c.getReplyTo())
                .maxRatePerMinute(c.getMaxRatePerMinute()).isEnabled(c.getIsEnabled()).build()
        ).orElseGet(() -> SmtpConfigDto.builder()
                .host("smtp.gmail.com").port(587).isEnabled(false).password("").passwordConfigured(false).build());
    }

    @Transactional
    public void updateSmtpConfig(SmtpConfigDto dto) {
        EmailSmtpConfigJpaEntity entity = smtpConfigRepo.findActiveConfig()
                .orElse(EmailSmtpConfigJpaEntity.builder().build());

        entity.setHost(dto.getHost() != null ? dto.getHost().trim() : "smtp.gmail.com");
        entity.setPort(dto.getPort() != null ? dto.getPort() : 587);
        entity.setUsername(dto.getUsername() != null ? dto.getUsername().trim() : null);
        if (dto.getPassword() != null && !dto.getPassword().isBlank()) {
            entity.setPassword(dto.getPassword().replaceAll("\\s+", ""));
        }
        entity.setAuthEnabled(dto.getAuthEnabled() == null || Boolean.TRUE.equals(dto.getAuthEnabled()));
        entity.setStarttlsEnabled(dto.getStarttlsEnabled() == null || Boolean.TRUE.equals(dto.getStarttlsEnabled()));
        entity.setFromName(dto.getFromName());
        entity.setFromEmail(dto.getFromEmail() != null ? dto.getFromEmail().trim() : null);
        entity.setReplyTo(dto.getReplyTo() != null ? dto.getReplyTo().trim() : null);
        entity.setMaxRatePerMinute(dto.getMaxRatePerMinute() != null ? dto.getMaxRatePerMinute() : 30);
        entity.setIsEnabled(dto.getIsEnabled() == null || Boolean.TRUE.equals(dto.getIsEnabled()));
        entity.setUpdatedAt(OffsetDateTime.now());
        smtpConfigRepo.save(entity);
    }

    public void testConnection(SmtpConfigDto dto) throws Exception {
        if (dto.getPassword() == null || dto.getPassword().isBlank()) {
            String dbPass = smtpConfigRepo.findActiveConfig()
                    .map(EmailSmtpConfigJpaEntity::getPassword)
                    .orElse(null);
            if (dbPass == null || dbPass.isBlank()) {
                throw new IllegalArgumentException("Chưa có mật khẩu được lưu trong cơ sở dữ liệu. Vui lòng nhập App Password (16 ký tự) vào ô mật khẩu.");
            }
            dto.setPassword(dbPass);
        } else {
            dto.setPassword(dto.getPassword().replaceAll("\\s+", ""));
        }

        if (dto.getUsername() == null || dto.getUsername().isBlank()) {
            throw new IllegalArgumentException("Tài khoản / Username không được để trống!");
        }

        if (dto.getAuthEnabled() == null) {
            dto.setAuthEnabled(true);
        }
        if (dto.getStarttlsEnabled() == null) {
            dto.setStarttlsEnabled(true);
        }

        log.info("[SMTP TEST] User='{}', Host='{}:{}', passwordLength={}",
                dto.getUsername(), dto.getHost(), dto.getPort(), dto.getPassword().length());

        smtpSender.testConnection(dto);
    }

    @Transactional(readOnly = true)
    public Page<SubscriptionResponse> getSubscriptions(Pageable pageable) {
        return subscriptionRepo.findAllPaged(pageable).map(s -> SubscriptionResponse.builder()
                .id(s.getId()).email(s.getEmail()).subscriptionType(s.getSubscriptionType())
                .targetId(s.getTargetId()).targetName(s.getTargetName()).active(s.getActive())
                .unsubscribeToken(s.getUnsubscribeToken()).createdAt(s.getCreatedAt()).build()
        );
    }

    private EmailJobResponse toJobResponse(EmailOutboxJobJpaEntity j) {
        return EmailJobResponse.builder()
                .id(j.getId()).recipientEmail(j.getRecipientEmail()).subject(j.getSubject())
                .emailType(j.getEmailType()).status(j.getStatus()).retryCount(j.getRetryCount())
                .maxRetries(j.getMaxRetries()).errorMessage(j.getErrorMessage())
                .scheduledAt(j.getScheduledAt()).sentAt(j.getSentAt()).createdAt(j.getCreatedAt())
                .build();
    }
}
