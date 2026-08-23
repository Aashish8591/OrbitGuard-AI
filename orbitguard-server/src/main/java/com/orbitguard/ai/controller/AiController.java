package com.orbitguard.ai.controller;

import com.orbitguard.ai.constants.AiApiConstants;
import com.orbitguard.ai.dto.request.AiChatRequest;
import com.orbitguard.ai.dto.response.AiChatResponse;
import com.orbitguard.ai.service.AiService;
import com.orbitguard.common.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * ==============================================================
 * AI Controller
 * ==============================================================
 *
 * REST controller responsible for exposing the OrbitGuard AI
 * assistant APIs.
 *
 * <p>
 * This controller represents the HTTP boundary of the AI module.
 * It is responsible only for:
 * </p>
 *
 * <ul>
 *     <li>Receiving HTTP requests</li>
 *     <li>Validating request payloads</li>
 *     <li>Delegating operations to the service layer</li>
 *     <li>Returning standardized API responses</li>
 * </ul>
 *
 * <p>
 * AI prompt construction, provider communication, Gemini SDK
 * interaction, and business logic are intentionally kept outside
 * this controller.
 * </p>
 *
 * @author OrbitGuard AI Team
 * @version 1.0
 */
@RestController
@RequestMapping(AiApiConstants.AI_BASE_PATH)
@RequiredArgsConstructor
@Tag(
        name = "AI Assistant",
        description = "APIs for interacting with the OrbitGuard AI assistant."
)
public class AiController {

    /**
     * Service responsible for AI business operations.
     */
    private final AiService aiService;


    /**
     * ==============================================================
     * Chat With OrbitGuard AI
     * ==============================================================
     *
     * Sends a user message to the OrbitGuard AI assistant and
     * returns the generated AI response.
     *
     * <p>
     * Endpoint:
     * </p>
     *
     * <pre>
     * POST /api/ai/chat
     * </pre>
     *
     * <p>
     * The request is validated using Jakarta Bean Validation
     * before being passed to the service layer.
     * </p>
     *
     * @param request AI chat request containing the user's message
     * @return standardized API response containing the AI response
     */
    @Operation(
            summary = "Chat with OrbitGuard AI",
            description = """
                    Sends a user message to the OrbitGuard AI assistant
                    and returns an AI-generated response.
                    """
    )
    @PostMapping(AiApiConstants.CHAT_PATH)
    public ResponseEntity<ApiResponse<AiChatResponse>> chat(
            @Valid @RequestBody AiChatRequest request
    ) {

        ApiResponse<AiChatResponse> response =
                aiService.chat(request);

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(response);
    }
}