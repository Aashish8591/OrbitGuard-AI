import { memo } from "react";
import { motion, useReducedMotion } from "framer-motion";

/**
 * ================================================================
 * OrbitGuard AI — Compact Welcome Hero
 * ================================================================
 *
 * RESPONSIBILITIES
 * - Introduce the OrbitGuard AI assistant.
 * - Display the existing cinematic space background.
 * - Preserve OrbitGuard branding and visual identity.
 * - Minimize vertical space to prioritize the chat workspace.
 * - Support responsive layouts across all device sizes.
 *
 * PRESENTATION ONLY
 * - No API requests.
 * - No mock data.
 * - No backend dependencies.
 * ================================================================
 */

const HERO_BACKGROUND = "/images/Ai/ai-welcome-hero.png";

const HERO_VARIANTS = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
};

const CONTENT_VARIANTS = {
  hidden: {
    opacity: 0,
    y: 6,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.35,
      delay: 0.05,
      ease: "easeOut",
    },
  },
};

const AIWelcomeHero = memo(function AIWelcomeHero() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.section
      aria-labelledby="ai-welcome-heading"
      initial={shouldReduceMotion ? false : "hidden"}
      animate="visible"
      variants={HERO_VARIANTS}
      className="
        relative
        isolate
        w-full
        min-w-0
        overflow-hidden
        rounded-xl
        border
        border-cyan-400/20
        bg-[#030b18]
        shadow-[0_8px_32px_rgba(0,0,0,0.18)]
        sm:rounded-2xl
      "
    >
      {/* CINEMATIC BACKGROUND */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-0
          -z-10
          bg-cover
          bg-[position:65%_center]
          sm:bg-[position:68%_center]
        "
        style={{
          backgroundImage: `
            linear-gradient(
              90deg,
              rgba(2, 8, 20, 0.97) 0%,
              rgba(2, 8, 20, 0.91) 38%,
              rgba(2, 8, 20, 0.64) 68%,
              rgba(2, 8, 20, 0.30) 100%
            ),
            linear-gradient(
              0deg,
              rgba(2, 8, 20, 0.65) 0%,
              transparent 70%
            ),
            url("${HERO_BACKGROUND}")
          `,
        }}
      />

      {/* ATMOSPHERIC GLOW */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          -right-16
          -top-12
          -z-10
          h-36
          w-36
          rounded-full
          bg-cyan-400/[0.07]
          blur-3xl
          sm:h-48
          sm:w-48
        "
      />

      {/* COMPACT HERO CONTENT */}

      <motion.div
        variants={shouldReduceMotion ? undefined : CONTENT_VARIANTS}
        className="
  flex
  min-h-[105px]
  flex-col
  justify-center
  px-4
  py-2
  sm:min-h-[115px]
  sm:px-5
  sm:py-2
  lg:min-h-[125px]
  lg:px-6
  lg:py-2
  xl:min-h-[135px]
  xl:px-7
  xl:py-2
"
      >
        {/* SYSTEM LABEL */}

        <div className="mb-2.5 sm:mb-3">
          <span
            className="
              inline-flex
              max-w-full
              items-center
              gap-2
              rounded-full
              border
              border-cyan-400/25
              bg-[#061727]/80
              px-2.5
              py-1
              font-['Orbitron']
              text-[8px]
              font-semibold
              uppercase
              tracking-[0.13em]
              text-cyan-300
              sm:px-3
              sm:text-[9px]
              sm:tracking-[0.16em]
            "
          >
            <span
              aria-hidden="true"
              className="
                h-1
                w-1
                shrink-0
                rounded-full
                bg-cyan-400
                shadow-[0_0_8px_rgba(34,211,238,0.8)]
              "
            />
            Orbital Intelligence System
          </span>
        </div>

        {/* BRAND HEADING */}

        <h1
          id="ai-welcome-heading"
          className="
            max-w-full
            font-['Orbitron']
            text-[clamp(1.4rem,2.7vw,2.4rem)]
            font-bold
            leading-tight
            tracking-[-0.045em]
            text-white
          "
        >
          ORBITGUARD{" "}
          <span
            className="
              text-cyan-400
              [text-shadow:0_0_20px_rgba(34,211,238,0.22)]
            "
          >
            AI
          </span>
        </h1>

        {/* SUBTITLE */}

        <p
          className="
            mt-2
            font-['Orbitron']
            text-[8px]
            font-medium
            uppercase
            leading-relaxed
            tracking-[0.12em]
            text-slate-300
            sm:text-[9px]
            sm:tracking-[0.17em]
            md:text-[10px]
          "
        >
          Your Orbital Intelligence Copilot
        </p>

        {/* DESCRIPTION */}

        <p
          className="
            mt-2.5
            max-w-xl
            font-['Inter']
            text-[11px]
            leading-[1.65]
            text-slate-300
            sm:mt-3
            sm:text-xs
            sm:leading-5
            lg:max-w-2xl
          "
        >
          Explore satellite intelligence, orbital mechanics, space debris, and
          collision-risk concepts with your OrbitGuard AI assistant.
        </p>

        {/* COMPACT SYSTEM INDICATOR */}

        <div
          aria-hidden="true"
          className="
            mt-3
            flex
            min-w-0
            items-center
            gap-2
            sm:mt-4
          "
        >
          <span className="h-px w-6 shrink-0 bg-cyan-400/80 sm:w-8" />

          <span
            className="
              font-['Orbitron']
              text-[7px]
              uppercase
              leading-relaxed
              tracking-[0.1em]
              text-cyan-300/80
              sm:text-[8px]
              sm:tracking-[0.14em]
            "
          >
            Space Intelligence · Mission Support
          </span>
        </div>
      </motion.div>

      {/* BOTTOM CYAN EDGE */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-x-0
          bottom-0
          h-px
          bg-gradient-to-r
          from-transparent
          via-cyan-400/50
          to-transparent
        "
      />
    </motion.section>
  );
});

AIWelcomeHero.displayName = "AIWelcomeHero";

export default AIWelcomeHero;
