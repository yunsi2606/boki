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
public class EmailJobResponse {
    private UUID id;
    private String recipientEmail;
    private String subject;
    private String emailType;
    private String status;
    private Integer retryCount;
    private Integer maxRetries;
    private String errorMessage;
    private OffsetDateTime scheduledAt;
    private OffsetDateTime sentAt;
    private OffsetDateTime createdAt;
}
