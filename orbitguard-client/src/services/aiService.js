import api, {
  getApiErrorMessage,
} from "./api";

/**
 * ================================================================
 * OrbitGuard AI - AI Service
 * ================================================================
 *
 * Backend endpoint:
 *
 * POST /api/ai/chat
 *
 * Request:
 *
 * {
 *   "message": "What is a collision risk?"
 * }
 *
 * Backend transport response:
 *
 * {
 *   "success": true,
 *   "message": "AI response generated successfully.",
 *   "data": {
 *     "response": "..."
 *   }
 * }
 *
 * This service:
 * - Validates the user message
 * - Calls the backend AI endpoint
 * - Validates the ApiResponse envelope
 * - Extracts AiChatResponse
 * - Returns the generated response text
 *
 * This service does NOT:
 * - Generate AI responses
 * - Build Gemini prompts
 * - Call Gemini directly
 * - Store conversation history
 * - Contain React/UI logic
 * ================================================================
 */


/**
 * ----------------------------------------------------------------
 * AI CHAT CONTRACT
 * ----------------------------------------------------------------
 */

export const AI_CHAT_PATH =
  "/api/ai/chat";

export const MIN_AI_MESSAGE_LENGTH = 2;

export const MAX_AI_MESSAGE_LENGTH = 4000;


/**
 * ----------------------------------------------------------------
 * Validate AI message
 * ----------------------------------------------------------------
 */

export const isValidAiMessage = (
  message,
) => {
  if (
    typeof message !== "string"
  ) {
    return false;
  }

  const trimmedMessage =
    message.trim();

  return (
    trimmedMessage.length >=
      MIN_AI_MESSAGE_LENGTH &&
    trimmedMessage.length <=
      MAX_AI_MESSAGE_LENGTH
  );
};


/**
 * ================================================================
 * Send AI Message
 * ================================================================
 *
 * @param {string} message
 * @returns {Promise<string>}
 * ================================================================
 */

export async function sendAiMessage(
  message,
) {
  /**
   * --------------------------------------------------------------
   * Validate message
   * --------------------------------------------------------------
   */

  if (!isValidAiMessage(message)) {
    throw new Error(
      `AI message must contain between ${MIN_AI_MESSAGE_LENGTH} and ${MAX_AI_MESSAGE_LENGTH} characters.`,
    );
  }


  const normalizedMessage =
    message.trim();


  try {
    /**
     * ------------------------------------------------------------
     * Call backend
     * ------------------------------------------------------------
     */

    const response =
      await api.post(
        AI_CHAT_PATH,
        {
          message:
            normalizedMessage,
        },
      );


    /**
     * ------------------------------------------------------------
     * Validate ApiResponse envelope
     * ------------------------------------------------------------
     */

    const apiResponse =
      response?.data;


    if (!apiResponse) {
      throw new Error(
        "AI API returned an empty response.",
      );
    }


    /**
     * ------------------------------------------------------------
     * Backend business failure
     * ------------------------------------------------------------
     */

    if (
      apiResponse.success === false
    ) {
      throw new Error(
        apiResponse.message ||
          "AI API request was unsuccessful.",
      );
    }


    /**
     * ------------------------------------------------------------
     * Extract AiChatResponse
     * ------------------------------------------------------------
     */

    const aiChatResponse =
      apiResponse.data;


    if (
      !aiChatResponse ||
      typeof aiChatResponse !== "object"
    ) {
      throw new Error(
        "AI API response does not contain AI chat data.",
      );
    }


    /**
     * ------------------------------------------------------------
     * Extract generated response
     * ------------------------------------------------------------
     */

    const generatedResponse =
      aiChatResponse.response;


    if (
      typeof generatedResponse !==
        "string" ||
      !generatedResponse.trim()
    ) {
      throw new Error(
        "AI API returned an empty response.",
      );
    }


    if (import.meta.env.DEV) {
      console.log(
        "[OrbitGuard AI] AI response received.",
      );
    }


    return generatedResponse.trim();

  } catch (error) {
    /**
     * ------------------------------------------------------------
     * Preserve application errors.
     * ------------------------------------------------------------
     */

    if (
      error instanceof Error &&
      !error.response
    ) {
      throw error;
    }


    /**
     * ------------------------------------------------------------
     * Normalize Axios/backend errors.
     * ------------------------------------------------------------
     */

    throw new Error(
      getApiErrorMessage(
        error,
        "Unable to communicate with OrbitGuard AI.",
      ),
    );
  }
}