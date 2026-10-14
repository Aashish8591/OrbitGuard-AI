import {
  FiFileText,
  FiGlobe,
  FiGitBranch,
  FiShield,
  FiBarChart2,
  FiBell,
  FiCpu,
  FiEye,
  FiDownload,
  FiMoreVertical,
  FiCalendar,
  FiClock,
  FiAlertCircle,
  FiRefreshCw,
  FiInbox,
} from "react-icons/fi";

/* ================================================================
   CONFIGURATION
================================================================ */

const REPORT_TYPE_CONFIG = {
  SATELLITE_ANALYSIS: {
    label: "Satellite Analysis",
    icon: FiGlobe,
    accent: "text-cyan-300",
    surface: "border-cyan-400/15 bg-cyan-400/[0.06]",
  },
  DEBRIS_ANALYSIS: {
    label: "Debris Analysis",
    icon: FiGitBranch,
    accent: "text-violet-300",
    surface: "border-violet-400/15 bg-violet-400/[0.06]",
  },
  RISK_ASSESSMENT: {
    label: "Risk Assessment",
    icon: FiShield,
    accent: "text-amber-300",
    surface: "border-amber-400/15 bg-amber-400/[0.06]",
  },
  DASHBOARD_ANALYTICS: {
    label: "Dashboard Analytics",
    icon: FiBarChart2,
    accent: "text-blue-300",
    surface: "border-blue-400/15 bg-blue-400/[0.06]",
  },
  ALERT_SUMMARY: {
    label: "Alert Summary",
    icon: FiBell,
    accent: "text-rose-300",
    surface: "border-rose-400/15 bg-rose-400/[0.06]",
  },
  AI_ANALYSIS: {
    label: "AI Analysis",
    icon: FiCpu,
    accent: "text-emerald-300",
    surface: "border-emerald-400/15 bg-emerald-400/[0.06]",
  },
};

const STATUS_CONFIG = {
  PENDING: {
    label: "Pending",
    dot: "bg-amber-300",
    badge:
      "border-amber-400/25 bg-amber-400/[0.09] text-amber-200",
  },
  PROCESSING: {
    label: "Processing",
    dot: "animate-pulse bg-sky-300",
    badge:
      "border-sky-400/25 bg-sky-400/[0.09] text-sky-200",
  },
  COMPLETED: {
    label: "Completed",
    dot: "bg-emerald-300",
    badge:
      "border-emerald-400/25 bg-emerald-400/[0.09] text-emerald-200",
  },
  FAILED: {
    label: "Failed",
    dot: "bg-red-300",
    badge:
      "border-red-400/25 bg-red-400/[0.09] text-red-200",
  },
};

/* ================================================================
   HELPERS
================================================================ */

function normalizeStatus(status) {
  return String(status ?? "").trim().toUpperCase();
}

function normalizeReportType(type) {
  return String(type ?? "").trim().toUpperCase();
}

function getReportKey(report) {
  return (
    report?.id ??
    report?._id ??
    report?.reportCode ??
    report?.reportId ??
    null
  );
}

function getReportCode(report) {
  return report?.reportCode ?? report?.id ?? report?._id ?? "—";
}

function getReportType(report) {
  const normalizedType = normalizeReportType(report?.reportType);

  return (
    REPORT_TYPE_CONFIG[normalizedType] ?? {
      label: String(report?.reportType ?? "Unknown type")
        .replaceAll("_", " ")
        .toLowerCase()
        .replace(/\b\w/g, (character) => character.toUpperCase()),
      icon: FiFileText,
      accent: "text-slate-300",
      surface: "border-slate-700 bg-slate-800/60",
    }
  );
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

function isDownloadingReport(report, downloadingReportCode) {
  if (downloadingReportCode == null) return false;

  return (
    String(downloadingReportCode) === String(getReportCode(report)) ||
    String(downloadingReportCode) === String(getReportKey(report))
  );
}

/* ================================================================
   STATUS BADGE
================================================================ */

function ReportStatusBadge({ status }) {
  const normalizedStatus = normalizeStatus(status);
  const config = STATUS_CONFIG[normalizedStatus];

  if (!config) {
    return (
      <span className="inline-flex max-w-full items-center rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs text-slate-400">
        {status || "Unknown"}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex max-w-full items-center gap-2 whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] font-semibold tracking-wide ${config.badge}`}
    >
      <span
        aria-hidden="true"
        className={`h-1.5 w-1.5 shrink-0 rounded-full ${config.dot}`}
      />
      {config.label}
    </span>
  );
}

/* ================================================================
   ACTION BUTTON
================================================================ */

function ActionButton({
  label,
  icon: Icon,
  onClick,
  disabled = false,
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.02] text-slate-400 transition-colors hover:border-cyan-400/30 hover:bg-cyan-400/[0.07] hover:text-cyan-200 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60"
    >
      <Icon aria-hidden="true" className="h-4 w-4" />
    </button>
  );
}

/* ================================================================
   EMPTY STATE
================================================================ */

function EmptyState({ hasFilters, onReset }) {
  return (
    <div className="flex min-h-[260px] flex-col items-center justify-center px-5 py-12 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-400/15 bg-cyan-400/[0.06]">
        {hasFilters ? (
          <FiAlertCircle
            aria-hidden="true"
            className="h-6 w-6 text-cyan-300"
          />
        ) : (
          <FiInbox
            aria-hidden="true"
            className="h-6 w-6 text-cyan-300"
          />
        )}
      </div>

      <h3 className="mt-4 text-base font-semibold text-white">
        {hasFilters ? "No matching reports" : "No reports yet"}
      </h3>

      <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
        {hasFilters
          ? "Try adjusting your search or filters to find a report."
          : "Generate your first space intelligence report to see it here."}
      </p>

      {hasFilters && onReset && (
        <button
          type="button"
          onClick={onReset}
          className="mt-4 rounded-lg px-3 py-2 text-sm font-medium text-cyan-300 transition-colors hover:bg-cyan-400/[0.07] hover:text-cyan-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}

/* ================================================================
   REPORT ROW
================================================================ */

function ReportRow({
  report,
  index,
  onView,
  onDownload,
  onMore,
  downloading,
}) {
  const type = getReportType(report);
  const TypeIcon = type.icon;
  const reportCode = getReportCode(report);

  return (
    <tr className="group border-t border-white/[0.055] transition-colors hover:bg-cyan-400/[0.025]">
      <td className="px-4 py-4 text-xs tabular-nums text-slate-500">
        {index + 1}
      </td>

      <td className="px-4 py-4">
        <span className="font-mono text-xs font-semibold tracking-wide text-slate-200">
          {reportCode}
        </span>
      </td>

      <td className="min-w-[190px] max-w-[280px] px-4 py-4">
        <p
          className="truncate text-sm font-medium text-slate-200 transition-colors group-hover:text-white"
          title={report?.title ?? ""}
        >
          {report?.title || "Untitled report"}
        </p>

        {report?.description && (
          <p
            className="mt-1 truncate text-xs text-slate-500"
            title={report.description}
          >
            {report.description}
          </p>
        )}
      </td>

      <td className="px-4 py-4">
        <div className="flex min-w-[150px] items-center gap-2.5">
          <span
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${type.surface}`}
          >
            <TypeIcon
              aria-hidden="true"
              className={`h-4 w-4 ${type.accent}`}
            />
          </span>

          <span className="text-xs text-slate-400">{type.label}</span>
        </div>
      </td>

      <td className="px-4 py-4">
        <ReportStatusBadge status={report?.status} />
      </td>

      <td className="whitespace-nowrap px-4 py-4 text-xs text-slate-400">
        {formatDate(report?.createdAt)}
      </td>

      <td className="whitespace-nowrap px-4 py-4 text-xs text-slate-400">
        {formatDate(report?.updatedAt)}
      </td>

      <td className="px-4 py-4">
        <div className="flex items-center justify-end gap-1.5">
          <ActionButton
            label={`View report ${reportCode}`}
            icon={FiEye}
            onClick={() => onView?.(report)}
          />

          <ActionButton
            label={`Download PDF for ${reportCode}`}
            icon={downloading ? FiRefreshCw : FiDownload}
            disabled={downloading}
            onClick={() => onDownload?.(report)}
          />

          {onMore && (
            <ActionButton
              label={`More actions for ${reportCode}`}
              icon={FiMoreVertical}
              onClick={() => onMore(report)}
            />
          )}
        </div>
      </td>
    </tr>
  );
}

/* ================================================================
   MOBILE / GRID REPORT CARD
================================================================ */

function MobileReportCard({
  report,
  onView,
  onDownload,
  onMore,
  downloading,
}) {
  const type = getReportType(report);
  const TypeIcon = type.icon;
  const reportCode = getReportCode(report);

  return (
    <article className="min-w-0 rounded-2xl border border-white/[0.08] bg-[#071321]/85 p-4 transition-colors hover:border-cyan-400/20">
      <div className="flex min-w-0 items-start gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${type.surface}`}
        >
          <TypeIcon
            aria-hidden="true"
            className={`h-5 w-5 ${type.accent}`}
          />
        </div>

        <div className="min-w-0 flex-1">
          <p className="break-words text-sm font-semibold text-slate-100">
            {report?.title || "Untitled report"}
          </p>

          <p className="mt-1 break-all font-mono text-xs text-slate-500">
            {reportCode}
          </p>

          <div className="mt-3">
            <ReportStatusBadge status={report?.status} />
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-3 border-t border-white/[0.06] pt-3">
        <div className="flex min-w-0 items-start gap-2.5">
          <FiFileText
            aria-hidden="true"
            className="mt-0.5 h-4 w-4 shrink-0 text-slate-500"
          />

          <div className="min-w-0">
            <p className="text-[11px] text-slate-500">Report type</p>
            <p className="mt-1 break-words text-xs text-slate-300">
              {type.label}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2">
          <div className="flex min-w-0 items-start gap-2.5">
            <FiCalendar
              aria-hidden="true"
              className="mt-0.5 h-4 w-4 shrink-0 text-slate-500"
            />

            <div className="min-w-0">
              <p className="text-[11px] text-slate-500">Created</p>
              <p className="mt-1 break-words text-xs text-slate-300">
                {formatDate(report?.createdAt)}
              </p>
            </div>
          </div>

          <div className="flex min-w-0 items-start gap-2.5">
            <FiClock
              aria-hidden="true"
              className="mt-0.5 h-4 w-4 shrink-0 text-slate-500"
            />

            <div className="min-w-0">
              <p className="text-[11px] text-slate-500">Last updated</p>
              <p className="mt-1 break-words text-xs text-slate-300">
                {formatDate(report?.updatedAt)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-white/[0.06] pt-3">
        <button
          type="button"
          onClick={() => onView?.(report)}
          className="inline-flex min-h-10 min-w-0 flex-1 items-center justify-center gap-2 rounded-xl border border-cyan-400/20 bg-cyan-400/[0.06] px-3 py-2 text-xs font-medium text-cyan-200 transition-colors hover:bg-cyan-400/[0.12] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60"
        >
          <FiEye aria-hidden="true" className="h-4 w-4" />
          View details
        </button>

        <button
          type="button"
          disabled={downloading}
          onClick={() => onDownload?.(report)}
          className="inline-flex min-h-10 min-w-0 flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs font-medium text-slate-300 transition-colors hover:border-white/20 hover:text-white disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60"
        >
          {downloading ? (
            <FiRefreshCw
              aria-hidden="true"
              className="h-4 w-4 animate-spin"
            />
          ) : (
            <FiDownload aria-hidden="true" className="h-4 w-4" />
          )}
          Download PDF
        </button>

        {onMore && (
          <ActionButton
            label={`More actions for ${reportCode}`}
            icon={FiMoreVertical}
            onClick={() => onMore(report)}
          />
        )}
      </div>
    </article>
  );
}

/* ================================================================
   REPORTS TABLE
================================================================ */

/**
 * Displays reports supplied by the parent.
 *
 * Props:
 * reports: ReportResponse[]
 * loading: boolean
 * error: string | null
 * search: string
 * reportType: string
 * status: string
 * viewMode: "list" | "grid"
 * onView(report)
 * onDownload(report)
 * onMore(report)
 * onRetry()
 * onResetFilters()
 * downloadingReportCode: string | null
 */

function ReportsTable({
  reports = [],
  loading = false,
  error = null,
  search = "",
  reportType = "",
  status = "",
  viewMode = "list",
  onView,
  onDownload,
  onMore,
  onRetry,
  onResetFilters,
  downloadingReportCode = null,
}) {
  const validReports = Array.isArray(reports)
    ? reports.filter(
        (report) =>
          report &&
          typeof report === "object" &&
          !Array.isArray(report),
      )
    : [];

  const hasFilters = Boolean(
    search.trim() || reportType || status,
  );

  if (error) {
    return (
      <section className="rounded-2xl border border-red-400/20 bg-[#071321]/90 p-6 sm:p-8">
        <div className="mx-auto flex max-w-md flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-red-400/20 bg-red-400/[0.07]">
            <FiAlertCircle
              aria-hidden="true"
              className="h-5 w-5 text-red-300"
            />
          </div>

          <h3 className="mt-4 text-base font-semibold text-white">
            Unable to load reports
          </h3>

          <p className="mt-2 break-words text-sm leading-6 text-slate-400">
            {typeof error === "string"
              ? error
              : error?.message ?? "Please try again."}
          </p>

          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-xl bg-cyan-400 px-4 py-2 text-sm font-semibold text-[#04111D] transition-colors hover:bg-cyan-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60"
            >
              <FiRefreshCw aria-hidden="true" className="h-4 w-4" />
              Try again
            </button>
          )}
        </div>
      </section>
    );
  }

  if (loading) {
    return (
      <section
        aria-label="Loading reports"
        aria-busy="true"
        className="min-w-0 w-full"
      >
        <div className="hidden overflow-hidden rounded-2xl border border-white/[0.08] bg-[#050D18]/90 lg:block">
          <div className="space-y-0">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={`desktop-loading-${index}`}
                className="grid grid-cols-8 gap-4 border-b border-white/[0.05] px-4 py-5 last:border-b-0"
              >
                {Array.from({ length: 8 }).map((__, cellIndex) => (
                  <div
                    key={`desktop-loading-${index}-${cellIndex}`}
                    className="h-4 animate-pulse rounded bg-white/[0.06]"
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 lg:hidden">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={`mobile-loading-${index}`}
              className="h-44 animate-pulse rounded-2xl border border-white/[0.07] bg-white/[0.025]"
            />
          ))}
        </div>
      </section>
    );
  }

  if (validReports.length === 0) {
    return (
      <section
        aria-label="Reports archive"
        className="min-w-0 w-full overflow-hidden rounded-2xl border border-white/[0.08] bg-[#050D18]/90"
      >
        <EmptyState
          hasFilters={hasFilters}
          onReset={onResetFilters}
        />
      </section>
    );
  }

  const isGridView = viewMode === "grid";

  return (
    <section
      aria-label="Reports archive"
      aria-busy={false}
      className="min-w-0 w-full"
    >
      {isGridView ? (
        <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 2xl:grid-cols-3">
          {validReports.map((report) => (
            <MobileReportCard
              key={getReportKey(report)}
              report={report}
              onView={onView}
              onDownload={onDownload}
              onMore={onMore}
              downloading={isDownloadingReport(
                report,
                downloadingReportCode,
              )}
            />
          ))}
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-hidden rounded-2xl border border-white/[0.08] bg-[#050D18]/90 lg:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1120px] border-collapse text-left">
                <thead className="bg-[#0B1929]/90">
                  <tr className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-500">
                    <th scope="col" className="w-12 px-4 py-4">
                      #
                    </th>
                    <th scope="col" className="px-4 py-4">
                      Report Code
                    </th>
                    <th scope="col" className="px-4 py-4">
                      Title
                    </th>
                    <th scope="col" className="px-4 py-4">
                      Type
                    </th>
                    <th scope="col" className="px-4 py-4">
                      Status
                    </th>
                    <th scope="col" className="px-4 py-4">
                      Created At
                    </th>
                    <th scope="col" className="px-4 py-4">
                      Updated At
                    </th>
                    <th scope="col" className="px-4 py-4 text-right">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {validReports.map((report, index) => (
                    <ReportRow
                      key={getReportKey(report) ?? `report-${index}`}
                      report={report}
                      index={index}
                      onView={onView}
                      onDownload={onDownload}
                      onMore={onMore}
                      downloading={isDownloadingReport(
                        report,
                        downloadingReportCode,
                      )}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile and tablet cards */}
          <div className="grid grid-cols-1 gap-3 lg:hidden">
            {validReports.map((report, index) => (
              <MobileReportCard
                key={getReportKey(report) ?? `report-${index}`}
                report={report}
                onView={onView}
                onDownload={onDownload}
                onMore={onMore}
                downloading={isDownloadingReport(
                  report,
                  downloadingReportCode,
                )}
              />
            ))}
          </div>
        </>
      )}

      <div className="mt-3 flex flex-col gap-1 px-1 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
        <p>
          Showing{" "}
          <span className="font-medium text-slate-300">
            {validReports.length}
          </span>{" "}
          {validReports.length === 1 ? "report" : "reports"}
        </p>

        <p className="text-slate-600">
          Timestamps are shown in your browser&apos;s local timezone.
        </p>
      </div>
    </section>
  );
}

export default ReportsTable;
