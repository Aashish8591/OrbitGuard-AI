
import api from "./api";

/**
 * ================================================================
 * OrbitGuard AI - AI Service
 * ================================================================
 *
 * Responsible for communicating with the OrbitGuard AI REST API.
 *
 * Backend contract:
 *   POST /api/ai/chat
 *
 * Request:
 *   {
 *     "message": "Explain orbital debris."
 *   }
 *
 * Response data contract:
 *   ApiResponse<AiChatResponse>
 *
 * AiChatResponse:
 *   {
 *     "response": "Generated AI answer..."
 *   }
 *
 * This service uses the existing Axios instance so the configured
 * backend base URL, authentication interceptors, and common headers
 * remain centralized in api.js.
 *
 * It does not call Gemini directly. Gemini communication belongs
 * exclusively to the Spring Boot backend.
 */

// Keep the endpoint relative to the configured Axios base URL.
const AI_CHAT_ENDPOINT = "/api/ai/chat";

// The backend validates messages between 2 and 4000 characters.
const MIN_MESSAGE_LENGTH = 2;
const MAX_MESSAGE_LENGTH = 4000;

/**
 * Normalizes a potential API error into a user-readable message.
 *
 * Does not expose stack traces or internal provider exceptions.
 *
 * @param {unknown} error Axios or application error
 * @returns {string} Safe error message for the UI
 */
const getErrorMessage = (error) => {
  const status = error?.response?.status;
  const backendData = error?.response?.data;

  if (!error?.response) {
    return (
      "Unable to reach the OrbitGuard AI backend. " +
      "Check your connection and backend server."
    );
  }

  if (status === 400) {
    return (
      backendData?.message ||
      backendData?.error ||
      "The message is invalid. Enter between 2 and 4000 characters."
    );
  }

  if (status === 401) {
    return "Your session has expired. Please sign in again.";
  }

  if (status === 403) {
    return "You do not have permission to access OrbitGuard AI.";
  }

  if (status === 404) {
    return (
      "The AI chat endpoint was not found. " +
      "Check the backend base URL and API mapping."
    );
  }

  if (status === 429) {
    return "Too many requests. Please wait before trying again.";
  }

  if (status >= 500) {
    return (
      backendData?.message ||
      "The AI backend encountered a server error. Please try again."
    );
  }

  return (
    backendData?.message ||
    backendData?.error ||
    error?.message ||
    "An unexpected error occurred while contacting OrbitGuard AI."
  );
};

/**
 * Extracts the AI response from the common backend response wrapper.
 *
 * The precise ApiResponse property names were not included in the
 * supplied backend code, so this method supports common wrapper
 * conventions while requiring AiChatResponse.response to exist.
 *
 * @param {unknown} payload Backend response payload
 * @returns {string} Generated AI response
 * @throws {Error} If the expected response is missing
 */
const extractAiResponse = (payload) => {
  if (!payload || typeof payload !== "object") {
    throw new Error(
      "The AI backend returned an invalid response payload.",
    );
  }

  // Supports common ApiResponse wrapper shapes:
  // { data: { response: "..." } }
  // { data: { data: { response: "..." } } }
  // { response: { response: "..." } }
  // { response: "..." }
  const candidates = [
    payload.data?.response,
    payload.data?.data?.response,
    payload.response?.response,
    payload.response,
  ];

  const generatedResponse = candidates.find(
    (candidate) =>
      typeof candidate === "string" && candidate.trim().length > 0,
  );

  if (typeof generatedResponse !== "string") {
    throw new Error(
      "The AI backend responded, but its generated answer was missing. " +
      "Verify the ApiResponse structure returned by the backend.",
    );
  }

  return generatedResponse.trim();
};

/**
 * Sends a message to OrbitGuard AI.
 *
 * @param {string} message User's message
 * @returns {Promise<{ response: string }>} Generated AI answer
 * @throws {Error} If validation, network, or API processing fails
 */
const sendMessage = async (message) => {
  if (typeof message !== "string") {
    throw new TypeError("AI message must be a string.");
  }

  const normalizedMessage = message.trim();

  if (normalizedMessage.length < MIN_MESSAGE_LENGTH) {
    throw new Error("Please enter at least 2 characters.");
  }

  if (normalizedMessage.length > MAX_MESSAGE_LENGTH) {
    throw new Error(
      "Your message cannot exceed 4000 characters.",
    );
  }

  try {
    const result = await api.post(AI_CHAT_ENDPOINT, {
      message: normalizedMessage,
    });

    const generatedResponse = extractAiResponse(result.data);

    return {
      response: generatedResponse,
    };
  } catch (error) {
    // Preserve already-normalized validation or response errors.
    if (
      error instanceof TypeError ||
      (
        error instanceof Error &&
        !error?.response &&
        (
          error.message.startsWith("Please enter") ||
          error.message.startsWith("Your message") ||
          error.message.startsWith("The AI backend")
        )
      )
    ) {
      throw error;
    }

    const messageText = getErrorMessage(error);

    const normalizedError = new Error(messageText);
    normalizedError.cause = error;

    throw normalizedError;
  }
};

/**
 * Public AI service API.
 *
 * Keep the exported interface small and predictable so components
 * can call aiService.sendMessage(message).
 */
const aiService = {
  sendMessage,
};

export default aiService;
