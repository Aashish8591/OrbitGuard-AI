import { useId } from "react";

import {
  FiAlertCircle,
  FiArrowRight,
  FiFileText,
  FiFilter,
  FiPlus,
  FiRefreshCw,
  FiSearch,
  FiShield,
  FiXCircle,
} from "react-icons/fi";

const EMPTY_STATE_CONFIG = {
  empty: {
    icon: FiFileText,
    iconColor: "text-cyan-300",
    iconBackground: "bg-cyan-400/10",
    iconBorder: "border-cyan-400/20",
    eyebrow: "REPORT CENTER",
    title: "No reports generated yet",
    description:
      "Your report workspace is ready. Generate your first report to start organizing your available satellite, debris, risk, alert, or analytics information.",
    showCreate: true,
    createLabel: "Generate your first report",
  },

  search: {
    icon: FiSearch,
    iconColor: "text-sky-300",
    iconBackground: "bg-sky-400/10",
    iconBorder: "border-sky-400/20",
    eyebrow: "SEARCH RESULTS",
    title: "No matching reports found",
    description:
      "We couldn't find any reports matching your search. Try a different report name or report code.",
    showCreate: false,
  },

  filters: {
    icon: FiFilter,
    iconColor: "text-violet-300",
    iconBackground: "bg-violet-400/10",
    iconBorder: "border-violet-400/20",
    eyebrow: "FILTERED RESULTS",
    title: "No reports match these filters",
    description:
      "There are no reports matching your selected type and status. Adjust your filters to see more results.",
    showCreate: false,
    showReset: true,
  },

  error: {
    icon: FiAlertCircle,
    iconColor: "text-rose-300",
    iconBackground: "bg-rose-400/10",
    iconBorder: "border-rose-400/20",
    eyebrow: "CONNECTION ISSUE",
    title: "Unable to load reports",
    description:
      "Something went wrong while loading your reports. Check your connection and try again.",
    showRetry: true,
  },

  failed: {
    icon: FiXCircle,
    iconColor: "text-rose-300",
    iconBackground: "bg-rose-400/10",
    iconBorder: "border-rose-400/20",
    eyebrow: "REPORT GENERATION",
    title: "Report generation failed",
    description:
      "This report could not be generated successfully. Review its status and retry if the operation is available.",
    showRetry: true,
  },
};

function getErrorMessage(error) {
  if (typeof error === "string") {
    return error.trim() || null;
  }

  if (error instanceof Error) {
    return error.message || null;
  }

  if (error && typeof error.message === "string") {
    return error.message.trim() || null;
  }

  return null;
}

function ReportsEmptyState({
  variant = "empty",
  title,
  description,
  searchTerm = "",
  error = null,
  loading = false,
  onCreateReport,
  onResetFilters,
  onRetry,
  onClearSearch,
  className = "",
}) {
  const generatedId = useId();
  const headingId = `reports-empty-state-${generatedId}`;

  const config =
    EMPTY_STATE_CONFIG[variant] || EMPTY_STATE_CONFIG.empty;

  const Icon = config.icon;

  const normalizedSearchTerm =
    typeof searchTerm === "string" ? searchTerm.trim() : "";

  const resolvedTitle = title || config.title;

  const resolvedDescription =
    description ||
    (variant === "search" && normalizedSearchTerm
      ? `No reports were found for "${normalizedSearchTerm}". Try another search term or clear your search.`
      : config.description);

  const errorMessage = getErrorMessage(error);

  const hasCreateAction =
    config.showCreate && typeof onCreateReport === "function";

  const hasResetAction =
    config.showReset && typeof onResetFilters === "function";

  const hasClearSearchAction =
    variant === "search" &&
    Boolean(normalizedSearchTerm) &&
    typeof onClearSearch === "function";

  const hasRetryAction =
    config.showRetry && typeof onRetry === "function";

  const handleCreate = () => {
    if (!loading && hasCreateAction) {
      onCreateReport();
    }
  };

  const handleReset = () => {
    if (!loading && hasResetAction) {
      onResetFilters();
    }
  };

  const handleRetry = () => {
    if (!loading && hasRetryAction) {
      onRetry();
    }
  };

  const handleClearSearch = () => {
    if (!loading && hasClearSearchAction) {
      onClearSearch();
    }
  };

  return (
    <section
      className={[
        "relative flex min-w-0 flex-col items-center justify-center",
        "overflow-hidden rounded-2xl border border-slate-800",
        "bg-slate-950/70 px-5 py-12 text-center sm:px-8 sm:py-16",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      aria-labelledby={headingId}
      aria-busy={loading}
    >
      {/* Decorative background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute left-1/2 top-0 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-400/[0.05] blur-3xl" />

        <div className="absolute bottom-0 right-0 h-36 w-36 translate-x-1/3 translate-y-1/3 rounded-full bg-blue-500/[0.04] blur-3xl" />

        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-700/70 to-transparent" />
      </div>

      {/* Main content */}
      <div className="relative z-10 flex w-full max-w-lg flex-col items-center">
        <div
          className={[
            "relative flex h-16 w-16 items-center justify-center",
            "rounded-2xl border shadow-lg shadow-black/10",
            config.iconBackground,
            config.iconBorder,
          ].join(" ")}
        >
          <Icon
            size={29}
            strokeWidth={1.6}
            className={config.iconColor}
            aria-hidden="true"
          />

          {variant === "empty" && (
            <span
              aria-hidden="true"
              className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-lg border border-slate-700 bg-slate-900 text-cyan-300"
            >
              <FiShield size={12} />
            </span>
          )}
        </div>

        <p className="mt-6 text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500 sm:text-xs">
          {config.eyebrow}
        </p>

        <h2
          id={headingId}
          className="mt-3 break-words text-xl font-semibold tracking-tight text-white sm:text-2xl"
        >
          {resolvedTitle}
        </h2>

        <p className="mt-3 max-w-md break-words text-sm leading-6 text-slate-400">
          {resolvedDescription}
        </p>

        {/* Error details */}
        {errorMessage && (
          <div
            role="alert"
            className="mt-4 w-full rounded-xl border border-rose-500/20 bg-rose-500/[0.06] px-4 py-3 text-left"
          >
            <p className="text-xs font-medium text-rose-200">
              {variant === "error"
                ? "Error details"
                : "Additional details"}
            </p>

            <p className="mt-1 break-words text-xs leading-5 text-rose-200/70">
              {errorMessage}
            </p>
          </div>
        )}

        {/* Actions */}
        {(hasCreateAction ||
          hasResetAction ||
          hasClearSearchAction ||
          hasRetryAction) && (
          <div className="mt-7 flex w-full flex-col items-stretch justify-center gap-3 sm:w-auto sm:flex-row sm:items-center">
            {hasCreateAction && (
              <button
                type="button"
                onClick={handleCreate}
                disabled={loading}
                className={[
                  "inline-flex min-h-11 items-center justify-center gap-2",
                  "rounded-xl bg-cyan-400 px-5 py-3 text-sm font-semibold",
                  "text-slate-950 transition-colors hover:bg-cyan-300",
                  "focus-visible:outline-none focus-visible:ring-2",
                  "focus-visible:ring-cyan-300 focus-visible:ring-offset-2",
                  "focus-visible:ring-offset-slate-950",
                  "disabled:cursor-not-allowed disabled:opacity-50",
                ].join(" ")}
              >
                <FiPlus size={17} aria-hidden="true" />
                {config.createLabel}
                <FiArrowRight size={15} aria-hidden="true" />
              </button>
            )}

            {hasResetAction && (
              <button
                type="button"
                onClick={handleReset}
                disabled={loading}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-5 py-3 text-sm font-medium text-slate-200 transition hover:border-slate-600 hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <FiFilter size={15} aria-hidden="true" />
                Reset filters
              </button>
            )}

            {hasClearSearchAction && (
              <button
                type="button"
                onClick={handleClearSearch}
                disabled={loading}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-5 py-3 text-sm font-medium text-slate-200 transition hover:border-slate-600 hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <FiSearch size={15} aria-hidden="true" />
                Clear search
              </button>
            )}

            {hasRetryAction && (
              <button
                type="button"
                onClick={handleRetry}
                disabled={loading}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-5 py-3 text-sm font-medium text-slate-200 transition hover:border-slate-600 hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <FiRefreshCw
                  size={15}
                  className={loading ? "animate-spin" : ""}
                  aria-hidden="true"
                />
                {loading ? "Retrying..." : "Try again"}
              </button>
            )}
          </div>
        )}

        {variant === "empty" && (
          <p className="mt-5 text-xs leading-5 text-slate-600">
            Your reports will appear here when available.
          </p>
        )}
      </div>
    </section>
  );
}

export { EMPTY_STATE_CONFIG };
export default ReportsEmptyState;