
import { motion, useReducedMotion } from "framer-motion";

import {
  FiActivity,
  FiAlertTriangle,
  FiArrowUpRight,
  FiCheckCircle,
  FiClock,
} from "react-icons/fi";

/* ================================================================
   CONFIGURATION
   ================================================================ */

const CARD_BACKGROUND = "/images/background/appBackground2.jpg";

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
    icon: "border-amber-400/30 bg-amber-400/15 text-amber-300",
    value: "text-amber-200",
    glow: "bg-amber-300",
    hover: "hover:border-amber-300/40",
    focus: "focus-visible:ring-amber-300/60",
    active: "border-amber-300/50",
  },
  cyan: {
    icon: "border-cyan-400/30 bg-cyan-400/15 text-cyan-300",
    value: "text-cyan-200",
    glow: "bg-cyan-300",
    hover: "hover:border-cyan-300/40",
    focus: "focus-visible:ring-cyan-300/60",
    active: "border-cyan-300/50",
  },
  emerald: {
    icon: "border-emerald-400/30 bg-emerald-400/15 text-emerald-300",
    value: "text-emerald-200",
    glow: "bg-emerald-300",
    hover: "hover:border-emerald-300/40",
    focus: "focus-visible:ring-emerald-300/60",
    active: "border-emerald-300/50",
  },
  rose: {
    icon: "border-rose-400/30 bg-rose-400/15 text-rose-300",
    value: "text-rose-200",
    glow: "bg-rose-300",
    hover: "hover:border-rose-300/40",
    focus: "focus-visible:ring-rose-300/60",
    active: "border-rose-300/50",
  },
};

/* ================================================================
   HELPERS
   ================================================================ */

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

      if (status === "ACKNOWLEDGED") {
        result.acknowledged += 1;
      }

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

/* ================================================================
   ALERT SUMMARY
   ================================================================ */

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

  const values = hasBackendSummary
    ? summary
    : derivedSummary;

  const getCount = (key) => {
    if (!values || !isValidCount(values[key])) return null;
    return values[key];
  };

  const isInteractive = typeof onSelectFilter === "function";

  const isActive = (key) => {
    const current = normalizeStatus(activeFilter);

    if (key === "critical") {
      return current === "CRITICAL";
    }

    return current === normalizeStatus(key);
  };

  const handleSelect = (key) => {
    if (!isInteractive) return;

    // Critical filters by severity; the other cards filter by status.
    if (key === "critical") {
      onSelectFilter(
        isActive(key) ? "ALL" : "CRITICAL"
      );
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
            className="font-['Orbitron'] text-sm font-semibold tracking-wide text-slate-100 sm:text-base"
          >
            Operational Overview
          </h2>

          <p className="mt-1 text-xs leading-5 text-slate-400 sm:text-sm">
            Current alert workload and priority signals.
          </p>
        </div>

        <div className="inline-flex shrink-0 items-center gap-2 pb-0.5 text-[10px] font-medium uppercase tracking-[0.14em] text-slate-400 sm:text-[11px]">
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
          className="rounded-xl border border-rose-400/25 bg-rose-950/60 px-4 py-4 text-sm text-rose-200"
        >
          Unable to load the alert summary.

          <p className="mt-1 break-words text-xs leading-5 text-rose-200/80">
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
              "group relative isolate flex h-full min-h-[158px] w-full min-w-0 flex-col",
              "overflow-hidden rounded-xl border p-4 text-left",
              "border-white/15 bg-[#07111f]",
              "transition-[border-color,box-shadow] duration-200",
              accent.hover,
              active
                ? `${accent.active} ring-1 ring-white/10`
                : "",
              isInteractive
                ? `cursor-pointer focus-visible:outline-none focus-visible:ring-2 ${accent.focus} focus-visible:ring-offset-2 focus-visible:ring-offset-[#020914]`
                : "",
              isLoading ? "animate-pulse" : "",
            ]
              .filter(Boolean)
              .join(" ");

            const content = (
              <>
                {/* Background image layer */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
                >
                  <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-500 group-hover:scale-[1.035] motion-reduce:transform-none"
                    style={{
                      backgroundImage: `url("${CARD_BACKGROUND}")`,
                    }}
                  />
                </div>

                {/* Contrast overlay */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 z-0 bg-[#020916]/65 transition-colors duration-200 group-hover:bg-[#020916]/55"
                />

                {/* Atmospheric cyan glow */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top_right,rgba(34,211,238,0.15),transparent_65%)]"
                />

                {/* Accent line */}
                <span
                  aria-hidden="true"
                  className={`absolute inset-x-0 top-0 z-10 h-px ${accent.glow} opacity-70`}
                />

                {/* Card content */}
                <div className="relative z-10 flex min-w-0 flex-1 flex-col">
                  <div className="flex items-center justify-between gap-3">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border backdrop-blur-md ${accent.icon}`}
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
                            : "text-slate-300 group-hover:text-white"
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
                    <p className="truncate text-sm font-medium text-slate-100">
                      {item.label}
                    </p>

                    <p
                      className={`mt-1 font-['Orbitron'] text-3xl font-semibold leading-tight tracking-tight tabular-nums ${
                        count === null
                          ? "text-slate-300"
                          : accent.value
                      }`}
                    >
                      {isLoading || count === null
                        ? "—"
                        : formatCount(count)}
                    </p>

                    <p className="mt-2 text-xs leading-5 text-slate-200">
                      {item.description}
                    </p>
                  </div>
                </div>

                {/* Active filter indicator */}
                {active && (
                  <span
                    aria-hidden="true"
                    className={`absolute inset-x-0 bottom-0 z-10 h-0.5 ${accent.glow}`}
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
                  delay: shouldReduceMotion ? 0 : index * 0.04,
                }}
                className="min-w-0"
              >
                {isInteractive ? (
                  <button
                    type="button"
                    className={`${cardClassName} disabled:cursor-wait disabled:opacity-60`}
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
                  <div className={cardClassName}>
                    {content}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </section>
  );
}
