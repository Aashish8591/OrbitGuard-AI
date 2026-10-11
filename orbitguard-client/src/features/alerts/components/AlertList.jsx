
import { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";

import {
  FiAlertCircle,
  FiAlertTriangle,
  FiArrowDownRight,
  FiArrowRight,
  FiArrowUpRight,
  FiCheckCircle,
  FiChevronLeft,
  FiChevronRight,
  FiClock,
  FiInbox,
  FiRadio,
  FiRefreshCw,
  FiShield,
} from "react-icons/fi";

const SEVERITY_CONFIG = {
  CRITICAL: {
    label: "Critical",
    icon: FiAlertTriangle,
    badge:
      "border-rose-400/20 bg-rose-400/[0.08] text-rose-300",
    indicator: "bg-rose-400",
    accent: "before:bg-rose-400",
  },
  HIGH: {
    label: "High",
    icon: FiAlertTriangle,
    badge:
      "border-orange-400/20 bg-orange-400/[0.08] text-orange-300",
    indicator: "bg-orange-400",
    accent: "before:bg-orange-400",
  },
  MEDIUM: {
    label: "Medium",
    icon: FiAlertCircle,
    badge:
      "border-amber-400/20 bg-amber-400/[0.08] text-amber-300",
    indicator: "bg-amber-400",
    accent: "before:bg-amber-400",
  },
  LOW: {
    label: "Low",
    icon: FiShield,
    badge:
      "border-sky-400/20 bg-sky-400/[0.08] text-sky-300",
    indicator: "bg-sky-400",
    accent: "before:bg-sky-400",
  },
};

const DEFAULT_SEVERITY = {
  label: "Unspecified",
  icon: FiAlertCircle,
  badge: "border-white/[0.09] bg-white/[0.035] text-slate-400",
  indicator: "bg-slate-500",
  accent: "before:bg-slate-600",
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

const DEFAULT_STATUS = {
  label: "Unknown status",
  className: "text-slate-400",
  indicator: "bg-slate-500",
};

function normalizeEnum(value) {
  return typeof value === "string" ? value.trim().toUpperCase() : "";
}

function getAlertId(alert) {
  return alert?.id ?? alert?.alertId ?? alert?._id ?? null;
}

function getDisplayCode(alert) {
  return alert?.alertCode || "Reference unavailable";
}

function getDisplayTitle(alert) {
  return alert?.title?.trim() || "Untitled alert";
}

function getDisplayMessage(alert) {
  return alert?.message?.trim() || "No additional message provided.";
}

function getTimestamp(alert) {
  return alert?.generatedAt ?? alert?.createdAt ?? alert?.updatedAt ?? null;
}

function formatDateTime(value) {
  if (!value) return "Time unavailable";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Time unavailable";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
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
      className="flex gap-3 border-b border-white/[0.045] p-4 last:border-b-0 sm:gap-4 sm:p-5"
    >
      <div className="h-10 w-10 shrink-0 animate-pulse rounded-xl bg-white/[0.06] motion-reduce:animate-none" />

      <div className="min-w-0 flex-1 space-y-3">
        <div className="h-3 w-28 animate-pulse rounded bg-white/[0.06] motion-reduce:animate-none" />
        <div className="h-4 w-3/4 max-w-72 animate-pulse rounded bg-white/[0.07] motion-reduce:animate-none" />
        <div className="h-3 w-full max-w-lg animate-pulse rounded bg-white/[0.04] motion-reduce:animate-none" />

        <div className="flex gap-2">
          <div className="h-5 w-16 animate-pulse rounded-md bg-white/[0.05] motion-reduce:animate-none" />
          <div className="h-5 w-24 animate-pulse rounded-md bg-white/[0.05] motion-reduce:animate-none" />
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
  const severityKey = normalizeEnum(alert.severity);
  const statusKey = normalizeEnum(alert.status);

  const severity = SEVERITY_CONFIG[severityKey] ?? DEFAULT_SEVERITY;
  const status = STATUS_CONFIG[statusKey] ?? DEFAULT_STATUS;
  const SeverityIcon = severity.icon;

  const code = getDisplayCode(alert);
  const title = getDisplayTitle(alert);
  const message = getDisplayMessage(alert);
  const timestamp = getTimestamp(alert);
  const parsedDate = timestamp ? new Date(timestamp) : null;

  const validTimestamp =
    parsedDate && !Number.isNaN(parsedDate.getTime());

  const satelliteId = alert.satelliteId;
  const debrisId = alert.debrisId;
  const riskId = alert.riskId;

  const interactive = typeof onSelect === "function";

  const content = (
    <div
      className={[
        "relative flex min-w-0 gap-3 p-4 text-left transition-colors duration-200 sm:gap-4 sm:px-5 sm:py-4",
        "before:absolute before:inset-y-3 before:left-0 before:w-[2px] before:rounded-r",
        severity.accent,
        isSelected
          ? "bg-cyan-300/[0.055]"
          : "hover:bg-white/[0.025]",
      ].join(" ")}
    >
      {/* Severity icon */}
      <div className="shrink-0 pt-0.5">
        <span
          className={[
            "flex h-10 w-10 items-center justify-center rounded-xl border",
            severity.badge,
          ].join(" ")}
        >
          <SeverityIcon
            aria-hidden="true"
            className="h-[18px] w-[18px]"
          />
        </span>
      </div>

      {/* Main content */}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="max-w-full break-all font-mono text-[10px] tracking-wide text-slate-500 sm:text-[11px]">
            {code}
          </span>

          <span
            aria-hidden="true"
            className="h-1 w-1 rounded-full bg-slate-700"
          />

          <time
            dateTime={validTimestamp ? parsedDate.toISOString() : undefined}
            className="text-[10px] text-slate-500 sm:text-[11px]"
          >
            {formatDateTime(timestamp)}
          </time>
        </div>

        <h3 className="mt-2 break-words text-sm font-semibold leading-5 text-slate-100 sm:text-[15px]">
          {title}
        </h3>

        <p className="mt-1.5 line-clamp-2 break-words text-xs leading-5 text-slate-400 sm:text-[13px]">
          {message}
        </p>

        {/* Associated orbital objects */}
        {(satelliteId || debrisId || riskId) && (
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
            {satelliteId && (
              <span className="max-w-full break-all text-[10px] text-slate-500 sm:text-[11px]">
                <span className="mr-1 font-semibold tracking-wider text-slate-600">
                  SAT
                </span>
                {satelliteId}
              </span>
            )}

            {debrisId && (
              <span className="max-w-full break-all text-[10px] text-slate-500 sm:text-[11px]">
                <span className="mr-1 font-semibold tracking-wider text-slate-600">
                  DEBRIS
                </span>
                {debrisId}
              </span>
            )}

            {riskId && (
              <span className="max-w-full break-all text-[10px] text-slate-500 sm:text-[11px]">
                <span className="mr-1 font-semibold tracking-wider text-slate-600">
                  RISK
                </span>
                {riskId}
              </span>
            )}
          </div>
        )}

        {/* Severity and status */}
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
          <span
            className={[
              "inline-flex items-center gap-1.5 rounded-md border px-2 py-1",
              "text-[9px] font-semibold uppercase tracking-[0.08em]",
              severity.badge,
            ].join(" ")}
          >
            <span
              aria-hidden="true"
              className={`h-1.5 w-1.5 rounded-full ${severity.indicator}`}
            />
            {severity.label}
          </span>

          <span
            className={`inline-flex items-center gap-1.5 text-[10px] font-medium ${status.className}`}
          >
            <span
              aria-hidden="true"
              className={`h-1.5 w-1.5 rounded-full ${status.indicator}`}
            />
            {status.label}
          </span>
        </div>
      </div>

      {/* Selection affordance */}
      {interactive && (
        <div className="flex shrink-0 items-start pt-1">
          <span
            className={[
              "flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
              isSelected
                ? "bg-cyan-300/10 text-cyan-300"
                : "text-slate-600 group-hover:bg-white/[0.05] group-hover:text-slate-300",
            ].join(" ")}
          >
            <FiArrowUpRight
              aria-hidden="true"
              className="h-4 w-4"
            />
          </span>
        </div>
      )}
    </div>
  );

  return (
    <motion.li
      initial={shouldReduceMotion ? false : { opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: shouldReduceMotion ? 0 : 0.18,
        delay: shouldReduceMotion ? 0 : Math.min(index * 0.02, 0.12),
      }}
      className="list-none"
    >
      {interactive ? (
        <button
          type="button"
          onClick={() => onSelect(alert)}
          aria-pressed={isSelected}
          aria-label={`View alert ${code}: ${title}`}
          className="group block w-full text-left focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-cyan-300/60"
        >
          {content}
        </button>
      ) : (
        content
      )}
    </motion.li>
  );
}

function EmptyState({ hasFilters, onClearFilters }) {
  return (
    <div className="flex flex-col items-center justify-center px-5 py-14 text-center sm:py-16">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.025] text-slate-500">
        <FiInbox aria-hidden="true" className="h-6 w-6" />
      </span>

      <h3 className="mt-4 text-sm font-semibold text-slate-200">
        {hasFilters ? "No matching alerts" : "No alerts to display"}
      </h3>

      <p className="mt-2 max-w-sm text-xs leading-6 text-slate-500 sm:text-sm">
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
      aria-label="Alert records"
      aria-busy={isLoading}
      className="min-w-0 overflow-hidden rounded-xl border border-white/[0.075] bg-[#050d19] shadow-[0_12px_40px_rgba(0,0,0,0.12)]"
    >
      {/* Compact records toolbar; page heading remains in Alerts.jsx */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] bg-white/[0.012] px-4 py-3.5 sm:px-5">
        <div className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-cyan-300/10 bg-cyan-300/[0.05] text-cyan-300">
            <FiRadio aria-hidden="true" className="h-3.5 w-3.5" />
          </span>

          <div>
            <p className="text-[11px] font-semibold text-slate-300">
              Operational records
            </p>
            <p className="mt-0.5 text-[10px] text-slate-600">
              Select a record to investigate
            </p>
          </div>
        </div>

        <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.07] bg-white/[0.02] px-2.5 py-1.5">
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              isLoading
                ? "animate-pulse bg-cyan-300"
                : error
                  ? "bg-rose-400"
                  : "bg-emerald-400"
            }`}
          />
          <span className="text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-400">
            {isLoading ? "Syncing" : error ? "Unavailable" : "Feed"}
          </span>
        </div>
      </div>

      {/* Error */}
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

            <div className="min-w-0">
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

      {/* Loading */}
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

      {/* Empty */}
      {!isLoading && !error && validAlerts.length === 0 && (
        <EmptyState
          hasFilters={hasActiveFilters}
          onClearFilters={onClearFilters}
        />
      )}

      {/* Records */}
      {!isLoading && !error && validAlerts.length > 0 && (
        <ul className="m-0 divide-y divide-white/[0.045] p-0">
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

      {/* Pagination */}
      {!isLoading &&
        !error &&
        validAlerts.length > 0 &&
        validTotalElements !== null && (
          <footer className="flex flex-col gap-3 border-t border-white/[0.06] bg-white/[0.012] px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <p className="text-[11px] text-slate-500">
              Showing{" "}
              <span className="font-semibold tabular-nums text-slate-300">
                {startItem.toLocaleString("en-IN")}–
                {endItem.toLocaleString("en-IN")}
              </span>{" "}
              of{" "}
              <span className="font-semibold tabular-nums text-slate-300">
                {validTotalElements.toLocaleString("en-IN")}
              </span>{" "}
              alerts
            </p>

            {hasPagination && (
              <div className="flex items-center justify-between gap-2 sm:justify-end">
                <button
                  type="button"
                  onClick={() => onPageChange(currentPage - 1)}
                  disabled={currentPage <= 0 || isLoading}
                  aria-label="Previous page"
                  className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-white/[0.08] px-3 text-xs font-medium text-slate-300 transition-colors hover:border-white/[0.14] hover:bg-white/[0.04] disabled:cursor-not-allowed disabled:opacity-35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60"
                >
                  <FiChevronLeft aria-hidden="true" className="h-3.5 w-3.5" />
                  Previous
                </button>

                <span className="min-w-20 text-center text-[11px] tabular-nums text-slate-400">
                  {currentPage + 1} / {totalPages}
                </span>

                <button
                  type="button"
                  onClick={() => onPageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages - 1 || isLoading}
                  aria-label="Next page"
                  className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-white/[0.08] px-3 text-xs font-medium text-slate-300 transition-colors hover:border-white/[0.14] hover:bg-white/[0.04] disabled:cursor-not-allowed disabled:opacity-35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60"
                >
                  Next
                  <FiChevronRight aria-hidden="true" className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </footer>
        )}
    </section>
  );
}
