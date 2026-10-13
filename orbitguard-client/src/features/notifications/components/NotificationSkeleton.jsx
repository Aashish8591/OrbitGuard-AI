
const VALID_LAYOUTS = new Set([
  "workspace",
  "feed",
  "sidebar",
  "detail",
]);

function getSafeLayout(layout) {
  return VALID_LAYOUTS.has(layout) ? layout : "workspace";
}

function getSafeItemCount(itemCount) {
  const count = Number(itemCount);

  if (!Number.isFinite(count)) return 7;

  return Math.min(20, Math.max(1, Math.floor(count)));
}

function SkeletonBlock({ className = "" }) {
  return (
    <div
      aria-hidden="true"
      className={`
        animate-pulse rounded-md
        bg-gradient-to-r from-white/[0.035]
        via-white/[0.075] to-white/[0.035]
        ${className}
      `}
    />
  );
}

function SkeletonIcon({ className = "" }) {
  return (
    <SkeletonBlock
      className={`h-10 w-10 shrink-0 rounded-xl ${className}`}
    />
  );
}

function NotificationSidebarSkeleton() {
  return (
    <aside
      aria-hidden="true"
      className="
        min-w-0 overflow-hidden rounded-xl
        border border-cyan-400/[0.12]
        bg-[#061222]/90 p-3.5 sm:p-4
      "
    >
      {/* Sidebar heading */}
      <div className="mb-6 flex items-center justify-between gap-3">
        <div className="min-w-0 space-y-2">
          <SkeletonBlock className="h-2 w-20" />
          <SkeletonBlock className="h-5 w-24" />
          <SkeletonBlock className="h-2.5 w-32 max-w-full" />
        </div>

        <SkeletonBlock className="h-9 w-9 shrink-0 rounded-lg" />
      </div>

      {/* Category placeholders */}
      <div className="space-y-2">
        {Array.from({ length: 7 }, (_, index) => (
          <div
            key={index}
            className={`
              flex h-9 min-w-0 items-center gap-3 rounded-lg px-2.5
              ${
                index === 0
                  ? "border border-cyan-400/10 bg-cyan-400/[0.06]"
                  : ""
              }
            `}
          >
            <SkeletonBlock className="h-4 w-4 shrink-0 rounded-md" />

            <SkeletonBlock
              className={`
                h-3 min-w-0 flex-1
                ${index % 2 === 0 ? "max-w-28" : "max-w-24"}
              `}
            />

            <SkeletonBlock className="h-5 w-7 shrink-0 rounded-full" />
          </div>
        ))}
      </div>

      <div className="my-5 h-px bg-white/[0.06]" />

      {/* Priority section */}
      <div className="mb-4 flex items-center justify-between">
        <SkeletonBlock className="h-3 w-16" />
        <SkeletonBlock className="h-3 w-3" />
      </div>

      <div className="space-y-3">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="flex items-center gap-2.5">
            <SkeletonBlock className="h-3.5 w-3.5 shrink-0 rounded-sm" />
            <SkeletonBlock className="h-2.5 w-2.5 shrink-0 rounded-full" />
            <SkeletonBlock className="h-3 min-w-0 max-w-20 flex-1" />
            <SkeletonBlock className="h-5 w-7 shrink-0 rounded-md" />
          </div>
        ))}
      </div>

      <div className="my-5 h-px bg-white/[0.06]" />

      {/* Date range */}
      <SkeletonBlock className="mb-3 h-3 w-20" />

      <div className="flex gap-2">
        <SkeletonBlock className="h-9 w-9 shrink-0 rounded-lg" />
        <SkeletonBlock className="h-9 min-w-0 flex-1 rounded-lg" />
      </div>
    </aside>
  );
}

function NotificationFeedSkeleton({ itemCount = 7 }) {
  const safeItemCount = getSafeItemCount(itemCount);

  return (
    <section
      aria-hidden="true"
      className="
        min-w-0 overflow-hidden rounded-xl
        border border-cyan-400/[0.12]
        bg-[#061222]/90 p-3 sm:p-3.5
      "
    >
      {/* Toolbar */}
      <div className="mb-5 flex min-w-0 flex-wrap items-center gap-2">
        <SkeletonBlock className="h-10 min-w-0 flex-1 rounded-lg" />
        <SkeletonBlock className="h-10 w-10 shrink-0 rounded-lg" />
        <SkeletonBlock className="h-10 w-24 shrink-0 rounded-lg sm:w-32" />
      </div>

      {/* Group heading */}
      <div className="mb-3 flex items-center gap-2">
        <SkeletonBlock className="h-2.5 w-10" />
        <SkeletonBlock className="h-1.5 w-1.5 rounded-full" />
      </div>

      {/* Notification rows */}
      <div className="space-y-2">
        {Array.from({ length: safeItemCount }, (_, index) => (
          <div
            key={index}
            className={`
              relative flex min-w-0 items-center gap-2.5
              overflow-hidden rounded-lg border p-2.5 sm:gap-3 sm:p-3
              ${
                index === 0
                  ? "border-cyan-400/20 bg-cyan-400/[0.035]"
                  : "border-white/[0.06] bg-[#071323]/70"
              }
            `}
          >
            {/* Accent edge */}
            {index === 0 && (
              <div className="absolute bottom-2 left-0 top-2 w-0.5 rounded-r bg-cyan-300/70" />
            )}

            <SkeletonIcon
              className={index === 0 ? "bg-cyan-400/[0.08]" : ""}
            />

            {/* Message content */}
            <div className="min-w-0 flex-1 space-y-2">
              <SkeletonBlock
                className={`
                  h-3 max-w-full
                  ${
                    index % 3 === 0
                      ? "w-3/4"
                      : index % 3 === 1
                        ? "w-2/3"
                        : "w-1/2"
                  }
                `}
              />

              <SkeletonBlock
                className={`
                  h-2.5 max-w-full
                  ${index % 2 === 0 ? "w-full" : "w-4/5"}
                `}
              />

              <div className="flex min-w-0 items-center justify-between gap-2 pt-0.5">
                <SkeletonBlock className="h-4 w-16 shrink-0 rounded-full" />
                <SkeletonBlock className="h-2 w-12 shrink-0" />
              </div>
            </div>

            {/* Unread indicator placeholder */}
            <SkeletonBlock className="h-2.5 w-2.5 shrink-0 rounded-full" />
          </div>
        ))}
      </div>

      {/* Feed footer */}
      <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/[0.06] pt-3">
        <SkeletonBlock className="h-2.5 w-28 max-w-full" />
        <SkeletonBlock className="h-7 w-16 shrink-0 rounded-md" />
      </div>
    </section>
  );
}

function NotificationDetailSkeleton() {
  return (
    <aside
      aria-hidden="true"
      className="
        min-w-0 overflow-hidden rounded-xl
        border border-cyan-400/[0.12]
        bg-[#061222]/90 p-4 sm:p-5
      "
    >
      {/* Detail actions */}
      <div className="mb-7 flex items-center justify-end gap-2">
        <SkeletonBlock className="h-8 w-20 rounded-lg" />
        <SkeletonBlock className="h-8 w-8 rounded-lg" />
        <SkeletonBlock className="h-8 w-8 rounded-lg" />
      </div>

      {/* Notification heading */}
      <div className="flex min-w-0 items-start gap-3">
        <SkeletonBlock className="h-14 w-14 shrink-0 rounded-xl" />

        <div className="min-w-0 flex-1 space-y-2.5 pt-1">
          <SkeletonBlock className="h-4 w-16 rounded-full" />
          <SkeletonBlock className="h-4 w-full max-w-52" />
          <SkeletonBlock className="h-2.5 w-32 max-w-full" />
        </div>
      </div>

      {/* Description */}
      <div className="mb-6 mt-5 space-y-2">
        <SkeletonBlock className="h-2.5 w-full" />
        <SkeletonBlock className="h-2.5 w-11/12" />
        <SkeletonBlock className="h-2.5 w-3/4" />
      </div>

      {/* Related orbital object placeholder */}
      <div className="mb-6 overflow-hidden rounded-xl border border-white/[0.07] bg-[#071323]/80">
        <div className="flex min-w-0 items-start justify-between gap-3 p-3">
          <div className="flex min-w-0 flex-1 items-center gap-2.5">
            <SkeletonBlock className="h-10 w-10 shrink-0 rounded-lg" />

            <div className="min-w-0 flex-1 space-y-2">
              <SkeletonBlock className="h-3 w-28 max-w-full" />
              <SkeletonBlock className="h-2.5 w-20 max-w-full" />
            </div>
          </div>

          <SkeletonBlock className="h-7 w-16 shrink-0 rounded-full" />
        </div>

        <div className="grid grid-cols-2 gap-3 px-3 pb-3">
          <div className="space-y-2">
            <SkeletonBlock className="h-2 w-20 max-w-full" />
            <SkeletonBlock className="h-3.5 w-16 max-w-full" />
          </div>

          <div className="space-y-2">
            <SkeletonBlock className="h-2 w-14 max-w-full" />
            <SkeletonBlock className="h-3.5 w-20 max-w-full" />
          </div>
        </div>
      </div>

      {/* Activity timeline */}
      <SkeletonBlock className="mb-4 h-2.5 w-24" />

      <div className="relative space-y-5 pl-1">
        <div className="absolute bottom-3 left-[7px] top-2 w-px bg-white/[0.08]" />

        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="relative flex min-w-0 items-center gap-3">
            <SkeletonBlock
              className={`
                z-10 h-3.5 w-3.5 shrink-0 rounded-full
                ${index < 2 ? "bg-cyan-400/20" : ""}
              `}
            />

            <SkeletonBlock
              className={`h-3 min-w-0 ${index % 2 === 0 ? "w-32" : "w-40"}`}
            />

            <SkeletonBlock className="ml-auto h-2.5 w-14 shrink-0" />
          </div>
        ))}
      </div>

      {/* Bottom action */}
      <SkeletonBlock className="mt-7 h-10 w-full rounded-lg" />
    </aside>
  );
}

function NotificationSkeleton({
  layout = "workspace",
  itemCount = 7,
  className = "",
}) {
  const safeLayout = getSafeLayout(layout);
  const safeItemCount = getSafeItemCount(itemCount);

  return (
    <div
      className={`relative min-w-0 text-slate-200 ${className}`}
    >
      {/* Keep the live announcement separate from decorative skeletons. */}
      <div role="status" aria-live="polite" className="sr-only">
        Loading notification data. Please wait.
      </div>

      {/* Visual loading indicator */}
      <div
        aria-hidden="true"
        className="mb-3 flex items-center justify-between gap-3"
      >
        <div className="flex min-w-0 items-center gap-2">
          <span className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-cyan-300 shadow-[0_0_8px_rgba(103,232,249,0.7)]" />

          <span className="truncate text-[9px] font-medium uppercase tracking-[0.16em] text-slate-500">
            Synchronizing notification feed
          </span>
        </div>

        <span className="shrink-0 text-[9px] text-slate-600">
          LIVE INBOX
        </span>
      </div>

      {safeLayout === "workspace" && (
        <div
          aria-hidden="true"
          className="
            grid min-w-0 grid-cols-1 gap-3
            lg:grid-cols-[minmax(185px,0.78fr)_minmax(0,1.75fr)]
            2xl:grid-cols-[minmax(190px,0.78fr)_minmax(0,1.75fr)_minmax(290px,1.18fr)]
          "
        >
          <NotificationSidebarSkeleton />

          <NotificationFeedSkeleton itemCount={safeItemCount} />

          <div className="hidden min-w-0 2xl:block">
            <NotificationDetailSkeleton />
          </div>
        </div>
      )}

      {safeLayout === "feed" && (
        <NotificationFeedSkeleton itemCount={safeItemCount} />
      )}

      {safeLayout === "sidebar" && <NotificationSidebarSkeleton />}

      {safeLayout === "detail" && <NotificationDetailSkeleton />}
    </div>
  );
}

export default NotificationSkeleton;
