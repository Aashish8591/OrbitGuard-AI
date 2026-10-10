import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  FiArrowDown,
  FiArrowUpDown,
  FiCalendar,
  FiCheck,
  FiChevronDown,
  FiFilter,
  FiRefreshCw,
  FiSearch,
  FiSliders,
  FiX,
} from "react-icons/fi";

const SEVERITY_OPTIONS = [
  { value: "CRITICAL", label: "Critical" },
  { value: "HIGH", label: "High" },
  { value: "MEDIUM", label: "Medium" },
  { value: "LOW", label: "Low" },
];

const STATUS_OPTIONS = [
  { value: "PENDING", label: "Pending" },
  { value: "ACKNOWLEDGED", label: "Acknowledged" },
  { value: "RESOLVED", label: "Resolved" },
  { value: "CLOSED", label: "Closed" },
];

const SOURCE_OPTIONS = [
  { value: "SYSTEM", label: "System" },
  { value: "USER", label: "User" },
];

const TYPE_OPTIONS = [
  { value: "COLLISION", label: "Collision" },
];

const SORT_OPTIONS = [
  { value: "generatedAt", label: "Newest first" },
  { value: "severity", label: "Severity" },
  { value: "updatedAt", label: "Recently updated" },
];

const DEFAULT_FILTERS = {
  search: "",
  severity: "",
  status: "",
  source: "",
  type: "",
  fromDate: "",
  toDate: "",
  sortBy: "generatedAt",
  sortDirection: "desc",
};

const CONTROL_CLASS =
  "min-h-10 w-full rounded-lg border border-white/[0.09] bg-[#07111f] px-3 text-sm text-slate-200 outline-none transition-colors placeholder:text-slate-600 hover:border-white/[0.16] focus:border-cyan-300/40 focus:ring-2 focus:ring-cyan-300/10 disabled:cursor-not-allowed disabled:opacity-50";

const LABEL_CLASS =
  "mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500";

const isValidDate = (value) => {
  if (!value) return true;

  const parsed = new Date(`${value}T00:00:00`);

  return (
    !Number.isNaN(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === value
  );
};

function countActiveFilters(filters) {
  return [
    filters.severity,
    filters.status,
    filters.source,
    filters.type,
    filters.fromDate,
    filters.toDate,
  ].filter(Boolean).length;
}

function getAppliedFilters(filters) {
  return {
    ...filters,
    search: filters.search.trim(),
  };
}

/**
 * OrbitGuard AI — Alert Toolbar
 *
 * This component owns the temporary search input value.
 * Applied filters are controlled by the parent component.
 *
 * @param {Object} props
 * @param {Object} [props.filters] Current applied filters.
 * @param {Function} [props.onFiltersChange] Receives the complete filter object.
 * @param {Function} [props.onSearchChange] Optional immediate search callback.
 * @param {Function} [props.onRefresh] Optional refresh callback.
 * @param {boolean} [props.isRefreshing=false]
 * @param {boolean} [props.isLoading=false]
 * @param {boolean} [props.disabled=false]
 */
export default function AlertToolbar({
  filters,
  onFiltersChange,
  onSearchChange,
  onRefresh,
  isRefreshing = false,
  isLoading = false,
  disabled = false,
}) {
  const shouldReduceMotion = useReducedMotion();

  const appliedFilters = {
    ...DEFAULT_FILTERS,
    ...(filters ?? {}),
  };

  const [searchInput, setSearchInput] = useState(
    appliedFilters.search ?? ""
  );

  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const isDisabled = disabled || isLoading;

  const activeFilterCount = countActiveFilters(appliedFilters);

  const hasSearch = Boolean(searchInput.trim());

  const hasAnyFilters =
    hasSearch ||
    activeFilterCount > 0 ||
    appliedFilters.sortBy !== DEFAULT_FILTERS.sortBy ||
    appliedFilters.sortDirection !== DEFAULT_FILTERS.sortDirection;

  useEffect(() => {
    setSearchInput(appliedFilters.search ?? "");
  }, [appliedFilters.search]);

  const emitFilters = (nextFilters) => {
    onFiltersChange?.(getAppliedFilters(nextFilters));
  };

  const updateFilter = (key, value) => {
    const nextFilters = {
      ...appliedFilters,
      [key]: value,
    };

    emitFilters(nextFilters);
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();

    const search = searchInput.trim();

    const nextFilters = {
      ...appliedFilters,
      search,
    };

    emitFilters(nextFilters);
    onSearchChange?.(search);
  };

  const handleClearFilters = () => {
    setSearchInput("");

    emitFilters({ ...DEFAULT_FILTERS });
    onSearchChange?.("");
  };

  const handleSortDirection = () => {
    updateFilter(
      "sortDirection",
      appliedFilters.sortDirection === "asc" ? "desc" : "asc"
    );
  };

  const handleDateChange = (key, value) => {
    const nextFilters = {
      ...appliedFilters,
      [key]: value,
    };

    if (
      nextFilters.fromDate &&
      nextFilters.toDate &&
      nextFilters.fromDate > nextFilters.toDate
    ) {
      return;
    }

    emitFilters(nextFilters);
  };

  return (
    <motion.section
      initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: shouldReduceMotion ? 0 : 0.25,
      }}
      aria-label="Alert search and filters"
      className="mb-5 rounded-xl border border-white/[0.07] bg-[#050d19] p-3.5 sm:p-4"
    >
      {/* Search and primary controls */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <form
          onSubmit={handleSearchSubmit}
          className="flex min-w-0 flex-1 items-center gap-2"
          role="search"
        >
          <div className="relative min-w-0 flex-1">
            <FiSearch
              aria-hidden="true"
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
            />

            <input
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search alert code, title, or message..."
              aria-label="Search alerts"
              disabled={isDisabled}
              className={`${CONTROL_CLASS} min-h-11 pl-10 pr-10`}
            />

            {searchInput && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput("");

                  const nextFilters = {
                    ...appliedFilters,
                    search: "",
                  };

                  emitFilters(nextFilters);
                  onSearchChange?.("");
                }}
                aria-label="Clear search"
                disabled={isDisabled}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-slate-500 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60"
              >
                <FiX aria-hidden="true" className="h-4 w-4" />
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={isDisabled}
            className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-lg border border-cyan-300/20 bg-cyan-300/[0.08] px-3.5 text-sm font-semibold text-cyan-100 transition-colors hover:bg-cyan-300/[0.14] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FiSearch aria-hidden="true" className="h-4 w-4" />
            <span className="hidden sm:inline">Search</span>
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowAdvancedFilters((previous) => !previous)}
            aria-expanded={showAdvancedFilters}
            aria-controls="alert-advanced-filters"
            disabled={isDisabled}
            className={`inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-lg border px-3 text-sm transition-colors sm:flex-none ${
              showAdvancedFilters || activeFilterCount > 0
                ? "border-cyan-300/25 bg-cyan-300/[0.07] text-cyan-100"
                : "border-white/[0.09] bg-white/[0.02] text-slate-300 hover:border-white/[0.16]"
            } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60 disabled:cursor-not-allowed disabled:opacity-50`}
          >
            <FiSliders aria-hidden="true" className="h-4 w-4" />
            Filters

            {activeFilterCount > 0 && (
              <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-cyan-300/15 px-1.5 text-[10px] font-bold text-cyan-200">
                {activeFilterCount}
              </span>
            )}

            <FiChevronDown
              aria-hidden="true"
              className={`h-3.5 w-3.5 transition-transform duration-200 ${
                showAdvancedFilters ? "rotate-180" : ""
              }`}
            />
          </button>

          <div className="flex min-w-0 flex-1 items-center gap-2 sm:flex-none">
            <label className="sr-only" htmlFor="alert-sort-by">
              Sort alerts by
            </label>

            <div className="relative min-w-0 flex-1 sm:w-40 sm:flex-none">
              <FiArrowUpDown
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500"
              />

              <select
                id="alert-sort-by"
                value={appliedFilters.sortBy}
                onChange={(event) =>
                  updateFilter("sortBy", event.target.value)
                }
                disabled={isDisabled}
                className={`${CONTROL_CLASS} appearance-none pl-9 pr-7 text-xs`}
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <FiChevronDown
                aria-hidden="true"
                className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500"
              />
            </div>

            <button
              type="button"
              onClick={handleSortDirection}
              aria-label={`Sort ${appliedFilters.sortDirection === "asc" ? "descending" : "ascending"}`}
              title={
                appliedFilters.sortDirection === "asc"
                  ? "Ascending"
                  : "Descending"
              }
              disabled={isDisabled}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/[0.09] bg-white/[0.02] text-slate-300 transition-colors hover:border-white/[0.16] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {appliedFilters.sortDirection === "asc" ? (
                <FiArrowDown aria-hidden="true" className="h-4 w-4" />
              ) : (
                <FiArrowUpDown aria-hidden="true" className="h-4 w-4" />
              )}
            </button>
          </div>

          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={isDisabled || isRefreshing}
              aria-label="Refresh alerts"
              title="Refresh alerts"
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/[0.09] bg-white/[0.02] text-slate-300 transition-colors hover:border-cyan-300/25 hover:text-cyan-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FiRefreshCw
                aria-hidden="true"
                className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
              />
            </button>
          )}
        </div>
      </div>

      {/* Advanced filters */}
      {showAdvancedFilters && (
        <motion.div
          id="alert-advanced-filters"
          initial={shouldReduceMotion ? false : { opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{
            duration: shouldReduceMotion ? 0 : 0.2,
          }}
          className="mt-4 overflow-hidden border-t border-white/[0.07] pt-4"
        >
          <div className="mb-4 flex items-center gap-2">
            <FiFilter
              aria-hidden="true"
              className="h-4 w-4 text-cyan-300"
            />

            <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-300">
              Refine alert results
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <div>
              <label className={LABEL_CLASS} htmlFor="alert-severity">
                Severity
              </label>

              <select
                id="alert-severity"
                value={appliedFilters.severity}
                onChange={(event) =>
                  updateFilter("severity", event.target.value)
                }
                disabled={isDisabled}
                className={CONTROL_CLASS}
              >
                <option value="">All severities</option>

                {SEVERITY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={LABEL_CLASS} htmlFor="alert-status">
                Workflow status
              </label>

              <select
                id="alert-status"
                value={appliedFilters.status}
                onChange={(event) =>
                  updateFilter("status", event.target.value)
                }
                disabled={isDisabled}
                className={CONTROL_CLASS}
              >
                <option value="">All statuses</option>

                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={LABEL_CLASS} htmlFor="alert-source">
                Source
              </label>

              <select
                id="alert-source"
                value={appliedFilters.source}
                onChange={(event) =>
                  updateFilter("source", event.target.value)
                }
                disabled={isDisabled}
                className={CONTROL_CLASS}
              >
                <option value="">All sources</option>

                {SOURCE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={LABEL_CLASS} htmlFor="alert-type">
                Alert type
              </label>

              <select
                id="alert-type"
                value={appliedFilters.type}
                onChange={(event) =>
                  updateFilter("type", event.target.value)
                }
                disabled={isDisabled}
                className={CONTROL_CLASS}
              >
                <option value="">All types</option>

                {TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={LABEL_CLASS} htmlFor="alert-from-date">
                From date
              </label>

              <div className="relative">
                <FiCalendar
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
                />

                <input
                  id="alert-from-date"
                  type="date"
                  value={appliedFilters.fromDate}
                  max={appliedFilters.toDate || undefined}
                  onChange={(event) =>
                    handleDateChange("fromDate", event.target.value)
                  }
                  disabled={isDisabled}
                  aria-invalid={!isValidDate(appliedFilters.fromDate)}
                  className={`${CONTROL_CLASS} pl-9 [color-scheme:dark]`}
                />
              </div>
            </div>

            <div>
              <label className={LABEL_CLASS} htmlFor="alert-to-date">
                To date
              </label>

              <div className="relative">
                <FiCalendar
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
                />

                <input
                  id="alert-to-date"
                  type="date"
                  value={appliedFilters.toDate}
                  min={appliedFilters.fromDate || undefined}
                  onChange={(event) =>
                    handleDateChange("toDate", event.target.value)
                  }
                  disabled={isDisabled}
                  aria-invalid={!isValidDate(appliedFilters.toDate)}
                  className={`${CONTROL_CLASS} pl-9 [color-scheme:dark]`}
                />
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-3 border-t border-white/[0.06] pt-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-slate-500">
              {activeFilterCount > 0
                ? `${activeFilterCount} filter${activeFilterCount === 1 ? "" : "s"} applied`
                : "No advanced filters applied"}
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleClearFilters}
                disabled={isDisabled || !hasAnyFilters}
                className="inline-flex min-h-9 flex-1 items-center justify-center gap-2 rounded-lg px-3 text-xs font-medium text-slate-400 transition-colors hover:bg-white/[0.04] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60 disabled:cursor-not-allowed disabled:opacity-40 sm:flex-none"
              >
                <FiX aria-hidden="true" className="h-3.5 w-3.5" />
                Clear all
              </button>

              <button
                type="button"
                onClick={() => setShowAdvancedFilters(false)}
                className="inline-flex min-h-9 flex-1 items-center justify-center gap-2 rounded-lg border border-cyan-300/20 bg-cyan-300/[0.07] px-3 text-xs font-semibold text-cyan-100 transition-colors hover:bg-cyan-300/[0.12] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60 sm:flex-none"
              >
                <FiCheck aria-hidden="true" className="h-3.5 w-3.5" />
                Done
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </motion.section>
  );
}