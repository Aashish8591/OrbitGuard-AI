import {
  FiClock,
  FiRefreshCw,
  FiCheckCircle,
  FiAlertCircle,
  FiHelpCircle,
} from "react-icons/fi";

/* ================================================================
   REPORT STATUS CONFIGURATION
   Values must match the backend ReportStatus enum.
================================================================ */

const STATUS_CONFIG = {
  PENDING: {
    label: "Pending",
    Icon: FiClock,
    indicator: "bg-amber-300",
    styles:
      "border-amber-400/25 bg-amber-400/[0.08] text-amber-200",
    iconStyles: "text-amber-300",
  },

  PROCESSING: {
    label: "Processing",
    Icon: FiRefreshCw,
    indicator: "bg-sky-300",
    styles:
      "border-sky-400/25 bg-sky-400/[0.08] text-sky-200",
    iconStyles: "text-sky-300",
  },

  COMPLETED: {
    label: "Completed",
    Icon: FiCheckCircle,
    indicator: "bg-emerald-300",
    styles:
      "border-emerald-400/25 bg-emerald-400/[0.08] text-emerald-200",
    iconStyles: "text-emerald-300",
  },

  FAILED: {
    label: "Failed",
    Icon: FiAlertCircle,
    indicator: "bg-red-300",
    styles:
      "border-red-400/25 bg-red-400/[0.08] text-red-200",
    iconStyles: "text-red-300",
  },
};

/* ================================================================
   HELPERS
================================================================ */

function normalizeStatus(status) {
  return String(status ?? "").trim().toUpperCase();
}

function formatUnknownStatus(status) {
  const normalized = normalizeStatus(status);

  if (!normalized) {
    return "Unknown";
  }

  return normalized
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

/* ================================================================
   REPORT STATUS BADGE
================================================================ */

/**
 * Displays a report's backend status.
 *
 * @param {Object} props
 * @param {string} props.status
 * @param {"compact"|"default"} [props.size="default"]
 * @param {boolean} [props.showIcon=false]
 * @param {boolean} [props.showIndicator=true]
 * @param {boolean} [props.animated=true]
 * @param {string} [props.className=""]
 */
function ReportStatusBadge({
  status,
  size = "default",
  showIcon = false,
  showIndicator = true,
  animated = true,
  className = "",
}) {
  const normalizedStatus = normalizeStatus(status);
  const config = STATUS_CONFIG[normalizedStatus];

  const compact = size === "compact";

  const sizeStyles = compact
    ? "gap-1 px-2 py-0.5 text-[10px]"
    : "gap-1.5 px-2.5 py-1 text-[11px]";

  const baseStyles = [
    "inline-flex max-w-full min-w-0 items-center justify-center",
    "whitespace-nowrap rounded-full border",
    "font-semibold tracking-wide transition-colors duration-200",
    sizeStyles,
  ].join(" ");

  const customClassName =
    typeof className === "string" ? className.trim() : "";

  const iconSize = compact ? "h-3 w-3" : "h-3.5 w-3.5";

  const shouldAnimate =
    animated &&
    normalizedStatus === "PROCESSING";

  if (!config) {
    const fallbackLabel = formatUnknownStatus(status);

    return (
      <span
        role="status"
        aria-label={`Report status: ${fallbackLabel}`}
        title={`Report status: ${fallbackLabel}`}
        className={[
          baseStyles,
          "border-white/10 bg-white/[0.04] text-slate-400",
          customClassName,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <FiHelpCircle
          aria-hidden="true"
          className={`shrink-0 ${iconSize}`}
        />

        <span className="truncate">{fallbackLabel}</span>
      </span>
    );
  }

  const { label, Icon, indicator, styles, iconStyles } = config;

  return (
    <span
      role="status"
      aria-label={`Report status: ${label}`}
      title={`Report status: ${label}`}
      className={[
        baseStyles,
        styles,
        customClassName,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {showIndicator && (
        <span
          aria-hidden="true"
          className={[
            "shrink-0 rounded-full",
            compact ? "h-1 w-1" : "h-1.5 w-1.5",
            indicator,
            shouldAnimate ? "animate-pulse" : "",
            "motion-reduce:animate-none",
          ]
            .filter(Boolean)
            .join(" ")}
        />
      )}

      {showIcon && (
        <Icon
          aria-hidden="true"
          className={[
            "shrink-0",
            iconSize,
            iconStyles,
            shouldAnimate ? "animate-spin" : "",
            "motion-reduce:animate-none",
          ]
            .filter(Boolean)
            .join(" ")}
        />
      )}

      <span className="truncate">{label}</span>
    </span>
  );
}

export default ReportStatusBadge;
