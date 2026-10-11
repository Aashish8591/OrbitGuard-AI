
import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL
    ?.trim()
    .replace(/\/+$/, "");

if (!API_BASE_URL && import.meta.env.DEV) {
  console.warn(
    "[OrbitGuard API] VITE_API_BASE_URL is not configured."
  );
}

// Default API timeout: 3 minutes
export const DEFAULT_API_TIMEOUT = 180_000;

// Long-running synchronization requests: 12 minutes
export const SYNC_API_TIMEOUT = 12 * 60 * 1000;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
  timeout: DEFAULT_API_TIMEOUT,
});

api.interceptors.request.use(
  (config) => {
    try {
      const storedAuth =
        localStorage.getItem("orbitguard_auth");

      if (!storedAuth) return config;

      const authData = JSON.parse(storedAuth);
      const token =
        typeof authData?.token === "string"
          ? authData.token.trim()
          : "";

      if (!token) return config;

      const tokenType =
        typeof authData?.tokenType === "string" &&
        authData.tokenType.trim()
          ? authData.tokenType.trim()
          : "Bearer";

      config.headers = config.headers ?? {};
      config.headers.Authorization = `${tokenType} ${token}`;

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

api.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);

export const getApiErrorMessage = (
  error,
  fallback = "Something went wrong. Please try again."
) => {
  const responseData = error?.response?.data;

  if (
    typeof responseData === "string" &&
    responseData.trim()
  ) {
    return responseData.trim();
  }

  if (
    typeof responseData?.message === "string" &&
    responseData.message.trim()
  ) {
    return responseData.message.trim();
  }

  if (
    typeof responseData?.error === "string" &&
    responseData.error.trim()
  ) {
    return responseData.error.trim();
  }

  if (
    Array.isArray(responseData?.errors) &&
    responseData.errors.length > 0
  ) {
    const firstError = responseData.errors[0];

    if (typeof firstError === "string" && firstError.trim()) {
      return firstError.trim();
    }

    if (
      typeof firstError?.message === "string" &&
      firstError.message.trim()
    ) {
      return firstError.message.trim();
    }
  }

  if (
    typeof responseData?.details === "string" &&
    responseData.details.trim()
  ) {
    return responseData.details.trim();
  }

  if (error?.code === "ECONNABORTED" || error?.code === "ETIMEDOUT") {
    return "The request timed out. The server may still be processing it. Check the synchronization status before retrying.";
  }

  if (typeof error?.message === "string" && error.message.trim()) {
    return error.message.trim();
  }

  return fallback;
};

export default api;
