package com.boki.application.dto.notification;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubscriptionResponse {
    private UUID id;
    private String email;
    private String subscriptionType;
    private String targetId;
    private String targetName;
    private Boolean active;
    private String unsubscribeToken;
    private OffsetDateTime createdAt;
}
