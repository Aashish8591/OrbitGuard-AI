import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";

import {
  Canvas,
  useThree,
} from "@react-three/fiber";

import {
  OrbitControls,
} from "@react-three/drei";

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
 * IMPORTANT:
 * Backend visualization objects are the source of truth.
 *
 * Expected visualization object contract includes:
 *
 * {
 *   noradId,
 *   name,
 *   objectType,
 *   latitude,
 *   longitude,
 *   altitudeKm,
 *   timestamp,
 *   xKm,
 *   yKm,
 *   zKm,
 *   frame
 * }
 *
 * This component does not:
 *
 * - call APIs
 * - calculate SGP4
 * - calculate Orekit
 * - convert latitude/longitude
 * - calculate collision risk
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

const DEFAULT_CAMERA_TARGET =
  Object.freeze([
    0,
    0,
    0,
  ]);

const CAMERA_LIMITS = Object.freeze({
  minDistance: 2.8,
  maxDistance: 16,
  rotateSpeed: 0.45,
  zoomSpeed: 0.7,
  panSpeed: 0.4,
  dampingFactor: 0.075,
});

const CAMERA_FOCUS_DISTANCE = 3.2;

const SCENE_COLORS = Object.freeze({
  BACKGROUND: "#010711",
  AMBIENT: "#b9d9ea",
  KEY_LIGHT: "#ffffff",
  FILL_LIGHT: "#38bdf8",
});

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

const sameObjectId = (
  first,
  second,
) => {
  if (
    first === null ||
    first === undefined ||
    second === null ||
    second === undefined
  ) {
    return false;
  }

  return (
    String(first) ===
    String(second)
  );
};

/* ============================================================================
 * CAMERA BRIDGE
 * ========================================================================== */

const SceneCameraBridge = ({
  controlsRef,
  onCameraActionsReady,
}) => {
  const { camera } = useThree();

  const actionsRef =
    useRef(null);

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
        return controlsRef.current.target;
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

      camera.up.set(
        0,
        1,
        0,
      );

      if (
        controlsRef.current
      ) {
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

    const focusObject = (
      object,
    ) => {
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
        direction.set(
          0,
          0,
          1,
        );
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

      if (
        controlsRef.current
      ) {
        controlsRef.current.target.copy(
          target,
        );

        controlsRef.current.update();
      } else {
        camera.lookAt(
          target,
        );
      }
    };

    const actions = {
      zoomIn,
      zoomOut,
      reset,
      focusObject,
    };

    actionsRef.current =
      actions;

    onCameraActionsReady(
      actions,
    );

    return () => {
      if (
        actionsRef.current ===
        actions
      ) {
        actionsRef.current =
          null;
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
  const sceneStateRef =
    useRef({
      selectedObjectId:
        selectedObjectId ?? null,
      showSelectedOrbit:
        false,
    });

  useEffect(() => {
    sceneStateRef.current.selectedObjectId =
      selectedObjectId ?? null;
  }, [
    selectedObjectId,
  ]);

  return null;
};

/* ============================================================================
 * LIGHTING
 * ========================================================================== */

const SceneLighting = () => (
  <>
    <ambientLight
      color={
        SCENE_COLORS.AMBIENT
      }
      intensity={0.55}
    />

    <directionalLight
      color={
        SCENE_COLORS.KEY_LIGHT
      }
      position={[
        5,
        4,
        7,
      ]}
      intensity={2.25}
    />

    <pointLight
      color={
        SCENE_COLORS.FILL_LIGHT
      }
      position={[
        -5,
        -2,
        4,
      ]}
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
  const visualizationObjects =
    useMemo(
      () =>
        Array.isArray(objects)
          ? objects.filter(Boolean)
          : [],
      [objects],
    );

  const satellites =
    useMemo(
      () =>
        visualizationObjects.filter(
          (object) =>
            getObjectType(
              object,
            ) === "SATELLITE",
        ),
      [visualizationObjects],
    );

  const debris =
    useMemo(
      () =>
        visualizationObjects.filter(
          (object) =>
            getObjectType(
              object,
            ) === "DEBRIS",
        ),
      [visualizationObjects],
    );

  const visibleSatellites =
    configuration?.showSatellites
      ? satellites
      : [];

  const visibleDebris =
    configuration?.showDebris
      ? debris
      : [];

  const selectedObject =
    useMemo(
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

  const handleObjectSelect =
    useCallback(
      (object) => {
        if (
          typeof onObjectSelect !==
          "function"
        ) {
          return;
        }

        onObjectSelect(
          object ?? null,
        );
      },
      [onObjectSelect],
    );

  return (
    <>
      {/* ================================================================
          DEEP SPACE
          ================================================================ */}

      <color
        attach="background"
        args={[
          SCENE_COLORS.BACKGROUND,
        ]}
      />

      {/* ================================================================
          LIGHTING
          ================================================================ */}

      <SceneLighting />

      {/* ================================================================
          STAR FIELD
          ================================================================ */}

      <StarField
        reduceMotion={
          reduceMotion
        }
      />

      {/* ================================================================
          EARTH
          
          IMPORTANT:
          Earth.jsx has radius 1.
          SatelliteLayer / OrbitalTrail normalize km using 6371.
          
          Therefore Earth MUST remain at scale 1 here.
          ================================================================ */}

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

      {/* ================================================================
          SATELLITE TRAILS
          ================================================================ */}

      {configuration?.showOrbitalTrails &&
        visibleSatellites.length > 0 && (
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

      {/* ================================================================
          DEBRIS TRAILS
          ================================================================ */}

      {configuration?.showOrbitalTrails &&
        visibleDebris.length > 0 && (
          <OrbitalTrail
            objects={
              visibleDebris
            }
            objectType="DEBRIS"
            selectedObjectId={
              selectedObjectId
            }
            reduceMotion={
              reduceMotion
            }
          />
        )}

      {/* ================================================================
          SATELLITES
          ================================================================ */}

      {visibleSatellites.length > 0 && (
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
          reduceMotion={
            reduceMotion
          }
        />
      )}

      {/* ================================================================
          DEBRIS
          ================================================================ */}

      {visibleDebris.length > 0 && (
        <DebrisLayer
          objects={
            visibleDebris
          }
          selectedObjectId={
            selectedObjectId
          }
          onObjectSelect={
            handleObjectSelect
          }
          reduceMotion={
            reduceMotion
          }
        />
      )}

      {/* ================================================================
          SELECTED OBJECT
          ================================================================ */}

      <SelectedObject
        object={selectedObject}
        visible={Boolean(
          selectedObject,
        )}
        reduceMotion={
          reduceMotion
        }
      />

      {/* ================================================================
          CAMERA BRIDGE
          ================================================================ */}

      <SceneCameraBridge
        controlsRef={
          controlsRef
        }
        onCameraActionsReady={
          onCameraActionsReady
        }
      />

      <SceneActionBridge
        selectedObjectId={
          selectedObjectId
        }
      />

      {/* ================================================================
          ORBIT CONTROLS
          ================================================================ */}

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

const VisualizationScene =
  forwardRef(
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

      const normalizedConfiguration =
        useMemo(
          () => ({
            filter:
              String(
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

      const filteredObjects =
        useMemo(
          () => {
            if (
              !Array.isArray(objects)
            ) {
              return [];
            }

            const filter =
              normalizedConfiguration.filter;

            if (
              filter === "ALL"
            ) {
              return objects;
            }

            return objects.filter(
              (object) =>
                getObjectType(
                  object,
                ) === filter,
            );
          },
          [
            objects,
            normalizedConfiguration.filter,
          ],
        );

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
              fov:
                DEFAULT_CAMERA.fov,
              near:
                DEFAULT_CAMERA.near,
              far:
                DEFAULT_CAMERA.far,
            }}
            dpr={[
              1,
              1.5,
            ]}
            gl={{
              antialias: true,
              alpha: false,
              powerPreference:
                "high-performance",
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