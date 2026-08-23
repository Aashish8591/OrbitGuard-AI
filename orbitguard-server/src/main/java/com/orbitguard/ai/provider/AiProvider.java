package com.orbitguard.ai.provider;

/**
 * ==============================================================
 * AI Provider
 * ==============================================================
 *
 * Defines the contract for AI providers used by OrbitGuard AI.
 *
 * <p>
 * The application service layer communicates with this abstraction
 * instead of directly depending on a specific AI vendor.
 * </p>
 *
 * <p>
 * This design allows OrbitGuard AI to replace or introduce
 * additional AI providers in the future without changing the
 * service-layer business logic.
 * </p>
 *
 * <p>
 * Example providers:
 * </p>
 *
 * <ul>
 *     <li>Google Gemini</li>
 *     <li>OpenAI</li>
 *     <li>Anthropic</li>
 *     <li>Local AI model</li>
 * </ul>
 *
 * @author OrbitGuard AI Team
 * @version 1.0
 */
public interface AiProvider {

    /**
     * ==============================================================
     * Generate AI Response
     * ==============================================================
     *
     * Sends a prompt to the configured AI provider and returns
     * the generated response.
     *
     * @param prompt prompt submitted to the AI provider
     * @return generated AI response
     */
    String generateResponse(String prompt);
}