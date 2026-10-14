import { useMemo } from "react";

import {
  FiActivity,
  FiAlertCircle,
  FiArrowUpRight,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiDownload,
  FiEye,
  FiFileText,
  FiLayers,
  FiRefreshCw,
  FiShield,
  FiTarget,
  FiBell,
  FiBarChart2,
} from "react-icons/fi";

import ReportStatusBadge from "./ReportStatusBadge";

const REPORT_TYPE_CONFIG = {
  SATELLITE_ANALYSIS: {
    label: "Satellite Analysis",
    icon: FiTarget,
    accent: "text-cyan-300",
    surface: "bg-cyan-400/10",
  },
  DEBRIS_ANALYSIS: {
    label: "Debris Analysis",
    icon: FiLayers,
    accent: "text-violet-300",
    surface: "bg-violet-400/10",
  },
  RISK_ASSESSMENT: {
    label: "Risk Assessment",
    icon: FiShield,
    accent: "text-amber-300",
    surface: "bg-amber-400/10",
  },
  DASHBOARD_ANALYTICS: {
    label: "Dashboard Analytics",
    icon: FiBarChart2,
    accent: "text-blue-300",
    surface: "bg-blue-400/10",
  },
  ALERT_SUMMARY: {
    label: "Alert Summary",
    icon: FiBell,
    accent: "text-rose-300",
    surface: "bg-rose-400/10",
  },
  AI_ANALYSIS: {
    label: "AI Analysis",
    icon: FiActivity,
    accent: "text-emerald-300",
    surface: "bg-emerald-400/10",
  },
};

function formatDate(value) {
  if (!value) return "Not available";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  try {
    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(date);
  } catch {
    return "Not available";
  }
}

function MetadataItem({ icon: Icon, label, value }) {
  return (
    <div className="flex min-w-0 items-start gap-3">
      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-slate-400">
        <Icon size={16} aria-hidden="true" />
      </span>

      <div className="min-w-0 flex-1">
        <p className="text-xs text-slate-500">{label}</p>

        <p className="mt-1 break-words text-sm font-medium text-slate-200">
          {value || "Not available"}
        </p>
      </div>
    </div>
  );
}

function PreviewPlaceholder({ status }) {
  const normalizedStatus = String(status || "").toUpperCase();

  const isProcessing = normalizedStatus === "PROCESSING";
  const isFailed = normalizedStatus === "FAILED";
  const isPending = normalizedStatus === "PENDING";

  let title = "PDF preview unavailable";
  let description =
    "A PDF preview cannot be displayed because a PDF source has not been provided.";

  if (isProcessing) {
    title = "Report is processing";
    description =
      "The report is being processed. Refresh its details later to check the latest status.";
  } else if (isPending) {
    title = "Report is queued";
    description =
      "This report is pending processing. Its downloadable document may not be ready yet.";
  } else if (isFailed) {
    title = "Report generation failed";
    description =
      "The report could not be generated successfully. Check its status before trying again.";
  } else if (normalizedStatus === "COMPLETED") {
    title = "PDF source unavailable";
    description =
      "The report is marked as completed, but no PDF preview source is available.";
  }

  return (
    <div className="flex min-h-[280px] flex-col items-center justify-center px-5 py-10 text-center sm:min-h-[390px]">
      <div className="relative mb-5 flex h-20 w-20 items-center justify-center rounded-2xl border border-slate-700 bg-slate-900">
        <FiFileText
          size={34}
          className="text-slate-400"
          aria-hidden="true"
        />

        <span className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-xl border border-slate-700 bg-slate-950">
          {isProcessing ? (
            <FiRefreshCw
              size={15}
              className="animate-spin text-sky-300"
              aria-hidden="true"
            />
          ) : isFailed ? (
            <FiAlertCircle
              size={16}
              className="text-rose-300"
              aria-hidden="true"
            />
          ) : isPending ? (
            <FiClock
              size={16}
              className="text-amber-300"
              aria-hidden="true"
            />
          ) : (
            <FiEye
              size={16}
              className="text-cyan-300"
              aria-hidden="true"
            />
          )}
        </span>
      </div>

      <h3 className="text-base font-semibold text-slate-100">{title}</h3>

      <p className="mt-2 max-w-md text-sm leading-6 text-slate-400">
        {description}
      </p>
    </div>
  );
}

function ReportPreview({
  report = null,
  loading = false,
  error = null,
  pdfUrl = "",
  onDownload,
  onRetry,
  onOpenPdf,
  downloading = false,
  className = "",
}) {
  const typeConfig = useMemo(() => {
    const type = String(report?.reportType || "").toUpperCase();

    return (
      REPORT_TYPE_CONFIG[type] || {
        label: type
          ? type.replace(/_/g, " ")
          : "Unknown report type",
        icon: FiFileText,
        accent: "text-slate-300",
        surface: "bg-slate-800",
      }
    );
  }, [report?.reportType]);

  const TypeIcon = typeConfig.icon;
  const normalizedStatus = String(report?.status || "").toUpperCase();

  const hasPdf = typeof pdfUrl === "string" && pdfUrl.trim().length > 0;
  const isCompleted = normalizedStatus === "COMPLETED";

  const canDownload =
    isCompleted &&
    typeof onDownload === "function" &&
    !downloading;

  const safeClassName = className || "";

  if (loading && !report) {
    return (
      <section
        className={`min-w-0 overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/80 ${safeClassName}`}
        aria-label="Loading report preview"
        aria-busy="true"
      >
        <div className="animate-pulse p-5 sm:p-6">
          <div className="h-4 w-32 rounded bg-slate-800" />
          <div className="mt-4 h-7 w-3/4 rounded bg-slate-800" />
          <div className="mt-3 h-4 w-1/2 rounded bg-slate-800" />

          <div className="mt-7 grid gap-4 sm:grid-cols-2">
            <div className="h-14 rounded-xl bg-slate-900" />
            <div className="h-14 rounded-xl bg-slate-900" />
          </div>

          <div className="mt-6 h-72 rounded-xl bg-slate-900" />
        </div>
      </section>
    );
  }

  if (!report) {
    return (
      <section
        className={`min-w-0 rounded-2xl border border-slate-800 bg-slate-950/80 p-6 text-center sm:p-8 ${safeClassName}`}
        aria-label="Report preview"
      >
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl border border-slate-800 bg-slate-900">
          <FiFileText
            size={25}
            className="text-slate-400"
            aria-hidden="true"
          />
        </div>

        <h2 className="mt-4 text-base font-semibold text-slate-100">
          No report selected
        </h2>

        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-400">
          Select a report to review its details and available document.
        </p>
      </section>
    );
  }

  const handleDownload = () => {
    if (!canDownload) return;
    onDownload(report);
  };

  const handleOpenPdf = () => {
    if (!hasPdf || !isCompleted) return;

    if (typeof onOpenPdf === "function") {
      onOpenPdf(pdfUrl, report);
      return;
    }

    // The supplied PDF URL must be trusted or created by your application.
    window.open(pdfUrl, "_blank", "noopener,noreferrer");
  };

  const reportTitle = report.title || "Untitled report";
  const reportCode = report.reportCode || "Report code unavailable";
  const description =
    typeof report.description === "string" && report.description.trim()
      ? report.description.trim()
      : "No description was provided for this report.";

  return (
    <section
      className={`min-w-0 overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/90 shadow-xl shadow-black/10 ${safeClassName}`}
      aria-label="Report preview"
      aria-busy={loading}
    >
      {/* Header */}
      <div className="border-b border-slate-800 p-4 sm:p-6">
        <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <span
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${typeConfig.surface} ${typeConfig.accent}`}
            >
              <TypeIcon size={22} aria-hidden="true" />
            </span>

            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
                Report preview
              </p>

              <h2 className="mt-1 break-words text-lg font-semibold text-white sm:text-xl">
                {reportTitle}
              </h2>

              <p className="mt-1 break-all font-mono text-xs text-slate-500">
                {reportCode}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center">
            <ReportStatusBadge
              status={report.status}
              showIcon
              showIndicator={false}
            />
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <span className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-slate-300">
            {typeConfig.label}
          </span>

          {report.updatedAt && (
            <span className="inline-flex min-w-0 items-center gap-1.5 break-words text-xs text-slate-500">
              <FiRefreshCw size={12} aria-hidden="true" />
              <span>Updated {formatDate(report.updatedAt)}</span>
            </span>
          )}
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div
          className="mx-4 mt-4 flex min-w-0 items-start gap-3 rounded-xl border border-rose-500/20 bg-rose-500/[0.06] p-3 sm:mx-6"
          role="alert"
        >
          <FiAlertCircle
            size={17}
            className="mt-0.5 shrink-0 text-rose-300"
            aria-hidden="true"
          />

          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-rose-200">
              Unable to load report information
            </p>

            <p className="mt-1 break-words text-xs leading-5 text-rose-200/70">
              {typeof error === "string"
                ? error
                : error?.message || "An unexpected error occurred."}
            </p>

            {typeof onRetry === "function" && (
              <button
                type="button"
                onClick={onRetry}
                className="mt-2 inline-flex min-h-8 items-center gap-2 rounded text-xs font-semibold text-rose-200 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300"
              >
                <FiRefreshCw size={13} aria-hidden="true" />
                Try again
              </button>
            )}
          </div>
        </div>
      )}

      {/* Metadata */}
      <div className="grid min-w-0 gap-5 border-b border-slate-800 p-4 sm:grid-cols-2 sm:p-6">
        <MetadataItem
          icon={FiFileText}
          label="Report type"
          value={typeConfig.label}
        />

        <MetadataItem
          icon={FiCalendar}
          label="Created on"
          value={formatDate(report.createdAt)}
        />

        <MetadataItem
          icon={FiRefreshCw}
          label="Last updated"
          value={formatDate(report.updatedAt)}
        />

        <MetadataItem
          icon={FiCheckCircle}
          label="Current status"
          value={normalizedStatus || "Not available"}
        />
      </div>

      {/* Description */}
      <div className="min-w-0 border-b border-slate-800 p-4 sm:p-6">
        <h3 className="text-sm font-semibold text-slate-100">
          Description
        </h3>

        <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-400">
          {description}
        </p>
      </div>

      {/* PDF preview */}
      <div className="min-w-0 p-4 sm:p-6">
        <div className="mb-4 flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-slate-100">
              Document preview
            </h3>

            <p className="mt-1 text-xs text-slate-500">
              Generated PDF document
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {hasPdf && isCompleted && (
              <button
                type="button"
                onClick={handleOpenPdf}
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:border-slate-600 hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
              >
                <FiEye size={15} aria-hidden="true" />
                Open PDF
                <FiArrowUpRight size={13} aria-hidden="true" />
              </button>
            )}

            {isCompleted && typeof onDownload === "function" && (
              <button
                type="button"
                onClick={handleDownload}
                disabled={downloading}
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-cyan-400 px-3 py-2 text-xs font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
              >
                {downloading ? (
                  <FiRefreshCw
                    size={15}
                    className="animate-spin"
                    aria-hidden="true"
                  />
                ) : (
                  <FiDownload size={15} aria-hidden="true" />
                )}

                {downloading ? "Downloading..." : "Download PDF"}
              </button>
            )}
          </div>
        </div>

        <div className="min-w-0 overflow-hidden rounded-xl border border-slate-800 bg-[#080f1c]">
          {hasPdf && isCompleted ? (
            <iframe
              title={`PDF preview: ${reportTitle}`}
              src={pdfUrl}
              className="block h-[420px] w-full border-0 sm:h-[560px] lg:h-[680px]"
              loading="lazy"
            />
          ) : (
            <PreviewPlaceholder status={report.status} />
          )}
        </div>

        {isCompleted && !hasPdf && (
          <p className="mt-3 text-xs leading-5 text-slate-500">
            This report is marked as completed, but no PDF preview source was
            provided. The parent component must supply a valid PDF URL or
            blob URL to display the document here.
          </p>
        )}
      </div>
    </section>
  );
}

export default ReportPreview;