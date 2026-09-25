import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  FiArrowUpRight,
  FiChevronDown,
  FiCircle,
  FiCpu,
  FiRadio,
  FiShield,
} from "react-icons/fi";

const capabilities = [
  {
    icon: FiRadio,
    number: "01",
    label: "SATELLITES",
    description: "Orbital monitoring",
    image: "/images/capabilities/satellite-monitoring.png",
  },
  {
    icon: FiShield,
    number: "02",
    label: "RISK",
    description: "Collision intelligence",
    image: "/images/capabilities/collision-risk.png",
  },
  {
    icon: FiCircle,
    number: "03",
    label: "DEBRIS",
    description: "Object analysis",
    image: "/images/capabilities/space-debris.png",
  },
  {
    icon: FiCpu,
    number: "04",
    label: "AI",
    description: "Intelligent insights",
    image: "/images/capabilities/ai-intelligence.png",
  },
];

function Hero() {
  return (
    <section
      id="home"
      className="relative isolate min-h-[100svh] overflow-hidden bg-[#050816]"
    >
      {/* =========================================================
          CINEMATIC SPACE ENVIRONMENT
      ========================================================== */}

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
      >
        {/* -------------------------------------------------------
            RESPONSIVE HERO ARTWORK

            Desktop:
            orbitguard-hero-space.png

            Mobile / Tablet:
            orbitguard-hero-space-mobile.png
        -------------------------------------------------------- */}

        <picture>
          {/* Desktop artwork */}
          <source
            media="(min-width: 1024px)"
            srcSet="/images/hero/orbitguard-hero-space.png"
          />

          {/* Mobile + tablet artwork */}
          <img
            src="/images/hero/orbitguard-hero-space-mobile.png"
            alt=""
            className="
              absolute
              inset-0
              h-full
              w-full
              object-cover
              object-[62%_center]

              sm:object-[64%_center]

              lg:right-0
              lg:left-auto
              lg:inset-y-0
              lg:h-full
              lg:w-[82%]
              lg:object-[68%_58%]

              xl:w-[84%]
              xl:object-[70%_58%]
            "
            loading="eager"
            fetchPriority="high"
            decoding="async"
          />
        </picture>

        {/* -------------------------------------------------------
            LEFT-SIDE CINEMATIC INTEGRATION

            Stronger on mobile so the typography remains readable.
        -------------------------------------------------------- */}

        <div
          className="
            absolute
            inset-y-0
            left-0
            w-[78%]
            bg-gradient-to-r
            from-[#050816]
            via-[#050816]/78
            to-transparent

            sm:w-[70%]

            lg:w-[43%]
            lg:via-[#050816]/58
          "
        />

        {/* -------------------------------------------------------
            MOBILE LOWER IMAGE INTEGRATION
        -------------------------------------------------------- */}

        <div
          className="
            absolute
            inset-x-0
            bottom-0
            h-[42%]
            bg-gradient-to-t
            from-[#050816]
            via-[#050816]/55
            to-transparent

            lg:h-32
            lg:via-[#050816]/35
          "
        />

        {/* -------------------------------------------------------
            TOP INTEGRATION

            Keeps the artwork naturally connected below navbar.
        -------------------------------------------------------- */}

        <div
          className="
            absolute
            inset-x-0
            top-0
            h-24
            bg-gradient-to-b
            from-[#050816]
            to-transparent
          "
        />

        {/* -------------------------------------------------------
            RIGHT EDGE
        -------------------------------------------------------- */}

        <div
          className="
            absolute
            inset-y-0
            right-0
            w-8
            bg-gradient-to-l
            from-[#050816]/15
            to-transparent
          "
        />
      </div>

      {/* =========================================================
          SUBTLE MISSION-CONTROL GRID
      ========================================================== */}

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.025]"
      >
        <div className="absolute inset-x-0 top-[25%] border-t border-white" />

        <div className="absolute inset-x-0 top-[78%] border-t border-white" />

        <div className="absolute bottom-0 left-[16%] top-0 border-l border-white" />

        <div className="absolute bottom-0 right-[16%] top-0 border-l border-white" />
      </div>

      {/* =========================================================
          HERO CONTENT
      ========================================================== */}

      <div
        className="
          relative
          mx-auto
          flex
          min-h-[100svh]
          max-w-[1600px]
          flex-col
          px-5
          pb-6
          pt-6

          sm:px-8
          sm:pt-8

          lg:px-12

          xl:px-16
        "
      >
        {/* =======================================================
            MAIN HERO CONTENT
        ======================================================== */}

        <div className="flex flex-1 items-center">
          <div className="grid w-full items-center lg:grid-cols-[0.82fr_1.18fr]">
            {/* ===================================================
                LEFT — HERO CONTENT
            ==================================================== */}

            <motion.div
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                duration: 0.8,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="
                relative
                z-20
                max-w-[650px]
                pt-10

                lg:pt-0
              "
            >
              {/* -------------------------------------------------
                  PRODUCT IDENTIFIER
              -------------------------------------------------- */}

              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.55,
                  delay: 0.1,
                }}
                className="
                  mb-7
                  flex
                  items-center
                  gap-3
                "
              >
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-300" />

                <span
                  className="
                    text-[9px]
                    font-medium
                    uppercase
                    tracking-[0.3em]
                    text-white/45

                    sm:text-[10px]
                  "
                >
                  Space Domain Intelligence
                </span>

                <span className="h-px w-8 bg-white/15" />

                <span
                  className="
                    font-mono
                    text-[8px]
                    uppercase
                    tracking-[0.18em]
                    text-white/25
                  "
                >
                  OG-AI
                </span>
              </motion.div>

              {/* =================================================
                  NOVA-INSPIRED HEADLINE
              ================================================== */}

              <motion.h1
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.85,
                  delay: 0.2,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="
                  max-w-[650px]
                  text-balance
                  font-brand
                  font-light
                  uppercase
                  leading-[0.91]
                  tracking-[-0.055em]
                  text-white
                "
              >
                <span
                  className="
                    block
                    text-[3rem]

                    sm:text-5xl
                    md:text-6xl
                    lg:text-[3.05rem]
                    xl:text-[3.55rem]
                  "
                >
                  Monitor Space.
                </span>

                <span
                  className="
                    block
                    text-[3rem]

                    sm:text-5xl
                    md:text-6xl
                    lg:text-[3.05rem]
                    xl:text-[3.55rem]
                  "
                >
                  <span className="bg-gradient-to-r from-cyan-300 via-blue-400 to-blue-500 bg-clip-text text-transparent">
                    Predict Risk.
                  </span>
                </span>

                <span
                  className="
                    block
                    text-[3rem]

                    sm:text-5xl
                    md:text-6xl
                    lg:text-[3.05rem]
                    xl:text-[3.55rem]
                  "
                >
                  Protect Orbit.
                </span>
              </motion.h1>

              {/* =================================================
                  DESCRIPTION
              ================================================== */}

              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.7,
                  delay: 0.34,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="
                  mt-7
                  max-w-[500px]
                  text-sm
                  font-normal
                  leading-6
                  text-white/55

                  sm:text-base
                  sm:leading-7
                "
              >
                Understand the orbital environment through satellite monitoring,
                space debris analysis, collision risk assessment, and AI-powered
                intelligence.
              </motion.p>

              {/* =================================================
                  CTA
              ================================================== */}

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.7,
                  delay: 0.44,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="
                  mt-7
                  flex
                  flex-col
                  gap-3

                  sm:flex-row
                "
              >
                <Link
                  to="/register"
                  className="
                    group
                    inline-flex
                    items-center
                    justify-center
                    gap-3
                    rounded-full
                    bg-white
                    px-6
                    py-3.5
                    text-sm
                    font-medium
                    text-[#050816]
                    transition-all
                    duration-300
                    hover:bg-cyan-50
                  "
                >
                  Enter Mission Control
                  <span
                    className="
                      flex
                      h-6
                      w-6
                      items-center
                      justify-center
                      rounded-full
                      bg-[#050816]
                      text-white
                      transition-transform
                      duration-300
                      group-hover:-translate-y-0.5
                      group-hover:translate-x-0.5
                    "
                  >
                    <FiArrowUpRight size={14} />
                  </span>
                </Link>

                <a
                  href="#platform"
                  className="
                    group
                    inline-flex
                    items-center
                    justify-center
                    gap-2
                    rounded-full
                    border
                    border-white/10
                    bg-black/15
                    px-6
                    py-3.5
                    text-sm
                    font-medium
                    text-white/60
                    transition-all
                    duration-300
                    hover:border-white/20
                    hover:bg-black/25
                    hover:text-white
                  "
                >
                  Explore Platform
                  <FiChevronDown
                    size={15}
                    className="transition-transform duration-300 group-hover:translate-y-0.5"
                  />
                </a>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* =========================================================
            CINEMATIC CAPABILITY STRIP
        ========================================================== */}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.75,
            delay: 0.65,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="relative z-30 mt-8"
        >
          <div
            className="
              grid
              overflow-hidden
              rounded-2xl
              border
              border-white/[0.1]
              bg-[#070b16]/70

              sm:grid-cols-2
              lg:grid-cols-4
            "
          >
            {capabilities.map((capability, index) => {
              const Icon = capability.icon;

              return (
                <motion.div
                  key={capability.label}
                  whileHover="hover"
                  initial="rest"
                  animate="rest"
                  className={[
                    "group relative min-h-[150px] overflow-hidden",
                    index !== capabilities.length - 1
                      ? "border-b border-white/[0.08] lg:border-b-0 lg:border-r"
                      : "",
                    index === 1
                      ? "sm:border-b sm:border-white/[0.08] lg:border-b-0"
                      : "",
                  ].join(" ")}
                >
                  {/* =================================================
                      CAPABILITY IMAGE
                  ================================================== */}

                  <motion.img
                    src={capability.image}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    variants={{
                      rest: {
                        scale: 1,
                      },
                      hover: {
                        scale: 1.06,
                      },
                    }}
                    transition={{
                      duration: 0.8,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="
                      absolute
                      inset-0
                      h-full
                      w-full
                      object-cover
                      opacity-75
                    "
                  />

                  {/* Bottom cinematic gradient */}
                  <div
                    className="
                      absolute
                      inset-0
                      bg-gradient-to-t
                      from-[#050816]
                      via-[#050816]/50
                      to-[#050816]/5
                    "
                  />

                  {/* Left depth gradient */}
                  <div
                    className="
                      absolute
                      inset-0
                      bg-gradient-to-r
                      from-[#050816]/70
                      via-transparent
                      to-transparent
                    "
                  />

                  {/* Subtle hover layer */}
                  <motion.div
                    variants={{
                      rest: {
                        opacity: 0,
                      },
                      hover: {
                        opacity: 1,
                      },
                    }}
                    transition={{
                      duration: 0.4,
                    }}
                    className="absolute inset-0 bg-cyan-400/[0.035]"
                  />

                  {/* Number */}
                  <span
                    className="
                      absolute
                      right-4
                      top-3
                      z-10
                      font-mono
                      text-[8px]
                      tracking-[0.15em]
                      text-white/35
                    "
                  >
                    {capability.number}
                  </span>

                  {/* =================================================
                      CAPABILITY CONTENT
                  ================================================== */}

                  <div
                    className="
                      relative
                      z-10
                      flex
                      min-h-[150px]
                      flex-col
                      justify-end
                      p-5
                    "
                  >
                    {/* Icon */}
                    <div
                      className="
                        mb-4
                        flex
                        h-9
                        w-9
                        items-center
                        justify-center
                        rounded-xl
                        border
                        border-white/15
                        bg-[#050816]/55
                        text-cyan-300/80
                        backdrop-blur-sm
                        transition-all
                        duration-300
                        group-hover:border-cyan-300/30
                        group-hover:bg-cyan-400/10
                        group-hover:text-cyan-200
                      "
                    >
                      <Icon size={16} />
                    </div>

                    {/* Label */}
                    <p
                      className="
                        font-brand
                        text-[10px]
                        font-medium
                        uppercase
                        tracking-[0.16em]
                        text-white/85
                      "
                    >
                      {capability.label}
                    </p>

                    {/* Description */}
                    <p className="mt-1 text-[10px] text-white/45">
                      {capability.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* =========================================================
            BOTTOM META
        ========================================================== */}

        <div className="hidden items-center justify-between pt-4 lg:flex">
          <span
            className="
              font-mono
              text-[8px]
              uppercase
              tracking-[0.22em]
              text-white/20
            "
          >
            ORBITGUARD AI / SPACE DOMAIN AWARENESS
          </span>

          <a
            href="#platform"
            className="
              group
              flex
              items-center
              gap-2
              font-mono
              text-[8px]
              uppercase
              tracking-[0.2em]
              text-white/25
              transition-colors
              hover:text-white/55
            "
          >
            Explore system
            <span
              className="
                flex
                h-6
                w-6
                items-center
                justify-center
                rounded-full
                border
                border-white/10
                transition-transform
                group-hover:translate-y-0.5
              "
            >
              <FiChevronDown size={11} />
            </span>
          </a>

          <span
            className="
              font-mono
              text-[8px]
              uppercase
              tracking-[0.2em]
              text-white/20
            "
          >
            ORBITAL INTELLIGENCE
          </span>
        </div>
      </div>
    </section>
  );
}

export default Hero;
