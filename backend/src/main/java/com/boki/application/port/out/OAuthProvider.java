package com.boki.application.port.out;

import com.boki.application.dto.response.OAuthUserInfo;

/**
 * Outbound port for OAuth token validation.
 * Implemented by adapters in the infrastructure layer.
 */
public interface OAuthProvider {

    /**
     * Verify an OAuth token with the social provider (e.g. google, facebook).
     *
     * @param provider the social provider name (google, facebook)
     * @param token    the access or ID token from the provider
     * @return the profile info if valid
     */
    OAuthUserInfo verifyToken(String provider, String token);
}
