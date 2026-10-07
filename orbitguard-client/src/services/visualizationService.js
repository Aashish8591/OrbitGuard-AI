import api from "./api";

/**
 * ================================================================
 * OrbitGuard AI - Visualization Service
 * ================================================================
 *
 * Frontend service responsible for communicating with the
 * OrbitGuard AI 3D Visualization REST APIs.
 *
 * Backend endpoints:
 *
 * GET /api/visualization/objects
 * GET /api/visualization/satellite/{noradCatalogId}
 * GET /api/visualization/debris/{noradId}
 *
 * IMPORTANT:
 * - Uses the shared Axios instance.
 * - JWT authentication is handled by api.js.
 * - Does not perform orbital calculations.
 * - Does not transform coordinates.
 * - Does not create dummy visualization data.
 * - Backend remains the source of truth.
 * ================================================================
 */

/**
 * Backend visualization API path.
 *
 * This must match VisualizationApiConstants.BASE_PATH
 * in the Spring Boot backend.
 */
const VISUALIZATION_BASE_PATH = "/api/visualization";

/**
 * ================================================================
 * INTERNAL HELPERS
 * ================================================================
 */

/**
 * Convert a JavaScript Date or supported date value into the
 * LocalDateTime format expected by Spring Boot.
 *
 * Backend:
 *     java.time.LocalDateTime
 *
 * Expected:
 *     YYYY-MM-DDTHH:mm:ss
 *
 * Example:
 *     2026-10-07T00:00:00
 *
 * We intentionally do NOT send:
 *     2026-10-07T00:00:00Z
 *
 * because the backend parameter is LocalDateTime and does not
 * contain timezone information.
 */
const formatTargetTime = (targetTime) => {
  if (targetTime === null || targetTime === undefined) {
    return undefined;
  }

  /**
   * If caller already provides a string, normalize it.
   */
  if (typeof targetTime === "string") {
    const trimmed = targetTime.trim();

    if (!trimmed) {
      return undefined;
    }

    /**
     * Remove timezone suffix if one was accidentally supplied.
     *
     * Examples:
     *
     * 2026-10-07T00:00:00Z
     *             ↓
     * 2026-10-07T00:00:00
     *
     * 2026-10-07T00:00:00+05:30
     *             ↓
     * 2026-10-07T00:00:00
     */
    return trimmed
      .replace(/Z$/i, "")
      .replace(/[+-]\d{2}:\d{2}$/, "")
      .slice(0, 19);
  }

  /**
   * JavaScript Date support.
   */
  if (targetTime instanceof Date) {
    if (Number.isNaN(targetTime.getTime())) {
      throw new Error("Invalid visualization target time.");
    }

    const year = targetTime.getUTCFullYear();
    const month = String(
      targetTime.getUTCMonth() + 1
    ).padStart(2, "0");

    const day = String(
      targetTime.getUTCDate()
    ).padStart(2, "0");

    const hours = String(
      targetTime.getUTCHours()
    ).padStart(2, "0");

    const minutes = String(
      targetTime.getUTCMinutes()
    ).padStart(2, "0");

    const seconds = String(
      targetTime.getUTCSeconds()
    ).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  }

  throw new Error(
    "Visualization targetTime must be a valid date string or Date."
  );
};

/**
 * Validate a NORAD ID before making the request.
 */
const validateNoradId = (noradId, fieldName = "NORAD ID") => {
  if (
    noradId === null ||
    noradId === undefined ||
    noradId === ""
  ) {
    throw new Error(`${fieldName} is required.`);
  }

  const numericId = Number(noradId);

  if (!Number.isInteger(numericId) || numericId <= 0) {
    throw new Error(
      `${fieldName} must be a positive integer.`
    );
  }

  return numericId;
};

/**
 * Resolve the actual visualization payload from the common
 * backend ApiResponse wrapper.
 *
 * Expected backend structure is normally:
 *
 * {
 *   success: true,
 *   message: "...",
 *   data: {
 *     objects: [...]
 *   }
 * }
 *
 * This helper also tolerates a direct response object so that
 * the service remains safe if the response wrapper changes
 * slightly without modifying the visualization mapping logic.
 */
const extractVisualizationData = (response) => {
  const responseData = response?.data;

  if (!responseData) {
    throw new Error(
      "Visualization API returned an empty response."
    );
  }

  /**
   * Standard OrbitGuard ApiResponse:
   *
   * response.data.data
   */
  if (
    responseData.data !== null &&
    responseData.data !== undefined
  ) {
    return responseData.data;
  }

  /**
   * Some response wrappers may expose the payload through
   * result/content. These are fallback cases only.
   */
  if (
    responseData.result !== null &&
    responseData.result !== undefined
  ) {
    return responseData.result;
  }

  if (
    responseData.content !== null &&
    responseData.content !== undefined
  ) {
    return responseData.content;
  }

  /**
   * If the backend directly returned the visualization object.
   */
  if (
    responseData.objects !== undefined ||
    responseData.object !== undefined ||
    responseData.propagatedAt !== undefined
  ) {
    return responseData;
  }

  throw new Error(
    "Visualization API response does not contain visualization data."
  );
};

/**
 * Log useful development information without dumping the
 * complete 11 MB bulk response into the browser console.
 */
const logBulkResponseSummary = (data, targetTime) => {
  if (!import.meta.env.DEV) {
    return;
  }

  const objects = Array.isArray(data?.objects)
    ? data.objects
    : [];

  console.info(
    "[OrbitGuard Visualization] Bulk response received.",
    {
      targetTime,
      propagatedAt: data?.propagatedAt ?? null,
      objectCount: objects.length,
    }
  );
};

/**
 * ================================================================
 * BULK VISUALIZATION
 * ================================================================
 *
 * Retrieves all active satellites and debris objects for the
 * requested propagation time.
 *
 * Backend:
 * GET /api/visualization/objects
 *
 * Example:
 * GET /api/visualization/objects?targetTime=2026-10-07T00:00:00
 */
export const getAllVisualizationObjects = async (
  targetTime = undefined
) => {
  const formattedTargetTime =
    formatTargetTime(targetTime);

  const params = {};

  /**
   * If targetTime is not supplied, backend controller will use:
   *
   * LocalDateTime.now(ZoneOffset.UTC)
   *
   * We therefore intentionally do not send an undefined query
   * parameter.
   */
  if (formattedTargetTime) {
    params.targetTime = formattedTargetTime;
  }

  if (import.meta.env.DEV) {
    console.info(
      "[OrbitGuard Visualization] Requesting bulk visualization data.",
      {
        targetTime:
          formattedTargetTime ?? "backend UTC now",
      }
    );
  }

  try {
    const response = await api.get(
      `${VISUALIZATION_BASE_PATH}/objects`,
      {
        params,
      }
    );

    const data =
      extractVisualizationData(response);

    logBulkResponseSummary(
      data,
      formattedTargetTime ?? null
    );

    return data;
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error(
        "[OrbitGuard Visualization] Bulk request failed.",
        {
          targetTime:
            formattedTargetTime ?? "backend UTC now",
          status: error?.response?.status ?? null,
          message: error?.message ?? null,
        }
      );
    }

    throw error;
  }
};

/**
 * ================================================================
 * SINGLE SATELLITE VISUALIZATION
 * ================================================================
 *
 * Backend:
 * GET /api/visualization/satellite/{noradCatalogId}
 */
export const getSatelliteVisualization = async (
  noradCatalogId,
  targetTime = undefined
) => {
  const validNoradId = validateNoradId(
    noradCatalogId,
    "Satellite NORAD catalog ID"
  );

  const formattedTargetTime =
    formatTargetTime(targetTime);

  const params = {};

  if (formattedTargetTime) {
    params.targetTime = formattedTargetTime;
  }

  if (import.meta.env.DEV) {
    console.info(
      "[OrbitGuard Visualization] Requesting satellite visualization.",
      {
        noradCatalogId: validNoradId,
        targetTime:
          formattedTargetTime ?? "backend UTC now",
      }
    );
  }

  try {
    const response = await api.get(
      `${VISUALIZATION_BASE_PATH}/satellite/${validNoradId}`,
      {
        params,
      }
    );

    const data =
      extractVisualizationData(response);

    if (import.meta.env.DEV) {
      console.info(
        "[OrbitGuard Visualization] Satellite visualization received.",
        {
          noradCatalogId: validNoradId,
          propagatedAt:
            data?.propagatedAt ?? null,
          object:
            data?.object ?? null,
        }
      );
    }

    return data;
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error(
        "[OrbitGuard Visualization] Satellite request failed.",
        {
          noradCatalogId: validNoradId,
          targetTime:
            formattedTargetTime ?? "backend UTC now",
          status: error?.response?.status ?? null,
          message: error?.message ?? null,
        }
      );
    }

    throw error;
  }
};

/**
 * ================================================================
 * SINGLE DEBRIS VISUALIZATION
 * ================================================================
 *
 * Backend:
 * GET /api/visualization/debris/{noradId}
 */
export const getDebrisVisualization = async (
  noradId,
  targetTime = undefined
) => {
  const validNoradId = validateNoradId(
    noradId,
    "Debris NORAD ID"
  );

  const formattedTargetTime =
    formatTargetTime(targetTime);

  const params = {};

  if (formattedTargetTime) {
    params.targetTime = formattedTargetTime;
  }

  if (import.meta.env.DEV) {
    console.info(
      "[OrbitGuard Visualization] Requesting debris visualization.",
      {
        noradId: validNoradId,
        targetTime:
          formattedTargetTime ?? "backend UTC now",
      }
    );
  }

  try {
    const response = await api.get(
      `${VISUALIZATION_BASE_PATH}/debris/${validNoradId}`,
      {
        params,
      }
    );

    const data =
      extractVisualizationData(response);

    if (import.meta.env.DEV) {
      console.info(
        "[OrbitGuard Visualization] Debris visualization received.",
        {
          noradId: validNoradId,
          propagatedAt:
            data?.propagatedAt ?? null,
          object:
            data?.object ?? null,
        }
      );
    }

    return data;
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error(
        "[OrbitGuard Visualization] Debris request failed.",
        {
          noradId: validNoradId,
          targetTime:
            formattedTargetTime ?? "backend UTC now",
          status: error?.response?.status ?? null,
          message: error?.message ?? null,
        }
      );
    }

    throw error;
  }
};

/**
 * ================================================================
 * DEFAULT SERVICE OBJECT
 * ================================================================
 *
 * Allows both:
 *
 * import {
 *   getAllVisualizationObjects
 * } from "./visualizationService";
 *
 * and:
 *
 * import visualizationService from "./visualizationService";
 */
const visualizationService = {
  getAllVisualizationObjects,
  getSatelliteVisualization,
  getDebrisVisualization,
};

export default visualizationService;