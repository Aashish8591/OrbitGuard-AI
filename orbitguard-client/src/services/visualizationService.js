import api from "./api";

/**
 * ============================================================================
 * OrbitGuard AI - Visualization Service
 * ============================================================================
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
 * - Does not modify orbital coordinates.
 * - Does not create dummy visualization data.
 * - Backend remains the source of truth.
 *
 * FRONTEND CONTRACT NORMALIZATION:
 * ----------------------------------------------------------------
 *
 * The current backend JSON response exposes Cartesian coordinate
 * properties as:
 *
 *     xkm
 *     ykm
 *     zkm
 *
 * The frontend visualization contract uses:
 *
 *     xKm
 *     yKm
 *     zKm
 *
 * This service normalizes ONLY the property names at the API
 * boundary. The numerical coordinate values are not changed.
 *
 * Therefore:
 *
 *     backend xkm -> frontend xKm
 *     backend ykm -> frontend yKm
 *     backend zkm -> frontend zKm
 *
 * No coordinate calculation or transformation occurs here.
 *
 * ============================================================================
 */

/**
 * Backend visualization API path.
 *
 * This must match VisualizationApiConstants.BASE_PATH
 * in the Spring Boot backend.
 */
const VISUALIZATION_BASE_PATH = "/api/visualization";

/* ============================================================================
 * INTERNAL HELPERS
 * ========================================================================== */

/**
 * Convert a JavaScript Date or supported date value into the
 * LocalDateTime format expected by Spring Boot.
 *
 * Backend:
 *
 *     java.time.LocalDateTime
 *
 * Expected:
 *
 *     YYYY-MM-DDTHH:mm:ss
 *
 * Example:
 *
 *     2026-10-07T00:00:00
 *
 * We intentionally do NOT send:
 *
 *     2026-10-07T00:00:00Z
 *
 * because the backend parameter is LocalDateTime and does not
 * contain timezone information.
 */
const formatTargetTime = (targetTime) => {
  if (
    targetTime === null ||
    targetTime === undefined
  ) {
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
    if (
      Number.isNaN(
        targetTime.getTime()
      )
    ) {
      throw new Error(
        "Invalid visualization target time."
      );
    }

    const year =
      targetTime.getUTCFullYear();

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
const validateNoradId = (
  noradId,
  fieldName = "NORAD ID"
) => {
  if (
    noradId === null ||
    noradId === undefined ||
    noradId === ""
  ) {
    throw new Error(
      `${fieldName} is required.`
    );
  }

  const numericId = Number(noradId);

  if (
    !Number.isInteger(numericId) ||
    numericId <= 0
  ) {
    throw new Error(
      `${fieldName} must be a positive integer.`
    );
  }

  return numericId;
};

/* ============================================================================
 * VISUALIZATION OBJECT NORMALIZATION
 * ========================================================================== */

/**
 * Normalize one backend visualization object into the frontend
 * visualization contract.
 *
 * ACTUAL BACKEND RESPONSE:
 *
 * {
 *   xkm: 6280.739,
 *   ykm: -2751.993,
 *   zkm: -2190.101
 * }
 *
 * FRONTEND CONTRACT:
 *
 * {
 *   xKm: 6280.739,
 *   yKm: -2751.993,
 *   zKm: -2190.101
 * }
 *
 * IMPORTANT:
 * - Numerical values are NOT changed.
 * - No coordinate conversion occurs.
 * - No latitude/longitude calculation occurs.
 * - No altitude calculation occurs.
 * - Unknown backend fields are preserved.
 *
 * The canonical camel-case field is preferred if it already exists.
 * This makes the normalizer safe if the backend contract is later
 * corrected to return xKm/yKm/zKm directly.
 */
const normalizeVisualizationObject = (
  object
) => {
  if (
    !object ||
    typeof object !== "object" ||
    Array.isArray(object)
  ) {
    return object;
  }

  return {
    ...object,

    xKm:
      object.xKm ??
      object.xkm ??
      null,

    yKm:
      object.yKm ??
      object.ykm ??
      null,

    zKm:
      object.zKm ??
      object.zkm ??
      null,
  };
};

/* ============================================================================
 * VISUALIZATION DATA NORMALIZATION
 * ========================================================================== */

/**
 * Normalize the extracted visualization payload.
 *
 * Supports both:
 *
 *     data.objects
 *
 * and:
 *
 *     data.object
 *
 * because the backend uses the same response contract for bulk
 * and single-object visualization endpoints.
 *
 * Unknown properties are preserved.
 */
const normalizeVisualizationData = (
  data
) => {
  if (
    !data ||
    typeof data !== "object" ||
    Array.isArray(data)
  ) {
    return data;
  }

  const normalized = {
    ...data,
  };

  /**
   * Bulk visualization response.
   */
  if (Array.isArray(data.objects)) {
    normalized.objects =
      data.objects.map(
        normalizeVisualizationObject
      );
  }

  /**
   * Single-object visualization response.
   */
  if (
    data.object &&
    typeof data.object === "object" &&
    !Array.isArray(data.object)
  ) {
    normalized.object =
      normalizeVisualizationObject(
        data.object
      );
  }

  return normalized;
};

/* ============================================================================
 * RESPONSE EXTRACTION
 * ========================================================================== */

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
 * This helper also tolerates a direct response object so that the
 * service remains safe if the response wrapper changes slightly
 * without modifying the visualization mapping logic.
 */
const extractVisualizationData = (
  response
) => {
  const responseData =
    response?.data;

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
    return normalizeVisualizationData(
      responseData.data
    );
  }

  /**
   * Some response wrappers may expose the payload through
   * result/content. These are fallback cases only.
   */
  if (
    responseData.result !== null &&
    responseData.result !== undefined
  ) {
    return normalizeVisualizationData(
      responseData.result
    );
  }

  if (
    responseData.content !== null &&
    responseData.content !== undefined
  ) {
    return normalizeVisualizationData(
      responseData.content
    );
  }

  /**
   * If the backend directly returned the visualization object.
   */
  if (
    responseData.objects !== undefined ||
    responseData.object !== undefined ||
    responseData.propagatedAt !== undefined
  ) {
    return normalizeVisualizationData(
      responseData
    );
  }

  throw new Error(
    "Visualization API response does not contain visualization data."
  );
};

/* ============================================================================
 * BULK VISUALIZATION
 * ========================================================================== */

/**
 * Retrieves all active satellites and debris objects for the
 * requested propagation time.
 *
 * Backend:
 *
 * GET /api/visualization/objects
 *
 * Example:
 *
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
    params.targetTime =
      formattedTargetTime;
  }

  try {
    const response =
      await api.get(
        `${VISUALIZATION_BASE_PATH}/objects`,
        {
          params,
        }
      );

    const data =
      extractVisualizationData(
        response
      );

    return data;
  } catch (error) {
    /**
     * Preserve the original error so the calling layer can
     * display/handle it appropriately.
     *
     * No console logging is performed here.
     */
    throw error;
  }
};

/* ============================================================================
 * SINGLE SATELLITE VISUALIZATION
 * ========================================================================== */

/**
 * Backend:
 *
 * GET /api/visualization/satellite/{noradCatalogId}
 */
export const getSatelliteVisualization = async (
  noradCatalogId,
  targetTime = undefined
) => {
  const validNoradId =
    validateNoradId(
      noradCatalogId,
      "Satellite NORAD catalog ID"
    );

  const formattedTargetTime =
    formatTargetTime(targetTime);

  const params = {};

  if (formattedTargetTime) {
    params.targetTime =
      formattedTargetTime;
  }

  try {
    const response =
      await api.get(
        `${VISUALIZATION_BASE_PATH}/satellite/${validNoradId}`,
        {
          params,
        }
      );

    const data =
      extractVisualizationData(
        response
      );

    return data;
  } catch (error) {
    /**
     * Preserve the original Axios/application error.
     *
     * No console logging is performed here.
     */
    throw error;
  }
};

/* ============================================================================
 * SINGLE DEBRIS VISUALIZATION
 * ========================================================================== */

/**
 * Backend:
 *
 * GET /api/visualization/debris/{noradId}
 */
export const getDebrisVisualization = async (
  noradId,
  targetTime = undefined
) => {
  const validNoradId =
    validateNoradId(
      noradId,
      "Debris NORAD ID"
    );

  const formattedTargetTime =
    formatTargetTime(targetTime);

  const params = {};

  if (formattedTargetTime) {
    params.targetTime =
      formattedTargetTime;
  }

  try {
    const response =
      await api.get(
        `${VISUALIZATION_BASE_PATH}/debris/${validNoradId}`,
        {
          params,
        }
      );

    const data =
      extractVisualizationData(
        response
      );

    return data;
  } catch (error) {
    /**
     * Preserve the original Axios/application error.
     *
     * No console logging is performed here.
     */
    throw error;
  }
};

/* ============================================================================
 * DEFAULT SERVICE OBJECT
 * ========================================================================== */

/**
 * Allows both:
 *
 * import {
 *   getAllVisualizationObjects
 * } from "./visualizationService";
 *
 * and:
 *
 * import visualizationService
 *   from "./visualizationService";
 */
const visualizationService = {
  getAllVisualizationObjects,
  getSatelliteVisualization,
  getDebrisVisualization,
};

export default visualizationService;