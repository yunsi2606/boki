package com.boki.application.dto.request;

import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public record BatchActivityRequest(
        String sessionId,

        @NotEmpty(message = "Events list cannot be empty")
        List<RecordActivityRequest> events
) {}
