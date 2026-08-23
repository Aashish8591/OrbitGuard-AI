package com.orbitguard.ai.util;

/**
 * ==============================================================
 * AI Prompt Builder
 * ==============================================================
 *
 * Responsible for constructing controlled prompts used by
 * OrbitGuard AI when communicating with an AI provider.
 *
 * <p>
 * Prompt construction is intentionally separated from the
 * service and provider layers.
 * </p>
 *
 * <p>
 * The builder ensures that OrbitGuard AI sends a consistent
 * system instruction and user context to the AI provider.
 * </p>
 *
 * <p>
 * This class does not communicate with Gemini or any other
 * external AI provider.
 * </p>
 *
 * @author OrbitGuard AI Team
 * @version 1.0
 */
public final class AiPromptBuilder {

    /**
     * Private constructor prevents object creation.
     *
     * <p>
     * This class contains only stateless utility methods.
     * </p>
     */
    private AiPromptBuilder() {
        throw new UnsupportedOperationException(
                "Utility class cannot be instantiated."
        );
    }


    /**
     * ==============================================================
     * Build Chat Prompt
     * ==============================================================
     *
     * Builds the standard OrbitGuard AI prompt for a user query.
     *
     * @param userMessage user-provided question or instruction
     * @return structured prompt for the AI provider
     */
    public static String buildChatPrompt(
            String userMessage
    ) {

        if (userMessage == null || userMessage.isBlank()) {
            throw new IllegalArgumentException(
                    "User message must not be null or empty."
            );
        }

        return """
                You are OrbitGuard AI, an intelligent assistant
                for satellite monitoring, orbital analytics,
                space debris analysis, and collision-risk awareness.

                Your responsibilities are to:

                1. Provide clear and accurate explanations.
                2. Explain technical concepts in understandable language.
                3. Clearly distinguish factual information from assumptions.
                4. Never invent satellite, orbital, debris, or risk data.
                5. If required information is unavailable, clearly state
                   that the information is unavailable.
                6. Do not make safety-critical decisions on behalf of
                   operators or organizations.
                7. Keep responses relevant to the user's question.

                User Query:
                %s
                """.formatted(userMessage.trim());
    }
}