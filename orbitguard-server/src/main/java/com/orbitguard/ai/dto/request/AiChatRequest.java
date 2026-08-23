package com.orbitguard.ai.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * ==============================================================
 * AI Chat Request
 * ==============================================================
 *
 * Represents the request payload accepted by the OrbitGuard AI
 * chat API.
 *
 * <p>
 * This DTO is responsible only for validating and transporting
 * user input from the API layer to the service layer.
 * </p>
 *
 * <p>
 * Business logic, prompt construction, and AI-provider
 * communication must not be implemented in this class.
 * </p>
 *
 * @author OrbitGuard AI Team
 * @version 1.0
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiChatRequest {

    /**
     * User's message submitted to the AI assistant.
     */
    @NotBlank(message = "Message must not be blank.")
    @Size(
            min = 2,
            max = 4000,
            message = "Message must contain between 2 and 4000 characters."
    )
    private String message;
}