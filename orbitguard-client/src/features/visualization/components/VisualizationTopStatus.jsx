import {
  FiActivity,
  FiCalendar,
  FiGlobe,
  FiRadio,
} from "react-icons/fi";

/**
 * ============================================================================
 * OrbitGuard AI — Visualization Top Status
 * ============================================================================
 *
 * RESPONSIBILITY
 * ----------------------------------------------------------------------------
 *
 * Compact operational telemetry bar displayed above the 3D visualization.
 *
 * Displays:
 *
 * - visualization connection/status
 * - data epoch
 * - propagation method
 * - reference frame
 *
 * This component is presentation-only.
 *
 * It does NOT:
 *
 * - fetch data
 * - calculate orbital propagation
 * - perform SGP4 calculations
 * - perform Orekit calculations
 * - manage timeline state
 * - manage Three.js state
 * - manage object selection
 *
 * ============================================================================
 * RESPONSIVE DESIGN
 * ============================================================================
 *
 * Desktop:
 *
 *   LIVE | DATA EPOCH | PROPAGATION | REFERENCE FRAME
 *
 * Mobile:
 *
 *   LIVE              DATA EPOCH
 *   PROPAGATION       REFERENCE FRAME
 *
 * ============================================================================
 */

/* ============================================================================
 * CONSTANTS
 * ========================================================================== */

const DEFAULT_PROPAGATION =
  "SGP4 / OREKIT";

const DEFAULT_REFERENCE_FRAME =
  "ITRF (EARTH FIXED)";

/**
 * UI-development fallback only.
 *
 * Production Visualization.jsx should provide the actual backend epoch.
 */
const PREVIEW_EPOCH =
  "2026-10-06T14:00:00Z";

/* ============================================================================
 * STATUS CONFIGURATION
 * ========================================================================== */

const STATUS_CONFIG = Object.freeze({
  preview: {
    label: "PREVIEW",
    sublabel: "UI VISUALIZATION",
    tone: "preview",
  },

  live: {
    label: "LIVE",
    sublabel: "REAL-TIME VISUALIZATION",
    tone: "live",
  },

  offline: {
    label: "OFFLINE",
    sublabel: "DATA UNAVAILABLE",
    tone: "offline",
  },
});

/* ============================================================================
 * HELPERS
 * ========================================================================== */

/**
 * Normalize visualization mode.
 */
const normalizeMode = (mode) => {
  const normalized =
    String(
      mode ?? "preview",
    )
      .trim()
      .toLowerCase();

  if (
    normalized === "live"
  ) {
    return "live";
  }

  if (
    normalized === "offline"
  ) {
    return "offline";
  }

  return "preview";
};

/**
 * Format an orbital epoch in UTC.
 *
 * Example:
 *
 * 2026-10-06T14:00:00Z
 *
 * becomes:
 *
 * 06 OCT 2026 14:00:00 UTC
 */
const formatDataEpoch = (value) => {
  if (!value) {
    return "—";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return String(value);
  }

  const day =
    String(
      date.getUTCDate(),
    ).padStart(
      2,
      "0",
    );

  const month =
    new Intl.DateTimeFormat(
      "en-GB",
      {
        month: "short",
        timeZone: "UTC",
      },
    )
      .format(date)
      .toUpperCase();

  const year =
    date.getUTCFullYear();

  const hours =
    String(
      date.getUTCHours(),
    ).padStart(
      2,
      "0",
    );

  const minutes =
    String(
      date.getUTCMinutes(),
    ).padStart(
      2,
      "0",
    );

  const seconds =
    String(
      date.getUTCSeconds(),
    ).padStart(
      2,
      "0",
    );

  return `${day} ${month} ${year} ${hours}:${minutes}:${seconds} UTC`;
};

/**
 * Return semantic status styling.
 */
const getStatusClasses = (tone) => {
  switch (tone) {
    case "live":
      return {
        dot:
          "bg-emerald-400",

        dotShadow:
          "shadow-[0_0_9px_rgba(52,211,153,0.85)]",

        label:
          "text-emerald-300",

        sublabel:
          "text-emerald-200/45",

        icon:
          "border-emerald-400/20 bg-emerald-400/[0.06]",

        iconColor:
          "text-emerald-300/80",
      };

    case "offline":
      return {
        dot:
          "bg-red-400",

        dotShadow:
          "shadow-[0_0_9px_rgba(248,113,113,0.7)]",

        label:
          "text-red-300",

        sublabel:
          "text-red-200/45",

        icon:
          "border-red-400/20 bg-red-400/[0.06]",

        iconColor:
          "text-red-300/80",
      };

    case "preview":
    default:
      return {
        dot:
          "bg-cyan-400",

        dotShadow:
          "shadow-[0_0_9px_rgba(34,211,238,0.72)]",

        label:
          "text-cyan-300",

        sublabel:
          "text-cyan-200/40",

        icon:
          "border-cyan-400/20 bg-cyan-400/[0.06]",

        iconColor:
          "text-cyan-300/80",
      };
  }
};

/**
 * Safely display a telemetry value.
 */
const normalizeTelemetryValue = (
  value,
) => {
  if (
    value === null ||
    value === undefined ||
    String(value).trim() === ""
  ) {
    return "—";
  }

  return String(value);
};

/* ============================================================================
 * TELEMETRY ITEM
 * ========================================================================== */

const TelemetryItem = ({
  icon: Icon,
  label,
  value,
  className = "",
  valueClassName = "",
}) => {
  return (
    <div
      className={`
        flex
        min-w-0
        items-center
        gap-2
        px-3
        py-2
        sm:gap-2.5
        sm:px-4
        ${className}
      `}
    >
      {/* ==================================================================
          ICON
          ================================================================== */}

      <div
        className="
          flex
          h-7
          w-7
          shrink-0
          items-center
          justify-center
          rounded-md
          border
          border-cyan-400/10
          bg-cyan-400/[0.025]
          text-cyan-400/75
        "
        aria-hidden="true"
      >
        <Icon
          className="
            h-3.5
            w-3.5
          "
          strokeWidth={1.5}
        />
      </div>

      {/* ==================================================================
          CONTENT
          ================================================================== */}

      <div
        className="
          min-w-0
          flex-1
        "
      >
        <div
          className="
            truncate
            font-['Orbitron']
            text-[7px]
            font-medium
            uppercase
            tracking-[0.14em]
            text-slate-500
            sm:text-[8px]
          "
        >
          {label}
        </div>

        <div
          className={`
            mt-0.5
            truncate
            font-['Orbitron']
            text-[8px]
            font-medium
            uppercase
            leading-tight
            tracking-[0.07em]
            text-slate-200
            sm:text-[9px]
            ${valueClassName}
          `}
          title={value}
        >
          {value}
        </div>
      </div>
    </div>
  );
};

/* ============================================================================
 * STATUS ITEM
 * ========================================================================== */

const StatusItem = ({
  status,
  statusClasses,
}) => {
  return (
    <div
      className="
        flex
        min-w-0
        items-center
        gap-2.5
        px-3
        py-2
        sm:px-4
      "
    >
      {/* ==================================================================
          STATUS ICON
          ================================================================== */}

      <div
        className={`
          flex
          h-7
          w-7
          shrink-0
          items-center
          justify-center
          rounded-md
          border
          ${statusClasses.icon}
        `}
      >
        <FiRadio
          className={`
            h-3.5
            w-3.5
            ${statusClasses.iconColor}
          `}
          strokeWidth={1.5}
          aria-hidden="true"
        />
      </div>

      {/* ==================================================================
          STATUS CONTENT
          ================================================================== */}

      <div
        className="
          min-w-0
          flex-1
        "
      >
        <div
          className="
            flex
            min-w-0
            items-center
            gap-1.5
          "
        >
          <span
            className={`
              h-1.5
              w-1.5
              shrink-0
              rounded-full
              ${statusClasses.dot}
              ${statusClasses.dotShadow}
            `}
            aria-hidden="true"
          />

          <span
            className={`
              truncate
              font-['Orbitron']
              text-[8px]
              font-semibold
              uppercase
              tracking-[0.14em]
              sm:text-[9px]
              ${statusClasses.label}
            `}
          >
            {status.label}
          </span>
        </div>

        <div
          className={`
            mt-0.5
            truncate
            font-['Orbitron']
            text-[6px]
            uppercase
            tracking-[0.1em]
            ${statusClasses.sublabel}
          `}
        >
          {status.sublabel}
        </div>
      </div>
    </div>
  );
};

/* ============================================================================
 * VISUALIZATION TOP STATUS
 * ========================================================================== */

const VisualizationTopStatus = ({
  mode = "preview",
  dataEpoch = PREVIEW_EPOCH,
  propagation =
    DEFAULT_PROPAGATION,
  referenceFrame =
    DEFAULT_REFERENCE_FRAME,
  className = "",
}) => {
  const normalizedMode =
    normalizeMode(mode);

  const status =
    STATUS_CONFIG[
      normalizedMode
    ];

  const statusClasses =
    getStatusClasses(
      status.tone,
    );

  const formattedEpoch =
    formatDataEpoch(
      dataEpoch,
    );

  const safePropagation =
    normalizeTelemetryValue(
      propagation,
    );

  const safeReferenceFrame =
    normalizeTelemetryValue(
      referenceFrame,
    );

  return (
    <section
      aria-label="Visualization telemetry"
      className={`
        pointer-events-auto
        w-full
        min-w-0
        ${className}
      `}
    >
      <div
        className="
          w-full
          min-w-0
          overflow-hidden
          rounded-xl
          border
          border-cyan-400/10
          bg-[#03101b]/88
          shadow-[0_8px_30px_rgba(0,0,0,0.3)]
          backdrop-blur-xl
        "
      >
        {/* ==================================================================
            DESKTOP / TABLET
            ================================================================== */}

        <div
          className="
            hidden
            min-h-[52px]
            min-w-0
            divide-x
            divide-cyan-400/[0.07]
            md:grid
            md:grid-cols-[1fr_1.35fr_1fr_1.15fr]
          "
        >
          {/* ================================================================
              STATUS
              ================================================================ */}

          <StatusItem
            status={status}
            statusClasses={
              statusClasses
            }
          />

          {/* ================================================================
              DATA EPOCH
              ================================================================ */}

          <TelemetryItem
            icon={FiCalendar}
            label="DATA EPOCH"
            value={
              formattedEpoch
            }
          />

          {/* ================================================================
              PROPAGATION
              ================================================================ */}

          <TelemetryItem
            icon={FiActivity}
            label="PROPAGATION"
            value={
              safePropagation
            }
          />

          {/* ================================================================
              REFERENCE FRAME
              ================================================================ */}

          <TelemetryItem
            icon={FiGlobe}
            label="REFERENCE FRAME"
            value={
              safeReferenceFrame
            }
          />
        </div>

        {/* ==================================================================
            MOBILE
            ================================================================== */}

        <div
          className="
            grid
            min-w-0
            grid-cols-2
            divide-x
            divide-y
            divide-cyan-400/[0.07]
            md:hidden
          "
        >
          {/* ================================================================
              STATUS
              ================================================================ */}

          <StatusItem
            status={status}
            statusClasses={
              statusClasses
            }
          />

          {/* ================================================================
              DATA EPOCH
              ================================================================ */}

          <TelemetryItem
            icon={FiCalendar}
            label="DATA EPOCH"
            value={
              formattedEpoch
            }
            valueClassName="
              text-[7px]
              tracking-[0.045em]
            "
          />

          {/* ================================================================
              PROPAGATION
              ================================================================ */}

          <TelemetryItem
            icon={FiActivity}
            label="PROPAGATION"
            value={
              safePropagation
            }
          />

          {/* ================================================================
              REFERENCE FRAME
              ================================================================ */}

          <TelemetryItem
            icon={FiGlobe}
            label="REFERENCE FRAME"
            value={
              safeReferenceFrame
            }
          />
        </div>
      </div>
    </section>
  );
};

export default VisualizationTopStatus;