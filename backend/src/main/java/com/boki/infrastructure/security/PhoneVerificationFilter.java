package com.boki.infrastructure.security;

import com.boki.domain.model.user.UserId;
import com.boki.domain.port.out.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Instant;
import java.util.Map;
import java.util.Set;

/**
 * Blocks all business endpoints if the user's phone is NOT verified.
 * Only allows access to verification-related and auth endpoints.
 */
@Component
public class PhoneVerificationFilter extends OncePerRequestFilter {

    private static final Set<String> ALLOWED_PATHS = Set.of(
            "/api/auth/verify-phone",
            "/api/auth/resend-otp",
            "/api/auth/me",
            "/api/auth/logout",
            "/api/auth/login",
            "/api/auth/register"
    );

    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    public PhoneVerificationFilter(UserRepository userRepository, ObjectMapper objectMapper) {
        this.userRepository = userRepository;
        this.objectMapper = objectMapper;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        String path = request.getRequestURI();

        // Skip check for allowed paths
        if (isAllowedPath(path)) {
            filterChain.doFilter(request, response);
            return;
        }

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof AuthenticatedUser principal)) {
            filterChain.doFilter(request, response);
            return;
        }

        // Check phone verification status
        var user = userRepository.findById(UserId.of(principal.userId()));
        if (user.isPresent() && !user.get().isPhoneVerified()) {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            var errorBody = Map.of(
                    "status", 403,
                    "error", "PHONE_NOT_VERIFIED",
                    "message", "Phone number verification is required before accessing this feature",
                    "timestamp", Instant.now().toString(),
                    "path", path
            );
            objectMapper.writeValue(response.getOutputStream(), errorBody);
            return;
        }

        filterChain.doFilter(request, response);
    }

    private boolean isAllowedPath(String path) {
        return ALLOWED_PATHS.stream().anyMatch(path::startsWith);
    }
}
