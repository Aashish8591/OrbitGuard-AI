
import api from "./api";

/**
 * ================================================================
 * OrbitGuard AI — Alert Service
 * ================================================================
 *
 * Connects the React frontend to the existing Spring Boot
 * Alert Management API.
 *
 * Responsibilities:
 * - Retrieve paginated alerts with backend filters.
 * - Retrieve an individual alert.
 * - Create an alert for an existing collision risk.
 * - Update alert workflow status.
 * - Soft-delete an alert.
 *
 * The shared Axios instance owns base URL and authentication.
 * This service does not modify backend contracts.
 */

const ALERTS_ENDPOINT = "/api/v1/alerts";

const VALID_STATUSES = new Set([
  "PENDING",
  "ACKNOWLEDGED",
  "RESOLVED",
  "CLOSED",
]);

const VALID_SEVERITIES = new Set([
  "CRITICAL",
  "HIGH",
  "MEDIUM",
  "LOW",
]);

/**
 * Remove empty and UI-only values from search parameters.
 *
 * The backend expects enum values, actual filter values,
 * and Spring Pageable parameters—not "ALL" or empty strings.
 */
function cleanSearchParams(filters = {}) {
  const {
    search,
    severity,
    status,
    source,
    type,
    riskId,
    satelliteId,
    debrisId,
    fromDate,
    toDate,
    page = 0,
    size = 10,
    sortBy = "generatedAt",
    sortDirection = "desc",
  } = filters;

  const params = {
    search,
    severity,
    status,
    source,
    type,
    riskId,
    satelliteId,
    debrisId,
    fromDate,
    toDate,
  };

  const cleaned = {};

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;

    if (typeof value === "string") {
      const trimmed = value.trim();

      if (!trimmed || trimmed.toUpperCase() === "ALL") continue;

      cleaned[key] = trimmed;
      continue;
    }

    cleaned[key] = value;
  }

  const parsedPage = Number(page);
  const parsedSize = Number(size);

  cleaned.page =
    Number.isInteger(parsedPage) && parsedPage >= 0
      ? parsedPage
      : 0;

  cleaned.size =
    Number.isInteger(parsedSize) && parsedSize > 0
      ? Math.min(parsedSize, 100)
      : 10;

  // Spring Pageable uses sort=property,direction.
  const safeSortBy =
    typeof sortBy === "string" && sortBy.trim()
      ? sortBy.trim()
      : "generatedAt";

  const safeDirection =
    String(sortDirection).toLowerCase() === "asc"
      ? "asc"
      : "desc";

  cleaned.sort = `${safeSortBy},${safeDirection}`;

  return cleaned;
}

/**
 * GET /api/v1/alerts
 *
 * Supports search, filters, sorting and server-side pagination.
 *
 * Returns the original Axios response so callers can inspect
 * the ApiResponse and PagedResponse wrappers.
 */
async function getAlerts(filters = {}, config = {}) {
  const params = cleanSearchParams(filters);

  return api.get(ALERTS_ENDPOINT, {
    ...config,
    params: {
      ...params,
      ...(config.params ?? {}),
    },
  });
}

/**
 * GET /api/v1/alerts/{id}
 *
 * Fetch one active alert using its MongoDB document ID.
 */
async function getAlertById(id, config = {}) {
  const alertId = validateId(id);

  return api.get(
    `${ALERTS_ENDPOINT}/${encodeURIComponent(alertId)}`,
    config
  );
}

/**
 * POST /api/v1/alerts
 *
 * Create an alert associated with an existing collision risk.
 *
 * Backend-generated fields such as alertCode, severity,
 * status, source, type and timestamps must not be fabricated
 * by the frontend.
 */
async function createAlert(request, config = {}) {
  if (!request || typeof request !== "object") {
    throw new TypeError("A create-alert request is required.");
  }

  const riskId =
    typeof request.riskId === "string"
      ? request.riskId.trim()
      : "";

  if (!riskId) {
    throw new TypeError("Risk ID is required to create an alert.");
  }

  const payload = { riskId };

  if (
    typeof request.title === "string" &&
    request.title.trim()
  ) {
    payload.title = request.title.trim();
  }

  if (
    typeof request.message === "string" &&
    request.message.trim()
  ) {
    payload.message = request.message.trim();
  }

  if (payload.title && payload.title.length > 150) {
    throw new TypeError(
      "Alert title must not exceed 150 characters."
    );
  }

  if (payload.message && payload.message.length > 1000) {
    throw new TypeError(
      "Alert message must not exceed 1000 characters."
    );
  }

  return api.post(ALERTS_ENDPOINT, payload, config);
}

/**
 * PUT /api/v1/alerts/{id}/status
 *
 * Valid workflow:
 * PENDING -> ACKNOWLEDGED -> RESOLVED -> CLOSED
 *
 * The backend remains responsible for enforcing transitions.
 */
async function updateAlertStatus(id, request, config = {}) {
  const alertId = validateId(id);

  if (!request || typeof request !== "object") {
    throw new TypeError("A status update request is required.");
  }

  const status =
    typeof request.status === "string"
      ? request.status.trim().toUpperCase()
      : "";

  if (!VALID_STATUSES.has(status)) {
    throw new TypeError(
      "Status must be PENDING, ACKNOWLEDGED, RESOLVED or CLOSED."
    );
  }

  const remarks =
    typeof request.remarks === "string"
      ? request.remarks.trim()
      : "";

  if (remarks.length > 500) {
    throw new TypeError("Remarks must not exceed 500 characters.");
  }

  return api.put(
    `${ALERTS_ENDPOINT}/${encodeURIComponent(alertId)}/status`,
    {
      status,
      remarks,
    },
    config
  );
}

/**
 * DELETE /api/v1/alerts/{id}
 *
 * The backend performs a soft delete. This does not
 * permanently remove the MongoDB document.
 */
async function deleteAlert(id, config = {}) {
  const alertId = validateId(id);

  return api.delete(
    `${ALERTS_ENDPOINT}/${encodeURIComponent(alertId)}`,
    config
  );
}

/**
 * Extract a readable error message from common API error shapes.
 * Use this in page-level catch blocks.
 */
function getAlertErrorMessage(error) {
  const responseData = error?.response?.data;

  if (typeof responseData === "string" && responseData.trim()) {
    return responseData;
  }

  if (responseData && typeof responseData === "object") {
    const message =
      responseData.message ??
      responseData.error ??
      responseData.detail;

    if (typeof message === "string" && message.trim()) {
      return message;
    }
  }

  if (typeof error?.message === "string" && error.message.trim()) {
    return error.message;
  }

  return "An unexpected error occurred while communicating with the Alert API.";
}

function validateId(id) {
  if (id === undefined || id === null || String(id).trim() === "") {
    throw new TypeError("Alert ID is required.");
  }

  return String(id).trim();
}

const alertService = {
  getAlerts,
  getAlertById,
  createAlert,
  updateAlertStatus,
  deleteAlert,
  getAlertErrorMessage,
};

export {
  ALERTS_ENDPOINT,
  VALID_SEVERITIES,
  VALID_STATUSES,
  cleanSearchParams,
  getAlerts,
  getAlertById,
  createAlert,
  updateAlertStatus,
  deleteAlert,
  getAlertErrorMessage,
};

export default alertService;
