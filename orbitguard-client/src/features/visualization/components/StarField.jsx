import {
  useEffect,
  useMemo,
  useRef,
} from "react";

import {
  useFrame,
  useThree,
} from "@react-three/fiber";

import * as THREE from "three";

/**
 * ============================================================================
 * OrbitGuard AI — Star Field
 * ============================================================================
 *
 * RESPONSIBILITY
 * ----------------------------------------------------------------------------
 *
 * StarField.jsx owns only the deep-space background surrounding the orbital
 * command center.
 *
 * It owns:
 * - procedural star positions
 * - star colors
 * - star brightness
 * - subtle twinkle
 * - GPU-efficient point rendering
 *
 * It does NOT own:
 * - Earth
 * - atmosphere
 * - satellites
 * - debris
 * - orbital trails
 * - camera controls
 * - UI panels
 * - backend communication
 * - orbital calculations
 *
 * ============================================================================
 * DESIGN
 * ============================================================================
 *
 * The star field is supporting scenery.
 *
 * Priority hierarchy:
 *
 *   UI / selected object
 *        ↓
 *   satellites / debris
 *        ↓
 *   orbital trails
 *        ↓
 *   Earth
 *        ↓
 *   stars
 *
 * The stars should add depth without becoming the main visual element.
 *
 * ============================================================================
 * PERFORMANCE
 * ============================================================================
 *
 * Rendering strategy:
 *
 *   THREE.Points
 *       +
 *   BufferGeometry
 *       +
 *   ShaderMaterial
 *
 * This avoids creating thousands of React components or meshes.
 *
 * ============================================================================
 * ACCESSIBILITY
 * ============================================================================
 *
 * When reduced motion is enabled:
 *
 * - stars remain visible
 * - star positions remain unchanged
 * - shader twinkle is disabled
 *
 * ============================================================================
 */

/* ============================================================================
 * CONFIGURATION
 * ========================================================================== */

const STAR_FIELD_CONFIG = Object.freeze({
  /**
   * Number of background stars.
   *
   * This is intentionally moderate because the main visualization already
   * contains potentially large satellite/debris datasets.
   */
  count: 1800,

  /**
   * Radius of the star distribution.
   *
   * The visualization camera normally operates much closer to Earth.
   */
  radius: 42,

  /**
   * Base shader point size.
   */
  baseSize: 1.7,

  /**
   * Overall star opacity.
   */
  opacity: 0.68,

  /**
   * Maximum visual twinkle contribution.
   */
  twinkleStrength: 0.12,

  /**
   * Twinkle animation speed.
   */
  twinkleSpeed: 0.22,

  /**
   * Maximum device pixel ratio used by the star shader.
   */
  maxPixelRatio: 2,

  /**
   * Maximum rendered point size.
   *
   * Prevents stars from becoming large blobs when close to the camera.
   */
  maxPointSize: 4,
});

/* ============================================================================
 * SEEDED RANDOM
 * ========================================================================== */

/**
 * Deterministic pseudo-random number generator.
 *
 * The star field therefore remains stable between React renders and sessions.
 */
const createSeededRandom = (seed = 42) => {
  let state = seed >>> 0;

  return () => {
    state =
      (1664525 * state + 1013904223) >>> 0;

    return state / 4294967296;
  };
};

/* ============================================================================
 * STAR COLOR
 * ========================================================================== */

/**
 * Generates restrained stellar colors.
 *
 * Most stars are cool white/blue.
 * A small percentage receive subtle warm/cyan tones.
 */
const getStarColor = (random) => {
  const type = random();

  if (type < 0.08) {
    return new THREE.Color("#b9d9ff");
  }

  if (type < 0.14) {
    return new THREE.Color("#ffe1b0");
  }

  if (type < 0.18) {
    return new THREE.Color("#9ee8ff");
  }

  return new THREE.Color("#e9f3ff");
};

/* ============================================================================
 * STAR GEOMETRY
 * ========================================================================== */

/**
 * Creates a deterministic spherical star distribution.
 *
 * A uniform spherical distribution avoids the visual clustering that can
 * happen when x/y/z are independently randomized.
 */
const createStarGeometry = () => {
  const {
    count,
    radius,
    baseSize,
  } = STAR_FIELD_CONFIG;

  const random = createSeededRandom(20261007);

  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const brightness = new Float32Array(count);

  for (let index = 0; index < count; index += 1) {
    /**
     * ------------------------------------------------------------------------
     * UNIFORM SPHERICAL DISTRIBUTION
     * ------------------------------------------------------------------------
     */

    const y = 1 - random() * 2;

    const radial = Math.sqrt(
      Math.max(
        0,
        1 - y * y,
      ),
    );

    const theta =
      random() *
      Math.PI *
      2;

    const x =
      Math.cos(theta) *
      radial;

    const z =
      Math.sin(theta) *
      radial;

    /**
     * ------------------------------------------------------------------------
     * DEPTH VARIATION
     * ------------------------------------------------------------------------
     *
     * A small radial variation prevents the field from looking like one
     * perfectly mathematical shell.
     */

    const distance =
      radius *
      (0.82 + random() * 0.18);

    const offset = index * 3;

    positions[offset] =
      x * distance;

    positions[offset + 1] =
      y * distance;

    positions[offset + 2] =
      z * distance;

    /**
     * ------------------------------------------------------------------------
     * COLOR
     * ------------------------------------------------------------------------
     */

    const color = getStarColor(random);

    colors[offset] = color.r;
    colors[offset + 1] = color.g;
    colors[offset + 2] = color.b;

    /**
     * ------------------------------------------------------------------------
     * SIZE
     * ------------------------------------------------------------------------
     */

    const sizeVariation = random();

    sizes[index] =
      baseSize *
      (
        0.45 +
        sizeVariation * 1.35
      );

    /**
     * ------------------------------------------------------------------------
     * BRIGHTNESS
     * ------------------------------------------------------------------------
     */

    brightness[index] =
      0.42 +
      random() * 0.58;
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

  geometry.computeBoundingSphere();

  return geometry;
};

/* ============================================================================
 * STAR VERTEX SHADER
 * ========================================================================== */

const STAR_VERTEX_SHADER = `
  attribute float aSize;
  attribute float aBrightness;

  varying vec3 vColor;
  varying float vBrightness;

  uniform float uPixelRatio;
  uniform float uSizeMultiplier;

  void main() {
    vColor = color;
    vBrightness = aBrightness;

    vec4 modelPosition =
      modelViewMatrix *
      vec4(position, 1.0);

    /*
     * Perspective scaling.
     *
     * Farther stars become visually smaller.
     */
    float depth =
      max(
        -modelPosition.z,
        0.1
      );

    gl_PointSize =
      aSize *
      uSizeMultiplier *
      uPixelRatio *
      (38.0 / depth);

    /*
     * Prevent oversized points when the camera gets closer.
     */
    gl_PointSize =
      min(
        gl_PointSize,
        4.0
      );

    gl_Position =
      projectionMatrix *
      modelPosition;
  }
`;

/* ============================================================================
 * STAR FRAGMENT SHADER
 * ========================================================================== */

const STAR_FRAGMENT_SHADER = `
  varying vec3 vColor;
  varying float vBrightness;

  uniform float uOpacity;
  uniform float uTime;
  uniform float uTwinkleStrength;
  uniform float uTwinkleEnabled;

  void main() {
    /*
     * Convert the square point sprite into a circular star.
     */
    vec2 centered =
      gl_PointCoord -
      vec2(0.5);

    float distanceFromCenter =
      length(centered);

    if (distanceFromCenter > 0.5) {
      discard;
    }

    /*
     * Soft edge.
     */
    float edge =
      1.0 -
      smoothstep(
        0.18,
        0.5,
        distanceFromCenter
      );

    /*
     * Subtle shader-only twinkle.
     *
     * The star itself never moves.
     */
    float twinkle =
      1.0 +
      (
        sin(
          uTime * 0.7 +
          vBrightness * 13.0
        ) *
        0.5 +
        0.5
      ) *
      uTwinkleStrength *
      uTwinkleEnabled;

    float alpha =
      edge *
      vBrightness *
      uOpacity *
      twinkle;

    if (alpha < 0.01) {
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
 * STAR MATERIAL
 * ========================================================================== */

/**
 * Creates the star shader material.
 *
 * Pixel ratio is intentionally initialized to 1 and updated from the actual
 * R3F renderer through the component.
 */
const createStarMaterial = () =>
  new THREE.ShaderMaterial({
    uniforms: {
      uPixelRatio: {
        value: 1,
      },

      uSizeMultiplier: {
        value: 1,
      },

      uOpacity: {
        value:
          STAR_FIELD_CONFIG.opacity,
      },

      uTime: {
        value: 0,
      },

      uTwinkleStrength: {
        value:
          STAR_FIELD_CONFIG.twinkleStrength,
      },

      uTwinkleEnabled: {
        value: 1,
      },
    },

    vertexShader:
      STAR_VERTEX_SHADER,

    fragmentShader:
      STAR_FRAGMENT_SHADER,

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

const StarField = ({
  reduceMotion = false,
}) => {
  const pointsRef = useRef(null);

  const {
    gl,
  } = useThree();

  /* --------------------------------------------------------------------------
   * GEOMETRY
   * ------------------------------------------------------------------------ */

  const geometry = useMemo(
    () => createStarGeometry(),
    [],
  );

  /* --------------------------------------------------------------------------
   * MATERIAL
   * ------------------------------------------------------------------------ */

  const material = useMemo(
    () => createStarMaterial(),
    [],
  );

  /* --------------------------------------------------------------------------
   * PIXEL RATIO
   * ------------------------------------------------------------------------ */

  useEffect(() => {
    if (!material || !gl) {
      return undefined;
    }

    const updatePixelRatio = () => {
      const rendererPixelRatio =
        gl.getPixelRatio();

      material.uniforms.uPixelRatio.value =
        Math.min(
          rendererPixelRatio || 1,
          STAR_FIELD_CONFIG.maxPixelRatio,
        );
    };

    updatePixelRatio();

    return undefined;
  }, [
    gl,
    material,
  ]);

  /* --------------------------------------------------------------------------
   * REDUCED MOTION
   * ------------------------------------------------------------------------ */

  useEffect(() => {
    if (!material) {
      return;
    }

    material.uniforms.uTwinkleEnabled.value =
      reduceMotion ? 0 : 1;

    if (reduceMotion) {
      material.uniforms.uTime.value = 0;
    }
  }, [
    material,
    reduceMotion,
  ]);

  /* --------------------------------------------------------------------------
   * ANIMATION
   * ------------------------------------------------------------------------ */

  useFrame(
    (_state, delta) => {
      if (
        !pointsRef.current ||
        !material
      ) {
        return;
      }

      if (reduceMotion) {
        return;
      }

      material.uniforms.uTime.value +=
        delta *
        STAR_FIELD_CONFIG.twinkleSpeed;
    },
  );

  /* --------------------------------------------------------------------------
   * CLEANUP
   * ------------------------------------------------------------------------ */

  useEffect(
    () => {
      return () => {
        geometry.dispose();
        material.dispose();
      };
    },
    [
      geometry,
      material,
    ],
  );

  /* --------------------------------------------------------------------------
   * RENDER
   * ------------------------------------------------------------------------ */

  return (
    <points
      ref={pointsRef}
      name="OrbitGuard-StarField"
      geometry={geometry}
      material={material}
      frustumCulled={false}
      renderOrder={-10}
    />
  );
};

export default StarField;