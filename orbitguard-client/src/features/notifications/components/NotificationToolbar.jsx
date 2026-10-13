
import { useState } from "react";
import {
  FiCheckCircle,
  FiChevronDown,
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

  if (!Number.isFinite(number) || number < 0) return 0;

  return Math.floor(number);
}

function NotificationToolbar({
  searchQuery = "",
  onSearchChange,
  onSearchSubmit,
  filters = INITIAL_FILTERS,
  onFiltersChange,
  sortBy = "NEWEST",
  onSortChange,
  onMarkAllAsRead,
  onRefresh,
  unreadCount = 0,
  totalCount = 0,
  loading = false,
  markingAllRead = false,
  disabled = false,
}) {
  const [filtersOpen, setFiltersOpen] = useState(false);

  const activeFilters = {
    ...INITIAL_FILTERS,
    ...(filters && typeof filters === "object" ? filters : {}),
  };

  const canSearch = typeof onSearchChange === "function";
  const canSubmitSearch = typeof onSearchSubmit === "function";
  const canChangeFilters = typeof onFiltersChange === "function";

  const normalizedUnreadCount = normalizeCount(unreadCount);
  const normalizedTotalCount = normalizeCount(totalCount);

  const hasActiveFilters =
    activeFilters.category !== "ALL" ||
    activeFilters.readStatus !== "ALL";

  const updateFilter = (key, value) => {
    if (!canChangeFilters || disabled) return;

    onFiltersChange({
      ...activeFilters,
      [key]: value,
    });
  };

  const resetFilters = () => {
    if (!canChangeFilters || disabled) return;

    onFiltersChange({ ...INITIAL_FILTERS });
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();

    if (
      disabled ||
      loading ||
      !canSubmitSearch
    ) {
      return;
    }

    onSearchSubmit(searchQuery);
  };

  const handleSearchKeyDown = (event) => {
    if (
      event.key === "Escape" &&
      canSearch &&
      !disabled
    ) {
      onSearchChange("");
    }
  };

  return (
    <section
      aria-label="Notification search and controls"
      className="
        relative z-20 min-w-0 rounded-xl
        border border-cyan-400/[0.13]
        bg-[#061222]/95 p-3
        shadow-[0_12px_35px_rgba(0,0,0,0.14)]
        sm:p-3.5
      "
    >
      {/* Main toolbar */}
      <div className="flex min-w-0 flex-col gap-2.5 xl:flex-row xl:items-center">
        {/* Search */}
        <form
          role="search"
          className="flex min-w-0 flex-1 items-center gap-2"
          onSubmit={handleSearchSubmit}
        >
          <div
            className="
              group flex h-10 min-w-0 flex-1 items-center
              gap-2.5 rounded-lg border
              border-white/[0.09] bg-[#081626]
              px-3 transition
              focus-within:border-cyan-400/45
              focus-within:ring-2
              focus-within:ring-cyan-400/[0.08]
            "
          >
            <FiSearch
              size={16}
              aria-hidden="true"
              className="
                shrink-0 text-slate-500 transition
                group-focus-within:text-cyan-300
              "
            />

            <input
              type="search"
              value={searchQuery}
              onChange={(event) =>
                onSearchChange?.(event.target.value)
              }
              onKeyDown={handleSearchKeyDown}
              disabled={disabled || !canSearch}
              aria-label="Search notifications"
              placeholder="Search notifications, keywords, satellite..."
              className="
                min-w-0 flex-1 bg-transparent
                text-xs text-slate-200
                outline-none placeholder:text-slate-500
                disabled:cursor-not-allowed
              "
            />

            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange?.("")}
                disabled={disabled || !canSearch}
                aria-label="Clear search"
                className="
                  flex h-6 w-6 shrink-0 items-center
                  justify-center rounded-md
                  text-slate-500 transition
                  hover:bg-white/[0.07] hover:text-white
                  focus-visible:outline-none focus-visible:ring-2
                  focus-visible:ring-cyan-400
                  disabled:opacity-40
                "
              >
                <FiX size={13} />
              </button>
            )}

            <kbd
              className="
                hidden shrink-0 rounded border
                border-white/[0.08] bg-white/[0.025]
                px-1.5 py-0.5 text-[10px]
                text-slate-500 sm:inline-block
              "
              aria-hidden="true"
            >
              /
            </kbd>
          </div>

          {canSubmitSearch && (
            <button
              type="submit"
              disabled={disabled || loading}
              className="
                flex h-10 shrink-0 items-center gap-2
                rounded-lg border border-cyan-400/25
                bg-cyan-400/[0.07] px-3
                text-xs font-medium text-cyan-200
                transition hover:bg-cyan-400/[0.13]
                focus-visible:outline-none focus-visible:ring-2
                focus-visible:ring-cyan-400
                disabled:cursor-not-allowed disabled:opacity-40
              "
            >
              <FiSearch size={14} />
              <span>Search</span>
            </button>
          )}
        </form>

        {/* Actions */}
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          {/* Advanced filters */}
          <button
            type="button"
            onClick={() => setFiltersOpen((open) => !open)}
            aria-expanded={filtersOpen}
            aria-controls="notification-advanced-filters"
            disabled={disabled}
            title="Advanced notification filters"
            className={`
              relative flex h-10 shrink-0 items-center
              justify-center gap-2 rounded-lg border
              px-3 text-xs transition
              focus-visible:outline-none
              focus-visible:ring-2 focus-visible:ring-cyan-400
              disabled:cursor-not-allowed disabled:opacity-40
              ${
                filtersOpen || hasActiveFilters
                  ? "border-cyan-400/30 bg-cyan-400/[0.09] text-cyan-200"
                  : "border-white/[0.09] bg-white/[0.02] text-slate-300 hover:border-cyan-400/25 hover:text-cyan-200"
              }
            `}
          >
            <FiSliders size={15} />
            <span className="hidden sm:inline">Filters</span>

            <FiChevronDown
              size={13}
              aria-hidden="true"
              className={`transition-transform ${filtersOpen ? "rotate-180" : ""}`}
            />

            {hasActiveFilters && (
              <span
                aria-label="Filters active"
                className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-cyan-300 ring-2 ring-[#061222]"
              />
            )}
          </button>

          {/* Mark all as read */}
          <button
            type="button"
            onClick={onMarkAllAsRead}
            disabled={
              disabled ||
              loading ||
              markingAllRead ||
              normalizedUnreadCount === 0 ||
              typeof onMarkAllAsRead !== "function"
            }
            className="
              flex h-10 shrink-0 items-center
              justify-center gap-2 rounded-lg
              border border-cyan-400/30
              bg-gradient-to-r from-cyan-400/[0.10]
              to-blue-400/[0.05] px-3
              text-xs font-medium text-cyan-200
              transition hover:border-cyan-300/50
              hover:bg-cyan-400/[0.15]
              focus-visible:outline-none focus-visible:ring-2
              focus-visible:ring-cyan-400
              disabled:cursor-not-allowed disabled:opacity-40
            "
          >
            <FiCheckCircle size={15} aria-hidden="true" />

            <span className="whitespace-nowrap">
              {markingAllRead ? "Updating..." : "Mark all as read"}
            </span>
          </button>

          {/* Sort */}
          <div
            className="
              flex h-10 min-w-0 flex-1 items-center
              gap-2 rounded-lg border border-white/[0.09]
              bg-[#081626] px-2.5 sm:flex-none
            "
          >
            <FiClock
              size={14}
              aria-hidden="true"
              className="shrink-0 text-slate-500"
            />

            <select
              value={sortBy}
              onChange={(event) =>
                onSortChange?.(event.target.value)
              }
              disabled={disabled || typeof onSortChange !== "function"}
              aria-label="Sort notifications"
              className="
                min-w-0 flex-1 cursor-pointer
                bg-transparent text-xs text-slate-300
                outline-none sm:w-[112px]
                disabled:cursor-not-allowed disabled:opacity-40
              "
            >
              {SORT_OPTIONS.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                  className="bg-[#081626] text-slate-200"
                >
                  {option.label}
                </option>
              ))}
            </select>

            <FiChevronDown
              size={13}
              aria-hidden="true"
              className="shrink-0 text-slate-500"
            />
          </div>

          {/* Refresh */}
          <button
            type="button"
            onClick={onRefresh}
            disabled={
              disabled ||
              loading ||
              typeof onRefresh !== "function"
            }
            aria-label="Refresh notifications"
            title="Refresh notifications"
            className="
              flex h-10 w-10 shrink-0 items-center
              justify-center rounded-lg
              border border-white/[0.09]
              bg-white/[0.02] text-slate-300
              transition hover:border-cyan-400/30
              hover:bg-cyan-400/[0.07] hover:text-cyan-200
              focus-visible:outline-none focus-visible:ring-2
              focus-visible:ring-cyan-400
              disabled:cursor-not-allowed disabled:opacity-40
            "
          >
            <FiRefreshCw
              size={15}
              className={loading ? "animate-spin" : ""}
            />
          </button>
        </div>
      </div>

      {/* Advanced filter panel */}
      {filtersOpen && (
        <div
          id="notification-advanced-filters"
          className="
            mt-3 rounded-lg border border-cyan-400/[0.12]
            bg-[#030c19] p-3
          "
        >
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-xs font-semibold text-slate-200">
                Advanced filters
              </h3>

              <p className="mt-1 text-[10px] text-slate-500">
                Refine your mission activity feed.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setFiltersOpen(false)}
              aria-label="Close advanced filters"
              className="
                flex h-7 w-7 shrink-0 items-center justify-center
                rounded-md text-slate-500
                transition hover:bg-white/[0.06]
                hover:text-white
                focus-visible:outline-none focus-visible:ring-2
                focus-visible:ring-cyan-400
              "
            >
              <FiX size={14} />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {/* Category */}
            <label className="min-w-0">
              <span className="mb-1.5 block text-[10px] font-medium uppercase tracking-wider text-slate-500">
                Category
              </span>

              <select
                value={activeFilters.category}
                onChange={(event) =>
                  updateFilter("category", event.target.value)
                }
                disabled={disabled || !canChangeFilters}
                className="
                  h-10 w-full rounded-lg
                  border border-white/[0.09]
                  bg-[#081626] px-3 text-xs
                  text-slate-300 outline-none
                  transition focus:border-cyan-400/40
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

            {/* Read status */}
            <label className="min-w-0">
              <span className="mb-1.5 block text-[10px] font-medium uppercase tracking-wider text-slate-500">
                Read status
              </span>

              <select
                value={activeFilters.readStatus}
                onChange={(event) =>
                  updateFilter("readStatus", event.target.value)
                }
                disabled={disabled || !canChangeFilters}
                className="
                  h-10 w-full rounded-lg
                  border border-white/[0.09]
                  bg-[#081626] px-3 text-xs
                  text-slate-300 outline-none
                  transition focus:border-cyan-400/40
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

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-white/[0.06] pt-3">
            <p className="text-[10px] text-slate-500">
              {hasActiveFilters
                ? "One or more filters are active."
                : "No category or read-status restrictions are selected."}
            </p>

            <button
              type="button"
              onClick={resetFilters}
              disabled={
                disabled ||
                !canChangeFilters ||
                !hasActiveFilters
              }
              className="
                inline-flex items-center gap-1.5
                rounded-md px-2 py-1.5
                text-[11px] font-medium text-slate-400
                transition hover:bg-white/[0.05]
                hover:text-cyan-200
                focus-visible:outline-none focus-visible:ring-2
                focus-visible:ring-cyan-400
                disabled:cursor-not-allowed disabled:opacity-40
              "
            >
              <FiX size={12} />
              Clear filters
            </button>
          </div>
        </div>
      )}

      {/* Result summary */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-white/[0.055] pt-2.5">
        <div className="flex min-w-0 items-center gap-2">
          <span
            aria-hidden="true"
            className="h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-300"
          />

          <p className="text-[10px] text-slate-500">
            <span className="font-medium text-slate-300">
              {normalizedTotalCount.toLocaleString()}
            </span>{" "}
            notifications
            <span className="mx-1.5 text-slate-700">·</span>
            <span className="text-rose-300">
              {normalizedUnreadCount.toLocaleString()} unread
            </span>
          </p>
        </div>

        {loading && (
          <span
            role="status"
            className="inline-flex items-center gap-1.5 text-[10px] text-cyan-300"
          >
            <FiRefreshCw size={11} className="animate-spin" />
            Synchronizing inbox
          </span>
        )}
      </div>
    </section>
  );
}

export default NotificationToolbar;
