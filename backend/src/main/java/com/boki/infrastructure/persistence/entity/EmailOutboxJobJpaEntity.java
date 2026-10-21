package com.boki.infrastructure.persistence.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "email_outbox_jobs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmailOutboxJobJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", nullable = false)
    private UUID id;

    @Column(name = "recipient_email", length = 255, nullable = false)
    private String recipientEmail;

    @Column(name = "subject", length = 500, nullable = false)
    private String subject;

    @Column(name = "body_html", nullable = false, columnDefinition = "TEXT")
    private String bodyHtml;

    @Column(name = "body_text", nullable = false, columnDefinition = "TEXT")
    private String bodyText;

    @Column(name = "email_type", length = 50, nullable = false)
    private String emailType;

    @Column(name = "status", length = 30, nullable = false)
    @Builder.Default
    private String status = "PENDING"; // PENDING, SENDING, SENT, FAILED, BOUNCED

    @Column(name = "retry_count", nullable = false)
    @Builder.Default
    private Integer retryCount = 0;

    @Column(name = "max_retries", nullable = false)
    @Builder.Default
    private Integer maxRetries = 3;

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    @Column(name = "idempotency_key", length = 255, unique = true)
    private String idempotencyKey;

    @Column(name = "unsubscribe_url", length = 500)
    private String unsubscribeUrl;

    @Column(name = "scheduled_at", nullable = false)
    @Builder.Default
    private OffsetDateTime scheduledAt = OffsetDateTime.now();

    @Column(name = "sent_at")
    private OffsetDateTime sentAt;

    @Column(name = "created_at", nullable = false)
    @Builder.Default
    private OffsetDateTime createdAt = OffsetDateTime.now();
}
