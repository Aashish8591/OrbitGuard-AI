package com.orbitguard.auth.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * ==============================================================
 * Login Request
 * ==============================================================
 *
 * Represents the request payload used for authenticating an
 * existing OrbitGuard AI user.
 *
 * <p>
 * This DTO is responsible only for transporting and validating
 * authentication input received from the client.
 * </p>
 *
 * <p>
 * Authentication logic, password verification, and JWT generation
 * are handled by the service and security layers.
 * </p>
 *
 * @author OrbitGuard AI Team
 * @version 1.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(
        name = "Login Request",
        description = "Request payload for user authentication"
)
public class LoginRequest {

    /**
     * Registered email address of the user.
     */
    @Schema(
            description = "Registered email address",
            example = "example21@gmail.com"
    )
    @NotBlank(message = "Email is required")
    @Email(message = "Please enter a valid email address")
    private String email;

    /**
     * Password supplied by the user for authentication.
     *
     * <p>
     * The password must never be logged or exposed in API
     * responses.
     * </p>
     */
    @Schema(
            description = "User password",
            example = "Password@123"
    )
    @NotBlank(message = "Password is required")
    private String password;
}