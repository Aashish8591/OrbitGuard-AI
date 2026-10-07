import {
  useEffect,
  useMemo,
} from "react";

import {
  useLoader,
  useThree,
} from "@react-three/fiber";

import * as THREE from "three";

import {
  TextureLoader,
} from "three";

/**
 * ============================================================================
 * OrbitGuard AI — Earth
 * ============================================================================
 *
 * RESPONSIBILITY
 * ----------------------------------------------------------------------------
 *
 * Earth.jsx owns only the visual Earth body.
 *
 * It owns:
 *
 * - Earth day texture
 * - Earth normal map
 * - Earth surface material
 * - Earth geometry
 * - Earth orientation
 * - subtle planetary edge response
 *
 * It does NOT own:
 *
 * - atmosphere
 * - clouds
 * - stars
 * - satellites
 * - debris
 * - orbital trails
 * - camera
 * - object selection
 * - backend communication
 * - orbital propagation
 *
 * ============================================================================
 * IMPORTANT SCALE CONTRACT
 * ============================================================================
 *
 * Earth uses ONE normalized radius:
 *
 *     EARTH_SURFACE_RADIUS = 1
 *
 * VisualizationScene may scale the complete Earth system visually.
 *
 * Atmosphere.jsx imports the exact same radius and orientation from this file.
 *
 * NEVER create another independent Earth radius in Atmosphere.jsx.
 * ============================================================================
 */

/* ============================================================================
 * PUBLIC EARTH CONTRACT
 * ========================================================================== */

/**
 * Normalized Earth radius.
 *
 * This is the canonical radius used by every Earth-relative visual layer.
 */
export const EARTH_SURFACE_RADIUS = 1;

/**
 * Static Earth axial tilt.
 *
 * The visualization currently uses an Earth-fixed / ITRF reference frame.
 *
 * Therefore we intentionally DO NOT continuously rotate Earth here.
 */
export const EARTH_AXIAL_TILT =
  THREE.MathUtils.degToRad(23.44);

/**
 * Public Earth orientation.
 *
 * Atmosphere.jsx uses this exact value so that:
 *
 *     Earth
 *     Clouds
 *     Atmosphere
 *
 * remain perfectly aligned.
 */
export const EARTH_ORIENTATION = Object.freeze([
  EARTH_AXIAL_TILT,
  0,
  0,
]);

/* ============================================================================
 * EARTH GEOMETRY
 * ========================================================================== */

const EARTH_SEGMENTS = 96;

/* ============================================================================
 * TEXTURES
 * ========================================================================== */

const EARTH_DAY_TEXTURE =
  "/images/space/earth-day.jpg";

const EARTH_NORMAL_TEXTURE =
  "/images/space/earth-normal.jpg";

/* ============================================================================
 * MATERIAL CONFIGURATION
 * ========================================================================== */

const EARTH_MATERIAL = Object.freeze({
  roughness: 0.84,
  metalness: 0.0,

  /**
   * Keep normal mapping restrained.
   *
   * Too much normal strength makes the Earth look noisy,
   * especially at the relatively small visualization scale.
   */
  normalScale: 0.38,

  /**
   * Very subtle night-side blue contribution.
   */
  emissiveIntensity: 0.025,
});

/* ============================================================================
 * TEXTURE PREPARATION
 * ========================================================================== */

const prepareEarthTexture = (
  texture,
  {
    colorTexture = false,
    anisotropy = 1,
  } = {},
) => {
  if (!texture) {
    return;
  }

  texture.wrapS =
    THREE.ClampToEdgeWrapping;

  texture.wrapT =
    THREE.ClampToEdgeWrapping;

  texture.minFilter =
    THREE.LinearMipmapLinearFilter;

  texture.magFilter =
    THREE.LinearFilter;

  texture.anisotropy = Math.max(
    1,
    Math.min(
      anisotropy || 1,
      16,
    ),
  );

  texture.colorSpace =
    colorTexture
      ? THREE.SRGBColorSpace
      : THREE.NoColorSpace;

  texture.needsUpdate = true;
};

/* ============================================================================
 * COMPONENT
 * ========================================================================== */

const Earth = ({
  reduceMotion = false,
  enableRotation = false,
  rotationSpeed = 0.0015,
}) => {
  const { gl } = useThree();

  /* ==========================================================================
   * TEXTURES
   * ======================================================================== */

  const [
    earthDayTexture,
    earthNormalTexture,
  ] = useLoader(
    TextureLoader,
    [
      EARTH_DAY_TEXTURE,
      EARTH_NORMAL_TEXTURE,
    ],
  );

  /* ==========================================================================
   * TEXTURE CONFIGURATION
   * ======================================================================== */

  useEffect(() => {
    const maxAnisotropy =
      gl?.capabilities?.getMaxAnisotropy?.() ??
      1;

    prepareEarthTexture(
      earthDayTexture,
      {
        colorTexture: true,
        anisotropy: maxAnisotropy,
      },
    );

    prepareEarthTexture(
      earthNormalTexture,
      {
        colorTexture: false,
        anisotropy: maxAnisotropy,
      },
    );
  }, [
    gl,
    earthDayTexture,
    earthNormalTexture,
  ]);

  /* ==========================================================================
   * MATERIAL
   * ======================================================================== */

  const earthMaterial =
    useMemo(
      () => ({
        map: earthDayTexture,

        normalMap:
          earthNormalTexture,

        roughness:
          EARTH_MATERIAL.roughness,

        metalness:
          EARTH_MATERIAL.metalness,

        normalScale:
          new THREE.Vector2(
            EARTH_MATERIAL.normalScale,
            EARTH_MATERIAL.normalScale,
          ),

        /**
         * A restrained blue emissive contribution.
         *
         * This avoids the completely dead-looking night side without
         * turning Earth into a glowing blue sphere.
         */
        emissive:
          new THREE.Color("#0a2638"),

        emissiveMap:
          earthDayTexture,

        emissiveIntensity:
          EARTH_MATERIAL.emissiveIntensity,
      }),
      [
        earthDayTexture,
        earthNormalTexture,
      ],
    );

  /* ==========================================================================
   * ORIENTATION
   * ======================================================================== */

  const initialRotation =
    useMemo(
      () => EARTH_ORIENTATION,
      [],
    );

  /**
   * Rotation intentionally remains disabled for the current ITRF scene.
   *
   * These props are retained because the architecture may later receive
   * synchronized Earth orientation from the backend.
   */
  void reduceMotion;
  void enableRotation;
  void rotationSpeed;

  /* ==========================================================================
   * RENDER
   * ======================================================================== */

  return (
    <group
      name="OrbitGuard-Earth"
      rotation={initialRotation}
      userData={{
        type: "earth",
        coordinateFrame: "ITRF",
      }}
    >
      {/* ==================================================================
          EARTH SURFACE
          ================================================================== */}

      <mesh
        name="OrbitGuard-EarthSurface"
        castShadow={false}
        receiveShadow
        userData={{
          type: "earth-surface",
          coordinateFrame: "ITRF",
        }}
      >
        <sphereGeometry
          args={[
            EARTH_SURFACE_RADIUS,
            EARTH_SEGMENTS,
            EARTH_SEGMENTS,
          ]}
        />

        <meshStandardMaterial
          {...earthMaterial}
          side={THREE.FrontSide}
          transparent={false}
          opacity={1}
          depthWrite
          depthTest
        />
      </mesh>

      {/* ==================================================================
          VERY SUBTLE PLANETARY EDGE
          ================================================================== */}

      <mesh
        name="OrbitGuard-EarthEdge"
        scale={[
          1.003,
          1.003,
          1.003,
        ]}
        renderOrder={1}
        raycast={() => null}
      >
        <sphereGeometry
          args={[
            EARTH_SURFACE_RADIUS,
            72,
            72,
          ]}
        />

        <meshBasicMaterial
          color="#29b6e6"
          transparent
          opacity={0.035}
          side={THREE.BackSide}
          depthWrite={false}
          depthTest={false}
          blending={
            THREE.AdditiveBlending
          }
          toneMapped={false}
        />
      </mesh>
    </group>
  );
};

export default Earth;