package com.orbitguard.auth.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(
        name = "Authentication Response",
        description = "Response returned after successful authentication"
)
public class AuthResponse {

    @Schema(
            description = "JWT access token",
            example = "eyJhbGciOiJIUzI1NiJ9..."
    )
    private String token;

    @Schema(
            description = "Authentication token type",
            example = "Bearer"
    )
    private String tokenType;
}