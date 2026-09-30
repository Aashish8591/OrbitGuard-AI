import axios from "axios";

/**
 * ================================================================
 * OrbitGuard AI - Shared API Client
 * ================================================================
 *
 * Central Axios client for all frontend API services.
 *
 * Responsibilities:
 * - Configure backend URL
 * - Attach JWT
 * - Configure common headers
 * - Provide shared Axios instance
 * - Extract backend error messages
 * ================================================================
 */

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL
    ?.trim()
    .replace(/\/+$/, "");

if (!API_BASE_URL && import.meta.env.DEV) {
  console.warn(
    "[OrbitGuard API] VITE_API_BASE_URL is not configured."
  );
}

/**
 * Shared Axios instance
 */
const api = axios.create({
  baseURL: API_BASE_URL,

  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },

  timeout: 195000,
});

/**
 * ================================================================
 * REQUEST INTERCEPTOR
 * ================================================================
 *
 * Reads:
 *
 * {
 *   token: "...",
 *   tokenType: "Bearer"
 * }
 *
 * from localStorage and attaches:
 *
 * Authorization: Bearer <token>
 * ================================================================
 */

api.interceptors.request.use(
  (config) => {
    try {
      const storedAuth =
        localStorage.getItem("orbitguard_auth");

      if (!storedAuth) {
        return config;
      }

      const authData = JSON.parse(storedAuth);

      const token =
        typeof authData?.token === "string"
          ? authData.token.trim()
          : "";

      if (!token) {
        return config;
      }

      const tokenType =
        typeof authData?.tokenType === "string" &&
        authData.tokenType.trim()
          ? authData.tokenType.trim()
          : "Bearer";

      config.headers = config.headers ?? {};

      config.headers.Authorization =
        `${tokenType} ${token}`;

      return config;
    } catch {
      if (import.meta.env.DEV) {
        console.warn(
          "[OrbitGuard API] Invalid stored authentication data."
        );
      }

      return config;
    }
  },
  (error) => Promise.reject(error)
);

/**
 * ================================================================
 * RESPONSE INTERCEPTOR
 * ================================================================
 *
 * Do not modify successful responses.
 * Do not automatically logout or redirect.
 * ================================================================
 */

api.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);

/**
 * ================================================================
 * ERROR MESSAGE HELPER
 * ================================================================
 *
 * Extracts the actual message returned by the backend.
 *
 * Supported responses:
 *
 * {
 *   success: false,
 *   message: "CelesTrak ACTIVE satellite data has not updated yet..."
 * }
 *
 * OR
 *
 * {
 *   error: "Some error"
 * }
 *
 * OR
 *
 * {
 *   errors: [...]
 * }
 *
 * OR plain-text response.
 * ================================================================
 */

export const getApiErrorMessage = (
  error,
  fallback = "Something went wrong. Please try again."
) => {
  const responseData = error?.response?.data;

  /**
   * Plain-text backend response
   */
  if (
    typeof responseData === "string" &&
    responseData.trim()
  ) {
    return responseData.trim();
  }

  /**
   * Backend message
   *
   * This is the important one for OrbitGuard.
   */
  if (
    typeof responseData?.message === "string" &&
    responseData.message.trim()
  ) {
    return responseData.message.trim();
  }

  /**
   * Backend error field
   */
  if (
    typeof responseData?.error === "string" &&
    responseData.error.trim()
  ) {
    return responseData.error.trim();
  }

  /**
   * Validation errors
   */
  if (
    Array.isArray(responseData?.errors) &&
    responseData.errors.length > 0
  ) {
    const firstError = responseData.errors[0];

    if (
      typeof firstError === "string" &&
      firstError.trim()
    ) {
      return firstError.trim();
    }

    if (
      typeof firstError?.message === "string" &&
      firstError.message.trim()
    ) {
      return firstError.message.trim();
    }
  }

  /**
   * Backend details
   */
  if (
    typeof responseData?.details === "string" &&
    responseData.details.trim()
  ) {
    return responseData.details.trim();
  }

  /**
   * Axios error
   */
  if (
    typeof error?.message === "string" &&
    error.message.trim()
  ) {
    return error.message.trim();
  }

  /**
   * Final fallback
   */
  return fallback;
};

export default api;