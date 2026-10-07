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
 * Renders orbital paths supplied by the backend.
 *
 * This component does NOT:
 *
 * - propagate orbits
 * - run SGP4
 * - run Orekit
 * - calculate risk
 * - calculate coordinates
 * - communicate with backend APIs
 *
 * Backend orbital points remain the source of truth.
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
 *     radius = 1 normalized Three.js unit
 *
 * Conversion:
 *
 *     scene = kilometers / 6371
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
 * This does NOT modify backend orbital coordinates.
 */
const TRAIL_SURFACE_OFFSET = 0.002;

const SATELLITE_TRAIL_COLOR =
  "#22d3ee";

const DEBRIS_TRAIL_COLOR =
  "#f59e0b";

const HIGH_RISK_TRAIL_COLOR =
  "#ef4444";

const SELECTED_TRAIL_COLOR =
  "#dffaff";

const NORMAL_TRAIL_OPACITY =
  0.22;

const SELECTED_TRAIL_OPACITY =
  0.92;

/* ============================================================================
 * PREVIEW DATA
 * ========================================================================== */

/**
 * UI-only preview orbit generator.
 *
 * This is NOT orbital propagation.
 */
const createPreviewOrbit = ({
  noradId,
  name,
  objectType,
  inclination,
  radiusKm,
  phase,
  riskLevel = null,
}) => {
  const points = [];

  const pointCount = 160;

  const inclinationRadians =
    THREE.MathUtils.degToRad(
      inclination,
    );

  for (
    let index = 0;
    index <= pointCount;
    index += 1
  ) {
    const progress =
      index / pointCount;

    const angle =
      phase +
      progress *
        Math.PI *
        2;

    const x =
      radiusKm *
      Math.cos(angle);

    const baseY =
      radiusKm *
      Math.sin(angle);

    const y =
      baseY *
      Math.cos(
        inclinationRadians,
      );

    const z =
      baseY *
      Math.sin(
        inclinationRadians,
      );

    points.push({
      xKm: x,
      yKm: y,
      zKm: z,
    });
  }

  return {
    noradId,
    name,
    objectType,
    riskLevel,
    points,
    frame: "ITRF",
  };
};

/**
 * UI-development preview data.
 *
 * Remove the fallback once backend orbital trail data
 * is fully available.
 */
export const ORBITAL_TRAIL_PREVIEW_DATA =
  Object.freeze([
    createPreviewOrbit({
      noradId: 25544,
      name: "ISS (ZARYA)",
      objectType: "SATELLITE",
      inclination: 51.64,
      radiusKm: 6780,
      phase: 0.4,
    }),

    createPreviewOrbit({
      noradId: 43013,
      name: "SENTINEL-2A",
      objectType: "SATELLITE",
      inclination: 98.6,
      radiusKm: 7160,
      phase: 1.8,
    }),

    createPreviewOrbit({
      noradId: 39444,
      name: "LANDSAT 8",
      objectType: "SATELLITE",
      inclination: 98.2,
      radiusKm: 7075,
      phase: 3.0,
    }),

    createPreviewOrbit({
      noradId: 21247,
      name: "DEBRIS-21247",
      objectType: "DEBRIS",
      inclination: 63.4,
      radiusKm: 6880,
      phase: 2.1,
      riskLevel: "HIGH",
    }),

    createPreviewOrbit({
      noradId: 23014,
      name: "DEBRIS-23014",
      objectType: "DEBRIS",
      inclination: 72.5,
      radiusKm: 7040,
      phase: 4.2,
      riskLevel: "MEDIUM",
    }),
  ]);

/* ============================================================================
 * IDENTIFICATION
 * ========================================================================== */

const getTrailId = (trail) =>
  trail?.noradId ??
  trail?.noradID ??
  trail?.noradCatalogId ??
  trail?.id ??
  null;

/* ============================================================================
 * TYPE
 * ========================================================================== */

const getObjectType = (trail) =>
  String(
    trail?.objectType ??
      trail?.type ??
      trail?.object_type ??
      "",
  )
    .trim()
    .toUpperCase();

/* ============================================================================
 * VALIDATION
 * ========================================================================== */

const hasValidTrailPoints = (
  trail,
) =>
  Array.isArray(
    trail?.points,
  ) &&
  trail.points.length >= 2;

const hasValidCartesianPoint = (
  point,
) =>
  Number.isFinite(
    Number(point?.xKm),
  ) &&
  Number.isFinite(
    Number(point?.yKm),
  ) &&
  Number.isFinite(
    Number(point?.zKm),
  );

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
    Number(point.xKm) *
      scale,

    Number(point.yKm) *
      scale,

    Number(point.zKm) *
      scale,
  ];
};

/**
 * Applies a tiny visual offset from the Earth surface.
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

  if (
    length <= 0
  ) {
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
 * GEOMETRY
 * ========================================================================== */

const createTrailGeometry = (
  trails,
  selectedNoradId,
  {
    selectedOnly = false,
  } = {},
) => {
  const positions = [];
  const colors = [];

  if (
    !Array.isArray(trails)
  ) {
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

    return geometry;
  }

  const selectedId =
    String(
      selectedNoradId ??
        "",
    );

  trails
    .filter(
      hasValidTrailPoints,
    )
    .forEach((trail) => {
      const trailId =
        String(
          getTrailId(
            trail,
          ) ?? "",
        );

      const isSelected =
        trailId !== "" &&
        trailId ===
          selectedId;

      if (
        selectedOnly !==
        isSelected
      ) {
        return;
      }

      const color =
        new THREE.Color(
          isSelected
            ? SELECTED_TRAIL_COLOR
            : getTrailColor(
                trail,
              ),
        );

      for (
        let index = 0;
        index <
        trail.points.length -
          1;
        index += 1
      ) {
        const startPoint =
          trail.points[
            index
          ];

        const endPoint =
          trail.points[
            index + 1
          ];

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
      }
    });

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
  trails =
    ORBITAL_TRAIL_PREVIEW_DATA,

  visible = true,

  selectedNoradId = null,

  reduceMotion = false,

  selectedOnly = false,
}) => {
  /* ==========================================================================
   * NORMAL GEOMETRY
   * ======================================================================== */

  const normalGeometry =
    useMemo(
      () =>
        createTrailGeometry(
          trails,
          selectedNoradId,
          {
            selectedOnly: false,
          },
        ),
      [
        trails,
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
          trails,
          selectedNoradId,
          {
            selectedOnly: true,
          },
        ),
      [
        trails,
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

  void reduceMotion;

  /* ==========================================================================
   * CLEANUP
   * ======================================================================== */

  useEffect(() => {
    return () => {
      normalGeometry.dispose();
    };
  }, [
    normalGeometry,
  ]);

  useEffect(() => {
    return () => {
      selectedGeometry.dispose();
    };
  }, [
    selectedGeometry,
  ]);

  useEffect(() => {
    return () => {
      normalMaterial.dispose();
      selectedMaterial.dispose();
    };
  }, [
    normalMaterial,
    selectedMaterial,
  ]);

  /* ==========================================================================
   * VISIBILITY
   * ======================================================================== */

  if (!visible) {
    return null;
  }

  /* ==========================================================================
   * RENDER
   * ======================================================================== */

  return (
    <group
      name="OrbitGuard-OrbitalTrails"
      userData={{
        type: "orbital-trails",
        coordinateFrame:
          "ITRF",
      }}
    >
      {!selectedOnly && (
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

      {selectedNoradId !==
        null &&
        selectedNoradId !==
          undefined && (
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