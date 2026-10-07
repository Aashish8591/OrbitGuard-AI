import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";

import * as THREE from "three";

/**
 * ============================================================================
 * OrbitGuard AI — Satellite Layer
 * ============================================================================
 *
 * RESPONSIBILITY
 * ----------------------------------------------------------------------------
 *
 * Renders satellite markers inside the 3D orbital visualization.
 *
 * This component owns:
 *
 * - satellite point geometry
 * - satellite marker colors
 * - satellite marker size
 * - satellite marker brightness
 * - pointer selection
 * - pointer hover state
 * - GPU-efficient point rendering
 *
 * This component does NOT own:
 *
 * - Earth
 * - atmosphere
 * - stars
 * - debris
 * - orbital trails
 * - object inspector
 * - camera
 * - timeline
 * - backend communication
 * - SGP4
 * - Orekit
 * - orbital propagation
 * - coordinate transformation
 *
 * ============================================================================
 * PRODUCTION DATA CONTRACT
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
 *   latitude: 12.34,
 *   longitude: 78.90,
 *   altitudeKm: 420.5,
 *   timestamp: "...",
 *   frame: "ITRF"
 * }
 *
 * The 3D marker uses only:
 *
 * - noradId / identifier
 * - name
 * - xKm
 * - yKm
 * - zKm
 *
 * All other telemetry remains attached to the object and is passed to the
 * parent when the satellite is selected.
 *
 * ============================================================================
 * COORDINATE SYSTEM
 * ============================================================================
 *
 * Earth.jsx uses:
 *
 *     radius = 1
 *
 * Backend:
 *
 *     xKm
 *     yKm
 *     zKm
 *
 * Therefore:
 *
 *     scenePosition = CartesianKm / 6371
 *
 * This component performs ONLY this unit conversion.
 *
 * It does NOT:
 *
 * - calculate latitude
 * - calculate longitude
 * - calculate altitude
 * - convert TEME
 * - propagate an orbit
 *
 * ============================================================================
 * PERFORMANCE
 * ============================================================================
 *
 * Satellite markers are rendered using:
 *
 *     THREE.Points
 *     BufferGeometry
 *     Float32Array
 *     ShaderMaterial
 *
 * One THREE.Points object can therefore represent thousands of satellites.
 *
 * ============================================================================
 */

/* ============================================================================
 * CONSTANTS
 * ========================================================================== */

const EARTH_RADIUS_KM = 6371;

/**
 * Primary OrbitGuard satellite color.
 */
const SATELLITE_COLOR = "#22d3ee";

/**
 * Selected satellite color.
 */
const SELECTED_COLOR = "#e6fbff";

/**
 * Maximum device pixel ratio used by the point shader.
 *
 * Prevents unnecessary GPU cost on high-DPI displays.
 */
const MAX_PIXEL_RATIO = 2;

/**
 * Normal satellite marker size.
 */
const NORMAL_MARKER_SIZE = 4.6;

/**
 * Selected satellite marker size.
 */
const SELECTED_MARKER_SIZE = 8.5;

/**
 * Normal satellite brightness.
 */
const NORMAL_BRIGHTNESS = 0.72;

/**
 * Selected satellite brightness.
 */
const SELECTED_BRIGHTNESS = 1.0;

/* ============================================================================
 * PREVIEW DATA
 * ========================================================================== */

/**
 * UI DEVELOPMENT DATA ONLY.
 *
 * This is intentionally small and synthetic.
 *
 * It must not be treated as real orbital data.
 *
 * Production flow:
 *
 *     Backend
 *       ↓
 *     visualization service
 *       ↓
 *     VisualizationScene
 *       ↓
 *     SatelliteLayer
 */
export const SATELLITE_PREVIEW_OBJECTS =
  Object.freeze([
    {
      noradId: 25544,
      name: "ISS (ZARYA)",
      objectType: "SATELLITE",

      xKm: 1120,
      yKm: -3650,
      zKm: 4650,

      latitude: 41.2,
      longitude: 73.8,
      altitudeKm: 408.5,

      timestamp: "2026-10-06T14:00:00Z",

      frame: "ITRF",
    },

    {
      noradId: 43013,
      name: "SENTINEL-2A",
      objectType: "SATELLITE",

      xKm: -4250,
      yKm: 3100,
      zKm: 2150,

      latitude: 27.4,
      longitude: 143.2,
      altitudeKm: 786.0,

      timestamp: "2026-10-06T14:00:00Z",

      frame: "ITRF",
    },

    {
      noradId: 39444,
      name: "LANDSAT 8",
      objectType: "SATELLITE",

      xKm: 5050,
      yKm: 1650,
      zKm: -2700,

      latitude: -24.1,
      longitude: 18.4,
      altitudeKm: 705.2,

      timestamp: "2026-10-06T14:00:00Z",

      frame: "ITRF",
    },

    {
      noradId: 49260,
      name: "STARLINK PREVIEW",
      objectType: "SATELLITE",

      xKm: -2200,
      yKm: -5250,
      zKm: 1200,

      latitude: 10.8,
      longitude: -112.5,
      altitudeKm: 550.0,

      timestamp: "2026-10-06T14:00:00Z",

      frame: "ITRF",
    },
  ]);

/* ============================================================================
 * IDENTIFIER
 * ========================================================================== */

/**
 * Supports all identifier shapes currently used by the visualization layer.
 */
const getObjectId = (object) =>
  object?.noradId ??
  object?.noradCatalogId ??
  object?.id ??
  null;

/* ============================================================================
 * OBJECT TYPE
 * ========================================================================== */

const isSatelliteObject = (object) => {
  const type = String(
    object?.objectType ??
      object?.type ??
      "",
  ).toUpperCase();

  return type === "SATELLITE";
};

/* ============================================================================
 * VALIDATION
 * ========================================================================== */

/**
 * Requires complete Cartesian coordinates.
 *
 * We intentionally do NOT derive x/y/z from latitude/longitude.
 *
 * Backend remains the source of truth.
 */
const hasCartesianPosition = (object) =>
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
 * Converts backend Cartesian kilometres into the normalized Earth scene.
 *
 * Earth radius:
 *
 *     6371 km = 1 Three.js scene unit
 */
const toScenePosition = (object) => [
  Number(object.xKm) / EARTH_RADIUS_KM,
  Number(object.yKm) / EARTH_RADIUS_KM,
  Number(object.zKm) / EARTH_RADIUS_KM,
];

/* ============================================================================
 * GEOMETRY
 * ========================================================================== */

/**
 * Builds one GPU-friendly BufferGeometry.
 *
 * Every satellite remains one point.
 *
 * Attributes:
 *
 *     position
 *     color
 *     aSize
 *     aBrightness
 */
const createSatelliteGeometry = (
  objects,
  selectedNoradId,
) => {
  const sourceObjects =
    Array.isArray(objects)
      ? objects
      : [];

  const validObjects =
    sourceObjects.filter(
      (object) =>
        isSatelliteObject(object) &&
        hasCartesianPosition(object),
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
    new Float32Array(count);

  const brightness =
    new Float32Array(count);

  validObjects.forEach(
    (object, index) => {
      const [
        x,
        y,
        z,
      ] = toScenePosition(
        object,
      );

      const positionOffset =
        index * 3;

      positions[
        positionOffset
      ] = x;

      positions[
        positionOffset + 1
      ] = y;

      positions[
        positionOffset + 2
      ] = z;

      const objectId = String(
        getObjectId(object) ?? "",
      );

      const selectedId = String(
        selectedNoradId ?? "",
      );

      const isSelected =
        objectId !== "" &&
        objectId === selectedId;

      const color =
        new THREE.Color(
          isSelected
            ? SELECTED_COLOR
            : SATELLITE_COLOR,
        );

      colors[
        positionOffset
      ] = color.r;

      colors[
        positionOffset + 1
      ] = color.g;

      colors[
        positionOffset + 2
      ] = color.b;

      sizes[index] =
        isSelected
          ? SELECTED_MARKER_SIZE
          : NORMAL_MARKER_SIZE;

      brightness[index] =
        isSelected
          ? SELECTED_BRIGHTNESS
          : NORMAL_BRIGHTNESS;
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
 * SHADERS
 * ========================================================================== */

const SATELLITE_VERTEX_SHADER = `
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
      vec4(position, 1.0);

    float depth =
      max(
        -modelPosition.z,
        0.1
      );

    /*
     * Perspective-aware marker size.
     *
     * The marker remains visible while zooming but is clamped so that
     * satellites never become oversized UI elements.
     */
    gl_PointSize =
      aSize *
      uPixelRatio *
      (55.0 / depth);

    gl_PointSize =
      clamp(
        gl_PointSize,
        2.0,
        12.0
      );

    gl_Position =
      projectionMatrix *
      modelPosition;
  }
`;

const SATELLITE_FRAGMENT_SHADER = `
  varying vec3 vColor;
  varying float vBrightness;

  void main() {
    vec2 centered =
      gl_PointCoord -
      vec2(0.5);

    float distanceFromCenter =
      length(centered);

    /*
     * Keep the marker circular.
     */
    if (
      distanceFromCenter > 0.5
    ) {
      discard;
    }

    /*
     * Soft outer edge.
     */
    float edge =
      1.0 -
      smoothstep(
        0.30,
        0.50,
        distanceFromCenter
      );

    /*
     * Bright central core.
     */
    float core =
      1.0 -
      smoothstep(
        0.0,
        0.24,
        distanceFromCenter
      );

    /*
     * Combine soft edge and bright core.
     */
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
 * ========================================================================== */

/**
 * Creates the satellite point material.
 *
 * No browser globals are accessed here so material creation remains safe
 * during module evaluation / non-browser environments.
 */
const createSatelliteMaterial = () =>
  new THREE.ShaderMaterial({
    uniforms: {
      uPixelRatio: {
        value: 1,
      },
    },

    vertexShader:
      SATELLITE_VERTEX_SHADER,

    fragmentShader:
      SATELLITE_FRAGMENT_SHADER,

    transparent: true,

    depthWrite: false,

    depthTest: true,

    vertexColors: true,

    blending:
      THREE.AdditiveBlending,

    toneMapped: false,
  });

/* ============================================================================
 * SATELLITE LAYER
 * ========================================================================== */

const SatelliteLayer = ({
  objects = [],
  visible = true,
  selectedNoradId = null,
  onSelect,
}) => {
  const pointsRef =
    useRef(null);

  /* --------------------------------------------------------------------------
   * GEOMETRY
   * ------------------------------------------------------------------------ */

  const {
    geometry,
    validObjects,
  } = useMemo(
    () =>
      createSatelliteGeometry(
        objects,
        selectedNoradId,
      ),
    [
      objects,
      selectedNoradId,
    ],
  );

  /* --------------------------------------------------------------------------
   * MATERIAL
   * ------------------------------------------------------------------------ */

  const material = useMemo(
    () =>
      createSatelliteMaterial(),
    [],
  );

  /* --------------------------------------------------------------------------
   * PIXEL RATIO
   * ------------------------------------------------------------------------ */

  useEffect(() => {
    const updatePixelRatio =
      () => {
        if (
          typeof window ===
          "undefined"
        ) {
          return;
        }

        material.uniforms.uPixelRatio.value =
          Math.min(
            window.devicePixelRatio ||
              1,
            MAX_PIXEL_RATIO,
          );
      };

    updatePixelRatio();

    if (
      typeof window ===
      "undefined"
    ) {
      return undefined;
    }

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
  }, [material]);

  /* --------------------------------------------------------------------------
   * GEOMETRY CLEANUP
   * ------------------------------------------------------------------------ */

  useEffect(() => {
    return () => {
      geometry.dispose();
    };
  }, [geometry]);

  /* --------------------------------------------------------------------------
   * MATERIAL CLEANUP
   *
   * Material is memoized for the lifetime of this component.
   * ------------------------------------------------------------------------ */

  useEffect(() => {
    return () => {
      material.dispose();
    };
  }, [material]);

  /* --------------------------------------------------------------------------
   * POINTER SELECTION
   * ------------------------------------------------------------------------ */

  const handlePointerDown =
    useCallback(
      (event) => {
        event.stopPropagation();

        const index =
          event.index;

        if (
          !Number.isInteger(index)
        ) {
          return;
        }

        const selectedObject =
          validObjects[index];

        if (!selectedObject) {
          return;
        }

        onSelect?.(
          selectedObject,
        );
      },
      [
        validObjects,
        onSelect,
      ],
    );

  /* --------------------------------------------------------------------------
   * POINTER OVER
   * ------------------------------------------------------------------------ */

  const handlePointerOver =
    useCallback(
      (event) => {
        event.stopPropagation();

        if (
          typeof document !==
          "undefined"
        ) {
          document.body.style.cursor =
            "pointer";
        }
      },
      [],
    );

  /* --------------------------------------------------------------------------
   * POINTER OUT
   * ------------------------------------------------------------------------ */

  const handlePointerOut =
    useCallback(
      (event) => {
        event.stopPropagation();

        if (
          typeof document !==
          "undefined"
        ) {
          document.body.style.cursor =
            "";
        }
      },
      [],
    );

  /* --------------------------------------------------------------------------
   * VISIBILITY
   * ------------------------------------------------------------------------ */

  if (
    !visible ||
    validObjects.length === 0
  ) {
    return null;
  }

  /* --------------------------------------------------------------------------
   * RENDER
   * ------------------------------------------------------------------------ */

  return (
    <points
      ref={pointsRef}
      name="OrbitGuard-SatelliteLayer"
      geometry={geometry}
      material={material}
      frustumCulled={false}
      renderOrder={10}
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

export default SatelliteLayer;