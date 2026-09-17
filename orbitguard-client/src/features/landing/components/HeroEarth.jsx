import { useEffect, useRef } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";


/* ============================================================
   EARTH

   Responsibilities:
   - Render the real Earth texture
   - Handle direct mouse/touch dragging
   - Provide smooth rotation
   - Provide subtle idle movement

   The parent component controls layout and positioning.
============================================================ */

function Earth() {
  const earthRef = useRef(null);

  const isDragging = useRef(false);
  const lastPointer = useRef({
    x: 0,
    y: 0,
  });

  const velocity = useRef({
    x: 0,
    y: 0.0035,
  });

  const [earthTexture, earthNormal] = useLoader(THREE.TextureLoader, [
    "/images/space/earth-day.jpg",
    "/images/space/earth-normal.jpg",
  ]);

  /* ==========================================================
     TEXTURE CONFIGURATION
  ========================================================== */

  earthTexture.colorSpace = THREE.SRGBColorSpace;

  earthTexture.wrapS = THREE.RepeatWrapping;
  earthTexture.wrapT = THREE.ClampToEdgeWrapping;

  earthNormal.wrapS = THREE.RepeatWrapping;
  earthNormal.wrapT = THREE.ClampToEdgeWrapping;

  /* ==========================================================
     POINTER EVENTS
  ========================================================== */

  useEffect(() => {
    const handlePointerMove = (event) => {
      if (!isDragging.current || !earthRef.current) {
        return;
      }

      const deltaX = event.clientX - lastPointer.current.x;

      const deltaY = event.clientY - lastPointer.current.y;

      /*
       * Horizontal movement controls Earth rotation.
       */
      const rotationY = deltaX * 0.005;

      /*
       * Vertical movement controls Earth tilt.
       */
      const rotationX = deltaY * 0.003;

      earthRef.current.rotation.y += rotationY;
      earthRef.current.rotation.x += rotationX;

      /*
       * Prevent excessive vertical tilting.
       */
      earthRef.current.rotation.x = THREE.MathUtils.clamp(
        earthRef.current.rotation.x,
        -0.5,
        0.5,
      );

      /*
       * Save movement as momentum.
       */
      velocity.current.x = rotationX;
      velocity.current.y = rotationY;

      lastPointer.current = {
        x: event.clientX,
        y: event.clientY,
      };
    };

    const handlePointerUp = () => {
      isDragging.current = false;
    };

    window.addEventListener("pointermove", handlePointerMove);

    window.addEventListener("pointerup", handlePointerUp);

    window.addEventListener("pointercancel", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);

      window.removeEventListener("pointerup", handlePointerUp);

      window.removeEventListener("pointercancel", handlePointerUp);
    };
  }, []);

  /* ==========================================================
     EARTH MOTION
  ========================================================== */

  useFrame((_, delta) => {
    if (!earthRef.current) {
      return;
    }

    /*
     * When the user is not dragging, continue a very subtle
     * rotation and momentum.
     */
    if (!isDragging.current) {
      earthRef.current.rotation.y += velocity.current.y * delta * 60;

      earthRef.current.rotation.x += velocity.current.x * delta * 60;

      /*
       * Gradually remove vertical momentum.
       */
      velocity.current.x *= Math.pow(0.88, delta * 60);

      /*
       * Slowly settle toward natural idle rotation.
       */
      velocity.current.y = THREE.MathUtils.lerp(
        velocity.current.y,
        0.0035,
        0.012,
      );
    }

    /*
     * Keep vertical rotation controlled.
     */
    earthRef.current.rotation.x = THREE.MathUtils.clamp(
      earthRef.current.rotation.x,
      -0.5,
      0.5,
    );
  });

  /* ==========================================================
     POINTER DOWN
  ========================================================== */

  const handlePointerDown = (event) => {
    event.stopPropagation();

    isDragging.current = true;

    lastPointer.current = {
      x: event.clientX,
      y: event.clientY,
    };

    /*
     * Stop previous momentum when the user grabs Earth.
     */
    velocity.current.x = 0;
    velocity.current.y = 0;
  };

  return (
    <group ref={earthRef}>
      {/* ======================================================
          OUTER ATMOSPHERE
      ======================================================= */}

      <mesh scale={1.045}>
        <sphereGeometry args={[2.05, 96, 96]} />

        <meshBasicMaterial
          color="#38bdf8"
          transparent
          opacity={0.045}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>

      {/* ======================================================
          EARTH BODY
      ======================================================= */}

      <mesh onPointerDown={handlePointerDown}>
        <sphereGeometry args={[2.05, 96, 96]} />

        <meshStandardMaterial
          map={earthTexture}
          normalMap={earthNormal}
          normalScale={new THREE.Vector2(0.24, 0.24)}
          roughness={0.88}
          metalness={0.01}
          emissive="#071522"
          emissiveIntensity={0.015}
        />
      </mesh>

      {/* ======================================================
          SUBTLE INNER ATMOSPHERE
      ======================================================= */}

      <mesh scale={1.012}>
        <sphereGeometry args={[2.05, 96, 96]} />

        <meshBasicMaterial
          color="#7dd3fc"
          transparent
          opacity={0.018}
          side={THREE.FrontSide}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

/* ============================================================
   EARTH LIGHTING
============================================================ */

function EarthLighting() {
  return (
    <>
      {/* Base illumination */}
      <ambientLight intensity={0.25} />

      {/* Main sunlight */}
      <directionalLight position={[5, 3, 5]} intensity={2.5} color="#ffffff" />

      {/* Cool orbital fill */}
      <pointLight position={[-5, -2, -4]} intensity={0.25} color="#2563eb" />

      {/* Subtle atmospheric rim */}
      <pointLight position={[3, 0, -5]} intensity={0.12} color="#38bdf8" />
    </>
  );
}

/* ============================================================
   SCENE

   IMPORTANT:
   Decorative orbit rings have intentionally been removed.

   We want the Earth to remain the primary visual object.
   Real orbital paths will later belong to the actual
   Visualization experience where they can be driven by
   satellite/debris orbital data.
============================================================ */

function HeroEarthScene() {
  return (
    <>
      <EarthLighting />

      <Earth />
    </>
  );
}

/* ============================================================
   MAIN COMPONENT
============================================================ */

function HeroEarth() {
  return (
    <div
      className="
        relative
        h-[320px]
        w-full
        touch-none
        select-none
        sm:h-[390px]
        md:h-[440px]
        lg:h-[490px]
        xl:h-[520px]
      "
    >
      <Canvas
        camera={{
          position: [0, 0, 7],
          fov: 40,
        }}
        dpr={[1, 1.5]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
      >
        <HeroEarthScene />
      </Canvas>

      {/* ======================================================
          ATMOSPHERIC GLOW

          Kept intentionally subtle so the Earth integrates
          with SpaceBackground instead of becoming a separate
          glowing card.
      ======================================================= */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          left-1/2
          top-1/2
          -z-10
          h-[48%]
          w-[48%]
          -translate-x-1/2
          -translate-y-1/2
          rounded-full
          bg-cyan-400/[0.055]
          blur-[80px]
        "
      />

      {/* ======================================================
          INTERACTION HINT
      ======================================================= */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          bottom-2
          left-1/2
          -translate-x-1/2
          whitespace-nowrap
          font-mono
          text-[8px]
          uppercase
          tracking-[0.2em]
          text-white/20
        "
      >
        Drag to rotate
      </div>
    </div>
  );
}

export default HeroEarth;
