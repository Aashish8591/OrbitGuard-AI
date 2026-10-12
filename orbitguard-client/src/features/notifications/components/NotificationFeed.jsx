
import { useMemo } from "react";
import { FiBell, FiInbox, FiRadio } from "react-icons/fi";

import NotificationItem from "./NotificationItem";

/* ================================================================
   NOTIFICATION FEED
   OrbitGuard AI — Notification Center

   Responsibilities:
   - Group notifications by date
   - Render reusable NotificationItem components
   - Preserve selected notification state from the parent
   - Display loading, empty and error states
   - Keep the feed independently scrollable

   API calls and filtering state belong to the parent page.
   ================================================================ */

const DATE_FORMATTER = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

function getNotificationId(notification) {
  return (
    notification?.id ??
    notification?.notificationId ??
    notification?.notificationCode ??
    notification?._id ??
    null
  );
}

function getNotificationDate(notification) {
  const value =
    notification?.createdAt ??
    notification?.createdDate ??
    notification?.timestamp ??
    notification?.sentAt ??
    null;

  if (!value) return null;

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
}

function getDateGroup(date) {
  if (!date) return "DATE UNAVAILABLE";

  const now = new Date();

  const todayStart = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  );

  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(todayStart.getDate() - 1);

  if (date >= todayStart) return "TODAY";

  if (date >= yesterdayStart && date < todayStart) {
    return "YESTERDAY";
  }

  return DATE_FORMATTER.format(date).toUpperCase();
}

function getSortTimestamp(notification) {
  return (
    getNotificationDate(notification)?.getTime() ??
    0
  );
}

function groupNotifications(notifications) {
  const sorted = [...notifications].sort(
    (a, b) => getSortTimestamp(b) - getSortTimestamp(a),
  );

  const groups = new Map();

  sorted.forEach((notification) => {
    const date = getNotificationDate(notification);
    const label = getDateGroup(date);

    if (!groups.has(label)) {
      groups.set(label, []);
    }

    groups.get(label).push(notification);
  });

  return Array.from(groups.entries()).map(([label, items]) => ({
    label,
    items,
  }));
}

function isNotificationRead(notification) {
  const status = String(notification?.status ?? "").toUpperCase();

  return (
    status === "READ" ||
    status === "ARCHIVED" ||
    Boolean(notification?.readAt)
  );
}

function FeedSkeleton() {
  return (
    <div
      className="space-y-2.5"
      aria-label="Loading notifications"
      aria-busy="true"
    >
      {Array.from({ length: 5 }, (_, index) => (
        <div
          key={index}
          className="
            flex animate-pulse items-center gap-3
            rounded-xl border border-white/[0.06]
            border-l-[3px] border-l-cyan-400/30
            bg-[#061323]/75 p-3
          "
        >
          <div className="h-11 w-11 shrink-0 rounded-lg bg-slate-700/40" />

          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-3 w-2/3 rounded bg-slate-700/50" />
            <div className="h-2.5 w-full rounded bg-slate-800/80" />
            <div className="h-2.5 w-1/3 rounded bg-slate-800/80" />
          </div>

          <div className="h-2.5 w-2.5 rounded-full bg-slate-700/50" />
        </div>
      ))}
    </div>
  );
}

function EmptyFeed({ hasFilters, onClearFilters }) {
  return (
    <div className="flex min-h-[280px] flex-col items-center justify-center px-5 py-12 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-400/15 bg-cyan-400/[0.06]">
        {hasFilters ? (
          <FiBell className="text-cyan-300" size={25} />
        ) : (
          <FiInbox className="text-cyan-300" size={27} />
        )}
      </div>

      <h3 className="font-['Orbitron'] text-sm font-semibold text-slate-200">
        {hasFilters ? "No matching notifications" : "Inbox is clear"}
      </h3>

      <p className="mt-2 max-w-xs text-xs leading-5 text-slate-500">
        {hasFilters
          ? "Try adjusting your search or filters to find the notification you need."
          : "There are no notifications to display right now. New system activity will appear here."}
      </p>

      {hasFilters && typeof onClearFilters === "function" && (
        <button
          type="button"
          onClick={onClearFilters}
          className="
            mt-5 rounded-lg border border-cyan-400/25
            bg-cyan-400/[0.06] px-4 py-2
            text-xs font-medium text-cyan-200
            transition hover:bg-cyan-400/[0.12]
            focus-visible:outline-none focus-visible:ring-2
            focus-visible:ring-cyan-400
          "
        >
          Clear filters
        </button>
      )}
    </div>
  );
}

function NotificationFeed({
  notifications = [],
  selectedNotification = null,
  onSelectNotification,
  onMarkRead,
  loading = false,
  error = null,
  onRetry,
  hasFilters = false,
  onClearFilters,
  compact = true,
  maxHeight = "calc(100svh - 190px)",
}) {
  const safeNotifications = Array.isArray(notifications)
    ? notifications.filter(Boolean)
    : [];

  const groups = useMemo(
    () => groupNotifications(safeNotifications),
    [safeNotifications],
  );

  const selectedId = selectedNotification
    ? getNotificationId(selectedNotification)
    : null;

  const unreadCount = safeNotifications.filter(
    (notification) => !isNotificationRead(notification),
  ).length;

  return (
    <section
      aria-label="Notification inbox feed"
      className="
        flex min-h-0 min-w-0 flex-col overflow-hidden
        rounded-2xl border border-cyan-400/[0.13]
        bg-[#030d1b]/90
        shadow-[0_18px_55px_rgba(0,0,0,0.18)]
      "
    >
      {/* Feed status strip */}

      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-white/[0.06] px-4 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400/40" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-300" />
          </span>

          <span className="truncate text-[10px] font-semibold uppercase tracking-[0.17em] text-slate-400">
            Notification stream
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <span className="hidden text-[10px] text-slate-500 sm:inline">
            {safeNotifications.length} total
          </span>

          <span className="rounded-md border border-rose-400/15 bg-rose-400/[0.07] px-2 py-1 text-[10px] font-semibold tabular-nums text-rose-300">
            {unreadCount} unread
          </span>
        </div>
      </div>

      {/* Scrollable feed content */}

      <div
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-3 sm:p-3.5"
        style={{
          maxHeight,
          scrollbarWidth: "thin",
          scrollbarColor: "rgba(100,116,139,0.45) transparent",
        }}
      >
        {loading ? (
          <FeedSkeleton />
        ) : error ? (
          <div
            role="alert"
            className="flex min-h-[260px] flex-col items-center justify-center px-5 text-center"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-rose-400/20 bg-rose-400/[0.07]">
              <FiRadio size={21} className="text-rose-300" />
            </div>

            <h3 className="text-sm font-semibold text-slate-200">
              Unable to load notifications
            </h3>

            <p className="mt-2 max-w-xs text-xs leading-5 text-slate-500">
              {typeof error === "string"
                ? error
                : "The notification service could not return the inbox data."}
            </p>

            {typeof onRetry === "function" && (
              <button
                type="button"
                onClick={onRetry}
                className="
                  mt-5 rounded-lg border border-cyan-400/25
                  bg-cyan-400/[0.06] px-4 py-2
                  text-xs font-medium text-cyan-200
                  transition hover:bg-cyan-400/[0.12]
                  focus-visible:outline-none focus-visible:ring-2
                  focus-visible:ring-cyan-400
                "
              >
                Retry loading
              </button>
            )}
          </div>
        ) : safeNotifications.length === 0 ? (
          <EmptyFeed
            hasFilters={hasFilters}
            onClearFilters={onClearFilters}
          />
        ) : (
          <div className="space-y-4">
            {groups.map(({ label, items }) => (
              <section
                key={label}
                aria-label={label}
                className="space-y-2"
              >
                {/* Date divider */}

                <div className="flex items-center gap-2 px-1 pb-0.5 pt-1">
                  <h3 className="font-['Orbitron'] text-[9px] font-semibold tracking-[0.15em] text-slate-400">
                    {label}
                  </h3>

                  <span className="h-1 w-1 rounded-full bg-cyan-300/80 shadow-[0_0_8px_rgba(34,211,238,0.5)]" />

                  <span className="ml-auto text-[9px] tabular-nums text-slate-600">
                    {items.length}
                  </span>
                </div>

                {/* Notification rows */}

                <div className="space-y-1.5">
                  {items.map((notification, index) => {
                    const notificationId =
                      getNotificationId(notification);

                    const key =
                      notificationId ??
                      `${label}-${getSortTimestamp(notification)}-${index}`;

                    const isSelected =
                      selectedId != null &&
                      notificationId != null &&
                      String(selectedId) === String(notificationId);

                    return (
                      <NotificationItem
                        key={key}
                        notification={notification}
                        selected={isSelected}
                        onClick={onSelectNotification}
                        onMarkRead={onMarkRead}
                        compact={compact}
                      />
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default NotificationFeed;
