import { useEffect, useId, useRef } from "react";
import {
  FiX,
  FiFileText,
  FiHash,
  FiCalendar,
  FiClock,
  FiDownload,
  FiTrash2,
  FiAlertCircle,
  FiRefreshCw,
  FiSatellite,
  FiGitBranch,
  FiShield,
  FiBarChart2,
  FiBell,
  FiCpu,
  FiFile,
  FiExternalLink,
} from "react-icons/fi";

import ReportStatusBadge from "./ReportStatusBadge";

/* ================================================================
   REPORT TYPE CONFIGURATION
   ================================================================ */

const REPORT_TYPE_CONFIG = {
  SATELLITE_ANALYSIS: {
    label: "Satellite Analysis",
    icon: FiSatellite,
  },
  DEBRIS_ANALYSIS: {
    label: "Debris Analysis",
    icon: FiGitBranch,
  },
  RISK_ASSESSMENT: {
    label: "Risk Assessment",
    icon: FiShield,
  },
  DASHBOARD_ANALYTICS: {
    label: "Dashboard Analytics",
    icon: FiBarChart2,
  },
  ALERT_SUMMARY: {
    label: "Alert Summary",
    icon: FiBell,
  },
  AI_ANALYSIS: {
    label: "AI Analysis",
    icon: FiCpu,
  },
};

/* ================================================================
   HELPERS
   ================================================================ */

function formatReportType(type) {
  return String(type ?? "Unknown")
    .trim()
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function formatDate(value) {
  if (!value) return "Not available";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(date);
}

function getReportCode(report) {
  return report?.reportCode ?? report?.id ?? "Not available";
}

/* ================================================================
   METADATA ITEM
   ================================================================ */

function MetadataItem({ icon: Icon, label, value, mono = false }) {
  return (
    <div className="flex min-w-0 items-start gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3.5">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-cyan-300/10 bg-cyan-400/[0.05]">
        <Icon
          aria-hidden="true"
          className="h-4 w-4 text-cyan-300"
        />
      </span>

      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
          {label}
        </p>

        <p
          className={`
            mt-1 break-words text-sm text-slate-200
            ${mono ? "font-mono text-xs sm:text-sm" : ""}
          `}
        >
          {value || "Not available"}
        </p>
      </div>
    </div>
  );
}

/* ================================================================
   ACTION BUTTON
   ================================================================ */

function ModalActionButton({
  children,
  icon: Icon,
  onClick,
  disabled = false,
  variant = "secondary",
  type = "button",
}) {
  const styles = {
    primary:
      "border-transparent bg-gradient-to-r from-cyan-400 to-sky-400 text-[#04111D] hover:from-cyan-300 hover:to-sky-300",
    secondary:
      "border-white/10 bg-white/[0.025] text-slate-300 hover:border-cyan-300/30 hover:bg-cyan-400/[0.06] hover:text-white",
    danger:
      "border-red-400/20 bg-red-400/[0.05] text-red-200 hover:border-red-400/40 hover:bg-red-400/10",
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`
        inline-flex min-h-10 items-center justify-center gap-2
        rounded-xl border px-4 py-2.5
        text-sm font-medium transition-colors
        focus-visible:outline-none focus-visible:ring-2
        focus-visible:ring-cyan-300/70
        disabled:cursor-not-allowed disabled:opacity-50
        ${styles[variant]}
      `}
    >
      {Icon && (
        <Icon
          aria-hidden="true"
          className={`h-4 w-4 shrink-0 ${
            disabled && Icon === FiRefreshCw ? "animate-spin" : ""
          }`}
        />
      )}

      {children}
    </button>
  );
}

/* ================================================================
   REPORT DETAILS MODAL
   ================================================================ */

/**
 * Props:
 *
 * open: boolean
 * report: ReportResponse | null
 * onClose: () => void
 * onDownload: (report) => void | Promise<void>
 * downloading: boolean
 * downloadError: string | null
 * onDelete: (report) => void
 * deleting: boolean
 */
function ReportDetailsModal({
  open,
  report,
  onClose,
  onDownload,
  downloading = false,
  downloadError = null,
  onDelete,
  deleting = false,
}) {
  const dialogTitleId = useId();
  const dialogDescriptionId = useId();
  const closeButtonRef = useRef(null);

  /* ==============================================================
     BODY SCROLL AND KEYBOARD
     ============================================================== */

  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const frame = requestAnimationFrame(() => {
      closeButtonRef.current?.focus();
    });

    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !downloading && !deleting) {
        onClose?.();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      cancelAnimationFrame(frame);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, downloading, deleting, onClose]);

  if (!open || !report) return null;

  const reportType =
    REPORT_TYPE_CONFIG[String(report.reportType ?? "").toUpperCase()];

  const TypeIcon = reportType?.icon ?? FiFileText;
  const typeLabel =
    reportType?.label ?? formatReportType(report.reportType);

  const reportCode = getReportCode(report);

  const handleClose = () => {
    if (downloading || deleting) return;
    onClose?.();
  };

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) {
      handleClose();
    }
  };

  const handleDownload = () => {
    if (downloading) return;
    onDownload?.(report);
  };

  const handleDelete = () => {
    if (deleting || !onDelete) return;
    onDelete(report);
  };

  return (
    <div
      className="
        fixed inset-0 z-[100]
        flex items-center justify-center
        overflow-y-auto overscroll-contain
        bg-[#020611]/80 p-3 backdrop-blur-md
        sm:p-5
      "
      onMouseDown={handleBackdropClick}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={dialogTitleId}
        aria-describedby={dialogDescriptionId}
        className="
          relative my-auto flex max-h-[calc(100dvh-24px)]
          w-full max-w-3xl flex-col overflow-hidden
          rounded-2xl border border-cyan-300/15
          bg-[#07111F]
          shadow-[0_24px_100px_rgba(0,0,0,0.65)]
          sm:max-h-[calc(100dvh-40px)] sm:rounded-3xl
        "
      >
        {/* ======================================================
            HEADER
            ====================================================== */}

        <header className="relative shrink-0 border-b border-white/[0.07] px-4 py-4 sm:px-7 sm:py-5">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/60 to-transparent"
          />

          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-cyan-300/20 bg-cyan-400/[0.08]">
              <TypeIcon
                aria-hidden="true"
                className="h-5 w-5 text-cyan-200"
              />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-300/80">
                ORBITGUARD AI / REPORT DOSSIER
              </p>

              <h2
                id={dialogTitleId}
                className="mt-1 break-words text-lg font-semibold tracking-tight text-white sm:text-xl"
              >
                {report.title || "Untitled report"}
              </h2>

              <p
                id={dialogDescriptionId}
                className="mt-1 break-all font-mono text-xs text-slate-500"
              >
                {reportCode}
              </p>
            </div>

            <button
              ref={closeButtonRef}
              type="button"
              onClick={handleClose}
              disabled={downloading || deleting}
              aria-label="Close report details"
              className="
                flex h-9 w-9 shrink-0 items-center justify-center
                rounded-xl border border-white/[0.08]
                text-slate-400 transition-colors
                hover:border-white/20 hover:bg-white/[0.05]
                hover:text-white disabled:opacity-40
              "
            >
              <FiX aria-hidden="true" className="h-4 w-4" />
            </button>
          </div>
        </header>

        {/* ======================================================
            SCROLLABLE CONTENT
            ====================================================== */}

        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto overscroll-contain px-4 py-5 sm:px-7 sm:py-6">
          {/* Status and type */}
          <section>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              Current report state
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-3">
              <ReportStatusBadge
                status={report.status}
                showIcon
              />

              <span className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.025] px-3 py-1.5 text-xs text-slate-400">
                <TypeIcon
                  aria-hidden="true"
                  className="h-3.5 w-3.5 text-cyan-300"
                />
                {typeLabel}
              </span>
            </div>
          </section>

          {/* Description */}
          <section>
            <h3 className="text-sm font-semibold text-slate-100">
              Report description
            </h3>

            <div className="mt-3 rounded-xl border border-white/[0.07] bg-[#040C17]/80 p-4">
              <p className="whitespace-pre-wrap break-words text-sm leading-6 text-slate-400">
                {report.description?.trim() ||
                  "No description was provided for this report."}
              </p>
            </div>
          </section>

          {/* Metadata */}
          <section>
            <h3 className="text-sm font-semibold text-slate-100">
              Report metadata
            </h3>

            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <MetadataItem
                icon={FiHash}
                label="Report code"
                value={reportCode}
                mono
              />

              <MetadataItem
                icon={FiFile}
                label="Report type"
                value={typeLabel}
              />

              <MetadataItem
                icon={FiCalendar}
                label="Created at"
                value={formatDate(report.createdAt)}
              />

              <MetadataItem
                icon={FiClock}
                label="Last updated"
                value={formatDate(report.updatedAt)}
              />
            </div>
          </section>

          {/* PDF information */}
          <section className="rounded-xl border border-cyan-300/10 bg-gradient-to-br from-cyan-400/[0.055] to-transparent p-4">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-300/15 bg-cyan-400/[0.07]">
                <FiFileText
                  aria-hidden="true"
                  className="h-5 w-5 text-cyan-200"
                />
              </span>

              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold text-slate-100">
                  PDF report
                </h3>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Download the generated PDF document for this report.
                  Availability depends on the backend response.
                </p>
              </div>
            </div>

            {downloadError && (
              <p
                role="alert"
                className="mt-3 flex items-start gap-2 text-xs leading-5 text-red-300"
              >
                <FiAlertCircle
                  aria-hidden="true"
                  className="mt-0.5 h-4 w-4 shrink-0"
                />
                <span className="break-words">{downloadError}</span>
              </p>
            )}

            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <ModalActionButton
                icon={downloading ? FiRefreshCw : FiDownload}
                onClick={handleDownload}
                disabled={downloading || deleting}
                variant="primary"
              >
                {downloading ? "Preparing PDF..." : "Download PDF"}
              </ModalActionButton>
            </div>
          </section>
        </div>

        {/* ======================================================
            FOOTER
            ====================================================== */}

        <footer className="flex shrink-0 flex-col-reverse gap-3 border-t border-white/[0.07] bg-[#060E19] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
          <p className="text-[11px] leading-5 text-slate-500">
            Report information is shown as returned by the backend.
          </p>

          <div className="flex flex-col-reverse gap-2 sm:flex-row">
            {onDelete && (
              <ModalActionButton
                icon={FiTrash2}
                onClick={handleDelete}
                disabled={deleting || downloading}
                variant="danger"
              >
                {deleting ? "Deleting..." : "Delete report"}
              </ModalActionButton>
            )}

            <ModalActionButton
              onClick={handleClose}
              disabled={downloading || deleting}
            >
              Close
            </ModalActionButton>
          </div>
        </footer>
      </section>
    </div>
  );
}

export default ReportDetailsModal;