import { motion, useReducedMotion } from "framer-motion";

import {
  FiActivity,
  FiArrowUpRight,
  FiBell,
  FiRefreshCw,
  FiShield,
} from "react-icons/fi";

const BACKGROUND_IMAGE = "/images/Footer/landing_footerBg.png";

const formatCurrentDate = () =>
  new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date());

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
    if (typeof onRefresh !== "function" || isRefreshing) return;
    onRefresh();
  };

  return (
    <motion.header
      initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: shouldReduceMotion ? 0 : 0.35,
        ease: "easeOut",
      }}
      className="relative isolate mb-5 min-w-0 overflow-hidden rounded-2xl border border-cyan-200/15 bg-[#06101e] shadow-[0_16px_48px_rgba(0,0,0,0.3)] sm:mb-6"
    >
      {/* Layer 1: Actual background image */}
      <img
        src={BACKGROUND_IMAGE}
        alt=""
        aria-hidden="true"
        draggable="false"
        className="pointer-events-none absolute inset-0 z-0 h-full w-full object-cover object-center opacity-65"
      />

      {/* Layer 2: Darken the artwork without hiding it */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[1] bg-[#020914]/40"
      />

      {/* Layer 3: Protect text contrast */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[2] bg-gradient-to-r from-[#020914]/90 via-[#061321]/65 to-[#061321]/35"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[2] bg-gradient-to-t from-[#020914]/70 via-transparent to-[#020914]/15"
      />

      {/* Layer 4: Subtle orbital decoration */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-20 -top-32 z-[3] h-72 w-72 rounded-full border border-cyan-200/10 sm:h-96 sm:w-96"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-5 -top-20 z-[3] h-56 w-56 rounded-full border border-cyan-200/[0.08] sm:h-72 sm:w-72"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-10 top-8 z-[3] h-1.5 w-1.5 rounded-full bg-cyan-200 shadow-[0_0_14px_rgba(103,232,249,0.9)] sm:right-14 sm:top-10"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-12 top-12 z-[3] h-40 w-40 rounded-full bg-cyan-400/[0.08] blur-3xl sm:h-56 sm:w-56"
      />

      {/* Layer 5: Foreground content */}
      <div className="relative z-10 grid min-w-0 grid-cols-1 gap-6 p-4 sm:p-6 lg:grid-cols-[minmax(0,1fr)_250px] lg:items-center lg:gap-8 lg:px-8 lg:py-7">
        {/* Left: heading and operational information */}
        <div className="min-w-0">
          <div className="mb-4 flex flex-wrap items-center gap-2 sm:mb-5">
            <span className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-[#061522]/80 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-200 backdrop-blur-sm sm:text-[11px]">
              <FiShield
                aria-hidden="true"
                className="h-3.5 w-3.5"
              />
              Operations Center
            </span>

            <span
              aria-hidden="true"
              className="hidden h-1 w-1 rounded-full bg-slate-500 sm:block"
            />

            <span className="text-[10px] font-medium uppercase tracking-[0.15em] text-slate-300/75 sm:text-[11px]">
              Alert Intelligence
            </span>
          </div>

          <div className="flex min-w-0 items-start gap-3 sm:gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-cyan-300/20 bg-[#071b29]/85 text-cyan-200 shadow-lg backdrop-blur-sm sm:h-14 sm:w-14">
              <FiBell
                aria-hidden="true"
                className="h-5 w-5 sm:h-6 sm:w-6"
              />
            </div>

            <div className="min-w-0 flex-1">
              <h1 className="font-[Orbitron] text-xl font-semibold leading-tight tracking-tight text-white sm:text-2xl lg:text-[30px]">
                Alert Center
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-200 sm:text-[15px] sm:leading-7">
                Monitor orbital threats, investigate collision
                warnings, and coordinate operational responses
                from one workspace.
              </p>
            </div>
          </div>

          {/* Operational metadata */}
          <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-white/10 pt-4 text-xs sm:mt-6 sm:gap-x-5">
            <span className="inline-flex items-center gap-2 text-slate-200">
              <FiActivity
                aria-hidden="true"
                className="h-4 w-4 shrink-0 text-cyan-300"
              />

              {hasPendingCount ? (
                <>
                  <span className="font-semibold text-white">
                    {pendingCount.toLocaleString("en-IN")}
                  </span>

                  <span>
                    pending {pendingCount === 1 ? "alert" : "alerts"}
                  </span>
                </>
              ) : (
                <span>Operational alert monitoring</span>
              )}
            </span>

            <span
              aria-hidden="true"
              className="hidden h-3.5 w-px bg-white/15 sm:block"
            />

            <span className="text-slate-300/80">
              {formatCurrentDate()}
            </span>
          </div>
        </div>

        {/* Right: data status and refresh */}
        <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-stretch lg:flex-col lg:justify-center">
          <div className="flex min-w-0 flex-1 items-center gap-3 rounded-xl border border-white/10 bg-[#020914]/80 px-3.5 py-3 backdrop-blur-md lg:flex-none">
            <span className="relative flex h-2 w-2 shrink-0">
              {isRefreshing && (
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-300/60 motion-reduce:animate-none" />
              )}

              <span
                className={`relative inline-flex h-2 w-2 rounded-full ${
                  isRefreshing
                    ? "bg-cyan-300"
                    : formattedLastUpdated
                      ? "bg-emerald-400"
                      : "bg-slate-500"
                }`}
              />
            </span>

            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                {isRefreshing ? "Updating alerts" : "Data status"}
              </p>

              <p className="mt-1 truncate text-xs font-medium text-slate-100">
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
              aria-label={
                isRefreshing ? "Refreshing alerts" : "Refresh alerts"
              }
              className="group inline-flex min-h-11 w-full items-center justify-center gap-2.5 rounded-xl border border-cyan-300/25 bg-[#082433]/90 px-4 py-3 text-sm font-semibold text-cyan-100 backdrop-blur-sm transition-colors duration-200 hover:border-cyan-200/45 hover:bg-[#0b3040] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#07111f] disabled:cursor-not-allowed disabled:opacity-60 sm:flex-1 lg:flex-none"
            >
              <FiRefreshCw
                aria-hidden="true"
                className={`h-4 w-4 shrink-0 ${
                  isRefreshing
                    ? "animate-spin motion-reduce:animate-none"
                    : "transition-transform duration-200 group-hover:rotate-45"
                }`}
              />

              <span>
                {isRefreshing ? "Refreshing..." : "Refresh alerts"}
              </span>

              <FiArrowUpRight
                aria-hidden="true"
                className="h-3.5 w-3.5 shrink-0 opacity-70"
              />
            </button>
          )}
        </div>
      </div>

      {/* Bottom cinematic edge */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-px bg-gradient-to-r from-transparent via-cyan-300/40 to-transparent"
      />
    </motion.header>
  );
}
