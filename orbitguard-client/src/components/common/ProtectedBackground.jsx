import { useMemo } from "react";

/* =================================================================
   CONFIGURATION
   ================================================================= */

const STAR_COUNT = 85;

const STAR_COLORS = [
  "rgba(255,255,255,0.90)",
  "rgba(186,230,253,0.85)",
  "rgba(103,232,249,0.85)",
  "rgba(147,197,253,0.80)",
];

/* =================================================================
   STAR GENERATOR
   ================================================================= */

function createStars() {
  return Array.from({ length: STAR_COUNT }, (_, index) => {
    /*
     * Start close to the center.
     * End far away from the center.
     *
     * This creates the feeling that stars are
     * travelling toward the viewer.
     */

    const angle = Math.random() * Math.PI * 2;

    const startDistance = 10 + Math.random() * 80;
    const endDistance = 350 + Math.random() * 900;

    const startX = Math.cos(angle) * startDistance;
    const startY = Math.sin(angle) * startDistance;

    const endX = Math.cos(angle) * endDistance;
    const endY = Math.sin(angle) * endDistance;

    const size = 0.7 + Math.random() * 1.8;

    const duration = 4 + Math.random() * 7;

    const delay = -(Math.random() * duration);

    const opacity = 0.25 + Math.random() * 0.65;

    const color =
      STAR_COLORS[
        Math.floor(Math.random() * STAR_COLORS.length)
      ];

    return {
      id: index,
      startX,
      startY,
      endX,
      endY,
      size,
      duration,
      delay,
      opacity,
      color,
    };
  });
}

/* =================================================================
   COMPONENT
   ================================================================= */

function ProtectedBackground() {
  const stars = useMemo(() => createStars(), []);

  return (
    <div
      aria-hidden="true"
      className="
        pointer-events-none
        fixed
        inset-0
        z-0
        overflow-hidden
        bg-[#050816]
      "
    >
      {/* =========================================================
          COSMIC IMAGE
          ========================================================= */}

      <div
        className="
          absolute
          inset-[-30px]

          bg-cover
          bg-center
          bg-no-repeat

          opacity-[0.30]

          blur-[12px]

          scale-[1.08]
        "
        style={{
          backgroundImage:
            "url('/images/background/appBackground.png')",
        }}
      />

      {/* =========================================================
          DARK ATMOSPHERIC OVERLAY
          ========================================================= */}

      <div
        className="
          absolute
          inset-0

          bg-[#020510]/65
        "
      />

      {/* =========================================================
          BLUE / CYAN ATMOSPHERE
          ========================================================= */}

      <div
        className="
          absolute
          inset-0

          bg-[radial-gradient(circle_at_50%_50%,rgba(14,165,233,0.07),transparent_45%)]
        "
      />

      {/* =========================================================
          STAR FIELD
          ========================================================= */}

      <div
        className="
          absolute
          inset-0
          overflow-hidden
        "
      >
        {stars.map((star) => (
          <span
            key={star.id}
            className="
              absolute
              left-1/2
              top-1/2
              block
              rounded-full

              animate-orbit-star

              will-change-transform
            "
            style={{
              width: `${star.size}px`,
              height: `${star.size}px`,

              backgroundColor: star.color,

              opacity: star.opacity,

              boxShadow: `
                0 0 ${star.size * 3}px ${star.color}
              `,

              "--star-start-x": `${star.startX}px`,
              "--star-start-y": `${star.startY}px`,
              "--star-end-x": `${star.endX}px`,
              "--star-end-y": `${star.endY}px`,

              "--star-duration": `${star.duration}s`,
              "--star-delay": `${star.delay}s`,
            }}
          />
        ))}
      </div>

      {/* =========================================================
          SOFT VIGNETTE
          ========================================================= */}

      <div
        className="
          absolute
          inset-0

          bg-[radial-gradient(ellipse_at_center,transparent_25%,rgba(1,4,12,0.38)_100%)]
        "
      />
    </div>
  );
}

export default ProtectedBackground;