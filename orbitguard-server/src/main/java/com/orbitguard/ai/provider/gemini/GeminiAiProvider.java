package com.orbitguard.ai.provider.gemini;

import com.google.genai.Models;
import com.google.genai.types.GenerateContentConfig;
import com.google.genai.types.GenerateContentResponse;
import com.google.genai.types.ThinkingConfig;
import com.orbitguard.ai.exception.AiServiceException;
import com.orbitguard.ai.provider.AiProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/**
 * ==============================================================
 * Gemini AI Provider
 * ==============================================================
 *
 * Gemini implementation of the {@link AiProvider} contract.
 *
 * <p>
 * This class is responsible for communicating with Google's
 * Gemini AI service.
 * </p>
 *
 * <p>
 * Gemini-specific SDK code is intentionally isolated inside
 * this provider so that the rest of the OrbitGuard AI
 * application remains independent of the underlying AI vendor.
 * </p>
 *
 * <p>
 * The Gemini Models API is configured and exposed by
 * {@code GeminiConfig} and injected through Spring.
 * </p>
 *
 * @author OrbitGuard AI Team
 * @version 1.0
 */
@Component
@RequiredArgsConstructor
public class GeminiAiProvider implements AiProvider {

    /**
     * Gemini Models API configured by GeminiConfig.
     */
    private final Models geminiModels;


    /**
     * Gemini model used for AI response generation.
     *
     * <p>
     * Keep the model name centralized here rather than scattering
     * it throughout the application.
     * </p>
     */
    private static final String MODEL_NAME = "gemini-3.8-flash";


    /**
     * Maximum number of attempts for temporary Gemini failures.
     */
    private static final int MAX_RETRY_ATTEMPTS = 3;


    /**
     * Initial retry delay in milliseconds.
     *
     * <p>
     * The delay increases exponentially after every failed attempt.
     * </p>
     */
    private static final long INITIAL_RETRY_DELAY_MS = 1000L;


    /**
     * Generates an AI response using Google Gemini.
     *
     * @param prompt prompt submitted to Gemini
     * @return generated AI response
     * @throws AiServiceException when Gemini fails to generate
     *                            a valid response
     */
    @Override
    public String generateResponse(String prompt) {

        if (prompt == null || prompt.isBlank()) {
            throw new AiServiceException(
                    "AI prompt must not be null or empty."
            );
        }

        GenerateContentConfig config =
                GenerateContentConfig.builder()
                        .maxOutputTokens(500)
                        .temperature(0.3F)
                        .thinkingConfig(
                                ThinkingConfig.builder()
                                        .thinkingLevel("LOW")
                                        .build()
                        )
                        .build();

        long delayMs = INITIAL_RETRY_DELAY_MS;

        for (int attempt = 1; attempt <= MAX_RETRY_ATTEMPTS; attempt++) {

            try {

                GenerateContentResponse response =
                        geminiModels.generateContent(
                                MODEL_NAME,
                                prompt,
                                config
                        );

                if (response == null) {
                    throw new AiServiceException(
                            "Gemini returned an empty response."
                    );
                }

                String generatedText = response.text();

                if (generatedText == null || generatedText.isBlank()) {
                    throw new AiServiceException(
                            "Gemini returned an empty AI response."
                    );
                }

                return generatedText.trim();

            } catch (AiServiceException exception) {

                throw exception;

            } catch (Exception exception) {

                if (!isRetryable503Exception(exception)
                        || attempt == MAX_RETRY_ATTEMPTS) {

                    throw new AiServiceException(
                            "Failed to generate response from Gemini AI.",
                            exception
                    );
                }

                try {

                    Thread.sleep(delayMs);

                } catch (InterruptedException interruptedException) {

                    Thread.currentThread().interrupt();

                    throw new AiServiceException(
                            "Gemini AI retry was interrupted.",
                            interruptedException
                    );
                }

                delayMs *= 2;
            }
        }

        throw new AiServiceException(
                "Failed to generate response from Gemini AI."
        );
    }


    /**
     * Determines whether the Gemini exception represents a temporary
     * HTTP 503 service-unavailable condition.
     *
     * @param exception exception returned by Gemini SDK
     * @return true when the request should be retried
     */
    private boolean isRetryable503Exception(Exception exception) {

        String message = exception.getMessage();

        return message != null
                && message.contains("503");
    }
}