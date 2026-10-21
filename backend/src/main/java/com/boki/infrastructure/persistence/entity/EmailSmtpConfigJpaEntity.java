package com.boki.infrastructure.persistence.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "email_smtp_configs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmailSmtpConfigJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", nullable = false)
    private UUID id;

    @Column(name = "host", length = 255, nullable = false)
    @Builder.Default
    private String host = "smtp.gmail.com";

    @Column(name = "port", nullable = false)
    @Builder.Default
    private Integer port = 587;

    @Column(name = "username", length = 255)
    private String username;

    @Column(name = "password", length = 255)
    private String password;

    @Column(name = "auth_enabled", nullable = false)
    @Builder.Default
    private Boolean authEnabled = true;

    @Column(name = "starttls_enabled", nullable = false)
    @Builder.Default
    private Boolean starttlsEnabled = true;

    @Column(name = "from_name", length = 255, nullable = false)
    @Builder.Default
    private String fromName = "Boki - Lịch Phát Hành";

    @Column(name = "from_email", length = 255, nullable = false)
    @Builder.Default
    private String fromEmail = "notifications@bokistore.vn";

    @Column(name = "reply_to", length = 255)
    @Builder.Default
    private String replyTo = "support@bokistore.vn";

    @Column(name = "max_rate_per_minute", nullable = false)
    @Builder.Default
    private Integer maxRatePerMinute = 30;

    @Column(name = "is_enabled", nullable = false)
    @Builder.Default
    private Boolean isEnabled = true;

    @Column(name = "updated_at", nullable = false)
    @Builder.Default
    private OffsetDateTime updatedAt = OffsetDateTime.now();
}
