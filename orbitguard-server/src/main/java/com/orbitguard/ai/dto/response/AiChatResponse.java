package com.orbitguard.ai.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * ==============================================================
 * AI Chat Response
 * ==============================================================
 *
 * Represents the response returned by the OrbitGuard AI chat API.
 *
 * <p>
 * This DTO acts as the application's public response contract.
 * The underlying AI provider implementation must never be exposed
 * directly to API consumers.
 * </p>
 *
 * <p>
 * Keeping a dedicated response DTO allows OrbitGuard AI to change
 * its underlying AI provider without changing the external API
 * contract.
 * </p>
 *
 * @author OrbitGuard AI Team
 * @version 1.0
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiChatResponse {

    /**
     * Generated response returned by the AI assistant.
     */
    private String response;
}