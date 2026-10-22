package com.boki.infrastructure.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private static final Logger log = LoggerFactory.getLogger(SecurityConfig.class);

    private final JwtAuthenticationFilter jwtFilter;
    private final PhoneVerificationFilter phoneFilter;

    @Value("${app.cors.allowed-origins}")
    private String allowedOrigins;

    public SecurityConfig(JwtAuthenticationFilter jwtFilter, PhoneVerificationFilter phoneFilter) {
        this.jwtFilter = jwtFilter;
        this.phoneFilter = phoneFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.POST, "/api/auth/register", "/api/auth/login", "/api/auth/refresh", "/api/auth/oauth", "/api/auth/verify-email", "/api/auth/forgot-password", "/api/auth/reset-password").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/health").permitAll()
                        .requestMatchers("/error").permitAll()
                        .requestMatchers("/api/public/**", "/api/v1/media/**", "/api/webhooks/**", "/api/payments/**", "/api/chat/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/activities", "/api/activities/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/admin/orders/alerts/stream").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/orders", "/api/orders/calculate-pricing").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/books", "/api/books/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/combos", "/api/combos/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/recommendations", "/api/recommendations/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/recommendations/cart-addons", "/api/recommendations/track-interaction").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/books/*/views").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/vouchers").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/flash-sales", "/api/flash-sales/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/blogs", "/api/blogs/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/blogs/*/views").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/categories", "/api/categories/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/release-schedules", "/api/release-schedules/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/manga-tier-lists", "/api/manga-tier-lists/**").permitAll()
                        .requestMatchers("/api/schedule-email/**").permitAll()
                        .requestMatchers("/api/giveaways", "/api/giveaways/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/categories", "/api/categories/**").hasAnyRole("ADMIN", "SELLER")
                        .requestMatchers(HttpMethod.DELETE, "/api/categories", "/api/categories/**").hasAnyRole("ADMIN", "SELLER")
                        .requestMatchers("/api/admin/**").hasAnyRole("ADMIN", "SELLER")
                        .anyRequest().authenticated()
                )
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint((request, response, authException) -> {
                            log.warn("[Security] Unauthorized request to {} {}: {}", request.getMethod(), request.getRequestURI(), authException.getMessage());
                            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                            response.setContentType("application/json;charset=UTF-8");
                            response.getWriter().write("{\"status\":401,\"error\":\"UNAUTHORIZED\",\"message\":\"Phiên đăng nhập đã hết hạn hoặc chưa đăng nhập\"}");
                        })
                        .accessDeniedHandler((request, response, accessDeniedException) -> {
                            log.warn("[Security] Access denied to {} {}: {}", request.getMethod(), request.getRequestURI(), accessDeniedException.getMessage());
                            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                            response.setContentType("application/json;charset=UTF-8");
                            response.getWriter().write("{\"status\":403,\"error\":\"FORBIDDEN\",\"message\":\"Bạn không có quyền thực hiện thao tác này\"}");
                        })
                )
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
                .addFilterAfter(phoneFilter, JwtAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public BCryptPasswordEncoder bCryptPasswordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(Arrays.stream(allowedOrigins.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toList());
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
