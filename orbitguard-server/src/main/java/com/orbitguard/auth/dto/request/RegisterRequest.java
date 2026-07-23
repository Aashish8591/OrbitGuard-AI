package com.orbitguard.auth.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(
        name = "Register Request",
        description = "Request payload for registering a new user"
)
public class RegisterRequest {

    @Schema(
            description = "Full name of the user",
            example = "Aashish Patil"
    )
    @NotBlank(message = "Full name is required")
    @Size(min = 3, max = 50,
            message = "Full name must be between 3 and 50 characters")
    private String fullName;

    @Schema(
            description = "User email address",
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
    @Size(min = 8, max = 20,
            message = "Password must be between 8 and 20 characters")
    private String password;
}