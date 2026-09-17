package com.boki.application.dto.response;

public record AuthResponse(
        String token,
        String accessToken,
        String refreshToken,
        UserResponse user
) {
    public static AuthResponse of(String accessToken, String refreshToken, UserResponse user) {
        return new AuthResponse(accessToken, accessToken, refreshToken, user);
    }

    public static AuthResponse of(String token, UserResponse user) {
        return new AuthResponse(token, token, null, user);
    }
}
