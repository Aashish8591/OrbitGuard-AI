
import { useState } from "react";

import {
  FiCheckCircle,
  FiClock,
  FiRefreshCw,
  FiSearch,
  FiSliders,
  FiX,
} from "react-icons/fi";

const CATEGORY_OPTIONS = [
  { value: "ALL", label: "All categories" },
  { value: "ALERT", label: "Alerts" },
  { value: "COLLISION", label: "Collision risks" },
  { value: "SYSTEM", label: "System" },
  { value: "WARNING", label: "Warnings" },
  { value: "INFO", label: "Information" },
];

const READ_STATUS_OPTIONS = [
  { value: "ALL", label: "All statuses" },
  { value: "UNREAD", label: "Unread only" },
  { value: "READ", label: "Read only" },
];

const SORT_OPTIONS = [
  { value: "NEWEST", label: "Newest first" },
  { value: "OLDEST", label: "Oldest first" },
];

const INITIAL_FILTERS = {
  category: "ALL",
  readStatus: "ALL",
};

function normalizeCount(value) {
  const number = Number(value);

  return Number.isFinite(number) && number >= 0
    ? Math.floor(number)
    : 0;
}

function normalizeFilterValue(value, allowedValues, fallback) {
  const normalized = String(value ?? fallback).trim().toUpperCase();

  return allowedValues.includes(normalized) ? normalized : fallback;
}

function NotificationToolbar({
  searchQuery = "",
  onSearchChange,
  onSearchSubmit,
  filters = INITIAL_FILTERS,
  onFiltersChange,
  sortBy: suppliedSortBy,
  onSortChange,
  onMarkAllRead,
  onMarkAllAsRead,
  onRefresh,
  unreadCount = 0,
  totalCount = 0,
  loading = false,
  refreshing = false,
  markingAllRead = false,
  disabled = false,
}) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const [localSort, setLocalSort] = useState("NEWEST");

  const activeFilters = {
    ...INITIAL_FILTERS,
    ...(filters && typeof filters === "object" ? filters : {}),
  };

  const category = normalizeFilterValue(
    activeFilters.category,
    CATEGORY_OPTIONS.map((item) => item.value),
    "ALL",
  );

  const readStatus = normalizeFilterValue(
    activeFilters.readStatus,
    READ_STATUS_OPTIONS.map((item) => item.value),
    "ALL",
  );

  const sortValue = normalizeFilterValue(
    suppliedSortBy ?? localSort,
    SORT_OPTIONS.map((item) => item.value),
    "NEWEST",
  );

  const canSearch = typeof onSearchChange === "function";
  const canChangeFilters = typeof onFiltersChange === "function";
  const canChangeSort = typeof onSortChange === "function";

  const markAllHandler = onMarkAllRead ?? onMarkAllAsRead;
  const canMarkAllRead = typeof markAllHandler === "function";
  const canRefresh = typeof onRefresh === "function";

  const isLoading = loading || refreshing;
  const normalizedUnreadCount = normalizeCount(unreadCount);
  const normalizedTotalCount = normalizeCount(totalCount);

  const hasActiveFilters = category !== "ALL" || readStatus !== "ALL";

  const selectedSortLabel =
    SORT_OPTIONS.find((option) => option.value === sortValue)?.label ??
    "Newest first";

  function updateFilter(key, value) {
    if (!canChangeFilters || disabled) return;

    onFiltersChange({
      ...activeFilters,
      [key]: value,
    });
  }

  function resetFilters() {
    if (!canChangeFilters || disabled) return;

    onFiltersChange({ ...INITIAL_FILTERS });
  }

  function handleSearchSubmit(event) {
    event.preventDefault();

    if (disabled || isLoading) return;

    if (typeof onSearchSubmit === "function") {
      onSearchSubmit(searchQuery);
    }
  }

  function handleSortChange(value) {
    if (disabled) return;

    if (canChangeSort) {
      onSortChange(value);
    } else {
      setLocalSort(value);
    }

    setSortMenuOpen(false);
  }

  function handleMarkAllRead() {
    if (
      disabled ||
      isLoading ||
      markingAllRead ||
      normalizedUnreadCount === 0 ||
      !canMarkAllRead
    ) {
      return;
    }

    void markAllHandler();
  }

  function handleRefresh() {
    if (disabled || isLoading || !canRefresh) return;

    void onRefresh();
  }

  const iconButtonClass =
    "group relative inline-flex h-10 w-10 shrink-0 items-center " +
    "justify-center rounded-lg border transition-colors " +
    "focus-visible:outline-none focus-visible:ring-2 " +
    "focus-visible:ring-cyan-400 disabled:cursor-not-allowed " +
    "disabled:opacity-45";

  const tooltipClass =
    "pointer-events-none absolute left-1/2 top-full z-[80] mt-2 " +
    "w-max max-w-[180px] -translate-x-1/2 translate-y-1 " +
    "rounded-md border border-cyan-400/20 bg-[#020914] " +
    "px-2.5 py-1.5 text-[10px] font-medium text-cyan-100 " +
    "opacity-0 shadow-xl transition duration-150 " +
    "group-hover:translate-y-0 group-hover:opacity-100 " +
    "group-focus-visible:translate-y-0 group-focus-visible:opacity-100";

  return (
    <section
      aria-label="Notification search and controls"
      aria-busy={isLoading}
      className="
        relative z-20 min-w-0 rounded-xl
        border border-cyan-400/[0.13]
        bg-[#061222]/95 p-2.5
        shadow-[0_12px_35px_rgba(0,0,0,0.14)]
        sm:p-3
      "
    >
      {/* Responsive toolbar:
          Mobile: full-width search, then icon buttons.
          Desktop: search and all icons remain on one row. */}
      <div
        className="
          flex min-w-0 flex-col gap-2
          sm:flex-row sm:items-center sm:gap-2
        "
      >
        {/* Full-width search on mobile */}
        <form
          role="search"
          onSubmit={handleSearchSubmit}
          className="w-full min-w-0 sm:flex-1"
        >
          <div
            className="
              group flex h-10 w-full min-w-0 items-center gap-2
              rounded-lg border border-white/[0.09]
              bg-[#081626] px-3 transition
              hover:border-white/[0.15]
              focus-within:border-cyan-400/45
              focus-within:ring-2 focus-within:ring-cyan-400/[0.08]
            "
          >
            <FiSearch
              size={16}
              aria-hidden="true"
              className="
                shrink-0 text-slate-500 transition-colors
                group-focus-within:text-cyan-300
              "
            />

            <input
              type="search"
              value={searchQuery}
              onChange={(event) => onSearchChange?.(event.target.value)}
              disabled={disabled || !canSearch}
              aria-label="Search notifications"
              placeholder="Search notifications..."
              className="
                min-w-0 flex-1 bg-transparent
                text-xs text-slate-200 outline-none
                placeholder:text-slate-500
                disabled:cursor-not-allowed
              "
            />

            {searchQuery.length > 0 && canSearch && (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                disabled={disabled}
                aria-label="Clear search"
                title="Clear search"
                className="
                  flex h-7 w-7 shrink-0 items-center justify-center
                  rounded-md text-slate-500 transition
                  hover:bg-white/[0.07] hover:text-white
                  focus-visible:outline-none
                  focus-visible:ring-2 focus-visible:ring-cyan-400
                  disabled:opacity-40
                "
              >
                <FiX size={14} aria-hidden="true" />
              </button>
            )}
          </div>
        </form>

        {/* Icon actions:
            Mobile: second row.
            Desktop: inline beside search. */}
        <div
          className="
            flex w-full min-w-0 items-center justify-end gap-2
            sm:w-auto sm:shrink-0
          "
        >
          {/* Filters */}
          <button
            type="button"
            onClick={() => setFiltersOpen((open) => !open)}
            aria-expanded={filtersOpen}
            aria-controls="notification-advanced-filters"
            aria-label={filtersOpen ? "Close filters" : "Filters"}
            title={filtersOpen ? "Close filters" : "Filters"}
            disabled={disabled}
            className={`
              ${iconButtonClass}
              ${
                filtersOpen || hasActiveFilters
                  ? "border-cyan-400/30 bg-cyan-400/[0.09] text-cyan-200"
                  : "border-white/[0.09] bg-white/[0.02] text-slate-300 hover:border-cyan-400/35 hover:bg-cyan-400/[0.07] hover:text-cyan-200"
              }
            `}
          >
            <FiSliders size={17} aria-hidden="true" />

            {hasActiveFilters && (
              <span
                aria-hidden="true"
                className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-cyan-300"
              />
            )}

            <span className={tooltipClass}>
              {filtersOpen ? "Close filters" : "Filters"}
            </span>
          </button>

          {/* Mark all as read */}
          <button
            type="button"
            onClick={handleMarkAllRead}
            disabled={
              disabled ||
              isLoading ||
              markingAllRead ||
              normalizedUnreadCount === 0 ||
              !canMarkAllRead
            }
            aria-label={
              markingAllRead ? "Updating notifications" : "Mark all as read"
            }
            title="Mark all notifications as read"
            className={`
              ${iconButtonClass}
              border-cyan-400/30
              bg-gradient-to-r from-cyan-400/[0.10] to-blue-400/[0.05]
              text-cyan-200
              hover:border-cyan-300/50 hover:bg-cyan-400/[0.15]
            `}
          >
            <FiCheckCircle
              size={17}
              aria-hidden="true"
              className={markingAllRead ? "animate-pulse" : ""}
            />

            <span className={tooltipClass}>
              {markingAllRead ? "Updating..." : "Mark all as read"}
            </span>
          </button>

          {/* Sort */}
          <div className="group relative shrink-0">
            <button
              type="button"
              onClick={() => setSortMenuOpen((open) => !open)}
              aria-label={`Sort notifications: ${selectedSortLabel}`}
              aria-expanded={sortMenuOpen}
              aria-haspopup="true"
              disabled={disabled}
              title={selectedSortLabel}
              className={`
                ${iconButtonClass}
                border-white/[0.09] bg-white/[0.02] text-slate-300
                hover:border-cyan-400/30 hover:bg-cyan-400/[0.07]
                hover:text-cyan-200
              `}
            >
              <FiClock size={16} aria-hidden="true" />
              <span className={tooltipClass}>{selectedSortLabel}</span>
            </button>

            {sortMenuOpen && (
              <>
                <button
                  type="button"
                  aria-label="Close sort menu"
                  onClick={() => setSortMenuOpen(false)}
                  className="fixed inset-0 z-[70] cursor-default"
                />

                <div
                  role="menu"
                  aria-label="Sort notifications"
                  className="
                    absolute right-0 top-full z-[90] mt-2 w-40
                    rounded-lg border border-cyan-400/20
                    bg-[#020914] p-1.5 shadow-xl
                  "
                >
                  {SORT_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      role="menuitemradio"
                      aria-checked={sortValue === option.value}
                      onClick={() => handleSortChange(option.value)}
                      className={`
                        flex w-full items-center justify-between gap-2
                        rounded-md px-2.5 py-2 text-left text-xs
                        transition hover:bg-white/[0.06]
                        ${
                          sortValue === option.value
                            ? "text-cyan-200"
                            : "text-slate-300"
                        }
                      `}
                    >
                      <span>{option.label}</span>
                      {sortValue === option.value && (
                        <FiCheckCircle size={13} aria-hidden="true" />
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Refresh */}
          <button
            type="button"
            onClick={handleRefresh}
            disabled={disabled || isLoading || !canRefresh}
            aria-label="Refresh notifications"
            title="Refresh notifications"
            className={`
              ${iconButtonClass}
              border-white/[0.09] bg-white/[0.02] text-slate-300
              hover:border-cyan-400/30 hover:bg-cyan-400/[0.07]
              hover:text-cyan-200
            `}
          >
            <FiRefreshCw
              size={16}
              aria-hidden="true"
              className={isLoading ? "animate-spin" : ""}
            />

            <span className={tooltipClass}>
              {isLoading ? "Refreshing..." : "Refresh"}
            </span>
          </button>
        </div>
      </div>

      {/* Advanced filters */}
      {filtersOpen && (
        <div
          id="notification-advanced-filters"
          className="
            mt-3 rounded-lg border border-cyan-400/[0.12]
            bg-[#030c19] p-3 sm:p-4
          "
        >
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h3 className="text-xs font-semibold text-slate-200">
                Advanced filters
              </h3>
              <p className="mt-1 text-[10px] leading-5 text-slate-500">
                Narrow the inbox by category and read status.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setFiltersOpen(false)}
              aria-label="Close advanced filters"
              className="
                flex h-8 w-8 shrink-0 items-center justify-center
                rounded-lg border border-white/[0.07]
                text-slate-500 transition
                hover:bg-white/[0.06] hover:text-white
                focus-visible:outline-none
                focus-visible:ring-2 focus-visible:ring-cyan-400
              "
            >
              <FiX size={14} aria-hidden="true" />
            </button>
          </div>

          {!canChangeFilters && (
            <p
              role="status"
              className="
                mb-3 rounded-md border border-amber-400/15
                bg-amber-400/[0.05] p-2.5
                text-[10px] leading-5 text-amber-200/80
              "
            >
              Filtering is not connected to the parent page yet.
            </p>
          )}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="min-w-0">
              <span className="mb-1.5 block text-[10px] font-medium uppercase tracking-wider text-slate-500">
                Category
              </span>

              <select
                value={category}
                onChange={(event) =>
                  updateFilter("category", event.target.value)
                }
                disabled={disabled || !canChangeFilters}
                className="
                  h-10 w-full rounded-lg border border-white/[0.09]
                  bg-[#081626] px-3 text-xs text-slate-300 outline-none
                  focus:border-cyan-400/40
                  disabled:cursor-not-allowed disabled:opacity-40
                "
              >
                {CATEGORY_OPTIONS.map((option) => (
                  <option
                    key={option.value}
                    value={option.value}
                    className="bg-[#081626]"
                  >
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="min-w-0">
              <span className="mb-1.5 block text-[10px] font-medium uppercase tracking-wider text-slate-500">
                Read status
              </span>

              <select
                value={readStatus}
                onChange={(event) =>
                  updateFilter("readStatus", event.target.value)
                }
                disabled={disabled || !canChangeFilters}
                className="
                  h-10 w-full rounded-lg border border-white/[0.09]
                  bg-[#081626] px-3 text-xs text-slate-300 outline-none
                  focus:border-cyan-400/40
                  disabled:cursor-not-allowed disabled:opacity-40
                "
              >
                {READ_STATUS_OPTIONS.map((option) => (
                  <option
                    key={option.value}
                    value={option.value}
                    className="bg-[#081626]"
                  >
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.06] pt-3">
            <p className="text-[10px] text-slate-500">
              {hasActiveFilters
                ? "Category or read-status filters are active."
                : "Showing all categories and read statuses."}
            </p>

            <button
              type="button"
              onClick={resetFilters}
              disabled={
                disabled || !canChangeFilters || !hasActiveFilters
              }
              className="
                inline-flex min-h-8 items-center gap-1.5
                rounded-md px-2 text-[11px] font-medium
                text-slate-400 transition
                hover:bg-white/[0.05] hover:text-cyan-200
                focus-visible:outline-none
                focus-visible:ring-2 focus-visible:ring-cyan-400
                disabled:cursor-not-allowed disabled:opacity-40
              "
            >
              <FiX size={12} aria-hidden="true" />
              Clear filters
            </button>
          </div>
        </div>
      )}

      {/* Inbox summary */}
      <div className="mt-3 flex min-w-0 flex-wrap items-center justify-between gap-2 border-t border-white/[0.055] pt-3">
        <div className="flex min-w-0 items-center gap-2 text-[10px]">
          <span
            aria-hidden="true"
            className="h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-300"
          />

          <span className="text-slate-400">
            <span className="font-medium tabular-nums text-slate-200">
              {normalizedTotalCount.toLocaleString()}
            </span>{" "}
            notifications
          </span>

          <span aria-hidden="true" className="text-slate-700">
            ·
          </span>

          <span className="whitespace-nowrap text-rose-300">
            {normalizedUnreadCount.toLocaleString()} unread
          </span>
        </div>

        {isLoading && (
          <span
            role="status"
            className="inline-flex items-center gap-1.5 text-[10px] text-cyan-300"
          >
            <FiRefreshCw
              size={11}
              className="animate-spin"
              aria-hidden="true"
            />
            Synchronizing
          </span>
        )}
      </div>
    </section>
  );
}

export default NotificationToolbar;
