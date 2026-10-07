import {
  useEffect,
  useMemo,
  useRef,
} from "react";

import { useFrame } from "@react-three/fiber";

import * as THREE from "three";

/**
 * ============================================================================
 * OrbitGuard AI — Selected Object
 * ============================================================================
 *
 * RESPONSIBILITY
 * ----------------------------------------------------------------------------
 *
 * Renders the visual selection indicator around the currently selected
 * satellite/debris object.
 *
 * Owns:
 *
 * - selected-object core
 * - selected-object glow
 * - selection ring
 * - outer radar pulse
 * - reduced-motion behavior
 *
 * Does NOT own:
 *
 * - selection state
 * - object inspector
 * - satellite rendering
 * - debris rendering
 * - orbital trails
 * - camera
 * - timeline
 * - backend/API calls
 * - SGP4
 * - Orekit
 * - risk calculations
 *
 * ============================================================================
 * DATA CONTRACT
 * ============================================================================
 *
 * Expected object:
 *
 * {
 *   noradId: 25544,
 *   name: "ISS (ZARYA)",
 *   objectType: "SATELLITE",
 *   xKm: 1234.5,
 *   yKm: -4567.8,
 *   zKm: 2345.6,
 *   frame: "ITRF"
 * }
 *
 * ============================================================================
 * COORDINATE CONTRACT
 * ============================================================================
 *
 * Backend:
 *
 *     xKm
 *     yKm
 *     zKm
 *
 * Earth scene:
 *
 *     radius = 1
 *
 * Therefore:
 *
 *     scenePosition = CartesianKm / 6371
 *
 * This component performs only the unit conversion.
 *
 * ============================================================================
 * VISUAL LANGUAGE
 * ============================================================================
 *
 * Selected:
 *
 *     bright cyan / white
 *
 * The selected object intentionally has the strongest visual priority in the
 * 3D viewport.
 *
 * ============================================================================
 * INTERACTION
 * ============================================================================
 *
 * This component NEVER captures pointer events.
 *
 * SatelliteLayer / DebrisLayer remain responsible for selection.
 * ============================================================================
 */

/* ============================================================================
 * CONSTANTS
 * ========================================================================== */

const EARTH_RADIUS_KM = 6371;

/**
 * Selection palette.
 */
const SELECTED_COLOR = "#67e8f9";
const SELECTED_CORE_COLOR = "#f0fdff";
const SELECTED_GLOW_COLOR = "#22d3ee";
const SELECTED_RING_COLOR = "#67e8f9";

/**
 * Core sizes are deliberately larger than the raw satellite point.
 *
 * This makes the selection state visible even when the camera is not close
 * to the object.
 */
const CORE_RADIUS = 0.026;
const GLOW_RADIUS = 0.056;

/**
 * Inner targeting ring.
 */
const INNER_RING_RADIUS = 0.068;
const INNER_RING_TUBE = 0.005;

/**
 * Outer radar ring.
 */
const OUTER_RING_RADIUS = 0.098;
const OUTER_RING_TUBE = 0.002;

/**
 * Radar pulse duration in seconds.
 */
const PULSE_DURATION = 2.2;

/**
 * Animation amplitudes.
 *
 * These are deliberately restrained for the professional mission-control UI.
 */
const CORE_PULSE_AMOUNT = 0.08;
const GLOW_PULSE_AMOUNT = 0.12;

/* ============================================================================
 * IDENTIFIER
 * ========================================================================== */

/**
 * Supports the identifier variants used by the visualization data layer.
 */
const getObjectId = (object) =>
  object?.noradId ??
  object?.noradCatalogId ??
  object?.id ??
  null;

/* ============================================================================
 * POSITION VALIDATION
 * ========================================================================== */

const hasValidPosition = (object) =>
  Number.isFinite(
    Number(object?.xKm),
  ) &&
  Number.isFinite(
    Number(object?.yKm),
  ) &&
  Number.isFinite(
    Number(object?.zKm),
  );

/* ============================================================================
 * POSITION CONVERSION
 * ========================================================================== */

/**
 * Backend ITRF Cartesian kilometres
 * -> normalized Three.js Earth coordinates.
 *
 * No orbital calculation is performed.
 */
const toScenePosition = (object) => {
  if (!hasValidPosition(object)) {
    return [0, 0, 0];
  }

  return [
    Number(object.xKm) /
      EARTH_RADIUS_KM,

    Number(object.yKm) /
      EARTH_RADIUS_KM,

    Number(object.zKm) /
      EARTH_RADIUS_KM,
  ];
};

/* ============================================================================
 * RADIAL ORIENTATION
 * ========================================================================== */

/**
 * Orient the selection rings so their normal points away from Earth.
 *
 * The torus geometry is initially oriented around the local Z axis.
 */
const createRadialQuaternion = (
  position,
) => {
  const radialDirection =
    new THREE.Vector3(
      position[0],
      position[1],
      position[2],
    );

  if (
    radialDirection.lengthSq() <
    0.000001
  ) {
    return new THREE.Quaternion();
  }

  radialDirection.normalize();

  const defaultNormal =
    new THREE.Vector3(
      0,
      0,
      1,
    );

  return new THREE.Quaternion().setFromUnitVectors(
    defaultNormal,
    radialDirection,
  );
};

/* ============================================================================
 * MATERIALS
 * ========================================================================== */

const createCoreMaterial = () =>
  new THREE.MeshBasicMaterial({
    color:
      SELECTED_CORE_COLOR,

    transparent: true,

    opacity: 1,

    depthWrite: false,

    depthTest: true,

    blending:
      THREE.AdditiveBlending,

    toneMapped: false,
  });

const createGlowMaterial = () =>
  new THREE.MeshBasicMaterial({
    color:
      SELECTED_GLOW_COLOR,

    transparent: true,

    opacity: 0.20,

    depthWrite: false,

    depthTest: true,

    blending:
      THREE.AdditiveBlending,

    toneMapped: false,
  });

const createRingMaterial = () =>
  new THREE.MeshBasicMaterial({
    color:
      SELECTED_RING_COLOR,

    transparent: true,

    opacity: 0.90,

    depthWrite: false,

    depthTest: true,

    blending:
      THREE.AdditiveBlending,

    toneMapped: false,
  });

const createOuterRingMaterial = () =>
  new THREE.MeshBasicMaterial({
    color:
      SELECTED_COLOR,

    transparent: true,

    opacity: 0.28,

    depthWrite: false,

    depthTest: true,

    blending:
      THREE.AdditiveBlending,

    toneMapped: false,
  });

/* ============================================================================
 * SELECTED OBJECT
 * ========================================================================== */

const SelectedObject = ({
  object = null,
  visible = true,
  reduceMotion = false,
}) => {
  const groupRef =
    useRef(null);

  const coreRef =
    useRef(null);

  const glowRef =
    useRef(null);

  const innerRingRef =
    useRef(null);

  const outerRingRef =
    useRef(null);

  /* --------------------------------------------------------------------------
   * POSITION
   * ------------------------------------------------------------------------ */

  const position = useMemo(
    () =>
      object
        ? toScenePosition(
            object,
          )
        : [0, 0, 0],
    [object],
  );

  /* --------------------------------------------------------------------------
   * RADIAL ORIENTATION
   * ------------------------------------------------------------------------ */

  const radialQuaternion =
    useMemo(
      () =>
        createRadialQuaternion(
          position,
        ),
      [position],
    );

  /* --------------------------------------------------------------------------
   * MATERIALS
   * ------------------------------------------------------------------------ */

  const coreMaterial = useMemo(
    () =>
      createCoreMaterial(),
    [],
  );

  const glowMaterial = useMemo(
    () =>
      createGlowMaterial(),
    [],
  );

  const ringMaterial = useMemo(
    () =>
      createRingMaterial(),
    [],
  );

  const outerRingMaterial =
    useMemo(
      () =>
        createOuterRingMaterial(),
      [],
    );

  /* --------------------------------------------------------------------------
   * ANIMATION
   * ------------------------------------------------------------------------ */

  useFrame((state) => {
    if (
      !groupRef.current ||
      !coreRef.current ||
      !glowRef.current ||
      !innerRingRef.current ||
      !outerRingRef.current
    ) {
      return;
    }

    /* ----------------------------------------------------------------------
     * REDUCED MOTION
     * -------------------------------------------------------------------- */

    if (reduceMotion) {
      coreRef.current.scale.setScalar(
        1,
      );

      glowRef.current.scale.setScalar(
        1,
      );

      innerRingRef.current.scale.setScalar(
        1,
      );

      outerRingRef.current.scale.setScalar(
        1,
      );

      coreMaterial.opacity = 1;
      glowMaterial.opacity = 0.20;
      ringMaterial.opacity = 0.90;
      outerRingMaterial.opacity = 0.28;

      return;
    }

    const elapsed =
      state.clock.getElapsedTime();

    /* ----------------------------------------------------------------------
     * CORE
     *
     * Very subtle breathing effect.
     * -------------------------------------------------------------------- */

    const coreScale =
      1 +
      Math.sin(
        elapsed * 3.0,
      ) *
        CORE_PULSE_AMOUNT;

    coreRef.current.scale.setScalar(
      coreScale,
    );

    /* ----------------------------------------------------------------------
     * GLOW
     * -------------------------------------------------------------------- */

    const glowScale =
      1 +
      Math.sin(
        elapsed * 2.2,
      ) *
        GLOW_PULSE_AMOUNT;

    glowRef.current.scale.setScalar(
      glowScale,
    );

    /* ----------------------------------------------------------------------
     * INNER RING
     *
     * Almost static. This keeps the selected object easy to track.
     * -------------------------------------------------------------------- */

    const ringScale =
      1 +
      Math.sin(
        elapsed * 2.0,
      ) *
        0.035;

    innerRingRef.current.scale.setScalar(
      ringScale,
    );

    /* ----------------------------------------------------------------------
     * OUTER RADAR PULSE
     * -------------------------------------------------------------------- */

    const normalizedTime =
      (
        elapsed %
        PULSE_DURATION
      ) /
      PULSE_DURATION;

    const pulse =
      Math.sin(
        normalizedTime *
          Math.PI,
      );

    const outerScale =
      1 +
      pulse * 0.65;

    outerRingRef.current.scale.setScalar(
      outerScale,
    );

    /*
     * Fade the outer ring while it expands.
     *
     * This creates the restrained radar-pulse appearance.
     */
    outerRingMaterial.opacity =
      0.28 -
      pulse * 0.18;
  });

  /* --------------------------------------------------------------------------
   * MATERIAL CLEANUP
   * ------------------------------------------------------------------------ */

  useEffect(() => {
    return () => {
      coreMaterial.dispose();
      glowMaterial.dispose();
      ringMaterial.dispose();
      outerRingMaterial.dispose();
    };
  }, [
    coreMaterial,
    glowMaterial,
    ringMaterial,
    outerRingMaterial,
  ]);

  /* --------------------------------------------------------------------------
   * EMPTY STATE
   * ------------------------------------------------------------------------ */

  if (
    !visible ||
    !object ||
    !hasValidPosition(object)
  ) {
    return null;
  }

  /* --------------------------------------------------------------------------
   * OBJECT METADATA
   * ------------------------------------------------------------------------ */

  const objectId =
    getObjectId(object);

  /* --------------------------------------------------------------------------
   * RENDER
   * ------------------------------------------------------------------------ */

  return (
    <group
      ref={groupRef}
      name="OrbitGuard-SelectedObject"
      position={position}
      quaternion={radialQuaternion}
      userData={{
        type:
          "selected-object",

        noradId:
          objectId ?? null,

        objectType:
          object.objectType ??
          null,

        frame:
          object.frame ??
          "ITRF",
      }}

      /*
       * IMPORTANT:
       *
       * The selection indicator must never intercept pointer events.
       *
       * SatelliteLayer / DebrisLayer remain responsible for interaction.
       */
      raycast={() => null}
    >
      {/* ==================================================================
          CORE
          ================================================================== */}

      <mesh
        ref={coreRef}
        name="SelectedObject-Core"
        material={
          coreMaterial
        }
        renderOrder={30}
      >
        <sphereGeometry
          args={[
            CORE_RADIUS,
            16,
            16,
          ]}
        />
      </mesh>

      {/* ==================================================================
          SOFT GLOW
          ================================================================== */}

      <mesh
        ref={glowRef}
        name="SelectedObject-Glow"
        material={
          glowMaterial
        }
        renderOrder={29}
      >
        <sphereGeometry
          args={[
            GLOW_RADIUS,
            16,
            16,
          ]}
        />
      </mesh>

      {/* ==================================================================
          INNER TARGETING RING
          ================================================================== */}

      <mesh
        ref={innerRingRef}
        name="SelectedObject-InnerRing"
        material={
          ringMaterial
        }
        renderOrder={31}
      >
        <torusGeometry
          args={[
            INNER_RING_RADIUS,
            INNER_RING_TUBE,
            12,
            48,
          ]}
        />
      </mesh>

      {/* ==================================================================
          OUTER RADAR RING
          ================================================================== */}

      <mesh
        ref={outerRingRef}
        name="SelectedObject-OuterRing"
        material={
          outerRingMaterial
        }
        renderOrder={30}
      >
        <torusGeometry
          args={[
            OUTER_RING_RADIUS,
            OUTER_RING_TUBE,
            8,
            64,
          ]}
        />
      </mesh>
    </group>
  );
};

export default SelectedObject;