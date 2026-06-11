package com.boki.application.dto.response;

public record OAuthUserInfo(
        String email,
        String displayName,
        String avatarUrl,
        String providerUserId
) {}
