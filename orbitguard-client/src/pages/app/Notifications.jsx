
import { useCallback, useMemo, useState } from "react";

import {
  FiBell,
  FiChevronLeft,
  FiInbox,
  FiRefreshCw,
  FiX,
} from "react-icons/fi";

import NotificationSidebar from "../../features/notifications/components/NotificationSidebar";
import NotificationToolbar from "../../features/notifications/components/NotificationToolbar";
import NotificationFeed from "../../features/notifications/components/NotificationFeed";
import NotificationDetailPanel from "../../features/notifications/components/NotificationDetailPanel";
import NotificationEmptyState from "../../features/notifications/components/NotificationEmptyState";
import NotificationSkeleton from "../../features/notifications/components/NotificationSkeleton";

const DEFAULT_FILTER = "all";

const PRIORITY_OPTIONS = [
  "CRITICAL",
  "HIGH",
  "MEDIUM",
  "LOW",
];

function normalizeText(value) {
  return String(value ?? "").trim().toLowerCase();
}

function getNotificationId(notification) {
  return notification?.id ?? notification?._id ?? null;
}

function isNotificationRead(notification) {
  if (typeof notification?.read === "boolean") {
    return notification.read;
  }

  if (typeof notification?.isRead === "boolean") {
    return notification.isRead;
  }

  return String(notification?.status ?? "").toUpperCase() === "READ";
}

function getNotificationCategory(notification) {
  return normalizeText(
    notification?.category ?? notification?.type ?? "system"
  );
}

function matchesCategory(notification, filter) {
  if (filter === "all") return true;

  const category = getNotificationCategory(notification);
  const type = normalizeText(notification?.type);

  if (filter === "unread") {
    return !isNotificationRead(notification);
  }

  if (filter === "mentions") {
    return category.includes("mention") || type.includes("mention");
  }

  if (filter === "system") {
    return category.includes("system") || type.includes("system");
  }

  if (filter === "updates") {
    return (
      category.includes("update") ||
      category.includes("data") ||
      type.includes("update")
    );
  }

  if (filter === "security") {
    return (
      category.includes("security") ||
      type.includes("security")
    );
  }

  return category === filter || type === filter;
}

function matchesSearch(notification, query) {
  if (!query) return true;

  const searchable = [
    notification?.title,
    notification?.message,
    notification?.description,
    notification?.type,
    notification?.category,
    notification?.notificationCode,
    notification?.source,
    notification?.satelliteName,
    notification?.noradId,
  ]
    .filter((value) => value != null)
    .join(" ")
    .toLowerCase();

  return searchable.includes(query);
}

function filterNotifications(
  notifications,
  activeFilter,
  searchQuery,
  priorities
) {
  const query = normalizeText(searchQuery);

  return notifications.filter((notification) => {
    if (!notification) return false;

    if (!matchesCategory(notification, activeFilter)) {
      return false;
    }

    const priority = String(
      notification.priority ?? ""
    ).toUpperCase();

    if (
      priorities.length > 0 &&
      !priorities.includes(priority)
    ) {
      return false;
    }

    return matchesSearch(notification, query);
  });
}

function Notifications({
  notifications = [],
  loading = false,
  refreshing = false,
  error = null,
  onRefresh,
  onMarkRead,
  onMarkUnread,
  onMarkAllRead,
  onArchive,
  onDelete,
}) {
  const [activeFilter, setActiveFilter] = useState(DEFAULT_FILTER);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [selectedPriorities, setSelectedPriorities] = useState([]);
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false);

  const notificationList = useMemo(
    () =>
      Array.isArray(notifications)
        ? notifications.filter(Boolean)
        : [],
    [notifications]
  );

  const filteredNotifications = useMemo(
    () =>
      filterNotifications(
        notificationList,
        activeFilter,
        searchQuery,
        selectedPriorities
      ),
    [
      notificationList,
      activeFilter,
      searchQuery,
      selectedPriorities,
    ]
  );

  const selectedNotification = useMemo(
    () =>
      selectedId == null
        ? null
        : notificationList.find(
            (item) =>
              String(getNotificationId(item)) === String(selectedId)
          ) ?? null,
    [notificationList, selectedId]
  );

  const unreadCount = useMemo(
    () =>
      notificationList.filter(
        (item) => !isNotificationRead(item)
      ).length,
    [notificationList]
  );

  const categoryCounts = useMemo(() => {
    const counts = {
      all: notificationList.length,
      unread: unreadCount,
      mentions: 0,
      system: 0,
      updates: 0,
      security: 0,
    };

    for (const notification of notificationList) {
      const category = getNotificationCategory(notification);

      if (category.includes("mention")) counts.mentions += 1;
      if (category.includes("system")) counts.system += 1;

      if (
        category.includes("update") ||
        category.includes("data")
      ) {
        counts.updates += 1;
      }

      if (category.includes("security")) counts.security += 1;
    }

    return counts;
  }, [notificationList, unreadCount]);

  const handleSelectNotification = useCallback((notification) => {
    const id = getNotificationId(notification);

    if (id == null) return;

    setSelectedId(id);
    setMobileDetailOpen(true);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setMobileDetailOpen(false);
    setSelectedId(null);
  }, []);

  const handlePriorityToggle = useCallback((priority) => {
    if (!PRIORITY_OPTIONS.includes(priority)) return;

    setSelectedPriorities((current) =>
      current.includes(priority)
        ? current.filter((item) => item !== priority)
        : [...current, priority]
    );
  }, []);

  const handleResetFilters = useCallback(() => {
    setActiveFilter(DEFAULT_FILTER);
    setSearchQuery("");
    setSelectedPriorities([]);
  }, []);

  const handleRefresh = useCallback(() => {
    onRefresh?.();
  }, [onRefresh]);

  const handleMarkRead = useCallback(
    (notification) => {
      const id = getNotificationId(notification);
      if (id != null) onMarkRead?.(id);
    },
    [onMarkRead]
  );

  const handleMarkUnread = useCallback(
    (notification) => {
      const id = getNotificationId(notification);
      if (id != null) onMarkUnread?.(id);
    },
    [onMarkUnread]
  );

  const handleArchive = useCallback(
    (notification) => {
      const id = getNotificationId(notification);
      if (id != null) onArchive?.(id);
    },
    [onArchive]
  );

  const handleDelete = useCallback(
    (notification) => {
      const id = getNotificationId(notification);
      if (id != null) onDelete?.(id);
    },
    [onDelete]
  );

  if (loading && notificationList.length === 0) {
    return (
      <div className="h-[calc(100svh-68px)] min-h-0 overflow-hidden p-3 sm:p-4">
        <NotificationSkeleton layout="workspace" />
      </div>
    );
  }

  const detailContent = selectedNotification ? (
    <NotificationDetailPanel
      notification={selectedNotification}
      onClose={handleCloseDetail}
      onMarkRead={handleMarkRead}
      onMarkUnread={handleMarkUnread}
      onArchive={handleArchive}
      onDelete={handleDelete}
    />
  ) : (
    <div className="flex h-full min-h-[280px] flex-col items-center justify-center px-6 py-10 text-center">
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.06]">
        <FiBell size={24} className="text-cyan-300/80" />
      </div>

      <h2 className="font-['Orbitron'] text-sm font-semibold text-slate-200">
        Notification Intelligence
      </h2>

      <p className="mt-3 max-w-[260px] text-xs leading-6 text-slate-500">
        Select a notification from the inbox to inspect its details
        and available actions.
      </p>

      <div className="mt-6 flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-cyan-400/80" />
        <span className="text-[10px] uppercase tracking-[0.16em] text-slate-600">
          Awaiting selection
        </span>
      </div>
    </div>
  );

  return (
    <main
      className="
        relative isolate z-10
        h-[calc(100svh-68px)] min-h-0
        w-full min-w-0 overflow-hidden
        font-['Inter'] text-slate-100
      "
    >
      {/* Subtle ambient lighting */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute -top-36 left-[25%] h-96 w-96 rounded-full bg-cyan-500/[0.035] blur-[110px]" />
        <div className="absolute right-0 top-24 h-80 w-80 rounded-full bg-blue-600/[0.04] blur-[100px]" />
      </div>

      <div className="grid h-full min-h-0 min-w-0 grid-cols-1 gap-3 p-3 sm:p-4 xl:grid-cols-[minmax(190px,0.75fr)_minmax(0,1.8fr)_minmax(300px,1.25fr)] 2xl:grid-cols-[225px_minmax(0,1fr)_365px]">
        {/* LEFT PANEL: fixed within the workspace */}
        <aside
          aria-label="Notification filters"
          className="
            hidden min-h-0 min-w-0
            overflow-y-auto overscroll-contain
            rounded-xl border border-cyan-400/15
            bg-[#040d1b]/95
            [scrollbar-width:thin]
            [scrollbar-color:rgba(80,190,220,0.25)_transparent]
            md:block
          "
        >
          <NotificationSidebar
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
            selectedPriorities={selectedPriorities}
            onPriorityToggle={handlePriorityToggle}
            counts={categoryCounts}
            unreadCount={unreadCount}
            onResetFilters={handleResetFilters}
          />
        </aside>

        {/* CENTER PANEL: toolbar and footer stay still;
            only the feed body scrolls. */}
        <section
          aria-label="Notification inbox"
          className="
            flex h-full min-h-0 min-w-0 flex-col
            overflow-hidden rounded-xl
            border border-cyan-400/15
            bg-[#040d1b]/95
            shadow-[0_18px_60px_rgba(0,0,0,0.18)]
          "
        >
          <div className="shrink-0 border-b border-white/[0.07] bg-[#061121]/95 p-3">
            <NotificationToolbar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onMarkAllRead={onMarkAllRead}
              onRefresh={handleRefresh}
              refreshing={refreshing}
              unreadCount={unreadCount}
            />

            {error && (
              <div
                role="alert"
                className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-rose-400/20 bg-rose-500/[0.07] px-3 py-2.5"
              >
                <p className="min-w-0 text-xs leading-5 text-rose-200">
                  {typeof error === "string"
                    ? error
                    : error?.message ?? "Please retry the request."}
                </p>

                {onRefresh && (
                  <button
                    type="button"
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="shrink-0 text-xs text-cyan-200 hover:text-cyan-100 disabled:opacity-50"
                  >
                    Retry
                  </button>
                )}
              </div>
            )}

            <div className="mt-3 flex items-center justify-between gap-3 text-[11px] text-slate-500">
              <span>
                <span className="mr-1.5 text-cyan-300">●</span>
                {filteredNotifications.length} notifications
              </span>

              <span className="text-rose-300">
                {unreadCount} unread
              </span>
            </div>
          </div>

          <div className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain p-3 [scrollbar-width:thin] [scrollbar-color:rgba(80,190,220,0.28)_transparent]">
            {filteredNotifications.length > 0 ? (
              <NotificationFeed
                notifications={filteredNotifications}
                selectedId={selectedId}
                onSelect={handleSelectNotification}
                onMarkRead={handleMarkRead}
              />
            ) : (
              <NotificationEmptyState
                hasFilters={
                  activeFilter !== DEFAULT_FILTER ||
                  searchQuery.trim().length > 0 ||
                  selectedPriorities.length > 0
                }
                onReset={handleResetFilters}
              />
            )}
          </div>

          <footer className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-t border-white/[0.07] bg-[#061121]/95 px-3 py-2.5">
            <p className="text-[10px] text-slate-500">
              Showing{" "}
              <span className="font-medium text-cyan-200">
                {filteredNotifications.length}
              </span>{" "}
              of {notificationList.length} notifications
            </p>

            <span className="flex items-center gap-2 text-[9px] uppercase tracking-[0.14em] text-slate-500">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
              Mission communications
            </span>
          </footer>
        </section>

        {/* RIGHT PANEL: fixed alongside the center feed */}
        <aside
          aria-label="Selected notification details"
          className="
            hidden min-h-0 min-w-0
            overflow-y-auto overscroll-contain
            rounded-xl border border-cyan-400/15
            bg-[#040d1b]/95
            [scrollbar-width:thin]
            [scrollbar-color:rgba(80,190,220,0.25)_transparent]
            xl:block
          "
        >
          {detailContent}
        </aside>
      </div>

      {/* Mobile/tablet detail drawer */}
      {mobileDetailOpen && selectedNotification && (
        <div className="fixed inset-0 z-[90] flex items-end justify-center xl:hidden">
          <button
            type="button"
            aria-label="Close notification details"
            onClick={handleCloseDetail}
            className="absolute inset-0 bg-[#01040c]/80 backdrop-blur-md"
          />

          <section
            role="dialog"
            aria-modal="true"
            aria-label="Notification details"
            className="
              relative z-10 flex max-h-[90svh]
              w-full max-w-[700px] flex-col
              overflow-hidden rounded-t-2xl
              border border-cyan-400/20
              bg-[#061121] shadow-2xl
              sm:mb-5 sm:rounded-2xl
            "
          >
            <div className="flex shrink-0 items-center justify-between border-b border-white/[0.07] px-4 py-3">
              <button
                type="button"
                onClick={handleCloseDetail}
                className="inline-flex items-center gap-2 text-xs text-slate-300 hover:text-cyan-200"
              >
                <FiChevronLeft size={16} />
                Back to inbox
              </button>

              <button
                type="button"
                onClick={handleCloseDetail}
                aria-label="Close details"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-slate-400 hover:bg-white/5 hover:text-white"
              >
                <FiX size={16} />
              </button>
            </div>

            <div className="min-h-0 overflow-y-auto">
              {detailContent}
            </div>
          </section>
        </div>
      )}
    </main>
  );
}

export default Notifications;
