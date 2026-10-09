import api from "./api";

/**
 * ================================================================
 * OrbitGuard AI - AI Service
 * ================================================================
 *
 * Responsibilities:
 * - Validate AI chat messages.
 * - Communicate with the existing Spring Boot backend.
 * - Extract the generated answer from the API response.
 * - Normalize errors for presentation components.
 *
 * Backend endpoint:
 *   POST /api/ai/chat
 *
 * Request:
 *   {
 *     "message": "Explain orbital debris."
 *   }
 *
 * Expected response:
 *   ApiResponse<AiChatResponse>
 *
 * AiChatResponse:
 *   {
 *     "response": "Generated AI answer..."
 *   }
 *
 * IMPORTANT:
 * - The Spring Boot backend remains the source of truth.
 * - Gemini communication stays exclusively in the backend.
 * - The existing Axios instance handles the base URL,
 *   authentication, and common request configuration.
 * - This service does not generate AI responses locally.
 * ================================================================
 */

// ----------------------------------------------------------------
// API CONFIGURATION
// ----------------------------------------------------------------

const AI_CHAT_ENDPOINT = "/api/ai/chat";

const MIN_MESSAGE_LENGTH = 2;
const MAX_MESSAGE_LENGTH = 4000;

// ----------------------------------------------------------------
// ERROR NORMALIZATION
// ----------------------------------------------------------------

/**
 * Converts API errors into readable messages.
 *
 * @param {unknown} error Axios or application error.
 * @returns {string} User-readable error message.
 */
const getErrorMessage = (error) => {
  const status = error?.response?.status;
  const backendData = error?.response?.data;

  // A response-less error may be a network failure, timeout,
  // or a request setup error.
  if (!error?.response) {
    if (error?.code === "ECONNABORTED") {
      return "The AI request timed out. Please try again.";
    }

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

// ----------------------------------------------------------------
// RESPONSE EXTRACTION
// ----------------------------------------------------------------

/**
 * Extracts the generated answer from supported response structures.
 *
 * Supported examples:
 *
 * { response: "Generated answer" }
 *
 * { data: { response: "Generated answer" } }
 *
 * { data: { data: { response: "Generated answer" } } }
 *
 * { response: { response: "Generated answer" } }
 *
 * @param {unknown} payload Axios response body.
 * @returns {string} Generated AI answer.
 * @throws {Error} If a usable answer cannot be found.
 */
const extractAiResponse = (payload) => {
  if (!payload || typeof payload !== "object") {
    throw new Error(
      "The AI backend returned an invalid response payload."
    );
  }

  const candidates = [
    payload.data?.response,
    payload.data?.data?.response,
    payload.response?.response,
    payload.response,
  ];

  const generatedResponse = candidates.find(
    (candidate) =>
      typeof candidate === "string" &&
      candidate.trim().length > 0
  );

  if (typeof generatedResponse !== "string") {
    throw new Error(
      "The AI backend responded, but its generated answer was missing. " +
      "Verify the response structure returned by the backend."
    );
  }

  return generatedResponse.trim();
};

// ----------------------------------------------------------------
// INTERNAL MESSAGE SERVICE
// ----------------------------------------------------------------

/**
 * Sends a message to the Spring Boot AI endpoint.
 *
 * Returns an object so existing callers can use:
 *   result.response
 *
 * @param {string} message User message.
 * @returns {Promise<{response: string}>} Generated answer.
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
      "Your message cannot exceed 4000 characters."
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
    // Preserve validation errors and response-parsing errors
    // generated by this service instead of mislabeling them
    // as network failures.
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

    const normalizedError = new Error(
      getErrorMessage(error)
    );

    normalizedError.cause = error;

    throw normalizedError;
  }
};

// ----------------------------------------------------------------
// DASHBOARD COMPATIBILITY
// ----------------------------------------------------------------

/**
 * Compatibility wrapper for Dashboard.jsx.
 *
 * Dashboard.jsx expects the generated answer as a string:
 *
 *   const generatedResponse =
 *     await sendAiMessage(normalizedMessage);
 *
 * Existing callers of sendMessage continue receiving:
 *
 *   { response: "Generated answer" }
 *
 * @param {string} message User message.
 * @returns {Promise<string>} Generated AI answer.
 */
const sendAiMessage = async (message) => {
  const result = await sendMessage(message);

  return result.response;
};

// ----------------------------------------------------------------
// PUBLIC SERVICE API
// ----------------------------------------------------------------

const aiService = {
  sendMessage,
  sendAiMessage,
};

// Named exports support direct function imports.
export {
  sendMessage,
  sendAiMessage,
};

// Default export preserves the existing service-object interface.
export default aiService;
