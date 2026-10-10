import { FiAlertCircle, FiAlertTriangle, FiShield } from "react-icons/fi";

const SEVERITY_STYLES = {
  CRITICAL: {
    label: "Critical",
    icon: FiAlertTriangle,
    className:
      "border-rose-400/25 bg-rose-400/[0.09] text-rose-300",
    dotClassName: "bg-rose-400",
  },
  HIGH: {
    label: "High",
    icon: FiAlertTriangle,
    className:
      "border-orange-400/25 bg-orange-400/[0.08] text-orange-300",
    dotClassName: "bg-orange-400",
  },
  MEDIUM: {
    label: "Medium",
    icon: FiAlertCircle,
    className:
      "border-amber-400/25 bg-amber-400/[0.08] text-amber-300",
    dotClassName: "bg-amber-400",
  },
  LOW: {
    label: "Low",
    icon: FiShield,
    className:
      "border-sky-400/25 bg-sky-400/[0.08] text-sky-300",
    dotClassName: "bg-sky-400",
  },
};

const DEFAULT_STYLE = {
  label: "Unspecified",
  icon: FiAlertCircle,
  className: "border-slate-400/15 bg-slate-400/[0.06] text-slate-400",
  dotClassName: "bg-slate-500",
};

/**
 * OrbitGuard AI — Alert Severity Badge
 *
 * Displays a consistent visual indicator for alert severity.
 *
 * @param {Object} props
 * @param {string} props.severity Severity enum from the backend.
 * @param {"dot"|"icon"|"none"} [props.indicator="dot"]
 * @param {"sm"|"md"} [props.size="sm"]
 * @param {boolean} [props.showLabel=true]
 * @param {string} [props.className=""] Additional Tailwind classes.
 */
export default function AlertSeverityBadge({
  severity,
  indicator = "dot",
  size = "sm",
  showLabel = true,
  className = "",
}) {
  const normalizedSeverity =
    typeof severity === "string"
      ? severity.trim().toUpperCase()
      : "";

  const config =
    SEVERITY_STYLES[normalizedSeverity] ?? DEFAULT_STYLE;

  const SeverityIcon = config.icon;

  const sizeClassName =
    size === "md"
      ? "min-h-7 gap-2 px-2.5 py-1 text-xs"
      : "min-h-5 gap-1.5 px-2 py-0.5 text-[10px]";

  const iconSize = size === "md" ? "h-3.5 w-3.5" : "h-3 w-3";

  return (
    <span
      className={[
        "inline-flex max-w-full items-center justify-center rounded-md border font-semibold uppercase tracking-[0.08em]",
        sizeClassName,
        config.className,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      title={`Severity: ${config.label}`}
    >
      {indicator === "icon" && (
        <SeverityIcon
          aria-hidden="true"
          className={`${iconSize} shrink-0`}
        />
      )}

      {indicator === "dot" && (
        <span
          aria-hidden="true"
          className={`h-1.5 w-1.5 shrink-0 rounded-full ${config.dotClassName}`}
        />
      )}

      {showLabel && (
        <span className="truncate">{config.label}</span>
      )}

      {!showLabel && (
        <span className="sr-only">{config.label}</span>
      )}
    </span>
  );
}
