package com.orbitguard.auth.service;

import com.orbitguard.auth.dto.request.LoginRequest;
import com.orbitguard.auth.dto.request.RegisterRequest;
import com.orbitguard.auth.dto.response.AuthResponse;
import com.orbitguard.auth.entity.User;
import com.orbitguard.auth.enums.Role;
import com.orbitguard.auth.repository.UserRepository;
import com.orbitguard.auth.security.CustomUserDetails;
import com.orbitguard.auth.security.JwtService;
import com.orbitguard.common.exception.BadRequestException;
import com.orbitguard.common.exception.DuplicateResourceException;
import com.orbitguard.common.exception.UnauthorizedException;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

/**
 * ==============================================================
 * Authentication Service Implementation
 * ==============================================================
 *
 * Provides business logic for user registration and authentication.
 *
 * <p>
 * This service coordinates:
 * </p>
 *
 * <ul>
 *     <li>User registration</li>
 *     <li>Password encryption</li>
 *     <li>Duplicate email validation</li>
 *     <li>User authentication</li>
 *     <li>JWT token generation</li>
 *     <li>Role assignment</li>
 * </ul>
 *
 * <p>
 * Authentication infrastructure is delegated to Spring Security,
 * while JWT creation is delegated to {@link JwtService}.
 * </p>
 *
 * <p>
 * The service does not contain controller or HTTP-specific logic.
 * </p>
 *
 * @author OrbitGuard AI Team
 * @version 1.0
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AuthServiceImpl implements AuthService {

    /**
     * Repository responsible for user persistence.
     */
    private final UserRepository userRepository;

    /**
     * Password encoder used to securely hash user passwords.
     */
    private final PasswordEncoder passwordEncoder;

    /**
     * Service responsible for JWT creation and validation.
     */
    private final JwtService jwtService;

    /**
     * Spring Security authentication manager.
     */
    private final AuthenticationManager authenticationManager;


    /**
     * ==============================================================
     * Register User
     * ==============================================================
     *
     * Registers a new user and generates an access token after
     * successful registration.
     *
     * <p>
     * Newly registered users are assigned the default USER role.
     * Role assignment is controlled by the backend and cannot be
     * supplied by the client.
     * </p>
     *
     * @param request registration request
     * @return authentication response containing JWT token
     */
    @Override
    public AuthResponse register(RegisterRequest request) {

        validateRegisterRequest(request);

        String email = normalizeEmail(request.getEmail());

        /*
         * ----------------------------------------------------------
         * Check duplicate email
         * ----------------------------------------------------------
         */
        if (userRepository.existsByEmail(email)) {

            log.warn(
                    "Registration attempt with already registered email: {}",
                    email
            );

            throw new DuplicateResourceException(
                    "Email is already registered."
            );
        }

        /*
         * ----------------------------------------------------------
         * Create user
         * ----------------------------------------------------------
         *
         * Role is intentionally assigned by the backend.
         */
        User user = User.builder()
                .fullName(request.getFullName().trim())
                .email(email)
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.USER)
                .active(true)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        /*
         * ----------------------------------------------------------
         * Persist user
         * ----------------------------------------------------------
         */
        User savedUser = userRepository.save(user);

        if (savedUser == null) {

            log.error(
                    "User repository returned null after registration. email={}",
                    email
            );

            throw new IllegalStateException(
                    "Unable to register user."
            );
        }

        /*
         * ----------------------------------------------------------
         * Generate JWT
         * ----------------------------------------------------------
         */
        String token = jwtService.generateToken(
                new CustomUserDetails(savedUser)
        );

        log.info(
                "User registered successfully. email={}, role={}",
                email,
                savedUser.getRole()
        );

        return buildAuthResponse(token);
    }


    /**
     * ==============================================================
     * Login User
     * ==============================================================
     *
     * Authenticates an existing user and generates a JWT token.
     *
     * @param request login request
     * @return authentication response containing JWT token
     */
    @Override
    public AuthResponse login(LoginRequest request) {

        validateLoginRequest(request);

        String email = normalizeEmail(request.getEmail());

        try {

            /*
             * ------------------------------------------------------
             * Authenticate credentials
             * ------------------------------------------------------
             */
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            email,
                            request.getPassword()
                    )
            );

        } catch (BadCredentialsException exception) {

            log.warn(
                    "Failed login attempt for email: {}",
                    email
            );

            throw new UnauthorizedException(
                    "Invalid email or password."
            );

        } catch (UsernameNotFoundException exception) {

            /*
             * Keep authentication errors generic so that the API
             * does not reveal whether an email exists.
             */
            log.warn(
                    "Login attempted for unknown email: {}",
                    email
            );

            throw new UnauthorizedException(
                    "Invalid email or password."
            );
        }

        /*
         * ----------------------------------------------------------
         * Retrieve authenticated user
         * ----------------------------------------------------------
         */
        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new UnauthorizedException(
                                "Invalid email or password."
                        )
                );

        /*
         * ----------------------------------------------------------
         * Verify account status
         * ----------------------------------------------------------
         *
         * Spring Security normally handles this through
         * UserDetails.isEnabled(), but this explicit check keeps
         * the service-level business rule clear.
         */
        if (!Boolean.TRUE.equals(user.getActive())) {

            log.warn(
                    "Login attempt for inactive user. email={}",
                    email
            );

            throw new UnauthorizedException(
                    "User account is inactive."
            );
        }

        /*
         * ----------------------------------------------------------
         * Generate JWT
         * ----------------------------------------------------------
         */
        String token = jwtService.generateToken(
                new CustomUserDetails(user)
        );

        log.info(
                "User logged in successfully. email={}, role={}",
                email,
                user.getRole()
        );

        return buildAuthResponse(token);
    }


    /**
     * ==============================================================
     * Validate Registration Request
     * ==============================================================
     *
     * Provides defensive service-level validation in addition to
     * controller-level Jakarta Bean Validation.
     *
     * @param request registration request
     */
    private void validateRegisterRequest(RegisterRequest request) {

        if (request == null) {

            throw new BadRequestException(
                    "Registration request must not be null."
            );
        }

        if (request.getFullName() == null
                || request.getFullName().isBlank()) {

            throw new BadRequestException(
                    "Full name must not be blank."
            );
        }

        if (request.getEmail() == null
                || request.getEmail().isBlank()) {

            throw new BadRequestException(
                    "Email must not be blank."
            );
        }

        if (request.getPassword() == null
                || request.getPassword().isBlank()) {

            throw new BadRequestException(
                    "Password must not be blank."
            );
        }
    }


    /**
     * ==============================================================
     * Validate Login Request
     * ==============================================================
     *
     * Provides defensive service-level validation.
     *
     * @param request login request
     */
    private void validateLoginRequest(LoginRequest request) {

        if (request == null) {

            throw new BadRequestException(
                    "Login request must not be null."
            );
        }

        if (request.getEmail() == null
                || request.getEmail().isBlank()) {

            throw new BadRequestException(
                    "Email must not be blank."
            );
        }

        if (request.getPassword() == null
                || request.getPassword().isBlank()) {

            throw new BadRequestException(
                    "Password must not be blank."
            );
        }
    }


    /**
     * ==============================================================
     * Normalize Email
     * ==============================================================
     *
     * Normalizes email addresses before database operations and
     * authentication.
     *
     * @param email source email
     * @return normalized email
     */
    private String normalizeEmail(String email) {

        return email.trim().toLowerCase();
    }


    /**
     * ==============================================================
     * Build Authentication Response
     * ==============================================================
     *
     * Creates the common authentication response containing the
     * generated JWT token.
     *
     * @param token generated JWT token
     * @return authentication response
     */
    private AuthResponse buildAuthResponse(String token) {

        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .build();
    }
}