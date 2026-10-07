import {
  useEffect,
  useMemo,
  useRef,
} from "react";

import * as THREE from "three";

/**
 * ============================================================================
 * OrbitGuard AI — Debris Layer
 * ============================================================================
 *
 * RESPONSIBILITY
 * ----------------------------------------------------------------------------
 *
 * DebrisLayer renders orbital debris inside the 3D visualization.
 *
 * It owns:
 *
 * - debris GPU geometry
 * - debris marker colors
 * - debris marker size
 * - debris selection
 * - high-risk visual distinction
 * - efficient point rendering
 *
 * It does NOT own:
 *
 * - Earth
 * - atmosphere
 * - stars
 * - satellites
 * - orbital trails
 * - inspector UI
 * - camera
 * - timeline
 * - API communication
 * - orbital propagation
 * - SGP4 calculations
 * - TEME → ITRF conversion
 *
 * ============================================================================
 * PRODUCTION DATA CONTRACT
 * ============================================================================
 *
 * Expected backend object:
 *
 * {
 *   noradId: 23014,
 *   name: "DEBRIS-23014",
 *   objectType: "DEBRIS",
 *
 *   xKm: 1234.5,
 *   yKm: -4567.8,
 *   zKm: 2345.6,
 *
 *   latitude: 12.34,
 *   longitude: 78.90,
 *   altitudeKm: 420.5,
 *
 *   timestamp: "2026-10-06T14:00:00Z",
 *   frame: "ITRF",
 *
 *   riskLevel: "HIGH"
 * }
 *
 * The frontend does NOT reconstruct missing Cartesian coordinates.
 *
 * ============================================================================
 * COORDINATE CONTRACT
 * ============================================================================
 *
 * Backend:
 *
 *     ITRF kilometres
 *
 * Frontend:
 *
 *     Earth radius = 1 scene unit
 *
 * Conversion:
 *
 *     sceneX = xKm / 6371
 *     sceneY = yKm / 6371
 *     sceneZ = zKm / 6371
 *
 * This is only a unit conversion.
 *
 * The backend remains the source of orbital truth.
 *
 * ============================================================================
 * PERFORMANCE CONTRACT
 * ============================================================================
 *
 * Debris may eventually contain 11K+ objects.
 *
 * Therefore we use:
 *
 *     objects
 *        ↓
 *     Float32Array
 *        ↓
 *     BufferGeometry
 *        ↓
 *     THREE.Points
 *        ↓
 *     GPU
 *
 * We deliberately do NOT render:
 *
 *     objects.map(() => <mesh />)
 *
 * ============================================================================
 */

/* ============================================================================
 * CONSTANTS
 * ============================================================================ */

const EARTH_RADIUS_KM = 6371;

/**
 * Semantic debris colors.
 */
const DEBRIS_COLOR = "#f59e0b";

const HIGH_RISK_COLOR = "#ef4444";

const SELECTED_COLOR = "#e6fbff";

/**
 * Keep GPU pixel ratio bounded.
 */
const MAX_PIXEL_RATIO = 2;

/**
 * Marker size configuration.
 *
 * These values are intentionally restrained because the target UI is an
 * aerospace command-center visualization rather than a game-style particle
 * field.
 */
const POINT_SIZE = Object.freeze({
  normal: 4.2,
  medium: 5.4,
  highRisk: 7,
  selected: 9,
});

/* ============================================================================
 * PREVIEW DATA
 * ============================================================================
 *
 * UI DEVELOPMENT ONLY.
 *
 * This is intentionally exported so VisualizationScene can temporarily use
 * it while the visualization UI is being developed independently of the
 * backend visualization API.
 *
 * Once visualizationService.js is connected, production data should be passed
 * through the `objects` prop instead.
 */

export const DEBRIS_PREVIEW_OBJECTS =
  Object.freeze([
    {
      noradId: 21247,
      name: "DEBRIS-21247",
      objectType: "DEBRIS",

      xKm: 2100,
      yKm: -4150,
      zKm: 2250,

      latitude: 18.5,
      longitude: 74.2,
      altitudeKm: 510.4,

      timestamp:
        "2026-10-06T14:00:00Z",

      frame: "ITRF",

      riskLevel: "HIGH",
    },

    {
      noradId: 23014,
      name: "DEBRIS-23014",
      objectType: "DEBRIS",

      xKm: -3500,
      yKm: 2650,
      zKm: 3100,

      latitude: 27.8,
      longitude: 132.5,
      altitudeKm: 640.2,

      timestamp:
        "2026-10-06T14:00:00Z",

      frame: "ITRF",

      riskLevel: "MEDIUM",
    },

    {
      noradId: 24851,
      name: "DEBRIS-24851",
      objectType: "DEBRIS",

      xKm: 4650,
      yKm: 1850,
      zKm: -2350,

      latitude: -21.7,
      longitude: 21.4,
      altitudeKm: 575.8,

      timestamp:
        "2026-10-06T14:00:00Z",

      frame: "ITRF",

      riskLevel: "LOW",
    },

    {
      noradId: 29118,
      name: "DEBRIS-29118",
      objectType: "DEBRIS",

      xKm: -1750,
      yKm: -4800,
      zKm: 2550,

      latitude: 22.9,
      longitude: -109.6,
      altitudeKm: 720.5,

      timestamp:
        "2026-10-06T14:00:00Z",

      frame: "ITRF",

      riskLevel: "MEDIUM",
    },
  ]);

/* ============================================================================
 * OBJECT ID
 * ============================================================================ */

/**
 * Resolve the identifier used by the visualization selection system.
 *
 * Supports the same identifier hierarchy used by Visualization.jsx.
 */
const getObjectId = (object) =>
  object?.noradId ??
  object?.noradCatalogId ??
  object?.id ??
  null;

/* ============================================================================
 * VALIDATION
 * ============================================================================ */

/**
 * Validate backend-provided Cartesian coordinates.
 *
 * We intentionally do not reconstruct missing coordinates.
 */
const hasCartesianPosition = (
  object,
) =>
  Number.isFinite(
    Number(object?.xKm),
  ) &&
  Number.isFinite(
    Number(object?.yKm),
  ) &&
  Number.isFinite(
    Number(object?.zKm),
  );

/**
 * Make sure the object belongs to the debris layer.
 *
 * The scene normally filters this before passing data here, but keeping the
 * guard here prevents accidental satellite/debris mixing.
 */
const isDebrisObject = (
  object,
) =>
  String(
    object?.objectType ??
      object?.type ??
      "",
  ).toUpperCase() === "DEBRIS";

/* ============================================================================
 * RISK HELPERS
 * ============================================================================ */

/**
 * Normalize backend-provided risk information.
 *
 * No risk calculation occurs in the frontend.
 */
const getRiskLevel = (
  object,
) => {
  const value =
    object?.riskLevel ??
    object?.risk ??
    object?.collisionRisk ??
    "";

  return String(value)
    .trim()
    .toUpperCase();
};

const isHighRisk = (
  object,
) =>
  getRiskLevel(object) ===
  "HIGH";

const isMediumRisk = (
  object,
) =>
  getRiskLevel(object) ===
  "MEDIUM";

/* ============================================================================
 * POSITION CONVERSION
 * ============================================================================ */

/**
 * Convert ITRF kilometres into normalized Three.js scene coordinates.
 *
 * Backend coordinates remain untouched.
 */
const toScenePosition = (
  object,
) => [
  Number(object.xKm) /
    EARTH_RADIUS_KM,

  Number(object.yKm) /
    EARTH_RADIUS_KM,

  Number(object.zKm) /
    EARTH_RADIUS_KM,
];

/* ============================================================================
 * VALID OBJECTS
 * ============================================================================ */

/**
 * Prepare the subset that can actually be rendered.
 *
 * This keeps invalid backend records from entering the GPU buffers.
 */
const getRenderableObjects = (
  objects,
) => {
  if (!Array.isArray(objects)) {
    return [];
  }

  return objects.filter(
    (object) =>
      isDebrisObject(object) &&
      hasCartesianPosition(object),
  );
};

/* ============================================================================
 * DEBRIS GEOMETRY
 * ============================================================================ */

/**
 * Build one BufferGeometry for all visible debris.
 *
 * Every debris object becomes one GPU point.
 */
const createDebrisGeometry = (
  objects,
  selectedNoradId,
) => {
  const validObjects =
    getRenderableObjects(
      objects,
    );

  const count =
    validObjects.length;

  const positions =
    new Float32Array(
      count * 3,
    );

  const colors =
    new Float32Array(
      count * 3,
    );

  const sizes =
    new Float32Array(
      count,
    );

  const brightness =
    new Float32Array(
      count,
    );

  validObjects.forEach(
    (object, index) => {
      const [
        x,
        y,
        z,
      ] = toScenePosition(
        object,
      );

      const offset =
        index * 3;

      positions[offset] =
        x;

      positions[
        offset + 1
      ] = y;

      positions[
        offset + 2
      ] = z;

      /* ================================================================
         SELECTION
         ================================================================ */

      const objectId =
        getObjectId(object);

      const isSelected =
        String(objectId) ===
        String(
          selectedNoradId ??
            "",
        );

      /* ================================================================
         RISK
         ================================================================ */

      const highRisk =
        isHighRisk(object);

      const mediumRisk =
        isMediumRisk(object);

      /* ================================================================
         COLOR
         ================================================================ */

      const color =
        new THREE.Color(
          isSelected
            ? SELECTED_COLOR
            : highRisk
              ? HIGH_RISK_COLOR
              : DEBRIS_COLOR,
        );

      colors[offset] =
        color.r;

      colors[
        offset + 1
      ] = color.g;

      colors[
        offset + 2
      ] = color.b;

      /* ================================================================
         SIZE / BRIGHTNESS
         ================================================================ */

      if (isSelected) {
        sizes[index] =
          POINT_SIZE.selected;

        brightness[index] =
          1;
      } else if (highRisk) {
        sizes[index] =
          POINT_SIZE.highRisk;

        brightness[index] =
          0.95;
      } else if (mediumRisk) {
        sizes[index] =
          POINT_SIZE.medium;

        brightness[index] =
          0.82;
      } else {
        sizes[index] =
          POINT_SIZE.normal;

        brightness[index] =
          0.68;
      }
    },
  );

  const geometry =
    new THREE.BufferGeometry();

  geometry.setAttribute(
    "position",
    new THREE.BufferAttribute(
      positions,
      3,
    ),
  );

  geometry.setAttribute(
    "color",
    new THREE.BufferAttribute(
      colors,
      3,
    ),
  );

  geometry.setAttribute(
    "aSize",
    new THREE.BufferAttribute(
      sizes,
      1,
    ),
  );

  geometry.setAttribute(
    "aBrightness",
    new THREE.BufferAttribute(
      brightness,
      1,
    ),
  );

  geometry.computeBoundingSphere();

  return {
    geometry,
    validObjects,
  };
};

/* ============================================================================
 * DEBRIS VERTEX SHADER
 * ============================================================================ */

const DEBRIS_VERTEX_SHADER = `
  attribute float aSize;
  attribute float aBrightness;

  varying vec3 vColor;
  varying float vBrightness;

  uniform float uPixelRatio;

  void main() {

    vColor = color;
    vBrightness = aBrightness;

    vec4 modelPosition =
      modelViewMatrix *
      vec4(
        position,
        1.0
      );

    /*
     * Camera-space depth.
     *
     * Positive depth keeps the calculation stable.
     */
    float depth =
      max(
        -modelPosition.z,
        0.1
      );

    /*
     * Perspective-aware point size.
     */
    float pointSize =
      aSize *
      uPixelRatio *
      (55.0 / depth);

    gl_PointSize =
      clamp(
        pointSize,
        2.0,
        12.0
      );

    gl_Position =
      projectionMatrix *
      modelPosition;
  }
`;

/* ============================================================================
 * DEBRIS FRAGMENT SHADER
 * ============================================================================ */

const DEBRIS_FRAGMENT_SHADER = `
  varying vec3 vColor;
  varying float vBrightness;

  void main() {

    vec2 centered =
      gl_PointCoord -
      vec2(0.5);

    float distanceFromCenter =
      length(centered);

    /*
     * Circular marker.
     */
    if (
      distanceFromCenter >
      0.5
    ) {
      discard;
    }

    /*
     * Soft outer edge.
     */
    float edge =
      1.0 -
      smoothstep(
        0.25,
        0.5,
        distanceFromCenter
      );

    /*
     * Bright central core.
     */
    float core =
      1.0 -
      smoothstep(
        0.0,
        0.25,
        distanceFromCenter
      );

    float intensity =
      mix(
        0.72,
        1.0,
        core
      ) *
      vBrightness;

    float alpha =
      edge *
      intensity;

    if (
      alpha < 0.02
    ) {
      discard;
    }

    gl_FragColor =
      vec4(
        vColor,
        alpha
      );
  }
`;

/* ============================================================================
 * MATERIAL
 * ============================================================================ */

/**
 * Create the GPU material.
 *
 * Pixel ratio is updated after creation by the component effect so this
 * function remains safe and deterministic.
 */
const createDebrisMaterial = () =>
  new THREE.ShaderMaterial({
    uniforms: {
      uPixelRatio: {
        value: 1,
      },
    },

    vertexShader:
      DEBRIS_VERTEX_SHADER,

    fragmentShader:
      DEBRIS_FRAGMENT_SHADER,

    transparent: true,

    depthWrite: false,

    depthTest: true,

    vertexColors: true,

    blending:
      THREE.AdditiveBlending,

    toneMapped: false,
  });

/* ============================================================================
 * DEBRIS LAYER
 * ============================================================================ */

const DebrisLayer = ({
  objects = [],
  visible = true,
  selectedNoradId = null,
  onSelect,
}) => {
  const pointsRef =
    useRef(null);

  /* ==========================================================================
     GEOMETRY
     ========================================================================== */

  const {
    geometry,
    validObjects,
  } = useMemo(
    () =>
      createDebrisGeometry(
        objects,
        selectedNoradId,
      ),
    [
      objects,
      selectedNoradId,
    ],
  );

  /* ==========================================================================
     MATERIAL
     ========================================================================== */

  const material =
    useMemo(
      () =>
        createDebrisMaterial(),
      [],
    );

  /* ==========================================================================
     PIXEL RATIO
     ========================================================================== */

  useEffect(() => {
    const updatePixelRatio =
      () => {
        const pixelRatio =
          typeof window !==
          "undefined"
            ? window.devicePixelRatio ||
              1
            : 1;

        material.uniforms.uPixelRatio.value =
          Math.min(
            pixelRatio,
            MAX_PIXEL_RATIO,
          );
      };

    updatePixelRatio();

    window.addEventListener(
      "resize",
      updatePixelRatio,
    );

    return () => {
      window.removeEventListener(
        "resize",
        updatePixelRatio,
      );
    };
  }, [
    material,
  ]);

  /* ==========================================================================
     GEOMETRY CLEANUP
     ========================================================================== */

  useEffect(
    () => {
      return () => {
        geometry.dispose();
      };
    },
    [
      geometry,
    ],
  );

  /* ==========================================================================
     MATERIAL CLEANUP
     ========================================================================== */

  useEffect(
    () => {
      return () => {
        material.dispose();
      };
    },
    [
      material,
    ],
  );

  /* ==========================================================================
     POINTER SELECTION
     ========================================================================== */

  const handlePointerDown =
    (event) => {
      event.stopPropagation();

      const index =
        event.index;

      if (
        !Number.isInteger(
          index,
        )
      ) {
        return;
      }

      const selectedObject =
        validObjects[index];

      if (
        !selectedObject
      ) {
        return;
      }

      if (
        typeof onSelect ===
        "function"
      ) {
        onSelect(
          selectedObject,
        );
      }
    };

  /* ==========================================================================
     POINTER HOVER
     ========================================================================== */

  const handlePointerOver =
    (event) => {
      event.stopPropagation();

      if (
        typeof document !==
        "undefined"
      ) {
        document.body.style.cursor =
          "pointer";
      }
    };

  const handlePointerOut =
    (event) => {
      event.stopPropagation();

      if (
        typeof document !==
        "undefined"
      ) {
        document.body.style.cursor =
          "";
      }
    };

  /* ==========================================================================
     VISIBILITY
     ========================================================================== */

  if (
    !visible ||
    validObjects.length === 0
  ) {
    return null;
  }

  /* ==========================================================================
     RENDER
     ========================================================================== */

  return (
    <points
      ref={pointsRef}
      name="OrbitGuard-DebrisLayer"
      geometry={geometry}
      material={material}
      frustumCulled={false}
      renderOrder={11}
      onPointerDown={
        handlePointerDown
      }
      onPointerOver={
        handlePointerOver
      }
      onPointerOut={
        handlePointerOut
      }
    />
  );
};

export default DebrisLayer;