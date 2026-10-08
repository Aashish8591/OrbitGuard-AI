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
 * Renders backend-provided satellite positions as GPU-efficient THREE.Points.
 *
 * This component owns:
 *
 * - satellite point geometry
 * - satellite marker color
 * - satellite marker size
 * - satellite brightness
 * - pointer selection
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
 * Expected backend object:
 *
 * {
 *   noradId: 25544,
 *   name: "ISS (ZARYA)",
 *   objectType: "SATELLITE",
 *
 *   xKm: 1234.5,
 *   yKm: -4567.8,
 *   zKm: 2345.6,
 *
 *   latitude: 12.34,
 *   longitude: 78.90,
 *   altitudeKm: 420.5,
 *
 *   timestamp: "...",
 *   frame: "ITRF"
 * }
 *
 * Backend remains the source of truth.
 *
 * ============================================================================
 * COORDINATE SYSTEM
 * ============================================================================
 *
 * Earth scene radius:
 *
 *   1 Three.js unit
 *
 * Backend Cartesian coordinates:
 *
 *   kilometres
 *
 * Therefore:
 *
 *   scenePosition = CartesianKm / 6371
 *
 * ============================================================================
 * PERFORMANCE
 * ============================================================================
 *
 * VisualizationScene owns the rendering budget.
 *
 * This component does not arbitrarily slice the input.
 *
 * Important performance rule:
 *
 * SatelliteLayer does NOT attach pointer-hover handlers.
 *
 * Hovering across thousands of THREE.Points can cause continuous raycasting
 * during pointer movement and compete with OrbitControls.
 *
 * Selection is therefore click/tap based only.
 *
 * ============================================================================
 */

const EARTH_RADIUS_KM = 6371;

const SATELLITE_COLOR = "#22d3ee";

const SELECTED_COLOR = "#e6fbff";

const MAX_PIXEL_RATIO = 2;

const NORMAL_MARKER_SIZE = 4.6;

const SELECTED_MARKER_SIZE = 8.5;

const NORMAL_BRIGHTNESS = 0.72;

const SELECTED_BRIGHTNESS = 1.0;

/**
 * ============================================================================
 * POINT RAYCAST THRESHOLD
 * ============================================================================
 *
 * Unit:
 *
 *   Three.js world units.
 *
 * Conversion:
 *
 *   1 scene unit = 6371 km
 *
 * Therefore:
 *
 *   0.012 scene units ≈ 76.45 km
 *
 * This is intentionally tight enough to avoid excessive neighbouring
 * satellite matches while still allowing practical point selection.
 */

const POINT_RAYCAST_THRESHOLD = 0.012;

/**
 * ============================================================================
 * OPTIONAL DEVELOPMENT PREVIEW DATA
 * ============================================================================
 *
 * Kept for compatibility with any existing import.
 *
 * Production rendering does NOT use this data.
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

      timestamp:
        "2026-10-06T14:00:00Z",

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

      timestamp:
        "2026-10-06T14:00:00Z",

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

      timestamp:
        "2026-10-06T14:00:00Z",

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

      timestamp:
        "2026-10-06T14:00:00Z",

      frame: "ITRF",
    },
  ]);

/* ============================================================================
 * IDENTIFIER
 * ========================================================================== */

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
  )
    .trim()
    .toUpperCase();

  return type === "SATELLITE";
};

/* ============================================================================
 * NUMERIC VALIDATION
 * ========================================================================== */

const toFiniteNumber = (value) => {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : null;
};

const hasCartesianPosition = (object) => {
  return (
    toFiniteNumber(
      object?.xKm ??
        object?.xkm,
    ) !== null &&
    toFiniteNumber(
      object?.yKm ??
        object?.ykm,
    ) !== null &&
    toFiniteNumber(
      object?.zKm ??
        object?.zkm,
    ) !== null
  );
};

/* ============================================================================
 * POSITION CONVERSION
 * ========================================================================== */

const toScenePosition = (object) => {
  /**
   * Backend responses have already been normalized by visualizationService,
   * but the lowercase fallback is retained defensively.
   */
  const xKm = toFiniteNumber(
    object?.xKm ??
      object?.xkm,
  );

  const yKm = toFiniteNumber(
    object?.yKm ??
      object?.ykm,
  );

  const zKm = toFiniteNumber(
    object?.zKm ??
      object?.zkm,
  );

  if (
    xKm === null ||
    yKm === null ||
    zKm === null
  ) {
    return null;
  }

  return [
    xKm / EARTH_RADIUS_KM,
    yKm / EARTH_RADIUS_KM,
    zKm / EARTH_RADIUS_KM,
  ];
};

/* ============================================================================
 * GEOMETRY
 * ========================================================================== */

/**
 * Creates the complete satellite GPU geometry in one pass.
 *
 * Important optimization:
 *
 * The previous implementation validated every object and then calculated
 * toScenePosition() again during the second loop.
 *
 * This implementation calculates the scene position once per valid object.
 */
const createSatelliteGeometry = (
  objects,
  selectedObjectId,
) => {
  const sourceObjects =
    Array.isArray(objects)
      ? objects
      : [];

  const validObjects = [];

  const scenePositions = [];

  for (const object of sourceObjects) {
    if (!isSatelliteObject(object)) {
      continue;
    }

    const position =
      toScenePosition(object);

    if (!position) {
      continue;
    }

    const [x, y, z] =
      position;

    if (
      !Number.isFinite(x) ||
      !Number.isFinite(y) ||
      !Number.isFinite(z)
    ) {
      continue;
    }

    validObjects.push(object);
    scenePositions.push(position);
  }

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

  const selectedId =
    String(
      selectedObjectId ?? "",
    );

  const color =
    new THREE.Color();

  for (
    let index = 0;
    index < count;
    index += 1
  ) {
    const object =
      validObjects[index];

    const position =
      scenePositions[index];

    const [x, y, z] =
      position;

    const offset =
      index * 3;

    positions[offset] = x;
    positions[offset + 1] = y;
    positions[offset + 2] = z;

    const objectId =
      String(
        getObjectId(object) ?? "",
      );

    const isSelected =
      objectId !== "" &&
      objectId === selectedId;

    color.set(
      isSelected
        ? SELECTED_COLOR
        : SATELLITE_COLOR,
    );

    colors[offset] =
      color.r;

    colors[offset + 1] =
      color.g;

    colors[offset + 2] =
      color.b;

    sizes[index] =
      isSelected
        ? SELECTED_MARKER_SIZE
        : NORMAL_MARKER_SIZE;

    brightness[index] =
      isSelected
        ? SELECTED_BRIGHTNESS
        : NORMAL_BRIGHTNESS;
  }

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

  /**
   * Keep normal frustum culling available.
   *
   * The geometry has a valid bounding sphere.
   */
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

const SATELLITE_FRAGMENT_SHADER = `
  varying vec3 vColor;
  varying float vBrightness;

  void main() {
    vec2 centered =
      gl_PointCoord -
      vec2(0.5);

    float distanceFromCenter =
      length(centered);

    if (
      distanceFromCenter > 0.5
    ) {
      discard;
    }

    float edge =
      1.0 -
      smoothstep(
        0.30,
        0.50,
        distanceFromCenter
      );

    float core =
      1.0 -
      smoothstep(
        0.0,
        0.24,
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
 * ========================================================================== */

const createSatelliteMaterial = () => {
  return new THREE.ShaderMaterial({
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

    depthFunc:
      THREE.LessEqualDepth,
  });
};

/* ============================================================================
 * SATELLITE LAYER
 * ========================================================================== */

const SatelliteLayer = ({
  objects = [],
  visible = true,
  selectedObjectId = null,
  onObjectSelect,
}) => {
  const pointsRef =
    useRef(null);

  /**
   * VisualizationScene owns the rendering array.
   *
   * Do not copy or slice it here.
   */
  const sourceObjects =
    Array.isArray(objects)
      ? objects
      : [];

  /* ==========================================================================
   * GEOMETRY
   * ======================================================================== */

  const {
    geometry,
    validObjects,
  } = useMemo(
    () =>
      createSatelliteGeometry(
        sourceObjects,
        selectedObjectId,
      ),
    [
      sourceObjects,
      selectedObjectId,
    ],
  );

  /* ==========================================================================
   * MATERIAL
   * ======================================================================== */

  const material =
    useMemo(
      () =>
        createSatelliteMaterial(),
      [],
    );

  /* ==========================================================================
   * PIXEL RATIO
   * ======================================================================== */

  useEffect(() => {
    const updatePixelRatio =
      () => {
        if (
          typeof window ===
          "undefined"
        ) {
          return;
        }

        /**
         * The Canvas itself controls the renderer DPR.
         *
         * This value is only used by the shader to scale point size.
         *
         * Keep it capped so high-DPI phones do not create excessively
         * large satellite sprites.
         */
        const pixelRatio =
          Math.min(
            window.devicePixelRatio ||
              1,
            MAX_PIXEL_RATIO,
          );

        if (
          material.uniforms
            ?.uPixelRatio
        ) {
          material.uniforms.uPixelRatio.value =
            pixelRatio;
        }
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
      {
        passive: true,
      },
    );

    return () => {
      window.removeEventListener(
        "resize",
        updatePixelRatio,
      );
    };
  }, [material]);

  /* ==========================================================================
   * GEOMETRY CLEANUP
   * ======================================================================== */

  useEffect(() => {
    return () => {
      geometry.dispose();
    };
  }, [geometry]);

  /* ==========================================================================
   * MATERIAL CLEANUP
   * ======================================================================== */

  useEffect(() => {
    return () => {
      material.dispose();
    };
  }, [material]);

  /* ==========================================================================
   * ACTUAL THREE.JS POINTS RAYCAST
   * ======================================================================== */

  const handleRaycast =
    useCallback(
      (raycaster, intersects) => {
        const points =
          pointsRef.current;

        if (!points) {
          return;
        }

        /**
         * Ensure the Points parameter object exists.
         */
        if (
          !raycaster.params.Points
        ) {
          raycaster.params.Points = {};
        }

        /**
         * Preserve the shared R3F raycaster state.
         */
        const previousThreshold =
          raycaster.params.Points
            .threshold;

        raycaster.params.Points.threshold =
          POINT_RAYCAST_THRESHOLD;

        try {
          THREE.Points.prototype.raycast.call(
            points,
            raycaster,
            intersects,
          );
        } finally {
          /**
           * Always restore the previous shared raycaster configuration.
           */
          if (
            previousThreshold ===
            undefined
          ) {
            delete raycaster.params
              .Points.threshold;
          } else {
            raycaster.params.Points.threshold =
              previousThreshold;
          }
        }
      },
      [],
    );

  /* ==========================================================================
   * POINTER SELECTION
   * ======================================================================== */

  const handleClick =
    useCallback(
      (event) => {
        /**
         * Prevent the click from propagating to Earth/other scene objects.
         */
        event.stopPropagation();

        /**
         * R3F normally provides the point index directly.
         */
        const directIndex =
          Number.isInteger(
            event?.index,
          )
            ? event.index
            : null;

        /**
         * Defensive fallback for the current Points object.
         */
        const layerIntersection =
          event?.intersections?.find(
            (intersection) =>
              intersection?.object ===
              pointsRef.current,
          ) ?? null;

        const intersectionIndex =
          Number.isInteger(
            layerIntersection?.index,
          )
            ? layerIntersection.index
            : null;

        const index =
          directIndex ??
          intersectionIndex;

        if (
          !Number.isInteger(index) ||
          index < 0 ||
          index >=
            validObjects.length
        ) {
          return;
        }

        const selectedObject =
          validObjects[index];

        if (!selectedObject) {
          return;
        }

        if (
          typeof onObjectSelect !==
          "function"
        ) {
          return;
        }

        /**
         * Send the complete backend object upward.
         *
         * No cloned object.
         * No transformed object.
         * No dummy data.
         */
        onObjectSelect(
          selectedObject,
        );
      },
      [
        validObjects,
        onObjectSelect,
      ],
    );

  /* ==========================================================================
   * VISIBILITY
   * ======================================================================== */

  if (
    !visible ||
    validObjects.length === 0
  ) {
    return null;
  }

  /* ==========================================================================
   * RENDER
   * ======================================================================== */

  return (
    <points
      ref={pointsRef}
      name="OrbitGuard-SatelliteLayer"
      geometry={geometry}
      material={material}

      /**
       * IMPORTANT:
       *
       * Allow Three.js to use the geometry bounding sphere for frustum
       * culling.
       *
       * The previous `false` forced this entire Points object to remain
       * considered for rendering even when outside the camera frustum.
       */
      frustumCulled

      renderOrder={10}

      raycast={handleRaycast}

      /**
       * Selection is click/tap based.
       *
       * There are intentionally NO:
       *
       * - onPointerOver
       * - onPointerMove
       * - onPointerOut
       *
       * handlers here.
       *
       * This is important for OrbitControls performance because hover
       * raycasting across thousands of points can compete with touch/mouse
       * camera interaction.
       */
      onClick={handleClick}
    />
  );
};

export default SatelliteLayer;