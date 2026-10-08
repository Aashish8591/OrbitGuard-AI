import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";

import { Canvas, useThree } from "@react-three/fiber";

import { OrbitControls } from "@react-three/drei";

import * as THREE from "three";

import Earth from "./Earth";
import Atmosphere from "./Atmosphere";
import StarField from "./StarField";
import SatelliteLayer from "./SatelliteLayer";
import DebrisLayer from "./DebrisLayer";
import OrbitalTrail from "./OrbitalTrail";
import SelectedObject from "./SelectedObject";

/**
 * ============================================================================
 * OrbitGuard AI — Visualization Scene
 * ============================================================================
 *
 * R3F rendering boundary.
 *
 * Backend visualization objects remain the source of truth.
 *
 * This component does NOT:
 *
 * - call APIs
 * - calculate SGP4
 * - calculate Orekit
 * - convert coordinates
 * - calculate collision risk
 * - modify backend objects
 *
 * Rendering pipeline:
 *
 * Backend visualization objects
 *          ↓
 * Visualization.jsx
 *          ↓
 * VisualizationScene
 *          ↓
 * type filtering
 *          ↓
 * deterministic rendering budget
 *          ↓
 * SatelliteLayer / DebrisLayer
 *
 * Coordinate contract:
 *
 * Backend:
 *   xKm / yKm / zKm
 *
 * Frontend:
 *   6371 km = 1 Three.js scene unit
 *
 * Therefore the scene must NOT apply another orbital-position scale.
 *
 * ============================================================================
 */

/* ============================================================================
 * SCENE CONSTANTS
 * ========================================================================== */

const DEFAULT_CAMERA = Object.freeze({
  position: [0, 0, 4.9],
  fov: 40,
  near: 0.1,
  far: 100,
});

const DEFAULT_CAMERA_TARGET = Object.freeze([0, 0, 0]);

const CAMERA_LIMITS = Object.freeze({
  minDistance: 2.8,
  maxDistance: 16,
  rotateSpeed: 0.45,
  zoomSpeed: 0.7,
  panSpeed: 0.4,
  dampingFactor: 0.075,
});

const CAMERA_FOCUS_DISTANCE = 3.2;

/**
 * ============================================================================
 * POINT RAYCAST CONFIGURATION
 * ============================================================================
 *
 * THREE.Points uses Raycaster.params.Points.threshold when determining whether
 * a mouse ray has hit a point.
 *
 * This value is in Three.js world units.
 *
 * Earth radius:
 *
 *   1 scene unit = 6371 km
 *
 * We deliberately keep the threshold tight so a click near one orbital object
 * does not accidentally select another nearby object.
 *
 * IMPORTANT:
 *
 * This is configured on the R3F Canvas raycaster below.
 * It is NOT stored in points.userData because Three.js does not read custom
 * userData values when performing Points raycasting.
 * ============================================================================
 */

const POINT_RAYCAST_THRESHOLD = 0.02;

/* ============================================================================
 * DISPLAY BUDGET
 * ========================================================================== */

const DISPLAY_LIMITS = Object.freeze({
  MAX_SATELLITES: 2000,
  MAX_DEBRIS: 1000,
});

const MAX_RENDERED_OBJECTS =
  DISPLAY_LIMITS.MAX_SATELLITES +
  DISPLAY_LIMITS.MAX_DEBRIS;

/* ============================================================================
 * SCENE COLORS
 * ========================================================================== */

const SCENE_COLORS = Object.freeze({
  BACKGROUND: "#010711",
  AMBIENT: "#b9d9ea",
  KEY_LIGHT: "#ffffff",
  FILL_LIGHT: "#38bdf8",
});

/* ============================================================================
 * DEBUG
 * ========================================================================== */

const DEBUG_SCENE_EVENTS = import.meta.env.DEV;

/* ============================================================================
 * HELPERS
 * ========================================================================== */

/**
 * Normalize backend object type.
 */
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

/**
 * Resolve the stable visualization identifier.
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
 * Compare identifiers safely.
 */
const sameObjectId = (first, second) => {
  if (
    first === null ||
    first === undefined ||
    second === null ||
    second === undefined
  ) {
    return false;
  }

  return String(first) === String(second);
};

/**
 * ============================================================================
 * DETERMINISTIC DISPLAY SAMPLING
 * ============================================================================
 *
 * The complete backend dataset remains available to the application.
 *
 * Only the active Three.js rendering set is limited.
 *
 * The selected object is always preserved when possible.
 */

const selectDisplayObjects = (
  objects,
  limit,
  selectedObjectId = null,
) => {
  if (
    !Array.isArray(objects) ||
    objects.length === 0
  ) {
    return [];
  }

  if (
    !Number.isInteger(limit) ||
    limit <= 0
  ) {
    return [];
  }

  if (objects.length <= limit) {
    return objects;
  }

  const selectedIndex = objects.findIndex(
    (object) =>
      sameObjectId(
        getObjectId(object),
        selectedObjectId,
      ),
  );

  const result = [];
  const selectedIndexes = new Set();

  const step =
    objects.length / limit;

  for (
    let index = 0;
    index < limit;
    index += 1
  ) {
    const sourceIndex = Math.min(
      objects.length - 1,
      Math.floor(index * step),
    );

    if (
      selectedIndexes.has(
        sourceIndex,
      )
    ) {
      continue;
    }

    selectedIndexes.add(
      sourceIndex,
    );

    result.push(
      objects[sourceIndex],
    );
  }

  /**
   * Preserve the selected object without exceeding the budget.
   */
  if (
    selectedIndex >= 0 &&
    !selectedIndexes.has(
      selectedIndex,
    ) &&
    result.length > 0
  ) {
    result[result.length - 1] =
      objects[selectedIndex];
  }

  return result;
};

/* ============================================================================
 * CAMERA BRIDGE
 * ========================================================================== */

const SceneCameraBridge = ({
  controlsRef,
  onCameraActionsReady,
}) => {
  const { camera } = useThree();

  const actionsRef = useRef(null);

  useEffect(() => {
    if (
      typeof onCameraActionsReady !==
      "function"
    ) {
      return undefined;
    }

    const getControlsTarget = () => {
      if (
        controlsRef.current?.target
      ) {
        return controlsRef.current
          .target;
      }

      return new THREE.Vector3(
        ...DEFAULT_CAMERA_TARGET,
      );
    };

    const updateControls = () => {
      controlsRef.current?.update?.();
    };

    const reset = () => {
      camera.position.set(
        ...DEFAULT_CAMERA.position,
      );

      camera.up.set(0, 1, 0);

      if (controlsRef.current) {
        controlsRef.current.target.set(
          ...DEFAULT_CAMERA_TARGET,
        );

        controlsRef.current.update();
      } else {
        camera.lookAt(
          ...DEFAULT_CAMERA_TARGET,
        );
      }
    };

    const zoomIn = () => {
      const target =
        getControlsTarget();

      const direction =
        new THREE.Vector3().subVectors(
          camera.position,
          target,
        );

      const currentDistance =
        direction.length();

      if (
        currentDistance <=
        CAMERA_LIMITS.minDistance
      ) {
        return;
      }

      const nextDistance =
        Math.max(
          CAMERA_LIMITS.minDistance,
          currentDistance * 0.78,
        );

      direction.normalize();

      camera.position
        .copy(target)
        .add(
          direction.multiplyScalar(
            nextDistance,
          ),
        );

      updateControls();
    };

    const zoomOut = () => {
      const target =
        getControlsTarget();

      const direction =
        new THREE.Vector3().subVectors(
          camera.position,
          target,
        );

      const currentDistance =
        direction.length();

      if (
        currentDistance >=
        CAMERA_LIMITS.maxDistance
      ) {
        return;
      }

      const nextDistance =
        Math.min(
          CAMERA_LIMITS.maxDistance,
          currentDistance * 1.28,
        );

      direction.normalize();

      camera.position
        .copy(target)
        .add(
          direction.multiplyScalar(
            nextDistance,
          ),
        );

      updateControls();
    };

    const focusObject = (object) => {
      if (!object) {
        return;
      }

      const position =
        object.scenePosition ??
        object.position ??
        null;

      if (
        !Array.isArray(position) ||
        position.length < 3
      ) {
        return;
      }

      const x = Number(
        position[0],
      );
      const y = Number(
        position[1],
      );
      const z = Number(
        position[2],
      );

      if (
        !Number.isFinite(x) ||
        !Number.isFinite(y) ||
        !Number.isFinite(z)
      ) {
        return;
      }

      const target =
        new THREE.Vector3(
          x,
          y,
          z,
        );

      const direction =
        target.clone();

      if (
        direction.lengthSq() <
        0.000001
      ) {
        direction.set(0, 0, 1);
      } else {
        direction.normalize();
      }

      const cameraDistance =
        Math.max(
          CAMERA_LIMITS.minDistance,
          CAMERA_FOCUS_DISTANCE,
        );

      const cameraPosition =
        target
          .clone()
          .add(
            direction.multiplyScalar(
              cameraDistance,
            ),
          );

      camera.position.copy(
        cameraPosition,
      );

      if (controlsRef.current) {
        controlsRef.current.target.copy(
          target,
        );

        controlsRef.current.update();
      } else {
        camera.lookAt(target);
      }
    };

    const actions = {
      zoomIn,
      zoomOut,
      reset,
      focusObject,
    };

    actionsRef.current = actions;

    onCameraActionsReady(actions);

    return () => {
      if (
        actionsRef.current ===
        actions
      ) {
        actionsRef.current = null;
      }

      onCameraActionsReady(null);
    };
  }, [
    camera,
    controlsRef,
    onCameraActionsReady,
  ]);

  return null;
};

/* ============================================================================
 * SCENE ACTION BRIDGE
 * ========================================================================== */

const SceneActionBridge = ({
  selectedObjectId,
}) => {
  const sceneStateRef = useRef({
    selectedObjectId:
      selectedObjectId ?? null,
    showSelectedOrbit: false,
  });

  useEffect(() => {
    sceneStateRef.current.selectedObjectId =
      selectedObjectId ?? null;
  }, [selectedObjectId]);

  return null;
};

/* ============================================================================
 * LIGHTING
 * ========================================================================== */

const SceneLighting = () => (
  <>
    <ambientLight
      color={SCENE_COLORS.AMBIENT}
      intensity={0.55}
    />

    <directionalLight
      color={SCENE_COLORS.KEY_LIGHT}
      position={[5, 4, 7]}
      intensity={2.25}
    />

    <pointLight
      color={SCENE_COLORS.FILL_LIGHT}
      position={[-5, -2, 4]}
      intensity={0.5}
      distance={18}
    />
  </>
);

/* ============================================================================
 * SCENE CONTENT
 * ========================================================================== */

const SceneContent = ({
  configuration,
  selectedObjectId,
  objects,
  onObjectSelect,
  reduceMotion,
  controlsRef,
  onCameraActionsReady,
}) => {
  /**
   * Normalize incoming collection once.
   */
  const visualizationObjects =
    useMemo(
      () =>
        Array.isArray(objects)
          ? objects.filter(Boolean)
          : [],
      [objects],
    );

  /**
   * Separate satellites.
   */
  const satellites = useMemo(
    () =>
      visualizationObjects.filter(
        (object) =>
          getObjectType(object) ===
          "SATELLITE",
      ),
    [visualizationObjects],
  );

  /**
   * Separate debris.
   */
  const debris = useMemo(
    () =>
      visualizationObjects.filter(
        (object) =>
          getObjectType(object) ===
          "DEBRIS",
      ),
    [visualizationObjects],
  );

  /**
   * Apply satellite rendering budget.
   */
  const visibleSatellites =
    useMemo(
      () =>
        configuration?.showSatellites
          ? selectDisplayObjects(
              satellites,
              DISPLAY_LIMITS.MAX_SATELLITES,
              selectedObjectId,
            )
          : [],
      [
        satellites,
        selectedObjectId,
        configuration?.showSatellites,
      ],
    );

  /**
   * Apply debris rendering budget.
   */
  const visibleDebris = useMemo(
    () =>
      configuration?.showDebris
        ? selectDisplayObjects(
            debris,
            DISPLAY_LIMITS.MAX_DEBRIS,
            selectedObjectId,
          )
        : [],
    [
      debris,
      selectedObjectId,
      configuration?.showDebris,
    ],
  );

  /**
   * Defensive rendering invariant.
   */
  const totalVisibleObjects =
    visibleSatellites.length +
    visibleDebris.length;

  if (
    totalVisibleObjects >
    MAX_RENDERED_OBJECTS
  ) {
    console.warn(
      `[OrbitGuard] Visualization render budget exceeded: ${totalVisibleObjects}/${MAX_RENDERED_OBJECTS}`,
    );
  }

  /**
   * Resolve selected object from the actual rendered set.
   */
  const selectedObject = useMemo(
    () =>
      [
        ...visibleSatellites,
        ...visibleDebris,
      ].find(
        (object) =>
          sameObjectId(
            getObjectId(object),
            selectedObjectId,
          ),
      ) ?? null,
    [
      visibleSatellites,
      visibleDebris,
      selectedObjectId,
    ],
  );

  /**
   * Central selection boundary.
   *
   * SatelliteLayer and DebrisLayer both report
   * their resolved backend object here.
   */
  const handleObjectSelect =
    useCallback(
      (object) => {
        if (
          typeof onObjectSelect !==
          "function"
        ) {
          if (
            DEBUG_SCENE_EVENTS
          ) {
            console.warn(
              "[OrbitGuard][VisualizationScene] Selection event received, but onObjectSelect is not a function.",
              object,
            );
          }

          return;
        }

        if (
          DEBUG_SCENE_EVENTS
        ) {
          console.debug(
            "[OrbitGuard][VisualizationScene] Object selected.",
            {
              noradId:
                getObjectId(
                  object,
                ),
              name: object?.name,
              objectType:
                getObjectType(
                  object,
                ),
            },
          );
        }

        onObjectSelect(
          object ?? null,
        );
      },
      [onObjectSelect],
    );

  return (
    <>
      {/* =====================================================================
          BACKGROUND
          ================================================================== */}

      <color
        attach="background"
        args={[
          SCENE_COLORS.BACKGROUND,
        ]}
      />

      {/* =====================================================================
          LIGHTING
          ================================================================== */}

      <SceneLighting />

      {/* =====================================================================
          STAR FIELD
          ================================================================== */}

      <StarField
        reduceMotion={reduceMotion}
      />

      {/* =====================================================================
          EARTH
          ================================================================== */}

      <group>
        <Earth
          reduceMotion={
            reduceMotion
          }
        />

        <Atmosphere
          visible={Boolean(
            configuration?.showAtmosphere,
          )}
          reduceMotion={
            reduceMotion
          }
        />
      </group>

      {/* =====================================================================
          SATELLITE TRAILS
          ================================================================== */}

      {configuration?.showOrbitalTrails &&
        visibleSatellites.length >
          0 && (
          <OrbitalTrail
            objects={
              visibleSatellites
            }
            objectType="SATELLITE"
            selectedObjectId={
              selectedObjectId
            }
            reduceMotion={
              reduceMotion
            }
          />
        )}

      {/* =====================================================================
          DEBRIS TRAILS
          ================================================================== */}

      {configuration?.showOrbitalTrails &&
        visibleDebris.length > 0 && (
          <OrbitalTrail
            objects={visibleDebris}
            objectType="DEBRIS"
            selectedObjectId={
              selectedObjectId
            }
            reduceMotion={
              reduceMotion
            }
          />
        )}

      {/* =====================================================================
          SATELLITES

          Contract:
            selectedObjectId
            onObjectSelect
          ================================================================== */}

      {visibleSatellites.length >
        0 && (
        <SatelliteLayer
          objects={
            visibleSatellites
          }
          selectedObjectId={
            selectedObjectId
          }
          onObjectSelect={
            handleObjectSelect
          }
        />
      )}

      {/* =====================================================================
          DEBRIS

          Contract:
            selectedObjectId
            onObjectSelect
          ================================================================== */}

      {visibleDebris.length > 0 && (
        <DebrisLayer
          objects={visibleDebris}
          selectedObjectId={
            selectedObjectId
          }
          onObjectSelect={
            handleObjectSelect
          }
        />
      )}

      {/* =====================================================================
          SELECTED OBJECT
          ================================================================== */}

      <SelectedObject
        object={selectedObject}
        visible={Boolean(
          selectedObject,
        )}
        reduceMotion={
          reduceMotion
        }
      />

      {/* =====================================================================
          CAMERA BRIDGE
          ================================================================== */}

      <SceneCameraBridge
        controlsRef={
          controlsRef
        }
        onCameraActionsReady={
          onCameraActionsReady
        }
      />

      {/* =====================================================================
          SCENE ACTION BRIDGE
          ================================================================== */}

      <SceneActionBridge
        selectedObjectId={
          selectedObjectId
        }
      />

      {/* =====================================================================
          ORBIT CONTROLS
          ================================================================== */}

      <OrbitControls
        ref={controlsRef}
        makeDefault
        enablePan
        enableZoom
        enableRotate
        enableDamping
        dampingFactor={
          CAMERA_LIMITS.dampingFactor
        }
        minDistance={
          CAMERA_LIMITS.minDistance
        }
        maxDistance={
          CAMERA_LIMITS.maxDistance
        }
        rotateSpeed={
          CAMERA_LIMITS.rotateSpeed
        }
        zoomSpeed={
          CAMERA_LIMITS.zoomSpeed
        }
        panSpeed={
          CAMERA_LIMITS.panSpeed
        }
        target={[
          ...DEFAULT_CAMERA_TARGET,
        ]}
      />
    </>
  );
};

/* ============================================================================
 * VISUALIZATION SCENE
 * ========================================================================== */

const VisualizationScene = forwardRef(
  (
    {
      configuration,
      objects = [],
      selectedObjectId = null,
      onObjectSelect,
      onCameraActionsReady,
      reduceMotion = false,
    },
    ref,
  ) => {
    const controlsRef =
      useRef(null);

    useImperativeHandle(
      ref,
      () => ({
        showObjectOrbit(
          object,
        ) {
          return object ?? null;
        },

        hideSelectedOrbit() {
          return undefined;
        },
      }),
      [],
    );

    /**
     * Normalize configuration once.
     */
    const normalizedConfiguration =
      useMemo(
        () => ({
          filter: String(
            configuration?.filter ??
              "ALL",
          ).toUpperCase(),

          showSatellites:
            configuration?.showSatellites ??
            true,

          showDebris:
            configuration?.showDebris ??
            true,

          showOrbitalTrails:
            configuration?.showOrbitalTrails ??
            true,

          showAtmosphere:
            configuration?.showAtmosphere ??
            true,

          timelineOffsetMinutes:
            Number.isFinite(
              configuration?.timelineOffsetMinutes,
            )
              ? configuration.timelineOffsetMinutes
              : 0,
        }),
        [configuration],
      );

    /**
     * Apply page-level object filter.
     *
     * This works on the complete backend collection.
     *
     * The rendering budget is applied afterward.
     */
    const filteredObjects =
      useMemo(() => {
        if (
          !Array.isArray(objects)
        ) {
          return [];
        }

        const filter =
          normalizedConfiguration.filter;

        if (filter === "ALL") {
          return objects;
        }

        return objects.filter(
          (object) =>
            getObjectType(
              object,
            ) === filter,
        );
      }, [
        objects,
        normalizedConfiguration.filter,
      ]);

    return (
      <div
        className="
          absolute
          inset-0
          h-full
          min-h-0
          w-full
          overflow-hidden
          bg-[#010711]
        "
      >
        <Canvas
          camera={{
            position:
              DEFAULT_CAMERA.position,
            fov: DEFAULT_CAMERA.fov,
            near: DEFAULT_CAMERA.near,
            far: DEFAULT_CAMERA.far,
          }}

          /**
           * Device pixel ratio.
           */
          dpr={[1, 1.5]}

          /**
           * WebGL configuration.
           */
          gl={{
            antialias: true,
            alpha: false,
            powerPreference:
              "high-performance",
          }}

          /**
           * ================================================================
           * IMPORTANT — THREE.Points RAYCAST CONFIGURATION
           * ================================================================
           *
           * SatelliteLayer and DebrisLayer both render using THREE.Points.
           *
           * The raycaster threshold must be configured here.
           *
           * Do NOT rely on:
           *
           *   points.userData.orbitGuardRaycastThreshold
           *
           * because Three.js does not read custom userData values for
           * Points raycasting.
           *
           * This configuration is used by the actual Three.js Raycaster.
           */
          raycaster={{
            params: {
              Points: {
                threshold:
                  POINT_RAYCAST_THRESHOLD,
              },
            },
          }}

          frameloop="always"

          performance={{
            min: 0.5,
            max: 1,
            debounce: 200,
          }}

          onCreated={({
            camera,
            gl,
          }) => {
            gl.setClearColor(
              SCENE_COLORS.BACKGROUND,
              1,
            );

            camera.lookAt(
              ...DEFAULT_CAMERA_TARGET,
            );
          }}
        >
          <SceneContent
            configuration={
              normalizedConfiguration
            }
            selectedObjectId={
              selectedObjectId
            }
            objects={
              filteredObjects
            }
            onObjectSelect={
              onObjectSelect
            }
            reduceMotion={Boolean(
              reduceMotion,
            )}
            controlsRef={
              controlsRef
            }
            onCameraActionsReady={
              onCameraActionsReady
            }
          />
        </Canvas>
      </div>
    );
  },
);

VisualizationScene.displayName =
  "VisualizationScene";

export default VisualizationScene;