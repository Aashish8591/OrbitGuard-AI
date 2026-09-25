import api, {
  getApiErrorMessage,
} from "./api";

/**
 * ================================================================
 * OrbitGuard AI - Dashboard Service
 * ================================================================
 *
 * Backend endpoint:
 *
 * GET /api/dashboard?trendDays={days}
 *
 * Backend contract:
 *
 * ApiResponse<DashboardResponse>
 *
 * Example transport response:
 *
 * {
 *   success: true,
 *   message: "...",
 *   data: {
 *     overview: {...},
 *     satelliteAnalytics: {...},
 *     riskAnalytics: {...},
 *     alertAnalytics: {...},
 *     riskTrends: [...]
 *   }
 * }
 *
 * This service:
 * - Validates trendDays
 * - Calls the backend
 * - Validates the transport envelope
 * - Extracts DashboardResponse
 * - Converts HTTP/backend failures into Error objects
 *
 * This service does NOT:
 * - Calculate analytics
 * - Create fallback production data
 * - Transform backend analytics
 * - Contain React/UI logic
 * ================================================================
 */


/**
 * ----------------------------------------------------------------
 * DASHBOARD CONTRACT
 * ----------------------------------------------------------------
 */

export const DASHBOARD_PATH =
  "/api/dashboard";

export const DEFAULT_TREND_DAYS = 7;

export const MIN_TREND_DAYS = 1;

export const MAX_TREND_DAYS = 365;


/**
 * ----------------------------------------------------------------
 * Validate trend days
 * ----------------------------------------------------------------
 */

export const isValidTrendDays = (
  trendDays,
) =>
  Number.isInteger(trendDays) &&
  trendDays >= MIN_TREND_DAYS &&
  trendDays <= MAX_TREND_DAYS;


/**
 * ================================================================
 * Get Dashboard
 * ================================================================
 *
 * @param {number} trendDays
 * @returns {Promise<object>} DashboardResponse
 * ================================================================
 */

export async function getDashboard(
  trendDays = DEFAULT_TREND_DAYS,
) {
  /**
   * --------------------------------------------------------------
   * Validate request parameter
   * --------------------------------------------------------------
   */

  if (!isValidTrendDays(trendDays)) {
    throw new Error(
      `Dashboard trend period must be between ${MIN_TREND_DAYS} and ${MAX_TREND_DAYS} days.`,
    );
  }


  try {
    /**
     * ------------------------------------------------------------
     * Request backend
     * ------------------------------------------------------------
     */

    const response =
      await api.get(
        DASHBOARD_PATH,
        {
          params: {
            trendDays,
          },
        },
      );


    /**
     * ------------------------------------------------------------
     * Validate transport response
     * ------------------------------------------------------------
     */

    const apiResponse =
      response?.data;


    if (!apiResponse) {
      throw new Error(
        "Dashboard API returned an empty response.",
      );
    }


    /**
     * ------------------------------------------------------------
     * Validate backend business response
     * ------------------------------------------------------------
     */

    if (
      apiResponse.success === false
    ) {
      throw new Error(
        apiResponse.message ||
          "Dashboard API request was unsuccessful.",
      );
    }


    /**
     * ------------------------------------------------------------
     * Extract DashboardResponse
     * ------------------------------------------------------------
     */

    const dashboardData =
      apiResponse.data;


    if (
      dashboardData === null ||
      dashboardData === undefined
    ) {
      throw new Error(
        "Dashboard API response does not contain dashboard data.",
      );
    }


    /**
     * ------------------------------------------------------------
     * Development diagnostic
     * ------------------------------------------------------------
     */

    if (import.meta.env.DEV) {
      console.log(
        "[OrbitGuard Dashboard] DashboardResponse:",
        dashboardData,
      );
    }


    return dashboardData;

  } catch (error) {
    /**
     * ------------------------------------------------------------
     * Preserve application-level errors created above.
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
        "Unable to load dashboard data.",
      ),
    );
  }
}