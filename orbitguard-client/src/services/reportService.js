import api from "./api";

const REPORTS_BASE_URL = "/api/reports";

function normalizeValue(value) {
  return typeof value === "string" ? value.trim() : "";
}

function unwrapResponse(response) {
  const body = response?.data;

  if (body == null) return null;

  if (
    typeof body === "object" &&
    !Array.isArray(body) &&
    Object.prototype.hasOwnProperty.call(body, "data")
  ) {
    return body.data;
  }

  return body;
}

function ensureReportList(response) {
  const payload = unwrapResponse(response);

  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.content)) return payload.content;
  if (payload == null) return [];

  throw new Error("The reports API returned an unexpected list response.");
}

function ensureReportObject(response) {
  const payload = unwrapResponse(response);

  if (
    !payload ||
    typeof payload !== "object" ||
    Array.isArray(payload)
  ) {
    throw new Error("The reports API returned an unexpected report response.");
  }

  return payload;
}

function requireReportCode(reportCode) {
  const code = normalizeValue(reportCode);

  if (!code) {
    throw new Error("A report code is required.");
  }

  return encodeURIComponent(code);
}

const reportService = {
  // GET /api/reports
  async getAllReports() {
    const response = await api.get(REPORTS_BASE_URL);
    return ensureReportList(response);
  },

  // POST /api/reports
  async generateReport(payload) {
    const reportType = normalizeValue(payload?.reportType);
    const title = normalizeValue(payload?.title);
    const description = normalizeValue(payload?.description);

    if (!reportType) {
      throw new Error("Please select a report type.");
    }

    if (title.length < 3 || title.length > 150) {
      throw new Error("Report title must be between 3 and 150 characters.");
    }

    if (description.length > 500) {
      throw new Error("Report description must not exceed 500 characters.");
    }

    const response = await api.post(REPORTS_BASE_URL, {
      reportType,
      title,
      description,
    });

    return ensureReportObject(response);
  },

  // GET /api/reports/{reportCode}
  async getReportByCode(reportCode) {
    const code = requireReportCode(reportCode);

    const response = await api.get(`${REPORTS_BASE_URL}/${code}`);

    return ensureReportObject(response);
  },

  // GET /api/reports/type/{reportType}
  async getReportsByType(reportType) {
    const type = normalizeValue(reportType);

    if (!type) {
      throw new Error("A report type is required.");
    }

    const response = await api.get(
      `${REPORTS_BASE_URL}/type/${encodeURIComponent(type)}`
    );

    return ensureReportList(response);
  },

  // GET /api/reports/status/{status}
  async getReportsByStatus(status) {
    const normalizedStatus = normalizeValue(status);

    if (!normalizedStatus) {
      throw new Error("A report status is required.");
    }

    const response = await api.get(
      `${REPORTS_BASE_URL}/status/${encodeURIComponent(normalizedStatus)}`
    );

    return ensureReportList(response);
  },

  // GET /api/reports/filter?reportType=...&status=...
  async getReportsByTypeAndStatus(reportType, status) {
    const type = normalizeValue(reportType);
    const normalizedStatus = normalizeValue(status);

    if (!type || !normalizedStatus) {
      throw new Error(
        "Both report type and status are required for combined filtering."
      );
    }

    const response = await api.get(`${REPORTS_BASE_URL}/filter`, {
      params: {
        reportType: type,
        status: normalizedStatus,
      },
    });

    return ensureReportList(response);
  },

  // GET /api/reports/{reportCode}/pdf
  async downloadReportPdf(reportCode) {
    const code = requireReportCode(reportCode);

    const response = await api.get(`${REPORTS_BASE_URL}/${code}/pdf`, {
      responseType: "blob",
      headers: {
        Accept: "application/pdf",
      },
    });

    return response.data;
  },

  // DELETE /api/reports/{reportCode}
  async deleteReport(reportCode) {
    const code = requireReportCode(reportCode);

    const response = await api.delete(`${REPORTS_BASE_URL}/${code}`);

    return unwrapResponse(response);
  },
};

export default reportService;
