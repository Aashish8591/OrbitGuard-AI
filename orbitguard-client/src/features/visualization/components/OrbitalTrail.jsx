import {
  useEffect,
  useMemo,
} from "react";

import * as THREE from "three";

/**
 * ============================================================================
 * OrbitGuard AI — Orbital Trail
 * ============================================================================
 *
 * RESPONSIBILITY
 * ----------------------------------------------------------------------------
 *
 * Pure Three.js / React Three Fiber renderer for orbital trail data supplied
 * by the parent.
 *
 * This component:
 *
 * - DOES render orbital trail geometry
 * - DOES normalize supported trail-point field names
 * - DOES highlight the selected object's trail
 * - DOES enforce a frontend rendering budget
 * - DOES manage Three.js geometry/material lifecycle
 *
 * This component does NOT:
 *
 * - call APIs
 * - propagate an orbit
 * - run SGP4
 * - run Orekit
 * - calculate orbital mechanics
 * - invent orbital paths
 * - calculate risk
 *
 * Backend/generated orbital trajectory data remains the source of truth.
 *
 * ============================================================================
 * IMPORTANT DATA CONTRACT
 * ============================================================================
 *
 * A trail must contain at least two Cartesian points.
 *
 * Supported trail containers:
 *
 *     points
 *     orbitPoints
 *     trajectory
 *     positions
 *
 * Supported Cartesian field names:
 *
 *     xKm / yKm / zKm
 *     xkm / ykm / zkm
 *
 * Example:
 *
 * {
 *   noradId: 25544,
 *   objectType: "SATELLITE",
 *   points: [
 *     {
 *       xKm: 6800,
 *       yKm: 100,
 *       zKm: 200
 *     },
 *     {
 *       xKm: 6750,
 *       yKm: 500,
 *       zKm: 400
 *     }
 *   ]
 * }
 *
 * ============================================================================
 * COORDINATE CONTRACT
 * ============================================================================
 *
 * Backend:
 *
 *     xKm / yKm / zKm
 *
 * Earth:
 *
 *     radius = 1 Three.js unit
 *
 * Conversion:
 *
 *     scene coordinate = km / 6371
 *
 * ============================================================================
 */

/* ============================================================================
 * CONSTANTS
 * ========================================================================== */

const EARTH_RADIUS_KM = 6371;

/**
 * Very small visual offset.
 *
 * This is purely a rendering offset.
 * It does NOT modify backend coordinates.
 */
const TRAIL_SURFACE_OFFSET = 0.002;

/**
 * Frontend rendering budget for non-selected trails.
 *
 * This is NOT a backend data limit.
 */
const MAX_NORMAL_TRAILS = 100;

/**
 * Trail colors.
 */
const SATELLITE_TRAIL_COLOR =
  "#22d3ee";

const DEBRIS_TRAIL_COLOR =
  "#f59e0b";

const HIGH_RISK_TRAIL_COLOR =
  "#ef4444";

const SELECTED_TRAIL_COLOR =
  "#dffaff";

/**
 * Material opacity.
 */
const NORMAL_TRAIL_OPACITY = 0.22;

const SELECTED_TRAIL_OPACITY = 0.96;

/* ============================================================================
 * IDENTIFICATION
 * ========================================================================== */

const getTrailId = (trail) =>
  trail?.noradId ??
  trail?.noradID ??
  trail?.noradCatalogId ??
  trail?.noradCatalogID ??
  trail?.id ??
  null;

/* ============================================================================
 * OBJECT TYPE
 * ========================================================================== */

const getObjectType = (
  trail,
) =>
  String(
    trail?.objectType ??
      trail?.type ??
      trail?.object_type ??
      "",
  )
    .trim()
    .toUpperCase();

/* ============================================================================
 * RISK
 * ========================================================================== */

const getRiskLevel = (
  trail,
) => {
  const value =
    trail?.riskLevel ??
    trail?.risk ??
    trail?.collisionRisk ??
    "";

  return String(value)
    .trim()
    .toUpperCase();
};

const isHighRisk = (
  trail,
) =>
  getRiskLevel(trail) ===
  "HIGH";

/* ============================================================================
 * TRAIL POINT EXTRACTION
 * ========================================================================== */

/**
 * Supports several possible backend/application contracts without creating
 * artificial data.
 *
 * Priority:
 *
 * 1. points
 * 2. orbitPoints
 * 3. trajectory
 * 4. positions
 */
const getTrailPoints = (
  trail,
) => {
  if (
    Array.isArray(
      trail?.points,
    )
  ) {
    return trail.points;
  }

  if (
    Array.isArray(
      trail?.orbitPoints,
    )
  ) {
    return trail.orbitPoints;
  }

  if (
    Array.isArray(
      trail?.trajectory,
    )
  ) {
    return trail.trajectory;
  }

  if (
    Array.isArray(
      trail?.positions,
    )
  ) {
    return trail.positions;
  }

  return [];
};

/* ============================================================================
 * CARTESIAN POINT HELPERS
 * ========================================================================== */

const getXKm = (
  point,
) =>
  point?.xKm ??
  point?.xkm ??
  null;

const getYKm = (
  point,
) =>
  point?.yKm ??
  point?.ykm ??
  null;

const getZKm = (
  point,
) =>
  point?.zKm ??
  point?.zkm ??
  null;

const hasValidCartesianPoint = (
  point,
) => {
  const x = Number(
    getXKm(point),
  );

  const y = Number(
    getYKm(point),
  );

  const z = Number(
    getZKm(point),
  );

  return (
    Number.isFinite(x) &&
    Number.isFinite(y) &&
    Number.isFinite(z)
  );
};

/**
 * Returns only valid Cartesian points.
 *
 * We do not manufacture missing coordinates.
 */
const getValidTrailPoints = (
  trail,
) =>
  getTrailPoints(trail).filter(
    hasValidCartesianPoint,
  );

const hasValidTrailPoints = (
  trail,
) =>
  getValidTrailPoints(trail)
    .length >= 2;

/* ============================================================================
 * COLOR
 * ========================================================================== */

const getTrailColor = (
  trail,
) => {
  const type =
    getObjectType(trail);

  if (
    type === "DEBRIS" ||
    type === "SPACE_DEBRIS"
  ) {
    if (
      isHighRisk(trail)
    ) {
      return HIGH_RISK_TRAIL_COLOR;
    }

    return DEBRIS_TRAIL_COLOR;
  }

  return SATELLITE_TRAIL_COLOR;
};

/* ============================================================================
 * COORDINATE CONVERSION
 * ========================================================================== */

const toScenePosition = (
  point,
) => {
  const scale =
    1 / EARTH_RADIUS_KM;

  return [
    Number(
      getXKm(point),
    ) * scale,

    Number(
      getYKm(point),
    ) * scale,

    Number(
      getZKm(point),
    ) * scale,
  ];
};

/**
 * Applies a tiny visual offset away from the Earth surface.
 *
 * Important:
 *
 * This only changes the rendered Three.js position.
 * It does not change backend telemetry.
 */
const applyVisualSurfaceOffset = (
  position,
) => {
  const vector =
    new THREE.Vector3(
      position[0],
      position[1],
      position[2],
    );

  const length =
    vector.length();

  if (length <= 0) {
    return position;
  }

  vector.multiplyScalar(
    (length +
      TRAIL_SURFACE_OFFSET) /
      length,
  );

  return [
    vector.x,
    vector.y,
    vector.z,
  ];
};

/* ============================================================================
 * EMPTY GEOMETRY
 * ========================================================================== */

const createEmptyTrailGeometry =
  () => {
    const geometry =
      new THREE.BufferGeometry();

    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(
        [],
        3,
      ),
    );

    geometry.setAttribute(
      "color",
      new THREE.Float32BufferAttribute(
        [],
        3,
      ),
    );

    geometry.computeBoundingSphere();

    return geometry;
  };

/* ============================================================================
 * TRAIL GEOMETRY
 * ========================================================================== */

/**
 * Creates one combined line-segment geometry.
 *
 * We intentionally use one geometry for many trails to avoid creating
 * hundreds of Three.js line objects.
 */
const createTrailGeometry = (
  trails,
  selectedNoradId,
  {
    selectedOnly = false,
    maxTrails =
      MAX_NORMAL_TRAILS,
  } = {},
) => {
  if (
    !Array.isArray(trails) ||
    trails.length === 0
  ) {
    return createEmptyTrailGeometry();
  }

  const selectedId =
    String(
      selectedNoradId ?? "",
    );

  const positions = [];
  const colors = [];

  let renderedTrailCount = 0;

  const color =
    new THREE.Color();

  for (
    let trailIndex = 0;
    trailIndex < trails.length;
    trailIndex += 1
  ) {
    const trail =
      trails[trailIndex];

    const trailPoints =
      getValidTrailPoints(
        trail,
      );

    if (
      trailPoints.length < 2
    ) {
      continue;
    }

    const trailId =
      String(
        getTrailId(trail) ?? "",
      );

    const isSelected =
      trailId !== "" &&
      trailId === selectedId;

    /**
     * Selected geometry:
     *
     * Only render selected object.
     */
    if (
      selectedOnly &&
      !isSelected
    ) {
      continue;
    }

    /**
     * Normal geometry:
     *
     * Selected object is rendered separately so it can receive the
     * stronger selected style.
     */
    if (
      !selectedOnly &&
      isSelected
    ) {
      continue;
    }

    /**
     * Apply rendering budget only to normal trails.
     */
    if (
      !selectedOnly &&
      renderedTrailCount >=
        maxTrails
    ) {
      break;
    }

    color.set(
      isSelected
        ? SELECTED_TRAIL_COLOR
        : getTrailColor(trail),
    );

    let segmentCount = 0;

    for (
      let index = 0;
      index <
      trailPoints.length - 1;
      index += 1
    ) {
      const startPoint =
        trailPoints[index];

      const endPoint =
        trailPoints[index + 1];

      if (
        !hasValidCartesianPoint(
          startPoint,
        ) ||
        !hasValidCartesianPoint(
          endPoint,
        )
      ) {
        continue;
      }

      const start =
        applyVisualSurfaceOffset(
          toScenePosition(
            startPoint,
          ),
        );

      const end =
        applyVisualSurfaceOffset(
          toScenePosition(
            endPoint,
          ),
        );

      positions.push(
        start[0],
        start[1],
        start[2],

        end[0],
        end[1],
        end[2],
      );

      colors.push(
        color.r,
        color.g,
        color.b,

        color.r,
        color.g,
        color.b,
      );

      segmentCount += 1;
    }

    if (segmentCount > 0) {
      renderedTrailCount += 1;
    }
  }

  if (
    positions.length === 0
  ) {
    return createEmptyTrailGeometry();
  }

  const geometry =
    new THREE.BufferGeometry();

  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(
      positions,
      3,
    ),
  );

  geometry.setAttribute(
    "color",
    new THREE.Float32BufferAttribute(
      colors,
      3,
    ),
  );

  geometry.computeBoundingSphere();

  return geometry;
};

/* ============================================================================
 * SHADERS
 * ========================================================================== */

const TRAIL_VERTEX_SHADER = `
  varying vec3 vColor;

  void main() {
    vColor = color;

    vec4 modelPosition =
      modelViewMatrix *
      vec4(position, 1.0);

    gl_Position =
      projectionMatrix *
      modelPosition;
  }
`;

const TRAIL_FRAGMENT_SHADER = `
  varying vec3 vColor;

  uniform float uOpacity;

  void main() {
    gl_FragColor =
      vec4(
        vColor,
        uOpacity
      );
  }
`;

/* ============================================================================
 * MATERIAL
 * ========================================================================== */

const createTrailMaterial = (
  opacity,
) =>
  new THREE.ShaderMaterial({
    uniforms: {
      uOpacity: {
        value: opacity,
      },
    },

    vertexShader:
      TRAIL_VERTEX_SHADER,

    fragmentShader:
      TRAIL_FRAGMENT_SHADER,

    transparent: true,

    depthWrite: false,

    depthTest: true,

    vertexColors: true,

    blending:
      THREE.AdditiveBlending,

    toneMapped: false,
  });

/* ============================================================================
 * COMPONENT
 * ========================================================================== */

const OrbitalTrail = ({
  /**
   * Real trail data supplied by the parent.
   *
   * Empty by default.
   *
   * IMPORTANT:
   * We do not create fake orbital points here.
   */
  trails = [],

  visible = true,

  /**
   * NORAD identifier of the selected object.
   */
  selectedNoradId = null,

  /**
   * Reserved for future reduced-motion behavior.
   */
  reduceMotion = false,

  /**
   * When true, only the selected trail is rendered.
   *
   * Normally VisualizationScene should leave this false.
   */
  selectedOnly = false,
}) => {
  /* ==========================================================================
   * NORMALIZE TRAIL INPUT
   * ======================================================================== */

  const validTrails =
    useMemo(() => {
      if (
        !Array.isArray(trails)
      ) {
        return [];
      }

      return trails.filter(
        hasValidTrailPoints,
      );
    }, [trails]);

  /* ==========================================================================
   * DIAGNOSTICS
   * ======================================================================== */

  useEffect(() => {
    if (
      !import.meta.env.DEV
    ) {
      return;
    }

    const total =
      Array.isArray(trails)
        ? trails.length
        : 0;

    const valid =
      validTrails.length;

    const selected =
      selectedNoradId;

    console.debug(
      "[OrbitGuard OrbitalTrail] Trail diagnostics",
      {
        totalTrailObjects:
          total,

        validTrailObjects:
          valid,

        selectedNoradId:
          selected,

        selectedTrailAvailable:
          selected !== null &&
          selected !== undefined
            ? validTrails.some(
                (trail) =>
                  String(
                    getTrailId(
                      trail,
                    ) ?? "",
                  ) ===
                  String(selected),
              )
            : false,

        selectedOnly,

        visible,
      },
    );
  }, [
    trails,
    validTrails,
    selectedNoradId,
    selectedOnly,
    visible,
  ]);

  /* ==========================================================================
   * NORMAL GEOMETRY
   * ======================================================================== */

  const normalGeometry =
    useMemo(
      () =>
        createTrailGeometry(
          validTrails,
          selectedNoradId,
          {
            selectedOnly: false,
            maxTrails:
              MAX_NORMAL_TRAILS,
          },
        ),
      [
        validTrails,
        selectedNoradId,
      ],
    );

  /* ==========================================================================
   * SELECTED GEOMETRY
   * ======================================================================== */

  const selectedGeometry =
    useMemo(
      () =>
        createTrailGeometry(
          validTrails,
          selectedNoradId,
          {
            selectedOnly: true,
            maxTrails: 1,
          },
        ),
      [
        validTrails,
        selectedNoradId,
      ],
    );

  /* ==========================================================================
   * MATERIALS
   * ======================================================================== */

  const normalMaterial =
    useMemo(
      () =>
        createTrailMaterial(
          NORMAL_TRAIL_OPACITY,
        ),
      [],
    );

  const selectedMaterial =
    useMemo(
      () =>
        createTrailMaterial(
          SELECTED_TRAIL_OPACITY,
        ),
      [],
    );

  /**
   * Reserved for future motion behavior.
   */
  void reduceMotion;

  /* ==========================================================================
   * RESOURCE CLEANUP
   * ======================================================================== */

  useEffect(() => {
    return () => {
      normalGeometry.dispose();
    };
  }, [normalGeometry]);

  useEffect(() => {
    return () => {
      selectedGeometry.dispose();
    };
  }, [selectedGeometry]);

  useEffect(() => {
    return () => {
      normalMaterial.dispose();
    };
  }, [normalMaterial]);

  useEffect(() => {
    return () => {
      selectedMaterial.dispose();
    };
  }, [selectedMaterial]);

  /* ==========================================================================
   * VISIBILITY
   * ======================================================================== */

  if (!visible) {
    return null;
  }

  /* ==========================================================================
   * DETERMINE WHETHER SELECTED TRAIL EXISTS
   * ======================================================================== */

  const hasSelectedTrail =
    selectedNoradId !== null &&
    selectedNoradId !== undefined &&
    validTrails.some(
      (trail) =>
        String(
          getTrailId(trail) ?? "",
        ) ===
        String(
          selectedNoradId,
        ),
    );

  /* ==========================================================================
   * RENDER
   * ======================================================================== */

  return (
    <group
      name="OrbitGuard-OrbitalTrails"
      userData={{
        type:
          "orbital-trails",

        coordinateFrame:
          "ITRF",

        selectedNoradId:
          selectedNoradId ?? null,

        validTrailCount:
          validTrails.length,
      }}
    >
      {/* ================================================================
          NORMAL TRAILS
          ================================================================ */}

      {!selectedOnly &&
        validTrails.length > 0 && (
          <lineSegments
            name="OrbitGuard-NormalTrails"
            geometry={
              normalGeometry
            }
            material={
              normalMaterial
            }
            frustumCulled={false}
            renderOrder={5}
          />
        )}

      {/* ================================================================
          SELECTED TRAIL
          ================================================================ */}

      {hasSelectedTrail && (
        <lineSegments
          name="OrbitGuard-SelectedTrail"
          geometry={
            selectedGeometry
          }
          material={
            selectedMaterial
          }
          frustumCulled={false}
          renderOrder={6}
        />
      )}
    </group>
  );
};

export default OrbitalTrail;