package com.orbitguard.auth.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(
        name = "Login Request",
        description = "Request payload for user authentication"
)
public class LoginRequest {

    @Schema(
            description = "Registered email address",
            example = "example21@gmail.com"
    )
    @NotBlank(message = "Email is required")
    @Email(message = "Please enter a valid email address")
    private String email;

    @Schema(
            description = "User password",
            example = "Password@123"
    )
    @NotBlank(message = "Password is required")
    private String password;
}