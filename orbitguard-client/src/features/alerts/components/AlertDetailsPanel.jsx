import { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  FiActivity,
  FiAlertCircle,
  FiArrowUpRight,
  FiCalendar,
  FiCheck,
  FiClock,
  FiCopy,
  FiExternalLink,
  FiHash,
  FiMessageSquare,
  FiRadio,
  FiShield,
  FiSatellite,
  FiX,
} from "react-icons/fi";

import AlertSeverityBadge from "./AlertSeverityBadge";
import AlertStatusBadge from "./AlertStatusBadge";

function formatDateTime(value) {
  if (!value) return "Not available";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: "UTC",
    timeZoneName: "short",
  }).format(date);
}

function DetailField({ label, value, mono = false, copyable = false }) {
  const displayValue =
    value !== null && value !== undefined && String(value).trim() !== ""
      ? String(value)
      : "Not available";

  const canCopy = copyable && displayValue !== "Not available";

  const handleCopy = () => {
    if (canCopy && typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(displayValue).catch(() => {
        // Copy failures should not break the details panel.
      });
    }
  };

  return (
    <div className="min-w-0">
      <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-slate-500">
        {label}
      </p>

      <div className="mt-1.5 flex min-w-0 items-start justify-between gap-2">
        <p
          className={`min-w-0 break-words text-sm leading-5 ${
            mono ? "font-mono text-xs text-slate-300" : "text-slate-200"
          }`}
        >
          {displayValue}
        </p>

        {canCopy && (
          <button
            type="button"
            onClick={handleCopy}
            aria-label={`Copy ${label}`}
            title={`Copy ${label}`}
            className="shrink-0 rounded-md p-1 text-slate-500 transition-colors hover:bg-white/[0.05] hover:text-cyan-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60"
          >
            <FiCopy aria-hidden="true" className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

function TimelineItem({ label, value, icon: Icon, last = false }) {
  return (
    <div className="relative flex gap-3">
      <div className="flex flex-col items-center">
        <div className="z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/[0.08] bg-[#07111f] text-slate-400">
          <Icon aria-hidden="true" className="h-3.5 w-3.5" />
        </div>

        {!last && (
          <div className="mt-1 min-h-5 w-px flex-1 bg-white/[0.08]" />
        )}
      </div>

      <div className="min-w-0 flex-1 pb-4">
        <p className="text-xs font-medium text-slate-300">{label}</p>
        <p className="mt-1 break-words text-[11px] leading-5 text-slate-500">
          {formatDateTime(value)}
        </p>
      </div>
    </div>
  );
}

/**
 * OrbitGuard AI — Alert Details Panel
 *
 * Presentation component for the currently selected alert.
 *
 * @param {Object} props
 * @param {Object|null} props.alert Selected alert response.
 * @param {Function} [props.onClose] Close/deselect callback.
 * @param {Function} [props.onViewRisk] Optional callback to navigate to risk.
 * @param {Function} [props.onViewSatellite] Optional satellite callback.
 * @param {Function} [props.onViewDebris] Optional debris callback.
 * @param {boolean} [props.isLoading=false] Detail loading state.
 * @param {string|null} [props.error=null] Detail loading error.
 * @param {Function} [props.onRetry] Retry callback.
 * @param {React.ReactNode} [props.actions] Optional status action component.
 */
export default function AlertDetailsPanel({
  alert = null,
  onClose,
  onViewRisk,
  onViewSatellite,
  onViewDebris,
  isLoading = false,
  error = null,
  onRetry,
  actions = null,
}) {
  const shouldReduceMotion = useReducedMotion();

  const details = useMemo(() => {
    if (!alert || typeof alert !== "object" || Array.isArray(alert)) {
      return null;
    }

    return {
      id: alert.id ?? alert._id ?? null,
      code: alert.alertCode || "Alert reference unavailable",
      title: alert.title?.trim() || "Untitled alert",
      message: alert.message?.trim() || "",
      remarks: alert.remarks?.trim() || "",
      severity: alert.severity,
      status: alert.status,
      source: alert.source,
      type: alert.type,
      riskId: alert.riskId,
      satelliteId: alert.satelliteId,
      debrisId: alert.debrisId,
      generatedAt: alert.generatedAt,
      acknowledgedAt: alert.acknowledgedAt,
      resolvedAt: alert.resolvedAt,
      createdAt: alert.createdAt,
      updatedAt: alert.updatedAt,
    };
  }, [alert]);

  if (!details && !isLoading && !error) {
    return (
      <aside
        aria-label="Alert details"
        className="flex min-h-72 flex-col items-center justify-center rounded-xl border border-white/[0.08] bg-[#050d19] px-5 py-10 text-center"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.025]">
          <FiRadio aria-hidden="true" className="h-5 w-5 text-slate-500" />
        </div>

        <h2 className="mt-4 text-sm font-semibold text-slate-200">
          Select an alert
        </h2>

        <p className="mt-2 max-w-xs text-xs leading-5 text-slate-500">
          Choose an alert from the feed to inspect its details and operational
          history.
        </p>
      </aside>
    );
  }

  return (
    <motion.aside
      initial={shouldReduceMotion ? false : { opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.25 }}
      aria-label="Alert details"
      aria-busy={isLoading}
      className="min-w-0 overflow-hidden rounded-xl border border-white/[0.08] bg-[#050d19]"
    >
      {/* Panel heading */}
      <div className="flex items-start justify-between gap-3 border-b border-white/[0.07] px-4 py-4 sm:px-5">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="h-4 w-1 rounded-full bg-cyan-300" />
            <h2 className="font-[Orbitron] text-sm font-semibold tracking-wide text-slate-100">
              Alert Details
            </h2>
          </div>

          <p className="mt-1.5 pl-3.5 text-xs text-slate-500">
            Incident intelligence and traceability
          </p>
        </div>

        {typeof onClose === "function" && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close alert details"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/[0.08] text-slate-400 transition-colors hover:border-white/[0.16] hover:bg-white/[0.04] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60"
          >
            <FiX aria-hidden="true" className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Loading */}
      {isLoading && (
        <div role="status" className="space-y-4 p-5">
          <span className="sr-only">Loading alert details...</span>

          {[100, 75, 90, 55, 85, 65].map((width, index) => (
            <div
              key={index}
              aria-hidden="true"
              className="h-3 animate-pulse rounded bg-white/[0.06]"
              style={{ width: `${width}%` }}
            />
          ))}
        </div>
      )}

      {/* Error */}
      {!isLoading && error && (
        <div role="alert" className="p-5">
          <FiAlertCircle
            aria-hidden="true"
            className="h-5 w-5 text-rose-300"
          />

          <h3 className="mt-3 text-sm font-semibold text-slate-200">
            Unable to load details
          </h3>

          <p className="mt-1 break-words text-xs leading-5 text-slate-400">
            {typeof error === "string"
              ? error
              : "An error occurred while retrieving the selected alert."}
          </p>

          {typeof onRetry === "function" && (
            <button
              type="button"
              onClick={onRetry}
              className="mt-4 rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-white/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60"
            >
              Retry
            </button>
          )}
        </div>
      )}

      {/* Actual alert details */}
      {!isLoading && !error && details && (
        <div className="divide-y divide-white/[0.06]">
          {/* Summary */}
          <div className="p-4 sm:p-5">
            <div className="flex flex-wrap items-center gap-2">
              <AlertSeverityBadge
                severity={details.severity}
                size="md"
                indicator="icon"
              />

              <AlertStatusBadge
                status={details.status}
                size="md"
                indicator="dot"
              />
            </div>

            <h3 className="mt-4 break-words text-base font-semibold leading-6 text-white sm:text-lg">
              {details.title}
            </h3>

            <p className="mt-2 break-words text-xs leading-6 text-slate-400 sm:text-sm">
              {details.message || "No additional message provided."}
            </p>

            <div className="mt-4 flex items-start gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
              <FiHash
                aria-hidden="true"
                className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300"
              />

              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                  Alert reference
                </p>

                <p className="mt-1 break-all font-mono text-xs text-slate-200">
                  {details.code}
                </p>
              </div>
            </div>
          </div>

          {/* Linked entities */}
          <div className="p-4 sm:p-5">
            <div className="mb-4 flex items-center gap-2">
              <FiActivity
                aria-hidden="true"
                className="h-4 w-4 text-cyan-300"
              />

              <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-300">
                Orbital references
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <DetailField
                label="Risk ID"
                value={details.riskId}
                mono
                copyable
              />

              <DetailField
                label="Satellite ID"
                value={details.satelliteId}
                mono
                copyable
              />

              <DetailField
                label="Debris ID"
                value={details.debrisId}
                mono
                copyable
              />

              <DetailField
                label="Alert ID"
                value={details.id}
                mono
                copyable
              />
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {details.riskId && typeof onViewRisk === "function" && (
                <button
                  type="button"
                  onClick={() => onViewRisk(details.riskId)}
                  className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-white/[0.09] px-3 text-xs font-medium text-slate-300 transition-colors hover:border-cyan-300/20 hover:text-cyan-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60"
                >
                  View risk
                  <FiArrowUpRight aria-hidden="true" className="h-3.5 w-3.5" />
                </button>
              )}

              {details.satelliteId &&
                typeof onViewSatellite === "function" && (
                  <button
                    type="button"
                    onClick={() => onViewSatellite(details.satelliteId)}
                    className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-white/[0.09] px-3 text-xs font-medium text-slate-300 transition-colors hover:border-cyan-300/20 hover:text-cyan-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60"
                  >
                    <FiSatellite aria-hidden="true" className="h-3.5 w-3.5" />
                    Satellite
                    <FiExternalLink
                      aria-hidden="true"
                      className="h-3 w-3"
                    />
                  </button>
                )}

              {details.debrisId && typeof onViewDebris === "function" && (
                <button
                  type="button"
                  onClick={() => onViewDebris(details.debrisId)}
                  className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-white/[0.09] px-3 text-xs font-medium text-slate-300 transition-colors hover:border-cyan-300/20 hover:text-cyan-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60"
                >
                  <FiExternalLink aria-hidden="true" className="h-3.5 w-3.5" />
                  Debris
                </button>
              )}
            </div>
          </div>

          {/* Classification */}
          <div className="p-4 sm:p-5">
            <div className="mb-4 flex items-center gap-2">
              <FiShield
                aria-hidden="true"
                className="h-4 w-4 text-cyan-300"
              />

              <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-300">
                Classification
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <DetailField label="Alert type" value={details.type} />
              <DetailField label="Source" value={details.source} />
            </div>
          </div>

          {/* Timestamps */}
          <div className="p-4 sm:p-5">
            <div className="mb-4 flex items-center gap-2">
              <FiCalendar
                aria-hidden="true"
                className="h-4 w-4 text-cyan-300"
              />

              <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-300">
                Event timeline
              </h3>
            </div>

            <div>
              <TimelineItem
                label="Alert generated"
                value={details.generatedAt ?? details.createdAt}
              />

              <TimelineItem
                label="Acknowledged"
                value={details.acknowledgedAt}
              />

              <TimelineItem
                label="Resolved"
                value={details.resolvedAt}
                last
              />
            </div>

            <div className="mt-1 border-t border-white/[0.06] pt-3">
              <DetailField
                label="Last updated"
                value={formatDateTime(details.updatedAt)}
              />
            </div>
          </div>

          {/* Remarks */}
          <div className="p-4 sm:p-5">
            <div className="mb-3 flex items-center gap-2">
              <FiMessageSquare
                aria-hidden="true"
                className="h-4 w-4 text-cyan-300"
              />

              <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-300">
                Operator remarks
              </h3>
            </div>

            {details.remarks ? (
              <p className="whitespace-pre-wrap break-words rounded-lg border border-white/[0.06] bg-white/[0.02] p-3 text-xs leading-6 text-slate-300">
                {details.remarks}
              </p>
            ) : (
              <p className="text-xs leading-5 text-slate-500">
                No operator remarks have been recorded.
              </p>
            )}
          </div>

          {/* Status workflow controls */}
          {actions && (
            <div className="bg-white/[0.015] p-4 sm:p-5">
              {actions}
            </div>
          )}

          <div className="flex items-center gap-2 px-4 py-3 sm:px-5">
            <FiCheck
              aria-hidden="true"
              className="h-3.5 w-3.5 shrink-0 text-slate-500"
            />

            <p className="text-[10px] leading-4 text-slate-500">
              Details are displayed from the selected alert record.
            </p>
          </div>
        </div>
      )}
    </motion.aside>
  );
}