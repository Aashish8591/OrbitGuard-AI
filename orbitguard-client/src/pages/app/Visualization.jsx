import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { motion, useReducedMotion } from "framer-motion";

import VisualizationScene from "../../features/visualization/components/VisualizationScene";
import VisualizationTopStatus from "../../features/visualization/components/VisualizationTopStatus";
import SpaceObjectsPanel from "../../features/visualization/components/SpaceObjectsPanel";
import ObjectInspector from "../../features/visualization/components/ObjectInspector";
import VisualizationLegend from "../../features/visualization/components/VisualizationLegend";
import CameraControls from "../../features/visualization/components/CameraControls";

import { getAllVisualizationObjects } from "../../services/visualizationService";

/**
 * ============================================================================
 * OrbitGuard AI — 3D Visualization Command Center
 * ============================================================================
 *
 * PAGE RESPONSIBILITY
 * ----------------------------------------------------------------------------
 *
 * This page is the orchestration layer for the orbital visualization.
 *
 * It owns:
 *
 * - backend visualization data
 * - selection state
 * - filters
 * - display options
 * - timeline state
 * - camera actions
 * - responsive panel presentation
 * - visualization workspace layout
 *
 * It does NOT own:
 *
 * - orbital propagation
 * - SGP4
 * - Orekit
 * - collision calculations
 * - Three.js orbital calculations
 *
 * Backend remains the source of truth.
 *
 * ============================================================================
 *
 * PERFORMANCE ARCHITECTURE
 * ----------------------------------------------------------------------------
 *
 * Backend dataset:
 *
 *     16,619 satellites
 *     11,752 debris
 *     ----------------
 *     28,371 objects
 *
 * The complete dataset remains available in React state.
 *
 * VisualizationScene owns the 3D rendering budget.
 *
 * SpaceObjectsPanel owns the DOM rendering budget.
 *
 * ============================================================================
 *
 * MOBILE LAYOUT ARCHITECTURE
 * ----------------------------------------------------------------------------
 *
 * Mobile visualization:
 *
 *     1. VisualizationTopStatus
 *     2. 3D workspace
 *     3. Mobile interaction panels
 *
 * Object inspector:
 *
 *     - starts below the top status area
 *     - extends completely to the bottom of the viewport
 *     - uses full mobile width
 *
 * Space objects panel:
 *
 *     - starts below the top status area
 *     - keeps the bottom interaction-safe area
 *
 * ============================================================================
 */

/* ============================================================================
 * IN-FLIGHT BULK REQUEST CONTROL
 * ========================================================================== */

let inFlightVisualizationRequest = null;

/**
 * Start or reuse the currently running bulk visualization request.
 *
 * If a request is already running, callers share the same Promise.
 */
const requestVisualizationData = () => {
  if (inFlightVisualizationRequest) {
    if (import.meta.env.DEV) {
      console.info(
        "[OrbitGuard Visualization] Reusing existing in-flight bulk visualization request.",
      );
    }

    return inFlightVisualizationRequest;
  }

  if (import.meta.env.DEV) {
    console.info(
      "[OrbitGuard Visualization] Starting new bulk visualization request.",
    );
  }

  let request;

  try {
    request = getAllVisualizationObjects();
  } catch (error) {
    return Promise.reject(error);
  }

  inFlightVisualizationRequest = Promise.resolve(request).finally(() => {
    inFlightVisualizationRequest = null;
  });

  return inFlightVisualizationRequest;
};

/* ============================================================================
 * PAGE ANIMATION
 * ========================================================================== */

const VISUALIZATION_PAGE_VARIANTS = {
  hidden: {
    opacity: 0,
  },

  visible: {
    opacity: 1,
    transition: {
      duration: 0.45,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

/* ============================================================================
 * DEFAULTS
 * ========================================================================== */

const DEFAULT_DISPLAY_OPTIONS = Object.freeze({
  satellites: true,
  debris: true,
  orbitalTrails: true,
  atmosphere: true,
});

const VISUALIZATION_FILTERS = Object.freeze({
  ALL: "ALL",
  SATELLITE: "SATELLITE",
  DEBRIS: "DEBRIS",
});

const MOBILE_PANELS = Object.freeze({
  OBJECTS: "objects",
  INSPECTOR: "inspector",
});

const DEFAULT_TIMELINE_OFFSET = 0;
const DEFAULT_PLAYBACK_SPEED = 1;

/**
 * ============================================================================
 * MOBILE LAYOUT CONSTANTS
 * ============================================================================
 *
 * VisualizationTopStatus is rendered at top-3.
 *
 * The status component is visually taller than 68px on mobile.
 *
 * Therefore mobile controls/panels start below that region.
 *
 * IMPORTANT:
 *
 * The mobile objects panel and mobile inspector intentionally use different
 * bottom boundaries.
 *
 * OBJECTS:
 *     bottom-[72px]
 *
 * INSPECTOR:
 *     bottom-0
 *
 * This allows the inspector to reach the actual bottom of the visualization
 * viewport while the objects panel continues to preserve the lower interaction
 * area.
 */

const MOBILE_CONTENT_TOP_CLASS = "top-[96px]";

const MOBILE_OBJECTS_BOTTOM_CLASS = "bottom-[72px]";

const MOBILE_INSPECTOR_BOTTOM_CLASS = "bottom-0";

/* ============================================================================
 * HELPERS
 * ========================================================================== */

/**
 * Resolve the backend object type defensively.
 */
const getObjectType = (object) => {
  if (!object) {
    return "";
  }

  return String(
    object.objectType ?? object.type ?? object.object_type ?? "",
  )
    .trim()
    .toUpperCase();
};

/**
 * Resolve the backend NORAD identifier defensively.
 */
const getObjectId = (object) => {
  if (!object) {
    return null;
  }

  return (
    object.noradId ??
    object.noradID ??
    object.noradCatalogId ??
    object.id ??
    null
  );
};

/**
 * Normalize the visualization payload returned by the service.
 */
const normalizeVisualizationResponse = (response) => {
  if (Array.isArray(response)) {
    return {
      objects: response.filter(Boolean),
      propagatedAt: null,
    };
  }

  if (!response || typeof response !== "object") {
    return {
      objects: [],
      propagatedAt: null,
    };
  }

  const objects = Array.isArray(response.objects)
    ? response.objects.filter(Boolean)
    : [];

  return {
    objects,
    propagatedAt: response.propagatedAt ?? response.timestamp ?? null,
  };
};

/**
 * Calculate authoritative dataset counts.
 */
const calculateObjectCounts = (objects) => {
  let satellites = 0;
  let debris = 0;

  for (const object of objects) {
    const type = getObjectType(object);

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
};

/* ============================================================================
 * COMPONENT
 * ========================================================================== */

const Visualization = () => {
  const shouldReduceMotion = useReducedMotion();

  /* ==========================================================================
   * BACKEND DATA
   * ======================================================================== */

  const [objects, setObjects] = useState([]);
  const [dataEpoch, setDataEpoch] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  /* ==========================================================================
   * LOAD REAL BACKEND VISUALIZATION DATA
   * ======================================================================== */

  useEffect(() => {
    let active = true;

    const loadVisualizationObjects = async () => {
      try {
        setIsLoading(true);
        setLoadError(null);

        if (import.meta.env.DEV) {
          console.info(
            "[OrbitGuard Visualization] Loading real backend visualization data...",
          );
        }

        const response = await requestVisualizationData();

        if (!active) {
          return;
        }

        const normalized = normalizeVisualizationResponse(response);

        setObjects(normalized.objects);
        setDataEpoch(normalized.propagatedAt);

        if (import.meta.env.DEV) {
          const counts = calculateObjectCounts(normalized.objects);

          console.info(
            "[OrbitGuard Visualization] Backend visualization data loaded successfully.",
            {
              objectCount: normalized.objects.length,
              satellites: counts.satellites,
              debris: counts.debris,
              propagatedAt: normalized.propagatedAt,
            },
          );
        }
      } catch (error) {
        if (!active) {
          return;
        }

        console.error(
          "[OrbitGuard Visualization] Backend visualization data loading failed:",
          error,
        );

        setObjects([]);
        setDataEpoch(null);

        setLoadError(
          error instanceof Error
            ? error.message
            : "Unable to load visualization data.",
        );
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    loadVisualizationObjects();

    return () => {
      active = false;
    };
  }, []);

  /* ==========================================================================
   * DATASET COUNTS
   * ======================================================================== */

  const objectCounts = useMemo(
    () => calculateObjectCounts(objects),
    [objects],
  );

  /* ==========================================================================
   * SELECTION
   * ======================================================================== */

  const [selectedObjectId, setSelectedObjectId] = useState(null);
  const [selectedObject, setSelectedObject] = useState(null);

  /**
   * Keep the selected object synchronized with
   * the current backend dataset.
   */
  useEffect(() => {
    if (selectedObjectId === null || selectedObjectId === undefined) {
      if (selectedObject !== null) {
        setSelectedObject(null);
      }

      return;
    }

    const currentObject = objects.find(
      (object) =>
        String(getObjectId(object) ?? "") === String(selectedObjectId),
    );

    if (!currentObject) {
      setSelectedObjectId(null);
      setSelectedObject(null);
      return;
    }

    setSelectedObject(currentObject);
  }, [objects, selectedObjectId, selectedObject]);

  /* ==========================================================================
   * FILTER
   * ======================================================================== */

  const [objectFilter, setObjectFilter] = useState(
    VISUALIZATION_FILTERS.ALL,
  );

  /* ==========================================================================
   * DISPLAY OPTIONS
   * ======================================================================== */

  const [displayOptions, setDisplayOptions] = useState(
    DEFAULT_DISPLAY_OPTIONS,
  );

  const updateDisplayOption = useCallback((option, enabled) => {
    if (
      !Object.prototype.hasOwnProperty.call(
        DEFAULT_DISPLAY_OPTIONS,
        option,
      )
    ) {
      return;
    }

    setDisplayOptions((currentOptions) => ({
      ...currentOptions,
      [option]: Boolean(enabled),
    }));
  }, []);

  /* ==========================================================================
   * MOBILE PANELS
   * ======================================================================== */

  const [mobilePanel, setMobilePanel] = useState(null);

  /* ==========================================================================
   * TIMELINE
   * ======================================================================== */

  const [timelineOffsetMinutes, setTimelineOffsetMinutes] = useState(
    DEFAULT_TIMELINE_OFFSET,
  );

  const [timelinePlaying, setTimelinePlaying] = useState(false);

  const [playbackSpeed, setPlaybackSpeed] = useState(
    DEFAULT_PLAYBACK_SPEED,
  );

  const isLive = timelineOffsetMinutes === 0;

  /* ==========================================================================
   * CAMERA BRIDGES
   * ======================================================================== */

  const cameraActionsRef = useRef(null);
  const sceneActionsRef = useRef(null);

  /* ==========================================================================
   * OBJECT SELECTION
   * ======================================================================== */

  const handleObjectSelect = useCallback((object) => {
    if (!object) {
      setSelectedObjectId(null);
      setSelectedObject(null);
      setMobilePanel(null);
      return;
    }

    const objectId = getObjectId(object);

    if (objectId === null || objectId === undefined) {
      if (import.meta.env.DEV) {
        console.warn(
          "[OrbitGuard Visualization] Selection ignored because the selected object has no NORAD/object identifier.",
          object,
        );
      }

      return;
    }

    if (import.meta.env.DEV) {
      console.debug(
        "[OrbitGuard Visualization] Object selected.",
        {
          objectId,
          name: object?.name,
          objectType: getObjectType(object),
        },
      );
    }

    setSelectedObjectId(objectId);
    setSelectedObject(object);

    setMobilePanel(MOBILE_PANELS.INSPECTOR);
  }, []);

  /**
   * Central selection-clear operation.
   */
  const handleClearSelection = useCallback(() => {
    if (import.meta.env.DEV) {
      console.debug(
        "[OrbitGuard Visualization] Clearing selected object and inspector.",
      );
    }

    setSelectedObjectId(null);
    setSelectedObject(null);
    setMobilePanel(null);
  }, []);

  /* ==========================================================================
   * FILTER
   * ======================================================================== */

  const handleObjectFilterChange = useCallback(
    (filter) => {
      const normalizedFilter = String(filter ?? "")
        .trim()
        .toUpperCase();

      if (
        !Object.values(VISUALIZATION_FILTERS).includes(
          normalizedFilter,
        )
      ) {
        return;
      }

      setObjectFilter(normalizedFilter);

      if (
        normalizedFilter !== VISUALIZATION_FILTERS.ALL &&
        selectedObject &&
        getObjectType(selectedObject) !== normalizedFilter
      ) {
        handleClearSelection();
      }
    },
    [selectedObject, handleClearSelection],
  );

  /* ==========================================================================
   * CAMERA ACTIONS
   * ======================================================================== */

  const handleZoomIn = useCallback(() => {
    cameraActionsRef.current?.zoomIn?.();
  }, []);

  const handleZoomOut = useCallback(() => {
    cameraActionsRef.current?.zoomOut?.();
  }, []);

  const handleResetCamera = useCallback(() => {
    cameraActionsRef.current?.reset?.();

    handleClearSelection();
  }, [handleClearSelection]);

  const handleFocusSelected = useCallback(() => {
    if (!selectedObject) {
      return;
    }

    cameraActionsRef.current?.focusObject?.(selectedObject);
  }, [selectedObject]);

  /* ==========================================================================
   * SELECTED OBJECT ORBIT
   * ======================================================================== */

  const handleShowSelectedOrbit = useCallback(() => {
    if (!selectedObject) {
      return;
    }

    setDisplayOptions((currentOptions) => ({
      ...currentOptions,
      orbitalTrails: true,
    }));

    sceneActionsRef.current?.showObjectOrbit?.(selectedObject);
  }, [selectedObject]);

  /* ==========================================================================
   * TIMELINE
   * ======================================================================== */

  const handleTimelineChange = useCallback((value) => {
    const numericValue = Number(value);

    if (!Number.isFinite(numericValue)) {
      return;
    }

    setTimelineOffsetMinutes(numericValue);
    setTimelinePlaying(false);
  }, []);

  const handleTimelinePlayPause = useCallback((nextPlaying) => {
    if (typeof nextPlaying === "boolean") {
      setTimelinePlaying(nextPlaying);
      return;
    }

    setTimelinePlaying((currentPlaying) => !currentPlaying);
  }, []);

  const handlePlaybackSpeedChange = useCallback((speed) => {
    const numericSpeed = Number(speed);

    if (!Number.isFinite(numericSpeed)) {
      return;
    }

    setPlaybackSpeed(numericSpeed);
  }, []);

  const handleLiveChange = useCallback((live) => {
    if (live) {
      setTimelineOffsetMinutes(0);
      setTimelinePlaying(false);
    }
  }, []);

  /* ==========================================================================
   * MOBILE PANEL ACTIONS
   * ======================================================================== */

  const handleOpenObjectsPanel = useCallback(() => {
    setMobilePanel((currentPanel) =>
      currentPanel === MOBILE_PANELS.OBJECTS
        ? null
        : MOBILE_PANELS.OBJECTS,
    );
  }, []);

  const handleOpenInspector = useCallback(() => {
    if (!selectedObject) {
      if (import.meta.env.DEV) {
        console.debug(
          "[OrbitGuard Visualization] Inspector open ignored because no object is selected.",
        );
      }

      return;
    }

    setMobilePanel((currentPanel) =>
      currentPanel === MOBILE_PANELS.INSPECTOR
        ? null
        : MOBILE_PANELS.INSPECTOR,
    );
  }, [selectedObject]);

  const handleCloseMobilePanel = useCallback(() => {
    setMobilePanel(null);
  }, []);

  /* ==========================================================================
   * SCENE CONFIGURATION
   * ======================================================================== */

  const sceneConfiguration = useMemo(
    () => ({
      filter: objectFilter,
      showSatellites: displayOptions.satellites,
      showDebris: displayOptions.debris,
      showOrbitalTrails: displayOptions.orbitalTrails,
      showAtmosphere: displayOptions.atmosphere,
      selectedObjectId,
      timelineOffsetMinutes,
    }),
    [
      objectFilter,
      displayOptions,
      selectedObjectId,
      timelineOffsetMinutes,
    ],
  );

  /* ==========================================================================
   * STABLE CAMERA READY HANDLER
   * ======================================================================== */

  const handleCameraActionsReady = useCallback((actions) => {
    cameraActionsRef.current = actions;
  }, []);

  /* ==========================================================================
   * MODE
   * ======================================================================== */

  const visualizationMode = isLive ? "live" : "preview";

  /* ==========================================================================
   * PAGE ANIMATION
   * ======================================================================== */

  const pageVariants = shouldReduceMotion
    ? undefined
    : VISUALIZATION_PAGE_VARIANTS;

  /* ==========================================================================
   * RENDER
   * ======================================================================== */

  return (
    <main
      aria-label="OrbitGuard AI 3D Visualization"
      className="
        relative
        h-[calc(100dvh-68px)]
        min-h-0
        w-full
        overflow-hidden
        bg-[#010711]
        text-slate-100
      "
    >
      <motion.div
        initial={shouldReduceMotion ? false : "hidden"}
        animate="visible"
        variants={pageVariants}
        className="
          relative
          h-full
          min-h-0
          w-full
          overflow-hidden
        "
      >
        {/* ==================================================================
            3D SCENE
            ================================================================== */}

        <div
          className="
            absolute
            inset-0
            z-0
            min-h-0
          "
        >
          <VisualizationScene
            ref={sceneActionsRef}
            configuration={sceneConfiguration}
            objects={objects}
            selectedObjectId={selectedObjectId}
            onObjectSelect={handleObjectSelect}
            onCameraActionsReady={handleCameraActionsReady}
            reduceMotion={Boolean(shouldReduceMotion)}
          />
        </div>

        {/* ==================================================================
            TOP STATUS BAR
            ================================================================== */}

        <div
          className="
            pointer-events-none
            absolute
            left-3
            right-3
            top-3
            z-40

            lg:left-1/2
            lg:right-auto
            lg:w-[min(900px,calc(100%-680px))]
            lg:-translate-x-1/2
          "
        >
          <VisualizationTopStatus
            mode={visualizationMode}
            dataEpoch={dataEpoch}
            propagation="SGP4 / OREKIT"
            referenceFrame="ITRF (EARTH FIXED)"
          />
        </div>

        {/* ==================================================================
            DESKTOP COMMAND UI
            ================================================================== */}

        <section
          aria-label="Orbital visualization controls"
          className="
            pointer-events-none
            absolute
            inset-0
            z-20
            min-h-0
            overflow-hidden
          "
        >
          {/* ================================================================
              LEFT COMMAND DOCK
              ================================================================ */}

          <div
            className="
              pointer-events-none
              absolute
              left-3
              top-[70px]
              bottom-[15px]
              z-30

              hidden
              lg:flex

              w-[340px]

              flex-col
              gap-3
            "
          >
            {/* ================================================================
                SPACE OBJECTS
                ================================================================ */}

            <div
              className="
                pointer-events-auto
                min-h-0
                flex-1
                overflow-hidden
              "
            >
              <SpaceObjectsPanel
                objects={objects}
                counts={objectCounts}
                filter={objectFilter}
                onFilterChange={handleObjectFilterChange}
                displayOptions={displayOptions}
                onDisplayOptionChange={updateDisplayOption}
                selectedObjectId={selectedObjectId}
                onObjectSelect={handleObjectSelect}
                open
                onClose={handleCloseMobilePanel}
                preview={false}
                className="
                  h-full
                  max-h-none
                  sm:w-full
                  lg:w-full
                  xl:w-full
                "
              />
            </div>

            {/* ================================================================
                LEGEND
                ================================================================ */}

            <div
              className="
                pointer-events-auto
                shrink-0
              "
            >
              <VisualizationLegend
                defaultOpen
                collapsible
              />
            </div>
          </div>

          {/* ================================================================
              RIGHT INSPECTOR
              ================================================================ */}

          {selectedObject && (
            <div
              className="
                pointer-events-none
                absolute
                right-3
                top-[65px]
                bottom-[95px]
                z-30

                hidden
                lg:block

                w-[330px]
                xl:w-[350px]
              "
            >
              <div
                className="
                  pointer-events-auto
                  h-full
                  overflow-hidden
                "
              >
                <ObjectInspector
                  selectedObject={selectedObject}
                  initialTab="overview"
                  onFocusObject={handleFocusSelected}
                  onShowOrbit={handleShowSelectedOrbit}
                  onClose={handleClearSelection}
                  open={Boolean(selectedObject)}
                />
              </div>
            </div>
          )}

          {/* ================================================================
              CAMERA CONTROLS
              ================================================================ */}

          <div
            className="
              pointer-events-none
              absolute
              bottom-4
              right-3
              z-40
              hidden
              lg:block
            "
          >
            <div className="pointer-events-auto">
              <CameraControls
                onZoomIn={handleZoomIn}
                onZoomOut={handleZoomOut}
                onFocusSelected={handleFocusSelected}
                onReset={handleResetCamera}
                hasSelectedObject={Boolean(selectedObject)}
              />
            </div>
          </div>

          {/* ================================================================
              MOBILE PANEL SWITCHER
              ================================================================ */}

          {mobilePanel === null && (
            <div
              className={`
                pointer-events-auto
                absolute
                left-1/2
                ${MOBILE_CONTENT_TOP_CLASS}
                z-50
                flex
                -translate-x-1/2
                items-center
                gap-1
                rounded-lg
                border
                border-white/[0.07]
                bg-[#03101d]/90
                p-1
                shadow-[0_10px_35px_rgba(0,0,0,0.35)]
                backdrop-blur-xl

                lg:hidden
              `}
            >
              <button
                type="button"
                onClick={handleOpenObjectsPanel}
                aria-label="Open space objects panel"
                aria-expanded={
                  mobilePanel === MOBILE_PANELS.OBJECTS
                }
                className={`
                  min-h-[36px]
                  rounded-md
                  px-3
                  py-2
                  font-['Orbitron']
                  text-[7px]
                  tracking-[0.08em]
                  transition

                  focus-visible:outline-none
                  focus-visible:ring-1
                  focus-visible:ring-cyan-400/70

                  ${
                    mobilePanel === MOBILE_PANELS.OBJECTS
                      ? "bg-cyan-400/12 text-cyan-200"
                      : "text-slate-500 hover:text-slate-300"
                  }
                `}
              >
                OBJECTS
              </button>

              <button
                type="button"
                onClick={handleOpenInspector}
                disabled={!selectedObject}
                aria-label="Open object inspector"
                aria-expanded={
                  Boolean(selectedObject) &&
                  mobilePanel === MOBILE_PANELS.INSPECTOR
                }
                className={`
                  min-h-[36px]
                  rounded-md
                  px-3
                  py-2
                  font-['Orbitron']
                  text-[7px]
                  tracking-[0.08em]
                  transition

                  focus-visible:outline-none
                  focus-visible:ring-1
                  focus-visible:ring-cyan-400/70

                  ${
                    mobilePanel === MOBILE_PANELS.INSPECTOR &&
                    selectedObject
                      ? "bg-cyan-400/12 text-cyan-200"
                      : "text-slate-500 hover:text-slate-300"
                  }

                  disabled:cursor-not-allowed
                  disabled:opacity-40
                `}
              >
                INSPECTOR
              </button>
            </div>
          )}

          {/* ================================================================
              MOBILE SPACE OBJECTS
              ================================================================ */}

          {mobilePanel === MOBILE_PANELS.OBJECTS && (
            <div
              className={`
                pointer-events-auto
                absolute
                inset-x-3
                ${MOBILE_CONTENT_TOP_CLASS}
                ${MOBILE_OBJECTS_BOTTOM_CLASS}
                z-[55]
                overflow-hidden
                lg:hidden
              `}
            >
              <SpaceObjectsPanel
                objects={objects}
                counts={objectCounts}
                filter={objectFilter}
                onFilterChange={handleObjectFilterChange}
                displayOptions={displayOptions}
                onDisplayOptionChange={updateDisplayOption}
                selectedObjectId={selectedObjectId}
                onObjectSelect={handleObjectSelect}
                open
                onClose={handleCloseMobilePanel}
                preview={false}
                className="
                  h-full
                  max-h-none
                  w-full
                  sm:w-full
                "
              />
            </div>
          )}

          {/* ================================================================
              MOBILE OBJECT INSPECTOR

              IMPORTANT:
              This panel intentionally reaches the bottom of the viewport.

              Unlike the Objects panel, it does NOT preserve the 72px bottom
              interaction area.

              It also uses inset-x-0 so the ObjectInspector bottom sheet can
              occupy the complete mobile width.
              ================================================================ */}

          {mobilePanel === MOBILE_PANELS.INSPECTOR &&
            selectedObject && (
              <div
                className={`
                  pointer-events-auto
                  absolute
                  inset-x-0
                  ${MOBILE_CONTENT_TOP_CLASS}
                  ${MOBILE_INSPECTOR_BOTTOM_CLASS}
                  z-[55]
                  overflow-hidden
                  lg:hidden
                `}
              >
                <ObjectInspector
                  selectedObject={selectedObject}
                  initialTab="overview"
                  onFocusObject={handleFocusSelected}
                  onShowOrbit={handleShowSelectedOrbit}
                  onClose={handleClearSelection}
                  open={Boolean(selectedObject)}
                />
              </div>
            )}

          {/* ================================================================
              MOBILE TIMELINE
              ================================================================ */}

          <div
            className="
              pointer-events-none
              absolute
              bottom-3
              left-3
              right-3
              z-40
              lg:hidden
            "
          />
        </section>

        {/* ==================================================================
            LOADING STATE
            ================================================================== */}

        {isLoading && (
          <div
            className="
              pointer-events-none
              absolute
              bottom-24
              left-1/2
              z-[60]
              -translate-x-1/2
              rounded-md
              border
              border-cyan-400/10
              bg-[#03101b]/85
              px-3
              py-1.5
              font-['Orbitron']
              text-[8px]
              tracking-[0.14em]
              text-cyan-300/70
              backdrop-blur-md
            "
          >
            LOADING ORBITAL DATA
          </div>
        )}

        {/* ==================================================================
            ERROR STATE
            ================================================================== */}

        {loadError && !isLoading && (
          <div
            role="status"
            className="
              pointer-events-none
              absolute
              bottom-24
              left-1/2
              z-[60]
              max-w-[calc(100%-32px)]
              -translate-x-1/2
              rounded-md
              border
              border-red-400/15
              bg-[#14070a]/90
              px-4
              py-2
              text-center
              font-['Orbitron']
              text-[8px]
              tracking-[0.08em]
              text-red-300/80
              backdrop-blur-md
            "
          >
            VISUALIZATION DATA UNAVAILABLE
          </div>
        )}
      </motion.div>
    </main>
  );
};

export default Visualization;