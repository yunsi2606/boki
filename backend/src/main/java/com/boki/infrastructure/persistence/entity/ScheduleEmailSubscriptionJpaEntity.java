package com.boki.infrastructure.persistence.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "schedule_email_subscriptions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ScheduleEmailSubscriptionJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", nullable = false)
    private UUID id;

    @Column(name = "email", length = 255, nullable = false)
    private String email;

    @Column(name = "user_id")
    private UUID userId;

    @Column(name = "subscription_type", length = 40, nullable = false)
    private String subscriptionType;

    @Column(name = "target_id", length = 255)
    private String targetId;

    @Column(name = "target_name", length = 255)
    private String targetName;

    @Column(name = "unsubscribe_token", length = 64, nullable = false, unique = true)
    private String unsubscribeToken;

    @Column(name = "active", nullable = false)
    @Builder.Default
    private Boolean active = true;

    @Column(name = "created_at", nullable = false)
    @Builder.Default
    private OffsetDateTime createdAt = OffsetDateTime.now();

    @Column(name = "updated_at", nullable = false)
    @Builder.Default
    private OffsetDateTime updatedAt = OffsetDateTime.now();
}
