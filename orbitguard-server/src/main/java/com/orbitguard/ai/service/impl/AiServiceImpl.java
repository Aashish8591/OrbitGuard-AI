package com.orbitguard.ai.service.impl;

import com.orbitguard.ai.dto.request.AiChatRequest;
import com.orbitguard.ai.dto.response.AiChatResponse;
import com.orbitguard.ai.exception.AiServiceException;
import com.orbitguard.ai.provider.AiProvider;
import com.orbitguard.ai.service.AiService;
import com.orbitguard.ai.util.AiPromptBuilder;
import com.orbitguard.common.response.ApiResponse;
import com.orbitguard.common.util.ResponseBuilder;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/**
 * ==============================================================
 * AI Service Implementation
 * ==============================================================
 *
 * Default implementation of the {@link AiService} contract.
 *
 * <p>
 * This class represents the application/service orchestration
 * layer of the OrbitGuard AI module.
 * </p>
 *
 * <p>
 * It coordinates request validation, prompt construction,
 * AI-provider communication, response validation, and
 * application response transformation.
 * </p>
 *
 * <p>
 * This class depends on the {@link AiProvider} abstraction
 * rather than directly depending on Gemini-specific classes.
 * This keeps the service layer independent of the underlying
 * AI vendor.
 * </p>
 *
 * <p>
 * The service does not contain HTTP logic or provider-specific
 * SDK implementation details.
 * </p>
 *
 * @author OrbitGuard AI Team
 * @version 1.0
 */
@Service
@RequiredArgsConstructor
public class AiServiceImpl implements AiService {

    /**
     * AI provider abstraction responsible for communicating
     * with the configured AI provider.
     */
    private final AiProvider aiProvider;


    /**
     * ==============================================================
     * Chat With AI
     * ==============================================================
     *
     * Processes a user message and generates an OrbitGuard AI
     * response.
     *
     * <p>
     * Processing flow:
     * </p>
     *
     * <ol>
     *     <li>Validate the incoming request.</li>
     *     <li>Build the controlled OrbitGuard AI prompt.</li>
     *     <li>Delegate prompt processing to the AI provider.</li>
     *     <li>Validate the generated provider response.</li>
     *     <li>Map the generated response into {@link AiChatResponse}.</li>
     *     <li>Wrap the result using the common {@link ResponseBuilder}.</li>
     * </ol>
     *
     * @param request AI chat request containing the user's message
     * @return standardized API response containing the AI response
     * @throws AiServiceException when AI processing fails
     */
    @Override
    public ApiResponse<AiChatResponse> chat(
            AiChatRequest request
    ) {

        validateRequest(request);

        try {

            String prompt =
                    AiPromptBuilder.buildChatPrompt(
                            request.getMessage()
                    );

            String generatedResponse =
                    aiProvider.generateResponse(prompt);

            validateGeneratedResponse(generatedResponse);

            AiChatResponse chatResponse =
                    AiChatResponse.builder()
                            .response(generatedResponse.trim())
                            .build();

            return ResponseBuilder.success(
                    "AI response generated successfully.",
                    chatResponse
            );

        } catch (AiServiceException exception) {

            throw exception;

        } catch (Exception exception) {

            throw new AiServiceException(
                    "Failed to process AI chat request.",
                    exception
            );
        }
    }


    /**
     * ==============================================================
     * Validate Request
     * ==============================================================
     *
     * Performs service-level validation before prompt construction
     * and provider communication.
     *
     * <p>
     * Controller-level Jakarta Bean Validation protects the HTTP
     * boundary. This validation additionally protects the service
     * when it is invoked independently.
     * </p>
     *
     * @param request AI chat request
     * @throws AiServiceException when the request is invalid
     */
    private void validateRequest(
            AiChatRequest request
    ) {

        if (request == null) {

            throw new AiServiceException(
                    "AI chat request must not be null."
            );
        }

        if (request.getMessage() == null
                || request.getMessage().isBlank()) {

            throw new AiServiceException(
                    "AI chat message must not be null or empty."
            );
        }
    }


    /**
     * ==============================================================
     * Validate Generated Response
     * ==============================================================
     *
     * Ensures that the configured AI provider returned a usable
     * response before it is exposed through the application API.
     *
     * @param generatedResponse response returned by the AI provider
     * @throws AiServiceException when the provider response is empty
     */
    private void validateGeneratedResponse(
            String generatedResponse
    ) {

        if (generatedResponse == null
                || generatedResponse.isBlank()) {

            throw new AiServiceException(
                    "AI provider returned an empty response."
            );
        }
    }
}