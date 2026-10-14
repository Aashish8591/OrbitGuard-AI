import { useMemo } from "react";

import {
  FiFileText,
  FiClock,
  FiRefreshCw,
  FiCheckCircle,
  FiAlertTriangle,
} from "react-icons/fi";

/* ================================================================
   REPORT SUMMARY CONFIGURATION
================================================================ */

const REPORT_CARD_BACKGROUND = "/images/Report/reportCardbg.jpg";

const SUMMARY_CONFIG = [
  {
    key: "total",
    label: "Total Reports",
    icon: FiFileText,
    accent: "cyan",
    description: "Reports in your archive",
  },
  {
    key: "pending",
    label: "Pending",
    icon: FiClock,
    accent: "amber",
    description: "Awaiting processing",
  },
  {
    key: "processing",
    label: "Processing",
    icon: FiRefreshCw,
    accent: "blue",
    description: "Currently in progress",
  },
  {
    key: "completed",
    label: "Completed",
    icon: FiCheckCircle,
    accent: "emerald",
    description: "Successfully completed",
  },
  {
    key: "failed",
    label: "Failed",
    icon: FiAlertTriangle,
    accent: "red",
    description: "Require attention",
  },
];

const ACCENT_STYLES = {
  cyan: {
    icon: "text-cyan-200",
    iconSurface: "border-cyan-300/25 bg-cyan-400/15",
    border: "border-cyan-300/20",
    indicator: "bg-cyan-300",
    value: "text-white",
    glow: "from-cyan-400/[0.14]",
  },
  amber: {
    icon: "text-amber-200",
    iconSurface: "border-amber-300/25 bg-amber-400/15",
    border: "border-amber-300/20",
    indicator: "bg-amber-300",
    value: "text-amber-100",
    glow: "from-amber-400/[0.12]",
  },
  blue: {
    icon: "text-sky-200",
    iconSurface: "border-sky-300/25 bg-sky-400/15",
    border: "border-sky-300/20",
    indicator: "bg-sky-300",
    value: "text-sky-100",
    glow: "from-sky-400/[0.13]",
  },
  emerald: {
    icon: "text-emerald-200",
    iconSurface: "border-emerald-300/25 bg-emerald-400/15",
    border: "border-emerald-300/20",
    indicator: "bg-emerald-300",
    value: "text-emerald-100",
    glow: "from-emerald-400/[0.12]",
  },
  red: {
    icon: "text-red-200",
    iconSurface: "border-red-300/25 bg-red-400/15",
    border: "border-red-300/20",
    indicator: "bg-red-300",
    value: "text-red-100",
    glow: "from-red-400/[0.13]",
  },
};

/* ================================================================
   HELPERS
================================================================ */

function normalizeStatus(status) {
  return String(status ?? "")
    .trim()
    .toUpperCase();
}

function getReportsArray(reports) {
  if (Array.isArray(reports)) {
    return reports;
  }

  if (Array.isArray(reports?.data)) {
    return reports.data;
  }

  if (Array.isArray(reports?.data?.data)) {
    return reports.data.data;
  }

  if (Array.isArray(reports?.content)) {
    return reports.content;
  }

  if (Array.isArray(reports?.data?.content)) {
    return reports.data.content;
  }

  return [];
}

function normalizeCount(value, fallback = 0) {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  const number = Number(value);

  return Number.isFinite(number) && number >= 0 ? Math.floor(number) : fallback;
}

function calculateSummary(reports) {
  return reports.reduce(
    (summary, report) => {
      if (!report || typeof report !== "object" || Array.isArray(report)) {
        return summary;
      }

      summary.total += 1;

      switch (normalizeStatus(report.status)) {
        case "PENDING":
          summary.pending += 1;
          break;

        case "PROCESSING":
          summary.processing += 1;
          break;

        case "COMPLETED":
          summary.completed += 1;
          break;

        case "FAILED":
          summary.failed += 1;
          break;

        default:
          // The report is included in total but not in a known
          // status category.
          break;
      }

      return summary;
    },
    {
      total: 0,
      pending: 0,
      processing: 0,
      completed: 0,
      failed: 0,
    },
  );
}

function getErrorMessage(error) {
  if (typeof error === "string") {
    return error.trim() || "An unexpected error occurred.";
  }

  if (error instanceof Error) {
    return error.message || "An unexpected error occurred.";
  }

  if (error && typeof error.message === "string") {
    return error.message || "An unexpected error occurred.";
  }

  return "An unexpected error occurred while loading the report summary.";
}

/* ================================================================
   SUMMARY CARD
================================================================ */

function SummaryCard({ config, value }) {
  const Icon = config.icon;
  const styles = ACCENT_STYLES[config.accent];

  return (
    <article
      aria-label={`${config.label}: ${value.toLocaleString("en-IN")}`}
      className={[
        "group relative isolate flex h-full min-w-0 flex-col",
        "overflow-hidden rounded-xl border",
        styles.border,
        "bg-[#071321] p-3",
        "transition-[border-color,box-shadow] duration-300",
        "hover:border-white/25",
        "hover:shadow-[0_10px_25px_rgba(0,0,0,0.25)]",
        "sm:rounded-2xl sm:p-4 lg:p-5",
      ].join(" ")}
    >
      {/* Background image */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-20 bg-[#071321] bg-cover bg-center"
        style={{
          backgroundImage: `url("${REPORT_CARD_BACKGROUND}")`,
        }}
      />

      {/* Dark overlay */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-[#06111F]/75 via-[#06111F]/85 to-[#020711]/95"
      />

      {/* Accent glow */}
      <div
        aria-hidden="true"
        className={[
          "pointer-events-none absolute inset-0 -z-10",
          "bg-gradient-to-br",
          styles.glow,
          "via-transparent to-transparent opacity-70",
          "transition-opacity duration-300 group-hover:opacity-100",
          "motion-reduce:transition-none",
        ].join(" ")}
      />

      {/* Card heading and icon */}
      <div className="relative flex min-w-0 items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="truncate text-[11px] font-medium leading-4 tracking-wide text-slate-300 sm:text-xs sm:leading-5 lg:text-sm">
            {config.label}
          </p>

          <p
            className={[
              "mt-1.5 text-2xl font-semibold leading-none",
              "tracking-tight tabular-nums",
              styles.value,
              "sm:mt-2 sm:text-3xl lg:text-[2rem]",
            ].join(" ")}
          >
            {value.toLocaleString("en-IN")}
          </p>
        </div>

        <div
          className={[
            "flex h-8 w-8 shrink-0 items-center justify-center",
            "rounded-lg border",
            styles.iconSurface,
            "sm:h-10 sm:w-10 sm:rounded-xl lg:h-12 lg:w-12",
          ].join(" ")}
        >
          <Icon
            aria-hidden="true"
            className={`h-4 w-4 ${styles.icon} sm:h-5 sm:w-5 lg:h-[22px] lg:w-[22px]`}
            strokeWidth={1.8}
          />
        </div>
      </div>

      {/* Description */}
      <div className="relative mt-3 flex min-w-0 items-center gap-1.5 border-t border-white/10 pt-2.5 sm:mt-4 sm:gap-2 sm:pt-3">
        <span
          aria-hidden="true"
          className={`h-1.5 w-1.5 shrink-0 rounded-full ${styles.indicator}`}
        />

        <p className="truncate text-[9px] leading-4 text-slate-300 sm:text-[11px] lg:text-xs">
          {config.description}
        </p>
      </div>
    </article>
  );
}

/* ================================================================
   LOADING CARD
================================================================ */

function SummaryCardSkeleton({ label }) {
  return (
    <div
      role="status"
      aria-label={`Loading ${label}`}
      className={[
        "relative h-[104px] overflow-hidden rounded-xl",
        "border border-white/[0.07] bg-[#071321] p-3",
        "sm:h-[120px] sm:rounded-2xl sm:p-4",
        "lg:h-[132px] lg:p-5",
      ].join(" ")}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-br from-white/[0.04] to-transparent"
      />

      <div className="relative">
        <div className="h-3 w-20 max-w-full rounded bg-white/10" />

        <div className="mt-3 h-7 w-12 rounded bg-white/10 sm:mt-4 sm:h-8" />

        <div className="mt-3 h-2 w-24 max-w-full rounded bg-white/[0.06]" />
      </div>
    </div>
  );
}

/* ================================================================
   REPORT SUMMARY CARDS
================================================================ */

function ReportSummaryCards({
  reports = [],
  summary = null,
  loading = false,
  error = null,
}) {
  const reportList = useMemo(() => getReportsArray(reports), [reports]);

  const calculatedSummary = useMemo(
    () => calculateSummary(reportList),
    [reportList],
  );

  const values = useMemo(() => {
    const suppliedSummary =
      summary && typeof summary === "object" ? summary : {};

    return {
      total: normalizeCount(suppliedSummary.total, calculatedSummary.total),
      pending: normalizeCount(
        suppliedSummary.pending,
        calculatedSummary.pending,
      ),
      processing: normalizeCount(
        suppliedSummary.processing,
        calculatedSummary.processing,
      ),
      completed: normalizeCount(
        suppliedSummary.completed,
        calculatedSummary.completed,
      ),
      failed: normalizeCount(suppliedSummary.failed, calculatedSummary.failed),
    };
  }, [summary, calculatedSummary]);

  if (error) {
    return (
      <section
        aria-label="Report summary"
        className="rounded-xl border border-red-400/20 bg-red-400/[0.05] p-3 sm:rounded-2xl sm:p-5"
      >
        <div className="flex items-start gap-3">
          <FiAlertTriangle
            aria-hidden="true"
            className="mt-0.5 h-5 w-5 shrink-0 text-red-300"
          />

          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-red-200">
              Report summary unavailable
            </h2>

            <p className="mt-1 break-words text-sm leading-6 text-slate-400">
              {getErrorMessage(error)}
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section aria-label="Report summary" aria-busy={loading} className="w-full">
      <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-3 xl:grid-cols-5 xl:gap-4">
        {SUMMARY_CONFIG.map((config) => (
          <div
            key={config.key}
            className={`min-w-0 ${
              config.key === "failed" ? "hidden md:block" : ""
            }`}
          >
            {loading ? (
              <SummaryCardSkeleton label={config.label} />
            ) : (
              <SummaryCard config={config} value={values[config.key]} />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

export default ReportSummaryCards;
