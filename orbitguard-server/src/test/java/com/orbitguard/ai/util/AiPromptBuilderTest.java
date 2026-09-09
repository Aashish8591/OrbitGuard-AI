package com.orbitguard.ai.util;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Unit tests for {@link AiPromptBuilder}.
 *
 * <p>
 * This test verifies prompt construction and input validation
 * without starting Spring Boot or communicating with an
 * external AI provider.
 * </p>
 */
class AiPromptBuilderTest {

    @Test
    void shouldBuildChatPromptSuccessfully() {

        // Arrange
        String userMessage = "What is space debris?";

        // Act
        String prompt =
                AiPromptBuilder.buildChatPrompt(userMessage);

        // Assert
        assertTrue(prompt.contains("You are OrbitGuard AI"));
        assertTrue(prompt.contains("satellite monitoring"));
        assertTrue(prompt.contains("space debris analysis"));
        assertTrue(prompt.contains("collision-risk awareness"));
        assertTrue(prompt.contains("User Query:"));
        assertTrue(prompt.contains(userMessage));
    }


    @Test
    void shouldTrimUserMessageBeforeBuildingPrompt() {

        // Arrange
        String userMessage = "   What is orbital debris?   ";

        // Act
        String prompt =
                AiPromptBuilder.buildChatPrompt(userMessage);

        // Assert
        assertTrue(prompt.contains("What is orbital debris?"));
        assertTrue(!prompt.contains("User Query:\n   What is orbital debris?"));
    }


    @Test
    void shouldRejectNullUserMessage() {

        // Act & Assert
        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () -> AiPromptBuilder.buildChatPrompt(null)
                );

        assertEquals(
                "User message must not be null or empty.",
                exception.getMessage()
        );
    }


    @Test
    void shouldRejectBlankUserMessage() {

        // Act & Assert
        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () -> AiPromptBuilder.buildChatPrompt("   ")
                );

        assertEquals(
                "User message must not be null or empty.",
                exception.getMessage()
        );
    }
}