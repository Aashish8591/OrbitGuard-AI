
import { useMemo } from "react";

import {
  FiBell,
  FiInbox,
  FiRadio,
  FiRefreshCw,
} from "react-icons/fi";

import NotificationItem from "./NotificationItem";

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

  if (value === null || value === undefined || value === "") {
    return null;
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
}

function getSortTimestamp(notification) {
  return getNotificationDate(notification)?.getTime() ?? 0;
}

function getDateGroup(date, now) {
  if (!date) return "DATE UNAVAILABLE";

  const todayStart = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );

  const tomorrowStart = new Date(todayStart);
  tomorrowStart.setDate(todayStart.getDate() + 1);

  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(todayStart.getDate() - 1);

  if (date >= todayStart && date < tomorrowStart) {
    return "TODAY";
  }

  if (date >= yesterdayStart && date < todayStart) {
    return "YESTERDAY";
  }

  return DATE_FORMATTER.format(date).toUpperCase();
}

function groupNotifications(notifications) {
  const now = new Date();

  const sorted = [...notifications].sort(
    (a, b) => getSortTimestamp(b) - getSortTimestamp(a)
  );

  const groups = new Map();

  sorted.forEach((notification) => {
    const date = getNotificationDate(notification);
    const label = getDateGroup(date, now);

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

function isNotificationUnread(notification) {
  return (
    String(notification?.status ?? "").trim().toUpperCase() === "UNREAD"
  );
}

function FeedSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading notifications"
      aria-live="polite"
      className="space-y-2.5"
    >
      {Array.from({ length: 5 }, (_, index) => (
        <div
          key={index}
          aria-hidden="true"
          className="
            flex animate-pulse items-center gap-3
            rounded-xl border border-white/[0.06]
            border-l-[3px] border-l-cyan-400/30
            bg-[#061323]/90 p-3
          "
        >
          <div className="h-11 w-11 shrink-0 rounded-lg bg-slate-700/40" />

          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-3 w-2/3 rounded bg-slate-700/50" />
            <div className="h-2.5 w-full rounded bg-slate-800/80" />
            <div className="h-2.5 w-1/3 rounded bg-slate-800/80" />
          </div>

          <div className="h-2.5 w-2.5 shrink-0 rounded-full bg-slate-700/50" />
        </div>
      ))}

      <span className="sr-only">Fetching notification records.</span>
    </div>
  );
}

function EmptyFeed({ hasFilters, onClearFilters }) {
  return (
    <div className="flex min-h-[280px] flex-col items-center justify-center px-5 py-12 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-400/15 bg-cyan-400/[0.06]">
        {hasFilters ? (
          <FiBell className="text-cyan-300" size={25} aria-hidden="true" />
        ) : (
          <FiInbox className="text-cyan-300" size={27} aria-hidden="true" />
        )}
      </div>

      <h3 className="font-['Orbitron'] text-sm font-semibold text-slate-200">
        {hasFilters ? "No matching notifications" : "Inbox is clear"}
      </h3>

      <p className="mt-2 max-w-xs text-xs leading-5 text-slate-400">
        {hasFilters
          ? "Try adjusting your search or filters to find the notification you need."
          : "There are no notifications to display right now. New system activity will appear here."}
      </p>

      {hasFilters && typeof onClearFilters === "function" && (
        <button
          type="button"
          onClick={onClearFilters}
          className="
            mt-5 min-h-10 rounded-lg
            border border-cyan-400/25
            bg-cyan-400/[0.06] px-4 py-2
            text-xs font-medium text-cyan-200
            transition hover:bg-cyan-400/[0.12]
            focus-visible:outline-none focus-visible:ring-2
            focus-visible:ring-cyan-400
            focus-visible:ring-offset-2
            focus-visible:ring-offset-[#030d1b]
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

  // "parent" lets Notifications.jsx own scrolling.
  // "self" keeps this component independently scrollable.
  scrollMode = "parent",
  maxHeight = "calc(100svh - 190px)",
}) {
  const safeNotifications = Array.isArray(notifications)
    ? notifications.filter(
        (notification) =>
          notification !== null &&
          typeof notification === "object" &&
          !Array.isArray(notification)
      )
    : [];

  const groups = useMemo(
    () => groupNotifications(safeNotifications),
    [safeNotifications]
  );

  const selectedId = getNotificationId(selectedNotification);

  const unreadCount = safeNotifications.filter(
    isNotificationUnread
  ).length;

  const canSelectNotifications =
    typeof onSelectNotification === "function";

  const useInternalScroll = scrollMode === "self";

  const errorMessage =
    typeof error === "string" && error.trim()
      ? error.trim()
      : typeof error?.message === "string" && error.message.trim()
        ? error.message.trim()
        : "The notification service could not return the inbox data.";

  return (
    <section
      aria-label="Notification inbox feed"
      aria-busy={loading}
      className="
        relative isolate flex min-h-0 min-w-0 flex-col
        overflow-hidden rounded-2xl
        border border-cyan-400/[0.16]
        bg-[#030d1b]/90
        shadow-[0_18px_55px_rgba(0,0,0,0.22)]
      "
    >
      {/* Background artwork */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none absolute inset-0 z-0
          bg-[url('/images/Notification/streambg.png')]
          bg-cover bg-center bg-no-repeat
          opacity-200
        "
      />

      {/* Contrast overlay */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none absolute inset-0 z-0
          bg-gradient-to-b
          from-[#020914]/75
          via-[#020914]/55
          to-[#020914]/85
        "
      />

      {/* Feed status strip */}
      <div className="relative z-10 flex shrink-0 items-center justify-between gap-3 border-b border-white/[0.08] bg-[#030d1b]/50 px-3 py-3 sm:px-4">
        <div className="flex min-w-0 items-center gap-2">
          <span
            aria-hidden="true"
            className="relative flex h-2 w-2 shrink-0"
          >
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400/40" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-300" />
          </span>

          <span className="truncate text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-300 sm:tracking-[0.17em]">
            Notification stream
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <span className="hidden text-[10px] text-slate-300 sm:inline">
            {safeNotifications.length} loaded
          </span>

          <span className="rounded-md border border-rose-400/20 bg-[#190f20]/85 px-2 py-1 text-[10px] font-semibold tabular-nums text-rose-300">
            {unreadCount} unread
          </span>
        </div>
      </div>

      {/* Notification content.
          In parent mode, this content expands naturally so the
          scroll container in Notifications.jsx can scroll the feed.
          In self mode, this element owns its own scrolling. */}
      <div
        className={[
          "relative z-10 min-w-0 bg-[#030d1b]/15 p-3 sm:p-3.5",
          useInternalScroll
            ? "min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain"
            : "shrink-0 overflow-visible",
        ].join(" ")}
        style={
          useInternalScroll
            ? {
                height: "100%",
                maxHeight,
                scrollbarWidth: "thin",
                scrollbarColor: "rgba(100,116,139,0.45) transparent",
                WebkitOverflowScrolling: "touch",
                overscrollBehaviorY: "contain",
              }
            : undefined
        }
      >
        {loading ? (
          <FeedSkeleton />
        ) : error ? (
          <div
            role="alert"
            className="flex min-h-[260px] flex-col items-center justify-center px-4 text-center"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-rose-400/20 bg-[#190f20]/90">
              <FiRadio
                size={21}
                className="text-rose-300"
                aria-hidden="true"
              />
            </div>

            <h3 className="text-sm font-semibold text-slate-100">
              Unable to load notifications
            </h3>

            <p className="mt-2 max-w-xs break-words text-xs leading-5 text-slate-300">
              {errorMessage}
            </p>

            {typeof onRetry === "function" && (
              <button
                type="button"
                onClick={onRetry}
                className="
                  mt-5 inline-flex min-h-10 items-center justify-center gap-2
                  rounded-lg border border-cyan-400/25
                  bg-[#061323]/90 px-4 py-2
                  text-xs font-medium text-cyan-200
                  transition hover:bg-cyan-400/[0.12]
                  focus-visible:outline-none focus-visible:ring-2
                  focus-visible:ring-cyan-400
                "
              >
                <FiRefreshCw size={13} aria-hidden="true" />
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
                  <h3 className="font-['Orbitron'] text-[9px] font-semibold tracking-[0.15em] text-slate-200">
                    {label}
                  </h3>

                  <span
                    aria-hidden="true"
                    className="h-1 w-1 shrink-0 rounded-full bg-cyan-300 shadow-[0_0_8px_rgba(34,211,238,0.5)]"
                  />

                  <span className="ml-auto text-[9px] tabular-nums text-slate-300">
                    {items.length}
                  </span>
                </div>

                {/* Notification cards */}
                <div className="space-y-1.5">
                  {items.map((notification, index) => {
                    const notificationId =
                      getNotificationId(notification);

                    const key =
                      notificationId != null
                        ? String(notificationId)
                        : `${label}-${getSortTimestamp(notification)}-${index}`;

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

        {!loading &&
          !error &&
          safeNotifications.length > 0 &&
          !canSelectNotifications && (
            <p
              role="status"
              className="mt-3 text-center text-xs text-amber-300"
            >
              Notification selection is unavailable. Check the parent page callback.
            </p>
          )}
      </div>
    </section>
  );
}

export default NotificationFeed;
