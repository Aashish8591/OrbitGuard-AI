import { useEffect, useId, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  FiArrowDown,
  FiArrowUp,
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
  "block min-h-11 w-full min-w-0 rounded-lg border border-slate-700/80 bg-[#091525] px-3 text-sm text-slate-100 outline-none transition-colors placeholder:text-slate-500 hover:border-slate-600 focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/10 disabled:cursor-not-allowed disabled:opacity-50";

const LABEL_CLASS =
  "mb-2 block text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400";

const SELECT_CLASS =
  "block min-h-11 w-full min-w-0 cursor-pointer appearance-none rounded-lg border border-slate-700/80 bg-[#091525] py-2 pl-3 pr-10 text-sm text-slate-100 outline-none transition-colors hover:border-slate-600 focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/10 disabled:cursor-not-allowed disabled:opacity-50";

function normalizeFilters(filters) {
  return {
    ...DEFAULT_FILTERS,
    ...(filters ?? {}),
  };
}

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
    search: String(filters.search ?? "").trim(),
  };
}

function isValidDate(value) {
  if (!value) return true;

  const parsed = new Date(`${value}T00:00:00`);

  return (
    !Number.isNaN(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === value
  );
}

function getFilterCountLabel(count) {
  return `${count} ${count === 1 ? "filter" : "filters"} applied`;
}

function SelectField({
  id,
  label,
  value,
  options,
  onChange,
  disabled,
  placeholder,
}) {
  return (
    <div className="min-w-0">
      <label className={LABEL_CLASS} htmlFor={id}>
        {label}
      </label>

      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          disabled={disabled}
          className={SELECT_CLASS}
        >
          <option value="">{placeholder}</option>

          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              className="bg-[#091525] text-slate-100"
            >
              {option.label}
            </option>
          ))}
        </select>

        <FiChevronDown
          aria-hidden="true"
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
        />
      </div>
    </div>
  );
}

function DateField({
  id,
  label,
  value,
  onChange,
  min,
  max,
  disabled,
  invalid,
}) {
  return (
    <div className="min-w-0">
      <label className={LABEL_CLASS} htmlFor={id}>
        {label}
      </label>

      <div className="relative">
        <FiCalendar
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
        />

        <input
          id={id}
          type="date"
          value={value}
          min={min || undefined}
          max={max || undefined}
          onChange={(event) => onChange(event.target.value)}
          disabled={disabled}
          aria-invalid={invalid}
          className={`${CONTROL_CLASS} pl-10 [color-scheme:dark] ${
            invalid ? "border-rose-400/60 focus:border-rose-400" : ""
          }`}
        />
      </div>

      {invalid && (
        <p className="mt-1.5 text-[11px] text-rose-300">
          Enter a valid date.
        </p>
      )}
    </div>
  );
}

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
  const generatedId = useId();

  const appliedFilters = normalizeFilters(filters);

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
    emitFilters({
      ...appliedFilters,
      [key]: value,
    });
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();

    const search = searchInput.trim();

    emitFilters({
      ...appliedFilters,
      search,
    });

    // The parent already receives the complete filter object.
    // Notify the optional search callback only if the consumer needs it.
    onSearchChange?.(search);
  };

  const handleClearSearch = () => {
    setSearchInput("");

    emitFilters({
      ...appliedFilters,
      search: "",
    });

    onSearchChange?.("");
  };

  const handleClearFilters = () => {
    setSearchInput("");

    emitFilters({ ...DEFAULT_FILTERS });
    onSearchChange?.("");
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
      // Keep the date range valid and let the user correct it.
      return;
    }

    emitFilters(nextFilters);
  };

  const handleRefresh = () => {
    if (isDisabled || isRefreshing) return;
    onRefresh?.();
  };

  const searchId = `alert-search-${generatedId}`;
  const sortId = `alert-sort-${generatedId}`;
  const filtersId = `alert-advanced-filters-${generatedId}`;

  return (
    <motion.section
      initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.22 }}
      aria-label="Alert search and filters"
      className="relative z-20 mb-5 min-w-0 rounded-xl border border-slate-800/90 bg-[#050d19] p-3.5 sm:p-4 lg:p-5"
    >
      {/* Main toolbar */}
      <div className="grid min-w-0 grid-cols-1 gap-3 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-center">
        <form
          onSubmit={handleSearchSubmit}
          className="flex min-w-0 items-center gap-2"
          role="search"
        >
          <div className="relative min-w-0 flex-1">
            <FiSearch
              aria-hidden="true"
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            />

            <label className="sr-only" htmlFor={searchId}>
              Search alert code, title, message or reference
            </label>

            <input
              id={searchId}
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search alert code, title, message..."
              disabled={isDisabled}
              className={`${CONTROL_CLASS} min-h-11 pl-10 pr-10`}
            />

            {searchInput && (
              <button
                type="button"
                onClick={handleClearSearch}
                aria-label="Clear search"
                disabled={isDisabled}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-slate-400 transition-colors hover:bg-white/[0.05] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60"
              >
                <FiX aria-hidden="true" className="h-4 w-4" />
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={isDisabled}
            className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-lg border border-cyan-300/25 bg-cyan-300/[0.09] px-3.5 text-sm font-semibold text-cyan-100 transition-colors hover:bg-cyan-300/[0.15] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FiSearch aria-hidden="true" className="h-4 w-4" />
            <span>Search</span>
          </button>
        </form>

        <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-2 sm:flex sm:flex-wrap xl:justify-end">
          <button
            type="button"
            onClick={() =>
              setShowAdvancedFilters((previous) => !previous)
            }
            aria-expanded={showAdvancedFilters}
            aria-controls={filtersId}
            disabled={isDisabled}
            className={`inline-flex min-h-11 min-w-0 items-center justify-center gap-2 rounded-lg border px-3 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60 disabled:cursor-not-allowed disabled:opacity-50 ${
              showAdvancedFilters || activeFilterCount > 0
                ? "border-cyan-300/30 bg-cyan-300/[0.08] text-cyan-100"
                : "border-slate-700/80 bg-[#091525] text-slate-300 hover:border-slate-600"
            }`}
          >
            <FiSliders
              aria-hidden="true"
              className="h-4 w-4 shrink-0"
            />

            <span>Filters</span>

            {activeFilterCount > 0 && (
              <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-cyan-300/15 px-1.5 text-[10px] font-bold text-cyan-200">
                {activeFilterCount}
              </span>
            )}

            <FiChevronDown
              aria-hidden="true"
              className={`h-3.5 w-3.5 shrink-0 transition-transform ${
                showAdvancedFilters ? "rotate-180" : ""
              }`}
            />
          </button>

          <div className="relative min-w-0 sm:w-44">
            <label className="sr-only" htmlFor={sortId}>
              Sort alerts
            </label>

            <FiArrowDown
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400"
            />

            <select
              id={sortId}
              value={appliedFilters.sortBy}
              onChange={(event) =>
                updateFilter("sortBy", event.target.value)
              }
              disabled={isDisabled}
              className={`${SELECT_CLASS} pl-9 pr-8 text-xs`}
            >
              {SORT_OPTIONS.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                  className="bg-[#091525] text-slate-100"
                >
                  {option.label}
                </option>
              ))}
            </select>

            <FiChevronDown
              aria-hidden="true"
              className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400"
            />
          </div>

          <button
            type="button"
            onClick={() =>
              updateFilter(
                "sortDirection",
                appliedFilters.sortDirection === "asc" ? "desc" : "asc"
              )
            }
            aria-label={
              appliedFilters.sortDirection === "asc"
                ? "Change to descending order"
                : "Change to ascending order"
            }
            title={
              appliedFilters.sortDirection === "asc"
                ? "Ascending"
                : "Descending"
            }
            disabled={isDisabled}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-slate-700/80 bg-[#091525] text-slate-300 transition-colors hover:border-slate-600 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {appliedFilters.sortDirection === "asc" ? (
              <FiArrowUp aria-hidden="true" className="h-4 w-4" />
            ) : (
              <FiArrowDown aria-hidden="true" className="h-4 w-4" />
            )}
          </button>

          {onRefresh && (
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isDisabled || isRefreshing}
              aria-label={
                isRefreshing ? "Refreshing alerts" : "Refresh alerts"
              }
              title="Refresh alerts"
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-slate-700/80 bg-[#091525] text-slate-300 transition-colors hover:border-cyan-300/30 hover:text-cyan-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FiRefreshCw
                aria-hidden="true"
                className={`h-4 w-4 ${
                  isRefreshing ? "animate-spin motion-reduce:animate-none" : ""
                }`}
              />
            </button>
          )}
        </div>
      </div>

      {/* Advanced filters */}
      <AnimatePresence initial={false}>
        {showAdvancedFilters && (
          <motion.div
            key="advanced-alert-filters"
            id={filtersId}
            initial={
              shouldReduceMotion
                ? false
                : { opacity: 0, height: 0, y: -4 }
            }
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={
              shouldReduceMotion
                ? undefined
                : { opacity: 0, height: 0, y: -4 }
            }
            transition={{
              duration: shouldReduceMotion ? 0 : 0.2,
            }}
            className="mt-4 overflow-visible border-t border-slate-800/80 pt-4"
          >
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-cyan-300/15 bg-cyan-300/[0.06] text-cyan-200">
                  <FiFilter aria-hidden="true" className="h-4 w-4" />
                </span>

                <div>
                  <h3 className="text-sm font-semibold text-slate-200">
                    Refine alert results
                  </h3>

                  <p className="mt-0.5 text-xs text-slate-500">
                    Narrow the feed by classification and date.
                  </p>
                </div>
              </div>

              <span className="text-xs text-slate-500">
                {activeFilterCount > 0
                  ? getFilterCountLabel(activeFilterCount)
                  : "No advanced filters applied"}
              </span>
            </div>

            <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <SelectField
                id={`severity-${generatedId}`}
                label="Severity"
                value={appliedFilters.severity}
                options={SEVERITY_OPTIONS}
                placeholder="All severities"
                disabled={isDisabled}
                onChange={(value) => updateFilter("severity", value)}
              />

              <SelectField
                id={`status-${generatedId}`}
                label="Workflow status"
                value={appliedFilters.status}
                options={STATUS_OPTIONS}
                placeholder="All statuses"
                disabled={isDisabled}
                onChange={(value) => updateFilter("status", value)}
              />

              <SelectField
                id={`source-${generatedId}`}
                label="Source"
                value={appliedFilters.source}
                options={SOURCE_OPTIONS}
                placeholder="All sources"
                disabled={isDisabled}
                onChange={(value) => updateFilter("source", value)}
              />

              <SelectField
                id={`type-${generatedId}`}
                label="Alert type"
                value={appliedFilters.type}
                options={TYPE_OPTIONS}
                placeholder="All types"
                disabled={isDisabled}
                onChange={(value) => updateFilter("type", value)}
              />

              <DateField
                id={`from-date-${generatedId}`}
                label="From date"
                value={appliedFilters.fromDate}
                max={appliedFilters.toDate}
                onChange={(value) => handleDateChange("fromDate", value)}
                disabled={isDisabled}
                invalid={
                  !isValidDate(appliedFilters.fromDate) ||
                  Boolean(
                    appliedFilters.fromDate &&
                      appliedFilters.toDate &&
                      appliedFilters.fromDate > appliedFilters.toDate
                  )
                }
              />

              <DateField
                id={`to-date-${generatedId}`}
                label="To date"
                value={appliedFilters.toDate}
                min={appliedFilters.fromDate}
                onChange={(value) => handleDateChange("toDate", value)}
                disabled={isDisabled}
                invalid={
                  !isValidDate(appliedFilters.toDate) ||
                  Boolean(
                    appliedFilters.fromDate &&
                      appliedFilters.toDate &&
                      appliedFilters.fromDate > appliedFilters.toDate
                  )
                }
              />
            </div>

            <div className="mt-5 flex flex-col gap-3 border-t border-slate-800/80 pt-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs leading-5 text-slate-500">
                Filters update the alert feed. Clear them to restore the
                complete collection.
              </p>

              <div className="grid grid-cols-2 gap-2 sm:flex sm:shrink-0">
                <button
                  type="button"
                  onClick={handleClearFilters}
                  disabled={isDisabled || !hasAnyFilters}
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-slate-700/80 px-3 text-xs font-medium text-slate-300 transition-colors hover:bg-white/[0.04] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <FiX aria-hidden="true" className="h-3.5 w-3.5" />
                  Clear all
                </button>

                <button
                  type="button"
                  onClick={() => setShowAdvancedFilters(false)}
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-cyan-300/25 bg-cyan-300/[0.08] px-4 text-xs font-semibold text-cyan-100 transition-colors hover:bg-cyan-300/[0.14] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60"
                >
                  <FiCheck aria-hidden="true" className="h-3.5 w-3.5" />
                  Done
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
