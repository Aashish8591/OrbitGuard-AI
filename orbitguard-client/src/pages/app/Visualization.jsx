import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  motion,
  useReducedMotion,
} from "framer-motion";

import VisualizationScene from "../../features/visualization/components/VisualizationScene";
import VisualizationTopStatus from "../../features/visualization/components/VisualizationTopStatus";
import SpaceObjectsPanel from "../../features/visualization/components/SpaceObjectsPanel";
import ObjectInspector from "../../features/visualization/components/ObjectInspector";
import VisualizationLegend from "../../features/visualization/components/VisualizationLegend";
import CameraControls from "../../features/visualization/components/CameraControls";
import OrbitalTimeline from "../../features/visualization/components/OrbitalTimeline";

/**
 * ================================================================
 * BACKEND VISUALIZATION SERVICE
 * ================================================================
 *
 * Backend source of truth:
 *
 * GET /api/visualization/objects
 *
 * The shared visualization service is responsible for:
 *
 * - Axios communication
 * - JWT authentication through api.js
 * - backend response extraction
 * - targetTime formatting
 * - API error propagation
 *
 * This page only consumes the returned visualization data.
 */
import {
  getAllVisualizationObjects,
} from "../../services/visualizationService";

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
 * - Three.js object calculations
 *
 * Backend remains the source of truth.
 *
 * ============================================================================
 */

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

/* ============================================================================
 * HELPERS
 * ========================================================================== */

const getObjectType = (object) => {
  if (!object) {
    return "";
  }

  return String(
    object.objectType ??
      object.type ??
      object.object_type ??
      "",
  )
    .trim()
    .toUpperCase();
};

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
 *
 * The visualization service already unwraps the backend ApiResponse.
 *
 * Expected service result:
 *
 * {
 *   objects: [...],
 *   propagatedAt: "..."
 * }
 *
 * The helper remains defensive because the visualization page
 * should never assume an invalid response is usable data.
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
    propagatedAt:
      response.propagatedAt ??
      response.timestamp ??
      null,
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

  /**
   * ========================================================================
   * LOAD REAL BACKEND VISUALIZATION DATA
   * ========================================================================
   *
   * IMPORTANT:
   *
   * This is now connected to the actual Spring Boot backend.
   *
   * Request flow:
   *
   * Visualization.jsx
   *        ↓
   * getAllVisualizationObjects()
   *        ↓
   * visualizationService.js
   *        ↓
   * api.js
   *        ↓
   * JWT Authorization
   *        ↓
   * GET /api/visualization/objects
   *        ↓
   * Spring Boot VisualizationController
   *
   * We intentionally do not pass targetTime here yet.
   *
   * When targetTime is omitted, the backend controller uses:
   *
   * LocalDateTime.now(ZoneOffset.UTC)
   *
   * This gives us the cleanest first end-to-end integration test.
   */
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

        /**
         * Backend will use current UTC time because no targetTime
         * is supplied.
         */
        const response =
          await getAllVisualizationObjects();

        if (!active) {
          return;
        }

        const normalized =
          normalizeVisualizationResponse(response);

        /**
         * Store only the real backend objects.
         *
         * No dummy/fallback visualization objects are created.
         */
        setObjects(normalized.objects);

        setDataEpoch(normalized.propagatedAt);

        if (import.meta.env.DEV) {
          console.info(
            "[OrbitGuard Visualization] Backend visualization data loaded successfully.",
            {
              objectCount:
                normalized.objects.length,
              propagatedAt:
                normalized.propagatedAt,
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
   * SELECTION
   * ======================================================================== */

  const [
    selectedObjectId,
    setSelectedObjectId,
  ] = useState(null);

  const [
    selectedObject,
    setSelectedObject,
  ] = useState(null);

  /**
   * Automatically select ISS only when the backend actually provides it.
   */
  useEffect(() => {
    if (
      selectedObjectId !== null ||
      objects.length === 0
    ) {
      return;
    }

    const iss = objects.find(
      (object) =>
        String(
          getObjectId(object) ?? "",
        ) === "25544",
    );

    if (!iss) {
      return;
    }

    setSelectedObjectId(
      getObjectId(iss),
    );

    setSelectedObject(iss);
  }, [
    objects,
    selectedObjectId,
  ]);

  /* ==========================================================================
   * FILTER
   * ======================================================================== */

  const [
    objectFilter,
    setObjectFilter,
  ] = useState(
    VISUALIZATION_FILTERS.ALL,
  );

  /* ==========================================================================
   * DISPLAY OPTIONS
   * ======================================================================== */

  const [
    displayOptions,
    setDisplayOptions,
  ] = useState(
    DEFAULT_DISPLAY_OPTIONS,
  );

  const updateDisplayOption =
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

        setDisplayOptions(
          (currentOptions) => ({
            ...currentOptions,
            [option]:
              Boolean(enabled),
          }),
        );
      },
      [],
    );

  /* ==========================================================================
   * INSPECTOR
   * ======================================================================== */

  const [
    inspectorTab,
    setInspectorTab,
  ] = useState("OVERVIEW");

  /* ==========================================================================
   * MOBILE PANELS
   * ======================================================================== */

  const [
    mobilePanel,
    setMobilePanel,
  ] = useState(null);

  /* ==========================================================================
   * TIMELINE
   * ======================================================================== */

  const [
    timelineOffsetMinutes,
    setTimelineOffsetMinutes,
  ] = useState(
    DEFAULT_TIMELINE_OFFSET,
  );

  const [
    timelinePlaying,
    setTimelinePlaying,
  ] = useState(false);

  const [
    playbackSpeed,
    setPlaybackSpeed,
  ] = useState(
    DEFAULT_PLAYBACK_SPEED,
  );

  const isLive =
    timelineOffsetMinutes === 0;

  /* ==========================================================================
   * CAMERA BRIDGES
   * ======================================================================== */

  const cameraActionsRef =
    useRef(null);

  const sceneActionsRef =
    useRef(null);

  /* ==========================================================================
   * OBJECT SELECTION
   * ======================================================================== */

  const handleObjectSelect =
    useCallback(
      (object) => {
        if (!object) {
          setSelectedObjectId(null);
          setSelectedObject(null);
          setMobilePanel(null);
          return;
        }

        const objectId =
          getObjectId(object);

        setSelectedObjectId(
          objectId,
        );

        setSelectedObject(object);

        /**
         * On mobile, selecting an object should open
         * the inspector automatically.
         */
        setMobilePanel(
          MOBILE_PANELS.INSPECTOR,
        );

        setInspectorTab(
          "OVERVIEW",
        );
      },
      [],
    );

  const handleClearSelection =
    useCallback(() => {
      setSelectedObjectId(null);
      setSelectedObject(null);
    }, []);

  const handlePanelObjectSelect =
    useCallback(
      (object) => {
        handleObjectSelect(object);
      },
      [handleObjectSelect],
    );

  /* ==========================================================================
   * FILTER
   * ======================================================================== */

  const handleObjectFilterChange =
    useCallback(
      (filter) => {
        const normalizedFilter =
          String(filter ?? "")
            .trim()
            .toUpperCase();

        if (
          !Object.values(
            VISUALIZATION_FILTERS,
          ).includes(
            normalizedFilter,
          )
        ) {
          return;
        }

        setObjectFilter(
          normalizedFilter,
        );

        /**
         * Clear selection if the selected object
         * no longer belongs to the active filter.
         */
        if (
          normalizedFilter !== "ALL" &&
          selectedObject &&
          getObjectType(
            selectedObject,
          ) !== normalizedFilter
        ) {
          handleClearSelection();
        }
      },
      [
        selectedObject,
        handleClearSelection,
      ],
    );

  /* ==========================================================================
   * CAMERA ACTIONS
   * ======================================================================== */

  const handleZoomIn =
    useCallback(() => {
      cameraActionsRef.current?.zoomIn?.();
    }, []);

  const handleZoomOut =
    useCallback(() => {
      cameraActionsRef.current?.zoomOut?.();
    }, []);

  const handleResetCamera =
    useCallback(() => {
      cameraActionsRef.current?.reset?.();
    }, []);

  const handleFocusSelected =
    useCallback(() => {
      if (!selectedObject) {
        return;
      }

      cameraActionsRef.current?.focusObject?.(
        selectedObject,
      );
    }, [selectedObject]);

  /* ==========================================================================
   * SELECTED OBJECT ORBIT
   * ======================================================================== */

  const handleShowSelectedOrbit =
    useCallback(() => {
      if (!selectedObject) {
        return;
      }

      setDisplayOptions(
        (currentOptions) => ({
          ...currentOptions,
          orbitalTrails: true,
        }),
      );

      sceneActionsRef.current?.showObjectOrbit?.(
        selectedObject,
      );
    }, [selectedObject]);

  /* ==========================================================================
   * TIMELINE
   * ======================================================================== */

  const handleTimelineChange =
    useCallback((value) => {
      const numericValue =
        Number(value);

      if (
        !Number.isFinite(
          numericValue,
        )
      ) {
        return;
      }

      setTimelineOffsetMinutes(
        numericValue,
      );

      setTimelinePlaying(false);
    }, []);

  const handleTimelinePlayPause =
    useCallback(
      (nextPlaying) => {
        if (
          typeof nextPlaying ===
          "boolean"
        ) {
          setTimelinePlaying(
            nextPlaying,
          );
          return;
        }

        setTimelinePlaying(
          (currentPlaying) =>
            !currentPlaying,
        );
      },
      [],
    );

  const handlePlaybackSpeedChange =
    useCallback((speed) => {
      const numericSpeed =
        Number(speed);

      if (
        !Number.isFinite(
          numericSpeed,
        )
      ) {
        return;
      }

      setPlaybackSpeed(
        numericSpeed,
      );
    }, []);

  const handleLiveChange =
    useCallback((live) => {
      if (live) {
        setTimelineOffsetMinutes(0);
        setTimelinePlaying(false);
      }
    }, []);

  /* ==========================================================================
   * MOBILE PANEL ACTIONS
   * ======================================================================== */

  const handleOpenObjectsPanel =
    useCallback(() => {
      setMobilePanel(
        (currentPanel) =>
          currentPanel ===
          MOBILE_PANELS.OBJECTS
            ? null
            : MOBILE_PANELS.OBJECTS,
      );
    }, []);

  const handleOpenInspector =
    useCallback(() => {
      setMobilePanel(
        (currentPanel) =>
          currentPanel ===
          MOBILE_PANELS.INSPECTOR
            ? null
            : MOBILE_PANELS.INSPECTOR,
      );
    }, []);

  const handleCloseMobilePanel =
    useCallback(() => {
      setMobilePanel(null);
    }, []);

  /* ==========================================================================
   * SCENE CONFIGURATION
   * ======================================================================== */

  const sceneConfiguration =
    useMemo(
      () => ({
        filter: objectFilter,

        showSatellites:
          displayOptions.satellites,

        showDebris:
          displayOptions.debris,

        showOrbitalTrails:
          displayOptions.orbitalTrails,

        showAtmosphere:
          displayOptions.atmosphere,

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
   * MODE
   * ======================================================================== */

  const visualizationMode =
    isLive
      ? "live"
      : "preview";

  /* ==========================================================================
   * PAGE ANIMATION
   * ======================================================================== */

  const pageVariants =
    shouldReduceMotion
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
        initial={
          shouldReduceMotion
            ? false
            : "hidden"
        }
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
            configuration={
              sceneConfiguration
            }
            objects={objects}
            selectedObjectId={
              selectedObjectId
            }
            onObjectSelect={
              handleObjectSelect
            }
            onCameraActionsReady={(
              actions,
            ) => {
              cameraActionsRef.current =
                actions;
            }}
            reduceMotion={Boolean(
              shouldReduceMotion,
            )}
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
            mode={
              visualizationMode
            }
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
              top-[84px]
              bottom-[88px]
              z-30

              hidden
              lg:flex

              w-[330px]

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
                filter={objectFilter}
                onFilterChange={
                  handleObjectFilterChange
                }
                displayOptions={
                  displayOptions
                }
                onDisplayOptionChange={
                  updateDisplayOption
                }
                selectedObjectId={
                  selectedObjectId
                }
                onObjectSelect={
                  handlePanelObjectSelect
                }
                open
                onClose={
                  handleCloseMobilePanel
                }
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

          <div
            className="
              pointer-events-none
              absolute
              right-3
              top-[84px]
              bottom-[88px]
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
                object={selectedObject}
                activeTab={inspectorTab}
                onTabChange={
                  setInspectorTab
                }
                onFocusObject={
                  handleFocusSelected
                }
                onShowOrbit={
                  handleShowSelectedOrbit
                }
                onClose={
                  handleClearSelection
                }
              />
            </div>
          </div>

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
                onZoomIn={
                  handleZoomIn
                }
                onZoomOut={
                  handleZoomOut
                }
                onFocusSelected={
                  handleFocusSelected
                }
                onReset={
                  handleResetCamera
                }
                hasSelectedObject={
                  Boolean(
                    selectedObject,
                  )
                }
              />
            </div>
          </div>

          {/* ================================================================
              TIMELINE
              ================================================================ */}

          <div
            className="
              pointer-events-auto
              absolute
              bottom-3
              left-[360px]
              right-[360px]
              z-40

              lg:block

              xl:left-[380px]
              xl:right-[380px]
            "
          >
            <OrbitalTimeline
              value={
                timelineOffsetMinutes
              }
              isPlaying={
                timelinePlaying
              }
              playbackSpeed={
                playbackSpeed
              }
              isLive={isLive}
              onChange={
                handleTimelineChange
              }
              onTogglePlay={
                handleTimelinePlayPause
              }
              onPlaybackSpeedChange={
                handlePlaybackSpeedChange
              }
              onLiveChange={
                handleLiveChange
              }
            />
          </div>

          {/* ================================================================
              MOBILE PANEL SWITCHER
              ================================================================ */}

          <div
            className="
              pointer-events-auto
              absolute
              left-1/2
              top-3
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
            "
          >
            <button
              type="button"
              onClick={
                handleOpenObjectsPanel
              }
              aria-label="Open space objects panel"
              aria-expanded={
                mobilePanel ===
                MOBILE_PANELS.OBJECTS
              }
              className={`
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
                  mobilePanel ===
                  MOBILE_PANELS.OBJECTS
                    ? "bg-cyan-400/12 text-cyan-200"
                    : "text-slate-500 hover:text-slate-300"
                }
              `}
            >
              OBJECTS
            </button>

            <button
              type="button"
              onClick={
                handleOpenInspector
              }
              aria-label="Open object inspector"
              aria-expanded={
                mobilePanel ===
                MOBILE_PANELS.INSPECTOR
              }
              className={`
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
                  mobilePanel ===
                  MOBILE_PANELS.INSPECTOR
                    ? "bg-cyan-400/12 text-cyan-200"
                    : "text-slate-500 hover:text-slate-300"
                }
              `}
            >
              INSPECTOR
            </button>
          </div>

          {/* ================================================================
              MOBILE SPACE OBJECTS
              ================================================================ */}

          {mobilePanel ===
            MOBILE_PANELS.OBJECTS && (
            <div
              className="
                pointer-events-auto
                absolute
                inset-x-3
                top-[68px]
                bottom-[72px]
                z-50
                overflow-hidden
                lg:hidden
              "
            >
              <SpaceObjectsPanel
                objects={objects}
                filter={objectFilter}
                onFilterChange={
                  handleObjectFilterChange
                }
                displayOptions={
                  displayOptions
                }
                onDisplayOptionChange={
                  updateDisplayOption
                }
                selectedObjectId={
                  selectedObjectId
                }
                onObjectSelect={
                  handlePanelObjectSelect
                }
                open
                onClose={
                  handleCloseMobilePanel
                }
                preview={false}
                className="
                  h-full
                  max-h-none
                  sm:w-full
                "
              />
            </div>
          )}

          {/* ================================================================
              MOBILE INSPECTOR
              ================================================================ */}

          {mobilePanel ===
            MOBILE_PANELS.INSPECTOR && (
            <div
              className="
                pointer-events-auto
                absolute
                inset-x-3
                top-[68px]
                bottom-[72px]
                z-50
                overflow-hidden
                lg:hidden
              "
            >
              <ObjectInspector
                object={selectedObject}
                activeTab={inspectorTab}
                onTabChange={
                  setInspectorTab
                }
                onFocusObject={
                  handleFocusSelected
                }
                onShowOrbit={
                  handleShowSelectedOrbit
                }
                onClose={
                  handleCloseMobilePanel
                }
              />
            </div>
          )}

          {/* ================================================================
              MOBILE TIMELINE
              ================================================================ */}

          <div
            className="
              pointer-events-auto
              absolute
              bottom-3
              left-3
              right-3
              z-40
              lg:hidden
            "
          >
            <OrbitalTimeline
              value={
                timelineOffsetMinutes
              }
              isPlaying={
                timelinePlaying
              }
              playbackSpeed={
                playbackSpeed
              }
              isLive={isLive}
              onChange={
                handleTimelineChange
              }
              onTogglePlay={
                handleTimelinePlayPause
              }
              onPlaybackSpeedChange={
                handlePlaybackSpeedChange
              }
              onLiveChange={
                handleLiveChange
              }
            />
          </div>
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