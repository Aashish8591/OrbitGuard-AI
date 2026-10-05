import api from "./api";

/**
 * ================================================================
 * OrbitGuard AI - Risk Service
 * ================================================================
 *
 * Frontend API communication layer for the Collision Risk module.
 *
 * Backend:
 * /api/v1/risk
 *
 * Responsibilities:
 * - Analyze collision risk
 * - Fetch paginated risk assessments
 * - Fetch risk assessment by ID
 * - Update risk status
 * - Soft-delete risk assessment
 *
 * This service does NOT:
 * - calculate collision risk
 * - calculate probability
 * - calculate orbital values
 * - perform frontend filtering
 * - manage React state
 * - contain UI logic
 *
 * Backend remains the source of truth.
 * ================================================================
 */

const RISK_BASE_URL = "/api/v1/risk";

/* ================================================================
   RESPONSE HELPERS
================================================================ */

/**
 * Extract the application payload from OrbitGuard's
 * common ApiResponse wrapper.
 *
 * Expected backend response:
 *
 * {
 *     success: true,
 *     message: "...",
 *     data: ...
 * }
 */
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


/**
 * Make sure a HTTP-success response did not contain
 * success=false in the ApiResponse body.
 */
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
            "Risk operation was not successful."
        );

        error.response = response;

        throw error;
    }

    return response;
};


/**
 * Normalize pagination values.
 */
const normalizePage = (page) => {
    const parsed = Number(page);

    return Number.isInteger(parsed) && parsed >= 0
        ? parsed
        : 0;
};


const normalizeSize = (size) => {
    const parsed = Number(size);

    return Number.isInteger(parsed) && parsed > 0
        ? parsed
        : 10;
};


/**
 * Add a query parameter only when it contains a real value.
 */
const addIfPresent = (
    params,
    name,
    value
) => {
    if (
        value === null ||
        value === undefined
    ) {
        return;
    }

    if (
        typeof value === "string" &&
        !value.trim()
    ) {
        return;
    }

    params[name] =
        typeof value === "string"
            ? value.trim()
            : value;
};


/* ================================================================
   ANALYZE RISK
================================================================ */

/**
 * Analyze collision risk between a satellite and debris object.
 *
 * Backend:
 * POST /api/v1/risk/analyze
 *
 * Request:
 * {
 *     satelliteId: "...",
 *     debrisId: "..."
 * }
 *
 * IMPORTANT:
 * satelliteId and debrisId are backend document IDs.
 * They are NOT NORAD IDs.
 */
export const analyzeRisk = async ({
    satelliteId,
    debrisId,
}) => {
    if (!satelliteId) {
        throw new Error(
            "Satellite ID is required."
        );
    }

    if (!debrisId) {
        throw new Error(
            "Debris ID is required."
        );
    }

    const response = await api.post(
        `${RISK_BASE_URL}/analyze`,
        {
            satelliteId,
            debrisId,
        }
    );

    assertApiSuccess(response);

    return unwrapResponse(response);
};


/* ================================================================
   GET RISK ASSESSMENTS
================================================================ */

/**
 * Get paginated risk assessments.
 *
 * Backend:
 * GET /api/v1/risk
 *
 * Supported query parameters:
 *
 * - search
 * - riskLevel
 * - status
 * - assessmentType
 * - satelliteId
 * - debrisId
 * - fromDate
 * - toDate
 * - page
 * - size
 * - sort
 */
export const getRiskAssessments = async ({
    search = "",
    riskLevel = "",
    status = "",
    assessmentType = "",
    satelliteId = "",
    debrisId = "",
    fromDate = "",
    toDate = "",
    page = 0,
    size = 10,
    sort = "assessedAt,desc",
} = {}) => {
    const params = {
        page: normalizePage(page),
        size: normalizeSize(size),
        sort:
            typeof sort === "string" &&
            sort.trim()
                ? sort.trim()
                : "assessedAt,desc",
    };

    addIfPresent(
        params,
        "search",
        search
    );

    addIfPresent(
        params,
        "riskLevel",
        riskLevel
    );

    addIfPresent(
        params,
        "status",
        status
    );

    addIfPresent(
        params,
        "assessmentType",
        assessmentType
    );

    addIfPresent(
        params,
        "satelliteId",
        satelliteId
    );

    addIfPresent(
        params,
        "debrisId",
        debrisId
    );

    addIfPresent(
        params,
        "fromDate",
        fromDate
    );

    addIfPresent(
        params,
        "toDate",
        toDate
    );

    const response = await api.get(
        RISK_BASE_URL,
        {
            params,
        }
    );

    assertApiSuccess(response);

    return unwrapResponse(response);
};


/* ================================================================
   GET RISK BY ID
================================================================ */

/**
 * Backend:
 * GET /api/v1/risk/{id}
 */
export const getRiskById = async (riskId) => {
    if (
        riskId === null ||
        riskId === undefined ||
        riskId === ""
    ) {
        throw new Error(
            "Risk assessment ID is required."
        );
    }

    const response = await api.get(
        `${RISK_BASE_URL}/${encodeURIComponent(
            riskId
        )}`
    );

    assertApiSuccess(response);

    return unwrapResponse(response);
};


/* ================================================================
   UPDATE RISK STATUS
================================================================ */

/**
 * Backend:
 * PATCH /api/v1/risk/{id}/status
 *
 * Expected body:
 * {
 *     status: "...",
 *     remarks: "..."
 * }
 */
export const updateRiskStatus = async (
    riskId,
    {
        status,
        remarks = "",
    } = {}
) => {
    if (
        riskId === null ||
        riskId === undefined ||
        riskId === ""
    ) {
        throw new Error(
            "Risk assessment ID is required."
        );
    }

    if (!status) {
        throw new Error(
            "Risk status is required."
        );
    }

    const response = await api.patch(
        `${RISK_BASE_URL}/${encodeURIComponent(
            riskId
        )}/status`,
        {
            status,
            remarks,
        }
    );

    assertApiSuccess(response);

    return unwrapResponse(response);
};


/* ================================================================
   DELETE RISK
================================================================ */

/**
 * Backend:
 * DELETE /api/v1/risk/{id}
 *
 * Backend performs the soft delete.
 */
export const deleteRisk = async (riskId) => {
    if (
        riskId === null ||
        riskId === undefined ||
        riskId === ""
    ) {
        throw new Error(
            "Risk assessment ID is required."
        );
    }

    const response = await api.delete(
        `${RISK_BASE_URL}/${encodeURIComponent(
            riskId
        )}`
    );

    assertApiSuccess(response);

    return unwrapResponse(response);
};


/* ================================================================
   DEFAULT SERVICE OBJECT
================================================================ */

const riskService = {
    analyzeRisk,
    getRiskAssessments,
    getRiskById,
    updateRiskStatus,
    deleteRisk,
};

export default riskService;