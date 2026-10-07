import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

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
 * RIGHT-SIDE OBJECT TELEMETRY / INSPECTION PANEL
 *
 * ----------------------------------------------------------------------------
 * RESPONSIBILITY
 * ----------------------------------------------------------------------------
 *
 * Presentation-only inspector for the currently selected orbital object.
 *
 * Owns:
 * - inspector presentation
 * - inspector tabs
 * - metadata presentation
 * - orbital telemetry presentation
 * - ITRF Cartesian telemetry presentation
 * - WGS84 geodetic telemetry presentation
 * - focus-object action
 * - show-orbit action
 * - responsive panel presentation
 *
 * Does NOT own:
 * - API requests
 * - orbital propagation
 * - SGP4 calculations
 * - Orekit calculations
 * - coordinate conversion
 * - risk calculations
 * - camera implementation
 * - Three.js rendering
 *
 * Parent page remains responsible for application state.
 *
 * IMPORTANT:
 * The parent Visualization.jsx controls the panel position.
 * This component intentionally does NOT use `fixed` positioning.
 *
 * ============================================================================
 */

/* ============================================================================
 * CONSTANTS
 * ========================================================================== */

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
 * FORMAT HELPERS
 * ========================================================================== */

const displayValue = (value, fallback = "—") => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
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

const formatCoordinate = (value) =>
  formatNumber(value, 2);

const formatAltitude = (value) =>
  formatNumber(value, 2);

const formatAngle = (value) =>
  formatNumber(value, 2);

const formatTimestamp = (value) => {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

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

/* ============================================================================
 * OBJECT HELPERS
 * ========================================================================== */

const getObjectTypeLabel = (object) => {
  const type = normalizeObjectType(
    object?.objectType,
  );

  if (type === "SATELLITE") {
    return "SATELLITE";
  }

  if (type === "DEBRIS") {
    return "DEBRIS";
  }

  return type || "OBJECT";
};

const getObjectTheme = (object) => {
  const type = normalizeObjectType(
    object?.objectType,
  );

  const risk = normalizeRisk(
    object?.riskLevel,
  );

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
 * SMALL UI COMPONENTS
 * ========================================================================== */

const DataRow = ({
  icon: Icon,
  label,
  value,
  valueClassName = "",
}) => (
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
        <Icon
          className="h-3 w-3"
          strokeWidth={1.4}
          aria-hidden="true"
        />
      ) : (
        <FiCircle
          className="h-1.5 w-1.5"
          aria-hidden="true"
        />
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

const SectionHeader = ({
  icon: Icon,
  title,
  trailing,
}) => (
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

const MetricBox = ({
  label,
  value,
  unit,
  accent = "cyan",
}) => {
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
      <FiTarget
        className="h-5 w-5"
        strokeWidth={1.25}
      />
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
      Select a satellite or debris
      object from the orbital scene to
      inspect its telemetry.
    </p>
  </div>
);

/* ============================================================================
 * OBJECT HEADER
 * ========================================================================== */

const ObjectHeader = ({
  object,
  theme,
}) => {
  const type = getObjectTypeLabel(object);

  const status = normalizeStatus(
    object?.missionStatus,
  );

  const statusLabel =
    status || "TRACKED";

  const imageUrl =
    object?.imageUrl ??
    object?.image ??
    null;

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
            alt=""
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
            title={object?.name}
          >
            {displayValue(
              object?.name,
              "UNKNOWN OBJECT",
            )}
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
            {displayValue(
              object?.noradId,
            )}
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
 * OVERVIEW TAB
 * ========================================================================== */

const OverviewTab = ({
  object,
}) => {
  const status = normalizeStatus(
    object?.missionStatus,
  );

  const risk = normalizeRisk(
    object?.riskLevel,
  );

  const type = normalizeObjectType(
    object?.objectType,
  );

  return (
    <div>
      <SectionHeader
        icon={FiInfo}
        title="OBJECT TELEMETRY"
      />

      <div className="px-3">
        <DataRow
          icon={FiRadio}
          label="Object Name"
          value={object?.name}
        />

        <DataRow
          icon={FiHash}
          label="NORAD Catalog ID"
          value={object?.noradId}
        />

        <DataRow
          icon={FiLayers}
          label="Object Type"
          value={type || null}
        />

        <DataRow
          icon={FiActivity}
          label="Mission Status"
          value={status || null}
          valueClassName={
            status === "ACTIVE"
              ? "text-emerald-300"
              : ""
          }
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
          value={
            object?.country ??
            object?.operator
          }
        />

        <DataRow
          icon={FiRotateCw}
          label="Data Epoch"
          value={formatTimestamp(
            object?.timestamp,
          )}
        />

        <DataRow
          icon={FiNavigation}
          label="Reference Frame"
          value={
            object?.frame ?? "ITRF"
          }
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
          value={
            Number.isFinite(
              Number(object?.xKm),
            )
              ? formatCoordinate(
                  object.xKm,
                )
              : null
          }
          unit="km"
        />

        <MetricBox
          label="Y"
          value={
            Number.isFinite(
              Number(object?.yKm),
            )
              ? formatCoordinate(
                  object.yKm,
                )
              : null
          }
          unit="km"
        />

        <MetricBox
          label="Z"
          value={
            Number.isFinite(
              Number(object?.zKm),
            )
              ? formatCoordinate(
                  object.zKm,
                )
              : null
          }
          unit="km"
        />
      </div>
    </div>
  );
};

/* ============================================================================
 * ORBIT TAB
 * ========================================================================== */

const OrbitTab = ({
  object,
}) => (
  <div>
    <SectionHeader
      icon={FiActivity}
      title="ORBITAL PARAMETERS"
    />

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
          object?.inclination !==
          undefined
            ? `${formatAngle(
                object.inclination,
              )}°`
            : null
        }
      />

      <DataRow
        icon={FiNavigation}
        label="Mean Motion"
        value={
          object?.meanMotion !==
          undefined
            ? `${formatNumber(
                object.meanMotion,
                2,
              )} rev/day`
            : null
        }
      />

      <DataRow
        icon={FiGlobe}
        label="Altitude"
        value={
          object?.altitudeKm !==
          undefined
            ? `${formatAltitude(
                object.altitudeKm,
              )} km`
            : null
        }
      />

      <DataRow
        icon={FiRotateCw}
        label="Epoch"
        value={formatTimestamp(
          object?.timestamp,
        )}
      />
    </div>

    <SectionHeader
      icon={FiLayers}
      title="PROPAGATION"
    />

    <div className="px-3">
      <DataRow
        icon={FiActivity}
        label="Propagation"
        value={
          object?.propagationMethod ??
          "SGP4 / OREKIT"
        }
      />

      <DataRow
        icon={FiGlobe}
        label="Reference Frame"
        value={
          object?.frame ?? "ITRF"
        }
      />
    </div>
  </div>
);

/* ============================================================================
 * POSITION TAB
 * ========================================================================== */

const PositionTab = ({
  object,
}) => (
  <div>
    <SectionHeader
      icon={FiGlobe}
      title="ITRF CARTESIAN"
      trailing="KM"
    />

    <div className="px-3">
      <DataRow
        icon={FiArrowUpRight}
        label="X"
        value={
          object?.xKm !== undefined
            ? `${formatCoordinate(
                object.xKm,
              )} km`
            : null
        }
      />

      <DataRow
        icon={FiArrowUpRight}
        label="Y"
        value={
          object?.yKm !== undefined
            ? `${formatCoordinate(
                object.yKm,
              )} km`
            : null
        }
      />

      <DataRow
        icon={FiArrowUpRight}
        label="Z"
        value={
          object?.zKm !== undefined
            ? `${formatCoordinate(
                object.zKm,
              )} km`
            : null
        }
      />

      <DataRow
        icon={FiRotateCw}
        label="Timestamp"
        value={formatTimestamp(
          object?.timestamp,
        )}
      />

      <DataRow
        icon={FiLayers}
        label="Frame"
        value={
          object?.frame ?? "ITRF"
        }
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
          object?.latitude !==
          undefined
            ? `${formatAngle(
                object.latitude,
              )}°`
            : null
        }
      />

      <DataRow
        icon={FiNavigation}
        label="Longitude"
        value={
          object?.longitude !==
          undefined
            ? `${formatAngle(
                object.longitude,
              )}°`
            : null
        }
      />

      <DataRow
        icon={FiArrowUpRight}
        label="Altitude"
        value={
          object?.altitudeKm !==
          undefined
            ? `${formatAltitude(
                object.altitudeKm,
              )} km`
            : null
        }
      />
    </div>
  </div>
);

/* ============================================================================
 * DETAILS TAB
 * ========================================================================== */

const DetailsTab = ({
  object,
}) => (
  <div>
    <SectionHeader
      icon={FiInfo}
      title="OBJECT DETAILS"
    />

    <div className="px-3">
      <DataRow
        icon={FiRadio}
        label="Name"
        value={object?.name}
      />

      <DataRow
        icon={FiHash}
        label="NORAD ID"
        value={object?.noradId}
      />

      <DataRow
        icon={FiLayers}
        label="Object Type"
        value={getObjectTypeLabel(
          object,
        )}
      />

      <DataRow
        icon={FiGlobe}
        label="Country"
        value={object?.country}
      />

      <DataRow
        icon={FiRadio}
        label="Operator"
        value={object?.operator}
      />

      <DataRow
        icon={FiCheckCircle}
        label="Mission Status"
        value={object?.missionStatus}
      />

      <DataRow
        icon={FiActivity}
        label="Risk Level"
        value={object?.riskLevel}
      />
    </div>

    <SectionHeader
      icon={FiLayers}
      title="VISUALIZATION"
    />

    <div className="px-3">
      <DataRow
        icon={FiGlobe}
        label="Reference Frame"
        value={
          object?.frame ?? "ITRF"
        }
      />

      <DataRow
        icon={FiRotateCw}
        label="Data Epoch"
        value={formatTimestamp(
          object?.timestamp,
        )}
      />
    </div>
  </div>
);

/* ============================================================================
 * TAB CONTENT
 * ========================================================================== */

const InspectorTabContent = ({
  activeTab,
  object,
}) => {
  switch (activeTab) {
    case "orbit":
      return <OrbitTab object={object} />;

    case "position":
      return (
        <PositionTab
          object={object}
        />
      );

    case "details":
      return (
        <DetailsTab
          object={object}
        />
      );

    case "overview":
    default:
      return (
        <OverviewTab
          object={object}
        />
      );
  }
};

/* ============================================================================
 * OBJECT INSPECTOR
 * ========================================================================== */

const ObjectInspector = ({
  selectedObject = null,
  onClose,
  onFocusObject,
  onShowOrbit,
  open = true,
  initialTab = DEFAULT_TAB,
  className = "",
}) => {
  const resolveInitialTab = useCallback(
    (value) =>
      TABS.some(
        (tab) => tab.id === value,
      )
        ? value
        : DEFAULT_TAB,
    [],
  );

  const [
    activeTab,
    setActiveTab,
  ] = useState(() =>
    resolveInitialTab(
      initialTab,
    ),
  );

  /* --------------------------------------------------------------------------
   * Keep active tab valid when parent changes initialTab.
   * ------------------------------------------------------------------------ */

  useEffect(() => {
    setActiveTab(
      resolveInitialTab(
        initialTab,
      ),
    );
  }, [
    initialTab,
    resolveInitialTab,
  ]);

  /* --------------------------------------------------------------------------
   * Reset to overview when the selected object changes.
   *
   * This prevents a newly selected object from opening on a stale tab.
   * ------------------------------------------------------------------------ */

  useEffect(() => {
    setActiveTab(DEFAULT_TAB);
  }, [
    selectedObject?.id,
    selectedObject?.noradId,
  ]);

  const theme = useMemo(
    () =>
      getObjectTheme(
        selectedObject,
      ),
    [selectedObject],
  );

  /* ==========================================================================
   * TAB CHANGE
   * ======================================================================== */

  const handleTabChange =
    useCallback((tabId) => {
      if (
        TABS.some(
          (tab) =>
            tab.id === tabId,
        )
      ) {
        setActiveTab(tabId);
      }
    }, []);

  /* ==========================================================================
   * FOCUS OBJECT
   * ======================================================================== */

  const handleFocusObject =
    useCallback(() => {
      if (!selectedObject) {
        return;
      }

      onFocusObject?.(
        selectedObject,
      );
    }, [
      onFocusObject,
      selectedObject,
    ]);

  /* ==========================================================================
   * SHOW ORBIT
   * ======================================================================== */

  const handleShowOrbit =
    useCallback(() => {
      if (!selectedObject) {
        return;
      }

      onShowOrbit?.(
        selectedObject,
      );
    }, [
      onShowOrbit,
      selectedObject,
    ]);

  /* ==========================================================================
   * CLOSED
   * ======================================================================== */

  if (!open) {
    return null;
  }

  return (
    <>
      {/* ======================================================================
          MOBILE BACKDROP

          IMPORTANT:
          This is absolute rather than fixed so the inspector remains inside
          the Visualization workspace.
          ================================================================== */}

      <button
        type="button"
        aria-label="Close object inspector"
        onClick={onClose}
        className="
          pointer-events-auto
          absolute
          inset-0
          z-40
          bg-black/55
          backdrop-blur-[2px]
          lg:hidden
        "
      />

      {/* ======================================================================
          INSPECTOR PANEL

          IMPORTANT:
          Do NOT use `fixed` here.

          Visualization.jsx already owns the panel's absolute positioning.
          This component only controls its own dimensions and presentation.
          ================================================================== */}

      <aside
        aria-label="Object inspector"
        className={`
          pointer-events-auto
          absolute
          z-50
          flex
          flex-col
          overflow-hidden
          border
          border-cyan-400/15
          bg-[#03101b]/95
          text-slate-100
          shadow-[0_20px_70px_rgba(0,0,0,0.5)]
          backdrop-blur-xl

          /* ---------------------------------------------------------------
             MOBILE
             --------------------------------------------------------------- */

          inset-x-3
          bottom-3
          max-h-[calc(100%-1.5rem)]
          rounded-2xl

          /* ---------------------------------------------------------------
             TABLET
             --------------------------------------------------------------- */

          sm:left-auto
          sm:right-3
          sm:top-3
          sm:bottom-3
          sm:w-[330px]
          sm:max-h-none
          sm:rounded-xl

          /* ---------------------------------------------------------------
             DESKTOP
             --------------------------------------------------------------- */

          lg:right-3
          lg:top-3
          lg:bottom-3
          lg:w-[330px]
          lg:rounded-xl

          xl:right-4
          xl:w-[340px]

          ${className}
        `}
      >
        {/* ==================================================================
            HEADER
            ================================================================== */}

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
              <FiTarget
                className="h-3.5 w-3.5"
                strokeWidth={1.5}
                aria-hidden="true"
              />
            </div>

            <div className="min-w-0">
              <h2
                className="
                  truncate
                  font-['Orbitron']
                  text-[9px]
                  font-semibold
                  uppercase
                  tracking-[0.11em]
                  text-slate-100
                  sm:text-[10px]
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
                    {getObjectTypeLabel(
                      selectedObject,
                    )}
                  </span>
                </div>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
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
            <FiX
              className="h-4 w-4"
              strokeWidth={1.5}
            />
          </button>
        </div>

        {/* ==================================================================
            EMPTY STATE
            ================================================================== */}

        {!selectedObject ? (
          <EmptyInspector />
        ) : (
          <>
            {/* ==============================================================
                SELECTED OBJECT HEADER
                ============================================================== */}

            <div className="shrink-0">
              <ObjectHeader
                object={
                  selectedObject
                }
                theme={theme}
              />
            </div>

            {/* ==============================================================
                TABS
                ============================================================== */}

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
                  const active =
                    activeTab ===
                    tab.id;

                  return (
                    <button
                      key={tab.id}
                      id={`object-tab-${tab.id}`}
                      type="button"
                      role="tab"
                      aria-selected={
                        active
                      }
                      aria-controls={`object-panel-${tab.id}`}
                      onClick={() =>
                        handleTabChange(
                          tab.id,
                        )
                      }
                      className={`
                        relative
                        min-h-[38px]
                        px-1
                        font-['Orbitron']
                        text-[6px]
                        font-medium
                        uppercase
                        tracking-[0.05em]
                        transition-colors
                        duration-200
                        focus-visible:outline-none
                        focus-visible:ring-1
                        focus-visible:ring-inset
                        focus-visible:ring-cyan-400/60
                        sm:text-[7px]

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

            {/* ==============================================================
                TAB CONTENT

                This is the ONLY scrolling area of the inspector.
                Header, tabs and action bar remain fixed inside the panel.
                ============================================================== */}

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
                activeTab={
                  activeTab
                }
                object={
                  selectedObject
                }
              />
            </div>

            {/* ==============================================================
                ACTION BAR
                ============================================================== */}

            <div
              className="
                grid
                shrink-0
                grid-cols-2
                gap-2
                border-t
                border-cyan-400/[0.08]
                bg-[#03101b]/90
                p-3
              "
            >
              {/* ------------------------------------------------------------
                  FOCUS OBJECT
                  ------------------------------------------------------------ */}

              <button
                type="button"
                onClick={
                  handleFocusObject
                }
                disabled={
                  !selectedObject
                }
                className="
                  flex
                  min-h-[40px]
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

              {/* ------------------------------------------------------------
                  SHOW ORBIT
                  ------------------------------------------------------------ */}

              <button
                type="button"
                onClick={
                  handleShowOrbit
                }
                disabled={
                  !selectedObject
                }
                className="
                  flex
                  min-h-[40px]
                  items-center
                  justify-center
                  gap-2
                  rounded-lg
                  border
                  border-slate-700/80
                  bg-white/[0.015]
                  px-3
                  font-['Orbitron']
                  text-[7px]
                  font-medium
                  uppercase
                  tracking-[0.06em]
                  text-slate-400
                  transition-all
                  duration-200
                  hover:border-cyan-400/20
                  hover:bg-cyan-400/[0.04]
                  hover:text-cyan-200
                  focus-visible:outline-none
                  focus-visible:ring-1
                  focus-visible:ring-cyan-400/60
                  disabled:cursor-not-allowed
                  disabled:opacity-40
                "
              >
                <FiActivity
                  className="h-3.5 w-3.5"
                  strokeWidth={1.5}
                  aria-hidden="true"
                />

                SHOW ORBIT
              </button>
            </div>
          </>
        )}
      </aside>
    </>
  );
};

export default ObjectInspector;