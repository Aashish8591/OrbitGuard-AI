import {
  useEffect,
  useMemo,
} from "react";

import {
  useLoader,
} from "@react-three/fiber";

import * as THREE from "three";

import {
  TextureLoader,
} from "three";

import {
  EARTH_SURFACE_RADIUS,
  EARTH_ORIENTATION,
} from "./Earth";

/**
 * ============================================================================
 * OrbitGuard AI — Earth Atmosphere
 * ============================================================================
 *
 * RESPONSIBILITY
 * ----------------------------------------------------------------------------
 *
 * Atmosphere.jsx owns the visual layers surrounding Earth:
 *
 * - cloud layer
 * - atmospheric limb
 * - outer atmospheric glow
 *
 * It does NOT own:
 *
 * - Earth surface
 * - satellites
 * - debris
 * - orbital trails
 * - camera
 * - backend communication
 * - orbital propagation
 *
 * ============================================================================
 * SCALE CONTRACT
 * ============================================================================
 *
 * Earth radius comes directly from Earth.jsx.
 *
 * This guarantees:
 *
 *     Earth radius       = 1
 *     Cloud radius       ≈ 1.008
 *     Atmosphere radius  ≈ 1.025
 *     Outer rim radius   ≈ 1.042
 *
 * VisualizationScene can then scale the complete Earth system.
 *
 * ============================================================================
 */

const EARTH_CLOUD_TEXTURE =
  "/images/space/earth-clouds.jpg";

/* ============================================================================
 * ATMOSPHERE RADII
 * ========================================================================== */

/**
 * Clouds should sit extremely close to the Earth surface.
 *
 * Too much separation makes the Earth look like it has a second sphere.
 */
const CLOUD_RADIUS =
  EARTH_SURFACE_RADIUS * 1.008;

/**
 * Main atmospheric shell.
 */
const ATMOSPHERE_RADIUS =
  EARTH_SURFACE_RADIUS * 1.025;

/**
 * Very restrained outer limb.
 */
const OUTER_RIM_RADIUS =
  EARTH_SURFACE_RADIUS * 1.042;

/* ============================================================================
 * VISUAL CONFIGURATION
 * ========================================================================== */

const ATMOSPHERE_CONFIG =
  Object.freeze({
    cloudOpacity: 0.23,
    atmosphereOpacity: 0.075,
    rimOpacity: 0.12,

    atmosphereColor:
      new THREE.Color("#38bdf8"),

    rimColor:
      new THREE.Color("#67e8f9"),

    cloudColor:
      new THREE.Color("#e8f8ff"),
  });

/* ============================================================================
 * TEXTURE PREPARATION
 * ========================================================================== */

const prepareCloudTexture = (
  texture,
  anisotropy = 1,
) => {
  if (!texture) {
    return;
  }

  texture.wrapS =
    THREE.RepeatWrapping;

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
      8,
    ),
  );

  texture.colorSpace =
    THREE.SRGBColorSpace;

  texture.needsUpdate = true;
};

/* ============================================================================
 * CLOUD MATERIAL
 * ========================================================================== */

const createCloudMaterial = (
  texture,
) =>
  new THREE.ShaderMaterial({
    uniforms: {
      uCloudMap: {
        value: texture,
      },

      uCloudOpacity: {
        value:
          ATMOSPHERE_CONFIG.cloudOpacity,
      },

      uCloudColor: {
        value:
          ATMOSPHERE_CONFIG.cloudColor,
      },
    },

    vertexShader: `
      varying vec2 vUv;
      varying vec3 vWorldNormal;
      varying vec3 vWorldPosition;

      void main() {
        vUv = uv;

        vWorldNormal =
          normalize(
            mat3(modelMatrix) * normal
          );

        vec4 worldPosition =
          modelMatrix *
          vec4(position, 1.0);

        vWorldPosition =
          worldPosition.xyz;

        gl_Position =
          projectionMatrix *
          viewMatrix *
          worldPosition;
      }
    `,

    fragmentShader: `
      uniform sampler2D uCloudMap;
      uniform float uCloudOpacity;
      uniform vec3 uCloudColor;

      varying vec2 vUv;
      varying vec3 vWorldNormal;
      varying vec3 vWorldPosition;

      void main() {

        vec4 cloudSample =
          texture2D(
            uCloudMap,
            vUv
          );

        float luminance =
          dot(
            cloudSample.rgb,
            vec3(
              0.299,
              0.587,
              0.114
            )
          );

        /*
         * Extract cloud structures from the dark
         * background of the JPG.
         */
        float cloudMask =
          smoothstep(
            0.18,
            0.58,
            luminance
          );

        vec3 viewDirection =
          normalize(
            cameraPosition -
            vWorldPosition
          );

        float facing =
          max(
            dot(
              normalize(vWorldNormal),
              viewDirection
            ),
            0.0
          );

        /*
         * Keep clouds visible across the main
         * planetary face but softly fade them
         * near the extreme limb.
         */
        float edgeFade =
          smoothstep(
            0.02,
            0.34,
            facing
          );

        float alpha =
          cloudMask *
          edgeFade *
          uCloudOpacity;

        if (alpha < 0.012) {
          discard;
        }

        gl_FragColor =
          vec4(
            uCloudColor,
            alpha
          );
      }
    `,

    transparent: true,

    depthWrite: false,

    depthTest: true,

    side: THREE.FrontSide,

    blending:
      THREE.NormalBlending,

    toneMapped: false,
  });

/* ============================================================================
 * ATMOSPHERIC SHELL
 * ========================================================================== */

const createAtmosphereMaterial =
  () =>
    new THREE.ShaderMaterial({
      uniforms: {
        uColor: {
          value:
            ATMOSPHERE_CONFIG.atmosphereColor,
        },

        uOpacity: {
          value:
            ATMOSPHERE_CONFIG.atmosphereOpacity,
        },
      },

      vertexShader: `
        varying vec3 vWorldNormal;
        varying vec3 vWorldPosition;

        void main() {

          vec4 worldPosition =
            modelMatrix *
            vec4(position, 1.0);

          vWorldPosition =
            worldPosition.xyz;

          vWorldNormal =
            normalize(
              mat3(modelMatrix) *
              normal
            );

          gl_Position =
            projectionMatrix *
            viewMatrix *
            worldPosition;
        }
      `,

      fragmentShader: `
        uniform vec3 uColor;
        uniform float uOpacity;

        varying vec3 vWorldNormal;
        varying vec3 vWorldPosition;

        void main() {

          vec3 viewDirection =
            normalize(
              cameraPosition -
              vWorldPosition
            );

          float facing =
            clamp(
              dot(
                normalize(vWorldNormal),
                viewDirection
              ),
              0.0,
              1.0
            );

          /*
           * Fresnel-style planetary limb.
           *
           * Strong at the edge,
           * almost invisible over the planet face.
           */
          float rim =
            pow(
              1.0 - facing,
              3.2
            );

          float alpha =
            rim *
            uOpacity;

          if (alpha < 0.003) {
            discard;
          }

          gl_FragColor =
            vec4(
              uColor,
              alpha
            );
        }
      `,

      transparent: true,

      depthWrite: false,

      depthTest: true,

      side: THREE.BackSide,

      blending:
        THREE.AdditiveBlending,

      toneMapped: false,
    });

/* ============================================================================
 * OUTER RIM
 * ========================================================================== */

const createOuterRimMaterial =
  () =>
    new THREE.ShaderMaterial({
      uniforms: {
        uColor: {
          value:
            ATMOSPHERE_CONFIG.rimColor,
        },

        uOpacity: {
          value:
            ATMOSPHERE_CONFIG.rimOpacity,
        },
      },

      vertexShader: `
        varying vec3 vWorldNormal;
        varying vec3 vWorldPosition;

        void main() {

          vec4 worldPosition =
            modelMatrix *
            vec4(position, 1.0);

          vWorldPosition =
            worldPosition.xyz;

          vWorldNormal =
            normalize(
              mat3(modelMatrix) *
              normal
            );

          gl_Position =
            projectionMatrix *
            viewMatrix *
            worldPosition;
        }
      `,

      fragmentShader: `
        uniform vec3 uColor;
        uniform float uOpacity;

        varying vec3 vWorldNormal;
        varying vec3 vWorldPosition;

        void main() {

          vec3 viewDirection =
            normalize(
              cameraPosition -
              vWorldPosition
            );

          float facing =
            clamp(
              dot(
                normalize(vWorldNormal),
                viewDirection
              ),
              0.0,
              1.0
            );

          float rim =
            pow(
              1.0 - facing,
              4.8
            );

          float alpha =
            rim *
            uOpacity;

          if (alpha < 0.002) {
            discard;
          }

          gl_FragColor =
            vec4(
              uColor,
              alpha
            );
        }
      `,

      transparent: true,

      depthWrite: false,

      depthTest: true,

      side: THREE.BackSide,

      blending:
        THREE.AdditiveBlending,

      toneMapped: false,
    });

/* ============================================================================
 * COMPONENT
 * ========================================================================== */

const Atmosphere = ({
  visible = true,
  reduceMotion = false,
}) => {
  /* ==========================================================================
   * CLOUD TEXTURE
   * ======================================================================== */

  const cloudTexture =
    useLoader(
      TextureLoader,
      EARTH_CLOUD_TEXTURE,
    );

  /* ==========================================================================
   * TEXTURE PREPARATION
   * ======================================================================== */

  useEffect(() => {
    prepareCloudTexture(
      cloudTexture,
    );
  }, [
    cloudTexture,
  ]);

  /* ==========================================================================
   * MATERIALS
   * ======================================================================== */

  const cloudMaterial =
    useMemo(
      () =>
        createCloudMaterial(
          cloudTexture,
        ),
      [cloudTexture],
    );

  const atmosphereMaterial =
    useMemo(
      () =>
        createAtmosphereMaterial(),
      [],
    );

  const outerRimMaterial =
    useMemo(
      () =>
        createOuterRimMaterial(),
      [],
    );

  /* ==========================================================================
   * CLEANUP
   * ======================================================================== */

  useEffect(() => {
    return () => {
      cloudMaterial.dispose();
      atmosphereMaterial.dispose();
      outerRimMaterial.dispose();
    };
  }, [
    cloudMaterial,
    atmosphereMaterial,
    outerRimMaterial,
  ]);

  /* ==========================================================================
   * VISIBILITY
   * ======================================================================== */

  if (!visible) {
    return null;
  }

  void reduceMotion;

  /* ==========================================================================
   * RENDER
   * ======================================================================== */

  return (
    <group
      name="OrbitGuard-Atmosphere"
      rotation={EARTH_ORIENTATION}
      userData={{
        type: "earth-atmosphere",
        coordinateFrame: "ITRF",
      }}
    >
      {/* ==================================================================
          CLOUD LAYER
          ================================================================== */}

      <mesh
        name="OrbitGuard-EarthClouds"
        scale={[
          CLOUD_RADIUS,
          CLOUD_RADIUS,
          CLOUD_RADIUS,
        ]}
        renderOrder={2}
        raycast={() => null}
      >
        <sphereGeometry
          args={[
            1,
            96,
            96,
          ]}
        />

        <primitive
          object={cloudMaterial}
          attach="material"
        />
      </mesh>

      {/* ==================================================================
          MAIN ATMOSPHERIC LIMB
          ================================================================== */}

      <mesh
        name="OrbitGuard-AtmosphericShell"
        scale={[
          ATMOSPHERE_RADIUS,
          ATMOSPHERE_RADIUS,
          ATMOSPHERE_RADIUS,
        ]}
        renderOrder={3}
        raycast={() => null}
      >
        <sphereGeometry
          args={[
            1,
            80,
            80,
          ]}
        />

        <primitive
          object={atmosphereMaterial}
          attach="material"
        />
      </mesh>

      {/* ==================================================================
          OUTER BLUE LIMB
          ================================================================== */}

      <mesh
        name="OrbitGuard-AtmosphericRim"
        scale={[
          OUTER_RIM_RADIUS,
          OUTER_RIM_RADIUS,
          OUTER_RIM_RADIUS,
        ]}
        renderOrder={4}
        raycast={() => null}
      >
        <sphereGeometry
          args={[
            1,
            72,
            72,
          ]}
        />

        <primitive
          object={outerRimMaterial}
          attach="material"
        />
      </mesh>
    </group>
  );
};

export default Atmosphere;