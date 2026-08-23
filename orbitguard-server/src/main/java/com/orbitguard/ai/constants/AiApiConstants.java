package com.orbitguard.ai.constants;

/**
 * ==============================================================
 * AI API Constants
 * ==============================================================
 *
 * Centralized API endpoint constants for the OrbitGuard AI
 * module.
 *
 * <p>
 * This class prevents hard-coded API paths from being scattered
 * across controllers and other application components.
 * </p>
 *
 * <p>
 * Keeping API paths centralized improves maintainability,
 * consistency, and makes future API versioning easier.
 * </p>
 *
 * <p>
 * This class contains only constants and must not be instantiated.
 * </p>
 *
 * @author OrbitGuard AI Team
 * @version 1.0
 */
public final class AiApiConstants {

    /**
     * Private constructor prevents object creation.
     *
     * <p>
     * This is a constants-only utility class.
     * </p>
     */
    private AiApiConstants() {
        throw new UnsupportedOperationException(
                "Constants class cannot be instantiated."
        );
    }


    /**
     * ==============================================================
     * Base API Path
     * ==============================================================
     *
     * Base path for all OrbitGuard AI endpoints.
     *
     * Example:
     *
     * /api/ai
     */
    public static final String AI_BASE_PATH = "/api/ai";


    /**
     * ==============================================================
     * Chat Endpoint
     * ==============================================================
     *
     * Endpoint used for sending a user message to OrbitGuard AI.
     *
     * Example:
     *
     * POST /api/ai/chat
     */
    public static final String CHAT_PATH = "/chat";
}