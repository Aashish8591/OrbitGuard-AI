import { motion, useReducedMotion } from "framer-motion";
import {
  FiAlertCircle,
  FiAlertTriangle,
  FiArrowUpRight,
  FiCheckCircle,
  FiClock,
  FiRadio,
  FiShield,
} from "react-icons/fi";

const SEVERITY_CONFIG = {
  CRITICAL: {
    label: "Critical",
    icon: FiAlertTriangle,
    accent: "bg-rose-400",
    iconStyle:
      "border-rose-400/20 bg-rose-400/[0.09] text-rose-300",
    badge:
      "border-rose-400/25 bg-rose-400/[0.08] text-rose-300",
    selected:
      "border-rose-400/30 bg-rose-400/[0.035]",
  },
  HIGH: {
    label: "High",
    icon: FiAlertTriangle,
    accent: "bg-orange-400",
    iconStyle:
      "border-orange-400/20 bg-orange-400/[0.08] text-orange-300",
    badge:
      "border-orange-400/25 bg-orange-400/[0.08] text-orange-300",
    selected:
      "border-orange-400/30 bg-orange-400/[0.025]",
  },
  MEDIUM: {
    label: "Medium",
    icon: FiAlertCircle,
    accent: "bg-amber-400",
    iconStyle:
      "border-amber-400/20 bg-amber-400/[0.08] text-amber-300",
    badge:
      "border-amber-400/25 bg-amber-400/[0.08] text-amber-300",
    selected:
      "border-amber-400/25 bg-amber-400/[0.025]",
  },
  LOW: {
    label: "Low",
    icon: FiShield,
    accent: "bg-sky-400",
    iconStyle:
      "border-sky-400/20 bg-sky-400/[0.08] text-sky-300",
    badge:
      "border-sky-400/25 bg-sky-400/[0.08] text-sky-300",
    selected:
      "border-sky-400/25 bg-sky-400/[0.025]",
  },
};

const STATUS_CONFIG = {
  PENDING: {
    label: "Pending",
    icon: FiClock,
    style: "text-amber-300",
    dot: "bg-amber-300",
  },
  ACKNOWLEDGED: {
    label: "Acknowledged",
    icon: FiRadio,
    style: "text-cyan-300",
    dot: "bg-cyan-300",
  },
  RESOLVED: {
    label: "Resolved",
    icon: FiCheckCircle,
    style: "text-emerald-300",
    dot: "bg-emerald-300",
  },
  CLOSED: {
    label: "Closed",
    icon: FiCheckCircle,
    style: "text-slate-400",
    dot: "bg-slate-500",
  },
};

const DEFAULT_SEVERITY = {
  label: "Unspecified",
  icon: FiAlertCircle,
  accent: "bg-slate-500",
  iconStyle:
    "border-white/10 bg-white/[0.04] text-slate-400",
  badge:
    "border-white/10 bg-white/[0.04] text-slate-400",
  selected:
    "border-white/15 bg-white/[0.025]",
};

const DEFAULT_STATUS = {
  label: "Unknown status",
  icon: FiClock,
  style: "text-slate-400",
  dot: "bg-slate-500",
};

function normalizeEnum(value) {
  return typeof value === "string" ? value.trim().toUpperCase() : "";
}

function formatTimestamp(value) {
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

function getTimestamp(alert) {
  return alert?.generatedAt ?? alert?.createdAt ?? null;
}

function getAlertIdentifier(alert) {
  return alert?.id ?? alert?._id ?? null;
}

/**
 * OrbitGuard AI — Alert Card
 *
 * A reusable presentation component for one alert record.
 *
 * @param {Object} props
 * @param {Object} props.alert Alert response object from the backend.
 * @param {boolean} [props.isSelected=false]
 * @param {Function} [props.onClick] Optional selection callback.
 * @param {boolean} [props.compact=false]
 * @param {boolean} [props.showObjectReferences=true]
 */
export default function AlertCard({
  alert,
  isSelected = false,
  onClick,
  compact = false,
  showObjectReferences = true,
}) {
  const shouldReduceMotion = useReducedMotion();

  if (!alert || typeof alert !== "object" || Array.isArray(alert)) {
    return null;
  }

  const severityKey = normalizeEnum(alert.severity);
  const statusKey = normalizeEnum(alert.status);

  const severity = SEVERITY_CONFIG[severityKey] ?? DEFAULT_SEVERITY;
  const status = STATUS_CONFIG[statusKey] ?? DEFAULT_STATUS;

  const SeverityIcon = severity.icon;
  const StatusIcon = status.icon;

  const alertId = getAlertIdentifier(alert);
  const alertCode = alert.alertCode || "Reference unavailable";
  const title = alert.title?.trim() || "Untitled alert";
  const message =
    alert.message?.trim() || "No additional message provided.";

  const timestamp = getTimestamp(alert);
  const formattedTimestamp = formatTimestamp(timestamp);

  const satelliteId = alert.satelliteId;
  const debrisId = alert.debrisId;

  const isInteractive = typeof onClick === "function";

  const cardClassName = [
    "group relative overflow-hidden rounded-xl border bg-[#07111f] transition-colors duration-200",
    "border-white/[0.08] hover:border-white/[0.14]",
    isSelected ? severity.selected : "",
    isInteractive
      ? "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60"
      : "",
  ]
    .filter(Boolean)
    .join(" ");

  const content = (
    <>
      {/* Severity rail */}
      <span
        aria-hidden="true"
        className={`absolute inset-y-0 left-0 w-[3px] ${severity.accent}`}
      />

      <div className={compact ? "p-3.5 pl-4" : "p-4 pl-5 sm:p-5 sm:pl-6"}>
        {/* Identity and severity */}
        <div className="flex items-start gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${severity.iconStyle}`}
          >
            <SeverityIcon
              aria-hidden="true"
              className="h-[19px] w-[19px]"
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="break-all font-mono text-[10px] font-medium tracking-wide text-slate-500 sm:text-[11px]">
                {alertCode}
              </span>

              <span
                className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-[10px] font-semibold uppercase tracking-wide ${severity.badge}`}
              >
                {severity.label}
              </span>
            </div>

            <h3 className="mt-2 break-words text-sm font-semibold leading-5 text-slate-100 sm:text-[15px]">
              {title}
            </h3>
          </div>

          {isInteractive && (
            <FiArrowUpRight
              aria-hidden="true"
              className={`h-4 w-4 shrink-0 transition-colors ${
                isSelected
                  ? "text-cyan-300"
                  : "text-slate-600 group-hover:text-slate-300"
              }`}
            />
          )}
        </div>

        {/* Alert description */}
        <p
          className={`break-words text-xs leading-5 text-slate-400 ${
            compact ? "mt-2 line-clamp-2" : "mt-3 line-clamp-3 sm:text-sm"
          }`}
        >
          {message}
        </p>

        {/* Linked orbital objects */}
        {showObjectReferences && (satelliteId || debrisId) && (
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 border-t border-white/[0.055] pt-3">
            {satelliteId && (
              <div className="min-w-0 max-w-full">
                <span className="block text-[9px] font-semibold uppercase tracking-[0.13em] text-slate-600">
                  Satellite ID
                </span>
                <span className="mt-1 block break-all font-mono text-[10px] text-slate-400 sm:text-[11px]">
                  {satelliteId}
                </span>
              </div>
            )}

            {debrisId && (
              <div className="min-w-0 max-w-full">
                <span className="block text-[9px] font-semibold uppercase tracking-[0.13em] text-slate-600">
                  Debris ID
                </span>
                <span className="mt-1 block break-all font-mono text-[10px] text-slate-400 sm:text-[11px]">
                  {debrisId}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Workflow state and generated time */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-2 border-t border-white/[0.055] pt-3">
          <span
            className={`inline-flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wide ${status.style}`}
          >
            <span
              aria-hidden="true"
              className={`h-1.5 w-1.5 rounded-full ${status.dot}`}
            />
            {status.label}
          </span>

          <time
            dateTime={
              timestamp && !Number.isNaN(new Date(timestamp).getTime())
                ? new Date(timestamp).toISOString()
                : undefined
            }
            className="text-[10px] text-slate-500 sm:text-[11px]"
          >
            {formattedTimestamp}
          </time>
        </div>
      </div>
    </>
  );

  if (!isInteractive) {
    return (
      <motion.article
        initial={shouldReduceMotion ? false : { opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
        className={cardClassName}
        data-alert-id={alertId ?? undefined}
      >
        {content}
      </motion.article>
    );
  }

  return (
    <motion.button
      type="button"
      initial={shouldReduceMotion ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
      onClick={() => onClick(alert)}
      aria-pressed={isSelected}
      aria-label={`View alert ${alertCode}: ${title}`}
      data-alert-id={alertId ?? undefined}
      className={`${cardClassName} block w-full text-left`}
    >
      {content}
    </motion.button>
  );
}
