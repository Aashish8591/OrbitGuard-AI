package com.orbitguard.ai.provider.gemini;

import com.google.genai.Client;
import com.google.genai.types.GenerateContentResponse;
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
 * The Gemini client itself is created and configured by
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
     * Gemini SDK client configured by GeminiConfig.
     */
    private final Client geminiClient;


    /**
     * Gemini model used for AI response generation.
     *
     * <p>
     * Keep the model name centralized here rather than scattering
     * it throughout the application.
     * </p>
     */
    private static final String MODEL_NAME = "gemini-3.6-flash";


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

        try {

            GenerateContentResponse response =
                    geminiClient.models.generateContent(
                            MODEL_NAME,
                            prompt,
                            null
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

            throw new AiServiceException(
                    "Failed to generate response from Gemini AI.",
                    exception
            );
        }
    }
}