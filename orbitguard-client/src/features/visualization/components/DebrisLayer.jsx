import {
  useCallback,
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
 * Renders backend-provided orbital debris positions as GPU-efficient
 * THREE.Points.
 *
 * This component owns:
 *
 * - debris GPU geometry
 * - debris marker colors
 * - debris marker size
 * - debris selection
 * - high-risk visual distinction when risk data exists
 * - efficient point rendering
 *
 * This component does NOT own:
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
 *   timestamp: "...",
 *   frame: "ITRF"
 * }
 *
 * Optional risk fields are supported when supplied by the backend:
 *
 *   riskLevel
 *   risk
 *   collisionRisk
 *
 * The current VisualizationObjectResponse contract does not require
 * riskLevel, therefore this layer does not invent or calculate risk.
 *
 * ============================================================================
 * COORDINATE CONTRACT
 * ============================================================================
 *
 * Backend:
 *
 *   ITRF kilometres
 *
 * Frontend:
 *
 *   Earth radius = 1 scene unit
 *
 * Conversion:
 *
 *   sceneX = xKm / 6371
 *   sceneY = yKm / 6371
 *   sceneZ = zKm / 6371
 *
 * Backend remains the source of orbital truth.
 *
 * ============================================================================
 * PERFORMANCE CONTRACT
 * ============================================================================
 *
 * VisualizationScene controls the active debris rendering budget.
 *
 * Target:
 *
 *   <= 1,000 debris objects
 *
 * This component does not arbitrarily slice/truncate the supplied objects.
 *
 * ============================================================================
 * POINTER / RAYCAST CONTRACT
 * ============================================================================
 *
 * The R3F Canvas controls the global raycaster configuration.
 *
 * This component does not mutate:
 *
 *   raycaster.params.Points.threshold
 *
 * and does not store fake raycast configuration in userData.
 *
 * Selection is resolved only when an actual click is received.
 *
 * ============================================================================
 */

/* ============================================================================
 * CONSTANTS
 * ========================================================================== */

const EARTH_RADIUS_KM = 6371;

const DEBRIS_COLOR = "#f59e0b";

const HIGH_RISK_COLOR = "#ef4444";

const SELECTED_COLOR = "#e6fbff";

const MAX_PIXEL_RATIO = 2;

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
 * Kept exported for compatibility with any existing development/import usage.
 *
 * IMPORTANT:
 * This data is NOT used by the production rendering path.
 * DebrisLayer renders only the objects supplied through its `objects` prop.
 */

export const DEBRIS_PREVIEW_OBJECTS = Object.freeze([
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
    timestamp: "2026-10-06T14:00:00Z",
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
    timestamp: "2026-10-06T14:00:00Z",
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
    timestamp: "2026-10-06T14:00:00Z",
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
    timestamp: "2026-10-06T14:00:00Z",
    frame: "ITRF",
    riskLevel: "MEDIUM",
  },
]);

/* ============================================================================
 * OBJECT ID
 * ========================================================================== */

const getObjectId = (object) =>
  object?.noradId ??
  object?.noradCatalogId ??
  object?.id ??
  null;

/* ============================================================================
 * NUMERIC VALIDATION
 * ========================================================================== */

const toFiniteNumber = (value) => {
  const number = Number(value);

  return Number.isFinite(number) ? number : null;
};

/* ============================================================================
 * OBJECT TYPE
 * ========================================================================== */

const isDebrisObject = (object) => {
  const type = String(
    object?.objectType ??
      object?.type ??
      "",
  )
    .trim()
    .toUpperCase();

  return type === "DEBRIS";
};

/* ============================================================================
 * CARTESIAN VALIDATION
 * ========================================================================== */

/**
 * Supports the normalized frontend contract:
 *
 *   xKm / yKm / zKm
 *
 * and defensively supports lowercase JSON fields:
 *
 *   xkm / ykm / zkm
 *
 * The visualization service already normalizes these values, but keeping
 * this defensive fallback makes the rendering layer resilient to the actual
 * HTTP payload shape.
 */
const getCartesianCoordinates = (object) => {
  if (!object) {
    return null;
  }

  const xKm = toFiniteNumber(
    object.xKm ?? object.xkm,
  );

  const yKm = toFiniteNumber(
    object.yKm ?? object.ykm,
  );

  const zKm = toFiniteNumber(
    object.zKm ?? object.zkm,
  );

  if (
    xKm === null ||
    yKm === null ||
    zKm === null
  ) {
    return null;
  }

  return {
    xKm,
    yKm,
    zKm,
  };
};

/* ============================================================================
 * RISK HELPERS
 * ========================================================================== */

const getRiskLevel = (object) => {
  const value =
    object?.riskLevel ??
    object?.risk ??
    object?.collisionRisk ??
    "";

  return String(value)
    .trim()
    .toUpperCase();
};

const isHighRisk = (object) =>
  getRiskLevel(object) === "HIGH";

const isMediumRisk = (object) =>
  getRiskLevel(object) === "MEDIUM";

/* ============================================================================
 * POSITION CONVERSION
 * ========================================================================== */

/**
 * Converts backend ITRF kilometres to the scene coordinate system.
 *
 * This function accepts already extracted numeric coordinates so that the
 * geometry creation path does not repeatedly parse the same object.
 */
const toScenePosition = (coordinates) => {
  if (!coordinates) {
    return null;
  }

  const position = [
    coordinates.xKm / EARTH_RADIUS_KM,
    coordinates.yKm / EARTH_RADIUS_KM,
    coordinates.zKm / EARTH_RADIUS_KM,
  ];

  if (!position.every(Number.isFinite)) {
    return null;
  }

  return position;
};

/* ============================================================================
 * RENDERABLE OBJECTS
 * ========================================================================== */

/**
 * Creates the exact list of debris objects that can actually be rendered.
 *
 * No console logging.
 * No diagnostic traversal.
 * No duplicate coordinate conversion.
 */
const getRenderableObjects = (objects) => {
  if (!Array.isArray(objects)) {
    return [];
  }

  const renderableObjects = [];

  for (const object of objects) {
    if (!isDebrisObject(object)) {
      continue;
    }

    const coordinates =
      getCartesianCoordinates(object);

    if (!coordinates) {
      continue;
    }

    const position =
      toScenePosition(coordinates);

    if (!position) {
      continue;
    }

    renderableObjects.push(object);
  }

  return renderableObjects;
};

/* ============================================================================
 * DEBRIS GEOMETRY
 * ========================================================================== */

const createDebrisGeometry = (
  objects,
  selectedObjectId,
) => {
  const validObjects =
    getRenderableObjects(objects);

  const count =
    validObjects.length;

  const positions =
    new Float32Array(count * 3);

  const colors =
    new Float32Array(count * 3);

  const sizes =
    new Float32Array(count);

  const brightness =
    new Float32Array(count);

  const selectedId = String(
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

    /**
     * Extract coordinates exactly once during geometry creation.
     */
    const coordinates =
      getCartesianCoordinates(object);

    const position =
      toScenePosition(coordinates);

    if (!position) {
      continue;
    }

    const offset =
      index * 3;

    positions[offset] =
      position[0];

    positions[offset + 1] =
      position[1];

    positions[offset + 2] =
      position[2];

    /* ----------------------------------------------------------------------
     * SELECTION
     * -------------------------------------------------------------------- */

    const objectId =
      getObjectId(object);

    const isSelected =
      objectId !== null &&
      String(objectId) === selectedId;

    /* ----------------------------------------------------------------------
     * RISK
     * -------------------------------------------------------------------- */

    const highRisk =
      isHighRisk(object);

    const mediumRisk =
      isMediumRisk(object);

    /* ----------------------------------------------------------------------
     * COLOR
     * -------------------------------------------------------------------- */

    color.set(
      isSelected
        ? SELECTED_COLOR
        : highRisk
          ? HIGH_RISK_COLOR
          : DEBRIS_COLOR,
    );

    colors[offset] =
      color.r;

    colors[offset + 1] =
      color.g;

    colors[offset + 2] =
      color.b;

    /* ----------------------------------------------------------------------
     * SIZE / BRIGHTNESS
     * -------------------------------------------------------------------- */

    if (isSelected) {
      sizes[index] =
        POINT_SIZE.selected;

      brightness[index] =
        1.0;
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
   * Required for frustum culling.
   *
   * Previously this layer used:
   *
   *   frustumCulled={false}
   *
   * which forced Three.js to consider the complete point cloud even when
   * it was outside the camera frustum.
   */
  geometry.computeBoundingSphere();

  return {
    geometry,
    validObjects,
  };
};

/* ============================================================================
 * DEBRIS VERTEX SHADER
 * ========================================================================== */

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

/* ============================================================================
 * DEBRIS FRAGMENT SHADER
 * ========================================================================== */

const DEBRIS_FRAGMENT_SHADER = `
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
        0.25,
        0.50,
        distanceFromCenter
      );

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
 * ========================================================================== */

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

    depthFunc:
      THREE.LessEqualDepth,
  });

/* ============================================================================
 * DEBRIS LAYER
 * ========================================================================== */

const DebrisLayer = ({
  objects = [],
  visible = true,
  selectedObjectId = null,
  onObjectSelect,
}) => {
  const pointsRef =
    useRef(null);

  /* ==========================================================================
   * NORMALIZE INPUT
   * ======================================================================== */

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
      createDebrisGeometry(
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
        createDebrisMaterial(),
      [],
    );

  /* ==========================================================================
   * PIXEL RATIO
   * ======================================================================== */

  useEffect(() => {
    const updatePixelRatio =
      () => {
        const pixelRatio =
          typeof window !==
          "undefined"
            ? window.devicePixelRatio || 1
            : 1;

        material.uniforms.uPixelRatio.value =
          Math.min(
            pixelRatio,
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
   * POINTER SELECTION
   * ======================================================================== */

  const handleClick =
    useCallback(
      (event) => {
        event.stopPropagation();

        /**
         * R3F exposes the clicked point index directly for THREE.Points.
         */
        const directIndex =
          Number.isInteger(
            event?.index,
          )
            ? event.index
            : null;

        /**
         * Defensive fallback for cases where the direct index is not
         * available but the intersection contains the current Points object.
         */
        const intersection =
          event?.intersections?.find(
            (candidate) =>
              candidate?.object ===
              pointsRef.current,
          ) ?? null;

        const intersectionIndex =
          Number.isInteger(
            intersection?.index,
          )
            ? intersection.index
            : null;

        const index =
          directIndex ??
          intersectionIndex;

        if (
          !Number.isInteger(index) ||
          index < 0 ||
          index >= validObjects.length
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
      name="OrbitGuard-DebrisLayer"
      geometry={geometry}
      material={material}

      /**
       * Allow Three.js to use geometry.boundingSphere for frustum culling.
       */
      frustumCulled

      renderOrder={11}

      onClick={handleClick}
    />
  );
};

export default DebrisLayer;