import api from "./api";

/**
 * ================================================================
 * OrbitGuard AI - Debris Service
 * ================================================================
 *
 * Frontend service responsible for communicating with the
 * Space Debris REST APIs exposed by the Spring Boot backend.
 *
 * Responsibilities:
 * - Create debris
 * - Fetch debris by ID
 * - Fetch paginated/searchable/sortable debris
 * - Update debris
 * - Soft-delete debris
 * - Fetch CelesTrak orbital data
 * - Synchronize debris from CelesTrak
 *
 * This service does NOT:
 * - calculate orbital values
 * - perform filtering/business calculations
 * - manage authentication
 * - show toast notifications
 * - contain UI logic
 *
 * Authentication is handled centrally by api.js.
 * ================================================================
 */

/* ================================================================
   API CONFIGURATION
================================================================ */

/**
 * Existing Spring Boot backend resource.
 *
 * Backend:
 * /api/v1/debris
 */
const DEBRIS_BASE_URL = "/api/v1/debris";

/**
 * Production CelesTrak debris group.
 *
 * The backend synchronization endpoint expects:
 *
 * POST /api/v1/debris/synchronize?group=DEB
 *
 * Keeping the default here prevents UI components from having
 * to know backend synchronization configuration.
 */
const DEFAULT_SYNC_GROUP = "DEB";

/* ================================================================
   RESPONSE HELPERS
================================================================ */

/**
 * Extract the application payload from the standard
 * OrbitGuard ApiResponse wrapper.
 *
 * Expected backend response:
 *
 * {
 *   success: true,
 *   message: "...",
 *   data: ...
 * }
 *
 * Axios response:
 *
 * response
 *   ↓
 * response.data
 *   ↓
 * ApiResponse
 *   ↓
 * ApiResponse.data
 */
const unwrapResponse = (response) => {
  const body = response?.data;

  if (!body) {
    return null;
  }

  if (
    Object.prototype.hasOwnProperty.call(
      body,
      "data",
    )
  ) {
    return body.data;
  }

  /**
   * Fallback for endpoints that return the payload
   * without the common ApiResponse wrapper.
   */
  return body;
};

/**
 * Validate the common API success flag.
 *
 * Axios already rejects non-2xx responses.
 *
 * This additionally protects against:
 *
 * HTTP 200
 * {
 *   success: false,
 *   message: "..."
 * }
 */
const assertApiSuccess = (response) => {
  const body = response?.data;

  if (
    body &&
    Object.prototype.hasOwnProperty.call(
      body,
      "success",
    ) &&
    body.success === false
  ) {
    const error = new Error(
      body.message ||
        body.error ||
        "The debris operation was not successful.",
    );

    error.response = response;

    throw error;
  }

  return response;
};

/* ================================================================
   CREATE DEBRIS
================================================================ */

/**
 * POST /api/v1/debris
 *
 * @param {Object} payload
 * @returns {Promise<Object|null>}
 */
export const createDebris = async (payload) => {
  if (!payload) {
    throw new Error("Debris data is required.");
  }

  const response = await api.post(
    DEBRIS_BASE_URL,
    payload,
  );

  assertApiSuccess(response);

  return unwrapResponse(response);
};

/* ================================================================
   GET DEBRIS BY ID
================================================================ */

/**
 * GET /api/v1/debris/{id}
 *
 * @param {string|number} id
 * @returns {Promise<Object|null>}
 */
export const getDebrisById = async (id) => {
  if (
    id === null ||
    id === undefined ||
    id === ""
  ) {
    throw new Error("Debris ID is required.");
  }

  const response = await api.get(
    `${DEBRIS_BASE_URL}/${encodeURIComponent(id)}`,
  );

  assertApiSuccess(response);

  return unwrapResponse(response);
};

/* ================================================================
   GET PAGINATED DEBRIS
================================================================ */

/**
 * GET /api/v1/debris
 *
 * Supported query parameters:
 *
 * - search
 * - page
 * - size
 * - sort
 *
 * Example:
 *
 * GET /api/v1/debris
 *   ?search=STARLINK
 *   &page=0
 *   &size=5
 *   &sort=createdAt,desc
 *
 * Backend owns:
 * - search
 * - pagination
 * - sorting
 *
 * The frontend only sends the requested query state.
 *
 * @param {Object} options
 * @returns {Promise<Object|null>}
 */
export const getDebris = async ({
  search = "",
  page = 0,
  size = 10,
  sort = "debrisName,asc",
} = {}) => {
  /* --------------------------------------------------------------
     NORMALIZE PAGE
  -------------------------------------------------------------- */

  const parsedPage = Number(page);

  const normalizedPage =
    Number.isInteger(parsedPage) &&
    parsedPage >= 0
      ? parsedPage
      : 0;

  /* --------------------------------------------------------------
     NORMALIZE PAGE SIZE
  -------------------------------------------------------------- */

  const parsedSize = Number(size);

  const normalizedSize =
    Number.isInteger(parsedSize) &&
    parsedSize > 0
      ? parsedSize
      : 10;

  /* --------------------------------------------------------------
     NORMALIZE SORT
  -------------------------------------------------------------- */

  const normalizedSort =
    typeof sort === "string" &&
    sort.trim()
      ? sort.trim()
      : "debrisName,asc";

  /* --------------------------------------------------------------
     BUILD QUERY PARAMETERS
  -------------------------------------------------------------- */

  const params = {
    page: normalizedPage,
    size: normalizedSize,
    sort: normalizedSort,
  };

  /**
   * Do not send:
   *
   * ?search=
   *
   * when there is no search term.
   */
  if (
    typeof search === "string" &&
    search.trim()
  ) {
    params.search = search.trim();
  }

  /* --------------------------------------------------------------
     REQUEST
  -------------------------------------------------------------- */

  const response = await api.get(
    DEBRIS_BASE_URL,
    {
      params,
    },
  );

  assertApiSuccess(response);

  return unwrapResponse(response);
};

/* ================================================================
   UPDATE DEBRIS
================================================================ */

/**
 * PUT /api/v1/debris/{id}
 *
 * @param {string|number} id
 * @param {Object} payload
 * @returns {Promise<Object|null>}
 */
export const updateDebris = async (
  id,
  payload,
) => {
  if (
    id === null ||
    id === undefined ||
    id === ""
  ) {
    throw new Error("Debris ID is required.");
  }

  if (!payload) {
    throw new Error("Debris data is required.");
  }

  const response = await api.put(
    `${DEBRIS_BASE_URL}/${encodeURIComponent(id)}`,
    payload,
  );

  assertApiSuccess(response);

  return unwrapResponse(response);
};

/* ================================================================
   DELETE DEBRIS
================================================================ */

/**
 * DELETE /api/v1/debris/{id}
 *
 * This endpoint performs a backend soft delete.
 *
 * The backend is responsible for changing the active state.
 *
 * The frontend does not manually mutate the local debris
 * collection after deletion. The page reloads the backend
 * registry so MongoDB remains the source of truth.
 *
 * @param {string|number} id
 * @returns {Promise<Object|null>}
 */
export const deleteDebris = async (id) => {
  if (
    id === null ||
    id === undefined ||
    id === ""
  ) {
    throw new Error("Debris ID is required.");
  }

  const response = await api.delete(
    `${DEBRIS_BASE_URL}/${encodeURIComponent(id)}`,
  );

  assertApiSuccess(response);

  return unwrapResponse(response);
};

/* ================================================================
   GET DEBRIS ORBITAL DATA
================================================================ */

/**
 * GET /api/v1/debris/norad/{noradId}/orbital-data
 *
 * @param {string|number} noradId
 * @returns {Promise<Object|null>}
 */
export const getDebrisOrbitalData = async (
  noradId,
) => {
  if (
    noradId === null ||
    noradId === undefined ||
    noradId === ""
  ) {
    throw new Error("NORAD ID is required.");
  }

  const response = await api.get(
    `${DEBRIS_BASE_URL}/norad/${encodeURIComponent(
      noradId,
    )}/orbital-data`,
  );

  assertApiSuccess(response);

  return unwrapResponse(response);
};

/* ================================================================
   SYNCHRONIZE DEBRIS
================================================================ */

/**
 * POST /api/v1/debris/synchronize?group=DEB
 *
 * Current backend contract:
 *
 * POST /api/v1/debris/synchronize?group={group}
 *
 * The default production group is DEB.
 *
 * Example request:
 *
 * POST /api/v1/debris/synchronize?group=DEB
 *
 * The page does not need to know how the CelesTrak group
 * is configured. The service owns that integration detail.
 *
 * @param {string} group
 * @returns {Promise<Object|null>}
 */
export const synchronizeDebris = async (
  group = DEFAULT_SYNC_GROUP,
) => {
  if (
    typeof group !== "string" ||
    !group.trim()
  ) {
    throw new Error(
      "Debris synchronization group is required.",
    );
  }

  const normalizedGroup = group.trim();

  const response = await api.post(
    `${DEBRIS_BASE_URL}/synchronize`,
    null,
    {
      params: {
        group: normalizedGroup,
      },
    },
  );

  assertApiSuccess(response);

  return unwrapResponse(response);
};

/* ================================================================
   DEFAULT SERVICE OBJECT
================================================================ */

const debrisService = {
  createDebris,
  getDebris,
  getDebrisById,
  updateDebris,
  deleteDebris,
  getDebrisOrbitalData,
  synchronizeDebris,
};

export default debrisService;