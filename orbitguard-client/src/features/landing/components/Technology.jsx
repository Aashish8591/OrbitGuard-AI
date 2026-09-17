import { motion } from "framer-motion";
import {
  FiActivity,
  FiArrowUpRight,
  FiBox,
  FiCpu,
  FiDatabase,
  FiGlobe,
  FiLock,
  FiServer,
  FiShield,
  FiZap,
} from "react-icons/fi";

const technologyLayers = [
  {
    number: "01",
    label: "DATA",
    title: "Real orbital information.",
    description:
      "OrbitGuard begins with satellite, space-debris, NORAD, and orbital-parameter data to establish a reliable view of the environment.",
    items: [
      "Satellite data",
      "Space debris",
      "NORAD identifiers",
      "Orbital parameters",
    ],
    icon: FiDatabase,
  },
  {
    number: "02",
    label: "COMPUTE",
    title: "Model how objects move.",
    description:
      "Orbital information is processed through SGP4-based propagation to estimate object position, velocity, and movement over time.",
    items: [
      "SGP4 propagation",
      "Position & velocity",
      "Time-based analysis",
      "Orbital prediction",
    ],
    icon: FiActivity,
  },
  {
    number: "03",
    label: "INTELLIGENCE",
    title: "Understand what matters.",
    description:
      "Computed orbital information becomes risk intelligence through conjunction analysis, analytics, alerts, reports, and AI-assisted interpretation.",
    items: [
      "Risk assessment",
      "Analytics",
      "Alerts & notifications",
      "AI-assisted insights",
    ],
    icon: FiCpu,
  },
];

const architectureItems = [
  {
    title: "Frontend",
    value: "React",
    description: "Modern UI / 3D visualization",
    icon: FiGlobe,
  },
  {
    title: "API Layer",
    value: "REST",
    description: "Application communication",
    icon: FiZap,
  },
  {
    title: "Backend",
    value: "Spring Boot",
    description: "Business logic & services",
    icon: FiServer,
  },
  {
    title: "Database",
    value: "MongoDB",
    description: "Orbital data storage",
    icon: FiDatabase,
  },
];

const serviceItems = [
  {
    title: "Risk Engine",
    description: "Conjunction analysis and collision-risk assessment.",
    icon: FiShield,
  },
  {
    title: "AI Service",
    description: "Natural-language orbital insights and assistance.",
    icon: FiCpu,
  },
  {
    title: "3D Engine",
    description: "Interactive Earth and orbital visualization.",
    icon: FiBox,
  },
  {
    title: "Security",
    description: "JWT authentication and role-based access control.",
    icon: FiLock,
  },
];

const revealContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const revealItem = {
  hidden: {
    opacity: 0,
    y: 18,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.65,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

/* ============================================================
   TECHNOLOGY CORE

   The background artwork already contains:
   - galaxy
   - planet
   - orbital rings
   - debris

   Therefore this component deliberately avoids another large
   artificial orbital system. It acts as an intelligence layer
   over the artwork instead.
============================================================ */

function TechnologyCore() {
  return (
    <div
      className="
        relative
        mx-auto
        h-[390px]
        w-full
        max-w-[620px]
        sm:h-[500px]
        lg:h-[570px]
      "
    >
      {/* Central atmospheric glow */}
      <motion.div
        aria-hidden="true"
        className="
          absolute
          left-1/2
          top-1/2
          h-[190px]
          w-[190px]
          -translate-x-1/2
          -translate-y-1/2
          rounded-full
          bg-cyan-400/[0.07]
          blur-[90px]
        "
        animate={{
          scale: [0.9, 1.08, 0.9],
          opacity: [0.35, 0.65, 0.35],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Subtle intelligence field */}
      <div
        aria-hidden="true"
        className="
          absolute
          left-1/2
          top-1/2
          h-[230px]
          w-[230px]
          -translate-x-1/2
          -translate-y-1/2
          rounded-full
          border
          border-white/[0.08]
        "
      />

      <div
        aria-hidden="true"
        className="
          absolute
          left-1/2
          top-1/2
          h-[190px]
          w-[280px]
          -translate-x-1/2
          -translate-y-1/2
          rotate-[18deg]
          rounded-[50%]
          border
          border-cyan-300/[0.12]
        "
      />

      <div
        aria-hidden="true"
        className="
          absolute
          left-1/2
          top-1/2
          h-[160px]
          w-[300px]
          -translate-x-1/2
          -translate-y-1/2
          -rotate-[32deg]
          rounded-[50%]
          border
          border-white/[0.06]
        "
      />

      {/* Animated signal point */}
      <motion.span
        aria-hidden="true"
        className="
          absolute
          left-[20%]
          top-[32%]
          h-1.5
          w-1.5
          rounded-full
          bg-cyan-200
          shadow-[0_0_14px_rgba(103,232,249,0.9)]
        "
        animate={{
          x: [0, 24, 8, -12, 0],
          y: [0, -14, 4, 10, 0],
          opacity: [0.35, 1, 0.55, 1, 0.35],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Animated signal point */}
      <motion.span
        aria-hidden="true"
        className="
          absolute
          right-[20%]
          top-[55%]
          h-1.5
          w-1.5
          rounded-full
          bg-cyan-200
          shadow-[0_0_14px_rgba(103,232,249,0.9)]
        "
        animate={{
          x: [0, -18, -5, 14, 0],
          y: [0, 10, -5, -12, 0],
          opacity: [0.3, 1, 0.5, 0.9, 0.3],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* ========================================================
          CENTRAL INTELLIGENCE CORE
      ======================================================== */}

      <motion.div
        initial={{
          opacity: 0,
          scale: 0.9,
        }}
        whileInView={{
          opacity: 1,
          scale: 1,
        }}
        viewport={{
          once: true,
          amount: 0.2,
        }}
        transition={{
          duration: 0.9,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="
          absolute
          left-1/2
          top-1/2
          flex
          h-[135px]
          w-[135px]
          -translate-x-1/2
          -translate-y-1/2
          items-center
          justify-center
          rounded-full
          border
          border-cyan-200/25
          bg-[#050816]/75
          shadow-[0_0_70px_rgba(34,211,238,0.14)]
          backdrop-blur-[4px]
          sm:h-[165px]
          sm:w-[165px]
          lg:h-[190px]
          lg:w-[190px]
        "
      >
        <div
          className="
            absolute
            inset-3
            rounded-full
            border
            border-cyan-300/[0.15]
            bg-[radial-gradient(circle_at_35%_30%,rgba(103,232,249,0.16),transparent_38%),radial-gradient(circle,rgba(7,17,31,0.95),rgba(2,6,23,1))]
          "
        />

        <div className="relative z-10 text-center">
          <FiGlobe
            size={28}
            strokeWidth={1}
            className="mx-auto text-cyan-200/80"
          />

          <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.24em] text-cyan-200/75">
            ORBITGUARD
          </p>

          <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.18em] text-slate-300/45">
            INTELLIGENCE CORE
          </p>
        </div>
      </motion.div>

      {/* ========================================================
          SATELLITE SIGNAL
      ======================================================== */}

      <motion.div
        initial={{
          opacity: 0,
          x: -15,
        }}
        whileInView={{
          opacity: 1,
          x: 0,
        }}
        viewport={{
          once: true,
          amount: 0.2,
        }}
        transition={{
          duration: 0.6,
          delay: 0.15,
        }}
        className="
          absolute
          left-[3%]
          top-[17%]
          hidden
          sm:block
        "
      >
        <div className="flex items-center gap-2.5">
          <div
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-full
              border
              border-cyan-300/25
              bg-[#050816]/70
              backdrop-blur-sm
            "
          >
            <FiGlobe size={15} strokeWidth={1.2} className="text-cyan-200/75" />
          </div>

          <div>
            <p className="font-mono text-[12px] uppercase tracking-[0.16em] text-white/75">
              SATELLITES
            </p>

            <p className="mt-0.5 text-[12px] text-slate-300/50">
              Real orbital objects
            </p>
          </div>
        </div>
      </motion.div>

      {/* ========================================================
          DEBRIS SIGNAL
      ======================================================== */}

      <motion.div
        initial={{
          opacity: 0,
          x: 15,
        }}
        whileInView={{
          opacity: 1,
          x: 0,
        }}
        viewport={{
          once: true,
          amount: 0.2,
        }}
        transition={{
          duration: 0.6,
          delay: 0.25,
        }}
        className="
          absolute
          right-[2%]
          top-[25%]
          hidden
          sm:block
        "
      >
        <div className="flex items-center gap-2.5">
          <div className="text-right">
            <p className="font-mono text-[12px] uppercase tracking-[0.16em] text-white/75">
              SPACE DEBRIS
            </p>

            <p className="mt-0.5 text-[12px] text-slate-300/50">
              Tracked objects
            </p>
          </div>

          <div
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-full
              border
              border-cyan-300/25
              bg-[#050816]/70
              backdrop-blur-sm
            "
          >
            <FiBox size={15} strokeWidth={1.2} className="text-cyan-200/75" />
          </div>
        </div>
      </motion.div>

      {/* ========================================================
          RISK SIGNAL
      ======================================================== */}

      <motion.div
        initial={{
          opacity: 0,
          x: -15,
        }}
        whileInView={{
          opacity: 1,
          x: 0,
        }}
        viewport={{
          once: true,
          amount: 0.2,
        }}
        transition={{
          duration: 0.6,
          delay: 0.35,
        }}
        className="
          absolute
          bottom-[18%]
          left-[5%]
          hidden
          sm:block
        "
      >
        <div className="flex items-center gap-2.5">
          <div
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-full
              border
              border-cyan-300/25
              bg-[#050816]/70
              backdrop-blur-sm
            "
          >
            <FiShield
              size={15}
              strokeWidth={1.2}
              className="text-cyan-200/75"
            />
          </div>

          <div>
            <p className="font-mono text-[12px] uppercase tracking-[0.16em] text-white/75">
              RISK ENGINE
            </p>

            <p className="mt-0.5 text-[12px] text-slate-300/50">
              Orbital assessment
            </p>
          </div>
        </div>
      </motion.div>

      {/* ========================================================
          AI SIGNAL
      ======================================================== */}

      <motion.div
        initial={{
          opacity: 0,
          x: 15,
        }}
        whileInView={{
          opacity: 1,
          x: 0,
        }}
        viewport={{
          once: true,
          amount: 0.2,
        }}
        transition={{
          duration: 0.6,
          delay: 0.45,
        }}
        className="
          absolute
          bottom-[14%]
          right-[4%]
          hidden
          sm:block
        "
      >
        <div className="flex items-center gap-2.5">
          <div className="text-right">
            <p className="font-mono text-[12px] uppercase tracking-[0.16em] text-white/75">
              AI SERVICE
            </p>

            <p className="mt-0.5 text-[12px] text-slate-300/50">
              Intelligent assistance
            </p>
          </div>

          <div
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-full
              border
              border-cyan-300/25
              bg-[#050816]/70
              backdrop-blur-sm
            "
          >
            <FiCpu size={15} strokeWidth={1.2} className="text-cyan-200/75" />
          </div>
        </div>
      </motion.div>

      {/* ========================================================
          TOP DATA LABEL
      ======================================================== */}

      <div
        className="
          absolute
          left-1/2
          top-[4%]
          -translate-x-1/2
          text-center
        "
      >
        <p className="font-mono text-[12px] uppercase tracking-[0.22em] text-cyan-200/65">
          REAL ORBITAL DATA
        </p>

        <div className="mx-auto mt-2 h-8 w-px bg-gradient-to-b from-cyan-300/45 to-transparent" />
      </div>

      {/* ========================================================
          BOTTOM INTELLIGENCE LABEL
      ======================================================== */}

      <div
        className="
          absolute
          bottom-[2%]
          left-1/2
          -translate-x-1/2
          text-center
        "
      >
        <div className="mx-auto mb-2 h-8 w-px bg-gradient-to-t from-cyan-300/45 to-transparent" />

        <p className="font-mono text-[12px] uppercase tracking-[0.22em] text-cyan-200/65">
          ACTIONABLE INTELLIGENCE
        </p>
      </div>
    </div>
  );
}

/* ==============================================================
   TECHNOLOGY SECTION
============================================================== */

function Technology() {
  return (
    <section
      id="technology"
      className="
        relative
        isolate
        overflow-hidden
        px-5
        pb-28
        pt-24
        sm:px-8
        sm:pb-32
        sm:pt-28
        lg:px-12
        lg:pb-40
        lg:pt-32
        xl:px-16
      "
    >
      {/* ========================================================
          FULL TECHNOLOGY BACKGROUND

          This artwork belongs to the complete section.
          It is NOT attached to a card.
      ======================================================== */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-0
          z-0
          overflow-hidden
        "
      >
        {/* ======================================================
            Main cosmic artwork

            Important:
            We intentionally use object-cover here because the
            artwork should behave as an atmospheric environment,
            not as a normal content image.
        ====================================================== */}

        <img
          src="/images/Technology/technologyBg.png"
          alt=""
          className="
            absolute
            left-1/2
            top-0
            h-full
            w-full
            min-w-[1100px]
            -translate-x-1/2
            object-cover
            object-center
            opacity-[0.92]
            brightness-[0.52]
            contrast-[1.08]
            saturate-[1.08]
            sm:min-w-[1400px]
            lg:min-w-[1700px]
          "
        />

        {/* ======================================================
            Cinematic darkening

            Kept intentionally light so the artwork remains
            visible.
        ====================================================== */}

        <div
          className="
            absolute
            inset-0
            bg-[#050816]/[0.10]
          "
        />

        {/* ======================================================
            Left readability protection

            Text sits primarily on the left side.
        ====================================================== */}

        <div
          className="
            absolute
            inset-0
            bg-gradient-to-r
            from-[#050816]/75
            via-[#050816]/25
            to-transparent
          "
        />

        {/* ======================================================
            Center atmosphere
        ====================================================== */}

        <div
          className="
            absolute
            inset-0
            bg-[radial-gradient(circle_at_68%_20%,rgba(56,189,248,0.08),transparent_26%),radial-gradient(circle_at_78%_58%,rgba(37,99,235,0.05),transparent_32%)]
          "
        />

        {/* ======================================================
            Top transition
        ====================================================== */}

        <div
          className="
            absolute
            inset-x-0
            top-0
            h-64
            bg-gradient-to-b
            from-[#050816]
            via-[#050816]/50
            to-transparent
          "
        />

        {/* ======================================================
            Bottom transition
        ====================================================== */}

        <div
          className="
            absolute
            inset-x-0
            bottom-0
            h-80
            bg-gradient-to-t
            from-[#050816]
            via-[#050816]/65
            to-transparent
          "
        />
      </div>

      {/* ========================================================
          CONTENT
      ======================================================== */}

      <div className="relative z-10 mx-auto max-w-[1440px]">
        {/* ======================================================
            TECHNOLOGY HERO
        ====================================================== */}

        <div
          className="
            grid
            items-center
            gap-12
            lg:grid-cols-[0.9fr_1.1fr]
            lg:gap-4
          "
        >
          {/* ====================================================
              EDITORIAL CONTENT
          ==================================================== */}

          <motion.div
            variants={revealContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{
              once: true,
              amount: 0.2,
            }}
            className="
              relative
              z-20
              max-w-[650px]
            "
          >
            <motion.div
              variants={revealItem}
              className="flex items-center gap-3"
            >
              <span className="h-px w-8 bg-cyan-300/55" />

              <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-cyan-200/75">
                TECHNOLOGY
              </span>
            </motion.div>

            <motion.h2
              variants={revealItem}
              className="
                mt-7
                text-balance
                text-[3.2rem]
                font-light
                uppercase
                leading-[0.88]
                tracking-[-0.06em]
                text-white
                sm:text-6xl
                md:text-7xl
                lg:text-[4.9rem]
                xl:text-[5.4rem]
              "
            >
              Data becomes
              <span className="block text-cyan-200/80">a safer</span>
              <span className="block">tomorrow.</span>
            </motion.h2>

            <motion.p
              variants={revealItem}
              className="
                mt-7
                max-w-[570px]
                text-sm
                leading-6
                text-slate-200/75
                sm:text-[15px]
                sm:leading-7
              "
            >
              OrbitGuard combines real orbital data, advanced computation, risk
              intelligence, visualization, and AI-assisted analysis to transform
              complex space information into clear, actionable insight.
            </motion.p>

            {/* ==================================================
                TECHNICAL METADATA
            ================================================== */}

            <motion.div
              variants={revealItem}
              className="
                mt-8
                grid
                max-w-[540px]
                grid-cols-2
                border-y
                border-white/[0.12]
                bg-[#050816]/20
                backdrop-blur-[2px]
                sm:grid-cols-3
              "
            >
              <div className="border-r border-white/[0.10] py-4 pr-4">
                <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-cyan-200/65">
                  DATA
                </p>

                <p className="mt-1.5 text-sm text-slate-100/80">
                  Orbital sources
                </p>
              </div>

              <div className="border-r border-white/[0.10] px-4 py-4">
                <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-cyan-200/65">
                  ENGINE
                </p>

                <p className="mt-1.5 text-sm text-slate-100/80">
                  SGP4 propagation
                </p>
              </div>

              <div className="col-span-2 py-4 pl-0 sm:col-span-1 sm:pl-4">
                <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-cyan-200/65">
                  INTELLIGENCE
                </p>

                <p className="mt-1.5 text-sm text-slate-100/80">Risk + AI</p>
              </div>
            </motion.div>
          </motion.div>

          {/* ====================================================
              TECHNOLOGY VISUAL
          ==================================================== */}

          <motion.div
            initial={{
              opacity: 0,
              scale: 0.95,
              x: 20,
            }}
            whileInView={{
              opacity: 1,
              scale: 1,
              x: 0,
            }}
            viewport={{
              once: true,
              amount: 0.15,
            }}
            transition={{
              duration: 1,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="relative"
          >
            <TechnologyCore />
          </motion.div>
        </div>

        {/* ======================================================
            HOW IT WORKS
        ====================================================== */}

        <div
          className="
            mt-20
            border-t
            border-white/[0.10]
            pt-16
            sm:mt-24
            sm:pt-20
            lg:mt-28
            lg:pt-24
          "
        >
          <motion.div
            initial={{
              opacity: 0,
              y: 18,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{
              once: true,
              amount: 0.2,
            }}
            transition={{
              duration: 0.7,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="
              grid
              gap-7
              lg:grid-cols-[1fr_0.65fr]
              lg:items-end
            "
          >
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-cyan-200/70">
                HOW IT WORKS
              </p>

              <h3
                className="
                  mt-4
                  max-w-[650px]
                  text-balance
                  text-4xl
                  font-light
                  uppercase
                  leading-[0.92]
                  tracking-[-0.05em]
                  text-white
                  sm:text-5xl
                  lg:text-6xl
                "
              >
                From raw data
                <span className="block text-cyan-200/75">
                  to real-world impact.
                </span>
              </h3>
            </div>

            <p className="max-w-[420px] text-sm leading-6 text-slate-200/65 lg:justify-self-end">
              A connected system transforms orbital information through
              computation, analysis, and intelligent services into meaningful
              operational insight.
            </p>
          </motion.div>

          {/* ====================================================
              DATA → COMPUTE → INTELLIGENCE
          ==================================================== */}

          <div className="mt-12 grid gap-px bg-white/[0.10] sm:grid-cols-3">
            {technologyLayers.map((layer, index) => {
              const LayerIcon = layer.icon;

              return (
                <motion.article
                  key={layer.number}
                  initial={{
                    opacity: 0,
                    y: 20,
                  }}
                  whileInView={{
                    opacity: 1,
                    y: 0,
                  }}
                  viewport={{
                    once: true,
                    amount: 0.2,
                  }}
                  transition={{
                    duration: 0.65,
                    delay: index * 0.08,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="
                    group
                    relative
                    min-h-[350px]
                    bg-[#050816]/60
                    p-6
                    backdrop-blur-[2px]
                    transition-colors
                    duration-500
                    hover:bg-[#07111f]/75
                    sm:p-7
                    lg:p-8
                  "
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] tracking-[0.18em] text-white/40">
                      {layer.number}
                    </span>

                    <LayerIcon
                      size={20}
                      strokeWidth={1.2}
                      className="
                        text-cyan-200/65
                        transition-colors
                        duration-300
                        group-hover:text-cyan-200
                      "
                    />
                  </div>

                  <p className="mt-10 font-mono text-[10px] uppercase tracking-[0.24em] text-cyan-200/65">
                    {layer.label}
                  </p>

                  <h4 className="mt-3 max-w-[360px] text-2xl font-light uppercase leading-[0.95] tracking-[-0.035em] text-white">
                    {layer.title}
                  </h4>

                  <p className="mt-5 max-w-[400px] text-xs leading-5 text-slate-200/65 sm:text-sm sm:leading-6">
                    {layer.description}
                  </p>

                  <div className="mt-7 space-y-2">
                    {layer.items.map((item) => (
                      <div
                        key={item}
                        className="
                          flex
                          items-center
                          gap-2.5
                          text-[10px]
                          uppercase
                          tracking-[0.06em]
                          text-slate-100/60
                        "
                      >
                        <span className="h-1 w-1 shrink-0 rounded-full bg-cyan-300/65" />

                        {item}
                      </div>
                    ))}
                  </div>

                  <span
                    aria-hidden="true"
                    className="
                      absolute
                      bottom-0
                      left-0
                      h-px
                      w-0
                      bg-cyan-300/75
                      transition-all
                      duration-700
                      group-hover:w-full
                    "
                  />
                </motion.article>
              );
            })}
          </div>

          {/* ====================================================
              FLOW INDICATOR
          ==================================================== */}

          <div className="mt-5 hidden items-center justify-center gap-3 sm:flex">
            <span className="font-mono text-[8px] uppercase tracking-[0.2em] text-slate-200/35">
              DATA
            </span>

            <FiArrowUpRight size={12} className="text-cyan-300/55" />

            <span className="font-mono text-[8px] uppercase tracking-[0.2em] text-slate-200/35">
              COMPUTE
            </span>

            <FiArrowUpRight size={12} className="text-cyan-300/55" />

            <span className="font-mono text-[8px] uppercase tracking-[0.2em] text-slate-200/35">
              INTELLIGENCE
            </span>
          </div>
        </div>

        {/* ======================================================
            INSIDE ORBITGUARD
        ====================================================== */}

        <div
          className="
            mt-24
            border-t
            border-white/[0.10]
            pt-16
            sm:mt-28
            sm:pt-20
            lg:mt-36
            lg:pt-24
          "
        >
          <div className="grid gap-12 lg:grid-cols-[0.65fr_1.35fr] lg:gap-20">
            {/* Architecture introduction */}

            <motion.div
              initial={{
                opacity: 0,
                y: 18,
              }}
              whileInView={{
                opacity: 1,
                y: 0,
              }}
              viewport={{
                once: true,
                amount: 0.2,
              }}
              transition={{
                duration: 0.7,
              }}
            >
              <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-cyan-200/70">
                INSIDE ORBITGUARD
              </p>

              <h3
                className="
                  mt-5
                  text-4xl
                  font-light
                  uppercase
                  leading-[0.92]
                  tracking-[-0.05em]
                  text-white
                  sm:text-5xl
                "
              >
                One system.
                <span className="block text-slate-200/60">
                  Many connected layers.
                </span>
              </h3>

              <p className="mt-6 max-w-[450px] text-sm leading-6 text-slate-200/65">
                A modern application architecture connects the user experience,
                backend services, orbital computation, data storage, security,
                visualization, and AI assistance.
              </p>
            </motion.div>

            {/* Architecture visualization */}

            <div className="relative">
              {/* Main architecture */}

              <div className="grid gap-px bg-white/[0.10] sm:grid-cols-2">
                {architectureItems.map((item, index) => {
                  const ArchitectureIcon = item.icon;

                  return (
                    <motion.div
                      key={item.title}
                      initial={{
                        opacity: 0,
                        y: 15,
                      }}
                      whileInView={{
                        opacity: 1,
                        y: 0,
                      }}
                      viewport={{
                        once: true,
                        amount: 0.2,
                      }}
                      transition={{
                        duration: 0.55,
                        delay: index * 0.06,
                      }}
                      className="
                        group
                        bg-[#050816]/60
                        p-6
                        backdrop-blur-[2px]
                        transition-colors
                        duration-300
                        hover:bg-[#07111f]/75
                      "
                    >
                      <ArchitectureIcon
                        size={19}
                        strokeWidth={1.2}
                        className="
                          text-cyan-200/65
                          transition-colors
                          duration-300
                          group-hover:text-cyan-200
                        "
                      />

                      <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.18em] text-slate-200/50">
                        {item.title}
                      </p>

                      <p className="mt-1 text-lg font-light text-white">
                        {item.value}
                      </p>

                      <p className="mt-1 text-[11px] leading-4 text-slate-200/55">
                        {item.description}
                      </p>
                    </motion.div>
                  );
                })}
              </div>

              {/* REST API connection */}

              <div className="my-3 flex items-center justify-center">
                <div className="flex items-center gap-3">
                  <span className="h-px w-12 bg-white/[0.10]" />

                  <span
                    className="
                      border
                      border-cyan-300/25
                      bg-[#050816]/80
                      px-3
                      py-1
                      font-mono
                      text-[8px]
                      uppercase
                      tracking-[0.18em]
                      text-cyan-200/65
                    "
                  >
                    REST API
                  </span>

                  <span className="h-px w-12 bg-white/[0.10]" />
                </div>
              </div>

              {/* Service layer */}

              <div className="grid gap-px bg-white/[0.10] sm:grid-cols-2">
                {serviceItems.map((service, index) => {
                  const ServiceIcon = service.icon;

                  return (
                    <motion.div
                      key={service.title}
                      initial={{
                        opacity: 0,
                        y: 15,
                      }}
                      whileInView={{
                        opacity: 1,
                        y: 0,
                      }}
                      viewport={{
                        once: true,
                        amount: 0.2,
                      }}
                      transition={{
                        duration: 0.55,
                        delay: index * 0.06,
                      }}
                      className="
                        group
                        bg-[#050816]/60
                        p-5
                        backdrop-blur-[2px]
                        transition-colors
                        duration-300
                        hover:bg-[#07111f]/75
                      "
                    >
                      <div className="flex items-start gap-3">
                        <ServiceIcon
                          size={17}
                          strokeWidth={1.2}
                          className="
                            mt-0.5
                            shrink-0
                            text-cyan-200/60
                            transition-colors
                            duration-300
                            group-hover:text-cyan-200/90
                          "
                        />

                        <div>
                          <p className="text-xs font-medium uppercase tracking-[0.08em] text-slate-100/80">
                            {service.title}
                          </p>

                          <p className="mt-1.5 text-[11px] leading-4 text-slate-200/55">
                            {service.description}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* ======================================================
            FINAL TECHNOLOGY STATEMENT
        ====================================================== */}

        <motion.div
          initial={{
            opacity: 0,
            y: 24,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
            amount: 0.25,
          }}
          transition={{
            duration: 0.9,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="
            relative
            mt-28
            overflow-hidden
            border
            border-white/[0.10]
            bg-[#050816]/50
            px-6
            py-12
            backdrop-blur-[3px]
            sm:px-10
            sm:py-16
            lg:mt-36
            lg:px-14
            lg:py-20
          "
        >
          {/* Technical grid */}

          <div
            aria-hidden="true"
            className="
              pointer-events-none
              absolute
              inset-0
              opacity-[0.18]
              [background-image:linear-gradient(to_right,rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.045)_1px,transparent_1px)]
              [background-size:48px_48px]
              [mask-image:linear-gradient(to_bottom,black,transparent)]
            "
          />

          {/* Small atmospheric glow */}

          <div
            aria-hidden="true"
            className="
              pointer-events-none
              absolute
              right-[-10%]
              top-[-40%]
              h-[420px]
              w-[420px]
              rounded-full
              bg-cyan-400/[0.045]
              blur-[120px]
            "
          />

          <div
            className="
              relative
              z-10
              grid
              gap-10
              lg:grid-cols-[1fr_0.7fr]
              lg:items-end
            "
          >
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-cyan-200/70">
                TECHNOLOGY DRIVES A SAFER TOMORROW
              </p>

              <h3
                className="
                  mt-5
                  max-w-[750px]
                  text-balance
                  text-[2.8rem]
                  font-light
                  uppercase
                  leading-[0.9]
                  tracking-[-0.055em]
                  text-white
                  sm:text-5xl
                  lg:text-6xl
                "
              >
                From orbital data
                <span className="block text-cyan-200/75">
                  to orbital awareness.
                </span>
              </h3>
            </div>

            <div className="lg:justify-self-end">
              <p className="max-w-[430px] text-sm leading-6 text-slate-200/65">
                Every layer of OrbitGuard is designed to turn complex orbital
                information into something people can understand, analyze, and
                act upon.
              </p>

              <a
                href="#capabilities"
                className="
                  group
                  mt-6
                  inline-flex
                  items-center
                  gap-3
                  font-mono
                  text-[9px]
                  uppercase
                  tracking-[0.2em]
                  text-slate-200/65
                  transition-colors
                  duration-300
                  hover:text-white
                "
              >
                Revisit capabilities
                <span
                  className="
                    flex
                    h-8
                    w-8
                    items-center
                    justify-center
                    rounded-full
                    border
                    border-white/10
                    transition-all
                    duration-300
                    group-hover:border-cyan-300/30
                    group-hover:bg-cyan-300/[0.06]
                  "
                >
                  <FiArrowUpRight
                    size={13}
                    className="
                      transition-transform
                      duration-300
                      group-hover:-translate-y-0.5
                      group-hover:translate-x-0.5
                    "
                  />
                </span>
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default Technology;
