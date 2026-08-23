package com.orbitguard.ai.exception;

/**
 * ==============================================================
 * AI Service Exception
 * ==============================================================
 *
 * Represents failures that occur while communicating with or
 * processing requests through the AI integration layer.
 *
 * <p>
 * This exception provides a dedicated application-level exception
 * for AI-related failures instead of exposing vendor-specific
 * exceptions to higher layers of the application.
 * </p>
 *
 * <p>
 * The underlying provider exception can be preserved as the cause
 * so that the original technical failure remains available for
 * logging and debugging.
 * </p>
 *
 * @author OrbitGuard AI Team
 * @version 1.0
 */
public class AiServiceException extends RuntimeException {

    /**
     * Creates an AI service exception with the supplied message.
     *
     * @param message description of the AI service failure
     */
    public AiServiceException(String message) {
        super(message);
    }


    /**
     * Creates an AI service exception with the supplied message
     * and underlying cause.
     *
     * @param message description of the AI service failure
     * @param cause underlying exception that caused the failure
     */
    public AiServiceException(
            String message,
            Throwable cause
    ) {
        super(message, cause);
    }
}