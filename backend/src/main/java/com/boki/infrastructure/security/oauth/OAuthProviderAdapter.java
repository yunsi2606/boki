package com.boki.infrastructure.security.oauth;

import com.boki.application.dto.response.OAuthUserInfo;
import com.boki.application.port.out.OAuthProvider;
import com.boki.application.exception.AuthenticationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Component
public class OAuthProviderAdapter implements OAuthProvider {

    private static final Logger log = LoggerFactory.getLogger(OAuthProviderAdapter.class);

    @Value("${app.google.client-id:}")
    private String googleClientId;

    @Value("${app.google.client-secret:}")
    private String googleClientSecret;

    @Value("${app.facebook.client-id:}")
    private String facebookClientId;

    @Value("${app.facebook.client-secret:}")
    private String facebookClientSecret;

    private final RestTemplate restTemplate = new RestTemplate();

    @Override
    public OAuthUserInfo verifyToken(String provider, String token, String redirectUri) {
        if ("google".equalsIgnoreCase(provider)) {
            return verifyGoogleToken(token, redirectUri);
        } else if ("facebook".equalsIgnoreCase(provider)) {
            return verifyFacebookToken(token, redirectUri);
        } else {
            throw new IllegalArgumentException("Unsupported OAuth provider: " + provider);
        }
    }

    @SuppressWarnings("unchecked")
    private OAuthUserInfo verifyGoogleToken(String code, String redirectUri) {
        if (googleClientId == null || googleClientId.isBlank() || "mock-google-token".equals(code)) {
            log.warn("Using Google OAuth STUB/MOCK verification");
            return new OAuthUserInfo(
                    "mock.google@boki.com",
                    "Mock Google User",
                    "https://avatar.iran.liara.run/public/1",
                    "google-mock-12345"
            );
        }

        try {
            // Exchange authorization code for tokens
            String tokenUrl = "https://oauth2.googleapis.com/token";
            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            headers.setContentType(org.springframework.http.MediaType.APPLICATION_FORM_URLENCODED);

            org.springframework.util.LinkedMultiValueMap<String, String> map = new org.springframework.util.LinkedMultiValueMap<>();
            map.add("code", code);
            map.add("client_id", googleClientId);
            map.add("client_secret", googleClientSecret);
            // Default to 'postmessage' (standard for popup auth code flow) if no redirect URI is passed
            map.add("redirect_uri", redirectUri != null ? redirectUri : "postmessage");
            map.add("grant_type", "authorization_code");

            org.springframework.http.HttpEntity<org.springframework.util.LinkedMultiValueMap<String, String>> requestEntity = 
                    new org.springframework.http.HttpEntity<>(map, headers);

            Map<String, Object> tokenResponse = restTemplate.postForObject(tokenUrl, requestEntity, Map.class);
            if (tokenResponse == null || !tokenResponse.containsKey("id_token")) {
                throw new AuthenticationException("Failed to exchange Google authorization code");
            }

            String idToken = (String) tokenResponse.get("id_token");

            // Verify Google tokeninfo using the id_token
            String verifyUrl = "https://oauth2.googleapis.com/tokeninfo?id_token=" + idToken;
            Map<String, Object> response = restTemplate.getForObject(verifyUrl, Map.class);
            if (response == null) {
                throw new AuthenticationException("Google token verification returned null response");
            }

            if (response.containsKey("error_description")) {
                throw new AuthenticationException("Google token validation error: " + response.get("error_description"));
            }

            // Verify audience matches our client ID
            String aud = (String) response.get("aud");
            if (aud == null || !aud.equals(googleClientId)) {
                log.error("Google OAuth token audience mismatch. Expected: {}, Got: {}", googleClientId, aud);
                throw new AuthenticationException("Google token audience mismatch");
            }

            String email = (String) response.get("email");
            String name = (String) response.get("name");
            String picture = (String) response.get("picture");
            String sub = (String) response.get("sub");

            if (email == null || sub == null) {
                throw new AuthenticationException("Google token response missing required fields email or sub");
            }

            return new OAuthUserInfo(email, name != null ? name : "Google User", picture, sub);
        } catch (Exception e) {
            log.error("Failed to verify Google token: ", e);
            throw new AuthenticationException("Invalid Google token: " + e.getMessage());
        }
    }

    @SuppressWarnings("unchecked")
    private OAuthUserInfo verifyFacebookToken(String code, String redirectUri) {
        if (facebookClientId == null || facebookClientId.isBlank() || "mock-facebook-token".equals(code)) {
            log.warn("Using Facebook OAuth STUB/MOCK verification");
            return new OAuthUserInfo(
                    "mock.facebook@boki.com",
                    "Mock Facebook User",
                    "https://avatar.iran.liara.run/public/2",
                    "facebook-mock-12345"
            );
        }

        try {
            // Exchange authorization code for access token
            String actualRedirect = redirectUri != null ? redirectUri : "http://localhost:3000/login";
            String tokenUrl = String.format(
                    "https://graph.facebook.com/v19.0/oauth/access_token?client_id=%s&redirect_uri=%s&client_secret=%s&code=%s",
                    facebookClientId, actualRedirect, facebookClientSecret, code
            );

            Map<String, Object> tokenResponse = restTemplate.getForObject(tokenUrl, Map.class);
            if (tokenResponse == null || !tokenResponse.containsKey("access_token")) {
                throw new AuthenticationException("Failed to exchange Facebook authorization code");
            }

            String accessToken = (String) tokenResponse.get("access_token");

            // Query profile info using access token
            String profileUrl = "https://graph.facebook.com/v19.0/me?fields=id,name,email,picture.type(large)&access_token=" + accessToken;
            Map<String, Object> response = restTemplate.getForObject(profileUrl, Map.class);
            if (response == null) {
                throw new AuthenticationException("Facebook profile retrieval returned null response");
            }

            if (response.containsKey("error")) {
                Map<String, Object> error = (Map<String, Object>) response.get("error");
                throw new AuthenticationException("Facebook Graph API error: " + error.get("message"));
            }

            String email = (String) response.get("email");
            String name = (String) response.get("name");
            String id = (String) response.get("id");

            // Extract picture URL from structure picture -> data -> url
            String pictureUrl = null;
            if (response.containsKey("picture")) {
                Map<String, Object> picture = (Map<String, Object>) response.get("picture");
                if (picture.containsKey("data")) {
                    Map<String, Object> data = (Map<String, Object>) picture.get("data");
                    pictureUrl = (String) data.get("url");
                }
            }

            if (email == null || id == null) {
                // If Facebook account doesn't expose email, generate a placeholder email
                email = id + "@facebook.boki.com";
            }

            return new OAuthUserInfo(email, name != null ? name : "Facebook User", pictureUrl, id);
        } catch (Exception e) {
            log.error("Failed to verify Facebook token: ", e);
            throw new AuthenticationException("Invalid Facebook token: " + e.getMessage());
        }
    }
}
