import api from "./api";

/**
 * ================================================================
 * OrbitGuard AI — Notification Service
 * ================================================================
 *
 * Connects the React frontend to the existing Spring Boot
 * Notification Management API.
 *
 * Responsibilities:
 * - Retrieve paginated notifications.
 * - Retrieve a notification by ID or business code.
 * - Retrieve unread notification counts.
 * - Mark notifications as read or unread.
 * - Update editable notification fields.
 * - Soft-delete notifications.
 *
 * The shared Axios instance manages the base URL and JWT.
 * The backend remains the source of truth.
 * ================================================================
 */

const NOTIFICATIONS_ENDPOINT = "/api/v1/notifications";

/**
 * Backend notification enums.
 */
const VALID_NOTIFICATION_TYPES = new Set([
  "SYSTEM",
  "ALERT",
  "COLLISION",
  "WARNING",
  "INFO",
]);

const VALID_NOTIFICATION_PRIORITIES = new Set([
  "LOW",
  "MEDIUM",
  "HIGH",
  "CRITICAL",
]);

const VALID_NOTIFICATION_STATUSES = new Set([
  "UNREAD",
  "READ",
]);

const VALID_NOTIFICATION_ACTIONS = new Set([
  "READ",
  "UNREAD",
]);

const VALID_SORT_FIELDS = new Set([
  "id",
  "notificationCode",
  "title",
  "priority",
  "status",
  "type",
  "createdAt",
]);

/**
 * Validate and normalize a MongoDB document ID or business identifier.
 */
function validateId(id, fieldName = "Notification ID") {
  if (
    id === undefined ||
    id === null ||
    String(id).trim() === ""
  ) {
    throw new TypeError(`${fieldName} is required.`);
  }

  return String(id).trim();
}

/**
 * Validate a required string and its length.
 */
function validateText(
  value,
  fieldName,
  { min = 1, max = 1000 } = {}
) {
  if (typeof value !== "string" || !value.trim()) {
    throw new TypeError(`${fieldName} is required.`);
  }

  const normalized = value.trim();

  if (normalized.length < min || normalized.length > max) {
    throw new TypeError(
      `${fieldName} must be between ${min} and ${max} characters.`
    );
  }

  return normalized;
}

/**
 * Validate an enum against values supported by the backend.
 */
function validateEnum(value, allowedValues, fieldName) {
  const normalized =
    typeof value === "string"
      ? value.trim().toUpperCase()
      : "";

  if (!allowedValues.has(normalized)) {
    throw new TypeError(
      `${fieldName} must be one of: ${[...allowedValues].join(", ")}.`
    );
  }

  return normalized;
}

/**
 * Extract the application payload from the common ApiResponse wrapper.
 *
 * Expected:
 * {
 *   success: true,
 *   message: "...",
 *   data: ...
 * }
 *
 * The original Axios response is retained by the individual methods.
 */
function unwrapResponse(response) {
  const body = response?.data;

  if (body == null) {
    return null;
  }

  if (
    typeof body === "object" &&
    Object.prototype.hasOwnProperty.call(body, "data")
  ) {
    return body.data;
  }

  return body;
}

/**
 * Detect application-level failure even when the HTTP status is 2xx.
 */
function assertApiSuccess(response) {
  const body = response?.data;

  if (
    body &&
    typeof body === "object" &&
    body.success === false
  ) {
    const error = new Error(
      body.message ||
        body.error ||
        "The notification operation was not successful."
    );

    error.response = response;
    throw error;
  }

  return response;
}

/**
 * Extract a readable API error message.
 */
function getNotificationErrorMessage(error) {
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
    typeof error?.message === "string" &&
    error.message.trim()
  ) {
    return error.message.trim();
  }

  return "An unexpected error occurred while communicating with the Notification API.";
}

/**
 * Normalize the pagination and sorting parameters.
 *
 * These names match NotificationSearchRequest and the controller's
 * Spring Pageable construction.
 */
function cleanSearchParams(filters = {}) {
  const {
    search = "",
    status = "",
    priority = "",
    type = "",
    recipientId = "",
    page = 0,
    size = 10,
    sortBy = "createdAt",
    direction = "desc",
  } = filters;

  const parsedPage = Number(page);
  const parsedSize = Number(size);

  const normalizedPage =
    Number.isInteger(parsedPage) && parsedPage >= 0
      ? parsedPage
      : 0;

  const normalizedSize =
    Number.isInteger(parsedSize) && parsedSize > 0
      ? Math.min(parsedSize, 100)
      : 10;

  const normalizedSortBy =
    typeof sortBy === "string" && sortBy.trim()
      ? sortBy.trim()
      : "createdAt";

  if (!VALID_SORT_FIELDS.has(normalizedSortBy)) {
    throw new TypeError(
      `Unsupported notification sort field: ${normalizedSortBy}.`
    );
  }

  const normalizedDirection =
    String(direction).toLowerCase() === "asc"
      ? "asc"
      : "desc";

  const params = {
    page: normalizedPage,
    size: normalizedSize,
    sortBy: normalizedSortBy,
    direction: normalizedDirection,
  };

  const textFilters = {
    search,
    status,
    priority,
    type,
    recipientId,
  };

  for (const [key, value] of Object.entries(textFilters)) {
    if (value === undefined || value === null) {
      continue;
    }

    if (typeof value !== "string") {
      continue;
    }

    const normalized = value.trim();

    // "ALL" is a UI selection, not a backend filter.
    if (!normalized || normalized.toUpperCase() === "ALL") {
      continue;
    }

    if (key === "status") {
      params.status = validateEnum(
        normalized,
        VALID_NOTIFICATION_STATUSES,
        "Notification status"
      );
    } else if (key === "priority") {
      params.priority = validateEnum(
        normalized,
        VALID_NOTIFICATION_PRIORITIES,
        "Notification priority"
      );
    } else if (key === "type") {
      params.type = validateEnum(
        normalized,
        VALID_NOTIFICATION_TYPES,
        "Notification type"
      );
    } else {
      params[key] = normalized;
    }
  }

  return params;
}

/**
 * GET /api/v1/notifications
 *
 * Uses the controller's @ModelAttribute search and filter DTOs.
 *
 * Returns the original Axios response so callers can inspect
 * the ApiResponse and PagedResponse wrappers.
 */
async function getNotifications(filters = {}, config = {}) {
  const params = cleanSearchParams(filters);

  const response = await api.get(NOTIFICATIONS_ENDPOINT, {
    ...config,
    params: {
      ...params,
      ...(config.params ?? {}),
    },
  });

  assertApiSuccess(response);

  return response;
}

/**
 * GET /api/v1/notifications/{id}
 *
 * Fetch an active notification by MongoDB document ID.
 */
async function getNotificationById(id, config = {}) {
  const notificationId = validateId(id);

  const response = await api.get(
    `${NOTIFICATIONS_ENDPOINT}/${encodeURIComponent(notificationId)}`,
    config
  );

  assertApiSuccess(response);

  return response;
}

/**
 * GET /api/v1/notifications/code/{notificationCode}
 *
 * Fetch a notification by its business code.
 *
 * Confirm the actual path in NotificationConstants.GET_BY_CODE
 * before relying on this method.
 */
async function getNotificationByCode(notificationCode, config = {}) {
  const code = validateId(notificationCode, "Notification code");

  const response = await api.get(
    `${NOTIFICATIONS_ENDPOINT}/code/${encodeURIComponent(code)}`,
    config
  );

  assertApiSuccess(response);

  return response;
}

/**
 * GET /api/v1/notifications/unread-count?recipientId={recipientId}
 *
 * The backend currently requires recipientId as a request parameter.
 */
async function getUnreadNotificationCount(recipientId, config = {}) {
  const id = validateId(recipientId, "Recipient ID");

  const response = await api.get(
    `${NOTIFICATIONS_ENDPOINT}/unread-count`,
    {
      ...config,
      params: {
        ...(config.params ?? {}),
        recipientId: id,
      },
    }
  );

  assertApiSuccess(response);

  return response;
}

/**
 * PATCH /api/v1/notifications/{id}/read-status
 *
 * Request body:
 * { "action": "READ" }
 * or
 * { "action": "UNREAD" }
 */
async function updateNotificationReadStatus(
  id,
  action,
  config = {}
) {
  const notificationId = validateId(id);

  const normalizedAction = validateEnum(
    action,
    VALID_NOTIFICATION_ACTIONS,
    "Notification action"
  );

  const response = await api.patch(
    `${NOTIFICATIONS_ENDPOINT}/${encodeURIComponent(notificationId)}/read-status`,
    {
      action: normalizedAction,
    },
    config
  );

  assertApiSuccess(response);

  return response;
}

/**
 * Convenience method to mark a notification as read.
 */
async function markNotificationAsRead(id, config = {}) {
  return updateNotificationReadStatus(id, "READ", config);
}

/**
 * Convenience method to mark a notification as unread.
 */
async function markNotificationAsUnread(id, config = {}) {
  return updateNotificationReadStatus(id, "UNREAD", config);
}

/**
 * PUT /api/v1/notifications/{id}
 *
 * Update only the editable fields supported by UpdateNotificationRequest.
 *
 * Confirm that DTO's validation rules before using this method.
 */
async function updateNotification(id, request, config = {}) {
  const notificationId = validateId(id);

  if (!request || typeof request !== "object") {
    throw new TypeError("A notification update request is required.");
  }

  const payload = {};

  if (request.title !== undefined) {
    payload.title = validateText(request.title, "Notification title", {
      min: 5,
      max: 150,
    });
  }

  if (request.message !== undefined) {
    payload.message = validateText(
      request.message,
      "Notification message",
      { min: 10, max: 1000 }
    );
  }

  if (request.priority !== undefined) {
    payload.priority = validateEnum(
      request.priority,
      VALID_NOTIFICATION_PRIORITIES,
      "Notification priority"
    );
  }

  if (Object.keys(payload).length === 0) {
    throw new TypeError(
      "Provide at least one editable notification field."
    );
  }

  const response = await api.put(
    `${NOTIFICATIONS_ENDPOINT}/${encodeURIComponent(notificationId)}`,
    payload,
    config
  );

  assertApiSuccess(response);

  return response;
}

/**
 * DELETE /api/v1/notifications/{id}
 *
 * The backend performs a soft delete.
 */
async function deleteNotification(id, config = {}) {
  const notificationId = validateId(id);

  const response = await api.delete(
    `${NOTIFICATIONS_ENDPOINT}/${encodeURIComponent(notificationId)}`,
    config
  );

  assertApiSuccess(response);

  return response;
}

/**
 * Optional helper for pages that want the unwrapped data payload.
 * It still performs application-level success validation.
 */
async function getNotificationsData(filters = {}, config = {}) {
  const response = await getNotifications(filters, config);
  return unwrapResponse(response);
}

const notificationService = {
  getNotifications,
  getNotificationsData,
  getNotificationById,
  getNotificationByCode,
  getUnreadNotificationCount,
  updateNotificationReadStatus,
  markNotificationAsRead,
  markNotificationAsUnread,
  updateNotification,
  deleteNotification,
  cleanSearchParams,
  getNotificationErrorMessage,
  unwrapResponse,
};

export {
  NOTIFICATIONS_ENDPOINT,
  VALID_NOTIFICATION_TYPES,
  VALID_NOTIFICATION_PRIORITIES,
  VALID_NOTIFICATION_STATUSES,
  VALID_NOTIFICATION_ACTIONS,
  cleanSearchParams,
  unwrapResponse,
  assertApiSuccess,
  getNotificationErrorMessage,
  getNotifications,
  getNotificationsData,
  getNotificationById,
  getNotificationByCode,
  getUnreadNotificationCount,
  updateNotificationReadStatus,
  markNotificationAsRead,
  markNotificationAsUnread,
  updateNotification,
  deleteNotification,
};

export default notificationService;
