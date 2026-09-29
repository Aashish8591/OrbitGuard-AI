import api from "./api";

/**
 * ================================================================
 * OrbitGuard AI - Satellite Service
 * ================================================================
 *
 * Satellite-specific API communication layer.
 *
 * Responsibilities:
 * - Communicate with SatelliteController
 * - Build query parameters
 * - Handle Satellite API response envelope
 * - Expose clean methods to React pages/components
 *
 * This file does NOT:
 * - Manage React state
 * - Contain UI logic
 * - Perform filtering in the browser
 * - Contain satellite business rules
 *
 * Backend base:
 * /api/satellites
 *
 * Shared Axios configuration:
 * services/api.js
 * ================================================================
 */

const SATELLITE_API_PATH = "/api/satellites";

/* ================================================================
   RESPONSE HELPERS
================================================================ */

/**
 * Extract the actual backend payload from OrbitGuard's
 * common ApiResponse structure.
 *
 * Expected backend response:
 *
 * {
 *     success: true,
 *     message: "...",
 *     data: {
 *         ...
 *     }
 * }
 */
const extractData = (response) => {
    return response?.data?.data;
};

/* ================================================================
   SATELLITE CRUD
================================================================ */

/**
 * Get paginated satellites.
 *
 * Backend:
 * GET /api/satellites
 *
 * Supported query parameters:
 * - page
 * - size
 * - sortBy
 * - direction
 * - keyword
 *
 * @param {Object} params
 * @param {number} params.page
 * @param {number} params.size
 * @param {string} params.sortBy
 * @param {string} params.direction
 * @param {string} params.keyword
 *
 * @returns {Promise<PagedResponse<SatelliteResponse>>}
 */
export const getSatellites = async ({
    page = 0,
    size = 10,
    sortBy = "createdAt",
    direction = "desc",
    keyword = "",
} = {}) => {
    const response = await api.get(
        SATELLITE_API_PATH,
        {
            params: {
                page,
                size,
                sortBy,
                direction,
                ...(keyword?.trim()
                    ? { keyword: keyword.trim() }
                    : {}),
            },
        }
    );

    return extractData(response);
};


/**
 * Get a single satellite by ID.
 *
 * Backend:
 * GET /api/satellites/{satelliteId}
 *
 * @param {string} satelliteId
 * @returns {Promise<SatelliteResponse>}
 */
export const getSatelliteById = async (satelliteId) => {
    if (!satelliteId) {
        throw new Error("Satellite ID is required.");
    }

    const response = await api.get(
        `${SATELLITE_API_PATH}/${encodeURIComponent(satelliteId)}`
    );

    return extractData(response);
};


/**
 * Create a new satellite.
 *
 * Backend:
 * POST /api/satellites
 *
 * @param {Object} satelliteData
 * @returns {Promise<SatelliteResponse>}
 */
export const createSatellite = async (satelliteData) => {
    if (!satelliteData) {
        throw new Error("Satellite data is required.");
    }

    const response = await api.post(
        SATELLITE_API_PATH,
        satelliteData
    );

    return extractData(response);
};


/**
 * Update an existing satellite.
 *
 * Backend:
 * PUT /api/satellites/{satelliteId}
 *
 * @param {string} satelliteId
 * @param {Object} satelliteData
 * @returns {Promise<SatelliteResponse>}
 */
export const updateSatellite = async (
    satelliteId,
    satelliteData
) => {
    if (!satelliteId) {
        throw new Error("Satellite ID is required.");
    }

    if (!satelliteData) {
        throw new Error("Satellite data is required.");
    }

    const response = await api.put(
        `${SATELLITE_API_PATH}/${encodeURIComponent(satelliteId)}`,
        satelliteData
    );

    return extractData(response);
};


/**
 * Soft delete a satellite.
 *
 * Backend:
 * DELETE /api/satellites/{satelliteId}
 *
 * @param {string} satelliteId
 * @returns {Promise<*>}
 */
export const deleteSatellite = async (satelliteId) => {
    if (!satelliteId) {
        throw new Error("Satellite ID is required.");
    }

    const response = await api.delete(
        `${SATELLITE_API_PATH}/${encodeURIComponent(satelliteId)}`
    );

    return extractData(response);
};

/* ================================================================
   CELESTRAK / ORBITAL DATA
================================================================ */

/**
 * Get current orbital data from CelesTrak.
 *
 * Backend:
 * GET /api/satellites/{noradCatalogId}/orbital-data
 *
 * @param {number} noradCatalogId
 * @returns {Promise<CelesTrakOrbitalData[]>}
 */
export const getSatelliteOrbitalData = async (
    noradCatalogId
) => {
    if (
        noradCatalogId === null ||
        noradCatalogId === undefined ||
        Number(noradCatalogId) <= 0
    ) {
        throw new Error(
            "Valid NORAD catalog ID is required."
        );
    }

    const response = await api.get(
        `${SATELLITE_API_PATH}/${encodeURIComponent(
            noradCatalogId
        )}/orbital-data`
    );

    return extractData(response);
};

/* ================================================================
   CELESTRAK SYNCHRONIZATION
================================================================ */

/**
 * Synchronize satellites from CelesTrak.
 *
 * Backend:
 * POST /api/satellites/synchronize?group={group}
 *
 * @param {string} group
 * @returns {Promise<*>}
 */
export const synchronizeSatellites = async (group) => {
    if (!group?.trim()) {
        throw new Error(
            "CelesTrak group is required."
        );
    }

    const response = await api.post(
        `${SATELLITE_API_PATH}/synchronize`,
        null,
        {
            params: {
                group: group.trim(),
            },
        }
    );

    return extractData(response);
};

/* ================================================================
   DEFAULT SERVICE OBJECT
================================================================ */

const satelliteService = {
    getSatellites,
    getSatelliteById,
    createSatellite,
    updateSatellite,
    deleteSatellite,
    getSatelliteOrbitalData,
    synchronizeSatellites,
};

export default satelliteService;