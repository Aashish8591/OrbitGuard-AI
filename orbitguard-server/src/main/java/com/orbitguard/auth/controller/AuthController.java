package com.orbitguard.auth.controller;

import com.orbitguard.auth.dto.request.LoginRequest;
import com.orbitguard.auth.dto.request.RegisterRequest;
import com.orbitguard.auth.dto.response.AuthResponse;
import com.orbitguard.auth.service.AuthService;
import com.orbitguard.common.response.ApiResponse;
import com.orbitguard.common.util.ResponseBuilder;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(
        name = "Authentication API",
        description = "User registration and authentication operations"
)
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /**
     * Register New User
     */
    @Operation(summary = "Register a new user")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "201",
                    description = "User registered successfully"
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "400",
                    description = "Invalid registration request"
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "409",
                    description = "Email already registered"
            )
    })
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(
            @Valid @RequestBody RegisterRequest request) {

        AuthResponse authResponse = authService.register(request);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ResponseBuilder.success(
                        "User registered successfully.",
                        authResponse
                ));
    }

    /**
     * User Login
     */
    @Operation(summary = "Authenticate user and generate JWT token")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Login successful"
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "401",
                    description = "Invalid email or password"
            )
    })
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest request) {

        AuthResponse authResponse = authService.login(request);

        return ResponseEntity.ok(
                ResponseBuilder.success(
                        "Login successful.",
                        authResponse
                )
        );
    }
}