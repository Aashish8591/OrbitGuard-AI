import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  FiAlertTriangle,
  FiChevronRight,
  FiCircle,
  FiFilter,
  FiLayers,
  FiRadio,
  FiSearch,
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
 * - local object search
 * - search recommendations
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
 * Visualization.jsx owns:
 * - backend data loading
 * - panel position
 * - selection state
 * - camera / scene actions
 * - visualization configuration
 *
 * IMPORTANT
 * ----------------------------------------------------------------------------
 *
 * Search remains completely local against the already-loaded backend dataset.
 *
 * Search recommendations are rendered as a compact scrollable autocomplete
 * viewport. This allows thousands of matches to remain searchable without
 * rendering thousands of DOM nodes simultaneously.
 *
 * ============================================================================
 */

/* ============================================================================
 * CONSTANTS
 * ========================================================================== */

const DEFAULT_DISPLAY_OPTIONS = Object.freeze({
  satellites: true,
  debris: true,
  orbitalTrails: true,
  atmosphere: true,
});

/**
 * Maximum number of normal tracked-object rows rendered.
 */
const MAX_VISIBLE_LIST_ITEMS = 100;

/**
 * Search result virtualization.
 *
 * The UI visually shows roughly three rows, while the user can scroll through
 * the complete matching dataset.
 */
const SEARCH_ROW_HEIGHT = 54;
const SEARCH_VIEWPORT_HEIGHT = 168;
const SEARCH_OVERSCAN = 3;

/**
 * Maximum search text ranking score.
 */
const SEARCH_SCORE = Object.freeze({
  EXACT_NAME: 1000,
  NAME_STARTS_WITH: 850,
  NAME_CONTAINS: 700,
  EXACT_IDENTIFIER: 950,
  IDENTIFIER_STARTS_WITH: 800,
  IDENTIFIER_CONTAINS: 650,
  GENERIC_CONTAINS: 300,
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

/**
 * Normalize object type.
 */
const normalizeObjectType = (value) =>
  String(value ?? "")
    .trim()
    .toUpperCase();

/**
 * Normalize risk level.
 */
const normalizeRiskLevel = (value) =>
  String(value ?? "")
    .trim()
    .toUpperCase();

/**
 * Resolve the common object identifier.
 *
 * Supports the current backend contract plus compatible field names.
 */
const getObjectId = (object) =>
  object?.noradId ??
  object?.noradID ??
  object?.noradCatalogId ??
  object?.id ??
  null;

/**
 * Resolve a human-readable object name.
 */
const getObjectName = (object) =>
  object?.name ??
  object?.satelliteName ??
  object?.debrisName ??
  object?.objectName ??
  "";

/**
 * Resolve searchable identifier text.
 */
const getObjectIdentifierText = (object) => {
  if (!object || typeof object !== "object") {
    return "";
  }

  const values = [
    object.noradId,
    object.noradID,
    object.noradCatalogId,
    object.noradNumber,

    object.satelliteCode,
    object.debrisCode,
    object.objectCode,
    object.code,

    object.id,
    object.objectId,
    object.satelliteId,
    object.debrisId,
    object._id,
  ];

  return values
    .filter(
      (value) =>
        value !== null &&
        value !== undefined &&
        value !== "",
    )
    .map((value) =>
      String(value)
        .trim()
        .toLowerCase(),
    )
    .join(" ");
};

/**
 * Build searchable text from fields already supplied by the backend.
 *
 * No backend request is made here.
 */
const getObjectSearchText = (object) => {
  if (!object || typeof object !== "object") {
    return "";
  }

  const values = [
    object.name,
    object.satelliteName,
    object.debrisName,
    object.objectName,

    object.satelliteCode,
    object.debrisCode,
    object.objectCode,
    object.code,

    object.noradId,
    object.noradID,
    object.noradCatalogId,
    object.noradNumber,

    object.id,
    object.objectId,
    object.satelliteId,
    object.debrisId,
    object._id,
  ];

  return values
    .filter(
      (value) =>
        value !== null &&
        value !== undefined &&
        value !== "",
    )
    .map((value) =>
      String(value)
        .trim()
        .toLowerCase(),
    )
    .join(" ");
};

/**
 * Calculate search relevance.
 *
 * This prevents the first three records in the backend dataset from always
 * becoming the recommendations.
 */
const getSearchScore = (object, query) => {
  if (!object || !query) {
    return 0;
  }

  const normalizedQuery = String(query)
    .trim()
    .toLowerCase();

  if (!normalizedQuery) {
    return 0;
  }

  const name = getObjectName(object)
    .trim()
    .toLowerCase();

  const identifier = getObjectIdentifierText(object);

  const searchableText = getObjectSearchText(object);

  if (name === normalizedQuery) {
    return SEARCH_SCORE.EXACT_NAME;
  }

  if (identifier === normalizedQuery) {
    return SEARCH_SCORE.EXACT_IDENTIFIER;
  }

  if (
    identifier
      .split(" ")
      .some((value) => value === normalizedQuery)
  ) {
    return SEARCH_SCORE.EXACT_IDENTIFIER;
  }

  if (name.startsWith(normalizedQuery)) {
    return SEARCH_SCORE.NAME_STARTS_WITH;
  }

  if (identifier.startsWith(normalizedQuery)) {
    return SEARCH_SCORE.IDENTIFIER_STARTS_WITH;
  }

  if (name.includes(normalizedQuery)) {
    return SEARCH_SCORE.NAME_CONTAINS;
  }

  if (identifier.includes(normalizedQuery)) {
    return SEARCH_SCORE.IDENTIFIER_CONTAINS;
  }

  if (searchableText.includes(normalizedQuery)) {
    return SEARCH_SCORE.GENERIC_CONTAINS;
  }

  return 0;
};

/**
 * Format numeric values for the UI.
 */
const formatCount = (value) => {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "—";
  }

  return number.toLocaleString("en-US");
};

/* ============================================================================
 * OBJECT VISUAL STATE
 * ========================================================================== */

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
      glow: "shadow-[0_0_9px_rgba(248,113,113,0.75)]",
      text: "text-red-200",
      badge: "text-red-300",
      border: "border-red-400/20",
      background: "bg-red-400/[0.045]",
    };
  }

  if (risk === "MEDIUM") {
    return {
      dot: "bg-amber-400",
      glow: "shadow-[0_0_8px_rgba(251,191,36,0.65)]",
      text: "text-amber-100",
      badge: "text-amber-300",
      border: "border-amber-400/15",
      background: "bg-amber-400/[0.025]",
    };
  }

  if (type === "DEBRIS") {
    return {
      dot: "bg-amber-400",
      glow: "shadow-[0_0_8px_rgba(251,191,36,0.5)]",
      text: "text-amber-100",
      badge: "text-amber-300",
      border: "border-amber-400/[0.10]",
      background: "bg-amber-400/[0.02]",
    };
  }

  return {
    dot: "bg-cyan-400",
    glow: "shadow-[0_0_8px_rgba(34,211,238,0.6)]",
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
        const active = value === option.value;

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
 * SEARCH RECOMMENDATION ROW
 * ========================================================================== */

const SearchRecommendationRow = ({
  object,
  onSelect,
  highlighted = false,
}) => {
  const visualState =
    getObjectVisualState(object);

  const type = normalizeObjectType(
    object?.objectType ??
      object?.type ??
      object?.object_type,
  );

  const objectId = getObjectId(object);

  const objectName =
    getObjectName(object) ||
    "UNKNOWN OBJECT";

  const isDebris = type === "DEBRIS";

  return (
    <button
      type="button"
      onClick={() => onSelect?.(object)}
      className={`
        group
        flex
        h-[54px]
        w-full
        items-center
        gap-2.5
        border-b
        border-cyan-400/[0.06]
        px-3
        text-left
        transition-all
        duration-150
        last:border-b-0
        focus-visible:outline-none
        ${
          highlighted
            ? "bg-cyan-400/[0.075]"
            : "hover:bg-cyan-400/[0.055]"
        }
      `}
    >
      <span
        className={`
          flex
          h-6
          w-6
          shrink-0
          items-center
          justify-center
          rounded-md
          border
          ${
            isDebris
              ? "border-amber-400/15 bg-amber-400/[0.04] text-amber-300"
              : "border-cyan-400/15 bg-cyan-400/[0.04] text-cyan-300"
          }
        `}
      >
        {isDebris ? (
          <FiAlertTriangle
            className="h-3 w-3"
            strokeWidth={1.5}
          />
        ) : (
          <FiRadio
            className="h-3 w-3"
            strokeWidth={1.5}
          />
        )}
      </span>

      <span className="min-w-0 flex-1">
        <span
          className="
            block
            truncate
            font-['Orbitron']
            text-[8px]
            font-medium
            uppercase
            tracking-[0.035em]
            text-slate-200
            transition-colors
            group-hover:text-cyan-100
          "
          title={objectName}
        >
          {objectName}
        </span>

        <span
          className="
            mt-1
            flex
            min-w-0
            items-center
            gap-1.5
            font-['Inter']
            text-[7px]
            text-slate-600
          "
        >
          <span className="shrink-0">
            NORAD {objectId ?? "—"}
          </span>

          <span
            className="
              h-0.5
              w-0.5
              shrink-0
              rounded-full
              bg-slate-700
            "
          />

          <span
            className={`
              truncate
              ${visualState.badge}
            `}
          >
            {type || "UNKNOWN"}
          </span>
        </span>
      </span>

      <FiChevronRight
        className="
          h-3.5
          w-3.5
          shrink-0
          text-slate-700
          transition-all
          duration-150
          group-hover:translate-x-0.5
          group-hover:text-cyan-300
        "
        strokeWidth={1.5}
      />
    </button>
  );
};

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
    getObjectName(object) ||
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

      <span className="min-w-0 flex-1">
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
  objects = [],
  counts,
  displayOptions,
  onDisplayOptionChange,
  filter,
  onFilterChange,
  selectedObjectId = null,
  onObjectSelect,

  /**
   * IMPORTANT:
   *
   * Visualization.jsx should connect this callback to its existing camera
   * focus action.
   *
   * The panel itself never touches Three.js or the camera.
   */
  onFocusObject,

  open = true,
  onClose,
  preview = false,
  className = "",
}) => {
  /* --------------------------------------------------------------------------
   * LOCAL DISPLAY STATE
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
   * LOCAL FILTER STATE
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
   * SEARCH STATE
   * ------------------------------------------------------------------------ */

  const [searchQuery, setSearchQuery] =
    useState("");

  const [
    highlightedSearchIndex,
    setHighlightedSearchIndex,
  ] = useState(0);

  const [
    searchScrollTop,
    setSearchScrollTop,
  ] = useState(0);

  const searchViewportRef =
    useRef(null);

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

        onDisplayOptionChange?.(
          option,
          Boolean(enabled),
        );

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
              option.value === nextFilter,
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
      [filter, onFilterChange],
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
   * CLASSIFICATION + SEARCH INDEX
   * ------------------------------------------------------------------------ */

  const classifiedObjects =
    useMemo(
      () =>
        normalizedObjects.map(
          (object) => ({
            object,

            type:
              normalizeObjectType(
                object?.objectType ??
                  object?.type ??
                  object?.object_type,
              ),

            searchText:
              getObjectSearchText(
                object,
              ),
          }),
        ),
      [normalizedObjects],
    );

  /* --------------------------------------------------------------------------
   * SEARCH QUERY
   * ------------------------------------------------------------------------ */

  const normalizedSearchQuery =
    searchQuery
      .trim()
      .toLowerCase();

  const isSearching =
    normalizedSearchQuery.length > 0;

  /* --------------------------------------------------------------------------
   * SEARCH
   *
   * Results are ranked instead of simply taking the first three backend
   * records.
   * ------------------------------------------------------------------------ */

  const searchedObjects =
    useMemo(() => {
      if (!normalizedSearchQuery) {
        return classifiedObjects;
      }

      const matches = classifiedObjects
        .filter(({ searchText }) =>
          searchText.includes(
            normalizedSearchQuery,
          ),
        )
        .map((entry) => ({
          ...entry,
          searchScore: getSearchScore(
            entry.object,
            normalizedSearchQuery,
          ),
        }));

      matches.sort((a, b) => {
        if (
          b.searchScore !==
          a.searchScore
        ) {
          return (
            b.searchScore -
            a.searchScore
          );
        }

        const nameA =
          getObjectName(a.object)
            .toLowerCase();

        const nameB =
          getObjectName(b.object)
            .toLowerCase();

        return nameA.localeCompare(
          nameB,
        );
      });

      return matches;
    }, [
      classifiedObjects,
      normalizedSearchQuery,
    ]);

  /* --------------------------------------------------------------------------
   * TYPE FILTER
   * ------------------------------------------------------------------------ */

  const filteredObjects =
    useMemo(() => {
      if (activeFilter === "ALL") {
        return searchedObjects;
      }

      return searchedObjects.filter(
        ({ type }) =>
          type === activeFilter,
      );
    }, [
      activeFilter,
      searchedObjects,
    ]);

  /* --------------------------------------------------------------------------
   * RESET SEARCH SCROLL WHEN QUERY/FILTER CHANGES
   * ------------------------------------------------------------------------ */

  useEffect(() => {
    setSearchScrollTop(0);
    setHighlightedSearchIndex(0);

    if (searchViewportRef.current) {
      searchViewportRef.current.scrollTop = 0;
    }
  }, [
    normalizedSearchQuery,
    activeFilter,
  ]);

  /* --------------------------------------------------------------------------
   * SEARCH VIRTUALIZATION
   *
   * Example:
   *
   * 536 matches
   *
   * Only approximately 9 rows are actually mounted:
   *
   * visible rows + overscan.
   *
   * The scrollbar still represents all 536 results.
   * ------------------------------------------------------------------------ */

  const virtualSearchWindow =
    useMemo(() => {
      if (!isSearching) {
        return {
          start: 0,
          end: 0,
          totalHeight: 0,
        };
      }

      const total =
        filteredObjects.length;

      const visibleCount =
        Math.ceil(
          SEARCH_VIEWPORT_HEIGHT /
            SEARCH_ROW_HEIGHT,
        );

      const rawStart = Math.floor(
        searchScrollTop /
          SEARCH_ROW_HEIGHT,
      );

      const start = Math.max(
        0,
        rawStart -
          SEARCH_OVERSCAN,
      );

      const end = Math.min(
        total,
        rawStart +
          visibleCount +
          SEARCH_OVERSCAN * 2,
      );

      return {
        start,
        end,
        totalHeight:
          total * SEARCH_ROW_HEIGHT,
      };
    }, [
      filteredObjects.length,
      isSearching,
      searchScrollTop,
    ]);

  const visibleSearchObjects =
    useMemo(() => {
      if (!isSearching) {
        return [];
      }

      return filteredObjects.slice(
        virtualSearchWindow.start,
        virtualSearchWindow.end,
      );
    }, [
      filteredObjects,
      isSearching,
      virtualSearchWindow.start,
      virtualSearchWindow.end,
    ]);

  /* --------------------------------------------------------------------------
   * COUNTS
   * ------------------------------------------------------------------------ */

  const calculatedCounts =
    useMemo(() => {
      let satellites = 0;
      let debris = 0;

      for (const { type } of classifiedObjects) {
        if (type === "SATELLITE") {
          satellites += 1;
        } else if (type === "DEBRIS") {
          debris += 1;
        }
      }

      return {
        satellites,
        debris,
      };
    }, [classifiedObjects]);

  const satelliteCount =
    counts?.satellites ??
    calculatedCounts.satellites;

  const debrisCount =
    counts?.debris ??
    calculatedCounts.debris;

  /* --------------------------------------------------------------------------
   * NORMAL LIST
   * ------------------------------------------------------------------------ */

  const visibleObjects =
    useMemo(() => {
      if (
        filteredObjects.length <=
        MAX_VISIBLE_LIST_ITEMS
      ) {
        return filteredObjects;
      }

      const selectedIndex =
        selectedObjectId === null ||
        selectedObjectId === undefined
          ? -1
          : filteredObjects.findIndex(
              ({ object }) =>
                String(
                  getObjectId(
                    object,
                  ) ?? "",
                ) ===
                String(
                  selectedObjectId,
                ),
            );

      const visible =
        filteredObjects.slice(
          0,
          MAX_VISIBLE_LIST_ITEMS,
        );

      if (
        selectedIndex < 0 ||
        selectedIndex <
          MAX_VISIBLE_LIST_ITEMS
      ) {
        return visible;
      }

      visible[
        MAX_VISIBLE_LIST_ITEMS - 1
      ] =
        filteredObjects[
          selectedIndex
        ];

      return visible;
    }, [
      filteredObjects,
      selectedObjectId,
    ]);

  /* --------------------------------------------------------------------------
   * SEARCH CLEAR
   * ------------------------------------------------------------------------ */

  const handleClearSearch =
    useCallback(() => {
      setSearchQuery("");
      setSearchScrollTop(0);
      setHighlightedSearchIndex(0);

      if (searchViewportRef.current) {
        searchViewportRef.current.scrollTop = 0;
      }
    }, []);

  /* --------------------------------------------------------------------------
   * SEARCH SCROLL
   * ------------------------------------------------------------------------ */

  const handleSearchScroll =
    useCallback((event) => {
      setSearchScrollTop(
        event.currentTarget.scrollTop,
      );
    }, []);

  /* --------------------------------------------------------------------------
   * SEARCH KEYBOARD CONTROL
   *
   * Arrow Up / Arrow Down:
   * navigate recommendations.
   *
   * Enter:
   * select highlighted object.
   *
   * Escape:
   * clear search.
   * ------------------------------------------------------------------------ */

  const handleSearchKeyDown =
    useCallback(
      (event) => {
        if (!isSearching) {
          return;
        }

        const resultCount =
          filteredObjects.length;

        if (resultCount === 0) {
          if (event.key === "Escape") {
            event.preventDefault();
            handleClearSearch();
          }

          return;
        }

        if (event.key === "ArrowDown") {
          event.preventDefault();

          setHighlightedSearchIndex(
            (current) =>
              Math.min(
                current + 1,
                resultCount - 1,
              ),
          );

          return;
        }

        if (event.key === "ArrowUp") {
          event.preventDefault();

          setHighlightedSearchIndex(
            (current) =>
              Math.max(
                current - 1,
                0,
              ),
          );

          return;
        }

        if (event.key === "Enter") {
          event.preventDefault();

          const selected =
            filteredObjects[
              highlightedSearchIndex
            ]?.object;

          if (selected) {
            handleSearchSuggestionSelect(
              selected,
            );
          }

          return;
        }

        if (event.key === "Escape") {
          event.preventDefault();
          handleClearSearch();
        }
      },
      [
        filteredObjects,
        handleClearSearch,
        highlightedSearchIndex,
        isSearching,
      ],
    );

  /* --------------------------------------------------------------------------
   * KEEP HIGHLIGHTED SEARCH RESULT VISIBLE
   * ------------------------------------------------------------------------ */

  useEffect(() => {
    if (!isSearching) {
      return;
    }

    const index =
      highlightedSearchIndex;

    const currentTop =
      index * SEARCH_ROW_HEIGHT;

    const currentBottom =
      currentTop + SEARCH_ROW_HEIGHT;

    const viewport =
      searchViewportRef.current;

    if (!viewport) {
      return;
    }

    const viewportTop =
      viewport.scrollTop;

    const viewportBottom =
      viewportTop +
      SEARCH_VIEWPORT_HEIGHT;

    if (currentTop < viewportTop) {
      viewport.scrollTop = currentTop;
      return;
    }

    if (
      currentBottom >
      viewportBottom
    ) {
      viewport.scrollTop =
        currentBottom -
        SEARCH_VIEWPORT_HEIGHT;
    }
  }, [
    highlightedSearchIndex,
    isSearching,
  ]);

  /* --------------------------------------------------------------------------
   * SEARCH RESULT SELECT
   * ------------------------------------------------------------------------ */

  const handleSearchSuggestionSelect =
    useCallback(
      (object) => {
        if (!object) {
          return;
        }

        const objectId =
          getObjectId(object);

        if (import.meta.env.DEV) {
          console.debug(
            "[OrbitGuard Space Objects] Search result selected.",
            {
              objectId,
              name:
                getObjectName(object),
              type:
                normalizeObjectType(
                  object?.objectType ??
                    object?.type ??
                    object?.object_type,
                ),
            },
          );
        }

        /**
         * Normal selection flow.
         *
         * Visualization.jsx receives the exact backend object.
         */
        onObjectSelect?.(object);

        /**
         * Camera focus flow.
         *
         * This is intentionally optional because this panel does not own
         * Three.js or the camera.
         *
         * Visualization.jsx should connect this callback to the existing
         * cameraActionsRef.current.focusObject(...) bridge.
         */
        onFocusObject?.(object);

        /**
         * Close autocomplete after selecting the object.
         */
        setSearchQuery("");
        setSearchScrollTop(0);
        setHighlightedSearchIndex(0);

        if (searchViewportRef.current) {
          searchViewportRef.current.scrollTop = 0;
        }
      },
      [
        onFocusObject,
        onObjectSelect,
      ],
    );

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

  /* ==========================================================================
   * RENDER
   * ======================================================================== */

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
          sm:w-[360px]
          lg:w-[360px]
          lg:max-h-none
          xl:w-[380px]
          ${className}
        `}
      >
        {/* ====================================================================
            TOP ACCENT
            ==================================================================== */}

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

        {/* ====================================================================
            HEADER
            ==================================================================== */}

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

        {/* ====================================================================
            SCROLLABLE CONTENT
            ==================================================================== */}

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
          {/* ==================================================================
              SEARCH
              ================================================================== */}

          <section
            aria-labelledby="space-object-search-title"
            className="
              sticky
              top-0
              z-[60]
              border-b
              border-cyan-400/[0.07]
              bg-[#020b14]/[0.97]
              px-3
              py-2.5
              backdrop-blur-xl
            "
          >
            <div
              className="
                mb-1.5
                flex
                items-center
                justify-between
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
                <FiSearch
                  className="
                    h-3
                    w-3
                    shrink-0
                    text-cyan-400
                  "
                  strokeWidth={1.5}
                  aria-hidden="true"
                />

                <h3
                  id="space-object-search-title"
                  className="
                    truncate
                    font-['Orbitron']
                    text-[7px]
                    font-medium
                    uppercase
                    tracking-[0.11em]
                    text-slate-600
                  "
                >
                  SEARCH OBJECTS
                </h3>
              </div>

              {isSearching && (
                <span
                  className="
                    shrink-0
                    font-['Orbitron']
                    text-[7px]
                    text-cyan-400/70
                  "
                >
                  {formatCount(
                    filteredObjects.length,
                  )}
                </span>
              )}
            </div>

            {/* ================================================================
                INPUT + DROPDOWN ANCHOR
                ================================================================ */}

            <div className="relative z-[70]">
              <div
                className="
                  relative
                  z-[70]
                  flex
                  h-10
                  items-center
                  gap-2
                  rounded-lg
                  border
                  border-cyan-400/[0.08]
                  bg-[#020914]
                  px-2.5
                  transition-all
                  duration-200
                  focus-within:border-cyan-400/20
                  focus-within:bg-[#03101c]
                  focus-within:shadow-[0_0_18px_rgba(34,211,238,0.04)]
                "
              >
                <FiSearch
                  className="
                    h-3
                    w-3
                    shrink-0
                    text-slate-600
                  "
                  strokeWidth={1.5}
                  aria-hidden="true"
                />

                <input
                  type="text"
                  value={searchQuery}
                  onChange={(event) =>
                    setSearchQuery(
                      event.target.value,
                    )
                  }
                  onKeyDown={
                    handleSearchKeyDown
                  }
                  placeholder="Search by name or NORAD ID"
                  autoComplete="off"
                  spellCheck={false}
                  aria-label="Search space objects by name or NORAD ID"
                  aria-expanded={
                    isSearching
                  }
                  className="
                    min-w-0
                    flex-1
                    bg-transparent
                    font-['Inter']
                    text-[10px]
                    text-slate-200
                    outline-none
                    placeholder:text-slate-700
                  "
                />

                {searchQuery && (
                  <button
                    type="button"
                    onClick={
                      handleClearSearch
                    }
                    aria-label="Clear object search"
                    className="
                      flex
                      h-5
                      w-5
                      shrink-0
                      items-center
                      justify-center
                      rounded
                      text-slate-600
                      transition
                      hover:bg-white/[0.04]
                      hover:text-slate-300
                      focus-visible:outline-none
                      focus-visible:ring-1
                      focus-visible:ring-cyan-400/60
                    "
                  >
                    <FiX
                      className="h-3 w-3"
                      strokeWidth={1.5}
                    />
                  </button>
                )}
              </div>

              {/* ==============================================================
                  SEARCH DROPDOWN
                  ============================================================== */}

              {isSearching && (
                <div
                  className="
                    absolute
                    left-0
                    right-0
                    top-[calc(100%+6px)]
                    z-[100]
                    overflow-hidden
                    rounded-lg
                    border
                    border-cyan-400/[0.16]
                    bg-[#03101c]/[0.985]
                    shadow-[0_18px_45px_rgba(0,0,0,0.65)]
                    backdrop-blur-xl
                  "
                  role="listbox"
                  aria-label="Search recommendations"
                >
                  {/* ==========================================================
                      DROPDOWN HEADER
                      ========================================================== */}

                  <div
                    className="
                      flex
                      h-[29px]
                      items-center
                      justify-between
                      border-b
                      border-cyan-400/[0.07]
                      bg-cyan-400/[0.025]
                      px-3
                    "
                  >
                    <span
                      className="
                        font-['Orbitron']
                        text-[6px]
                        uppercase
                        tracking-[0.12em]
                        text-slate-600
                      "
                    >
                      SEARCH RECOMMENDATIONS
                    </span>

                    <span
                      className="
                        font-['Inter']
                        text-[6px]
                        uppercase
                        tracking-[0.05em]
                        text-slate-700
                      "
                    >
                      {formatCount(
                        filteredObjects.length,
                      )}{" "}
                      MATCHES
                    </span>
                  </div>

                  {/* ==========================================================
                      VIRTUALIZED SEARCH RESULT VIEWPORT
                      ========================================================== */}

                  {filteredObjects.length > 0 ? (
                    <div
                      ref={
                        searchViewportRef
                      }
                      onScroll={
                        handleSearchScroll
                      }
                      className="
                        relative
                        overflow-y-auto
                        overscroll-contain
                        scrollbar-thin
                        scrollbar-track-transparent
                        scrollbar-thumb-cyan-400/15
                      "
                      style={{
                        height:
                          SEARCH_VIEWPORT_HEIGHT,
                      }}
                    >
                      <div
                        className="
                          relative
                          w-full
                        "
                        style={{
                          height:
                            virtualSearchWindow.totalHeight,
                        }}
                      >
                        {visibleSearchObjects.map(
                          (
                            {
                              object,
                            },
                            localIndex,
                          ) => {
                            const absoluteIndex =
                              virtualSearchWindow.start +
                              localIndex;

                            const objectId =
                              getObjectId(
                                object,
                              );

                            return (
                              <div
                                key={
                                  objectId ??
                                  `${getObjectName(
                                    object,
                                  )}-${absoluteIndex}`
                                }
                                className="
                                  absolute
                                  left-0
                                  right-0
                                "
                                style={{
                                  top:
                                    absoluteIndex *
                                    SEARCH_ROW_HEIGHT,
                                  height:
                                    SEARCH_ROW_HEIGHT,
                                }}
                              >
                                <SearchRecommendationRow
                                  object={
                                    object
                                  }
                                  highlighted={
                                    absoluteIndex ===
                                    highlightedSearchIndex
                                  }
                                  onSelect={
                                    handleSearchSuggestionSelect
                                  }
                                />
                              </div>
                            );
                          },
                        )}
                      </div>
                    </div>
                  ) : (
                    <div
                      className="
                        flex
                        h-[120px]
                        flex-col
                        items-center
                        justify-center
                        px-4
                        text-center
                      "
                    >
                      <FiSearch
                        className="
                          h-3.5
                          w-3.5
                          text-slate-700
                        "
                        strokeWidth={1.5}
                      />

                      <p
                        className="
                          mt-1.5
                          font-['Inter']
                          text-[8px]
                          text-slate-600
                        "
                      >
                        No matching objects
                      </p>

                      <p
                        className="
                          mt-1
                          font-['Inter']
                          text-[7px]
                          text-slate-700
                        "
                      >
                        Try another name or
                        NORAD ID
                      </p>
                    </div>
                  )}

                  {/* ==========================================================
                      DROPDOWN FOOTER
                      ========================================================== */}

                  {filteredObjects.length >
                    3 && (
                    <div
                      className="
                        flex
                        h-[25px]
                        items-center
                        justify-center
                        border-t
                        border-cyan-400/[0.06]
                        bg-cyan-400/[0.018]
                      "
                    >
                      <span
                        className="
                          font-['Inter']
                          text-[6px]
                          uppercase
                          tracking-[0.05em]
                          text-slate-700
                        "
                      >
                        {formatCount(
                          filteredObjects.length -
                            3,
                        )}{" "}
                        MORE MATCHES · SCROLL
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <p
              className="
                mt-1.5
                px-0.5
                font-['Inter']
                text-[6px]
                uppercase
                tracking-[0.05em]
                text-slate-700
              "
            >
              NAME AND NORAD ID SEARCH
            </p>
          </section>

          {/* ==================================================================
              COUNTS
              ================================================================== */}

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

          {/* ==================================================================
              DISPLAY OPTIONS
              ================================================================== */}

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

          {/* ==================================================================
              OBJECT FILTER
              ================================================================== */}

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

          {/* ==================================================================
              NORMAL OBJECT LIST

              Hidden while searching because the autocomplete owns the search
              interaction.
              ================================================================== */}

          {!isSearching && (
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
                  {formatCount(
                    filteredObjects.length,
                  )}
                </span>
              </div>

              {filteredObjects.length > 0 ? (
                <>
                  <div>
                    {visibleObjects.map(
                      (
                        { object },
                        index,
                      ) => {
                        const objectId =
                          getObjectId(
                            object,
                          );

                        return (
                          <ObjectRow
                            key={
                              objectId ??
                              `${getObjectName(
                                object,
                              ) || "object"}-${index}`
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

                  {filteredObjects.length >
                    MAX_VISIBLE_LIST_ITEMS && (
                    <div
                      className="
                        border-t
                        border-cyan-400/[0.045]
                        px-3
                        py-2.5
                        text-center
                      "
                    >
                      <p
                        className="
                          font-['Inter']
                          text-[7px]
                          leading-relaxed
                          text-slate-600
                        "
                      >
                        Showing{" "}
                        <span className="text-cyan-400/70">
                          {formatCount(
                            visibleObjects.length,
                          )}
                        </span>{" "}
                        of{" "}
                        <span className="text-slate-500">
                          {formatCount(
                            filteredObjects.length,
                          )}
                        </span>{" "}
                        tracked objects
                      </p>

                      <p
                        className="
                          mt-1
                          font-['Inter']
                          text-[6px]
                          uppercase
                          tracking-[0.05em]
                          text-slate-700
                        "
                      >
                        Refine search to locate a
                        specific NORAD object
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div
                  className="
                    flex
                    min-h-[125px]
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
                    <FiSearch
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
                    No objects match the
                    current filter.
                  </p>

                  <p
                    className="
                      mt-1
                      font-['Inter']
                      text-[8px]
                      text-slate-700
                    "
                  >
                    Try another object filter
                  </p>
                </div>
              )}
            </section>
          )}
        </div>

        {/* ====================================================================
            FOOTER
            ==================================================================== */}

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