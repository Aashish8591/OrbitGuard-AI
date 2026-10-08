import { useCallback, useEffect, useMemo, useState } from "react";

import {
  FiActivity,
  FiAlertTriangle,
  FiArrowUpRight,
  FiCheckCircle,
  FiCircle,
  FiCompass,
  FiCrosshair,
  FiGlobe,
  FiHash,
  FiInfo,
  FiLayers,
  FiMapPin,
  FiNavigation,
  FiRadio,
  FiRotateCw,
  FiTarget,
  FiX,
} from "react-icons/fi";

/**
 * ============================================================================
 * OrbitGuard AI — Object Inspector
 * ============================================================================
 *
 * RESPONSIBILITY
 * ----------------------------------------------------------------------------
 *
 * Presentation and user-action boundary for the currently selected orbital
 * object.
 *
 * DESKTOP
 * ----------------------------------------------------------------------------
 *
 * Full telemetry inspector:
 *
 *   OBJECT INSPECTOR
 *   ├── Object Header
 *   ├── Overview
 *   ├── Orbit
 *   ├── Position
 *   ├── Details
 *   └── Focus Object
 *
 * MOBILE
 * ----------------------------------------------------------------------------
 *
 * Compact bottom-sheet presentation.
 *
 * IMPORTANT
 * ----------------------------------------------------------------------------
 *
 * This component does NOT:
 *
 * - call APIs
 * - calculate orbital propagation
 * - calculate risk
 * - calculate coordinates
 * - control Three.js
 * - generate orbital trajectories
 *
 * Parent page remains responsible for application state and visualization
 * actions.
 *
 * ============================================================================
 */

const TABS = Object.freeze([
  {
    id: "overview",
    label: "OVERVIEW",
  },
  {
    id: "orbit",
    label: "ORBIT",
  },
  {
    id: "position",
    label: "POSITION",
  },
  {
    id: "details",
    label: "DETAILS",
  },
]);

const DEFAULT_TAB = "overview";

/* ============================================================================
 * LOCAL OBJECT IMAGES
 * ========================================================================== */

/**
 * Local presentation assets.
 *
 * These files are served from the Vite public directory:
 *
 * public/images/satellite/satellite-01.png
 * public/images/debris/debris-01.png
 *
 * The mapping is intentionally deterministic.
 *
 * We do NOT use Math.random() here because the inspector can re-render
 * whenever selectedObject, tabs, or parent state changes. Random selection
 * would make the displayed image appear to change unexpectedly.
 */
const OBJECT_IMAGES = Object.freeze({
  SATELLITE: "/images/satellite/satellite-01.png",
  DEBRIS: "/images/debris/debris-01.png",
});

/**
 * Resolve the local presentation image from the actual backend object type.
 *
 * Returns null for unsupported object types so the existing icon fallback
 * remains available without changing the rest of the inspector behavior.
 */
const getObjectImage = (object) => {
  const type = String(object?.objectType ?? "")
    .trim()
    .toUpperCase();

  return OBJECT_IMAGES[type] ?? null;
};

/* ============================================================================
 * FORMAT HELPERS
 * ========================================================================== */

const displayValue = (value, fallback = "—") => {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  return value;
};

const formatNumber = (value, decimals = 2) => {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "—";
  }

  return number.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

const formatCoordinate = (value) => formatNumber(value, 2);

const formatAltitude = (value) => formatNumber(value, 2);

const formatAngle = (value) => formatNumber(value, 2);

/* ============================================================================
 * TIMESTAMP NORMALIZATION
 * ========================================================================== */

const normalizeTimestampForUtc = (value) => {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const stringValue = String(value).trim();

  if (!stringValue) {
    return null;
  }

  if (stringValue.endsWith("Z") || stringValue.endsWith("z")) {
    return stringValue;
  }

  if (/[+-]\d{2}:\d{2}$/.test(stringValue)) {
    return stringValue;
  }

  if (
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?$/.test(
      stringValue,
    )
  ) {
    return `${stringValue}Z`;
  }

  return stringValue;
};

const formatTimestamp = (value) => {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  const normalized = normalizeTimestampForUtc(value);

  const date = new Date(normalized);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date
    .toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
      timeZone: "UTC",
    })
    .replace(",", "");
};

/* ============================================================================
 * NORMALIZATION HELPERS
 * ========================================================================== */

const normalizeObjectType = (value) =>
  String(value ?? "")
    .trim()
    .toUpperCase();

const normalizeStatus = (value) =>
  String(value ?? "")
    .trim()
    .toUpperCase();

const normalizeRisk = (value) =>
  String(value ?? "")
    .trim()
    .toUpperCase();

/**
 * Backend JSON has historically exposed Cartesian coordinates as:
 *
 * xkm / ykm / zkm
 *
 * visualizationService.js normalizes these to:
 *
 * xKm / yKm / zKm
 *
 * The inspector remains defensive.
 */

const getXKm = (object) => object?.xKm ?? object?.xkm ?? null;

const getYKm = (object) => object?.yKm ?? object?.ykm ?? null;

const getZKm = (object) => object?.zKm ?? object?.zkm ?? null;

const getRiskValue = (object) =>
  object?.riskLevel ?? object?.risk ?? object?.collisionRisk ?? null;

/* ============================================================================
 * OBJECT HELPERS
 * ========================================================================== */

const getObjectTypeLabel = (object) => {
  const type = normalizeObjectType(object?.objectType);

  if (type === "SATELLITE") {
    return "SATELLITE";
  }

  if (type === "DEBRIS") {
    return "DEBRIS";
  }

  return type || "OBJECT";
};

const getObjectTheme = (object) => {
  const type = normalizeObjectType(object?.objectType);

  const risk = normalizeRisk(getRiskValue(object));

  if (risk === "HIGH") {
    return {
      accent: "red",
      dot: "bg-red-400",
      text: "text-red-300",
      border: "border-red-400/20",
      background: "bg-red-400/[0.04]",
    };
  }

  if (type === "DEBRIS") {
    return {
      accent: "amber",
      dot: "bg-amber-400",
      text: "text-amber-300",
      border: "border-amber-400/20",
      background: "bg-amber-400/[0.04]",
    };
  }

  return {
    accent: "cyan",
    dot: "bg-cyan-400",
    text: "text-cyan-300",
    border: "border-cyan-400/20",
    background: "bg-cyan-400/[0.04]",
  };
};

/* ============================================================================
 * SMALL DESKTOP UI COMPONENTS
 * ========================================================================== */

const DataRow = ({ icon: Icon, label, value, valueClassName = "" }) => (
  <div
    className="
      flex
      min-h-[30px]
      items-center
      gap-2.5
      border-b
      border-cyan-400/[0.045]
      py-1.5
      last:border-b-0
    "
  >
    <span
      className="
        flex
        w-4
        shrink-0
        items-center
        justify-center
        text-slate-600
      "
    >
      {Icon ? (
        <Icon className="h-3 w-3" strokeWidth={1.4} aria-hidden="true" />
      ) : (
        <FiCircle className="h-1.5 w-1.5" aria-hidden="true" />
      )}
    </span>

    <span
      className="
        min-w-0
        flex-1
        font-['Inter']
        text-[9px]
        text-slate-500
        sm:text-[10px]
      "
    >
      {label}
    </span>

    <span
      className={`
        max-w-[58%]
        truncate
        text-right
        font-['Inter']
        text-[9px]
        font-medium
        text-slate-300
        sm:text-[10px]
        ${valueClassName}
      `}
      title={String(displayValue(value))}
    >
      {displayValue(value)}
    </span>
  </div>
);

const SectionHeader = ({ icon: Icon, title, trailing }) => (
  <div
    className="
      flex
      items-center
      justify-between
      gap-3
      border-b
      border-cyan-400/[0.07]
      px-3
      py-2.5
    "
  >
    <div
      className="
        flex
        min-w-0
        items-center
        gap-2
      "
    >
      {Icon && (
        <Icon
          className="
            h-3
            w-3
            shrink-0
            text-cyan-400
          "
          strokeWidth={1.5}
          aria-hidden="true"
        />
      )}

      <h3
        className="
          truncate
          font-['Orbitron']
          text-[7px]
          font-medium
          uppercase
          tracking-[0.11em]
          text-slate-500
          sm:text-[8px]
        "
      >
        {title}
      </h3>
    </div>

    {trailing && (
      <span
        className="
          shrink-0
          font-['Orbitron']
          text-[6px]
          uppercase
          tracking-[0.08em]
          text-slate-600
          sm:text-[7px]
        "
      >
        {trailing}
      </span>
    )}
  </div>
);

const MetricBox = ({ label, value, unit, accent = "cyan" }) => {
  const accentClasses =
    accent === "amber"
      ? {
          border: "border-amber-400/10",
          value: "text-amber-300",
        }
      : accent === "red"
        ? {
            border: "border-red-400/10",
            value: "text-red-300",
          }
        : {
            border: "border-cyan-400/10",
            value: "text-cyan-300",
          };

  return (
    <div
      className={`
        min-w-0
        rounded-lg
        border
        bg-black/10
        px-2.5
        py-2
        ${accentClasses.border}
      `}
    >
      <div
        className="
          font-['Orbitron']
          text-[6px]
          uppercase
          tracking-[0.09em]
          text-slate-600
          sm:text-[7px]
        "
      >
        {label}
      </div>

      <div
        className={`
          mt-1
          truncate
          font-['Orbitron']
          text-[11px]
          font-medium
          ${accentClasses.value}
          sm:text-xs
        `}
      >
        {displayValue(value)}
      </div>

      {unit && (
        <div
          className="
            mt-0.5
            font-['Inter']
            text-[7px]
            text-slate-600
          "
        >
          {unit}
        </div>
      )}
    </div>
  );
};

/* ============================================================================
 * EMPTY INSPECTOR
 * ========================================================================== */

const EmptyInspector = () => (
  <div
    className="
      flex
      min-h-[250px]
      flex-1
      flex-col
      items-center
      justify-center
      px-6
      py-12
      text-center
    "
  >
    <div
      className="
        flex
        h-11
        w-11
        items-center
        justify-center
        rounded-full
        border
        border-cyan-400/10
        bg-cyan-400/[0.025]
        text-cyan-400/50
      "
    >
      <FiTarget className="h-5 w-5" strokeWidth={1.25} />
    </div>

    <p
      className="
        mt-4
        font-['Orbitron']
        text-[8px]
        uppercase
        tracking-[0.12em]
        text-slate-500
      "
    >
      NO OBJECT SELECTED
    </p>

    <p
      className="
        mt-2
        max-w-[230px]
        font-['Inter']
        text-[10px]
        leading-relaxed
        text-slate-600
      "
    >
      Select a satellite or debris object from the orbital scene to inspect
      its telemetry.
    </p>
  </div>
);

/* ============================================================================
 * DESKTOP OBJECT HEADER
 * ========================================================================== */

const ObjectHeader = ({ object, theme }) => {
  const type = getObjectTypeLabel(object);

  const status = normalizeStatus(object?.missionStatus);

  const statusLabel = status || "TRACKED";

  /**
   * Local deterministic image based on object type.
   *
   * Backend-provided imageUrl/image is still respected if it exists.
   * Otherwise the correct local satellite/debris image is used.
   */
  const imageUrl =
    object?.imageUrl ??
    object?.image ??
    getObjectImage(object);

  return (
    <div
      className="
        flex
        gap-3
        border-b
        border-cyan-400/[0.08]
        p-3
      "
    >
      <div
        className={`
          relative
          flex
          h-[72px]
          w-[72px]
          shrink-0
          items-center
          justify-center
          overflow-hidden
          rounded-lg
          border
          bg-black/20
          ${theme.border}
        `}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={`${type} object`}
            className="
              h-full
              w-full
              object-cover
            "
            draggable="false"
          />
        ) : (
          <>
            <div
              className={`
                absolute
                inset-0
                opacity-20
                ${theme.background}
              `}
            />

            {type === "DEBRIS" ? (
              <FiAlertTriangle
                className="
                  h-7
                  w-7
                  text-amber-400/70
                "
                strokeWidth={1.25}
              />
            ) : (
              <FiRadio
                className="
                  h-7
                  w-7
                  text-cyan-400/70
                "
                strokeWidth={1.25}
              />
            )}
          </>
        )}

        <span
          className="
            absolute
            bottom-1.5
            left-1.5
            h-1.5
            w-1.5
            rounded-full
            bg-emerald-400
            shadow-[0_0_7px_rgba(52,211,153,0.8)]
          "
          aria-hidden="true"
        />
      </div>

      <div className="min-w-0 flex-1">
        <div
          className="
            flex
            items-start
            justify-between
            gap-2
          "
        >
          <h3
            className="
              min-w-0
              truncate
              font-['Orbitron']
              text-[10px]
              font-semibold
              uppercase
              tracking-[0.04em]
              text-slate-100
              sm:text-[11px]
            "
            title={String(displayValue(object?.name))}
          >
            {displayValue(object?.name, "UNKNOWN OBJECT")}
          </h3>
        </div>

        <div
          className="
            mt-2
            flex
            items-center
            gap-1.5
          "
        >
          <span
            className={`
              h-1.5
              w-1.5
              rounded-full
              ${theme.dot}
            `}
          />

          <span
            className="
              font-['Orbitron']
              text-[7px]
              font-medium
              uppercase
              tracking-[0.08em]
              text-emerald-300
            "
          >
            {statusLabel}
          </span>
        </div>

        <div
          className="
            mt-2
            grid
            grid-cols-2
            gap-x-3
            gap-y-1
          "
        >
          <span
            className="
              truncate
              font-['Inter']
              text-[7px]
              uppercase
              text-slate-600
            "
          >
            NORAD ID
          </span>

          <span
            className="
              truncate
              font-['Inter']
              text-[7px]
              font-medium
              text-slate-400
            "
          >
            {displayValue(object?.noradId)}
          </span>

          <span
            className="
              truncate
              font-['Inter']
              text-[7px]
              uppercase
              text-slate-600
            "
          >
            OBJECT TYPE
          </span>

          <span
            className="
              truncate
              font-['Inter']
              text-[7px]
              font-medium
              text-slate-400
            "
          >
            {type}
          </span>
        </div>
      </div>
    </div>
  );
};

/* ============================================================================
 * MOBILE METRIC HELPERS
 * ========================================================================== */

const hasValue = (value) =>
  value !== null &&
  value !== undefined &&
  value !== "" &&
  Number.isFinite(Number(value));

const getVelocity = (object) =>
  object?.velocityKmPerSec ??
  object?.velocityKms ??
  object?.velocity ??
  object?.speedKmPerSec ??
  object?.speed ??
  null;

const getInclination = (object) =>
  object?.inclination ?? object?.inclinationDeg ?? null;

/* ============================================================================
 * MOBILE METRIC
 * ========================================================================== */

const MobileMetric = ({
  icon: Icon,
  label,
  value,
  unit,
  accent = "cyan",
}) => {
  const accentClass =
    accent === "red"
      ? "text-red-300"
      : accent === "amber"
        ? "text-amber-300"
        : "text-cyan-300";

  return (
    <div
      className="
        min-w-0
        rounded-xl
        border
        border-white/[0.07]
        bg-white/[0.025]
        px-2.5
        py-2.5
      "
    >
      <div
        className="
          flex
          items-center
          gap-1.5
          text-slate-600
        "
      >
        {Icon && <Icon className="h-3 w-3" strokeWidth={1.4} />}

        <span
          className="
            truncate
            font-['Inter']
            text-[8px]
            uppercase
            tracking-[0.04em]
          "
        >
          {label}
        </span>
      </div>

      <div
        className={`
          mt-1.5
          truncate
          font-['Orbitron']
          text-[11px]
          font-medium
          ${accentClass}
        `}
      >
        {displayValue(value)}
      </div>

      {unit && (
        <div
          className="
            mt-0.5
            font-['Inter']
            text-[7px]
            text-slate-600
          "
        >
          {unit}
        </div>
      )}
    </div>
  );
};

/* ============================================================================
 * MOBILE DATA ROW
 * ========================================================================== */

const MobileDataRow = ({ label, value, valueClassName = "" }) => (
  <div
    className="
      flex
      min-h-[31px]
      items-center
      justify-between
      gap-4
      border-b
      border-white/[0.055]
      px-1
      last:border-b-0
    "
  >
    <span
      className="
        font-['Inter']
        text-[9px]
        text-slate-500
      "
    >
      {label}
    </span>

    <span
      className={`
        max-w-[62%]
        truncate
        text-right
        font-['Inter']
        text-[9px]
        font-medium
        text-slate-300
        ${valueClassName}
      `}
      title={String(displayValue(value))}
    >
      {displayValue(value)}
    </span>
  </div>
);

/* ============================================================================
 * MOBILE OBJECT HEADER
 * ========================================================================== */

const MobileObjectHeader = ({ object, theme, onClose }) => {
  const type = getObjectTypeLabel(object);

  const risk = normalizeRisk(getRiskValue(object));

  const isHighRisk = risk === "HIGH";

  /**
   * Same deterministic image mapping used by desktop inspector.
   */
  const imageUrl =
    object?.imageUrl ??
    object?.image ??
    getObjectImage(object);

  return (
    <div
      className="
        flex
        items-center
        gap-3
      "
    >
      <div
        className={`
          relative
          flex
          h-11
          w-11
          shrink-0
          items-center
          justify-center
          overflow-hidden
          rounded-xl
          border
          bg-black/20
          ${theme.border}
        `}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={`${type} object`}
            className="
              h-full
              w-full
              object-cover
            "
            draggable="false"
          />
        ) : type === "DEBRIS" ? (
          <FiAlertTriangle
            className="
              h-5
              w-5
              text-amber-400/80
            "
            strokeWidth={1.3}
          />
        ) : (
          <FiRadio
            className="
              h-5
              w-5
              text-cyan-400/80
            "
            strokeWidth={1.3}
          />
        )}

        <span
          className={`
            absolute
            bottom-1
            left-1
            h-1.5
            w-1.5
            rounded-full
            ${theme.dot}
          `}
        />
      </div>

      <div className="min-w-0 flex-1">
        <div
          className="
            flex
            min-w-0
            items-center
            gap-2
          "
        >
          <h2
            className="
              min-w-0
              truncate
              font-['Orbitron']
              text-[10px]
              font-semibold
              uppercase
              tracking-[0.025em]
              text-slate-100
            "
            title={String(displayValue(object?.name))}
          >
            {displayValue(object?.name, "UNKNOWN OBJECT")}
          </h2>

          <span
            className={`
              shrink-0
              rounded-md
              border
              px-1.5
              py-0.5
              font-['Orbitron']
              text-[6px]
              font-medium
              uppercase
              tracking-[0.05em]
              ${
                isHighRisk
                  ? "border-red-400/20 bg-red-400/10 text-red-300"
                  : type === "DEBRIS"
                    ? "border-amber-400/20 bg-amber-400/10 text-amber-300"
                    : "border-cyan-400/20 bg-cyan-400/10 text-cyan-300"
              }
            `}
          >
            {type}
          </span>
        </div>

        <div
          className="
            mt-1
            flex
            items-center
            gap-1.5
          "
        >
          <span
            className="
              h-1.5
              w-1.5
              rounded-full
              bg-emerald-400
            "
          />

          <span
            className="
              font-['Inter']
              text-[8px]
              text-slate-500
            "
          >
            NORAD ID:
          </span>

          <span
            className="
              font-['Orbitron']
              text-[7px]
              text-slate-400
            "
          >
            {displayValue(object?.noradId)}
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onClose?.();
        }}
        aria-label="Close object inspector"
        className="
          flex
          h-9
          w-9
          shrink-0
          items-center
          justify-center
          rounded-full
          border
          border-white/[0.07]
          bg-white/[0.025]
          text-slate-500
          active:scale-95
          focus-visible:outline-none
          focus-visible:ring-1
          focus-visible:ring-cyan-400/60
        "
      >
        <FiX className="h-4 w-4" strokeWidth={1.5} />
      </button>
    </div>
  );
};

/* ============================================================================
 * MOBILE INSPECTOR
 * ========================================================================== */

const MobileObjectInspector = ({
  selectedObject,
  theme,
  onClose,
  onFocusObject,
  canFocusObject,
}) => {
  const velocity = getVelocity(selectedObject);

  const inclination = getInclination(selectedObject);

  const altitude = selectedObject?.altitudeKm;

  const hasVelocity = hasValue(velocity);

  const hasInclination = hasValue(inclination);

  const metricCount =
    1 + (hasVelocity ? 1 : 0) + (hasInclination ? 1 : 0);

  const metricGridClass =
    metricCount === 1
      ? "grid-cols-1"
      : metricCount === 2
        ? "grid-cols-2"
        : "grid-cols-3";

  const xKm = getXKm(selectedObject);

  const yKm = getYKm(selectedObject);

  const zKm = getZKm(selectedObject);

  const risk = normalizeRisk(getRiskValue(selectedObject));

  return (
    <>
      <aside
        aria-label="Mobile object inspector"
        className="
          pointer-events-auto
          absolute
          left-0
          right-0
          bottom-0
          z-50
          flex
          max-h-[45dvh]
          min-h-0
          flex-col
          overflow-hidden
          rounded-t-[22px]
          rounded-b-none
          border
          border-cyan-400/15
          border-b-0
          bg-[#06111c]/[0.985]
          text-slate-100
          shadow-[0_-12px_40px_rgba(0,0,0,0.45)]
          backdrop-blur-xl
          lg:hidden
        "
      >
        <div
          className="
            flex
            shrink-0
            justify-center
            px-4
            pt-2.5
            pb-1.5
          "
        >
          <span
            className="
              h-1
              w-10
              rounded-full
              bg-slate-600/70
            "
          />
        </div>

        <div
          className="
            shrink-0
            px-4
            pb-3
            pt-1
          "
        >
          <MobileObjectHeader
            object={selectedObject}
            theme={theme}
            onClose={onClose}
          />
        </div>

        <div
          className="
            min-h-0
            flex-1
            overflow-y-auto
            overscroll-contain
            px-4
            pb-3
            scrollbar-thin
            scrollbar-track-transparent
            scrollbar-thumb-cyan-400/10
          "
        >
          <div
            className={`
              grid
              ${metricGridClass}
              gap-2
            `}
          >
            <MobileMetric
              icon={FiArrowUpRight}
              label="Altitude"
              value={hasValue(altitude) ? formatAltitude(altitude) : null}
              unit="km"
            />

            {hasVelocity && (
              <MobileMetric
                icon={FiActivity}
                label="Velocity"
                value={formatNumber(velocity, 2)}
                unit="km/s"
              />
            )}

            {hasInclination && (
              <MobileMetric
                icon={FiCompass}
                label="Inclination"
                value={formatAngle(inclination)}
                unit="degrees"
              />
            )}
          </div>

          <div
            className="
              mt-3
              overflow-hidden
              rounded-xl
              border
              border-white/[0.06]
              bg-black/10
              px-3
            "
          >
            <MobileDataRow
              label="Latitude"
              value={
                hasValue(selectedObject?.latitude)
                  ? `${formatAngle(selectedObject.latitude)}°`
                  : null
              }
            />

            <MobileDataRow
              label="Longitude"
              value={
                hasValue(selectedObject?.longitude)
                  ? `${formatAngle(selectedObject.longitude)}°`
                  : null
              }
            />

            <MobileDataRow
              label="Object Type"
              value={getObjectTypeLabel(selectedObject)}
            />

            <MobileDataRow
              label="Frame"
              value={selectedObject?.frame ?? "ITRF"}
            />

            <MobileDataRow
              label="Last Updated"
              value={formatTimestamp(selectedObject?.timestamp)}
            />

            {risk && (
              <MobileDataRow
                label="Risk Level"
                value={risk}
                valueClassName={
                  risk === "HIGH"
                    ? "text-red-300"
                    : risk === "MEDIUM"
                      ? "text-amber-300"
                      : "text-slate-300"
                }
              />
            )}
          </div>

          <div
            className="
              mt-3
              overflow-hidden
              rounded-xl
              border
              border-white/[0.06]
              bg-black/10
              px-3
            "
          >
            <div
              className="
                flex
                items-center
                justify-between
                py-2
              "
            >
              <div
                className="
                  flex
                  items-center
                  gap-1.5
                "
              >
                <FiGlobe
                  className="
                    h-3
                    w-3
                    text-cyan-400/70
                  "
                  strokeWidth={1.4}
                />

                <span
                  className="
                    font-['Orbitron']
                    text-[7px]
                    uppercase
                    tracking-[0.09em]
                    text-slate-500
                  "
                >
                  ITRF CARTESIAN
                </span>
              </div>

              <span
                className="
                  font-['Orbitron']
                  text-[6px]
                  text-slate-600
                "
              >
                KM
              </span>
            </div>

            <MobileDataRow
              label="X"
              value={hasValue(xKm) ? `${formatCoordinate(xKm)} km` : null}
            />

            <MobileDataRow
              label="Y"
              value={hasValue(yKm) ? `${formatCoordinate(yKm)} km` : null}
            />

            <MobileDataRow
              label="Z"
              value={hasValue(zKm) ? `${formatCoordinate(zKm)} km` : null}
            />
          </div>
        </div>

        <div
          className="
            shrink-0
            w-full
            border-t
            border-cyan-400/[0.08]
            bg-[#06111c]/[0.99]
            px-3
            pt-3
            pb-3
          "
        >
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();

              if (canFocusObject) {
                onFocusObject(selectedObject);
              }
            }}
            disabled={!canFocusObject}
            className="
              flex
              min-h-[44px]
              w-full
              items-center
              justify-center
              gap-2
              rounded-xl
              border
              border-cyan-400/25
              bg-cyan-400/[0.08]
              px-3
              font-['Orbitron']
              text-[7px]
              font-medium
              uppercase
              tracking-[0.06em]
              text-cyan-200
              transition-all
              duration-200
              active:scale-[0.98]
              hover:border-cyan-300/40
              hover:bg-cyan-400/[0.12]
              focus-visible:outline-none
              focus-visible:ring-1
              focus-visible:ring-cyan-400/60
              disabled:cursor-not-allowed
              disabled:opacity-40
            "
          >
            <FiCrosshair
              className="h-3.5 w-3.5"
              strokeWidth={1.5}
              aria-hidden="true"
            />
            FOCUS OBJECT
          </button>
        </div>
      </aside>
    </>
  );
};

/* ============================================================================
 * OVERVIEW TAB
 * ========================================================================== */

const OverviewTab = ({ object }) => {
  const status = normalizeStatus(object?.missionStatus);

  const risk = normalizeRisk(getRiskValue(object));

  const type = normalizeObjectType(object?.objectType);

  const xKm = getXKm(object);

  const yKm = getYKm(object);

  const zKm = getZKm(object);

  return (
    <div>
      <SectionHeader icon={FiInfo} title="OBJECT TELEMETRY" />

      <div className="px-3">
        <DataRow icon={FiRadio} label="Object Name" value={object?.name} />

        <DataRow
          icon={FiHash}
          label="NORAD Catalog ID"
          value={object?.noradId}
        />

        <DataRow icon={FiLayers} label="Object Type" value={type || null} />

        <DataRow
          icon={FiActivity}
          label="Mission Status"
          value={status || null}
          valueClassName={status === "ACTIVE" ? "text-emerald-300" : ""}
        />

        <DataRow
          icon={FiAlertTriangle}
          label="Risk Level"
          value={risk || null}
          valueClassName={
            risk === "HIGH"
              ? "text-red-300"
              : risk === "MEDIUM"
                ? "text-amber-300"
                : ""
          }
        />

        <DataRow
          icon={FiGlobe}
          label="Country / Operator"
          value={object?.country || object?.operator}
        />

        <DataRow
          icon={FiRotateCw}
          label="Data Epoch"
          value={formatTimestamp(object?.timestamp)}
        />

        <DataRow
          icon={FiNavigation}
          label="Reference Frame"
          value={object?.frame ?? "ITRF"}
        />
      </div>

      <SectionHeader
        icon={FiMapPin}
        title="CURRENT POSITION"
        trailing="ITRF"
      />

      <div
        className="
          grid
          grid-cols-3
          gap-2
          px-3
          py-3
        "
      >
        <MetricBox
          label="X"
          value={Number.isFinite(Number(xKm)) ? formatCoordinate(xKm) : null}
          unit="km"
        />

        <MetricBox
          label="Y"
          value={Number.isFinite(Number(yKm)) ? formatCoordinate(yKm) : null}
          unit="km"
        />

        <MetricBox
          label="Z"
          value={Number.isFinite(Number(zKm)) ? formatCoordinate(zKm) : null}
          unit="km"
        />
      </div>
    </div>
  );
};

/* ============================================================================
 * ORBIT TAB
 * ========================================================================== */

const OrbitTab = ({ object }) => (
  <div>
    <SectionHeader icon={FiActivity} title="ORBITAL PARAMETERS" />

    <div className="px-3">
      <DataRow
        icon={FiCompass}
        label="Orbit Type"
        value={object?.orbitType}
      />

      <DataRow
        icon={FiArrowUpRight}
        label="Inclination"
        value={
          object?.inclination !== undefined
            ? `${formatAngle(object.inclination)}°`
            : null
        }
      />

      <DataRow
        icon={FiNavigation}
        label="Mean Motion"
        value={
          object?.meanMotion !== undefined
            ? `${formatNumber(object.meanMotion, 2)} rev/day`
            : null
        }
      />

      <DataRow
        icon={FiGlobe}
        label="Altitude"
        value={
          object?.altitudeKm !== undefined
            ? `${formatAltitude(object.altitudeKm)} km`
            : null
        }
      />

      <DataRow
        icon={FiRotateCw}
        label="Epoch"
        value={formatTimestamp(object?.timestamp)}
      />
    </div>

    <SectionHeader icon={FiLayers} title="PROPAGATION" />

    <div className="px-3">
      <DataRow
        icon={FiActivity}
        label="Propagation"
        value={object?.propagationMethod ?? "SGP4 / OREKIT"}
      />

      <DataRow
        icon={FiGlobe}
        label="Reference Frame"
        value={object?.frame ?? "ITRF"}
      />
    </div>
  </div>
);

/* ============================================================================
 * POSITION TAB
 * ========================================================================== */

const PositionTab = ({ object }) => {
  const xKm = getXKm(object);

  const yKm = getYKm(object);

  const zKm = getZKm(object);

  return (
    <div>
      <SectionHeader icon={FiGlobe} title="ITRF CARTESIAN" trailing="KM" />

      <div className="px-3">
        <DataRow
          icon={FiArrowUpRight}
          label="X"
          value={
            xKm !== undefined && xKm !== null
              ? `${formatCoordinate(xKm)} km`
              : null
          }
        />

        <DataRow
          icon={FiArrowUpRight}
          label="Y"
          value={
            yKm !== undefined && yKm !== null
              ? `${formatCoordinate(yKm)} km`
              : null
          }
        />

        <DataRow
          icon={FiArrowUpRight}
          label="Z"
          value={
            zKm !== undefined && zKm !== null
              ? `${formatCoordinate(zKm)} km`
              : null
          }
        />

        <DataRow
          icon={FiRotateCw}
          label="Timestamp"
          value={formatTimestamp(object?.timestamp)}
        />

        <DataRow
          icon={FiLayers}
          label="Frame"
          value={object?.frame ?? "ITRF"}
        />
      </div>

      <SectionHeader
        icon={FiMapPin}
        title="GEODETIC POSITION"
        trailing="WGS84"
      />

      <div className="px-3">
        <DataRow
          icon={FiNavigation}
          label="Latitude"
          value={
            object?.latitude !== undefined
              ? `${formatAngle(object.latitude)}°`
              : null
          }
        />

        <DataRow
          icon={FiNavigation}
          label="Longitude"
          value={
            object?.longitude !== undefined
              ? `${formatAngle(object.longitude)}°`
              : null
          }
        />

        <DataRow
          icon={FiArrowUpRight}
          label="Altitude"
          value={
            object?.altitudeKm !== undefined
              ? `${formatAltitude(object.altitudeKm)} km`
              : null
          }
        />
      </div>
    </div>
  );
};

/* ============================================================================
 * DETAILS TAB
 * ========================================================================== */

const DetailsTab = ({ object }) => {
  const risk = getRiskValue(object);

  return (
    <div>
      <SectionHeader icon={FiInfo} title="OBJECT DETAILS" />

      <div className="px-3">
        <DataRow icon={FiRadio} label="Name" value={object?.name} />

        <DataRow icon={FiHash} label="NORAD ID" value={object?.noradId} />

        <DataRow
          icon={FiLayers}
          label="Object Type"
          value={getObjectTypeLabel(object)}
        />

        <DataRow icon={FiGlobe} label="Country" value={object?.country} />

        <DataRow icon={FiRadio} label="Operator" value={object?.operator} />

        <DataRow
          icon={FiCheckCircle}
          label="Mission Status"
          value={object?.missionStatus}
        />

        <DataRow icon={FiActivity} label="Risk Level" value={risk} />
      </div>

      <SectionHeader icon={FiLayers} title="VISUALIZATION" />

      <div className="px-3">
        <DataRow
          icon={FiGlobe}
          label="Reference Frame"
          value={object?.frame ?? "ITRF"}
        />

        <DataRow
          icon={FiRotateCw}
          label="Data Epoch"
          value={formatTimestamp(object?.timestamp)}
        />
      </div>
    </div>
  );
};

/* ============================================================================
 * TAB CONTENT
 * ========================================================================== */

const InspectorTabContent = ({ activeTab, object }) => {
  switch (activeTab) {
    case "orbit":
      return <OrbitTab object={object} />;

    case "position":
      return <PositionTab object={object} />;

    case "details":
      return <DetailsTab object={object} />;

    case "overview":
    default:
      return <OverviewTab object={object} />;
  }
};

/* ============================================================================
 * OBJECT INSPECTOR
 * ========================================================================== */

const ObjectInspector = ({
  selectedObject = null,
  onClose,
  onFocusObject,
  open = true,
  initialTab = DEFAULT_TAB,
  className = "",
}) => {
  const resolveInitialTab = useCallback(
    (value) =>
      TABS.some((tab) => tab.id === value) ? value : DEFAULT_TAB,
    [],
  );

  const [activeTab, setActiveTab] = useState(() =>
    resolveInitialTab(initialTab),
  );

  const canFocusObject = Boolean(
    selectedObject && typeof onFocusObject === "function",
  );

  useEffect(() => {
    setActiveTab(resolveInitialTab(initialTab));
  }, [initialTab, resolveInitialTab]);

  useEffect(() => {
    setActiveTab(DEFAULT_TAB);
  }, [selectedObject?.id, selectedObject?.noradId]);

  const theme = useMemo(
    () => getObjectTheme(selectedObject),
    [selectedObject],
  );

  const handleTabChange = useCallback((tabId) => {
    if (TABS.some((tab) => tab.id === tabId)) {
      setActiveTab(tabId);
    }
  }, []);

  /**
   * FOCUS OBJECT
   *
   * This component intentionally does not perform camera calculations.
   *
   * The selected object is passed back to Visualization.jsx, where the
   * existing camera bridge owns the actual Three.js camera operation.
   */

  const handleFocusObject = useCallback(
    (eventOrObject) => {
      const isEvent =
        eventOrObject &&
        typeof eventOrObject === "object" &&
        ("stopPropagation" in eventOrObject ||
          "preventDefault" in eventOrObject);

      if (isEvent) {
        eventOrObject?.stopPropagation?.();
      }

      if (!selectedObject || typeof onFocusObject !== "function") {
        return;
      }

      onFocusObject(selectedObject);
    },
    [onFocusObject, selectedObject],
  );

  if (!open) {
    return null;
  }

  return (
    <>
      {/* =====================================================================
          MOBILE VERSION
          ================================================================== */}

      {selectedObject && (
        <MobileObjectInspector
          selectedObject={selectedObject}
          theme={theme}
          onClose={onClose}
          onFocusObject={handleFocusObject}
          canFocusObject={canFocusObject}
        />
      )}

      {/* =====================================================================
          DESKTOP VERSION
          ================================================================== */}

      <div
        className="
          pointer-events-none
          hidden
          lg:block
        "
      >
        <aside
          aria-label="Object inspector"
          className={`
            pointer-events-auto
            absolute

            right-3
            top-3
            bottom-10

            z-50

            flex
            w-[330px]
            flex-col
            overflow-hidden

            rounded-xl
            border
            border-cyan-400/15

            bg-[#03101b]/95

            text-slate-100

            shadow-[0_12px_36px_rgba(0,0,0,0.38)]

            backdrop-blur-xl

            xl:right-2
            xl:w-[340px]

            ${className}
          `}
        >
          {/* ===============================================================
              DESKTOP HEADER
              ============================================================ */}

          <div
            className="
              flex
              shrink-0
              items-center
              justify-between
              gap-3
              border-b
              border-cyan-400/[0.08]
              px-4
              py-3.5
            "
          >
            <div
              className="
                flex
                min-w-0
                items-center
                gap-2.5
              "
            >
              <div
                className="
                  flex
                  h-7
                  w-7
                  shrink-0
                  items-center
                  justify-center
                  rounded-lg
                  border
                  border-cyan-400/15
                  bg-cyan-400/[0.05]
                  text-cyan-300
                "
              >
                <FiTarget className="h-3.5 w-3.5" strokeWidth={1.5} />
              </div>

              <div className="min-w-0">
                <h2
                  className="
                    truncate
                    font-['Orbitron']
                    text-[10px]
                    font-semibold
                    uppercase
                    tracking-[0.11em]
                    text-slate-100
                  "
                >
                  OBJECT INSPECTOR
                </h2>

                {selectedObject && (
                  <div
                    className="
                      mt-1
                      flex
                      items-center
                      gap-1.5
                    "
                  >
                    <span
                      className={`
                        h-1.5
                        w-1.5
                        rounded-full
                        ${theme.dot}
                      `}
                    />

                    <span
                      className="
                        font-['Orbitron']
                        text-[6px]
                        uppercase
                        tracking-[0.08em]
                        text-slate-600
                      "
                    >
                      {getObjectTypeLabel(selectedObject)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onClose?.();
              }}
              aria-label="Close object inspector"
              className="
                flex
                h-8
                w-8
                shrink-0
                items-center
                justify-center
                rounded-lg
                border
                border-transparent
                text-slate-500
                transition-colors
                hover:border-cyan-400/10
                hover:bg-white/[0.03]
                hover:text-slate-200
                focus-visible:outline-none
                focus-visible:ring-1
                focus-visible:ring-cyan-400/60
              "
            >
              <FiX className="h-4 w-4" strokeWidth={1.5} />
            </button>
          </div>

          {/* ===============================================================
              EMPTY STATE
              ============================================================ */}

          {!selectedObject ? (
            <EmptyInspector />
          ) : (
            <>
              {/* =============================================================
                  OBJECT HEADER
                  ========================================================== */}

              <div className="shrink-0">
                <ObjectHeader
                  object={selectedObject}
                  theme={theme}
                />
              </div>

              {/* =============================================================
                  TABS
                  ========================================================== */}

              <div
                className="
                  shrink-0
                  border-b
                  border-cyan-400/[0.08]
                  px-2
                "
                role="tablist"
                aria-label="Object telemetry sections"
              >
                <div
                  className="
                    grid
                    grid-cols-4
                  "
                >
                  {TABS.map((tab) => {
                    const active = activeTab === tab.id;

                    return (
                      <button
                        key={tab.id}
                        id={`object-tab-${tab.id}`}
                        type="button"
                        role="tab"
                        aria-selected={active}
                        aria-controls={`object-panel-${tab.id}`}
                        onClick={() => handleTabChange(tab.id)}
                        className={`
                          relative
                          min-h-[38px]
                          px-1
                          font-['Orbitron']
                          text-[7px]
                          font-medium
                          uppercase
                          tracking-[0.05em]
                          transition-colors
                          duration-200
                          focus-visible:outline-none
                          focus-visible:ring-1
                          focus-visible:ring-inset
                          focus-visible:ring-cyan-400/60

                          ${
                            active
                              ? "text-cyan-300"
                              : "text-slate-600 hover:text-slate-300"
                          }
                        `}
                      >
                        {tab.label}

                        {active && (
                          <span
                            className="
                              absolute
                              inset-x-2
                              bottom-0
                              h-px
                              bg-cyan-400
                              shadow-[0_0_8px_rgba(34,211,238,0.65)]
                            "
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* =============================================================
                  TAB CONTENT
                  ========================================================== */}

              <div
                id={`object-panel-${activeTab}`}
                role="tabpanel"
                aria-labelledby={`object-tab-${activeTab}`}
                className="
                  min-h-0
                  flex-1
                  overflow-y-auto
                  overscroll-contain
                  scrollbar-thin
                  scrollbar-track-transparent
                  scrollbar-thumb-cyan-400/10
                "
              >
                <InspectorTabContent
                  activeTab={activeTab}
                  object={selectedObject}
                />
              </div>

              {/* =============================================================
                  DESKTOP ACTION BAR
                  ========================================================== */}

              <div
                className="
                  shrink-0
                  border-t
                  border-cyan-400/[0.08]
                  bg-[#03101b]/90
                  p-3
                "
              >
                <button
                  type="button"
                  onClick={handleFocusObject}
                  disabled={!canFocusObject}
                  aria-label="Focus selected object"
                  className="
                    flex
                    min-h-[40px]
                    w-full
                    items-center
                    justify-center
                    gap-2
                    rounded-lg
                    border
                    border-cyan-400/25
                    bg-cyan-400/[0.06]
                    px-3
                    font-['Orbitron']
                    text-[7px]
                    font-medium
                    uppercase
                    tracking-[0.06em]
                    text-cyan-200
                    transition-all
                    duration-200
                    hover:border-cyan-300/40
                    hover:bg-cyan-400/[0.1]
                    focus-visible:outline-none
                    focus-visible:ring-1
                    focus-visible:ring-cyan-400/60
                    disabled:cursor-not-allowed
                    disabled:opacity-40
                  "
                >
                  <FiCrosshair
                    className="h-3.5 w-3.5"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                  FOCUS OBJECT
                </button>
              </div>
            </>
          )}
        </aside>
      </div>
    </>
  );
};

export default ObjectInspector;