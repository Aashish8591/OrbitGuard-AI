import { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  FiAlertCircle,
  FiAlertTriangle,
  FiArrowUpRight,
  FiCheckCircle,
  FiClock,
  FiInbox,
  FiRefreshCw,
  FiShield,
} from "react-icons/fi";

const SEVERITY_CONFIG = {
  CRITICAL: {
    label: "Critical",
    icon: FiAlertTriangle,
    badge:
      "border-rose-400/25 bg-rose-400/[0.09] text-rose-300",
    indicator: "bg-rose-400",
    glow: "shadow-[inset_2px_0_0_rgba(251,113,133,0.85)]",
  },
  HIGH: {
    label: "High",
    icon: FiAlertTriangle,
    badge:
      "border-orange-400/25 bg-orange-400/[0.08] text-orange-300",
    indicator: "bg-orange-400",
    glow: "shadow-[inset_2px_0_0_rgba(251,146,60,0.85)]",
  },
  MEDIUM: {
    label: "Medium",
    icon: FiAlertCircle,
    badge:
      "border-amber-400/25 bg-amber-400/[0.08] text-amber-300",
    indicator: "bg-amber-400",
    glow: "shadow-[inset_2px_0_0_rgba(251,191,36,0.85)]",
  },
  LOW: {
    label: "Low",
    icon: FiShield,
    badge:
      "border-sky-400/25 bg-sky-400/[0.08] text-sky-300",
    indicator: "bg-sky-400",
    glow: "shadow-[inset_2px_0_0_rgba(56,189,248,0.85)]",
  },
};

const STATUS_CONFIG = {
  PENDING: {
    label: "Pending",
    className: "text-amber-300",
    indicator: "bg-amber-300",
  },
  ACKNOWLEDGED: {
    label: "Acknowledged",
    className: "text-cyan-300",
    indicator: "bg-cyan-300",
  },
  RESOLVED: {
    label: "Resolved",
    className: "text-emerald-300",
    indicator: "bg-emerald-300",
  },
  CLOSED: {
    label: "Closed",
    className: "text-slate-400",
    indicator: "bg-slate-500",
  },
};

const DEFAULT_SEVERITY = {
  label: "Unspecified",
  icon: FiAlertCircle,
  badge: "border-white/10 bg-white/[0.04] text-slate-400",
  indicator: "bg-slate-500",
  glow: "",
};

const DEFAULT_STATUS = {
  label: "Unknown status",
  className: "text-slate-400",
  indicator: "bg-slate-500",
};

function normalizeEnum(value) {
  return typeof value === "string" ? value.trim().toUpperCase() : "";
}

function formatDateTime(value) {
  if (!value) return "Time unavailable";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Time unavailable";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

function getAlertTimestamp(alert) {
  return alert?.generatedAt ?? alert?.createdAt ?? null;
}

function getAlertId(alert) {
  return alert?.id ?? alert?._id ?? null;
}

function getDisplayCode(alert) {
  return alert?.alertCode || "Alert reference unavailable";
}

function getDisplayTitle(alert) {
  return alert?.title?.trim() || "Untitled alert";
}

function getDisplayMessage(alert) {
  return alert?.message?.trim() || "No additional message provided.";
}

function isValidAlert(alert) {
  return (
    alert !== null &&
    typeof alert === "object" &&
    !Array.isArray(alert)
  );
}

function SkeletonRow() {
  return (
    <div
      aria-hidden="true"
      className="flex animate-pulse gap-3 border-b border-white/[0.06] px-4 py-5 last:border-b-0 sm:px-5"
    >
      <div className="h-10 w-1 shrink-0 rounded-full bg-white/[0.08]" />

      <div className="min-w-0 flex-1">
        <div className="mb-3 h-3 w-24 rounded bg-white/[0.08]" />
        <div className="mb-2 h-4 w-3/4 max-w-64 rounded bg-white/[0.08]" />
        <div className="h-3 w-full max-w-80 rounded bg-white/[0.05]" />

        <div className="mt-4 flex gap-2">
          <div className="h-5 w-16 rounded-full bg-white/[0.06]" />
          <div className="h-5 w-20 rounded-full bg-white/[0.06]" />
        </div>
      </div>
    </div>
  );
}

function AlertRow({
  alert,
  index,
  isSelected,
  onSelect,
  shouldReduceMotion,
}) {
  const alertId = getAlertId(alert);
  const severityKey = normalizeEnum(alert.severity);
  const statusKey = normalizeEnum(alert.status);

  const severity = SEVERITY_CONFIG[severityKey] ?? DEFAULT_SEVERITY;
  const status = STATUS_CONFIG[statusKey] ?? DEFAULT_STATUS;
  const SeverityIcon = severity.icon;

  const timestamp = formatDateTime(getAlertTimestamp(alert));
  const title = getDisplayTitle(alert);
  const code = getDisplayCode(alert);
  const message = getDisplayMessage(alert);

  const satelliteId = alert.satelliteId;
  const debrisId = alert.debrisId;

  const isInteractive = typeof onSelect === "function";

  const content = (
    <div
      className={[
        "group relative flex gap-3 px-3.5 py-4 transition-colors sm:gap-4 sm:px-5 sm:py-5",
        "border-b border-white/[0.055] last:border-b-0",
        severity.glow,
        isSelected ? "bg-cyan-300/[0.055]" : "hover:bg-white/[0.025]",
      ].join(" ")}
    >
      {/* Severity marker */}
      <div className="flex w-9 shrink-0 flex-col items-center pt-1 sm:w-10">
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-xl border sm:h-10 sm:w-10 ${severity.badge}`}
        >
          <SeverityIcon
            aria-hidden="true"
            className="h-[18px] w-[18px]"
          />
        </div>

        <span
          aria-hidden="true"
          className={`mt-2 h-full min-h-5 w-px ${severity.indicator} opacity-20`}
        />
      </div>

      {/* Main alert information */}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
          <span className="font-mono text-[10px] font-medium tracking-wide text-slate-500 sm:text-[11px]">
            {code}
          </span>

          <span className="h-1 w-1 rounded-full bg-slate-700" />

          <time
            dateTime={
              getAlertTimestamp(alert)
                ? new Date(getAlertTimestamp(alert)).toISOString()
                : undefined
            }
            className="text-[10px] text-slate-500 sm:text-xs"
          >
            {timestamp}
          </time>
        </div>

        <h3 className="mt-2 break-words text-sm font-semibold leading-5 text-slate-100 sm:text-[15px]">
          {title}
        </h3>

        <p className="mt-1.5 line-clamp-2 break-words text-xs leading-5 text-slate-400 sm:text-sm">
          {message}
        </p>

        {/* Linked orbital objects */}
        {(satelliteId || debrisId) && (
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
            {satelliteId && (
              <span className="max-w-full break-all text-[10px] text-slate-500 sm:text-xs">
                <span className="text-slate-600">SAT</span>{" "}
                {satelliteId}
              </span>
            )}

            {debrisId && (
              <span className="max-w-full break-all text-[10px] text-slate-500 sm:text-xs">
                <span className="text-slate-600">DEBRIS</span>{" "}
                {debrisId}
              </span>
            )}
          </div>
        )}

        {/* Severity and workflow state */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-[10px] font-semibold uppercase tracking-wide ${severity.badge}`}
          >
            <span
              aria-hidden="true"
              className={`h-1.5 w-1.5 rounded-full ${severity.indicator}`}
            />
            {severity.label}
          </span>

          <span
            className={`inline-flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wide ${status.className}`}
          >
            <span
              aria-hidden="true"
              className={`h-1.5 w-1.5 rounded-full ${status.indicator}`}
            />
            {status.label}
          </span>
        </div>
      </div>

      {/* Selection indicator */}
      {isInteractive && (
        <div className="flex shrink-0 items-start pt-1">
          <FiArrowUpRight
            aria-hidden="true"
            className={`h-4 w-4 transition-colors ${
              isSelected
                ? "text-cyan-300"
                : "text-slate-600 group-hover:text-slate-300"
            }`}
          />
        </div>
      )}
    </div>
  );

  if (!isInteractive) {
    return (
      <motion.li
        initial={shouldReduceMotion ? false : { opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: shouldReduceMotion ? 0 : 0.2,
          delay: shouldReduceMotion ? 0 : Math.min(index * 0.025, 0.15),
        }}
        className="list-none"
      >
        {content}
      </motion.li>
    );
  }

  return (
    <motion.li
      initial={shouldReduceMotion ? false : { opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: shouldReduceMotion ? 0 : 0.2,
        delay: shouldReduceMotion ? 0 : Math.min(index * 0.025, 0.15),
      }}
      className="list-none"
    >
      <button
        type="button"
        onClick={() => onSelect(alert)}
        aria-pressed={isSelected}
        aria-label={`View alert ${code}: ${title}`}
        className="block w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-cyan-300/60"
      >
        {content}
      </button>
    </motion.li>
  );
}

function EmptyState({ hasFilters, onClearFilters }) {
  return (
    <div className="flex flex-col items-center justify-center px-5 py-14 text-center sm:py-16">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.025]">
        <FiInbox
          aria-hidden="true"
          className="h-6 w-6 text-slate-500"
        />
      </div>

      <h3 className="mt-4 text-sm font-semibold text-slate-200">
        {hasFilters ? "No matching alerts" : "No alerts to display"}
      </h3>

      <p className="mt-2 max-w-sm text-xs leading-5 text-slate-500 sm:text-sm">
        {hasFilters
          ? "Try adjusting your search or filters to find the alert you need."
          : "Alerts generated by the system will appear here when available."}
      </p>

      {hasFilters && typeof onClearFilters === "function" && (
        <button
          type="button"
          onClick={onClearFilters}
          className="mt-4 rounded-lg border border-cyan-300/20 bg-cyan-300/[0.06] px-3.5 py-2 text-xs font-semibold text-cyan-200 transition-colors hover:bg-cyan-300/[0.12] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}

/**
 * OrbitGuard AI — Alert List
 *
 * This component renders the alerts it receives.
 * Fetching, filtering, pagination, and API error recovery belong
 * to the parent page or the alerts data hook.
 *
 * @param {Object} props
 * @param {Array<Object>} [props.alerts=[]]
 * @param {boolean} [props.isLoading=false]
 * @param {string|null} [props.error=null]
 * @param {Function} [props.onRetry]
 * @param {Function} [props.onSelectAlert]
 * @param {string|null} [props.selectedAlertId]
 * @param {boolean} [props.hasActiveFilters=false]
 * @param {Function} [props.onClearFilters]
 * @param {number|null} [props.totalElements]
 * @param {number|null} [props.currentPage]
 * @param {number|null} [props.totalPages]
 * @param {Function} [props.onPageChange]
 */
export default function AlertList({
  alerts = [],
  isLoading = false,
  error = null,
  onRetry,
  onSelectAlert,
  selectedAlertId = null,
  hasActiveFilters = false,
  onClearFilters,
  totalElements = null,
  currentPage = null,
  totalPages = null,
  onPageChange,
}) {
  const shouldReduceMotion = useReducedMotion();

  const validAlerts = useMemo(
    () => alerts.filter(isValidAlert),
    [alerts]
  );

  const hasPagination =
    Number.isInteger(currentPage) &&
    Number.isInteger(totalPages) &&
    totalPages > 1 &&
    typeof onPageChange === "function";

  const validTotalElements =
    Number.isInteger(totalElements) && totalElements >= 0
      ? totalElements
      : null;

  const startItem =
    validTotalElements === 0 || validAlerts.length === 0
      ? 0
      : Number.isInteger(currentPage) && currentPage >= 0
        ? currentPage * validAlerts.length + 1
        : 1;

  const endItem =
    validTotalElements === 0
      ? 0
      : startItem + validAlerts.length - 1;

  return (
    <section
      aria-labelledby="alert-list-heading"
      aria-busy={isLoading}
      className="overflow-hidden rounded-xl border border-white/[0.08] bg-[#050d19]"
    >
      {/* Feed heading */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.07] px-4 py-4 sm:px-5">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5">
            <span className="h-4 w-1 rounded-full bg-cyan-300" />

            <h2
              id="alert-list-heading"
              className="font-[Orbitron] text-sm font-semibold tracking-wide text-slate-100 sm:text-base"
            >
              Alert Feed
            </h2>
          </div>

          <p className="mt-1.5 pl-3.5 text-xs text-slate-500">
            Review incidents and inspect orbital risk signals.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-lg border border-white/[0.07] bg-white/[0.02] px-2.5 py-1.5">
          <span
            aria-hidden="true"
            className={`h-1.5 w-1.5 rounded-full ${
              isLoading ? "animate-pulse bg-cyan-300" : "bg-slate-500"
            }`}
          />

          <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-slate-400">
            {isLoading ? "Loading" : "Alert records"}
          </span>
        </div>
      </div>

      {/* Error state */}
      {!isLoading && error && (
        <div
          role="alert"
          className="flex flex-col gap-3 px-5 py-8 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-start gap-3">
            <FiAlertCircle
              aria-hidden="true"
              className="mt-0.5 h-5 w-5 shrink-0 text-rose-300"
            />

            <div>
              <h3 className="text-sm font-semibold text-slate-200">
                Unable to load alerts
              </h3>

              <p className="mt-1 break-words text-xs leading-5 text-slate-400">
                {typeof error === "string"
                  ? error
                  : "An unexpected error occurred while retrieving alerts."}
              </p>
            </div>
          </div>

          {typeof onRetry === "function" && (
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex min-h-9 shrink-0 items-center justify-center gap-2 self-start rounded-lg border border-white/10 px-3 text-xs font-semibold text-slate-200 transition-colors hover:bg-white/[0.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60 sm:self-center"
            >
              <FiRefreshCw aria-hidden="true" className="h-3.5 w-3.5" />
              Retry
            </button>
          )}
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div
          role="status"
          aria-label="Loading alerts"
          className="divide-y divide-white/[0.04]"
        >
          {Array.from({ length: 5 }, (_, index) => (
            <SkeletonRow key={index} />
          ))}

          <span className="sr-only">Loading alert records...</span>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !error && validAlerts.length === 0 && (
        <EmptyState
          hasFilters={hasActiveFilters}
          onClearFilters={onClearFilters}
        />
      )}

      {/* Alert records */}
      {!isLoading && !error && validAlerts.length > 0 && (
        <ul className="m-0 list-none p-0">
          {validAlerts.map((alert, index) => {
            const id = getAlertId(alert);

            return (
              <AlertRow
                key={id ?? `${getDisplayCode(alert)}-${index}`}
                alert={alert}
                index={index}
                isSelected={
                  selectedAlertId != null &&
                  id != null &&
                  String(selectedAlertId) === String(id)
                }
                onSelect={onSelectAlert}
                shouldReduceMotion={shouldReduceMotion}
              />
            );
          })}
        </ul>
      )}

      {/* Server-driven pagination */}
      {!isLoading &&
        !error &&
        validAlerts.length > 0 &&
        validTotalElements !== null && (
          <div className="flex flex-col gap-3 border-t border-white/[0.07] px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <p className="text-xs text-slate-500">
              Showing{" "}
              <span className="font-medium text-slate-300">
                {startItem.toLocaleString("en-IN")}–
                {endItem.toLocaleString("en-IN")}
              </span>{" "}
              of{" "}
              <span className="font-medium text-slate-300">
                {validTotalElements.toLocaleString("en-IN")}
              </span>{" "}
              alerts
            </p>

            {hasPagination && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onPageChange(currentPage - 1)}
                  disabled={currentPage <= 0 || isLoading}
                  className="min-h-9 rounded-lg border border-white/[0.09] px-3 text-xs font-medium text-slate-300 transition-colors hover:bg-white/[0.04] disabled:cursor-not-allowed disabled:opacity-35"
                >
                  Previous
                </button>

                <span className="min-w-20 text-center text-xs tabular-nums text-slate-400">
                  Page {currentPage + 1} of {totalPages}
                </span>

                <button
                  type="button"
                  onClick={() => onPageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages - 1 || isLoading}
                  className="min-h-9 rounded-lg border border-white/[0.09] px-3 text-xs font-medium text-slate-300 transition-colors hover:bg-white/[0.04] disabled:cursor-not-allowed disabled:opacity-35"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
    </section>
  );
}