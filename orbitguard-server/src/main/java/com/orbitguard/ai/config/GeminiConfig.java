package com.orbitguard.ai.config;

import com.google.genai.Client;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * ==============================================================
 * Gemini Configuration
 * ==============================================================
 *
 * Central configuration for the Google Gemini AI client.
 *
 * <p>
 * This class is responsible only for creating and configuring
 * the Gemini client. Business logic must not be placed here.
 * </p>
 *
 * <p>
 * The Gemini API key is injected from the application environment
 * and is never hard-coded into the source code.
 * </p>
 *
 * @author OrbitGuard AI Team
 * @version 1.0
 */
@Configuration
public class GeminiConfig {

    /**
     * Gemini API key injected from application configuration.
     *
     * <p>
     * The actual secret value must be supplied through an
     * environment variable.
     * </p>
     */
    @Value("${gemini.api.key}")
    private String apiKey;


    /**
     * Creates the Google Gemini client.
     *
     * @return configured Gemini client
     */
    @Bean
    public Client geminiClient() {
        return Client.builder()
                .apiKey(apiKey)
                .build();
    }
}