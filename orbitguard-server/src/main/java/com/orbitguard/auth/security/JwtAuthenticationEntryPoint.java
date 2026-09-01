package com.orbitguard.auth.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.orbitguard.common.response.ErrorResponse;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.LocalDateTime;

/**
 * ==============================================================
 * JWT Authentication Entry Point
 * ==============================================================
 *
 * Handles authentication failures for protected API endpoints.
 *
 * <p>
 * This component is invoked by Spring Security when a request
 * requires authentication but the user has not been successfully
 * authenticated.
 * </p>
 *
 * <p>
 * Typical scenarios include:
 * </p>
 *
 * <ul>
 *     <li>No JWT token supplied</li>
 *     <li>Invalid JWT token</li>
 *     <li>Expired JWT token</li>
 *     <li>Authentication was not established</li>
 * </ul>
 *
 * <p>
 * The response follows OrbitGuard AI's standard
 * {@link ErrorResponse} structure.
 * </p>
 *
 * @author OrbitGuard AI Team
 * @version 1.0
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthenticationEntryPoint
        implements AuthenticationEntryPoint {

    /**
     * Jackson object mapper managed by Spring.
     *
     * <p>
     * Using the Spring-managed instance avoids creating a new
     * ObjectMapper for every authentication failure.
     * </p>
     */
    private final ObjectMapper objectMapper;


    /**
     * ==============================================================
     * Handle Authentication Failure
     * ==============================================================
     *
     * Sends a standardized HTTP 401 Unauthorized response when
     * authentication is required but has not been established.
     *
     * @param request current HTTP request
     * @param response current HTTP response
     * @param authException authentication failure
     * @throws IOException when the response cannot be written
     */
    @Override
    public void commence(
            HttpServletRequest request,
            HttpServletResponse response,
            AuthenticationException authException)
            throws IOException {

        /*
         * ----------------------------------------------------------
         * Log Authentication Failure
         * ----------------------------------------------------------
         *
         * Do not log the JWT token, password, or other sensitive
         * authentication information.
         */
        log.debug(
                "Authentication required for protected endpoint. method={}, uri={}",
                request.getMethod(),
                request.getRequestURI()
        );


        /*
         * ----------------------------------------------------------
         * Build Standard Error Response
         * ----------------------------------------------------------
         */
        ErrorResponse error = ErrorResponse.builder()
                .success(false)
                .message("Authentication required")
                .status(HttpStatus.UNAUTHORIZED.value())
                .timestamp(LocalDateTime.now())
                .build();


        /*
         * ----------------------------------------------------------
         * Configure HTTP Response
         * ----------------------------------------------------------
         */
        response.setStatus(
                HttpServletResponse.SC_UNAUTHORIZED
        );

        response.setContentType(
                MediaType.APPLICATION_JSON_VALUE
        );

        response.setCharacterEncoding("UTF-8");


        /*
         * ----------------------------------------------------------
         * Write JSON Response
         * ----------------------------------------------------------
         */
        objectMapper.writeValue(
                response.getOutputStream(),
                error
        );
    }
}