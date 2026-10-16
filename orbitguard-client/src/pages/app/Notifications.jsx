
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FiBell, FiChevronLeft, FiX } from "react-icons/fi";

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
const DEFAULT_DATE_RANGE = "7_DAYS";
const FETCH_SIZE = 100;

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

const DATE_RANGES = new Set([
  "24_HOURS",
  "7_DAYS",
  "30_DAYS",
  "90_DAYS",
  "ALL_TIME",
]);

function normalizeText(value) {
  return String(value ?? "").trim().toLowerCase();
}

function getNotificationKey(notification) {
  return (
    notification?.id ??
    notification?._id ??
    notification?.notificationCode ??
    notification?.notificationId ??
    null
  );
}

function getApiNotificationId(notification) {
  return notification?.id ?? notification?._id ?? null;
}

function getNotificationStatus(notification) {
  return String(notification?.status ?? "").trim().toUpperCase();
}

function isNotificationRead(notification) {
  return getNotificationStatus(notification) === "READ";
}

function isNotificationUnread(notification) {
  return getNotificationStatus(notification) === "UNREAD";
}

function getNotificationCategory(notification) {
  return normalizeText(notification?.type ?? "system");
}

function matchesCategory(notification, filter) {
  if (filter === "all") return true;

  if (filter === "unread") {
    return isNotificationUnread(notification);
  }

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
    notification?.recipientId,
    notification?.alertId,
    notification?.collisionRiskId,
  ]
    .filter((value) => value !== null && value !== undefined)
    .join(" ");

  return normalizeText(searchable).includes(query);
}

function matchesDateRange(notification, dateRange) {
  if (!dateRange || dateRange === "ALL_TIME") return true;

  const timestamp = new Date(notification?.createdAt ?? "").getTime();

  if (!Number.isFinite(timestamp)) return false;

  const rangeMilliseconds = {
    "24_HOURS": 24 * 60 * 60 * 1000,
    "7_DAYS": 7 * 24 * 60 * 60 * 1000,
    "30_DAYS": 30 * 24 * 60 * 60 * 1000,
    "90_DAYS": 90 * 24 * 60 * 60 * 1000,
  };

  const limit = rangeMilliseconds[dateRange];

  if (!limit) return true;

  const now = Date.now();

  return timestamp >= now - limit && timestamp <= now;
}

function filterNotifications(
  notifications,
  activeFilter,
  searchQuery,
  priorities,
  dateRange,
  readStatus,
) {
  const query = normalizeText(searchQuery);

  return notifications.filter((notification) => {
    if (
      !notification ||
      typeof notification !== "object" ||
      Array.isArray(notification)
    ) {
      return false;
    }

    if (!matchesCategory(notification, activeFilter)) return false;

    const priority = String(notification?.priority ?? "")
      .trim()
      .toUpperCase();

    if (priorities.length > 0 && !priorities.includes(priority)) {
      return false;
    }

    if (!matchesDateRange(notification, dateRange)) return false;

    if (readStatus === "UNREAD" && !isNotificationUnread(notification)) {
      return false;
    }

    if (readStatus === "READ" && !isNotificationRead(notification)) {
      return false;
    }

    return matchesSearch(notification, query);
  });
}

function getResponseBody(response) {
  return unwrapResponse(response?.data ?? response);
}

function getNotificationPage(response) {
  const body = getResponseBody(response);
  const page = body?.data ?? body?.result ?? body;

  if (Array.isArray(page)) {
    return {
      items: page.filter(
        (item) =>
          item &&
          typeof item === "object" &&
          !Array.isArray(item),
      ),
      totalElements: page.length,
    };
  }

  const items =
    page?.content ??
    page?.items ??
    page?.notifications ??
    page?.records ??
    [];

  const validItems = Array.isArray(items)
    ? items.filter(
        (item) =>
          item &&
          typeof item === "object" &&
          !Array.isArray(item),
      )
    : [];

  const parsedTotal = Number(
    page?.totalElements ??
      page?.totalItems ??
      page?.total ??
      validItems.length,
  );

  return {
    items: validItems,
    totalElements:
      Number.isFinite(parsedTotal) && parsedTotal >= 0
        ? parsedTotal
        : validItems.length,
  };
}

function getUnreadCountFromResponse(response) {
  const body = getResponseBody(response);

  const value =
    typeof body === "number"
      ? body
      : body?.count ??
        body?.unreadCount ??
        body?.data?.count ??
        body?.data?.unreadCount;

  const count = Number(value);

  return Number.isFinite(count) && count >= 0 ? count : null;
}

function getErrorMessage(error) {
  return (
    error?.response?.data?.message ??
    error?.response?.data?.error ??
    error?.message ??
    "Unable to load notifications. Please try again."
  );
}

export default function Notifications({
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
  const [dateRange, setDateRange] = useState(DEFAULT_DATE_RANGE);
  const [readStatus, setReadStatus] = useState("ALL");
  const [sortBy, setSortBy] = useState("NEWEST");

  const [mobileDetailOpen, setMobileDetailOpen] = useState(false);
  const [markingAllRead, setMarkingAllRead] = useState(false);
  const [updatingNotificationId, setUpdatingNotificationId] = useState(null);
  const [deletingNotificationId, setDeletingNotificationId] = useState(null);

  const isControlled = Array.isArray(suppliedNotifications);

  // Prevent older requests from overwriting newer responses.
  const requestSequenceRef = useRef(0);
  const countRequestSequenceRef = useRef(0);
  const mountedRef = useRef(false);

  const notificationList = useMemo(() => {
    const source = isControlled
      ? suppliedNotifications
      : remoteNotifications;

    return Array.isArray(source)
      ? source.filter(
          (item) =>
            item &&
            typeof item === "object" &&
            !Array.isArray(item),
        )
      : [];
  }, [isControlled, suppliedNotifications, remoteNotifications]);

  const loading = suppliedLoading ?? remoteLoading;
  const refreshing = suppliedRefreshing ?? remoteRefreshing;
  const error = suppliedError ?? remoteError;

  const loadNotifications = useCallback(
    async ({ refresh = false } = {}) => {
      if (isControlled) {
        if (refresh && typeof onRefresh === "function") {
          await onRefresh();
        }
        return;
      }

      const requestId = ++requestSequenceRef.current;

      if (refresh) {
        setRemoteRefreshing(true);
      } else {
        setRemoteLoading(true);
      }

      setRemoteError(null);

      try {
        const response = await getNotifications({
          page: 0,
          size: FETCH_SIZE,
          sortBy: "createdAt",
          direction: "DESC",
        });

        const page = getNotificationPage(response);

        if (
          !mountedRef.current ||
          requestId !== requestSequenceRef.current
        ) {
          return;
        }

        setRemoteNotifications(page.items);
        setRemoteTotal(page.totalElements);

        // Only request the count when a recipient is known.
        if (recipientId != null && String(recipientId).trim()) {
          const countRequestId = ++countRequestSequenceRef.current;

          try {
            const countResponse =
              await getUnreadNotificationCount(recipientId);

            const count = getUnreadCountFromResponse(countResponse);

            if (
              mountedRef.current &&
              countRequestId === countRequestSequenceRef.current &&
              count !== null
            ) {
              setRemoteUnreadCount(count);
            }
          } catch {
            // The inbox remains usable if the count endpoint fails.
          }
        } else {
          ++countRequestSequenceRef.current;
          setRemoteUnreadCount(null);
        }
      } catch (requestError) {
        if (
          mountedRef.current &&
          requestId === requestSequenceRef.current
        ) {
          setRemoteError(getErrorMessage(requestError));
        }
      } finally {
        if (
          mountedRef.current &&
          requestId === requestSequenceRef.current
        ) {
          setRemoteLoading(false);
          setRemoteRefreshing(false);
        }
      }
    },
    [isControlled, onRefresh, recipientId],
  );

  useEffect(() => {
    mountedRef.current = true;
    void loadNotifications();

    return () => {
      mountedRef.current = false;
      ++requestSequenceRef.current;
      ++countRequestSequenceRef.current;
    };
  }, [loadNotifications]);

  const filteredNotifications = useMemo(() => {
    const filtered = filterNotifications(
      notificationList,
      activeFilter,
      searchQuery,
      selectedPriorities,
      dateRange,
      readStatus,
    );

    return [...filtered].sort((a, b) => {
      const first = new Date(a?.createdAt ?? "").getTime();
      const second = new Date(b?.createdAt ?? "").getTime();

      const firstTime = Number.isFinite(first) ? first : 0;
      const secondTime = Number.isFinite(second) ? second : 0;

      return sortBy === "OLDEST"
        ? firstTime - secondTime
        : secondTime - firstTime;
    });
  }, [
    notificationList,
    activeFilter,
    searchQuery,
    selectedPriorities,
    dateRange,
    readStatus,
    sortBy,
  ]);

  const selectedNotification = useMemo(() => {
    if (selectedId == null) return null;

    return (
      notificationList.find(
        (item) =>
          String(getNotificationKey(item)) === String(selectedId),
      ) ?? null
    );
  }, [notificationList, selectedId]);

  const unreadCount = useMemo(() => {
    if (remoteUnreadCount !== null && !isControlled) {
      return remoteUnreadCount;
    }

    return notificationList.filter(isNotificationUnread).length;
  }, [remoteUnreadCount, isControlled, notificationList]);

  const categoryCounts = useMemo(() => {
    const counts = {
      all: isControlled
        ? notificationList.length
        : remoteTotal,
      unread: unreadCount,
      alert: 0,
      collision: 0,
      system: 0,
      warning: 0,
      info: 0,
    };

    for (const notification of notificationList) {
      const category = getNotificationCategory(notification);

      if (
        Object.hasOwn(counts, category) &&
        category !== "all" &&
        category !== "unread"
      ) {
        counts[category] += 1;
      }
    }

    return counts;
  }, [notificationList, remoteTotal, unreadCount, isControlled]);

  const handleSelectNotification = useCallback((notification) => {
    const key = getNotificationKey(notification);

    if (key == null) return;

    setSelectedId(key);
    setMobileDetailOpen(true);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setMobileDetailOpen(false);
    setSelectedId(null);
  }, []);

  const handlePriorityToggle = useCallback((priority) => {
    const normalized = String(priority ?? "")
      .trim()
      .toUpperCase();

    if (!PRIORITY_OPTIONS.includes(normalized)) return;

    setSelectedPriorities((current) =>
      current.includes(normalized)
        ? current.filter((item) => item !== normalized)
        : [...current, normalized],
    );
  }, []);

  const handleResetFilters = useCallback(() => {
    setActiveFilter(DEFAULT_FILTER);
    setSearchQuery("");
    setSelectedPriorities([]);
    setDateRange(DEFAULT_DATE_RANGE);
    setReadStatus("ALL");
  }, []);

  const handleRefresh = useCallback(() => {
    void loadNotifications({ refresh: true });
  }, [loadNotifications]);

  const updateReadStatus = useCallback(
    async (notification, action) => {
      const id = getApiNotificationId(notification);

      if (id == null || !["READ", "UNREAD"].includes(action)) {
        setRemoteError("This notification has no usable backend ID.");
        return;
      }

      if (updatingNotificationId != null || markingAllRead) return;

      const previousStatus = isNotificationRead(notification)
        ? "READ"
        : "UNREAD";

      setUpdatingNotificationId(id);

      if (!isControlled) {
        setRemoteError(null);
      }

      try {
        const callback = action === "READ" ? onMarkRead : onMarkUnread;

        if (typeof callback === "function") {
          await callback(notification);
        } else if (action === "READ") {
          await markNotificationAsRead(id);
        } else {
          await markNotificationAsUnread(id);
        }

        if (!isControlled) {
          const now = new Date().toISOString();

          setRemoteNotifications((current) =>
            current.map((item) =>
              String(getApiNotificationId(item)) === String(id)
                ? {
                    ...item,
                    status: action,
                    readAt: action === "READ" ? now : null,
                  }
                : item,
            ),
          );

          setRemoteUnreadCount((current) => {
            if (current == null || previousStatus === action) {
              return current;
            }

            return Math.max(
              0,
              current + (action === "READ" ? -1 : 1),
            );
          });
        }

        await loadNotifications({ refresh: true });
      } catch (requestError) {
        if (!isControlled) {
          setRemoteError(getErrorMessage(requestError));
        }
      } finally {
        setUpdatingNotificationId(null);
      }
    },
    [
      updatingNotificationId,
      markingAllRead,
      onMarkRead,
      onMarkUnread,
      isControlled,
      loadNotifications,
    ],
  );

  const handleMarkRead = useCallback(
    (notification) => updateReadStatus(notification, "READ"),
    [updateReadStatus],
  );

  const handleMarkUnread = useCallback(
    (notification) => updateReadStatus(notification, "UNREAD"),
    [updateReadStatus],
  );

  const handleDelete = useCallback(
    async (notification) => {
      const id = getApiNotificationId(notification);

      if (id == null) {
        setRemoteError("This notification has no usable backend ID.");
        return;
      }

      if (deletingNotificationId != null || markingAllRead) return;

      setDeletingNotificationId(id);

      if (!isControlled) {
        setRemoteError(null);
      }

      try {
        if (typeof onDelete === "function") {
          await onDelete(notification);
        } else {
          await deleteNotification(id);
        }

        if (!isControlled) {
          setRemoteNotifications((current) =>
            current.filter(
              (item) =>
                String(getApiNotificationId(item)) !== String(id),
            ),
          );
        }

        if (
          selectedId != null &&
          String(selectedId) === String(getNotificationKey(notification))
        ) {
          handleCloseDetail();
        }

        await loadNotifications({ refresh: true });
      } catch (requestError) {
        if (!isControlled) {
          setRemoteError(getErrorMessage(requestError));
        }
      } finally {
        setDeletingNotificationId(null);
      }
    },
    [
      deletingNotificationId,
      markingAllRead,
      onDelete,
      isControlled,
      selectedId,
      handleCloseDetail,
      loadNotifications,
    ],
  );

  const handleArchive = useCallback(
    async (notification) => {
      if (typeof onArchive === "function") {
        try {
          await onArchive(notification);
          await loadNotifications({ refresh: true });
        } catch (requestError) {
          if (!isControlled) {
            setRemoteError(getErrorMessage(requestError));
          }
        }

        return;
      }

      // Preserve the existing fallback: archive uses delete when
      // the parent does not provide a dedicated archive callback.
      await handleDelete(notification);
    },
    [onArchive, handleDelete, loadNotifications, isControlled],
  );

  const handleMarkAllRead = useCallback(async () => {
    if (
      markingAllRead ||
      updatingNotificationId != null ||
      unreadCount === 0
    ) {
      return;
    }

    setMarkingAllRead(true);

    if (!isControlled) {
      setRemoteError(null);
    }

    try {
      if (typeof onMarkAllRead === "function") {
        await onMarkAllRead();
      } else {
        const unreadItems = notificationList.filter(isNotificationUnread);
        const failures = [];

        // Continue after individual failures so one failed item
        // does not prevent the remaining unread items from updating.
        for (const notification of unreadItems) {
          try {
            if (typeof onMarkRead === "function") {
              await onMarkRead(notification);
            } else {
              const id = getApiNotificationId(notification);

              if (id != null) {
                await markNotificationAsRead(id);
              }
            }
          } catch {
            failures.push(getNotificationKey(notification));
          }
        }

        if (failures.length > 0) {
          throw new Error(
            `${failures.length} notification(s) could not be marked as read.`,
          );
        }
      }

      if (!isControlled) {
        setRemoteNotifications((current) =>
          current.map((item) =>
            isNotificationUnread(item)
              ? {
                  ...item,
                  status: "READ",
                  readAt: new Date().toISOString(),
                }
              : item,
          ),
        );

        setRemoteUnreadCount(0);
      }

      await loadNotifications({ refresh: true });
    } catch (requestError) {
      if (!isControlled) {
        setRemoteError(getErrorMessage(requestError));
      }

      // Reconcile local state with the server after partial failure.
      await loadNotifications({ refresh: true });
    } finally {
      setMarkingAllRead(false);
    }
  }, [
    markingAllRead,
    updatingNotificationId,
    unreadCount,
    onMarkAllRead,
    notificationList,
    onMarkRead,
    isControlled,
    loadNotifications,
  ]);

  const handleToolbarFiltersChange = useCallback((nextFilters) => {
    if (!nextFilters || typeof nextFilters !== "object") return;

    if (nextFilters.category !== undefined) {
      const category = normalizeText(nextFilters.category);

      if (CATEGORY_FILTERS.has(category)) {
        setActiveFilter(category);
      }
    }

    if (nextFilters.readStatus !== undefined) {
      const status = String(nextFilters.readStatus).toUpperCase();

      if (["ALL", "READ", "UNREAD"].includes(status)) {
        setReadStatus(status);
      }
    }
  }, []);

  const handleSidebarCategoryChange = useCallback((category) => {
    const normalized = normalizeText(category);

    if (CATEGORY_FILTERS.has(normalized)) {
      setActiveFilter(normalized);
    }
  }, []);

  const hasActiveFilters =
    activeFilter !== DEFAULT_FILTER ||
    searchQuery.trim().length > 0 ||
    selectedPriorities.length > 0 ||
    dateRange !== DEFAULT_DATE_RANGE ||
    readStatus !== "ALL";

  if (loading && notificationList.length === 0) {
    return (
      <div className="flex h-[calc(100dvh-68px)] min-h-0 flex-col overflow-hidden p-2 sm:p-4">
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
      onDelete={handleDelete}
      onArchive={handleArchive}
      isUpdating={
        updatingNotificationId != null &&
        String(updatingNotificationId) ===
          String(getApiNotificationId(selectedNotification))
      }
      isDeleting={
        deletingNotificationId != null &&
        String(deletingNotificationId) ===
          String(getApiNotificationId(selectedNotification))
      }
    />
  ) : (
    <div className="flex h-full min-h-[280px] flex-col items-center justify-center px-6 py-10 text-center">
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.06]">
        <FiBell
          size={24}
          className="text-cyan-300/80"
          aria-hidden="true"
        />
      </div>

      <h2 className="font-['Orbitron'] text-sm font-semibold text-slate-200">
        Notification Intelligence
      </h2>

      <p className="mt-3 max-w-[260px] text-xs leading-6 text-slate-500">
        Select a notification from the inbox to inspect its details and
        available actions.
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
    <main className="relative isolate z-10 flex h-[calc(100dvh-68px)] min-h-0 w-full min-w-0 flex-col overflow-hidden font-['Inter'] text-slate-100">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute -top-36 left-[25%] h-96 w-96 rounded-full bg-cyan-500/[0.035] blur-[110px]" />
        <div className="absolute right-0 top-24 h-80 w-80 rounded-full bg-blue-600/[0.04] blur-[100px]" />
      </div>

      <div className="grid h-full min-h-0 min-w-0 flex-1 grid-cols-1 grid-rows-[minmax(0,1fr)] gap-2 overflow-hidden p-2 sm:gap-3 sm:p-4 md:grid-cols-[minmax(180px,0.7fr)_minmax(0,1.8fr)] xl:grid-cols-[minmax(190px,0.75fr)_minmax(0,1.8fr)_minmax(300px,1.25fr)] 2xl:grid-cols-[225px_minmax(0,1fr)_365px]">
        <aside
          aria-label="Notification filters"
          className="hidden min-h-0 min-w-0 overflow-x-hidden overflow-y-auto overscroll-contain rounded-xl border border-cyan-400/15 bg-[#040d1b]/95 [scrollbar-width:thin] [scrollbar-color:rgba(80,190,220,0.25)_transparent] md:block"
        >
          <NotificationSidebar
            activeCategory={activeFilter.toUpperCase()}
            onCategoryChange={handleSidebarCategoryChange}
            selectedPriorities={selectedPriorities}
            onPriorityToggle={handlePriorityToggle}
            counts={categoryCounts}
            dateRange={dateRange}
            onDateRangeChange={(value) => {
              if (DATE_RANGES.has(value)) {
                setDateRange(value);
              }
            }}
            onResetFilters={handleResetFilters}
            disabled={loading || refreshing || markingAllRead}
          />
        </aside>

        <section
          aria-label="Notification inbox"
          className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden rounded-xl border border-cyan-400/15 bg-[#040d1b]/95 shadow-[0_18px_60px_rgba(0,0,0,0.18)]"
        >
          <div className="relative z-20 shrink-0 border-b border-white/[0.07] bg-[#061121]/95 p-2.5 sm:p-3">
            <NotificationToolbar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              filters={{
                category: activeFilter.toUpperCase(),
                readStatus,
              }}
              onFiltersChange={handleToolbarFiltersChange}
              sortBy={sortBy}
              onSortChange={setSortBy}
              onMarkAllRead={handleMarkAllRead}
              onRefresh={handleRefresh}
              unreadCount={unreadCount}
              totalCount={filteredNotifications.length}
              loading={loading}
              refreshing={refreshing}
              markingAllRead={markingAllRead}
              disabled={loading || refreshing || markingAllRead}
            />

            {error && (
              <div
                role="alert"
                className="mt-2.5 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-rose-400/20 bg-rose-500/[0.07] px-3 py-2.5"
              >
                <p className="min-w-0 flex-1 text-xs leading-5 text-rose-200">
                  {typeof error === "string"
                    ? error
                    : error?.message ?? "Please retry the request."}
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

            <div className="mt-2.5 flex items-center justify-between gap-3 border-t border-white/[0.055] pt-2.5 text-[11px] text-slate-500">
              <span className="min-w-0 truncate">
                <span className="mr-1.5 text-cyan-300">●</span>
                {filteredNotifications.length} notifications shown
              </span>

              <span className="shrink-0 text-rose-300">
                {unreadCount} unread
              </span>
            </div>
          </div>

          <div
            role="region"
            aria-label="Notification stream"
            tabIndex={0}
            className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-y-auto touch-pan-y p-2.5 sm:p-3 [scrollbar-width:thin] [scrollbar-color:rgba(80,190,220,0.45)_transparent] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-cyan-400/30"
            style={{
              WebkitOverflowScrolling: "touch",
              overscrollBehaviorY: "contain",
            }}
          >
            {error && notificationList.length === 0 ? (
              <NotificationEmptyState
                type="empty"
                title="Unable to load notifications"
                description={String(
                  typeof error === "string"
                    ? error
                    : error?.message ?? "Please try again.",
                )}
                primaryLabel="Retry loading"
                onPrimaryAction={handleRefresh}
                loading={refreshing}
              />
            ) : filteredNotifications.length > 0 ? (
              <NotificationFeed
                notifications={filteredNotifications}
                selectedNotification={selectedNotification}
                onSelectNotification={handleSelectNotification}
                onMarkRead={handleMarkRead}
                loading={false}
                error={null}
                onRetry={handleRefresh}
                hasFilters={hasActiveFilters}
                onClearFilters={handleResetFilters}
                compact
                maxHeight="none"
              />
            ) : (
              <NotificationEmptyState
                type={
                  activeFilter === "unread" && notificationList.length > 0
                    ? "unread"
                    : searchQuery.trim()
                      ? "search"
                      : hasActiveFilters
                        ? "filtered"
                        : "empty"
                }
                onPrimaryAction={
                  searchQuery.trim()
                    ? () => setSearchQuery("")
                    : activeFilter === "unread"
                      ? () => setActiveFilter("all")
                      : handleResetFilters
                }
                onSecondaryAction={handleRefresh}
                loading={refreshing}
              />
            )}
          </div>

          <footer className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-t border-white/[0.07] bg-[#061121]/95 px-3 py-2.5">
            <p className="text-[10px] text-slate-500">
              Showing{" "}
              <span className="font-medium text-cyan-200">
                {filteredNotifications.length}
              </span>{" "}
              of {isControlled ? notificationList.length : remoteTotal} loaded
              notifications
            </p>

            <span className="flex items-center gap-2 text-[9px] uppercase tracking-[0.14em] text-slate-500">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
              Mission communications
            </span>
          </footer>
        </section>

        <aside
          aria-label="Selected notification details"
          className="hidden min-h-0 min-w-0 overflow-x-hidden overflow-y-auto overscroll-contain rounded-xl border border-cyan-400/15 bg-[#040d1b]/95 [scrollbar-width:thin] [scrollbar-color:rgba(80,190,220,0.25)_transparent] xl:block"
        >
          {detailContent}
        </aside>
      </div>

      {mobileDetailOpen && selectedNotification && (
        <div className="fixed inset-0 z-[90] flex items-end justify-center overflow-hidden overscroll-none xl:hidden">
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
            className="relative z-10 flex h-[min(90dvh,760px)] max-h-[90dvh] w-full max-w-[700px] min-h-0 flex-col overflow-hidden rounded-t-2xl border border-cyan-400/20 bg-[#061121] shadow-2xl sm:mb-5 sm:rounded-2xl"
          >
            <div className="flex h-12 shrink-0 items-center justify-between border-b border-white/[0.07] px-4">
              <button
                type="button"
                onClick={handleCloseDetail}
                className="inline-flex min-h-10 items-center gap-2 text-xs text-slate-300 hover:text-cyan-200"
              >
                <FiChevronLeft size={16} aria-hidden="true" />
                Back to inbox
              </button>

              <button
                type="button"
                onClick={handleCloseDetail}
                aria-label="Close details"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-slate-400 hover:bg-white/5 hover:text-white"
              >
                <FiX size={16} aria-hidden="true" />
              </button>
            </div>

            <div
              className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain"
              style={{
                WebkitOverflowScrolling: "touch",
                overscrollBehaviorY: "contain",
              }}
            >
              {detailContent}
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
