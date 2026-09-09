package com.orbitguard.ai.provider.gemini;

import com.google.genai.Models;
import com.google.genai.types.GenerateContentResponse;
import com.orbitguard.ai.exception.AiServiceException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Unit tests for {@link GeminiAiProvider}.
 *
 * <p>
 * These tests verify Gemini provider behavior without making
 * a real request to Google's Gemini API.
 * </p>
 */
@ExtendWith(MockitoExtension.class)
class GeminiAiProviderTest {

    @Mock
    private Models models;

    @Mock
    private GenerateContentResponse generateContentResponse;

    private GeminiAiProvider geminiAiProvider;


    @BeforeEach
    void setUp() {

        geminiAiProvider =
                new GeminiAiProvider(models);
    }


    @Test
    void shouldGenerateResponseSuccessfully() {

        // Arrange
        String prompt =
                "Explain what a satellite is.";

        String generatedText =
                "A satellite is an object that orbits another object.";

        when(models.generateContent(
                "gemini-3.6-flash",
                prompt,
                null
        )).thenReturn(generateContentResponse);

        when(generateContentResponse.text())
                .thenReturn(generatedText);


        // Act
        String result =
                geminiAiProvider.generateResponse(prompt);


        // Assert
        assertEquals(
                generatedText,
                result
        );

        verify(models).generateContent(
                "gemini-3.6-flash",
                prompt,
                null
        );
    }


    @Test
    void shouldTrimGeneratedResponse() {

        // Arrange
        String prompt =
                "Explain orbital mechanics.";

        String generatedText =
                "   Orbital mechanics describes the motion of objects in space.   ";

        when(models.generateContent(
                "gemini-3.6-flash",
                prompt,
                null
        )).thenReturn(generateContentResponse);

        when(generateContentResponse.text())
                .thenReturn(generatedText);


        // Act
        String result =
                geminiAiProvider.generateResponse(prompt);


        // Assert
        assertEquals(
                "Orbital mechanics describes the motion of objects in space.",
                result
        );
    }


    @Test
    void shouldRejectNullPrompt() {

        // Act & Assert
        AiServiceException exception =
                assertThrows(
                        AiServiceException.class,
                        () -> geminiAiProvider.generateResponse(null)
                );

        assertEquals(
                "AI prompt must not be null or empty.",
                exception.getMessage()
        );
    }


    @Test
    void shouldRejectBlankPrompt() {

        // Act & Assert
        AiServiceException exception =
                assertThrows(
                        AiServiceException.class,
                        () -> geminiAiProvider.generateResponse("   ")
                );

        assertEquals(
                "AI prompt must not be null or empty.",
                exception.getMessage()
        );
    }


    @Test
    void shouldRejectNullGeminiResponse() {

        // Arrange
        String prompt =
                "What is space debris?";

        when(models.generateContent(
                "gemini-3.6-flash",
                prompt,
                null
        )).thenReturn(null);


        // Act & Assert
        AiServiceException exception =
                assertThrows(
                        AiServiceException.class,
                        () -> geminiAiProvider.generateResponse(prompt)
                );

        assertEquals(
                "Gemini returned an empty response.",
                exception.getMessage()
        );
    }


    @Test
    void shouldRejectBlankGeminiResponse() {

        // Arrange
        String prompt =
                "What is space debris?";

        when(models.generateContent(
                "gemini-3.6-flash",
                prompt,
                null
        )).thenReturn(generateContentResponse);

        when(generateContentResponse.text())
                .thenReturn("   ");


        // Act & Assert
        AiServiceException exception =
                assertThrows(
                        AiServiceException.class,
                        () -> geminiAiProvider.generateResponse(prompt)
                );

        assertEquals(
                "Gemini returned an empty AI response.",
                exception.getMessage()
        );
    }


    @Test
    void shouldWrapGeminiException() {

        // Arrange
        String prompt =
                "Explain collision risk.";

        RuntimeException providerException =
                new RuntimeException("Gemini API failure");

        when(models.generateContent(
                "gemini-3.6-flash",
                prompt,
                null
        )).thenThrow(providerException);


        // Act & Assert
        AiServiceException exception =
                assertThrows(
                        AiServiceException.class,
                        () -> geminiAiProvider.generateResponse(prompt)
                );

        assertEquals(
                "Failed to generate response from Gemini AI.",
                exception.getMessage()
        );

        assertEquals(
                providerException,
                exception.getCause()
        );
    }
}