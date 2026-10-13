
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  FiBell,
  FiChevronLeft,
  FiX,
} from "react-icons/fi";

import NotificationSidebar from "../../features/notifications/components/NotificationSidebar";
import NotificationToolbar from "../../features/notifications/components/NotificationToolbar";
import NotificationFeed from "../../features/notifications/components/NotificationFeed";
import NotificationDetailPanel from "../../features/notifications/components/NotificationDetailPanel";
import NotificationEmptyState from "../../features/notifications/components/NotificationEmptyState";
import NotificationSkeleton from "../../features/notifications/components/NotificationSkeleton";

import {
  getNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markNotificationAsUnread,
  deleteNotification,
  unwrapResponse,
} from "../../services/notificationService";

const DEFAULT_FILTER = "all";

const PRIORITY_OPTIONS = ["CRITICAL", "HIGH", "MEDIUM", "LOW"];

const CATEGORY_FILTERS = new Set([
  "all",
  "unread",
  "alert",
  "collision",
  "system",
  "warning",
  "info",
]);

function normalizeText(value) {
  return String(value ?? "").trim().toLowerCase();
}

function getNotificationId(notification) {
  return notification?.id ?? notification?._id ?? null;
}

function isNotificationRead(notification) {
  return String(notification?.status ?? "").toUpperCase() === "READ";
}

function getNotificationCategory(notification) {
  return normalizeText(notification?.type ?? "system");
}

function matchesCategory(notification, filter) {
  if (filter === "all") return true;
  if (filter === "unread") return !isNotificationRead(notification);

  return getNotificationCategory(notification) === filter;
}

function matchesSearch(notification, query) {
  if (!query) return true;

  const searchable = [
    notification?.title,
    notification?.message,
    notification?.type,
    notification?.priority,
    notification?.status,
    notification?.notificationCode,
    notification?.alertId,
    notification?.collisionRiskId,
  ]
    .filter((value) => value != null)
    .join(" ");

  return normalizeText(searchable).includes(query);
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

    if (!matchesCategory(notification, activeFilter)) return false;

    const priority = String(notification.priority ?? "").toUpperCase();

    if (priorities.length > 0 && !priorities.includes(priority)) {
      return false;
    }

    return matchesSearch(notification, query);
  });
}

function getResponseBody(response) {
  const body = response?.data ?? response;
  return unwrapResponse(body);
}

function getNotificationPage(response) {
  const body = getResponseBody(response);

  if (Array.isArray(body)) {
    return { items: body, totalElements: body.length };
  }

  const page = body?.data ?? body?.result ?? body;

  const items =
    page?.content ??
    page?.items ??
    page?.notifications ??
    page?.records ??
    [];

  return {
    items: Array.isArray(items) ? items.filter(Boolean) : [],
    totalElements:
      Number(page?.totalElements ?? page?.totalItems ?? page?.total ?? items.length) ||
      0,
  };
}

function getErrorMessage(error) {
  return (
    error?.response?.data?.message ??
    error?.response?.data?.error ??
    error?.message ??
    "Unable to load notifications. Please try again."
  );
}

function Notifications({
  notifications: suppliedNotifications,
  loading: suppliedLoading,
  refreshing: suppliedRefreshing,
  error: suppliedError,
  recipientId,
  onRefresh,
  onMarkRead,
  onMarkUnread,
  onMarkAllRead,
  onArchive,
  onDelete,
}) {
  const [remoteNotifications, setRemoteNotifications] = useState([]);
  const [remoteTotal, setRemoteTotal] = useState(0);
  const [remoteUnreadCount, setRemoteUnreadCount] = useState(null);
  const [remoteLoading, setRemoteLoading] = useState(true);
  const [remoteRefreshing, setRemoteRefreshing] = useState(false);
  const [remoteError, setRemoteError] = useState(null);

  const [activeFilter, setActiveFilter] = useState(DEFAULT_FILTER);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [selectedPriorities, setSelectedPriorities] = useState([]);
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false);

  const isControlled = Array.isArray(suppliedNotifications);

  const notificationList = useMemo(
    () =>
      (isControlled ? suppliedNotifications : remoteNotifications).filter(Boolean),
    [isControlled, suppliedNotifications, remoteNotifications]
  );

  const loading = suppliedLoading ?? remoteLoading;
  const refreshing = suppliedRefreshing ?? remoteRefreshing;
  const error = suppliedError ?? remoteError;

  const loadNotifications = useCallback(
    async ({ refresh = false } = {}) => {
      if (isControlled) {
        if (refresh) onRefresh?.();
        return;
      }

      if (refresh) {
        setRemoteRefreshing(true);
      } else {
        setRemoteLoading(true);
      }

      setRemoteError(null);

      try {
        const params = {
          page: 0,
          size: 100,
          sortBy: "createdAt",
          direction: "DESC",
        };

        if (activeFilter === "unread") params.status = "UNREAD";
        else if (activeFilter !== "all" && CATEGORY_FILTERS.has(activeFilter)) {
          params.type = activeFilter.toUpperCase();
        }

        if (selectedPriorities.length === 1) {
          params.priority = selectedPriorities[0];
        }

        if (searchQuery.trim()) {
          params.keyword = searchQuery.trim();
        }

        const response = await getNotifications(params);
        const page = getNotificationPage(response);

        setRemoteNotifications(page.items);
        setRemoteTotal(page.totalElements);

        if (recipientId != null && String(recipientId).trim()) {
          try {
            const countResponse = await getUnreadNotificationCount(recipientId);
            const countBody = getResponseBody(countResponse);
            const countValue =
              typeof countBody === "number"
                ? countBody
                : Number(
                    countBody?.count ??
                    countBody?.unreadCount ??
                    countBody?.data?.count
                  );

            if (Number.isFinite(countValue)) {
              setRemoteUnreadCount(countValue);
            }
          } catch {
            // Keep the inbox usable if the separate unread-count request fails.
          }
        }
      } catch (requestError) {
        setRemoteError(getErrorMessage(requestError));
      } finally {
        setRemoteLoading(false);
        setRemoteRefreshing(false);
      }
    },
    [
      isControlled,
      onRefresh,
      activeFilter,
      selectedPriorities,
      searchQuery,
      recipientId,
    ]
  );

  useEffect(() => {
    void loadNotifications();
  }, [loadNotifications]);

  const filteredNotifications = useMemo(
    () =>
      filterNotifications(
        notificationList,
        activeFilter,
        searchQuery,
        selectedPriorities
      ),
    [notificationList, activeFilter, searchQuery, selectedPriorities]
  );

  const selectedNotification = useMemo(
    () =>
      selectedId == null
        ? null
        : notificationList.find(
            (item) => String(getNotificationId(item)) === String(selectedId)
          ) ?? null,
    [notificationList, selectedId]
  );

  const unreadCount = useMemo(
    () =>
      remoteUnreadCount ??
      notificationList.filter((item) => !isNotificationRead(item)).length,
    [remoteUnreadCount, notificationList]
  );

  const categoryCounts = useMemo(() => {
    const counts = {
      all: remoteTotal || notificationList.length,
      unread: unreadCount,
      alert: 0,
      collision: 0,
      system: 0,
      warning: 0,
      info: 0,
    };

    for (const notification of notificationList) {
      const category = getNotificationCategory(notification);
      if (Object.hasOwn(counts, category) && category !== "all" && category !== "unread") {
        counts[category] += 1;
      }
    }

    return counts;
  }, [notificationList, remoteTotal, unreadCount]);

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
    void loadNotifications({ refresh: true });
  }, [loadNotifications]);

  const updateReadStatus = useCallback(
    async (notification, action) => {
      const id = getNotificationId(notification);
      if (id == null) return;

      const callback = action === "READ" ? onMarkRead : onMarkUnread;

      try {
        if (callback) {
          await callback(notification);
        } else if (action === "READ") {
          await markNotificationAsRead(id);
        } else {
          await markNotificationAsUnread(id);
        }

        if (!isControlled) {
          setRemoteNotifications((current) =>
            current.map((item) =>
              String(getNotificationId(item)) === String(id)
                ? { ...item, status: action, readAt: action === "READ" ? new Date().toISOString() : null }
                : item
            )
          );
          setRemoteUnreadCount((current) =>
            current == null
              ? current
              : Math.max(0, current + (action === "READ" ? -1 : 1))
          );
        }

        await loadNotifications({ refresh: true });
      } catch (requestError) {
        setRemoteError(getErrorMessage(requestError));
      }
    },
    [onMarkRead, onMarkUnread, isControlled, loadNotifications]
  );

  const handleMarkRead = useCallback(
    (notification) => updateReadStatus(notification, "READ"),
    [updateReadStatus]
  );

  const handleMarkUnread = useCallback(
    (notification) => updateReadStatus(notification, "UNREAD"),
    [updateReadStatus]
  );

  const handleDelete = useCallback(
    async (notification) => {
      const id = getNotificationId(notification);
      if (id == null) return;

      try {
        if (onDelete) {
          await onDelete(notification);
        } else {
          await deleteNotification(id);
        }

        if (!isControlled) {
          setRemoteNotifications((current) =>
            current.filter(
              (item) => String(getNotificationId(item)) !== String(id)
            )
          );
        }

        if (String(selectedId) === String(id)) handleCloseDetail();

        await loadNotifications({ refresh: true });
      } catch (requestError) {
        setRemoteError(getErrorMessage(requestError));
      }
    },
    [onDelete, isControlled, selectedId, handleCloseDetail, loadNotifications]
  );

  const handleArchive = useCallback(
    async (notification) => {
      // The backend has soft-delete, not a separate archive operation.
      if (onArchive) {
        await onArchive(notification);
        return;
      }

      await handleDelete(notification);
    },
    [onArchive, handleDelete]
  );

  const handleMarkAllRead = useCallback(async () => {
    // No bulk mark-as-read endpoint exists in the current backend contract.
    // Use an existing parent implementation if one was provided.
    if (onMarkAllRead) {
      await onMarkAllRead();
      await loadNotifications({ refresh: true });
    }
  }, [onMarkAllRead, loadNotifications]);

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
        Select a notification from the inbox to inspect its details and available actions.
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
    <main className="relative isolate z-10 h-[calc(100svh-68px)] min-h-0 w-full min-w-0 overflow-hidden font-['Inter'] text-slate-100">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-36 left-[25%] h-96 w-96 rounded-full bg-cyan-500/[0.035] blur-[110px]" />
        <div className="absolute right-0 top-24 h-80 w-80 rounded-full bg-blue-600/[0.04] blur-[100px]" />
      </div>

      <div className="grid h-full min-h-0 min-w-0 grid-cols-1 gap-3 p-3 sm:p-4 xl:grid-cols-[minmax(190px,0.75fr)_minmax(0,1.8fr)_minmax(300px,1.25fr)] 2xl:grid-cols-[225px_minmax(0,1fr)_365px]">
        <aside
          aria-label="Notification filters"
          className="hidden min-h-0 min-w-0 overflow-y-auto overscroll-contain rounded-xl border border-cyan-400/15 bg-[#040d1b]/95 [scrollbar-width:thin] [scrollbar-color:rgba(80,190,220,0.25)_transparent] md:block"
        >
          <NotificationSidebar
            activeFilter={activeFilter}
            onFilterChange={(filter) => {
              const normalized = normalizeText(filter);
              setActiveFilter(CATEGORY_FILTERS.has(normalized) ? normalized : DEFAULT_FILTER);
            }}
            selectedPriorities={selectedPriorities}
            onPriorityToggle={handlePriorityToggle}
            counts={categoryCounts}
            unreadCount={unreadCount}
            onResetFilters={handleResetFilters}
          />
        </aside>

        <section
          aria-label="Notification inbox"
          className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden rounded-xl border border-cyan-400/15 bg-[#040d1b]/95 shadow-[0_18px_60px_rgba(0,0,0,0.18)]"
        >
          <div className="shrink-0 border-b border-white/[0.07] bg-[#061121]/95 p-3">
            <NotificationToolbar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onMarkAllRead={handleMarkAllRead}
              onRefresh={handleRefresh}
              refreshing={refreshing}
              unreadCount={unreadCount}
            />

            {error && (
              <div role="alert" className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-rose-400/20 bg-rose-500/[0.07] px-3 py-2.5">
                <p className="min-w-0 text-xs leading-5 text-rose-200">
                  {typeof error === "string" ? error : error?.message ?? "Please retry the request."}
                </p>
                <button
                  type="button"
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="shrink-0 text-xs text-cyan-200 hover:text-cyan-100 disabled:opacity-50"
                >
                  Retry
                </button>
              </div>
            )}

            <div className="mt-3 flex items-center justify-between gap-3 text-[11px] text-slate-500">
              <span>
                <span className="mr-1.5 text-cyan-300">●</span>
                {filteredNotifications.length} notifications shown
              </span>
              <span className="text-rose-300">{unreadCount} unread</span>
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
              of {remoteTotal || notificationList.length} loaded notifications
            </p>
            <span className="flex items-center gap-2 text-[9px] uppercase tracking-[0.14em] text-slate-500">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
              Mission communications
            </span>
          </footer>
        </section>

        <aside
          aria-label="Selected notification details"
          className="hidden min-h-0 min-w-0 overflow-y-auto overscroll-contain rounded-xl border border-cyan-400/15 bg-[#040d1b]/95 [scrollbar-width:thin] [scrollbar-color:rgba(80,190,220,0.25)_transparent] xl:block"
        >
          {detailContent}
        </aside>
      </div>

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
            className="relative z-10 flex max-h-[90svh] w-full max-w-[700px] flex-col overflow-hidden rounded-t-2xl border border-cyan-400/20 bg-[#061121] shadow-2xl sm:mb-5 sm:rounded-2xl"
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

            <div className="min-h-0 overflow-y-auto">{detailContent}</div>
          </section>
        </div>
      )}
    </main>
  );
}

export default Notifications;
