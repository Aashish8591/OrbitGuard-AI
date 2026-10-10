import { motion, useReducedMotion } from "framer-motion";
import {
  FiActivity,
  FiAlertTriangle,
  FiArrowUpRight,
  FiCheckCircle,
  FiClock,
} from "react-icons/fi";

const SUMMARY_ITEMS = [
  {
    key: "pending",
    label: "Pending",
    description: "Awaiting review",
    icon: FiClock,
    accent: "amber",
  },
  {
    key: "acknowledged",
    label: "Acknowledged",
    description: "Under investigation",
    icon: FiActivity,
    accent: "cyan",
  },
  {
    key: "resolved",
    label: "Resolved",
    description: "Issue addressed",
    icon: FiCheckCircle,
    accent: "emerald",
  },
  {
    key: "critical",
    label: "Critical",
    description: "Requires attention",
    icon: FiAlertTriangle,
    accent: "rose",
  },
];

const ACCENT_STYLES = {
  amber: {
    icon: "border-amber-400/20 bg-amber-400/10 text-amber-300",
    value: "text-amber-200",
    glow: "bg-amber-300",
    hover: "hover:border-amber-300/30",
    focus: "focus-visible:ring-amber-300/60",
    active: "border-amber-300/40",
  },
  cyan: {
    icon: "border-cyan-400/20 bg-cyan-400/10 text-cyan-300",
    value: "text-cyan-200",
    glow: "bg-cyan-300",
    hover: "hover:border-cyan-300/30",
    focus: "focus-visible:ring-cyan-300/60",
    active: "border-cyan-300/40",
  },
  emerald: {
    icon: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
    value: "text-emerald-200",
    glow: "bg-emerald-300",
    hover: "hover:border-emerald-300/30",
    focus: "focus-visible:ring-emerald-300/60",
    active: "border-emerald-300/40",
  },
  rose: {
    icon: "border-rose-400/20 bg-rose-400/10 text-rose-300",
    value: "text-rose-200",
    glow: "bg-rose-300",
    hover: "hover:border-rose-300/30",
    focus: "focus-visible:ring-rose-300/60",
    active: "border-rose-300/40",
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
  return String(value ?? "").trim().toUpperCase();
}

function deriveSummary(alerts) {
  return alerts.reduce(
    (result, alert) => {
      const status = normalizeStatus(alert?.status);
      const severity = normalizeStatus(alert?.severity);

      if (status === "PENDING") result.pending += 1;
      if (status === "ACKNOWLEDGED") result.acknowledged += 1;

      if (status === "RESOLVED" || status === "CLOSED") {
        result.resolved += 1;
      }

      if (severity === "CRITICAL") result.critical += 1;

      return result;
    },
    {
      pending: 0,
      acknowledged: 0,
      resolved: 0,
      critical: 0,
    }
  );
}

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

  const derivedSummary = Array.isArray(alerts)
    ? deriveSummary(alerts)
    : null;

  const values = hasBackendSummary ? summary : derivedSummary;

  const getCount = (key) => {
    if (!values || !isValidCount(values[key])) return null;
    return values[key];
  };

  const isInteractive = typeof onSelectFilter === "function";

  const isActive = (key) => {
    const current = normalizeStatus(activeFilter);

    if (key === "critical") return false;

    return current === normalizeStatus(key);
  };

  const handleSelect = (key) => {
    if (!isInteractive) return;

    // Critical is a severity filter, not a workflow status.
    if (key === "critical") {
      onSelectFilter("CRITICAL");
      return;
    }

    onSelectFilter(
      isActive(key) ? "ALL" : key.toUpperCase()
    );
  };

  return (
    <section
      aria-labelledby="alert-summary-heading"
      aria-busy={isLoading}
      className="mb-5 min-w-0 sm:mb-6"
    >
      {/* Section heading */}
      <div className="mb-3 flex flex-wrap items-end justify-between gap-3 sm:mb-4">
        <div className="min-w-0">
          <h2
            id="alert-summary-heading"
            className="font-[Orbitron] text-sm font-semibold tracking-wide text-slate-100 sm:text-base"
          >
            Operational Overview
          </h2>

          <p className="mt-1 text-xs leading-5 text-slate-400 sm:text-sm">
            Current alert workload and priority signals.
          </p>
        </div>

        <div className="inline-flex shrink-0 items-center gap-2 pb-0.5 text-[10px] font-medium uppercase tracking-[0.14em] text-slate-500 sm:text-[11px]">
          <FiActivity
            aria-hidden="true"
            className="h-3.5 w-3.5 text-cyan-300"
          />
          Alert telemetry
        </div>
      </div>

      {error ? (
        <div
          role="alert"
          className="rounded-xl border border-rose-400/20 bg-rose-400/[0.05] px-4 py-4 text-sm text-rose-200"
        >
          Unable to load the alert summary.
          <p className="mt-1 text-xs leading-5 text-rose-200/70">
            {error}
          </p>
        </div>
      ) : (
        <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {SUMMARY_ITEMS.map((item, index) => {
            const Icon = item.icon;
            const accent = ACCENT_STYLES[item.accent];
            const count = getCount(item.key);
            const active = isActive(item.key);

            const cardClassName = [
              "group relative flex h-full min-h-[158px] min-w-0 flex-col overflow-hidden rounded-xl border bg-[#07111f]/95 p-4 text-left",
              "transition-[border-color,background-color,transform] duration-200",
              "border-white/[0.08]",
              accent.hover,
              active
                ? `${accent.active} bg-white/[0.035]`
                : "hover:bg-[#0a1728]",
              isInteractive
                ? `cursor-pointer focus-visible:outline-none focus-visible:ring-2 ${accent.focus} focus-visible:ring-offset-2 focus-visible:ring-offset-[#020914]`
                : "",
              isLoading ? "animate-pulse" : "",
            ]
              .filter(Boolean)
              .join(" ");

            const content = (
              <>
                {/* Card accent */}
                <span
                  aria-hidden="true"
                  className={`absolute inset-x-0 top-0 h-px ${accent.glow} opacity-40`}
                />

                <div className="flex items-center justify-between gap-3">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border ${accent.icon}`}
                  >
                    <Icon
                      aria-hidden="true"
                      className="h-[19px] w-[19px]"
                    />
                  </div>

                  {isInteractive ? (
                    <FiArrowUpRight
                      aria-hidden="true"
                      className={`h-4 w-4 shrink-0 transition-colors ${
                        active
                          ? "text-cyan-200"
                          : "text-slate-600 group-hover:text-slate-300"
                      }`}
                    />
                  ) : (
                    <span
                      aria-hidden="true"
                      className={`h-1.5 w-1.5 shrink-0 rounded-full ${accent.glow}`}
                    />
                  )}
                </div>

                <div className="mt-4 min-w-0">
                  <p className="truncate text-sm font-medium text-slate-300">
                    {item.label}
                  </p>

                  <p
                    className={`mt-1 font-[Orbitron] text-3xl font-semibold leading-tight tracking-tight tabular-nums ${
                      count === null ? "text-slate-500" : accent.value
                    }`}
                  >
                    {isLoading || count === null
                      ? "—"
                      : formatCount(count)}
                  </p>

                  <p className="mt-2 text-xs leading-5 text-slate-500">
                    {item.description}
                  </p>
                </div>

                {active && (
                  <span
                    aria-hidden="true"
                    className={`absolute inset-x-0 bottom-0 h-0.5 ${accent.glow}`}
                  />
                )}
              </>
            );

            return (
              <motion.div
                key={item.key}
                initial={
                  shouldReduceMotion ? false : { opacity: 0, y: 8 }
                }
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: shouldReduceMotion ? 0 : 0.25,
                  delay: shouldReduceMotion ? 0 : index * 0.04,
                }}
                className="min-w-0"
              >
                {isInteractive ? (
                  <button
                    type="button"
                    className={`${cardClassName} w-full disabled:cursor-wait disabled:opacity-60`}
                    onClick={() => handleSelect(item.key)}
                    aria-pressed={active}
                    aria-label={
                      item.key === "critical"
                        ? "Filter alerts by critical severity"
                        : `Filter alerts by ${item.label.toLowerCase()} status`
                    }
                    disabled={isLoading || count === null}
                  >
                    {content}
                  </button>
                ) : (
                  <div className={cardClassName}>{content}</div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </section>
  );
}