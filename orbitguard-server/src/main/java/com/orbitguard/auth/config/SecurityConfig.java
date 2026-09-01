package com.orbitguard.auth.config;

import com.orbitguard.auth.security.JwtAuthenticationEntryPoint;
import com.orbitguard.auth.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;

import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final AuthenticationProvider authenticationProvider;
    private final JwtAuthenticationEntryPoint authenticationEntryPoint;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http)
            throws Exception {

        http

                // Stateless REST API
                .csrf(csrf -> csrf.disable())

                // Unauthorized request handling
                .exceptionHandling(exception -> exception
                        .authenticationEntryPoint(authenticationEntryPoint))

                // JWT-based authentication
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                .authorizeHttpRequests(auth -> auth

                        // ==================================================
                        // PUBLIC ENDPOINTS
                        // ==================================================
                        .requestMatchers(
                                "/api/auth/**",

                                "/swagger-ui/**",
                                "/swagger-ui.html",
                                "/v3/api-docs/**",
                                "/v3/api-docs",

                                "/favicon.ico"
                        ).permitAll()

                        // ==================================================
                        // ADMIN-ONLY ENDPOINTS
                        // ==================================================
                        .requestMatchers("/api/admin/**")
                        .hasRole("ADMIN")

                        // ==================================================
                        // USER + ADMIN ENDPOINTS
                        // ==================================================
                        .requestMatchers(
                                "/api/satellites/**",
                                "/api/debris/**",
                                "/api/risks/**",
                                "/api/alerts/**",
                                "/api/notifications/**",
                                "/api/reports/**",
                                "/api/ai/**",
                                "/api/dashboard/**"
                        ).hasAnyRole("USER", "ADMIN")

                        // ==================================================
                        // ALL OTHER ENDPOINTS
                        // ==================================================
                        .anyRequest().authenticated()
                )

                // Authentication provider
                .authenticationProvider(authenticationProvider)

                // JWT filter
                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }
}