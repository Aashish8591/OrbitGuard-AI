import { motion, useReducedMotion } from "framer-motion";
import {
  FiActivity,
  FiArrowUpRight,
  FiBell,
  FiRefreshCw,
  FiShield,
} from "react-icons/fi";

const formatCurrentDate = () => {
  return new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date());
};

/**
 * OrbitGuard AI — Alerts Header
 *
 * Responsibilities:
 * - Introduce the Alerts workspace.
 * - Provide contextual operational information.
 * - Expose an optional refresh action.
 * - Display an optional last-updated timestamp.
 *
 * This component does not fetch data or manage API state.
 *
 * @param {Object} props
 * @param {Function} [props.onRefresh] Refresh callback from the parent.
 * @param {boolean} [props.isRefreshing=false] Refresh loading state.
 * @param {string|null} [props.lastUpdated=null] Last successful refresh time.
 * @param {number|null} [props.pendingCount=null] Pending alert count from the API.
 */
export default function AlertsHeader({
  onRefresh,
  isRefreshing = false,
  lastUpdated = null,
  pendingCount = null,
}) {
  const shouldReduceMotion = useReducedMotion();

  const formattedLastUpdated = lastUpdated
    ? new Date(lastUpdated).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
    : null;

  const hasPendingCount =
    typeof pendingCount === "number" &&
    Number.isFinite(pendingCount) &&
    pendingCount >= 0;

  const handleRefresh = () => {
    if (!onRefresh || isRefreshing) return;
    onRefresh();
  };

  return (
    <motion.header
      initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: shouldReduceMotion ? 0 : 0.35,
        ease: "easeOut",
      }}
      className="relative mb-6 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#07111f]"
    >
      {/* Subtle orbital-grid atmosphere */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -right-16 -top-28 h-64 w-64 rounded-full border border-cyan-300/[0.08]" />
        <div className="absolute -right-8 -top-20 h-48 w-48 rounded-full border border-cyan-300/[0.08]" />
        <div className="absolute right-8 top-[-3.5rem] h-32 w-32 rounded-full border border-cyan-300/[0.10]" />

        <div className="absolute right-12 top-10 h-1.5 w-1.5 rounded-full bg-cyan-300/70 shadow-[0_0_12px_rgba(103,232,249,0.8)]" />

        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-cyan-300/30 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(34,211,238,0.08),transparent_45%)]" />
      </div>

      <div className="relative flex flex-col gap-6 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between lg:gap-8 lg:px-8 lg:py-7">
        {/* Page identity */}
        <div className="min-w-0 flex-1">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-cyan-300/15 bg-cyan-300/[0.06] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-200 sm:text-[11px]">
              <FiShield aria-hidden="true" className="h-3.5 w-3.5" />
              Operations Center
            </span>

            <span className="hidden h-1 w-1 rounded-full bg-slate-600 sm:block" />

            <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500 sm:text-[11px]">
              Alert Intelligence
            </span>
          </div>

          <div className="flex items-start gap-3 sm:gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-cyan-300/15 bg-cyan-300/[0.07] text-cyan-200 sm:h-12 sm:w-12">
              <FiBell
                aria-hidden="true"
                className="h-5 w-5 sm:h-[22px] sm:w-[22px]"
              />
            </div>

            <div className="min-w-0">
              <h1 className="font-[Orbitron] text-xl font-semibold leading-tight tracking-tight text-white sm:text-2xl lg:text-[28px]">
                Alert Center
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400 sm:text-[15px]">
                Monitor orbital threats, investigate collision warnings, and
                coordinate operational responses from one workspace.
              </p>
            </div>
          </div>

          {/* Operational context */}
          <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-400 sm:gap-x-5">
            <span className="inline-flex items-center gap-2">
              <FiActivity
                aria-hidden="true"
                className="h-3.5 w-3.5 text-cyan-300"
              />
              {hasPendingCount ? (
                <>
                  <span className="font-semibold text-slate-200">
                    {pendingCount.toLocaleString("en-IN")}
                  </span>
                  pending {pendingCount === 1 ? "alert" : "alerts"}
                </>
              ) : (
                "Operational alert monitoring"
              )}
            </span>

            <span className="hidden h-3 w-px bg-white/10 sm:block" />

            <span className="text-slate-500">{formatCurrentDate()}</span>
          </div>
        </div>

        {/* Actions and update status */}
        <div className="flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center lg:flex-col lg:items-stretch lg:gap-4">
          <div className="flex min-w-0 items-center gap-2.5 rounded-xl border border-white/[0.07] bg-[#020914]/70 px-3.5 py-3">
            <span className="relative flex h-2 w-2 shrink-0">
              <span
                className={`absolute inline-flex h-full w-full rounded-full ${
                  isRefreshing ? "animate-ping bg-cyan-300/60" : ""
                }`}
              />
              <span
                className={`relative inline-flex h-2 w-2 rounded-full ${
                  isRefreshing ? "bg-cyan-300" : "bg-slate-500"
                }`}
              />
            </span>

            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                {isRefreshing ? "Updating alerts" : "Data status"}
              </p>

              <p className="mt-0.5 truncate text-xs font-medium text-slate-300">
                {isRefreshing
                  ? "Synchronizing..."
                  : formattedLastUpdated
                    ? `Last updated ${formattedLastUpdated}`
                    : "Awaiting first refresh"}
              </p>
            </div>
          </div>

          {onRefresh && (
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isRefreshing}
              aria-label={isRefreshing ? "Refreshing alerts" : "Refresh alerts"}
              className="group inline-flex min-h-11 items-center justify-center gap-2.5 rounded-xl border border-cyan-300/20 bg-cyan-300/[0.08] px-4 py-3 text-sm font-semibold text-cyan-100 transition-colors duration-200 hover:border-cyan-200/40 hover:bg-cyan-300/[0.14] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#07111f] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <FiRefreshCw
                aria-hidden="true"
                className={`h-4 w-4 ${
                  isRefreshing ? "animate-spin" : "group-hover:rotate-45"
                } transition-transform duration-200`}
              />

              {isRefreshing ? "Refreshing..." : "Refresh alerts"}

              <FiArrowUpRight
                aria-hidden="true"
                className="h-3.5 w-3.5 opacity-60"
              />
            </button>
          )}
        </div>
      </div>
    </motion.header>
  );
}