package com.boki.application.service;

import com.boki.application.dto.notification.ScheduleSubscriptionRequest;
import com.boki.application.dto.notification.SubscriptionResponse;
import com.boki.infrastructure.email.EmailTemplateRenderer;
import com.boki.infrastructure.persistence.entity.EmailOutboxJobJpaEntity;
import com.boki.infrastructure.persistence.entity.ReleaseScheduleJpaEntity;
import com.boki.infrastructure.persistence.entity.ScheduleEmailSubscriptionJpaEntity;
import com.boki.infrastructure.persistence.repository.EmailOutboxJobJpaRepository;
import com.boki.infrastructure.persistence.repository.ScheduleEmailSubscriptionJpaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class ScheduleEmailSubscriptionService {

    private final ScheduleEmailSubscriptionJpaRepository subscriptionRepo;
    private final EmailOutboxJobJpaRepository outboxRepo;
    private final EmailTemplateRenderer templateRenderer;

    @Value("${app.schedule.frontend-url:https://schedule.boki.nhatcuong.io.vn}")
    private String scheduleFrontendUrl;

    private static final SecureRandom RANDOM = new SecureRandom();

    @Transactional
    public List<SubscriptionResponse> subscribe(ScheduleSubscriptionRequest request, UUID userId) {
        String email = request.getEmail().trim().toLowerCase();
        List<SubscriptionResponse> result = new ArrayList<>();

        for (String type : request.getSubscriptionTypes()) {
            String targetId = request.getTargetId() != null ? request.getTargetId().trim() : "";
            Optional<ScheduleEmailSubscriptionJpaEntity> existing =
                    subscriptionRepo.findByEmailAndSubscriptionTypeAndTargetId(email, type, targetId);

            ScheduleEmailSubscriptionJpaEntity entity;
            if (existing.isPresent()) {
                entity = existing.get();
                entity.setActive(true);
                entity.setTargetName(request.getTargetName());
                entity.setUpdatedAt(OffsetDateTime.now());
            } else {
                entity = ScheduleEmailSubscriptionJpaEntity.builder()
                        .email(email)
                        .userId(userId)
                        .subscriptionType(type)
                        .targetId(targetId)
                        .targetName(request.getTargetName())
                        .unsubscribeToken(generateToken())
                        .active(true)
                        .build();
            }
            entity = subscriptionRepo.save(entity);
            result.add(toResponse(entity));
        }

        return result;
    }

    @Transactional
    public boolean unsubscribeByToken(String token) {
        Optional<ScheduleEmailSubscriptionJpaEntity> sub = subscriptionRepo.findByUnsubscribeToken(token);
        if (sub.isPresent()) {
            ScheduleEmailSubscriptionJpaEntity entity = sub.get();
            entity.setActive(false);
            entity.setUpdatedAt(OffsetDateTime.now());
            subscriptionRepo.save(entity);
            return true;
        }
        return false;
    }

    @Transactional(readOnly = true)
    public List<SubscriptionResponse> getSubscriptionsByEmail(String email) {
        return subscriptionRepo.findByEmail(email.trim().toLowerCase()).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public void enqueueReleaseAlert(ReleaseScheduleJpaEntity schedule, String seriesSlug) {
        List<ScheduleEmailSubscriptionJpaEntity> subscribers = new ArrayList<>();
        if (seriesSlug != null && !seriesSlug.isBlank()) {
            subscribers.addAll(subscriptionRepo.findBySubscriptionTypeAndTargetIdAndActiveTrue("SERIES", seriesSlug));
        }
        subscribers.addAll(subscriptionRepo.findBySubscriptionTypeAndTargetIdAndActiveTrue(
                "VOLUME", schedule.getId().toString()
        ));

        // Deduplicate by email
        Map<String, ScheduleEmailSubscriptionJpaEntity> uniqueByEmail = new HashMap<>();
        for (ScheduleEmailSubscriptionJpaEntity sub : subscribers) {
            uniqueByEmail.putIfAbsent(sub.getEmail(), sub);
        }

        DateTimeFormatter dtf = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        String releaseDateStr = schedule.getReleaseDate() != null ? schedule.getReleaseDate().format(dtf) : "Chưa xác định";
        String detailUrl = scheduleFrontendUrl + "/tap-truyen/" + (schedule.getSlug() != null ? schedule.getSlug() : schedule.getId());

        for (ScheduleEmailSubscriptionJpaEntity sub : uniqueByEmail.values()) {
            String idempotencyKey = "release_" + schedule.getId() + "_" + sub.getEmail();
            if (outboxRepo.findByIdempotencyKey(idempotencyKey).isPresent()) {
                continue;
            }

            String unsubUrl = scheduleFrontendUrl + "/thong-bao-email?token=" + sub.getUnsubscribeToken();
            String seriesTitle = schedule.getSeriesName() != null && !schedule.getSeriesName().isBlank()
                    ? schedule.getSeriesName() : schedule.getTitle();
            String priceStr = (schedule.getEditions() != null && !schedule.getEditions().isEmpty() && schedule.getEditions().get(0).getEstimatedPrice() != null)
                    ? schedule.getEditions().get(0).getEstimatedPrice() + " đ" : null;

            EmailTemplateRenderer.RenderedEmail rendered = templateRenderer.renderReleaseAlert(
                    sub.getEmail(),
                    seriesTitle,
                    schedule.getTitle(),
                    releaseDateStr,
                    schedule.getPublisher() != null ? schedule.getPublisher() : "Boki",
                    priceStr,
                    schedule.getCoverUrl(),
                    detailUrl,
                    unsubUrl
            );

            EmailOutboxJobJpaEntity job = EmailOutboxJobJpaEntity.builder()
                    .recipientEmail(sub.getEmail())
                    .subject(rendered.subject())
                    .bodyHtml(rendered.htmlBody())
                    .bodyText(rendered.textBody())
                    .emailType("RELEASE_ALERT")
                    .idempotencyKey(idempotencyKey)
                    .unsubscribeUrl(unsubUrl)
                    .status("PENDING")
                    .build();

            outboxRepo.save(job);
        }
    }

    private String generateToken() {
        byte[] bytes = new byte[32];
        RANDOM.nextBytes(bytes);
        StringBuilder sb = new StringBuilder();
        for (byte b : bytes) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString();
    }

    private SubscriptionResponse toResponse(ScheduleEmailSubscriptionJpaEntity entity) {
        return SubscriptionResponse.builder()
                .id(entity.getId())
                .email(entity.getEmail())
                .subscriptionType(entity.getSubscriptionType())
                .targetId(entity.getTargetId())
                .targetName(entity.getTargetName())
                .active(entity.getActive())
                .unsubscribeToken(entity.getUnsubscribeToken())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
