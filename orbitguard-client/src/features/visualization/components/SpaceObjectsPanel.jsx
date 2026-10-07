import {
  useCallback,
  useMemo,
  useState,
} from "react";

import {
  FiAlertTriangle,
  FiCircle,
  FiFilter,
  FiLayers,
  FiRadio,
  FiSliders,
  FiX,
} from "react-icons/fi";

/**
 * ============================================================================
 * OrbitGuard AI — Space Objects Panel
 * ============================================================================
 *
 * RESPONSIBILITY
 * ----------------------------------------------------------------------------
 *
 * Presentation/control panel for tracked orbital objects.
 *
 * Owns:
 * - satellite/debris counts
 * - display toggles
 * - object filtering
 * - object list
 * - object selection interaction
 * - panel presentation
 *
 * Does NOT own:
 * - API calls
 * - orbital propagation
 * - SGP4
 * - Orekit
 * - Three.js
 * - collision calculations
 * - camera
 *
 * IMPORTANT
 * ----------------------------------------------------------------------------
 *
 * Visualization.jsx owns the panel position.
 *
 * This component intentionally does NOT position itself with:
 *
 * - fixed
 * - absolute desktop coordinates
 *
 * The parent decides where the panel sits in the visualization workspace.
 *
 * ============================================================================
 */

/* ============================================================================
 * CONSTANTS
 * ========================================================================== */

const DEFAULT_COUNTS = Object.freeze({
  satellites: 0,
  debris: 0,
});

const DEFAULT_DISPLAY_OPTIONS = Object.freeze({
  satellites: true,
  debris: true,
  orbitalTrails: true,
  atmosphere: true,
});

const FILTER_OPTIONS = Object.freeze([
  {
    value: "ALL",
    label: "ALL",
  },
  {
    value: "SATELLITE",
    label: "SATELLITES",
  },
  {
    value: "DEBRIS",
    label: "DEBRIS",
  },
]);

/* ============================================================================
 * HELPERS
 * ========================================================================== */

const normalizeObjectType = (value) =>
  String(value ?? "")
    .trim()
    .toUpperCase();

const normalizeRiskLevel = (value) =>
  String(value ?? "")
    .trim()
    .toUpperCase();

const getObjectId = (object) =>
  object?.noradId ??
  object?.noradID ??
  object?.noradCatalogId ??
  object?.id ??
  null;

const formatCount = (value) => {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "—";
  }

  return number.toLocaleString("en-US");
};

/**
 * ============================================================================
 * OBJECT VISUAL STATE
 * ============================================================================
 */

const getObjectVisualState = (object) => {
  const type = normalizeObjectType(
    object?.objectType ??
      object?.type ??
      object?.object_type,
  );

  const risk = normalizeRiskLevel(
    object?.riskLevel ??
      object?.risk ??
      object?.collisionRisk,
  );

  if (risk === "HIGH") {
    return {
      dot: "bg-red-400",
      glow:
        "shadow-[0_0_9px_rgba(248,113,113,0.75)]",
      text: "text-red-200",
      badge: "text-red-300",
      border: "border-red-400/20",
      background: "bg-red-400/[0.045]",
    };
  }

  if (risk === "MEDIUM") {
    return {
      dot: "bg-amber-400",
      glow:
        "shadow-[0_0_8px_rgba(251,191,36,0.65)]",
      text: "text-amber-100",
      badge: "text-amber-300",
      border: "border-amber-400/15",
      background: "bg-amber-400/[0.025]",
    };
  }

  if (type === "DEBRIS") {
    return {
      dot: "bg-amber-400",
      glow:
        "shadow-[0_0_8px_rgba(251,191,36,0.5)]",
      text: "text-amber-100",
      badge: "text-amber-300",
      border: "border-amber-400/[0.10]",
      background: "bg-amber-400/[0.02]",
    };
  }

  return {
    dot: "bg-cyan-400",
    glow:
      "shadow-[0_0_8px_rgba(34,211,238,0.6)]",
    text: "text-cyan-100",
    badge: "text-emerald-300",
    border: "border-cyan-400/[0.08]",
    background: "bg-cyan-400/[0.018]",
  };
};

/* ============================================================================
 * DISPLAY TOGGLE
 * ========================================================================== */

const DisplayToggle = ({
  label,
  enabled,
  color = "cyan",
  onChange,
}) => {
  const isAmber = color === "amber";

  const dotClass = isAmber
    ? "bg-amber-400"
    : "bg-cyan-400";

  const activeClass = isAmber
    ? "border-amber-400/40 bg-amber-400/10"
    : "border-cyan-400/40 bg-cyan-400/10";

  const thumbClass = isAmber
    ? "bg-amber-400"
    : "bg-cyan-400";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={() => onChange?.(!enabled)}
      className="
        group
        flex
        min-h-[34px]
        w-full
        items-center
        justify-between
        gap-3
        rounded-md
        px-2
        py-1
        text-left
        transition-colors
        duration-200
        hover:bg-white/[0.025]
        focus-visible:outline-none
        focus-visible:ring-1
        focus-visible:ring-cyan-400/60
      "
    >
      <span
        className="
          flex
          min-w-0
          items-center
          gap-2.5
        "
      >
        <span
          className={`
            h-1.5
            w-1.5
            shrink-0
            rounded-full
            ${dotClass}
          `}
          aria-hidden="true"
        />

        <span
          className="
            truncate
            font-['Inter']
            text-[9px]
            font-medium
            text-slate-400
            transition-colors
            group-hover:text-slate-200
          "
        >
          {label}
        </span>
      </span>

      <span
        className={`
          relative
          flex
          h-[17px]
          w-[30px]
          shrink-0
          items-center
          rounded-full
          border
          transition-all
          duration-200
          ${
            enabled
              ? activeClass
              : "border-slate-700/80 bg-slate-900/80"
          }
        `}
        aria-hidden="true"
      >
        <span
          className={`
            absolute
            h-2.5
            w-2.5
            rounded-full
            transition-transform
            duration-200
            ${
              enabled
                ? `${thumbClass} translate-x-[14px]`
                : "translate-x-[2px] bg-slate-600"
            }
          `}
        />
      </span>
    </button>
  );
};

/* ============================================================================
 * OBJECT FILTER
 * ========================================================================== */

const ObjectFilter = ({
  value,
  onChange,
}) => (
  <div
    className="
      rounded-md
      border
      border-cyan-400/[0.08]
      bg-black/15
      p-1
    "
    role="group"
    aria-label="Filter space objects by type"
  >
    <div
      className="
        grid
        grid-cols-3
        gap-1
      "
    >
      {FILTER_OPTIONS.map((option) => {
        const active =
          value === option.value;

        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() =>
              onChange?.(option.value)
            }
            className={`
              min-h-[28px]
              rounded-md
              px-1
              font-['Orbitron']
              text-[6px]
              font-medium
              uppercase
              tracking-[0.07em]
              transition-all
              duration-200
              focus-visible:outline-none
              focus-visible:ring-1
              focus-visible:ring-cyan-400/60
              ${
                active
                  ? "border border-cyan-400/20 bg-cyan-400/[0.12] text-cyan-200"
                  : "border border-transparent text-slate-600 hover:bg-white/[0.025] hover:text-slate-300"
              }
            `}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  </div>
);

/* ============================================================================
 * OBJECT ROW
 * ========================================================================== */

const ObjectRow = ({
  object,
  selected,
  onSelect,
}) => {
  const visualState =
    getObjectVisualState(object);

  const type = normalizeObjectType(
    object?.objectType ??
      object?.type ??
      object?.object_type,
  );

  const risk = normalizeRiskLevel(
    object?.riskLevel ??
      object?.risk ??
      object?.collisionRisk,
  );

  const objectId = getObjectId(object);

  const objectName =
    object?.name ??
    object?.satelliteName ??
    object?.objectName ??
    "UNKNOWN OBJECT";

  return (
    <button
      type="button"
      onClick={() =>
        onSelect?.(object)
      }
      aria-pressed={selected}
      className={`
        group
        relative
        flex
        min-h-[48px]
        w-full
        items-center
        gap-2.5
        border-b
        border-cyan-400/[0.045]
        px-3
        py-2
        text-left
        transition-all
        duration-200
        last:border-b-0
        focus-visible:outline-none
        focus-visible:ring-1
        focus-visible:ring-inset
        focus-visible:ring-cyan-400/60

        ${
          selected
            ? "bg-cyan-400/[0.075]"
            : "hover:bg-white/[0.025]"
        }
      `}
    >
      {selected && (
        <span
          className="
            absolute
            inset-y-1.5
            left-0
            w-[2px]
            rounded-r-full
            bg-cyan-300
            shadow-[0_0_9px_rgba(34,211,238,0.75)]
          "
          aria-hidden="true"
        />
      )}

      <span
        className={`
          h-1.5
          w-1.5
          shrink-0
          rounded-full
          ${visualState.dot}
          ${visualState.glow}
        `}
        aria-hidden="true"
      />

      <span
        className="
          min-w-0
          flex-1
        "
      >
        <span
          className={`
            block
            truncate
            font-['Orbitron']
            text-[8px]
            uppercase
            tracking-[0.04em]
            sm:text-[9px]
            ${
              selected
                ? "text-cyan-100"
                : "text-slate-300 group-hover:text-slate-100"
            }
          `}
          title={objectName}
        >
          {objectName}
        </span>

        <span
          className="
            mt-1
            flex
            items-center
            gap-2
            font-['Inter']
            text-[7px]
            text-slate-600
          "
        >
          <span>
            NORAD {objectId ?? "—"}
          </span>

          <span
            className="
              h-0.5
              w-0.5
              rounded-full
              bg-slate-700
            "
          />

          <span>
            {type || "UNKNOWN"}
          </span>
        </span>
      </span>

      {risk && (
        <span
          className={`
            shrink-0
            rounded-sm
            px-1.5
            py-0.5
            font-['Orbitron']
            text-[6px]
            font-semibold
            uppercase
            tracking-[0.05em]
            ${visualState.badge}
            ${
              risk === "HIGH"
                ? "bg-red-400/[0.08]"
                : risk === "MEDIUM"
                  ? "bg-amber-400/[0.07]"
                  : "bg-emerald-400/[0.05]"
            }
          `}
        >
          {risk}
        </span>
      )}

      {selected && (
        <FiRadio
          className="
            h-3
            w-3
            shrink-0
            text-cyan-300
          "
          strokeWidth={1.5}
          aria-hidden="true"
        />
      )}
    </button>
  );
};

/* ============================================================================
 * SPACE OBJECTS PANEL
 * ========================================================================== */

const SpaceObjectsPanel = ({
  /**
   * IMPORTANT:
   * These prop names intentionally match Visualization.jsx.
   */
  objects = [],

  counts = DEFAULT_COUNTS,

  displayOptions,

  onDisplayOptionChange,

  filter = "ALL",

  onFilterChange,

  selectedObjectId = null,

  onObjectSelect,

  open = true,

  onClose,

  preview = false,

  className = "",
}) => {
  /* --------------------------------------------------------------------------
   * LOCAL FALLBACK DISPLAY STATE
   * ------------------------------------------------------------------------ */

  const [
    internalDisplayOptions,
    setInternalDisplayOptions,
  ] = useState(() => ({
    ...DEFAULT_DISPLAY_OPTIONS,
  }));

  const effectiveDisplayOptions =
    displayOptions ??
    internalDisplayOptions;

  /* --------------------------------------------------------------------------
   * LOCAL FALLBACK FILTER STATE
   * ------------------------------------------------------------------------ */

  const [
    internalFilter,
    setInternalFilter,
  ] = useState("ALL");

  const activeFilter =
    filter !== undefined &&
    filter !== null
      ? filter
      : internalFilter;

  /* --------------------------------------------------------------------------
   * DISPLAY OPTION HANDLER
   * ------------------------------------------------------------------------ */

  const handleDisplayOptionChange =
    useCallback(
      (option, enabled) => {
        if (
          !Object.prototype.hasOwnProperty.call(
            DEFAULT_DISPLAY_OPTIONS,
            option,
          )
        ) {
          return;
        }

        const nextOptions = {
          ...effectiveDisplayOptions,
          [option]: Boolean(enabled),
        };

        /**
         * Controlled parent state.
         */
        onDisplayOptionChange?.(
          option,
          Boolean(enabled),
        );

        /**
         * Local fallback state.
         */
        if (
          displayOptions === undefined
        ) {
          setInternalDisplayOptions(
            nextOptions,
          );
        }
      },
      [
        displayOptions,
        effectiveDisplayOptions,
        onDisplayOptionChange,
      ],
    );

  /* --------------------------------------------------------------------------
   * FILTER HANDLER
   * ------------------------------------------------------------------------ */

  const handleFilterChange =
    useCallback(
      (nextFilter) => {
        if (
          !FILTER_OPTIONS.some(
            (option) =>
              option.value ===
              nextFilter,
          )
        ) {
          return;
        }

        if (
          filter === undefined
        ) {
          setInternalFilter(
            nextFilter,
          );
        }

        onFilterChange?.(
          nextFilter,
        );
      },
      [
        filter,
        onFilterChange,
      ],
    );

  /* --------------------------------------------------------------------------
   * NORMALIZED OBJECTS
   * ------------------------------------------------------------------------ */

  const normalizedObjects =
    useMemo(
      () =>
        Array.isArray(objects)
          ? objects.filter(Boolean)
          : [],
      [objects],
    );

  /* --------------------------------------------------------------------------
   * FILTERED OBJECTS
   * ------------------------------------------------------------------------ */

  const filteredObjects =
    useMemo(() => {
      if (
        activeFilter ===
        "SATELLITE"
      ) {
        return normalizedObjects.filter(
          (object) =>
            normalizeObjectType(
              object?.objectType ??
                object?.type ??
                object?.object_type,
            ) === "SATELLITE",
        );
      }

      if (
        activeFilter ===
        "DEBRIS"
      ) {
        return normalizedObjects.filter(
          (object) =>
            normalizeObjectType(
              object?.objectType ??
                object?.type ??
                object?.object_type,
            ) === "DEBRIS",
        );
      }

      return normalizedObjects;
    }, [
      activeFilter,
      normalizedObjects,
    ]);

  /* --------------------------------------------------------------------------
   * COUNTS
   * ------------------------------------------------------------------------ */

  const calculatedSatelliteCount =
    normalizedObjects.filter(
      (object) =>
        normalizeObjectType(
          object?.objectType ??
            object?.type ??
            object?.object_type,
        ) === "SATELLITE",
    ).length;

  const calculatedDebrisCount =
    normalizedObjects.filter(
      (object) =>
        normalizeObjectType(
          object?.objectType ??
            object?.type ??
            object?.object_type,
        ) === "DEBRIS",
    ).length;

  /**
   * Only use explicit counts when they are actually supplied.
   */
  const satelliteCount =
    counts?.satellites ??
    calculatedSatelliteCount;

  const debrisCount =
    counts?.debris ??
    calculatedDebrisCount;

  /* --------------------------------------------------------------------------
   * CLOSE
   * ------------------------------------------------------------------------ */

  const handleClose =
    useCallback(() => {
      onClose?.();
    }, [onClose]);

  /* --------------------------------------------------------------------------
   * CLOSED
   * ------------------------------------------------------------------------ */

  if (!open) {
    return null;
  }

  /* --------------------------------------------------------------------------
   * RENDER
   * ------------------------------------------------------------------------ */

  return (
    <>
      {/* ======================================================================
          MOBILE BACKDROP
          ====================================================================== */}

      <button
        type="button"
        aria-label="Close space objects panel"
        onClick={handleClose}
        className="
          pointer-events-auto
          absolute
          inset-0
          z-40
          bg-black/45
          backdrop-blur-[2px]
          lg:hidden
        "
      />

      {/* ======================================================================
          PANEL

          IMPORTANT:
          The parent Visualization.jsx controls the position.

          This component controls only:
          - width
          - height
          - internal layout
          ====================================================================== */}

      <aside
        aria-label="Space objects controls"
        className={`
          pointer-events-auto
          relative
          z-50
          flex
          w-full
          min-w-0
          flex-col
          overflow-hidden

          rounded-xl

          border
          border-cyan-300/[0.12]

          bg-[#020b14]/[0.96]

          text-slate-100

          shadow-[0_16px_50px_rgba(0,0,0,0.45)]

          backdrop-blur-xl

          sm:w-[300px]

          lg:w-[292px]
          lg:max-h-[calc(100vh-180px)]

          xl:w-[306px]

          ${className}
        `}
      >
        {/* ================================================================
            TOP ACCENT
            ================================================================ */}

        <div
          className="
            h-px
            w-full
            shrink-0
            bg-gradient-to-r
            from-cyan-400/70
            via-cyan-400/25
            to-transparent
          "
          aria-hidden="true"
        />

        {/* ================================================================
            HEADER
            ================================================================ */}

        <header
          className="
            flex
            shrink-0
            items-center
            justify-between
            gap-3
            border-b
            border-cyan-400/[0.07]
            px-3.5
            py-3
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
                rounded-md
                border
                border-cyan-400/15
                bg-cyan-400/[0.045]
                text-cyan-300
              "
            >
              <FiLayers
                className="h-3.5 w-3.5"
                strokeWidth={1.5}
                aria-hidden="true"
              />
            </div>

            <div className="min-w-0">
              <div
                className="
                  flex
                  items-center
                  gap-2
                "
              >
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
                  SPACE OBJECTS
                </h2>

                <span
                  className="
                    h-1.5
                    w-1.5
                    shrink-0
                    rounded-full
                    bg-emerald-400
                    shadow-[0_0_7px_rgba(52,211,153,0.7)]
                  "
                  aria-label="Tracking active"
                  title="Tracking active"
                />
              </div>

              <p
                className="
                  mt-0.5
                  font-['Inter']
                  text-[7px]
                  uppercase
                  tracking-[0.10em]
                  text-slate-600
                "
              >
                OBJECT TRACKING
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            aria-label="Close space objects panel"
            className="
              flex
              h-7
              w-7
              shrink-0
              items-center
              justify-center
              rounded-md
              border
              border-transparent
              text-slate-600
              transition-all
              hover:border-cyan-400/10
              hover:bg-white/[0.035]
              hover:text-slate-200
              focus-visible:outline-none
              focus-visible:ring-1
              focus-visible:ring-cyan-400/60
            "
          >
            <FiX
              className="h-3.5 w-3.5"
              strokeWidth={1.5}
            />
          </button>
        </header>

        {/* ================================================================
            SCROLLABLE CONTENT
            ================================================================ */}

        <div
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
          {/* ==============================================================
              COUNTS
              ============================================================== */}

          <section
            aria-label="Space object counts"
            className="
              grid
              grid-cols-2
              gap-px
              border-b
              border-cyan-400/[0.07]
              bg-cyan-400/[0.035]
            "
          >
            <div
              className="
                bg-[#020b14]/95
                px-3
                py-2.5
              "
            >
              <div
                className="
                  flex
                  items-center
                  gap-2
                "
              >
                <FiRadio
                  className="
                    h-3
                    w-3
                    text-cyan-400
                  "
                  strokeWidth={1.5}
                  aria-hidden="true"
                />

                <span
                  className="
                    font-['Inter']
                    text-[8px]
                    font-medium
                    uppercase
                    tracking-[0.06em]
                    text-slate-600
                  "
                >
                  SATELLITES
                </span>
              </div>

              <div
                className="
                  mt-1
                  font-['Orbitron']
                  text-lg
                  font-medium
                  tracking-[0.02em]
                  text-cyan-300
                "
              >
                {formatCount(
                  satelliteCount,
                )}
              </div>
            </div>

            <div
              className="
                bg-[#020b14]/95
                px-3
                py-2.5
              "
            >
              <div
                className="
                  flex
                  items-center
                  gap-2
                "
              >
                <FiAlertTriangle
                  className="
                    h-3
                    w-3
                    text-amber-400
                  "
                  strokeWidth={1.5}
                  aria-hidden="true"
                />

                <span
                  className="
                    font-['Inter']
                    text-[8px]
                    font-medium
                    uppercase
                    tracking-[0.06em]
                    text-slate-600
                  "
                >
                  DEBRIS
                </span>
              </div>

              <div
                className="
                  mt-1
                  font-['Orbitron']
                  text-lg
                  font-medium
                  tracking-[0.02em]
                  text-amber-300
                "
              >
                {formatCount(
                  debrisCount,
                )}
              </div>
            </div>
          </section>

          {/* ==============================================================
              DISPLAY OPTIONS
              ============================================================== */}

          <section
            aria-labelledby="display-options-title"
            className="
              border-b
              border-cyan-400/[0.07]
              px-2.5
              py-2.5
            "
          >
            <div
              className="
                mb-1.5
                flex
                items-center
                justify-between
                px-2
              "
            >
              <h3
                id="display-options-title"
                className="
                  font-['Orbitron']
                  text-[7px]
                  font-medium
                  uppercase
                  tracking-[0.12em]
                  text-slate-600
                "
              >
                DISPLAY OPTIONS
              </h3>

              <FiSliders
                className="
                  h-3
                  w-3
                  text-slate-700
                "
                strokeWidth={1.5}
                aria-hidden="true"
              />
            </div>

            <div className="space-y-0.5">
              <DisplayToggle
                label="Satellite markers"
                enabled={
                  effectiveDisplayOptions.satellites
                }
                color="cyan"
                onChange={(value) =>
                  handleDisplayOptionChange(
                    "satellites",
                    value,
                  )
                }
              />

              <DisplayToggle
                label="Debris markers"
                enabled={
                  effectiveDisplayOptions.debris
                }
                color="amber"
                onChange={(value) =>
                  handleDisplayOptionChange(
                    "debris",
                    value,
                  )
                }
              />

              <DisplayToggle
                label="Orbital trails"
                enabled={
                  effectiveDisplayOptions.orbitalTrails
                }
                color="cyan"
                onChange={(value) =>
                  handleDisplayOptionChange(
                    "orbitalTrails",
                    value,
                  )
                }
              />

              <DisplayToggle
                label="Atmosphere"
                enabled={
                  effectiveDisplayOptions.atmosphere
                }
                color="cyan"
                onChange={(value) =>
                  handleDisplayOptionChange(
                    "atmosphere",
                    value,
                  )
                }
              />
            </div>
          </section>

          {/* ==============================================================
              FILTER
              ============================================================== */}

          <section
            aria-labelledby="filter-title"
            className="
              border-b
              border-cyan-400/[0.07]
              px-2.5
              py-2.5
            "
          >
            <div
              className="
                mb-1.5
                flex
                items-center
                justify-between
                px-2
              "
            >
              <h3
                id="filter-title"
                className="
                  font-['Orbitron']
                  text-[7px]
                  font-medium
                  uppercase
                  tracking-[0.12em]
                  text-slate-600
                "
              >
                OBJECT FILTER
              </h3>

              <FiFilter
                className="
                  h-3
                  w-3
                  text-slate-700
                "
                strokeWidth={1.5}
                aria-hidden="true"
              />
            </div>

            <ObjectFilter
              value={activeFilter}
              onChange={
                handleFilterChange
              }
            />
          </section>

          {/* ==============================================================
              OBJECT LIST
              ============================================================== */}

          <section
            aria-label="Space object list"
            className="px-0 py-1"
          >
            <div
              className="
                flex
                items-center
                justify-between
                px-3
                py-2
              "
            >
              <span
                className="
                  font-['Orbitron']
                  text-[7px]
                  uppercase
                  tracking-[0.12em]
                  text-slate-600
                "
              >
                TRACKED OBJECTS
              </span>

              <span
                className="
                  rounded
                  border
                  border-cyan-400/10
                  bg-cyan-400/[0.035]
                  px-1.5
                  py-0.5
                  font-['Orbitron']
                  text-[7px]
                  text-cyan-400/70
                "
              >
                {filteredObjects.length}
              </span>
            </div>

            {filteredObjects.length >
            0 ? (
              <div>
                {filteredObjects.map(
                  (object, index) => {
                    const objectId =
                      getObjectId(
                        object,
                      );

                    return (
                      <ObjectRow
                        key={
                          objectId ??
                          `${object?.name ?? "object"}-${index}`
                        }
                        object={object}
                        selected={
                          String(
                            selectedObjectId ??
                              "",
                          ) ===
                          String(
                            objectId ??
                              "",
                          )
                        }
                        onSelect={
                          onObjectSelect
                        }
                      />
                    );
                  },
                )}
              </div>
            ) : (
              <div
                className="
                  flex
                  min-h-[110px]
                  flex-col
                  items-center
                  justify-center
                  px-5
                  text-center
                "
              >
                <div
                  className="
                    flex
                    h-8
                    w-8
                    items-center
                    justify-center
                    rounded-full
                    border
                    border-slate-800
                    bg-slate-900/50
                  "
                >
                  <FiCircle
                    className="
                      h-3.5
                      w-3.5
                      text-slate-700
                    "
                    strokeWidth={1.5}
                  />
                </div>

                <p
                  className="
                    mt-2
                    font-['Inter']
                    text-[9px]
                    text-slate-600
                  "
                >
                  No objects match
                  the current
                  filter.
                </p>
              </div>
            )}
          </section>
        </div>

        {/* ================================================================
            FOOTER
            ================================================================ */}

        {preview && (
          <footer
            className="
              flex
              shrink-0
              items-center
              justify-between
              border-t
              border-cyan-400/[0.07]
              bg-cyan-400/[0.018]
              px-3
              py-2
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
              <span
                className="
                  relative
                  flex
                  h-1.5
                  w-1.5
                  shrink-0
                "
              >
                <span
                  className="
                    absolute
                    inset-0
                    animate-ping
                    rounded-full
                    bg-cyan-400/40
                  "
                />

                <FiCircle
                  className="
                    relative
                    h-1.5
                    w-1.5
                    fill-cyan-400/80
                    text-cyan-400
                  "
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
              </span>

              <span
                className="
                  truncate
                  font-['Orbitron']
                  text-[6px]
                  font-medium
                  uppercase
                  tracking-[0.10em]
                  text-cyan-400/55
                "
              >
                UI PREVIEW
              </span>
            </div>

            <span
              className="
                shrink-0
                font-['Inter']
                text-[7px]
                uppercase
                tracking-[0.05em]
                text-slate-700
              "
            >
              DATA SIM
            </span>
          </footer>
        )}
      </aside>
    </>
  );
};

export default SpaceObjectsPanel;