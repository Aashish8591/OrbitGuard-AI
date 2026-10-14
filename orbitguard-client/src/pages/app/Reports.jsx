
import { useCallback, useMemo, useState } from "react";

import {
  FiActivity,
  FiDownload,
  FiFileText,
  FiPlus,
  FiRefreshCw,
  FiShield,
} from "react-icons/fi";

import ReportSummaryCards from "../../features/reports/components/ReportSummaryCards";
import ReportFilters from "../../features/reports/components/ReportFilters";
import ReportsTable from "../../features/reports/components/ReportsTable";
import GenerateReportModal from "../../features/reports/components/GenerateReportModal";
import ReportDetailsModal from "../../features/reports/components/ReportDetailsModal";
import ReportPagination from "../../features/reports/components/ReportPagination";
import ReportsEmptyState from "../../features/reports/components/ReportsEmptyState";

/* ================================================================
   UI-ONLY DEVELOPMENT DATA

   These records are demonstrations, not live backend records.
   Connect the existing Reports API when reportService.js is ready.
   ================================================================ */

const INITIAL_REPORTS = [
  {
    id: "demo-1",
    reportCode: "RPT-DEMO-001",
    reportType: "SATELLITE_ANALYSIS",
    status: "COMPLETED",
    title: "Satellite Operations Overview",
    description:
      "Demonstration record for the satellite analysis report workflow.",
    createdAt: "2026-10-14T09:30:00Z",
    updatedAt: "2026-10-14T09:45:00Z",
  },
  {
    id: "demo-2",
    reportCode: "RPT-DEMO-002",
    reportType: "RISK_ASSESSMENT",
    status: "PROCESSING",
    title: "Orbital Risk Assessment",
    description:
      "Demonstration record for the risk assessment report workflow.",
    createdAt: "2026-10-14T08:20:00Z",
    updatedAt: "2026-10-14T08:35:00Z",
  },
  {
    id: "demo-3",
    reportCode: "RPT-DEMO-003",
    reportType: "DEBRIS_ANALYSIS",
    status: "PENDING",
    title: "Orbital Debris Review",
    description:
      "Demonstration record for the debris analysis report workflow.",
    createdAt: "2026-10-13T15:10:00Z",
    updatedAt: "2026-10-13T15:10:00Z",
  },
  {
    id: "demo-4",
    reportCode: "RPT-DEMO-004",
    reportType: "ALERT_SUMMARY",
    status: "FAILED",
    title: "Alert Summary Report",
    description:
      "Demonstration record for the alert summary report workflow.",
    createdAt: "2026-10-13T11:40:00Z",
    updatedAt: "2026-10-13T12:00:00Z",
  },
  {
    id: "demo-5",
    reportCode: "RPT-DEMO-005",
    reportType: "DASHBOARD_ANALYTICS",
    status: "COMPLETED",
    title: "Dashboard Analytics Summary",
    description:
      "Demonstration record for the dashboard analytics workflow.",
    createdAt: "2026-10-12T13:15:00Z",
    updatedAt: "2026-10-12T13:25:00Z",
  },
];

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

const DEFAULT_FILTERS = {
  search: "",
  reportType: "",
  status: "",
  sortBy: "createdAt:desc",
};

const REPORT_BACKGROUND = "/images/Report/reports-space-bg.png";

/* ================================================================
   HELPERS
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

function getReportKey(report) {
  return report?.id ?? report?._id ?? report?.reportCode ?? null;
}

function getReportCode(report) {
  return report?.reportCode ?? null;
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
        String(a?.title ?? "").localeCompare(String(b?.title ?? "")) *
        multiplier
      );
    }

    const first = new Date(a?.[field] ?? "").getTime();
    const second = new Date(b?.[field] ?? "").getTime();

    const firstTime = Number.isFinite(first) ? first : 0;
    const secondTime = Number.isFinite(second) ? second : 0;

    return (firstTime - secondTime) * multiplier;
  });
}

function getErrorMessage(error) {
  return (
    error?.response?.data?.message ??
    error?.response?.data?.error ??
    error?.message ??
    "Something went wrong. Please try again."
  );
}

/*
 * UI-only download.
 * This creates a metadata text file, not a generated PDF.
 */
function downloadDemoReport(report) {
  const content = [
    "ORBITGUARD AI",
    "REPORT METADATA PREVIEW",
    "",
    `Report code: ${report?.reportCode ?? "Not available"}`,
    `Title: ${report?.title ?? "Untitled report"}`,
    `Type: ${report?.reportType ?? "Not available"}`,
    `Status: ${report?.status ?? "Not available"}`,
    `Created: ${report?.createdAt ?? "Not available"}`,
    "",
    report?.description ?? "No description provided.",
    "",
    "UI DEVELOPMENT FILE — NOT AN OPERATIONAL ANALYSIS REPORT.",
  ].join("\n");

  const blob = new Blob([content], {
    type: "text/plain;charset=utf-8",
  });

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = `${report?.reportCode ?? "report"}-demo.txt`;

  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
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

function ReportsPageHeader({ onGenerate, onRefresh, refreshing }) {
  return (
    <header className="flex flex-col gap-5 border-b border-white/[0.10] pb-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_10px_rgba(103,232,249,0.6)]" />

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
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/15 bg-slate-950/65 px-4 py-2.5 text-sm font-medium text-slate-200 backdrop-blur-sm transition hover:border-cyan-300/30 hover:bg-slate-900/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <FiRefreshCw
            size={15}
            className={refreshing ? "animate-spin" : ""}
          />
          Refresh
        </button>

        <button
          type="button"
          onClick={onGenerate}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-sky-400 px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-950/30 transition hover:from-cyan-300 hover:to-sky-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
        >
          <FiPlus size={17} />
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
  // Demo data only. No backend requests are made by this page yet.
  const [reports, setReports] = useState(INITIAL_REPORTS);

  const [filters, setFilters] = useState({ ...DEFAULT_FILTERS });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [viewMode, setViewMode] = useState("list");

  const [generateModalOpen, setGenerateModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [downloadingReportCode, setDownloadingReportCode] = useState(null);
  const [deletingReportCode, setDeletingReportCode] = useState(null);

  const [pageError, setPageError] = useState(null);
  const [formError, setFormError] = useState(null);
  const [downloadError, setDownloadError] = useState(null);

  /* Filter and sort records. */

  const filteredReports = useMemo(() => {
    const result = reports.filter((report) => {
      if (!report || typeof report !== "object") return false;

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

  /* Keep pagination valid after filtering or deleting records. */

  const totalPages = Math.ceil(filteredReports.length / pageSize);

  const safeCurrentPage =
    totalPages === 0 ? 1 : Math.min(currentPage, totalPages);

  const paginatedReports = useMemo(() => {
    const start = (safeCurrentPage - 1) * pageSize;
    return filteredReports.slice(start, start + pageSize);
  }, [filteredReports, safeCurrentPage, pageSize]);

  /* Calculate summary cards from all local records. */

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

  /* Filter handlers. */

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
    (reportType) => updateFilter("reportType", reportType),
    [updateFilter],
  );

  const handleStatusFilter = useCallback(
    (status) => updateFilter("status", status),
    [updateFilter],
  );

  const handleSearchChange = useCallback(
    (search) => updateFilter("search", search),
    [updateFilter],
  );

  const handleSortChange = useCallback(
    (sortBy) => updateFilter("sortBy", sortBy),
    [updateFilter],
  );

  const handlePageSizeChange = useCallback((nextSize) => {
    const parsedSize = Number(nextSize);

    if (!PAGE_SIZE_OPTIONS.includes(parsedSize)) return;

    setPageSize(parsedSize);
    setCurrentPage(1);
  }, []);

  /* UI-only refresh placeholder. */

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    setPageError(null);

    try {
      await new Promise((resolve) => {
        if (typeof requestAnimationFrame === "function") {
          requestAnimationFrame(() => resolve());
        } else {
          resolve();
        }
      });
    } catch (error) {
      setPageError(getErrorMessage(error));
    } finally {
      setRefreshing(false);
    }
  }, []);

  /* Open report details. */

  const handleViewReport = useCallback((report) => {
    setSelectedReport(report);
    setDownloadError(null);
    setDetailsModalOpen(true);
  }, []);

  /* UI-only metadata download. */

  const handleDownloadReport = useCallback(async (report) => {
    const reportCode = getReportCode(report);

    if (normalizeStatus(report?.status) !== "COMPLETED") {
      setDownloadError("Only completed reports can be downloaded.");
      return;
    }

    setDownloadingReportCode(reportCode ?? getReportKey(report));
    setDownloadError(null);

    try {
      downloadDemoReport(report);
    } catch (error) {
      setDownloadError(getErrorMessage(error));
    } finally {
      setDownloadingReportCode(null);
    }
  }, []);

  /* UI-only report creation. */

  const handleGenerateReport = useCallback(async (payload) => {
    if (!payload?.reportType || !payload?.title?.trim()) {
      setFormError("Report type and title are required.");
      return;
    }

    setSubmitting(true);
    setFormError(null);

    try {
      const now = new Date().toISOString();
      const uniqueId = Date.now();

      const newReport = {
        id: `demo-${uniqueId}`,
        reportCode: `RPT-DEMO-${String(uniqueId).slice(-6)}`,
        reportType: payload.reportType,
        status: "PENDING",
        title: payload.title.trim(),
        description: payload.description?.trim() ?? "",
        createdAt: now,
        updatedAt: now,
      };

      setReports((current) => [newReport, ...current]);
      setFilters({ ...DEFAULT_FILTERS });
      setCurrentPage(1);
      setGenerateModalOpen(false);
      setSelectedReport(newReport);
      setDetailsModalOpen(true);
    } catch (error) {
      setFormError(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }, []);

  /* UI-only deletion. */

  const handleDeleteReport = useCallback(async (report) => {
    const reportCode = getReportCode(report);

    if (!reportCode) {
      setPageError("This report has no report code to identify it.");
      return;
    }

    const confirmed = window.confirm(
      `Delete "${report.title || reportCode}" from this UI demo?`,
    );

    if (!confirmed) return;

    setDeletingReportCode(reportCode);
    setPageError(null);

    try {
      setReports((current) =>
        current.filter(
          (item) => getReportKey(item) !== getReportKey(report),
        ),
      );

      setDetailsModalOpen(false);
      setSelectedReport(null);
    } catch (error) {
      setPageError(getErrorMessage(error));
    } finally {
      setDeletingReportCode(null);
    }
  }, []);

  const handleCloseDetails = useCallback(() => {
    setDetailsModalOpen(false);
    setDownloadError(null);
  }, []);

  const handleMore = useCallback(
    (report) => handleViewReport(report),
    [handleViewReport],
  );

  /* ================================================================
     PAGE UI
     ================================================================ */

  return (
    <main className="relative isolate flex h-full min-h-0 w-full min-w-0 flex-col overflow-x-hidden overflow-y-auto font-['Inter'] text-slate-100">
      {/* Full-page space background. */}

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

        {/* Adjust opacity to reveal more or less of the image. */}
        <div className="absolute inset-0 bg-[#020914]/55" />

        {/* Atmospheric color accents. */}
        <div className="absolute -top-36 left-[20%] h-96 w-96 rounded-full bg-cyan-500/[0.07] blur-[110px]" />

        <div className="absolute right-0 top-40 h-80 w-80 rounded-full bg-blue-600/[0.08] blur-[100px]" />

        <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-violet-500/[0.05] blur-[100px]" />
      </div>

      {/* Main content stays above the background image. */}

      <div className="relative z-10 mx-auto flex w-full max-w-[1800px] min-w-0 flex-1 flex-col gap-5 p-3 sm:gap-6 sm:p-5 lg:p-6 2xl:p-8">
        <ReportsPageHeader
          onGenerate={() => {
            setFormError(null);
            setGenerateModalOpen(true);
          }}
          onRefresh={handleRefresh}
          refreshing={refreshing}
        />

        {/* UI development notice. */}

        <div className="flex flex-wrap items-start gap-3 rounded-xl border border-amber-300/20 bg-[#07111F]/65 px-4 py-3 shadow-lg shadow-black/10 backdrop-blur-sm">
          <FiActivity
            size={17}
            className="mt-0.5 shrink-0 text-amber-300"
            aria-hidden="true"
          />

          <p className="min-w-0 flex-1 text-xs leading-5 text-slate-300/80">
            <span className="font-semibold text-amber-200">
              UI preview mode.
            </span>{" "}
            The displayed records and generation workflow use local demo
            data. They are not synchronized with your backend.
          </p>
        </div>

        {/* Summary cards. */}

        <section aria-label="Report summary" className="min-w-0">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-white">
                Report overview
              </h2>

              <p className="mt-1 text-xs text-slate-300/70">
                Status breakdown of the current demo records
              </p>
            </div>

            <span className="hidden items-center gap-1.5 text-[10px] uppercase tracking-wider text-slate-300/70 sm:flex">
              <FiShield size={13} />
              Workspace
            </span>
          </div>

          <ReportSummaryCards
            reports={reports}
            summary={summary}
            loading={false}
            error={null}
          />
        </section>

        {/* Generated reports workspace.
            Background image remains visible through this panel. */}

        <section className="relative isolate min-w-0 overflow-hidden rounded-2xl border border-cyan-300/20 bg-[#040D1B]/55 shadow-[0_18px_60px_rgba(0,0,0,0.35)] backdrop-blur-[3px]">
          {/* Panel-level overlay for contrast. */}

          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-[#06111F]/45 via-transparent to-[#020914]/35"
          />

          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 z-10 h-px bg-gradient-to-r from-transparent via-cyan-300/35 to-transparent"
          />

          {/* Search and filter header. */}

          <div className="relative border-b border-white/[0.08] bg-[#06111F]/35 p-4 sm:p-5">
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-base font-semibold text-white">
                  Generated reports
                </h2>

                <p className="mt-1 text-xs leading-5 text-slate-300/75">
                  Search, filter, inspect, and manage report records.
                </p>
              </div>

              <span className="inline-flex w-fit items-center gap-2 rounded-lg border border-white/10 bg-[#07111F]/70 px-3 py-2 text-xs text-slate-200/85 backdrop-blur-sm">
                <FiFileText size={14} className="text-cyan-300" />
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

          {/* Page-level error. */}

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
                className="text-xs font-medium text-rose-200 hover:text-white"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Report records. */}

          <div className="relative min-w-0 bg-transparent p-3 sm:p-5">
            {filteredReports.length === 0 ? (
              <ReportsEmptyState
                variant={
                  reports.length === 0
                    ? "empty"
                    : filters.search.trim()
                      ? "search"
                      : "filters"
                }
                searchTerm={filters.search}
                onCreateReport={() => {
                  setFormError(null);
                  setGenerateModalOpen(true);
                }}
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
                onMore={handleMore}
                onRetry={handleRefresh}
                onResetFilters={handleResetFilters}
                downloadingReportCode={downloadingReportCode}
              />
            )}
          </div>

          {/* Pagination. */}

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

        {/* Operational guidance. */}

        <section className="grid gap-3 sm:grid-cols-2">
          <div className="flex min-w-0 items-start gap-3 rounded-xl border border-white/10 bg-[#07111F]/65 p-4 shadow-lg shadow-black/10 backdrop-blur-sm">
            <SummaryIcon icon={FiShield} color="text-cyan-300" />

            <div className="min-w-0">
              <h3 className="text-sm font-medium text-white">
                Report lifecycle
              </h3>

              <p className="mt-1 text-xs leading-5 text-slate-300/75">
                Reports can be pending, processing, completed, or failed.
                The actual lifecycle will be supplied by the backend.
              </p>
            </div>
          </div>

          <div className="flex min-w-0 items-start gap-3 rounded-xl border border-white/10 bg-[#07111F]/65 p-4 shadow-lg shadow-black/10 backdrop-blur-sm">
            <SummaryIcon icon={FiDownload} color="text-violet-300" />

            <div className="min-w-0">
              <h3 className="text-sm font-medium text-white">
                Document access
              </h3>

              <p className="mt-1 text-xs leading-5 text-slate-300/75">
                PDF preview and authenticated downloads will connect to
                your existing report endpoints during integration.
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* Generate report modal. */}

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

      {/* Report details modal. */}

      <ReportDetailsModal
        open={detailsModalOpen}
        report={selectedReport}
        onClose={handleCloseDetails}
        onDownload={handleDownloadReport}
        downloading={
          downloadingReportCode != null &&
          String(downloadingReportCode) ===
            String(
              getReportCode(selectedReport) ??
                getReportKey(selectedReport),
            )
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
