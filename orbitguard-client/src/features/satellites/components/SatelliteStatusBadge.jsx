import PropTypes from "prop-types";
import {
  FaCheck,
  FaPause,
  FaTriangleExclamation,
} from "react-icons/fa6";

/**
 * ================================================================
 * OrbitGuard AI - Satellite Status Badge
 * ================================================================
 *
 * Presentation-only component for rendering the satellite
 * missionStatus received from the backend.
 *
 * Backend source of truth:
 *     satellite.missionStatus
 *
 * Supported backend values:
 *     ACTIVE
 *     INACTIVE
 *     DECOMMISSIONED
 *
 * Responsibilities:
 * - Normalize the backend status value for presentation
 * - Render the appropriate visual state
 * - Keep status styling consistent across the Satellite module
 *
 * This component intentionally does NOT:
 * - Call APIs
 * - Fetch satellite data
 * - Modify satellite state
 * - Calculate mission status
 * - Apply business rules
 * - Decide whether a satellite is active/inactive
 *
 * The backend remains the source of truth.
 * ================================================================
 */

const STATUS_CONFIG = {
  ACTIVE: {
    label: "ACTIVE",
    icon: FaCheck,
    className:
      "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
    dotClassName:
      "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]",
  },

  INACTIVE: {
    label: "INACTIVE",
    icon: FaPause,
    className:
      "border-amber-500/20 bg-amber-500/10 text-amber-400",
    dotClassName:
      "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]",
  },

  DECOMMISSIONED: {
    label: "DECOMMISSIONED",
    icon: FaTriangleExclamation,
    className:
      "border-red-500/20 bg-red-500/10 text-red-400",
    dotClassName:
      "bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.8)]",
  },
};

/**
 * Fallback configuration.
 *
 * Important:
 * Unknown backend values should NOT be presented as INACTIVE,
 * because that could incorrectly represent the satellite's
 * actual mission status.
 */
const UNKNOWN_STATUS_CONFIG = {
  label: "UNKNOWN",
  icon: FaTriangleExclamation,
  className:
    "border-slate-500/20 bg-slate-500/10 text-slate-400",
  dotClassName:
    "bg-slate-400 shadow-[0_0_8px_rgba(148,163,184,0.6)]",
};

const SIZE_CONFIG = {
  sm: {
    wrapper: "px-2.5 py-1 text-[9px]",
    dot: "h-1.5 w-1.5",
    icon: "text-[8px]",
  },

  md: {
    wrapper: "px-3 py-1.5 text-[10px]",
    dot: "h-2 w-2",
    icon: "text-[9px]",
  },
};

/**
 * Normalize backend missionStatus.
 *
 * Handles values such as:
 *     "ACTIVE"
 *     " active "
 *     "active"
 *
 * without changing the actual backend data.
 */
const normalizeStatus = (status) => {
  if (typeof status !== "string") {
    return "";
  }

  return status.trim().toUpperCase();
};

/**
 * SatelliteStatusBadge
 *
 * @param {Object} props
 * @param {string} props.status
 * @param {"sm"|"md"} [props.size="sm"]
 * @param {boolean} [props.showIcon=false]
 */
const SatelliteStatusBadge = ({
  status,
  size = "sm",
  showIcon = false,
}) => {
  const normalizedStatus = normalizeStatus(status);

  const config =
    STATUS_CONFIG[normalizedStatus] ??
    UNKNOWN_STATUS_CONFIG;

  const selectedSize =
    SIZE_CONFIG[size] ?? SIZE_CONFIG.sm;

  const Icon = config.icon;

  return (
    <span
      className={`
        inline-flex
        w-fit
        items-center
        gap-1.5
        rounded-full
        border
        font-['Orbitron']
        font-medium
        tracking-[0.08em]
        whitespace-nowrap
        ${selectedSize.wrapper}
        ${config.className}
      `}
      title={`Mission status: ${config.label}`}
      aria-label={`Mission status: ${config.label}`}
    >
      {/* ==========================================================
          STATUS INDICATOR
      =========================================================== */}

      <span
        className={`
          shrink-0
          rounded-full
          ${selectedSize.dot}
          ${config.dotClassName}
        `}
        aria-hidden="true"
      />

      {/* ==========================================================
          OPTIONAL STATUS ICON
      =========================================================== */}

      {showIcon && (
        <Icon
          className={`
            shrink-0
            ${selectedSize.icon}
          `}
          aria-hidden="true"
        />
      )}

      {/* ==========================================================
          STATUS LABEL
      =========================================================== */}

      <span>{config.label}</span>
    </span>
  );
};

SatelliteStatusBadge.propTypes = {
  /**
   * Directly corresponds to the backend satellite missionStatus.
   *
   * Expected:
   * ACTIVE
   * INACTIVE
   * DECOMMISSIONED
   */
  status: PropTypes.string,

  /**
   * Visual size only.
   */
  size: PropTypes.oneOf(["sm", "md"]),

  /**
   * Whether the status icon should be displayed.
   */
  showIcon: PropTypes.bool,
};

SatelliteStatusBadge.defaultProps = {
  status: "",
  size: "sm",
  showIcon: false,
};

export default SatelliteStatusBadge;