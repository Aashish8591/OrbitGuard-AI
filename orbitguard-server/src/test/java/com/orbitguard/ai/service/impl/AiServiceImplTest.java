package com.orbitguard.ai.service.impl;

import com.orbitguard.ai.dto.request.AiChatRequest;
import com.orbitguard.ai.dto.response.AiChatResponse;
import com.orbitguard.ai.exception.AiServiceException;
import com.orbitguard.ai.provider.AiProvider;
import com.orbitguard.common.response.ApiResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Unit tests for {@link AiServiceImpl}.
 *
 * <p>
 * These tests verify AI service orchestration without starting
 * Spring Boot or communicating with the real Gemini API.
 * </p>
 */
@ExtendWith(MockitoExtension.class)
class AiServiceImplTest {

    @Mock
    private AiProvider aiProvider;

    private AiServiceImpl aiService;


    @BeforeEach
    void setUp() {
        aiService = new AiServiceImpl(aiProvider);
    }


    @Test
    void shouldGenerateAiResponseSuccessfully() {

        // Arrange
        AiChatRequest request =
                AiChatRequest.builder()
                        .message("What is space debris?")
                        .build();

        String generatedResponse =
                "Space debris refers to inactive human-made objects "
                        + "orbiting Earth.";

        when(aiProvider.generateResponse(anyString()))
                .thenReturn(generatedResponse);


        // Act
        ApiResponse<AiChatResponse> response =
                aiService.chat(request);


        // Assert
        assertNotNull(response);
        assertEquals(
                "AI response generated successfully.",
                response.getMessage()
        );

        assertNotNull(response.getData());

        assertEquals(
                generatedResponse,
                response.getData().getResponse()
        );

        verify(aiProvider).generateResponse(anyString());
    }


    @Test
    void shouldTrimGeneratedResponseBeforeReturning() {

        // Arrange
        AiChatRequest request =
                AiChatRequest.builder()
                        .message("Explain satellites.")
                        .build();

        String generatedResponse =
                "   Satellites are objects placed in orbit around Earth.   ";

        when(aiProvider.generateResponse(anyString()))
                .thenReturn(generatedResponse);


        // Act
        ApiResponse<AiChatResponse> response =
                aiService.chat(request);


        // Assert
        assertNotNull(response);
        assertNotNull(response.getData());

        assertEquals(
                "Satellites are objects placed in orbit around Earth.",
                response.getData().getResponse()
        );

        verify(aiProvider).generateResponse(anyString());
    }


    @Test
    void shouldRejectNullRequest() {

        // Act & Assert
        AiServiceException exception =
                assertThrows(
                        AiServiceException.class,
                        () -> aiService.chat(null)
                );

        assertEquals(
                "AI chat request must not be null.",
                exception.getMessage()
        );

        verify(aiProvider, never())
                .generateResponse(anyString());
    }


    @Test
    void shouldRejectBlankMessage() {

        // Arrange
        AiChatRequest request =
                AiChatRequest.builder()
                        .message("   ")
                        .build();


        // Act & Assert
        AiServiceException exception =
                assertThrows(
                        AiServiceException.class,
                        () -> aiService.chat(request)
                );

        assertEquals(
                "AI chat message must not be null or empty.",
                exception.getMessage()
        );

        verify(aiProvider, never())
                .generateResponse(anyString());
    }


    @Test
    void shouldRejectNullProviderResponse() {

        // Arrange
        AiChatRequest request =
                AiChatRequest.builder()
                        .message("What is a satellite?")
                        .build();

        when(aiProvider.generateResponse(anyString()))
                .thenReturn(null);


        // Act & Assert
        AiServiceException exception =
                assertThrows(
                        AiServiceException.class,
                        () -> aiService.chat(request)
                );

        assertEquals(
                "AI provider returned an empty response.",
                exception.getMessage()
        );

        verify(aiProvider).generateResponse(anyString());
    }


    @Test
    void shouldRejectBlankProviderResponse() {

        // Arrange
        AiChatRequest request =
                AiChatRequest.builder()
                        .message("What is a satellite?")
                        .build();

        when(aiProvider.generateResponse(anyString()))
                .thenReturn("   ");


        // Act & Assert
        AiServiceException exception =
                assertThrows(
                        AiServiceException.class,
                        () -> aiService.chat(request)
                );

        assertEquals(
                "AI provider returned an empty response.",
                exception.getMessage()
        );

        verify(aiProvider).generateResponse(anyString());
    }


    @Test
    void shouldPropagateAiServiceExceptionFromProvider() {

        // Arrange
        AiChatRequest request =
                AiChatRequest.builder()
                        .message("Explain orbital mechanics.")
                        .build();

        AiServiceException providerException =
                new AiServiceException(
                        "Failed to generate response from Gemini AI."
                );

        when(aiProvider.generateResponse(anyString()))
                .thenThrow(providerException);


        // Act & Assert
        AiServiceException exception =
                assertThrows(
                        AiServiceException.class,
                        () -> aiService.chat(request)
                );

        assertEquals(
                "Failed to generate response from Gemini AI.",
                exception.getMessage()
        );

        verify(aiProvider).generateResponse(anyString());
    }
}