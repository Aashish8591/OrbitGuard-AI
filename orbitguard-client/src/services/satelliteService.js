import api from "./api";

/**
 * ================================================================
 * OrbitGuard AI - Satellite Service
 * ================================================================
 *
 * Backend:
 * /api/satellites
 *
 * This service:
 * - communicates with SatelliteController
 * - builds query parameters
 * - unwraps ApiResponse
 * - exposes clean methods to React
 *
 * It does NOT:
 * - manage React state
 * - perform browser-side filtering
 * - calculate orbital values
 * - contain UI logic
 * ================================================================
 */

const SATELLITE_API_PATH = "/api/satellites";


/* ================================================================
   RESPONSE HELPERS
================================================================ */

const unwrapResponse = (response) => {
    const body = response?.data;

    if (!body) {
        return null;
    }

    if (
        Object.prototype.hasOwnProperty.call(
            body,
            "data"
        )
    ) {
        return body.data;
    }

    return body;
};


const assertApiSuccess = (response) => {
    const body = response?.data;

    if (
        body &&
        Object.prototype.hasOwnProperty.call(
            body,
            "success"
        ) &&
        body.success === false
    ) {
        const error = new Error(
            body.message ||
            body.error ||
            "Satellite operation was not successful."
        );

        error.response = response;

        throw error;
    }

    return response;
};


/* ================================================================
   GET SATELLITES
================================================================ */

export const getSatellites = async ({
    page = 0,
    size = 10,
    sortBy = "createdAt",
    direction = "desc",
    keyword = "",
} = {}) => {
    const parsedPage = Number(page);
    const parsedSize = Number(size);

    const normalizedPage =
        Number.isInteger(parsedPage) &&
        parsedPage >= 0
            ? parsedPage
            : 0;

    const normalizedSize =
        Number.isInteger(parsedSize) &&
        parsedSize > 0
            ? parsedSize
            : 10;

    const params = {
        page: normalizedPage,
        size: normalizedSize,
        sortBy:
            typeof sortBy === "string" &&
            sortBy.trim()
                ? sortBy.trim()
                : "createdAt",
        direction:
            typeof direction === "string" &&
            direction.trim()
                ? direction.trim()
                : "desc",
    };

    if (
        typeof keyword === "string" &&
        keyword.trim()
    ) {
        params.keyword =
            keyword.trim();
    }

    const response = await api.get(
        SATELLITE_API_PATH,
        {
            params,
        }
    );

    assertApiSuccess(response);

    return unwrapResponse(response);
};


/* ================================================================
   GET SATELLITE BY ID
================================================================ */

export const getSatelliteById = async (
    satelliteId
) => {
    if (
        satelliteId === null ||
        satelliteId === undefined ||
        satelliteId === ""
    ) {
        throw new Error(
            "Satellite ID is required."
        );
    }

    const response = await api.get(
        `${SATELLITE_API_PATH}/${encodeURIComponent(
            satelliteId
        )}`
    );

    assertApiSuccess(response);

    return unwrapResponse(response);
};


/* ================================================================
   CREATE SATELLITE
================================================================ */

export const createSatellite = async (
    satelliteData
) => {
    if (!satelliteData) {
        throw new Error(
            "Satellite data is required."
        );
    }

    const response = await api.post(
        SATELLITE_API_PATH,
        satelliteData
    );

    assertApiSuccess(response);

    return unwrapResponse(response);
};


/* ================================================================
   UPDATE SATELLITE
================================================================ */

export const updateSatellite = async (
    satelliteId,
    satelliteData
) => {
    if (
        satelliteId === null ||
        satelliteId === undefined ||
        satelliteId === ""
    ) {
        throw new Error(
            "Satellite ID is required."
        );
    }

    if (!satelliteData) {
        throw new Error(
            "Satellite data is required."
        );
    }

    const response = await api.put(
        `${SATELLITE_API_PATH}/${encodeURIComponent(
            satelliteId
        )}`,
        satelliteData
    );

    assertApiSuccess(response);

    return unwrapResponse(response);
};


/* ================================================================
   DELETE SATELLITE
================================================================ */

export const deleteSatellite = async (
    satelliteId
) => {
    if (
        satelliteId === null ||
        satelliteId === undefined ||
        satelliteId === ""
    ) {
        throw new Error(
            "Satellite ID is required."
        );
    }

    const response = await api.delete(
        `${SATELLITE_API_PATH}/${encodeURIComponent(
            satelliteId
        )}`
    );

    assertApiSuccess(response);

    return unwrapResponse(response);
};


/* ================================================================
   GET SATELLITE ORBITAL DATA
================================================================ */

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

    assertApiSuccess(response);

    return unwrapResponse(response);
};


/* ================================================================
   CELESTRAK SYNCHRONIZATION
================================================================ */

export const synchronizeSatellites = async (
    group
) => {
    if (
        typeof group !== "string" ||
        !group.trim()
    ) {
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

    assertApiSuccess(response);

    return unwrapResponse(response);
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