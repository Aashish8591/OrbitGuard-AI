import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  FiActivity,
  FiDownload,
  FiFileText,
  FiPlus,
  FiRefreshCw,
  FiShield,
} from "react-icons/fi";

import reportService from "../../services/reportService";

import ReportSummaryCards from "../../features/reports/components/ReportSummaryCards";
import ReportFilters from "../../features/reports/components/ReportFilters";
import ReportsTable from "../../features/reports/components/ReportsTable";
import GenerateReportModal from "../../features/reports/components/GenerateReportModal";
import ReportDetailsModal from "../../features/reports/components/ReportDetailsModal";
import ReportPagination from "../../features/reports/components/ReportPagination";
import ReportsEmptyState from "../../features/reports/components/ReportsEmptyState";

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

const DEFAULT_FILTERS = {
  search: "",
  reportType: "",
  status: "",
  sortBy: "createdAt:desc",
};

const REPORT_BACKGROUND = "/images/Report/reports-space-bg.png";

/* ================================================================
   RESPONSE HELPERS
   ================================================================ */

function normalizeText(value) {
  return String(value ?? "").trim().toLowerCase();
}

function normalizeStatus(value) {
  return String(value ?? "").trim().toUpperCase();
}

function normalizeReportType(value) {
  return String(value ?? "").trim().toUpperCase();
}

function getReportCode(report) {
  return report?.reportCode ?? null;
}

function getReportKey(report) {
  return report?.id ?? report?._id ?? report?.reportCode ?? null;
}

/**
 * Supports a direct array and common ApiResponse wrappers.
 * This does not change the backend or reportService contract.
 */
function extractReports(response) {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  if (Array.isArray(response?.content)) {
    return response.content;
  }

  if (Array.isArray(response?.data?.data)) {
    return response.data.data;
  }

  if (Array.isArray(response?.data?.content)) {
    return response.data.content;
  }

  return null;
}

function extractReport(response) {
  if (!response || typeof response !== "object") {
    return null;
  }

  // The service may already unwrap the ApiResponse.
  if (response.reportCode || response.id || response._id) {
    return response;
  }

  const nested = response.data;

  if (nested && typeof nested === "object") {
    if (nested.reportCode || nested.id || nested._id) {
      return nested;
    }

    const deeplyNested = nested.data;

    if (
      deeplyNested &&
      typeof deeplyNested === "object" &&
      (deeplyNested.reportCode ||
        deeplyNested.id ||
        deeplyNested._id)
    ) {
      return deeplyNested;
    }
  }

  return null;
}

function matchesReportSearch(report, search) {
  if (!search) return true;

  const searchable = [
    report?.title,
    report?.description,
    report?.reportCode,
    report?.reportType,
    report?.status,
  ]
    .filter((value) => value != null)
    .join(" ");

  return normalizeText(searchable).includes(normalizeText(search));
}

function sortReports(reports, sortBy) {
  const [field, direction] = String(
    sortBy || "createdAt:desc",
  ).split(":");

  const multiplier = direction === "asc" ? 1 : -1;

  return [...reports].sort((a, b) => {
    if (field === "title") {
      return (
        String(a?.title ?? "").localeCompare(
          String(b?.title ?? ""),
        ) * multiplier
      );
    }

    const first = new Date(a?.[field] ?? "").getTime();
    const second = new Date(b?.[field] ?? "").getTime();

    const firstTime = Number.isFinite(first) ? first : 0;
    const secondTime = Number.isFinite(second) ? second : 0;

    return (firstTime - secondTime) * multiplier;
  });
}

function getErrorMessage(
  error,
  fallback = "Something went wrong. Please try again.",
) {
  const data = error?.response?.data;

  if (typeof data === "string" && data.trim()) {
    return data.trim();
  }

  if (typeof data?.message === "string" && data.message.trim()) {
    return data.message.trim();
  }

  if (typeof data?.error === "string" && data.error.trim()) {
    return data.error.trim();
  }

  if (Array.isArray(data?.errors) && data.errors.length > 0) {
    const first = data.errors[0];

    if (typeof first === "string") return first;
    if (typeof first?.message === "string") return first.message;
  }

  if (
    error?.code === "ECONNABORTED" ||
    error?.code === "ETIMEDOUT"
  ) {
    return "The request timed out. Check the server before retrying.";
  }

  return error?.message || fallback;
}

function formatReportFilename(reportCode) {
  const safeCode = String(
    reportCode || "orbitguard-report",
  ).replace(/[^a-zA-Z0-9._-]/g, "-");

  return `${safeCode}.pdf`;
}

/**
 * Supports the existing service returning a Blob directly or an
 * Axios-style response containing the Blob in its data property.
 */
function extractPdfBlob(response) {
  if (response instanceof Blob) {
    return response;
  }

  if (response?.data instanceof Blob) {
    return response.data;
  }

  throw new Error("The server did not return a valid PDF file.");
}

async function downloadPdf(response, filename) {
  const blob = extractPdfBlob(response);

  if (blob.size === 0) {
    throw new Error("The downloaded PDF is empty.");
  }

  // Some HTTP clients return JSON error responses as Blobs.
  const contentType = String(blob.type || "").toLowerCase();

  if (
    contentType.includes("application/json") ||
    contentType.includes("text/plain")
  ) {
    const message = await blob.text();

    try {
      const parsed = JSON.parse(message);
      throw new Error(
        parsed?.message ||
          parsed?.error ||
          "The server returned an error instead of a PDF.",
      );
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error(
          message.trim() ||
            "The server returned an error instead of a PDF.",
        );
      }

      throw error;
    }
  }

  if (
    contentType &&
    !contentType.includes("application/pdf") &&
    !contentType.includes("application/octet-stream")
  ) {
    throw new Error("The server response is not a PDF document.");
  }

  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  try {
    anchor.href = objectUrl;
    anchor.download = filename;
    anchor.style.display = "none";

    document.body.appendChild(anchor);
    anchor.click();
  } finally {
    anchor.remove();

    // Give the browser time to start the download.
    window.setTimeout(() => {
      URL.revokeObjectURL(objectUrl);
    }, 1000);
  }
}

function SummaryIcon({ icon: Icon, color }) {
  return (
    <span
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-slate-950/50 ${color}`}
      aria-hidden="true"
    >
      <Icon size={19} />
    </span>
  );
}

/* ================================================================
   PAGE HEADER
   ================================================================ */

function ReportsPageHeader({
  onGenerate,
  onRefresh,
  refreshing,
}) {
  return (
    <header className="flex flex-col gap-5 border-b border-white/[0.10] pb-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span
            className="h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_10px_rgba(103,232,249,0.6)]"
            aria-hidden="true"
          />

          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-200">
            Orbital intelligence / reports
          </p>
        </div>

        <h1 className="mt-3 font-['Orbitron'] text-xl font-semibold tracking-tight text-white sm:text-2xl xl:text-3xl">
          Reports Center
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300/80">
          Generate, organize, and review your satellite, debris, risk,
          alert, and analytics reports.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onRefresh}
          disabled={refreshing}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/15 bg-slate-950/65 px-4 py-2.5 text-sm font-medium text-slate-200 backdrop-blur-sm transition hover:border-cyan-300/30 hover:bg-slate-900/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <FiRefreshCw
            size={15}
            className={refreshing ? "animate-spin" : ""}
            aria-hidden="true"
          />
          Refresh
        </button>

        <button
          type="button"
          onClick={onGenerate}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-sky-400 px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-950/30 transition hover:from-cyan-300 hover:to-sky-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
        >
          <FiPlus size={17} aria-hidden="true" />
          Generate report
        </button>
      </div>
    </header>
  );
}

/* ================================================================
   REPORTS PAGE
   ================================================================ */

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [filters, setFilters] = useState({ ...DEFAULT_FILTERS });

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [viewMode, setViewMode] = useState("list");

  const [generateModalOpen, setGenerateModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [downloadingReportCode, setDownloadingReportCode] = useState(null);
  const [deletingReportCode, setDeletingReportCode] = useState(null);

  const [pageError, setPageError] = useState(null);
  const [formError, setFormError] = useState(null);
  const [downloadError, setDownloadError] = useState(null);

  // Prevent older asynchronous requests from overwriting newer state.
  const listRequestIdRef = useRef(0);
  const detailsRequestIdRef = useRef(0);
  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
      listRequestIdRef.current += 1;
      detailsRequestIdRef.current += 1;
    };
  }, []);

  /* ---------------------------------------------------------------
     LOAD REPORTS
     --------------------------------------------------------------- */

  const loadReports = useCallback(async ({ showRefresh = false } = {}) => {
    const requestId = ++listRequestIdRef.current;

    if (showRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setPageError(null);

    try {
      const response = await reportService.getAllReports();

      // Ignore responses from older overlapping requests.
      if (
        !mountedRef.current ||
        requestId !== listRequestIdRef.current
      ) {
        return false;
      }

      const reportList = extractReports(response);

      if (!reportList) {
        throw new Error(
          "The server returned an unsupported reports response.",
        );
      }

      setReports(
        reportList.filter(
          (report) => report && typeof report === "object",
        ),
      );

      return true;
    } catch (error) {
      if (
        !mountedRef.current ||
        requestId !== listRequestIdRef.current
      ) {
        return false;
      }

      setPageError(
        getErrorMessage(error, "Unable to load reports from the server."),
      );

      return false;
    } finally {
      if (
        mountedRef.current &&
        requestId === listRequestIdRef.current
      ) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  /* ---------------------------------------------------------------
     FILTER, SORT AND PAGINATE
     --------------------------------------------------------------- */

  const filteredReports = useMemo(() => {
    const result = reports.filter((report) => {
      if (!report || typeof report !== "object") {
        return false;
      }

      if (
        filters.reportType &&
        normalizeReportType(report.reportType) !== filters.reportType
      ) {
        return false;
      }

      if (
        filters.status &&
        normalizeStatus(report.status) !== filters.status
      ) {
        return false;
      }

      return matchesReportSearch(report, filters.search);
    });

    return sortReports(result, filters.sortBy);
  }, [reports, filters]);

  const totalPages = Math.ceil(filteredReports.length / pageSize);

  const safeCurrentPage =
    totalPages === 0
      ? 1
      : Math.min(Math.max(currentPage, 1), totalPages);

  const paginatedReports = useMemo(() => {
    const start = (safeCurrentPage - 1) * pageSize;

    return filteredReports.slice(start, start + pageSize);
  }, [filteredReports, safeCurrentPage, pageSize]);

  useEffect(() => {
    if (currentPage !== safeCurrentPage) {
      setCurrentPage(safeCurrentPage);
    }
  }, [currentPage, safeCurrentPage]);

  /* ---------------------------------------------------------------
     SUMMARY COUNTS
     --------------------------------------------------------------- */

  const summary = useMemo(() => {
    const result = {
      total: reports.length,
      pending: 0,
      processing: 0,
      completed: 0,
      failed: 0,
    };

    for (const report of reports) {
      switch (normalizeStatus(report?.status)) {
        case "PENDING":
          result.pending += 1;
          break;

        case "PROCESSING":
          result.processing += 1;
          break;

        case "COMPLETED":
          result.completed += 1;
          break;

        case "FAILED":
          result.failed += 1;
          break;

        default:
          break;
      }
    }

    return result;
  }, [reports]);

  /* ---------------------------------------------------------------
     FILTER HANDLERS
     --------------------------------------------------------------- */

  const updateFilter = useCallback((name, value) => {
    setFilters((current) => ({
      ...current,
      [name]: value,
    }));

    setCurrentPage(1);
  }, []);

  const handleResetFilters = useCallback(() => {
    setFilters({ ...DEFAULT_FILTERS });
    setCurrentPage(1);
  }, []);

  const handleReportTypeFilter = useCallback(
    (value) => updateFilter("reportType", value),
    [updateFilter],
  );

  const handleStatusFilter = useCallback(
    (value) => updateFilter("status", value),
    [updateFilter],
  );

  const handleSearchChange = useCallback(
    (value) => updateFilter("search", value),
    [updateFilter],
  );

  const handleSortChange = useCallback(
    (value) => updateFilter("sortBy", value),
    [updateFilter],
  );

  const handlePageSizeChange = useCallback((nextSize) => {
    const size = Number(nextSize);

    if (!PAGE_SIZE_OPTIONS.includes(size)) {
      return;
    }

    setPageSize(size);
    setCurrentPage(1);
  }, []);

  const handleRefresh = useCallback(async () => {
    await loadReports({ showRefresh: true });
  }, [loadReports]);

  /* ---------------------------------------------------------------
     VIEW REPORT DETAILS
     --------------------------------------------------------------- */

  const handleViewReport = useCallback(async (report) => {
    const requestId = ++detailsRequestIdRef.current;
    const reportCode = getReportCode(report);

    setSelectedReport(report);
    setDownloadError(null);
    setDetailsModalOpen(true);

    if (!reportCode) {
      setDownloadError(
        "This report does not have a report code to retrieve its details.",
      );
      return;
    }

    try {
      const response = await reportService.getReportByCode(reportCode);

      if (
        !mountedRef.current ||
        requestId !== detailsRequestIdRef.current
      ) {
        return;
      }

      const details = extractReport(response);

      if (!details) {
        throw new Error(
          "The server returned an invalid report details response.",
        );
      }

      setSelectedReport((current) => {
        if (getReportCode(current) !== reportCode) {
          return current;
        }

        return details;
      });
    } catch (error) {
      if (
        !mountedRef.current ||
        requestId !== detailsRequestIdRef.current
      ) {
        return;
      }

      setDownloadError(
        getErrorMessage(error, "Unable to load full report details."),
      );
    }
  }, []);

  /* ---------------------------------------------------------------
     DOWNLOAD PDF
     --------------------------------------------------------------- */

  const handleDownloadReport = useCallback(async (report) => {
    const reportCode = getReportCode(report);

    if (!reportCode) {
      setDownloadError("This report does not have a report code.");
      return;
    }

    if (downloadingReportCode !== null) {
      return;
    }

    setDownloadingReportCode(reportCode);
    setDownloadError(null);

    try {
      const response = await reportService.downloadReportPdf(reportCode);

      if (!mountedRef.current) {
        return;
      }

      await downloadPdf(response, formatReportFilename(reportCode));
    } catch (error) {
      if (!mountedRef.current) {
        return;
      }

      setDownloadError(
        getErrorMessage(error, "Unable to download the report PDF."),
      );
    } finally {
      if (mountedRef.current) {
        setDownloadingReportCode(null);
      }
    }
  }, [downloadingReportCode]);

  /* ---------------------------------------------------------------
     GENERATE REPORT
     --------------------------------------------------------------- */

  const handleGenerateReport = useCallback(async (payload) => {
    const reportType = String(payload?.reportType ?? "").trim();
    const title = String(payload?.title ?? "").trim();
    const description = String(payload?.description ?? "").trim();

    if (!reportType || !title) {
      setFormError("Report type and title are required.");
      return;
    }

    if (title.length < 3 || title.length > 150) {
      setFormError("The report title must contain 3–150 characters.");
      return;
    }

    if (description.length > 500) {
      setFormError("The description cannot exceed 500 characters.");
      return;
    }

    setSubmitting(true);
    setFormError(null);
    setPageError(null);

    try {
      const response = await reportService.generateReport({
        reportType,
        title,
        description,
      });

      const createdReport = extractReport(response);

      if (!createdReport?.reportCode) {
        throw new Error(
          "The server response did not contain a report code.",
        );
      }

      // Close the form once creation has actually succeeded.
      setGenerateModalOpen(false);
      setFormError(null);
      setFilters({ ...DEFAULT_FILTERS });
      setCurrentPage(1);
      setSelectedReport(createdReport);
      setDownloadError(null);
      setDetailsModalOpen(true);

      // Keep the newly created report visible even if refreshing the
      // collection fails after the creation request succeeded.
      setReports((current) => {
        const withoutCreatedReport = current.filter(
          (item) =>
            getReportCode(item) !== getReportCode(createdReport),
        );

        return [createdReport, ...withoutCreatedReport];
      });

      const refreshed = await loadReports({ showRefresh: true });

      if (!refreshed && mountedRef.current) {
        setPageError(
          "The report was created successfully, but the report list could not be refreshed. Use Refresh to synchronize it.",
        );
      }
    } catch (error) {
      setFormError(
        getErrorMessage(error, "Unable to generate the report."),
      );
    } finally {
      if (mountedRef.current) {
        setSubmitting(false);
      }
    }
  }, [loadReports]);

  /* ---------------------------------------------------------------
     DELETE REPORT
     --------------------------------------------------------------- */

  const handleDeleteReport = useCallback(async (report) => {
    const reportCode = getReportCode(report);

    if (!reportCode) {
      setPageError("This report has no report code to identify it.");
      return;
    }

    if (deletingReportCode !== null) {
      return;
    }

    const confirmed = window.confirm(
      `Delete "${report.title || reportCode}" (${reportCode}) from the server?`,
    );

    if (!confirmed) {
      return;
    }

    setDeletingReportCode(reportCode);
    setPageError(null);

    try {
      await reportService.deleteReport(reportCode);

      if (!mountedRef.current) {
        return;
      }

      setReports((current) =>
        current.filter(
          (item) => getReportCode(item) !== reportCode,
        ),
      );

      detailsRequestIdRef.current += 1;
      setDetailsModalOpen(false);
      setSelectedReport(null);
      setDownloadError(null);
    } catch (error) {
      if (!mountedRef.current) {
        return;
      }

      setPageError(
        getErrorMessage(error, "Unable to delete the report."),
      );
    } finally {
      if (mountedRef.current) {
        setDeletingReportCode(null);
      }
    }
  }, [deletingReportCode]);

  const handleCloseDetails = useCallback(() => {
    detailsRequestIdRef.current += 1;
    setDetailsModalOpen(false);
    setDownloadError(null);
  }, []);

  const openGenerateModal = useCallback(() => {
    setFormError(null);
    setGenerateModalOpen(true);
  }, []);

  /* ---------------------------------------------------------------
     RENDER
     --------------------------------------------------------------- */

  return (
    <main className="relative isolate flex h-full min-h-0 w-full min-w-0 flex-col overflow-x-hidden overflow-y-auto font-['Inter'] text-slate-100">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url("${REPORT_BACKGROUND}")`,
          }}
        />

        <div className="absolute inset-0 bg-[#020914]/55" />
        <div className="absolute -top-36 left-[20%] h-96 w-96 rounded-full bg-cyan-500/[0.07] blur-[110px]" />
        <div className="absolute right-0 top-40 h-80 w-80 rounded-full bg-blue-600/[0.08] blur-[100px]" />
        <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-violet-500/[0.05] blur-[100px]" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-[1800px] min-w-0 flex-1 flex-col gap-5 p-3 sm:gap-6 sm:p-5 lg:p-6 2xl:p-8">
        <ReportsPageHeader
          onGenerate={openGenerateModal}
          onRefresh={handleRefresh}
          refreshing={refreshing || loading}
        />

        <section aria-label="Report summary" className="min-w-0">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-white">
                Report overview
              </h2>

              <p className="mt-1 text-xs text-slate-300/70">
                Status breakdown of reports returned by the backend
              </p>
            </div>

            <span className="hidden items-center gap-1.5 text-[10px] uppercase tracking-wider text-slate-300/70 sm:flex">
              <FiShield size={13} aria-hidden="true" />
              Workspace
            </span>
          </div>

          <ReportSummaryCards
            reports={reports}
            summary={summary}
            loading={loading}
            error={pageError}
          />
        </section>

        <section className="relative isolate min-w-0 overflow-hidden rounded-2xl border border-cyan-300/20 bg-[#040D1B]/55 shadow-[0_18px_60px_rgba(0,0,0,0.35)] backdrop-blur-[3px]">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-[#06111F]/45 via-transparent to-[#020914]/35"
          />

          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 z-10 h-px bg-gradient-to-r from-transparent via-cyan-300/35 to-transparent"
          />

          <div className="relative border-b border-white/[0.08] bg-[#06111F]/35 p-4 sm:p-5">
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-base font-semibold text-white">
                  Generated reports
                </h2>

                <p className="mt-1 text-xs leading-5 text-slate-300/75">
                  Search, filter, inspect, download, and manage report
                  records.
                </p>
              </div>

              <span className="inline-flex w-fit items-center gap-2 rounded-lg border border-white/10 bg-[#07111F]/70 px-3 py-2 text-xs text-slate-200/85 backdrop-blur-sm">
                <FiFileText
                  size={14}
                  className="text-cyan-300"
                  aria-hidden="true"
                />
                {filteredReports.length} matching records
              </span>
            </div>

            <ReportFilters
              search={filters.search}
              onSearchChange={handleSearchChange}
              reportType={filters.reportType}
              onReportTypeChange={handleReportTypeFilter}
              status={filters.status}
              onStatusChange={handleStatusFilter}
              sortBy={filters.sortBy}
              onSortChange={handleSortChange}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              onReset={handleResetFilters}
            />
          </div>

          {pageError && (
            <div
              role="alert"
              className="relative mx-4 mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rose-400/25 bg-rose-950/70 px-4 py-3 backdrop-blur-sm sm:mx-5"
            >
              <p className="min-w-0 flex-1 text-xs leading-5 text-rose-200">
                {pageError}
              </p>

              <button
                type="button"
                onClick={() => setPageError(null)}
                className="text-xs font-medium text-rose-200 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300"
              >
                Dismiss
              </button>
            </div>
          )}

          <div className="relative min-w-0 bg-transparent p-3 sm:p-5">
            {loading ? (
              <div
                role="status"
                className="flex min-h-48 flex-col items-center justify-center gap-3 text-center"
              >
                <FiRefreshCw
                  size={24}
                  className="animate-spin text-cyan-300"
                  aria-hidden="true"
                />

                <p className="text-sm font-medium text-white">
                  Loading reports
                </p>

                <p className="text-xs text-slate-400">
                  Retrieving report records from OrbitGuard.
                </p>
              </div>
            ) : pageError && reports.length === 0 ? (
              <div className="flex min-h-48 flex-col items-center justify-center gap-3 text-center">
                <FiActivity
                  size={24}
                  className="text-rose-300"
                  aria-hidden="true"
                />

                <p className="text-sm font-medium text-white">
                  Reports could not be loaded
                </p>

                <p className="max-w-md text-xs leading-5 text-slate-400">
                  Check your backend availability, API base URL, and
                  authentication, then try again.
                </p>

                <button
                  type="button"
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="mt-1 inline-flex min-h-10 items-center gap-2 rounded-lg border border-cyan-300/25 bg-cyan-400/10 px-4 py-2 text-xs font-semibold text-cyan-100 transition hover:bg-cyan-400/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 disabled:opacity-50"
                >
                  <FiRefreshCw
                    size={14}
                    className={refreshing ? "animate-spin" : ""}
                    aria-hidden="true"
                  />
                  Retry request
                </button>
              </div>
            ) : filteredReports.length === 0 ? (
              <ReportsEmptyState
                variant={
                  reports.length === 0
                    ? "empty"
                    : filters.search.trim()
                      ? "search"
                      : "filters"
                }
                searchTerm={filters.search}
                onCreateReport={openGenerateModal}
                onResetFilters={handleResetFilters}
                onClearSearch={() => handleSearchChange("")}
              />
            ) : (
              <ReportsTable
                reports={paginatedReports}
                loading={false}
                error={null}
                search={filters.search}
                reportType={filters.reportType}
                status={filters.status}
                viewMode={viewMode}
                onView={handleViewReport}
                onDownload={handleDownloadReport}
                onMore={handleViewReport}
                onRetry={handleRefresh}
                onResetFilters={handleResetFilters}
                downloadingReportCode={downloadingReportCode}
              />
            )}
          </div>

          {filteredReports.length > 0 && (
            <div className="relative border-t border-white/[0.08] bg-[#06111F]/35">
              <ReportPagination
                page={safeCurrentPage}
                totalPages={totalPages}
                totalItems={filteredReports.length}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                onPageSizeChange={handlePageSizeChange}
                pageSizes={PAGE_SIZE_OPTIONS}
                loading={refreshing}
              />
            </div>
          )}
        </section>

        <section className="grid gap-3 sm:grid-cols-2">
          <div className="flex min-w-0 items-start gap-3 rounded-xl border border-white/10 bg-[#07111F]/65 p-4 shadow-lg shadow-black/10 backdrop-blur-sm">
            <SummaryIcon icon={FiShield} color="text-cyan-300" />

            <div className="min-w-0">
              <h3 className="text-sm font-medium text-white">
                Report lifecycle
              </h3>

              <p className="mt-1 text-xs leading-5 text-slate-300/75">
                Report status is supplied by the backend. Newly created
                reports may initially be pending.
              </p>
            </div>
          </div>

          <div className="flex min-w-0 items-start gap-3 rounded-xl border border-white/10 bg-[#07111F]/65 p-4 shadow-lg shadow-black/10 backdrop-blur-sm">
            <SummaryIcon icon={FiDownload} color="text-violet-300" />

            <div className="min-w-0">
              <h3 className="text-sm font-medium text-white">
                PDF document access
              </h3>

              <p className="mt-1 text-xs leading-5 text-slate-300/75">
                PDF downloads use the existing report endpoint and
                reflect the content generated by the backend.
              </p>
            </div>
          </div>
        </section>
      </div>

      <GenerateReportModal
        open={generateModalOpen}
        onClose={() => {
          if (!submitting) {
            setGenerateModalOpen(false);
            setFormError(null);
          }
        }}
        onSubmit={handleGenerateReport}
        submitting={submitting}
        error={formError}
      />

      <ReportDetailsModal
        open={detailsModalOpen}
        report={selectedReport}
        onClose={handleCloseDetails}
        onDownload={handleDownloadReport}
        downloading={
          downloadingReportCode != null &&
          String(downloadingReportCode) ===
            String(getReportCode(selectedReport))
        }
        downloadError={downloadError}
        onDelete={handleDeleteReport}
        deleting={
          deletingReportCode != null &&
          String(deletingReportCode) ===
            String(getReportCode(selectedReport))
        }
      />
    </main>
  );
}