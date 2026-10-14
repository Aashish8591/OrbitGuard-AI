import { useState } from "react";
import {
  FiSearch,
  FiSliders,
  FiList,
  FiGrid,
  FiX,
  FiChevronDown,
} from "react-icons/fi";

/* ================================================================
   REPORT FILTER CONFIGURATION
   Keep these values aligned with the backend enums.
   ================================================================ */

const REPORT_TYPES = [
  { value: "", label: "All Reports" },
  { value: "SATELLITE_ANALYSIS", label: "Satellite Analysis" },
  { value: "DEBRIS_ANALYSIS", label: "Debris Analysis" },
  { value: "RISK_ASSESSMENT", label: "Risk Assessment" },
  { value: "DASHBOARD_ANALYTICS", label: "Dashboard Analytics" },
  { value: "ALERT_SUMMARY", label: "Alert Summary" },
  { value: "AI_ANALYSIS", label: "AI Analysis" },
];

const REPORT_STATUSES = [
  { value: "", label: "All Statuses" },
  { value: "PENDING", label: "Pending" },
  { value: "PROCESSING", label: "Processing" },
  { value: "COMPLETED", label: "Completed" },
  { value: "FAILED", label: "Failed" },
];

const SORT_OPTIONS = [
  { value: "createdAt:desc", label: "Newest First" },
  { value: "createdAt:asc", label: "Oldest First" },
  { value: "updatedAt:desc", label: "Recently Updated" },
  { value: "title:asc", label: "Title A–Z" },
  { value: "title:desc", label: "Title Z–A" },
];

/* ================================================================
   REUSABLE SELECT
   ================================================================ */

function FilterSelect({
  label,
  value,
  options,
  onChange,
  className = "",
}) {
  return (
    <label className={`relative block min-w-0 ${className}`}>
      <span className="sr-only">{label}</span>

      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="
          h-11 w-full appearance-none rounded-xl
          border border-white/10 bg-[#071321]/95
          py-2 pl-3 pr-9 text-sm text-slate-200
          outline-none transition-colors
          hover:border-cyan-400/25
          focus:border-cyan-400/60
          focus:ring-2 focus:ring-cyan-400/10
        "
      >
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            className="bg-[#071321] text-slate-100"
          >
            {option.label}
          </option>
        ))}
      </select>

      <FiChevronDown
        aria-hidden="true"
        className="
          pointer-events-none absolute right-3 top-1/2
          h-4 w-4 -translate-y-1/2 text-slate-500
        "
      />
    </label>
  );
}

/* ================================================================
   REPORT FILTERS
   ================================================================ */

/**
 * Controlled filters for the Reports page.
 *
 * @param {string} search
 * @param {(value: string) => void} onSearchChange
 * @param {string} reportType
 * @param {(value: string) => void} onReportTypeChange
 * @param {string} status
 * @param {(value: string) => void} onStatusChange
 * @param {string} sortBy
 * @param {(value: string) => void} onSortChange
 * @param {"list" | "grid"} viewMode
 * @param {(value: "list" | "grid") => void} onViewModeChange
 * @param {() => void} onReset
 */
function ReportFilters({
  search = "",
  onSearchChange = () => {},
  reportType = "",
  onReportTypeChange = () => {},
  status = "",
  onStatusChange = () => {},
  sortBy = "createdAt:desc",
  onSortChange = () => {},
  viewMode = "list",
  onViewModeChange = () => {},
  onReset,
}) {
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const hasActiveFilters =
    search.trim() !== "" ||
    reportType !== "" ||
    status !== "" ||
    sortBy !== "createdAt:desc";

  const resetFilters = () => {
    onSearchChange("");
    onReportTypeChange("");
    onStatusChange("");
    onSortChange("createdAt:desc");
    onReset?.();
    setMobileFiltersOpen(false);
  };

  const reportTypeLabel =
    REPORT_TYPES.find((item) => item.value === reportType)?.label ??
    "All Reports";

  return (
    <section
      aria-label="Filter reports"
      className="w-full space-y-3"
    >
      {/* ======================================================
          DESKTOP / TABLET FILTER BAR
          ====================================================== */}

      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        {/* Report type tabs */}
        <div
          role="group"
          aria-label="Filter by report type"
          className="
            hidden min-w-0 flex-wrap items-center gap-2
            lg:flex
          "
        >
          {REPORT_TYPES.map((type) => {
            const active = reportType === type.value;

            return (
              <button
                key={type.value || "all"}
                type="button"
                onClick={() => onReportTypeChange(type.value)}
                aria-pressed={active}
                className={`
                  inline-flex min-h-10 items-center justify-center
                  rounded-xl border px-3.5 py-2
                  text-xs font-medium transition-all duration-200
                  ${
                    active
                      ? "border-cyan-300/60 bg-gradient-to-r from-cyan-400 to-sky-500 text-[#04111D] shadow-[0_0_20px_rgba(34,211,238,0.16)]"
                      : "border-white/[0.08] bg-[#071321]/80 text-slate-400 hover:border-cyan-300/25 hover:bg-white/[0.04] hover:text-white"
                  }
                `}
              >
                {type.label}
              </button>
            );
          })}
        </div>

        {/* Search and controls */}
        <div className="flex min-w-0 flex-col gap-2 sm:flex-row xl:ml-auto">
          {/* Search */}
          <label className="relative block min-w-0 flex-1 sm:min-w-[220px] xl:w-[290px] xl:flex-none">
            <span className="sr-only">
              Search reports by code, title, or description
            </span>

            <FiSearch
              aria-hidden="true"
              className="
                pointer-events-none absolute left-3.5 top-1/2
                h-4 w-4 -translate-y-1/2 text-slate-500
              "
            />

            <input
              type="search"
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search reports..."
              className="
                h-11 w-full rounded-xl
                border border-white/10 bg-[#071321]/90
                pl-10 pr-10 text-sm text-slate-100
                outline-none placeholder:text-slate-600
                transition-colors
                hover:border-white/15
                focus:border-cyan-400/60
                focus:ring-2 focus:ring-cyan-400/10
              "
            />

            {search && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => onSearchChange("")}
                className="
                  absolute right-3 top-1/2
                  -translate-y-1/2 rounded-md p-1
                  text-slate-500 transition-colors
                  hover:bg-white/10 hover:text-white
                "
              >
                <FiX aria-hidden="true" className="h-4 w-4" />
              </button>
            )}
          </label>

          {/* Mobile filters trigger */}
          <button
            type="button"
            aria-expanded={mobileFiltersOpen}
            aria-controls="mobile-report-filters"
            onClick={() => setMobileFiltersOpen((open) => !open)}
            className="
              inline-flex h-11 items-center justify-center gap-2
              rounded-xl border border-white/10
              bg-[#071321]/90 px-3.5
              text-sm text-slate-300 transition-colors
              hover:border-cyan-400/30 hover:text-white
              lg:hidden
            "
          >
            <FiSliders aria-hidden="true" className="h-4 w-4" />
            Filters

            {hasActiveFilters && (
              <span
                aria-label="Active filters"
                className="h-1.5 w-1.5 rounded-full bg-cyan-300"
              />
            )}
          </button>

          {/* Desktop status filter */}
          <FilterSelect
            label="Filter by status"
            value={status}
            options={REPORT_STATUSES}
            onChange={onStatusChange}
            className="hidden sm:block sm:w-[145px]"
          />

          {/* Sorting */}
          <FilterSelect
            label="Sort reports"
            value={sortBy}
            options={SORT_OPTIONS}
            onChange={onSortChange}
            className="hidden sm:block sm:w-[165px]"
          />

          {/* View toggle */}
          <div
            role="group"
            aria-label="Report display mode"
            className="
              hidden h-11 shrink-0 items-center gap-1
              rounded-xl border border-white/10
              bg-[#071321]/90 p-1 sm:flex
            "
          >
            <button
              type="button"
              aria-label="List view"
              aria-pressed={viewMode === "list"}
              onClick={() => onViewModeChange("list")}
              className={`
                flex h-8 w-9 items-center justify-center rounded-lg
                transition-colors
                ${
                  viewMode === "list"
                    ? "bg-cyan-400 text-[#04111D]"
                    : "text-slate-500 hover:bg-white/[0.06] hover:text-white"
                }
              `}
            >
              <FiList aria-hidden="true" className="h-4 w-4" />
            </button>

            <button
              type="button"
              aria-label="Grid view"
              aria-pressed={viewMode === "grid"}
              onClick={() => onViewModeChange("grid")}
              className={`
                flex h-8 w-9 items-center justify-center rounded-lg
                transition-colors
                ${
                  viewMode === "grid"
                    ? "bg-cyan-400 text-[#04111D]"
                    : "text-slate-500 hover:bg-white/[0.06] hover:text-white"
                }
              `}
            >
              <FiGrid aria-hidden="true" className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ======================================================
          MOBILE FILTER PANEL
          ====================================================== */}

      {mobileFiltersOpen && (
        <div
          id="mobile-report-filters"
          className="
            grid grid-cols-1 gap-3 rounded-2xl
            border border-white/[0.08]
            bg-[#071321]/95 p-4
            sm:grid-cols-2 lg:hidden
          "
        >
          <div className="sm:col-span-2">
            <p className="mb-2 text-xs font-medium uppercase tracking-[0.12em] text-slate-500">
              Report type
            </p>

            <div className="flex flex-wrap gap-2">
              {REPORT_TYPES.map((type) => {
                const active = reportType === type.value;

                return (
                  <button
                    key={type.value || "mobile-all"}
                    type="button"
                    aria-pressed={active}
                    onClick={() => onReportTypeChange(type.value)}
                    className={`
                      rounded-lg border px-3 py-2 text-xs
                      transition-colors
                      ${
                        active
                          ? "border-cyan-400/50 bg-cyan-400/10 text-cyan-200"
                          : "border-white/[0.08] text-slate-400 hover:text-white"
                      }
                    `}
                  >
                    {type.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-[0.12em] text-slate-500">
              Status
            </p>

            <FilterSelect
              label="Filter by status"
              value={status}
              options={REPORT_STATUSES}
              onChange={onStatusChange}
            />
          </div>

          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-[0.12em] text-slate-500">
              Sort by
            </p>

            <FilterSelect
              label="Sort reports"
              value={sortBy}
              options={SORT_OPTIONS}
              onChange={onSortChange}
            />
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-white/[0.07] pt-3 sm:col-span-2">
            <button
              type="button"
              onClick={resetFilters}
              disabled={!hasActiveFilters}
              className="
                inline-flex items-center gap-2 rounded-lg
                px-3 py-2 text-sm text-slate-400
                transition-colors hover:text-white
                disabled:cursor-not-allowed disabled:opacity-40
              "
            >
              <FiX aria-hidden="true" className="h-4 w-4" />
              Reset filters
            </button>

            <button
              type="button"
              onClick={() => setMobileFiltersOpen(false)}
              className="
                rounded-lg bg-cyan-400 px-4 py-2
                text-sm font-semibold text-[#04111D]
                transition-colors hover:bg-cyan-300
              "
            >
              Show results
            </button>
          </div>
        </div>
      )}

      {/* Active filter summary */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
          <span>Active filters:</span>

          {search.trim() && (
            <span className="max-w-full truncate rounded-md border border-white/[0.08] bg-white/[0.03] px-2 py-1 text-slate-300">
              Search: {search.trim()}
            </span>
          )}

          {reportType && (
            <span className="rounded-md border border-white/[0.08] bg-white/[0.03] px-2 py-1 text-slate-300">
              {reportTypeLabel}
            </span>
          )}

          {status && (
            <span className="rounded-md border border-white/[0.08] bg-white/[0.03] px-2 py-1 text-slate-300">
              {REPORT_STATUSES.find((item) => item.value === status)?.label}
            </span>
          )}

          {sortBy !== "createdAt:desc" && (
            <span className="rounded-md border border-white/[0.08] bg-white/[0.03] px-2 py-1 text-slate-300">
              {SORT_OPTIONS.find((item) => item.value === sortBy)?.label}
            </span>
          )}

          <button
            type="button"
            onClick={resetFilters}
            className="ml-1 font-medium text-cyan-300 transition-colors hover:text-cyan-200"
          >
            Clear all
          </button>
        </div>
      )}
    </section>
  );
}

export default ReportFilters;
