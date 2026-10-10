import { memo } from "react";

/**
 * ================================================================
 * OrbitGuard AI — Alert List Skeleton
 * ================================================================
 *
 * Purpose:
 * - Display a realistic loading placeholder for the alert feed.
 * - Match the dark space-operations interface.
 * - Adapt to mobile, tablet, and desktop layouts.
 * - Respect reduced-motion accessibility preferences.
 *
 * Responsibilities:
 * - Presentation only.
 * - No API calls, state management, or business logic.
 *
 * Usage:
 * <AlertListSkeleton />
 * <AlertListSkeleton count={5} />
 * <AlertListSkeleton count={3} compact />
 * ================================================================
 */

const DEFAULT_COUNT = 4;

function AlertSkeletonRow({ compact = false }) {
  return (
    <div
      className={[
        "relative overflow-hidden rounded-xl border border-slate-800/80",
        "bg-[#07111f]/90",
        compact ? "p-3 sm:p-4" : "p-4 sm:p-5",
      ].join(" ")}
      aria-hidden="true"
    >
      {/* Subtle loading shimmer */}
      <div
        className={[
          "pointer-events-none absolute inset-0",
          "animate-pulse motion-reduce:animate-none",
          "bg-gradient-to-r from-transparent via-slate-700/[0.08] to-transparent",
        ].join(" ")}
      />

      <div className="relative flex min-w-0 items-start gap-3 sm:gap-4">
        {/* Severity indicator */}
        <div className="flex shrink-0 flex-col items-center gap-2 pt-1">
          <div className="h-9 w-9 animate-pulse rounded-lg border border-slate-700/70 bg-slate-800/70 motion-reduce:animate-none sm:h-10 sm:w-10" />
          <div className="hidden h-8 w-px bg-slate-800 sm:block" />
        </div>

        {/* Main alert information */}
        <div className="min-w-0 flex-1">
          {/* Title and status */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 flex-1 space-y-2">
              <div className="h-3 w-20 animate-pulse rounded bg-slate-800 motion-reduce:animate-none" />

              <div className="h-4 w-full max-w-sm animate-pulse rounded bg-slate-700/80 motion-reduce:animate-none" />

              {!compact && (
                <div className="h-3 w-4/5 max-w-md animate-pulse rounded bg-slate-800/80 motion-reduce:animate-none" />
              )}
            </div>

            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <div className="h-6 w-20 animate-pulse rounded-full border border-slate-700/60 bg-slate-800/70 motion-reduce:animate-none" />
              <div className="h-6 w-24 animate-pulse rounded-full border border-slate-700/60 bg-slate-800/70 motion-reduce:animate-none" />
            </div>
          </div>

          {/* Metadata */}
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
            <div className="h-3 w-24 animate-pulse rounded bg-slate-800 motion-reduce:animate-none" />
            <div className="h-3 w-28 animate-pulse rounded bg-slate-800 motion-reduce:animate-none" />
            {!compact && (
              <div className="h-3 w-32 animate-pulse rounded bg-slate-800 motion-reduce:animate-none" />
            )}
          </div>

          {/* Optional object references */}
          {!compact && (
            <div className="mt-4 flex flex-wrap gap-2">
              <div className="h-7 w-28 animate-pulse rounded-md border border-slate-800 bg-slate-900/80 motion-reduce:animate-none" />
              <div className="h-7 w-24 animate-pulse rounded-md border border-slate-800 bg-slate-900/80 motion-reduce:animate-none" />
            </div>
          )}
        </div>

        {/* Desktop action indicator */}
        <div className="hidden shrink-0 pt-1 sm:block">
          <div className="h-8 w-8 animate-pulse rounded-lg bg-slate-800/70 motion-reduce:animate-none" />
        </div>
      </div>
    </div>
  );
}

function AlertListSkeleton({
  count = DEFAULT_COUNT,
  compact = false,
  className = "",
}) {
  const safeCount =
    Number.isFinite(Number(count))
      ? Math.min(10, Math.max(1, Math.floor(Number(count))))
      : DEFAULT_COUNT;

  return (
    <div
      className={["w-full min-w-0", className].filter(Boolean).join(" ")}
      role="status"
      aria-label="Loading alerts"
      aria-busy="true"
    >
      {/* Screen-reader announcement */}
      <span className="sr-only">Loading alerts. Please wait.</span>

      <div className="space-y-3 sm:space-y-4">
        {Array.from({ length: safeCount }, (_, index) => (
          <AlertSkeletonRow
            key={`alert-skeleton-${index}`}
            compact={compact}
          />
        ))}
      </div>
    </div>
  );
}

export default memo(AlertListSkeleton);