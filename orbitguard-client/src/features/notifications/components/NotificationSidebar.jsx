
import { useState } from "react";

import {
  FiActivity,
  FiAlertTriangle,
  FiCalendar,
  FiChevronDown,
  FiChevronUp,
  FiCircle,
  FiInbox,
  FiInfo,
  FiSettings,
  FiShield,
  FiSliders,
} from "react-icons/fi";

const CATEGORY_ITEMS = [
  { id: "all", label: "All Notifications", Icon: FiInbox, countKey: "all" },
  {
    id: "unread",
    label: "Unread",
    Icon: FiCircle,
    countKey: "unread",
    dot: "bg-rose-400",
  },
  { id: "alert", label: "Alerts", Icon: FiAlertTriangle, countKey: "alert" },
  {
    id: "collision",
    label: "Collision Risks",
    Icon: FiActivity,
    countKey: "collision",
  },
  { id: "system", label: "System", Icon: FiSettings, countKey: "system" },
  { id: "warning", label: "Warnings", Icon: FiShield, countKey: "warning" },
  { id: "info", label: "Information", Icon: FiInfo, countKey: "info" },
];

const PRIORITY_ITEMS = [
  { id: "CRITICAL", label: "Critical", color: "bg-rose-400" },
  { id: "HIGH", label: "High", color: "bg-orange-400" },
  { id: "MEDIUM", label: "Medium", color: "bg-cyan-400" },
  { id: "LOW", label: "Low", color: "bg-slate-400" },
];

const DATE_RANGES = [
  { value: "24_HOURS", label: "Last 24 hours" },
  { value: "7_DAYS", label: "Last 7 days" },
  { value: "30_DAYS", label: "Last 30 days" },
  { value: "90_DAYS", label: "Last 90 days" },
  { value: "ALL_TIME", label: "All time" },
];

const DEFAULT_COUNTS = {
  all: 0,
  unread: 0,
  alert: 0,
  collision: 0,
  system: 0,
  warning: 0,
  info: 0,
};

function normalizeCount(value) {
  const number = Number(value);

  return Number.isFinite(number) && number >= 0
    ? Math.floor(number)
    : 0;
}

function normalizeCategory(value) {
  const normalized = String(value ?? "all")
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, " ");

  const aliases = {
    all: "all",
    "all notifications": "all",
    unread: "unread",
    alert: "alert",
    alerts: "alert",
    collision: "collision",
    "collision risk": "collision",
    "collision risks": "collision",
    system: "system",
    warning: "warning",
    warnings: "warning",
    info: "info",
    information: "info",
  };

  return aliases[normalized] ?? "all";
}

function normalizeDateRange(value) {
  const normalized = String(value ?? "ALL_TIME")
    .trim()
    .toUpperCase();

  return DATE_RANGES.some((item) => item.value === normalized)
    ? normalized
    : "ALL_TIME";
}

function normalizePriorities(values) {
  if (!Array.isArray(values)) return [];

  const allowedPriorities = new Set(
    PRIORITY_ITEMS.map((item) => item.id)
  );

  return [
    ...new Set(
      values
        .map((value) => String(value ?? "").trim().toUpperCase())
        .filter((value) => allowedPriorities.has(value))
    ),
  ];
}

function CountBadge({ count, active, unread }) {
  if (count === null || count === undefined) return null;

  const value = normalizeCount(count);

  return (
    <span
      aria-label={`${value} notifications`}
      className={`
        inline-flex min-w-[25px] shrink-0 items-center justify-center
        rounded-full px-1.5 py-0.5 text-[10px] font-semibold
        tabular-nums transition-colors
        ${
          unread && value > 0
            ? "bg-rose-500/90 text-white"
            : active
              ? "border border-cyan-300/30 bg-cyan-400/10 text-cyan-200"
              : "bg-[#132941] text-slate-400"
        }
      `}
    >
      {value > 999 ? "999+" : value}
    </span>
  );
}

export default function NotificationSidebar({
  activeCategory,
  onCategoryChange,
  activeFilter,
  onFilterChange,

  counts = {},
  selectedPriorities = [],
  onPriorityChange,
  onPriorityToggle,

  dateRange = "ALL_TIME",
  onDateRangeChange,

  onSettingsClick,
  onResetFilters,

  disabled = false,
}) {
  const [priorityExpanded, setPriorityExpanded] = useState(true);
  const [dateExpanded, setDateExpanded] = useState(true);

  const categoryCounts = {
    ...DEFAULT_COUNTS,
    ...(counts && typeof counts === "object" ? counts : {}),
  };

  const currentCategory = normalizeCategory(
    activeCategory ?? activeFilter ?? "all"
  );

  const hasCategoryChangeHandler =
    typeof onCategoryChange === "function" ||
    typeof onFilterChange === "function";

  const priorities = normalizePriorities(selectedPriorities);
  const normalizedDateRange = normalizeDateRange(dateRange);

  const hasPriorityHandler =
    typeof onPriorityToggle === "function" ||
    typeof onPriorityChange === "function";

  const hasDateHandler = typeof onDateRangeChange === "function";

  const hasActiveFilters =
    priorities.length > 0 || normalizedDateRange !== "ALL_TIME";

  function handleCategoryChange(category) {
    if (disabled || !hasCategoryChangeHandler) return;

    if (typeof onCategoryChange === "function") {
      onCategoryChange(category.toUpperCase());
    } else {
      onFilterChange(category);
    }
  }

  function handlePriorityToggle(priority) {
    if (disabled || !hasPriorityHandler) return;

    const normalizedPriority = String(priority ?? "")
      .trim()
      .toUpperCase();

    if (!PRIORITY_ITEMS.some((item) => item.id === normalizedPriority)) {
      return;
    }

    /*
     * Preferred API: parent toggles one priority using functional state.
     * This supports independent selection and deselection.
     */
    if (typeof onPriorityToggle === "function") {
      onPriorityToggle(normalizedPriority);
      return;
    }

    /*
     * Alternative API: parent receives the complete next selection.
     * The parent must store this array in state.
     */
    const nextPriorities = priorities.includes(normalizedPriority)
      ? priorities.filter((item) => item !== normalizedPriority)
      : [...priorities, normalizedPriority];

    onPriorityChange(nextPriorities);
  }

  function handleDateRangeChange(value) {
    if (disabled || !hasDateHandler) return;

    onDateRangeChange(normalizeDateRange(value));
  }

  function handleReset() {
    if (disabled) return;

    if (typeof onResetFilters === "function") {
      onResetFilters();
      return;
    }

    /*
     * Prefer the complete-array API when available.
     * Avoid toggling multiple priorities using repeated stale state updates.
     */
    if (typeof onPriorityChange === "function") {
      onPriorityChange([]);
    } else if (typeof onPriorityToggle === "function") {
      priorities.forEach((priority) => onPriorityToggle(priority));
    }

    if (hasDateHandler) {
      onDateRangeChange("ALL_TIME");
    }

    if (typeof onCategoryChange === "function") {
      onCategoryChange("ALL");
    } else if (typeof onFilterChange === "function") {
      onFilterChange("all");
    }
  }

  return (
    <aside
      aria-label="Notification inbox filters"
      aria-busy={disabled}
      className="
        flex h-full min-h-0 min-w-0 flex-col overflow-hidden
        rounded-2xl border border-cyan-400/[0.13]
        bg-[#030d1b]/90
        shadow-[0_18px_55px_rgba(0,0,0,0.16)]
      "
    >
      {/* Header */}
      <header className="shrink-0 border-b border-white/[0.06] p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-['Orbitron'] text-[9px] font-semibold tracking-[0.2em] text-cyan-300/80">
              NOTIFICATIONS
            </p>

            <h2 className="mt-1 font-['Orbitron'] text-lg font-semibold tracking-tight text-slate-100">
              Inbox
            </h2>

            <p className="mt-1 text-[10px] leading-4 text-slate-500">
              Your operational activity
            </p>
          </div>

          <button
            type="button"
            onClick={onSettingsClick}
            disabled={disabled || typeof onSettingsClick !== "function"}
            aria-label="Notification settings"
            title="Notification settings"
            className="
              mt-1 flex h-9 w-9 shrink-0 items-center justify-center
              rounded-lg border border-white/[0.09] bg-white/[0.02]
              text-slate-400 transition hover:border-cyan-400/30
              hover:bg-cyan-400/[0.07] hover:text-cyan-200
              focus-visible:outline-none focus-visible:ring-2
              focus-visible:ring-cyan-400
              disabled:cursor-not-allowed disabled:opacity-40
            "
          >
            <FiSettings size={16} aria-hidden="true" />
          </button>
        </div>
      </header>

      {/* Scrollable controls */}
      <div
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-3"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "rgba(100,116,139,0.35) transparent",
        }}
      >
        {/* Categories */}
        <nav aria-label="Notification categories">
          <div className="space-y-1">
            {CATEGORY_ITEMS.map(({ id, label, Icon, countKey, dot }) => {
              const active = currentCategory === id;

              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => handleCategoryChange(id)}
                  disabled={disabled || !hasCategoryChangeHandler}
                  aria-pressed={active}
                  className={`
                    group relative flex min-h-9 w-full items-center gap-2.5
                    rounded-lg border px-3 py-2 text-left transition duration-200
                    focus-visible:outline-none focus-visible:ring-2
                    focus-visible:ring-cyan-400
                    disabled:cursor-not-allowed disabled:opacity-50
                    ${
                      active
                        ? "border-cyan-400/15 bg-gradient-to-r from-cyan-400/[0.13] to-cyan-400/[0.035] text-cyan-200"
                        : "border-transparent text-slate-400 hover:border-white/[0.05] hover:bg-white/[0.035] hover:text-slate-200"
                    }
                  `}
                >
                  {active && (
                    <span
                      aria-hidden="true"
                      className="absolute bottom-2 left-0 top-2 w-[2px] rounded-r-full bg-cyan-300 shadow-[0_0_8px_rgba(34,211,238,0.7)]"
                    />
                  )}

                  {dot ? (
                    <span className="flex h-4 w-4 shrink-0 items-center justify-center">
                      <span className={`h-2.5 w-2.5 rounded-full ${dot}`} />
                    </span>
                  ) : (
                    <Icon
                      size={15}
                      strokeWidth={active ? 2 : 1.7}
                      className="shrink-0"
                      aria-hidden="true"
                    />
                  )}

                  <span className="min-w-0 flex-1 truncate text-[11px] font-medium">
                    {label}
                  </span>

                  <CountBadge
                    count={categoryCounts[countKey]}
                    active={active}
                    unread={id === "unread"}
                  />
                </button>
              );
            })}
          </div>
        </nav>

        <div className="my-4 h-px bg-gradient-to-r from-transparent via-white/[0.09] to-transparent" />

        {/* Priority filters */}
        <section aria-label="Priority filters">
          <button
            type="button"
            onClick={() => setPriorityExpanded((value) => !value)}
            aria-expanded={priorityExpanded}
            aria-controls="notification-priority-filters"
            className="
              flex w-full items-center justify-between gap-2 rounded-md
              px-1 py-1.5 text-left text-[11px] font-medium text-slate-300
              transition hover:text-white focus-visible:outline-none
              focus-visible:ring-2 focus-visible:ring-cyan-400
            "
          >
            <span className="flex items-center gap-2">
              <FiSliders size={13} className="text-slate-500" aria-hidden="true" />
              Priority

              {priorities.length > 0 && (
                <span className="rounded-full bg-cyan-400/10 px-1.5 py-0.5 text-[9px] text-cyan-200">
                  {priorities.length}
                </span>
              )}
            </span>

            {priorityExpanded ? (
              <FiChevronUp size={13} className="text-slate-500" aria-hidden="true" />
            ) : (
              <FiChevronDown size={13} className="text-slate-500" aria-hidden="true" />
            )}
          </button>

          {priorityExpanded && (
            <div
              id="notification-priority-filters"
              className="mt-2 space-y-2.5 px-1 pb-1"
            >
              {PRIORITY_ITEMS.map(({ id, label, color }) => {
                const checked = priorities.includes(id);
                const priorityCount = counts?.priorities?.[id];

                return (
                  <label
                    key={id}
                    className={`
                      group flex items-center gap-2.5 rounded-md py-1
                      ${
                        disabled || !hasPriorityHandler
                          ? "cursor-not-allowed opacity-50"
                          : "cursor-pointer"
                      }
                    `}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={disabled || !hasPriorityHandler}
                      onChange={() => handlePriorityToggle(id)}
                      aria-label={`Filter by ${label} priority`}
                      className="
                        h-3.5 w-3.5 shrink-0 cursor-pointer rounded
                        border-slate-600 bg-[#081526] accent-cyan-400
                        focus-visible:outline-none focus-visible:ring-2
                        focus-visible:ring-cyan-400
                        disabled:cursor-not-allowed
                      "
                    />

                    <span
                      className={`h-2.5 w-2.5 shrink-0 rounded-full ${color}`}
                      aria-hidden="true"
                    />

                    <span className="flex-1 text-[11px] text-slate-400 transition group-hover:text-slate-200">
                      {label}
                    </span>

                    {priorityCount !== null && priorityCount !== undefined && (
                      <span className="text-[10px] tabular-nums text-slate-500">
                        {normalizeCount(priorityCount)}
                      </span>
                    )}
                  </label>
                );
              })}
            </div>
          )}
        </section>

        <div className="my-4 h-px bg-gradient-to-r from-transparent via-white/[0.09] to-transparent" />

        {/* Date range */}
        <section aria-label="Date range filter">
          <button
            type="button"
            onClick={() => setDateExpanded((value) => !value)}
            aria-expanded={dateExpanded}
            aria-controls="notification-date-filters"
            className="
              flex w-full items-center justify-between gap-2 rounded-md
              px-1 py-1.5 text-left text-[11px] font-medium text-slate-300
              transition hover:text-white focus-visible:outline-none
              focus-visible:ring-2 focus-visible:ring-cyan-400
            "
          >
            <span>Date Range</span>

            {dateExpanded ? (
              <FiChevronUp size={13} className="text-slate-500" aria-hidden="true" />
            ) : (
              <FiChevronDown size={13} className="text-slate-500" aria-hidden="true" />
            )}
          </button>

          {dateExpanded && (
            <div
              id="notification-date-filters"
              className="mt-2 flex items-center gap-2"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/[0.08] bg-[#081526] text-slate-400">
                <FiCalendar size={15} aria-hidden="true" />
              </div>

              <select
                value={normalizedDateRange}
                onChange={(event) => handleDateRangeChange(event.target.value)}
                disabled={disabled || !hasDateHandler}
                aria-label="Filter notifications by date range"
                className="
                  h-9 min-w-0 flex-1 rounded-lg border border-white/[0.09]
                  bg-[#081526] px-2.5 text-[10px] text-slate-300
                  outline-none transition hover:border-white/[0.16]
                  focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/10
                  disabled:cursor-not-allowed disabled:opacity-50
                "
              >
                {DATE_RANGES.map(({ value, label }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {!hasDateHandler && (
            <p className="mt-2 px-1 text-[9px] leading-4 text-slate-600">
              Date filtering is unavailable until connected to the inbox.
            </p>
          )}
        </section>

        {/* Clear active filters */}
        {hasActiveFilters && (
          <div className="mt-4 rounded-lg border border-cyan-400/10 bg-cyan-400/[0.035] p-2.5">
            <p className="text-[10px] leading-4 text-slate-400">
              <span className="font-medium text-cyan-200">
                Filters active
              </span>

              <span className="mt-1 block">
                {priorities.length > 0 && normalizedDateRange !== "ALL_TIME"
                  ? `${priorities.length} priorities selected · Date range applied`
                  : priorities.length > 0
                    ? `${priorities.length} priority filter${priorities.length === 1 ? "" : "s"} selected`
                    : "Date range selected"}
              </span>
            </p>

            <button
              type="button"
              onClick={handleReset}
              disabled={
                disabled ||
                (typeof onResetFilters !== "function" &&
                  !hasPriorityHandler &&
                  !hasDateHandler &&
                  !hasCategoryChangeHandler)
              }
              className="
                mt-2 text-[10px] font-medium text-cyan-200 transition
                hover:text-white focus-visible:outline-none
                focus-visible:ring-2 focus-visible:ring-cyan-400
                disabled:cursor-not-allowed disabled:opacity-50
              "
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="shrink-0 border-t border-white/[0.06] px-4 py-3">
        <div className="flex items-center gap-2">
          <span
            className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.45)]"
            aria-hidden="true"
          />

          <span className="text-[9px] tracking-wide text-slate-500">
            Notification center
          </span>

          <span className="ml-auto text-[9px] text-slate-600">
            ORBITGUARD AI
          </span>
        </div>
      </footer>
    </aside>
  );
}
