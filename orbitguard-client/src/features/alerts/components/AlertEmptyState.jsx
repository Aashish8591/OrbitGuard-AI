import { motion, useReducedMotion } from "framer-motion";
import {
  FiActivity,
  FiAlertCircle,
  FiArrowRight,
  FiBell,
  FiFilter,
  FiRefreshCw,
  FiSearch,
  FiShield,
  FiTarget,
} from "react-icons/fi";

const EMPTY_STATE_CONFIG = {
  default: {
    eyebrow: "ALERT INTELLIGENCE",
    title: "No alerts available",
    description:
      "There are no alert records to display right now. Newly generated alerts will appear here when they become available.",
    icon: FiBell,
    iconClass:
      "border-cyan-300/15 bg-cyan-300/[0.06] text-cyan-200",
    orbitClass: "border-cyan-300/[0.09]",
  },

  filtered: {
    eyebrow: "FILTERED RESULTS",
    title: "No matching alerts",
    description:
      "No alerts match your current search or filters. Try adjusting your criteria to find the alert you need.",
    icon: FiSearch,
    iconClass:
      "border-violet-300/15 bg-violet-300/[0.06] text-violet-200",
    orbitClass: "border-violet-300/[0.09]",
  },

  pending: {
    eyebrow: "OPERATIONAL QUEUE",
    title: "Queue is clear",
    description:
      "There are no pending alerts requiring review in this view. You can continue monitoring for new operational events.",
    icon: FiShield,
    iconClass:
      "border-emerald-300/15 bg-emerald-300/[0.06] text-emerald-200",
    orbitClass: "border-emerald-300/[0.09]",
  },

  error: {
    eyebrow: "DATA CONNECTION",
    title: "Unable to display alerts",
    description:
      "The alert records could not be loaded. Retry the request to check whether the data is available.",
    icon: FiAlertCircle,
    iconClass:
      "border-rose-300/15 bg-rose-300/[0.06] text-rose-200",
    orbitClass: "border-rose-300/[0.09]",
  },
};

/**
 * OrbitGuard AI — Alert Empty State
 *
 * Presentation component for empty and recoverable alert views.
 *
 * @param {Object} props
 * @param {"default"|"filtered"|"pending"|"error"} [props.variant="default"]
 * @param {string} [props.title] Optional title override.
 * @param {string} [props.description] Optional description override.
 * @param {boolean} [props.hasActiveFilters=false]
 * @param {Function} [props.onClearFilters]
 * @param {Function} [props.onRetry]
 * @param {Function} [props.onCreateAlert]
 * @param {boolean} [props.isLoading=false]
 * @param {boolean} [props.showDecoration=true]
 * @param {string} [props.className=""]
 */
export default function AlertEmptyState({
  variant = "default",
  title,
  description,
  hasActiveFilters = false,
  onClearFilters,
  onRetry,
  onCreateAlert,
  isLoading = false,
  showDecoration = true,
  className = "",
}) {
  const shouldReduceMotion = useReducedMotion();

  const resolvedVariant = hasActiveFilters
    ? "filtered"
    : variant;

  const config =
    EMPTY_STATE_CONFIG[resolvedVariant] ??
    EMPTY_STATE_CONFIG.default;

  const EmptyIcon = config.icon;

  const canClearFilters =
    resolvedVariant === "filtered" &&
    typeof onClearFilters === "function";

  const canRetry =
    resolvedVariant === "error" &&
    typeof onRetry === "function";

  const canCreateAlert =
    typeof onCreateAlert === "function";

  const actionCount = [
    canClearFilters,
    canRetry,
    canCreateAlert,
  ].filter(Boolean).length;

  return (
    <motion.section
      initial={
        shouldReduceMotion
          ? false
          : { opacity: 0, y: 8 }
      }
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: shouldReduceMotion ? 0 : 0.25,
      }}
      aria-busy={isLoading}
      aria-labelledby="alert-empty-state-title"
      className={[
        "relative flex min-h-[300px] flex-col items-center justify-center overflow-hidden rounded-xl border border-white/[0.07] bg-[#050d19] px-5 py-10 text-center sm:min-h-[340px] sm:px-8 sm:py-12",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* Decorative orbital atmosphere */}
      {showDecoration && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-hidden"
        >
          <div className="absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.025]" />

          <div
            className={`absolute left-1/2 top-1/2 h-44 w-44 -translate-x-1/2 -translate-y-1/2 rounded-full border ${config.orbitClass}`}
          />

          <div className="absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.035]" />

          <div className="absolute left-[calc(50%+5.5rem)] top-[calc(50%-4.8rem)] h-1.5 w-1.5 rounded-full bg-cyan-300/60 shadow-[0_0_10px_rgba(103,232,249,0.35)]" />

          <div className="absolute left-[calc(50%-6rem)] top-[calc(50%+4rem)] h-1 w-1 rounded-full bg-slate-400/40" />

          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
        </div>
      )}

      {/* Main content */}
      <div className="relative z-10 flex max-w-lg flex-col items-center">
        <div
          className={`relative flex h-16 w-16 items-center justify-center rounded-2xl border ${config.iconClass} sm:h-[72px] sm:w-[72px]`}
        >
          <EmptyIcon
            aria-hidden="true"
            className="h-7 w-7 sm:h-8 sm:w-8"
          />

          <span
            aria-hidden="true"
            className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full border border-[#050d19] bg-[#07111f] text-slate-400"
          >
            <FiActivity className="h-3 w-3" />
          </span>
        </div>

        <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500 sm:text-[11px]">
          {config.eyebrow}
        </p>

        <h2
          id="alert-empty-state-title"
          className="mt-2 font-[Orbitron] text-lg font-semibold tracking-tight text-slate-100 sm:text-xl"
        >
          {title || config.title}
        </h2>

        <p className="mt-3 max-w-md text-xs leading-6 text-slate-400 sm:text-sm">
          {description || config.description}
        </p>

        {/* Contextual guidance */}
        {resolvedVariant === "filtered" && (
          <div className="mt-4 inline-flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.025] px-3 py-2 text-[10px] text-slate-500 sm:text-xs">
            <FiFilter
              aria-hidden="true"
              className="h-3.5 w-3.5 shrink-0"
            />
            Try fewer filters or a different search term.
          </div>
        )}

        {resolvedVariant === "pending" && (
          <div className="mt-4 inline-flex items-center gap-2 rounded-lg border border-emerald-300/10 bg-emerald-300/[0.035] px-3 py-2 text-[10px] text-emerald-200/80 sm:text-xs">
            <FiTarget
              aria-hidden="true"
              className="h-3.5 w-3.5 shrink-0"
            />
            No pending items in the current view.
          </div>
        )}

        {/* Optional actions */}
        {actionCount > 0 && (
          <div className="mt-6 flex w-full flex-col justify-center gap-2 sm:w-auto sm:flex-row">
            {canClearFilters && (
              <button
                type="button"
                onClick={onClearFilters}
                disabled={isLoading}
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-white/[0.09] px-4 py-2.5 text-xs font-semibold text-slate-300 transition-colors hover:border-white/[0.16] hover:bg-white/[0.035] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <FiFilter
                  aria-hidden="true"
                  className="h-3.5 w-3.5"
                />
                Clear filters
              </button>
            )}

            {canRetry && (
              <button
                type="button"
                onClick={onRetry}
                disabled={isLoading}
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-cyan-300/20 bg-cyan-300/[0.08] px-4 py-2.5 text-xs font-semibold text-cyan-100 transition-colors hover:bg-cyan-300/[0.14] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <FiRefreshCw
                  aria-hidden="true"
                  className={`h-3.5 w-3.5 ${
                    isLoading ? "animate-spin" : ""
                  }`}
                />
                {isLoading ? "Retrying..." : "Retry loading"}
                {!isLoading && (
                  <FiArrowRight
                    aria-hidden="true"
                    className="h-3.5 w-3.5"
                  />
                )}
              </button>
            )}

            {canCreateAlert && (
              <button
                type="button"
                onClick={onCreateAlert}
                disabled={isLoading}
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-cyan-300/20 bg-cyan-300/[0.08] px-4 py-2.5 text-xs font-semibold text-cyan-100 transition-colors hover:bg-cyan-300/[0.14] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60 disabled:cursor-not-allowed disabled:opacity-50"
              >
                View operations
                <FiArrowRight
                  aria-hidden="true"
                  className="h-3.5 w-3.5"
                />
              </button>
            )}
          </div>
        )}
      </div>
    </motion.section>
  );
}
