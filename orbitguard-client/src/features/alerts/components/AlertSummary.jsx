import { motion, useReducedMotion } from "framer-motion";
import {
  FiAlertCircle,
  FiAlertTriangle,
  FiCheckCircle,
  FiClock,
  FiActivity,
  FiArrowUpRight,
} from "react-icons/fi";

const SUMMARY_ITEMS = [
  {
    key: "pending",
    label: "Pending",
    description: "Awaiting review",
    icon: FiClock,
    accent: "amber",
    statuses: ["PENDING"],
  },
  {
    key: "acknowledged",
    label: "Acknowledged",
    description: "Under investigation",
    icon: FiActivity,
    accent: "cyan",
    statuses: ["ACKNOWLEDGED"],
  },
  {
    key: "resolved",
    label: "Resolved",
    description: "Issue addressed",
    icon: FiCheckCircle,
    accent: "emerald",
    statuses: ["RESOLVED"],
  },
  {
    key: "critical",
    label: "Critical",
    description: "Requires attention",
    icon: FiAlertTriangle,
    accent: "rose",
    severity: "CRITICAL",
  },
];

const ACCENT_STYLES = {
  amber: {
    icon: "border-amber-400/15 bg-amber-400/[0.08] text-amber-300",
    indicator: "bg-amber-300",
    value: "text-amber-200",
    hover: "hover:border-amber-300/25",
    focus: "focus-visible:ring-amber-300/60",
  },
  cyan: {
    icon: "border-cyan-400/15 bg-cyan-400/[0.08] text-cyan-300",
    indicator: "bg-cyan-300",
    value: "text-cyan-200",
    hover: "hover:border-cyan-300/25",
    focus: "focus-visible:ring-cyan-300/60",
  },
  emerald: {
    icon: "border-emerald-400/15 bg-emerald-400/[0.08] text-emerald-300",
    indicator: "bg-emerald-300",
    value: "text-emerald-200",
    hover: "hover:border-emerald-300/25",
    focus: "focus-visible:ring-emerald-300/60",
  },
  rose: {
    icon: "border-rose-400/15 bg-rose-400/[0.08] text-rose-300",
    indicator: "bg-rose-300",
    value: "text-rose-200",
    hover: "hover:border-rose-300/25",
    focus: "focus-visible:ring-rose-300/60",
  },
};

const isValidCount = (value) =>
  typeof value === "number" &&
  Number.isFinite(value) &&
  value >= 0;

const formatCount = (value) =>
  new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  }).format(value);

function normalizeStatus(value) {
  return typeof value === "string" ? value.trim().toUpperCase() : "";
}

function normalizeSeverity(value) {
  return typeof value === "string" ? value.trim().toUpperCase() : "";
}

/**
 * Derive summary counts from a complete collection of alerts.
 *
 * Pass alerts only when they represent the complete collection.
 * Do not use the current page of a paginated response to calculate
 * global totals.
 */
function deriveSummary(alerts) {
  return alerts.reduce(
    (summary, alert) => {
      const status = normalizeStatus(alert?.status);
      const severity = normalizeSeverity(alert?.severity);

      if (status === "PENDING") summary.pending += 1;

      if (status === "ACKNOWLEDGED") summary.acknowledged += 1;

      if (status === "RESOLVED") summary.resolved += 1;

      if (severity === "CRITICAL") summary.critical += 1;

      return summary;
    },
    {
      pending: 0,
      acknowledged: 0,
      resolved: 0,
      critical: 0,
    }
  );
}

/**
 * OrbitGuard AI — Alert Summary
 *
 * @param {Object} props
 * @param {Array<Object>} [props.alerts] Complete alert collection.
 * @param {Object|null} [props.summary] Backend-derived summary counts.
 * @param {boolean} [props.isLoading=false] Loading state.
 * @param {string|null} [props.error=null] Summary error message.
 * @param {string|null} [props.activeFilter=null] Selected summary filter.
 * @param {Function} [props.onSelectFilter] Optional filter callback.
 *
 * Precedence:
 * 1. Backend-derived summary
 * 2. Complete alert collection
 * 3. Unavailable values
 */
export default function AlertSummary({
  alerts,
  summary,
  isLoading = false,
  error = null,
  activeFilter = null,
  onSelectFilter,
}) {
  const shouldReduceMotion = useReducedMotion();

  const hasBackendSummary =
    summary !== null &&
    typeof summary === "object" &&
    !Array.isArray(summary);

  const hasCompleteCollection = Array.isArray(alerts);

  const derivedSummary = hasCompleteCollection
    ? deriveSummary(alerts)
    : null;

  const values = hasBackendSummary
    ? summary
    : derivedSummary;

  const getCount = (key) => {
    if (!values || !isValidCount(values[key])) return null;
    return values[key];
  };

  const unavailable = !values || Boolean(error);

  return (
    <section
      aria-labelledby="alert-summary-heading"
      aria-busy={isLoading}
      className="mb-6"
    >
      <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2
            id="alert-summary-heading"
            className="font-[Orbitron] text-sm font-semibold tracking-wide text-slate-100 sm:text-base"
          >
            Operational Overview
          </h2>

          <p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm">
            Current alert workload and priority signals.
          </p>
        </div>

        <div className="inline-flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.14em] text-slate-500 sm:text-[11px]">
          <FiActivity aria-hidden="true" className="h-3.5 w-3.5" />
          Alert telemetry
        </div>
      </div>

      {error ? (
        <div
          role="status"
          className="rounded-xl border border-rose-400/15 bg-rose-400/[0.04] px-4 py-3 text-sm text-rose-200"
        >
          Unable to load the alert summary. {error}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          {SUMMARY_ITEMS.map((item, index) => {
            const Icon = item.icon;
            const accent = ACCENT_STYLES[item.accent];
            const count = getCount(item.key);
            const isActive =
              activeFilter?.toUpperCase() === item.key.toUpperCase();

            const isInteractive = typeof onSelectFilter === "function";

            const handleSelect = () => {
              if (isInteractive) onSelectFilter(item.key);
            };

            const cardClasses = [
              "group relative min-w-0 overflow-hidden rounded-xl border bg-[#07111f] p-3.5 text-left transition-colors duration-200 sm:p-4",
              "border-white/[0.07]",
              accent.hover,
              isActive
                ? "border-cyan-300/30 bg-cyan-300/[0.05]"
                : "",
              isInteractive
                ? `cursor-pointer focus-visible:outline-none focus-visible:ring-2 ${accent.focus} focus-visible:ring-offset-2 focus-visible:ring-offset-[#020914]`
                : "",
            ]
              .filter(Boolean)
              .join(" ");

            const content = (
              <>
                <div className="flex items-start justify-between gap-2">
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border sm:h-10 sm:w-10 ${accent.icon}`}
                  >
                    <Icon
                      aria-hidden="true"
                      className="h-[18px] w-[18px]"
                    />
                  </div>

                  {isInteractive ? (
                    <FiArrowUpRight
                      aria-hidden="true"
                      className={`h-4 w-4 shrink-0 text-slate-600 transition-colors group-hover:text-slate-300 ${
                        isActive ? "text-cyan-300" : ""
                      }`}
                    />
                  ) : (
                    <span
                      aria-hidden="true"
                      className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${accent.indicator}`}
                    />
                  )}
                </div>

                <div className="mt-4">
                  <p className="text-xs font-medium text-slate-400 sm:text-sm">
                    {item.label}
                  </p>

                  <div className="mt-1 flex items-baseline gap-2">
                    <span
                      className={`font-[Orbitron] text-2xl font-semibold tabular-nums tracking-tight sm:text-3xl ${
                        count === null ? "text-slate-500" : accent.value
                      }`}
                    >
                      {isLoading || count === null
                        ? "—"
                        : formatCount(count)}
                    </span>
                  </div>

                  <p className="mt-1.5 text-[10px] leading-4 text-slate-500 sm:text-xs">
                    {item.description}
                  </p>
                </div>

                {isActive && (
                  <div
                    aria-hidden="true"
                    className="absolute inset-x-0 bottom-0 h-0.5 bg-cyan-300/70"
                  />
                )}
              </>
            );

            return (
              <motion.div
                key={item.key}
                initial={
                  shouldReduceMotion
                    ? false
                    : { opacity: 0, y: 8 }
                }
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: shouldReduceMotion ? 0 : 0.25,
                  delay: shouldReduceMotion ? 0 : index * 0.045,
                }}
              >
                {isInteractive ? (
                  <button
                    type="button"
                    className={cardClasses}
                    onClick={handleSelect}
                    aria-pressed={isActive}
                    aria-label={`Filter alerts by ${item.label.toLowerCase()}`}
                    disabled={isLoading || unavailable}
                  >
                    {content}
                  </button>
                ) : (
                  <div className={cardClasses}>{content}</div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {!error && !isLoading && unavailable && (
        <p className="mt-2 text-xs text-slate-500">
          Summary values will appear when alert data is available.
        </p>
      )}
    </section>
  );
}