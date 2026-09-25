import axios from "axios";

/**
 * ================================================================
 * OrbitGuard AI - Shared API Client
 * ================================================================
 *
 * Central Axios client used by all frontend API services.
 *
 * Responsibilities:
 * - Configure backend base URL
 * - Attach JWT authentication
 * - Configure standard HTTP headers
 * - Provide one shared HTTP client
 * - Preserve backend response/error objects
 *
 * This file contains NO module-specific endpoints.
 * ================================================================
 */


/**
 * ----------------------------------------------------------------
 * API BASE URL
 * ----------------------------------------------------------------
 *
 * Expected:
 *
 * VITE_API_BASE_URL=http://localhost:8080
 *
 * Do NOT include /api here.
 * ----------------------------------------------------------------
 */

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL
    ?.trim()
    .replace(/\/+$/, "");


if (!API_BASE_URL && import.meta.env.DEV) {
  console.warn(
    "[OrbitGuard API] VITE_API_BASE_URL is not configured.",
  );
}


/**
 * ----------------------------------------------------------------
 * SHARED AXIOS INSTANCE
 * ----------------------------------------------------------------
 */

const api = axios.create({
  baseURL: API_BASE_URL,

  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },

  timeout: 95000,
});


/**
 * ----------------------------------------------------------------
 * REQUEST INTERCEPTOR
 * ----------------------------------------------------------------
 *
 * Reads the existing OrbitGuard authentication object:
 *
 * {
 *   token: "...",
 *   tokenType: "Bearer"
 * }
 *
 * No redirect / logout / refresh logic belongs here yet.
 * ----------------------------------------------------------------
 */

api.interceptors.request.use(
  (config) => {
    try {
      const storedAuth =
        localStorage.getItem("orbitguard_auth");

      if (!storedAuth) {
        return config;
      }

      const authData =
        JSON.parse(storedAuth);

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

      config.headers =
        config.headers ?? {};

      config.headers.Authorization =
        `${tokenType} ${token}`;

      return config;
    } catch {
      if (import.meta.env.DEV) {
        console.warn(
          "[OrbitGuard API] Invalid stored authentication data.",
        );
      }

      return config;
    }
  },
  (error) => Promise.reject(error),
);


/**
 * ----------------------------------------------------------------
 * RESPONSE INTERCEPTOR
 * ----------------------------------------------------------------
 *
 * Do not transform successful responses.
 *
 * Do not automatically logout or redirect.
 * ----------------------------------------------------------------
 */

api.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error),
);


/**
 * ================================================================
 * BACKEND ERROR MESSAGE HELPER
 * ================================================================
 *
 * Supports the common OrbitGuard ApiResponse structure:
 *
 * {
 *   success: false,
 *   message: "...",
 *   data: null
 * }
 *
 * It also supports common Axios/backend error structures.
 * ================================================================
 */

export const getApiErrorMessage = (
  error,
  fallback = "Something went wrong. Please try again.",
) => {
  const responseData =
    error?.response?.data;

  /**
   * Standard OrbitGuard ApiResponse:
   *
   * response.data.message
   */
  if (
    typeof responseData?.message === "string" &&
    responseData.message.trim()
  ) {
    return responseData.message.trim();
  }

  /**
   * Some backend errors may expose:
   *
   * response.data.error
   */
  if (
    typeof responseData?.error === "string" &&
    responseData.error.trim()
  ) {
    return responseData.error.trim();
  }

  /**
   * Validation errors sometimes expose:
   *
   * response.data.errors
   */
  if (
    Array.isArray(responseData?.errors) &&
    responseData.errors.length > 0
  ) {
    const firstError =
      responseData.errors[0];

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
   * Axios-generated error.
   */
  if (
    typeof error?.message === "string" &&
    error.message.trim()
  ) {
    return error.message.trim();
  }

  return fallback;
};


export default api;