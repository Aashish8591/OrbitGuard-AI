
import { useCallback, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

import {
  FiActivity,
  FiAlertCircle,
  FiArrowUpRight,
  FiCalendar,
  FiCheck,
  FiCheckCircle,
  FiCopy,
  FiExternalLink,
  FiHash,
  FiMessageSquare,
  FiRadio,
  FiShield,
} from "react-icons/fi";

import AlertSeverityBadge from "./AlertSeverityBadge";
import AlertStatusBadge from "./AlertStatusBadge";

function formatDateTime(value) {
  if (!value) return "Not recorded";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Invalid date";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "UTC",
    timeZoneName: "short",
  }).format(date);
}

function displayValue(value) {
  if (
    value === null ||
    value === undefined ||
    String(value).trim() === ""
  ) {
    return "Not available";
  }

  return String(value);
}

function SectionHeading({ icon: Icon, children }) {
  return (
    <div className="mb-4 flex min-w-0 items-center gap-2.5">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-cyan-300/10 bg-cyan-300/[0.06] text-cyan-300">
        <Icon aria-hidden="true" className="h-4 w-4" />
      </span>

      <h3 className="min-w-0 text-xs font-semibold uppercase tracking-[0.13em] text-slate-300">
        {children}
      </h3>
    </div>
  );
}

function DetailField({
  label,
  value,
  mono = false,
  copyable = false,
}) {
  const [copied, setCopied] = useState(false);

  const text = displayValue(value);
  const available = text !== "Not available";

  const handleCopy = useCallback(async () => {
    if (!copyable || !available) return;

    try {
      if (!navigator?.clipboard?.writeText) return;

      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }, [copyable, available, text]);

  return (
    <div className="group min-w-0 rounded-xl border border-white/[0.06] bg-[#07111e]/75 p-3 transition-colors hover:border-white/[0.12]">
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
        {label}
      </p>

      <div className="mt-2 flex min-w-0 items-start justify-between gap-2">
        <p
          className={`min-w-0 break-all text-sm leading-5 ${
            mono
              ? "font-mono text-xs text-slate-300"
              : "break-words text-slate-200"
          }`}
        >
          {text}
        </p>

        {copyable && available && (
          <button
            type="button"
            onClick={handleCopy}
            aria-label={copied ? `${label} copied` : `Copy ${label}`}
            title={copied ? "Copied" : `Copy ${label}`}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-white/[0.06] hover:text-cyan-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60"
          >
            {copied ? (
              <FiCheck
                aria-hidden="true"
                className="h-3.5 w-3.5 text-emerald-300"
              />
            ) : (
              <FiCopy aria-hidden="true" className="h-3.5 w-3.5" />
            )}
          </button>
        )}
      </div>

      {copied && (
        <p className="mt-1 text-[10px] text-emerald-300" role="status">
          Copied to clipboard
        </p>
      )}
    </div>
  );
}

function TimelineItem({
  label,
  value,
  icon: Icon,
  last = false,
  completed = false,
}) {
  const hasValue =
    value !== null &&
    value !== undefined &&
    String(value).trim() !== "" &&
    !Number.isNaN(new Date(value).getTime());

  return (
    <div className="relative flex gap-3">
      <div className="flex shrink-0 flex-col items-center">
        <span
          className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-lg border ${
            completed
              ? "border-emerald-400/20 bg-emerald-400/[0.08] text-emerald-300"
              : "border-white/[0.08] bg-[#07111f] text-slate-500"
          }`}
        >
          <Icon aria-hidden="true" className="h-3.5 w-3.5" />
        </span>

        {!last && (
          <span className="mt-1 min-h-5 w-px flex-1 bg-white/[0.08]" />
        )}
      </div>

      <div className="min-w-0 flex-1 pb-5">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-xs font-medium text-slate-200">{label}</p>

          {completed && (
            <span className="rounded-full border border-emerald-400/15 bg-emerald-400/[0.06] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-emerald-300">
              Recorded
            </span>
          )}
        </div>

        <p className="mt-1 break-words text-xs leading-5 text-slate-500">
          {hasValue ? formatDateTime(value) : "Awaiting event"}
        </p>
      </div>
    </div>
  );
}

function LinkedEntityButton({ icon: Icon, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-white/[0.09] bg-white/[0.02] px-3 text-xs font-medium text-slate-300 transition-colors hover:border-cyan-300/25 hover:bg-cyan-300/[0.05] hover:text-cyan-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60"
    >
      <Icon aria-hidden="true" className="h-3.5 w-3.5" />
      <span>{label}</span>
      <FiArrowUpRight aria-hidden="true" className="h-3.5 w-3.5" />
    </button>
  );
}

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
    if (
      !alert ||
      typeof alert !== "object" ||
      Array.isArray(alert)
    ) {
      return null;
    }

    return {
      id: alert.id ?? alert.alertId ?? alert._id ?? null,
      code: alert.alertCode,
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

  const normalizedStatus = String(details?.status ?? "").toUpperCase();

  const isAcknowledged = [
    "ACKNOWLEDGED",
    "RESOLVED",
    "CLOSED",
  ].includes(normalizedStatus);

  const isResolved = ["RESOLVED", "CLOSED"].includes(normalizedStatus);

  return (
    <motion.aside
      initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
      aria-label="Selected alert information"
      aria-busy={isLoading}
      className="flex min-w-0 flex-col bg-[#030b16] text-slate-100"
    >
      {/* Loading state */}
      {isLoading && (
        <div role="status" className="space-y-5 p-4 sm:p-6">
          <span className="sr-only">Loading alert details…</span>

          <div className="animate-pulse space-y-3 motion-reduce:animate-none">
            <div className="h-5 w-28 rounded-full bg-white/[0.07]" />
            <div className="h-6 w-4/5 rounded bg-white/[0.07]" />
            <div className="h-3 w-full rounded bg-white/[0.05]" />
            <div className="h-3 w-3/4 rounded bg-white/[0.05]" />
          </div>

          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="animate-pulse rounded-xl border border-white/[0.06] p-4 motion-reduce:animate-none"
            >
              <div className="h-3 w-32 rounded bg-white/[0.07]" />
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="h-14 rounded-lg bg-white/[0.04]" />
                <div className="h-14 rounded-lg bg-white/[0.04]" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error state */}
      {!isLoading && error && (
        <div role="alert" className="p-5 sm:p-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-rose-400/15 bg-rose-400/[0.07] text-rose-300">
            <FiAlertCircle aria-hidden="true" className="h-5 w-5" />
          </div>

          <h3 className="mt-4 text-sm font-semibold text-slate-100">
            Unable to load details
          </h3>

          <p className="mt-2 break-words text-xs leading-6 text-slate-400">
            {typeof error === "string"
              ? error
              : "An error occurred while retrieving this alert."}
          </p>

          {typeof onRetry === "function" && (
            <button
              type="button"
              onClick={onRetry}
              className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-lg border border-white/10 px-4 text-xs font-semibold text-slate-200 transition-colors hover:bg-white/[0.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60"
            >
              <FiActivity aria-hidden="true" className="h-3.5 w-3.5" />
              Retry request
            </button>
          )}
        </div>
      )}

      {/* No selection */}
      {!isLoading && !error && !details && (
        <div className="flex min-h-72 flex-col items-center justify-center px-6 py-12 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.025] text-slate-500">
            <FiRadio aria-hidden="true" className="h-6 w-6" />
          </span>

          <h3 className="mt-4 text-sm font-semibold text-slate-200">
            Select an alert
          </h3>

          <p className="mt-2 max-w-xs text-xs leading-6 text-slate-500">
            Choose an alert from the feed to inspect its classification,
            linked orbital objects, and operational history.
          </p>
        </div>
      )}

      {/* Selected alert content */}
      {!isLoading && !error && details && (
        <div className="min-w-0 divide-y divide-white/[0.06]">
          {/* Incident overview */}
          <section className="p-4 sm:p-6">
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

            <h2 className="mt-4 break-words text-lg font-semibold leading-7 text-white sm:text-xl">
              {details.title}
            </h2>

            <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-400">
              {details.message || "No additional message provided."}
            </p>

            <div className="mt-5 rounded-xl border border-cyan-300/10 bg-gradient-to-br from-cyan-300/[0.06] to-transparent p-3.5 sm:p-4">
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-cyan-300/10 bg-[#061322] text-cyan-300">
                  <FiHash aria-hidden="true" className="h-4 w-4" />
                </span>

                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-slate-500">
                    Alert reference
                  </p>

                  <p className="mt-1 break-all font-mono text-xs leading-5 text-slate-200">
                    {displayValue(details.code)}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Orbital references */}
          <section className="p-4 sm:p-6">
            <SectionHeading icon={FiActivity}>
              Orbital references
            </SectionHeading>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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

            {(details.riskId ||
              details.satelliteId ||
              details.debrisId) && (
              <div className="mt-4 flex flex-wrap gap-2">
                {details.riskId &&
                  typeof onViewRisk === "function" && (
                    <LinkedEntityButton
                      icon={FiShield}
                      label="View risk"
                      onClick={() => onViewRisk(details.riskId)}
                    />
                  )}

                {details.satelliteId &&
                  typeof onViewSatellite === "function" && (
                    <LinkedEntityButton
                      icon={FiRadio}
                      label="View satellite"
                      onClick={() =>
                        onViewSatellite(details.satelliteId)
                      }
                    />
                  )}

                {details.debrisId &&
                  typeof onViewDebris === "function" && (
                    <LinkedEntityButton
                      icon={FiExternalLink}
                      label="View debris"
                      onClick={() => onViewDebris(details.debrisId)}
                    />
                  )}
              </div>
            )}
          </section>

          {/* Classification */}
          <section className="p-4 sm:p-6">
            <SectionHeading icon={FiShield}>
              Classification
            </SectionHeading>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <DetailField label="Alert type" value={details.type} />
              <DetailField label="Source" value={details.source} />
            </div>
          </section>

          {/* Event timeline */}
          <section className="p-4 sm:p-6">
            <SectionHeading icon={FiCalendar}>
              Event timeline
            </SectionHeading>

            <div className="rounded-xl border border-white/[0.05] bg-[#07111e]/50 px-3 pt-4">
              <TimelineItem
                label="Alert generated"
                value={details.generatedAt ?? details.createdAt}
                icon={FiRadio}
                completed={Boolean(details.generatedAt ?? details.createdAt)}
              />

              <TimelineItem
                label="Acknowledged"
                value={details.acknowledgedAt}
                icon={FiCheck}
                completed={
                  Boolean(details.acknowledgedAt) || isAcknowledged
                }
              />

              <TimelineItem
                label="Resolved"
                value={details.resolvedAt}
                icon={FiCheckCircle}
                completed={Boolean(details.resolvedAt) || isResolved}
                last
              />
            </div>

            <div className="mt-3">
              <DetailField
                label="Last updated"
                value={
                  details.updatedAt
                    ? formatDateTime(details.updatedAt)
                    : null
                }
              />
            </div>

            <p className="mt-3 text-[10px] leading-5 text-slate-500">
              Event times are displayed in UTC. Missing timestamps mean
              the corresponding event time was not recorded in the
              available alert data.
            </p>
          </section>

          {/* Operator remarks */}
          <section className="p-4 sm:p-6">
            <SectionHeading icon={FiMessageSquare}>
              Operator remarks
            </SectionHeading>

            {details.remarks ? (
              <p className="whitespace-pre-wrap break-words rounded-xl border border-white/[0.06] bg-[#07111e]/70 p-4 text-xs leading-6 text-slate-300">
                {details.remarks}
              </p>
            ) : (
              <div className="rounded-xl border border-dashed border-white/[0.09] px-4 py-5 text-center">
                <FiMessageSquare
                  aria-hidden="true"
                  className="mx-auto h-5 w-5 text-slate-600"
                />

                <p className="mt-2 text-xs text-slate-400">
                  No operator remarks recorded
                </p>

                <p className="mt-1 text-[10px] leading-5 text-slate-600">
                  Remarks may be added during an alert status update.
                </p>
              </div>
            )}
          </section>

          {/* Workflow actions */}
          {actions && (
            <section className="bg-white/[0.015] p-4 sm:p-6">
              <SectionHeading icon={FiCheckCircle}>
                Workflow actions
              </SectionHeading>

              {actions}
            </section>
          )}

          {/* Footer */}
          <footer className="flex items-start gap-2 px-4 py-3.5 sm:px-6">
            <FiShield
              aria-hidden="true"
              className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-600"
            />

            <p className="text-[10px] leading-5 text-slate-500">
              Information is displayed from the selected alert record.
              Missing fields are shown as unavailable rather than inferred.
            </p>
          </footer>
        </div>
      )}
    </motion.aside>
  );
}
