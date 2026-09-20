package com.boki.application.dto.request;

public record UpdateProfileDetailsRequest(
        String displayName,
        String avatarUrl,
        String phoneNumber
) {}
