package com.orbitguard.auth.security;

import java.io.IOException;

import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * ==============================================================
 * JWT Authentication Filter
 * ==============================================================
 *
 * Intercepts incoming HTTP requests and authenticates users using
 * the JWT supplied in the Authorization header.
 *
 * <p>
 * This filter is executed once per request and integrates JWT
 * authentication with the Spring Security SecurityContext.
 * </p>
 *
 * <p>
 * Authentication flow:
 * </p>
 *
 * <pre>
 * Authorization Header
 *          ↓
 * Extract Bearer Token
 *          ↓
 * Extract User Email
 *          ↓
 * Load UserDetails
 *          ↓
 * Validate JWT
 *          ↓
 * Create Authentication
 *          ↓
 * Store in SecurityContext
 * </pre>
 *
 * <p>
 * This filter does not generate JWT tokens. Token generation is
 * handled by {@link JwtService}.
 * </p>
 *
 * @author OrbitGuard AI Team
 * @version 1.0
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    /**
     * Service responsible for JWT extraction and validation.
     */
    private final JwtService jwtService;

    /**
     * Service responsible for loading authenticated users.
     */
    private final UserDetailsService userDetailsService;


    /**
     * ==============================================================
     * Process Request
     * ==============================================================
     *
     * Processes the incoming request and attempts to authenticate
     * the user using the supplied JWT.
     *
     * @param request current HTTP request
     * @param response current HTTP response
     * @param filterChain servlet filter chain
     * @throws ServletException when servlet processing fails
     * @throws IOException when request processing fails
     */
    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain)
            throws ServletException, IOException {

        /*
         * ----------------------------------------------------------
         * Skip authentication for public authentication endpoints
         * ----------------------------------------------------------
         *
         * Registration and login do not require a JWT.
         */
        if (isPublicAuthenticationRequest(request)) {

            filterChain.doFilter(request, response);
            return;
        }


        /*
         * ----------------------------------------------------------
         * Read Authorization Header
         * ----------------------------------------------------------
         */
        final String authHeader =
                request.getHeader("Authorization");

        /*
         * No Bearer token.
         *
         * The request continues normally. For protected
         * endpoints, Spring Security will later reject the request
         * through the configured AuthenticationEntryPoint.
         */
        if (authHeader == null
                || !authHeader.startsWith("Bearer ")) {

            filterChain.doFilter(request, response);
            return;
        }


        /*
         * ----------------------------------------------------------
         * Extract JWT
         * ----------------------------------------------------------
         */
        final String jwt =
                authHeader.substring(7).trim();

        if (jwt.isBlank()) {

            log.debug(
                    "Bearer token was empty. requestUri={}",
                    request.getRequestURI()
            );

            filterChain.doFilter(request, response);
            return;
        }


        try {

            /*
             * ------------------------------------------------------
             * Extract User Email From JWT
             * ------------------------------------------------------
             */
            final String userEmail =
                    jwtService.extractUsername(jwt);


            /*
             * ------------------------------------------------------
             * Authenticate Only If Context Is Empty
             * ------------------------------------------------------
             */
            if (userEmail != null
                    && !userEmail.isBlank()
                    && SecurityContextHolder
                    .getContext()
                    .getAuthentication() == null) {

                /*
                 * --------------------------------------------------
                 * Load User Details
                 * --------------------------------------------------
                 */
                UserDetails userDetails =
                        userDetailsService
                                .loadUserByUsername(userEmail);


                /*
                 * --------------------------------------------------
                 * Validate JWT
                 * --------------------------------------------------
                 */
                if (jwtService.isTokenValid(jwt, userDetails)) {

                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(
                                    userDetails,
                                    null,
                                    userDetails.getAuthorities()
                            );

                    authentication.setDetails(
                            new WebAuthenticationDetailsSource()
                                    .buildDetails(request)
                    );

                    /*
                     * ----------------------------------------------
                     * Store Authentication In Security Context
                     * ----------------------------------------------
                     */
                    SecurityContextHolder
                            .getContext()
                            .setAuthentication(authentication);

                    log.debug(
                            "JWT authentication successful. email={}",
                            userEmail
                    );
                }
            }

        } catch (JwtException | IllegalArgumentException exception) {

            /*
             * ------------------------------------------------------
             * Invalid JWT
             * ------------------------------------------------------
             *
             * Do not expose JWT parsing details to the client.
             * Simply continue the filter chain without authenticating
             * the request.
             *
             * Protected endpoints will subsequently be rejected
             * by Spring Security.
             */
            log.debug(
                    "Invalid JWT received for requestUri={}",
                    request.getRequestURI()
            );

        } catch (UsernameNotFoundException exception) {

            /*
             * ------------------------------------------------------
             * User No Longer Exists
             * ------------------------------------------------------
             *
             * Token may still be structurally valid, but the
             * associated user cannot be found anymore.
             */
            log.debug(
                    "JWT user could not be found. requestUri={}",
                    request.getRequestURI()
            );
        }


        /*
         * ----------------------------------------------------------
         * Continue Request
         * ----------------------------------------------------------
         */
        filterChain.doFilter(request, response);
    }


    /**
     * ==============================================================
     * Check Public Authentication Request
     * ==============================================================
     *
     * Determines whether the request belongs to the public
     * authentication API.
     *
     * @param request current HTTP request
     * @return true when authentication is not required
     */
    private boolean isPublicAuthenticationRequest(
            HttpServletRequest request) {

        return request.getServletPath()
                .startsWith("/api/auth/");
    }
}