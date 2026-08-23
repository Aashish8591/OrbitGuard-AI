package com.orbitguard.ai.service;

import com.orbitguard.ai.dto.request.AiChatRequest;
import com.orbitguard.ai.dto.response.AiChatResponse;
import com.orbitguard.common.response.ApiResponse;

/**
 * ==============================================================
 * AI Service
 * ==============================================================
 *
 * Defines the business-layer contract for OrbitGuard AI
 * artificial-intelligence operations.
 *
 * <p>
 * The service layer acts as the orchestration layer between
 * the API/controller layer and the configured AI provider.
 * </p>
 *
 * <p>
 * The service remains independent of any specific AI vendor.
 * It communicates with the {@code AiProvider} abstraction rather
 * than directly depending on Gemini or another AI provider.
 * </p>
 *
 * <p>
 * Responsibilities such as request validation, prompt
 * construction, provider invocation, and response mapping
 * are coordinated by the service implementation.
 * </p>
 *
 * <p>
 * The service returns the common {@link ApiResponse} wrapper
 * used throughout the OrbitGuard AI backend to maintain a
 * consistent API response contract.
 * </p>
 *
 * @author OrbitGuard AI Team
 * @version 1.0
 */
public interface AiService {

    /**
     * ==============================================================
     * Chat With AI
     * ==============================================================
     *
     * Processes a user message and generates an AI-powered response.
     *
     * <p>
     * The implementation is responsible for:
     * </p>
     *
     * <ul>
     *     <li>Validating the incoming request when necessary.</li>
     *     <li>Building the controlled OrbitGuard AI prompt.</li>
     *     <li>Delegating the prompt to the configured AI provider.</li>
     *     <li>Mapping the provider response into the application DTO.</li>
     * </ul>
     *
     * <p>
     * The service must not contain provider-specific SDK code.
     * </p>
     *
     * @param request AI chat request containing the user's message
     * @return standard API response containing the generated AI answer
     */
    ApiResponse<AiChatResponse> chat(
            AiChatRequest request
    );
}