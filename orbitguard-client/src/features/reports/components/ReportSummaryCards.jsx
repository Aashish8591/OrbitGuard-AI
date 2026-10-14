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
    icon: "text-cyan-300",
    iconSurface: "border-cyan-400/20 bg-cyan-400/[0.09]",
    glow: "from-cyan-400/10",
    border: "border-cyan-400/15",
    indicator: "bg-cyan-300",
    value: "text-white",
  },
  amber: {
    icon: "text-amber-300",
    iconSurface: "border-amber-400/20 bg-amber-400/[0.09]",
    glow: "from-amber-400/[0.09]",
    border: "border-amber-400/15",
    indicator: "bg-amber-300",
    value: "text-amber-100",
  },
  blue: {
    icon: "text-sky-300",
    iconSurface: "border-sky-400/20 bg-sky-400/[0.09]",
    glow: "from-sky-400/[0.09]",
    border: "border-sky-400/15",
    indicator: "bg-sky-300",
    value: "text-sky-100",
  },
  emerald: {
    icon: "text-emerald-300",
    iconSurface: "border-emerald-400/20 bg-emerald-400/[0.09]",
    glow: "from-emerald-400/[0.09]",
    border: "border-emerald-400/15",
    indicator: "bg-emerald-300",
    value: "text-emerald-100",
  },
  red: {
    icon: "text-red-300",
    iconSurface: "border-red-400/20 bg-red-400/[0.09]",
    glow: "from-red-400/[0.09]",
    border: "border-red-400/15",
    indicator: "bg-red-300",
    value: "text-red-100",
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

/**
 * Accepts either:
 * - An array of report objects
 * - An object containing a reports array
 *
 * The parent should pass the actual report list returned by the API.
 */
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

  return [];
}

function calculateSummary(reports) {
  return reports.reduce(
    (summary, report) => {
      summary.total += 1;

      switch (normalizeStatus(report?.status)) {
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
          // Unknown statuses count toward the total only.
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
    }
  );
}

/* ================================================================
   SUMMARY CARD
   ================================================================ */

function SummaryCard({ config, value }) {
  const Icon = config.icon;
  const styles = ACCENT_STYLES[config.accent];

  return (
    <article
      className={`
        group relative isolate min-w-0 overflow-hidden
        rounded-2xl border ${styles.border}
        bg-[#071321]/90
        p-4 sm:p-5
        transition-all duration-300
        hover:-translate-y-0.5
        hover:border-white/15
        hover:bg-[#0A1929]
        hover:shadow-[0_12px_35px_rgba(0,0,0,0.2)]
      `}
      aria-label={`${config.label}: ${value}`}
    >
      {/* Restrained atmospheric highlight */}
      <div
        aria-hidden="true"
        className={`
          pointer-events-none absolute inset-0 -z-10
          bg-gradient-to-br ${styles.glow}
          via-transparent to-transparent
          opacity-80 transition-opacity duration-300
          group-hover:opacity-100
        `}
      />

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium tracking-wide text-slate-400 sm:text-sm">
            {config.label}
          </p>

          <p
            className={`
              mt-2 text-3xl font-semibold tracking-tight
              tabular-nums ${styles.value}
              sm:text-[2rem]
            `}
          >
            {value.toLocaleString()}
          </p>
        </div>

        <div
          className={`
            flex h-11 w-11 shrink-0 items-center justify-center
            rounded-xl border ${styles.iconSurface}
            transition-transform duration-300
            group-hover:scale-105
            sm:h-12 sm:w-12
          `}
        >
          <Icon
            aria-hidden="true"
            className={`h-5 w-5 sm:h-[22px] sm:w-[22px] ${styles.icon}`}
            strokeWidth={1.8}
          />
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 border-t border-white/[0.06] pt-3">
        <span
          aria-hidden="true"
          className={`h-1.5 w-1.5 shrink-0 rounded-full ${styles.indicator}`}
        />

        <p className="truncate text-[11px] leading-5 text-slate-500 sm:text-xs">
          {config.description}
        </p>
      </div>
    </article>
  );
}

/* ================================================================
   REPORT SUMMARY CARDS
   ================================================================ */

/**
 * @param {Object} props
 * @param {Array|Object} props.reports Report list from the existing API.
 * @param {Object|null} props.summary Optional server-calculated summary.
 * @param {boolean} props.loading Whether the report list is loading.
 * @param {string|null} props.error Error message to display, if any.
 */
function ReportSummaryCards({
  reports = [],
  summary,
  loading = false,
  error = null,
}) {
  const reportList = useMemo(
    () => getReportsArray(reports),
    [reports]
  );

  const calculatedSummary = useMemo(
    () => calculateSummary(reportList),
    [reportList]
  );

  /*
   * Use a server-provided summary only when the parent has a
   * genuine summary endpoint. Otherwise calculate from loaded reports.
   *
   * This avoids presenting invented totals as authoritative.
   */
  const values = useMemo(() => {
    if (!summary) {
      return calculatedSummary;
    }

    return {
      total: Number(summary.total ?? calculatedSummary.total),
      pending: Number(summary.pending ?? calculatedSummary.pending),
      processing: Number(
        summary.processing ?? calculatedSummary.processing
      ),
      completed: Number(
        summary.completed ?? calculatedSummary.completed
      ),
      failed: Number(summary.failed ?? calculatedSummary.failed),
    };
  }, [summary, calculatedSummary]);

  if (error) {
    return (
      <section
        aria-label="Report summary"
        className="rounded-2xl border border-red-400/20 bg-red-400/[0.05] p-4 sm:p-5"
      >
        <div className="flex items-start gap-3">
          <FiAlertTriangle
            aria-hidden="true"
            className="mt-0.5 h-5 w-5 shrink-0 text-red-300"
          />

          <div>
            <h2 className="text-sm font-semibold text-red-200">
              Report summary unavailable
            </h2>

            <p className="mt-1 text-sm leading-6 text-slate-400">
              {error}
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      aria-label="Report summary"
      aria-busy={loading}
      className="w-full"
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5 sm:gap-4">
        {SUMMARY_CONFIG.map((config) => (
          <div key={config.key} className="min-w-0">
            {loading ? (
              <div
                aria-label={`Loading ${config.label}`}
                className="
                  h-[132px] animate-pulse rounded-2xl
                  border border-white/[0.07]
                  bg-white/[0.035] p-4 sm:p-5
                "
              >
                <div className="h-3 w-24 rounded bg-white/10" />
                <div className="mt-4 h-8 w-16 rounded bg-white/10" />
                <div className="mt-4 h-2 w-32 max-w-full rounded bg-white/[0.06]" />
              </div>
            ) : (
              <SummaryCard
                config={config}
                value={values[config.key]}
              />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

export default ReportSummaryCards;
