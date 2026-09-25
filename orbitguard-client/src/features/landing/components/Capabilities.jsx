import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  FiArrowUpRight,
  FiBarChart2,
  FiBox,
  FiCpu,
  FiRadio,
  FiShield,
  FiTarget,
} from "react-icons/fi";

const capabilities = [
  {
    number: "01",
    shortLabel: "Satellites",
    eyebrow: "SATELLITE MONITORING",
    title: "Track What Moves Above Earth",
    description:
      "Monitor active satellites, explore orbital information, and maintain a clear view of objects moving around our planet.",
    image: "/images/capabilities/02_satellite_monitoring.jpg",
    icon: FiRadio,
    features: [
      "Real satellite data",
      "Satellite search and exploration",
      "Detailed orbital information",
      "Continuous monitoring",
    ],
    action: "Explore Satellite Tracking",
    target: "/satellites",
  },
  {
    number: "02",
    shortLabel: "Debris",
    eyebrow: "SPACE DEBRIS INTELLIGENCE",
    title: "Understand What Surrounds Us",
    description:
      "Explore tracked debris and understand the objects sharing Earth's orbital environment.",
    image: "/images/capabilities/03_debris_intelligence.jpg",
    icon: FiBox,
    features: [
      "Real debris data",
      "Debris search and inspection",
      "Orbital environment analysis",
      "Object intelligence",
    ],
    action: "Explore Debris Intelligence",
    target: "/debris",
  },
  {
    number: "03",
    shortLabel: "Risk",
    eyebrow: "COLLISION RISK ASSESSMENT",
    title: "Turn Orbital Data Into Risk Intelligence",
    description:
      "Assess potential conjunctions between orbital objects and identify situations that may require closer attention.",
    image: "/images/capabilities/04_collision_risk.jpg",
    icon: FiShield,
    features: [
      "Conjunction analysis",
      "Collision risk assessment",
      "Orbital risk intelligence",
      "Proactive threat detection",
    ],
    action: "Explore Risk Assessment",
    target: "/risks",
  },
  {
    number: "04",
    shortLabel: "Analytics",
    eyebrow: "ORBIT ANALYTICS",
    title: "Discover Patterns Across Orbital Data",
    description:
      "Transform orbital information into meaningful analytical views that support better space situational awareness.",
    image: "/images/capabilities/05_orbit_analytics.jpg",
    icon: FiBarChart2,
    features: [
      "Object distribution insights",
      "Orbital trend analysis",
      "Historical data exploration",
      "Visual analytics",
    ],
    action: "Explore Orbit Analytics",
    target: "/dashboard",
  },
  {
    number: "05",
    shortLabel: "3D View",
    eyebrow: "3D ORBITAL VISUALIZATION",
    title: "See Orbital Space in Three Dimensions",
    description:
      "Explore Earth, satellites, debris, and orbital relationships through an interactive three-dimensional environment.",
    image: "/images/capabilities/06_3d_visualization.jpg",
    icon: FiTarget,
    features: [
      "Interactive 3D Earth",
      "Satellite visualization",
      "Debris visualization",
      "Orbital exploration",
    ],
    action: "Explore 3D Visualization",
    target: "/visualization",
  },
  {
    number: "06",
    shortLabel: "AI",
    eyebrow: "AI INTELLIGENCE",
    title: "Ask. Analyze. Understand.",
    description:
      "Use the OrbitGuard AI assistant to ask questions about orbital information and receive intelligent, contextual insights.",
    image: "/images/capabilities/07_ai_intelligence.jpg",
    icon: FiCpu,
    features: [
      "Natural language questions",
      "AI-powered analysis",
      "Contextual orbital insights",
      "Interactive AI assistant",
    ],
    action: "Explore AI Intelligence",
    target: "/ai-assistant",
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
    y: 14,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

function Capabilities() {
  const [activeCapability, setActiveCapability] = useState(0);
  const [railPositions, setRailPositions] = useState([]);
  const [railHeight, setRailHeight] = useState(0);

  const sectionRefs = useRef([]);
  const panelsRef = useRef(null);

  /*
   * ============================================================
   * CALCULATE NAVIGATION RAIL POSITIONS
   * ============================================================
   *
   * Instead of assuming the capability area is 2000px tall,
   * we calculate each node from the actual capability card.
   *
   * This keeps the rail aligned when:
   * - text wraps
   * - card heights change
   * - browser width changes
   * - fonts change
   * - content changes
   */

  useEffect(() => {
    const updateRailPositions = () => {
      const panels = panelsRef.current;

      if (!panels) {
        return;
      }

      const panelsRect = panels.getBoundingClientRect();

      const positions = sectionRefs.current.map((section) => {
        if (!section) {
          return 0;
        }

        const rect = section.getBoundingClientRect();

        const sectionCenter =
          rect.top - panelsRect.top + rect.height / 2;

        return sectionCenter;
      });

      setRailPositions(positions);
      setRailHeight(panels.scrollHeight);
    };

    updateRailPositions();

    const resizeObserver = new ResizeObserver(() => {
      updateRailPositions();
    });

    if (panelsRef.current) {
      resizeObserver.observe(panelsRef.current);
    }

    sectionRefs.current.forEach((section) => {
      if (section) {
        resizeObserver.observe(section);
      }
    });

    window.addEventListener("resize", updateRailPositions);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateRailPositions);
    };
  }, []);

  /*
   * ============================================================
   * ACTIVE CAPABILITY
   * ============================================================
   */

  useEffect(() => {
    let animationFrameId = null;

    const updateActiveCapability = () => {
      animationFrameId = null;

      const viewportCenter = window.innerHeight / 2;

      let closestIndex = 0;
      let closestDistance = Infinity;

      sectionRefs.current.forEach((section, index) => {
        if (!section) {
          return;
        }

        const rect = section.getBoundingClientRect();

        const sectionCenter = rect.top + rect.height / 2;

        const distance = Math.abs(sectionCenter - viewportCenter);

        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });

      setActiveCapability((currentIndex) =>
        currentIndex === closestIndex
          ? currentIndex
          : closestIndex,
      );
    };

    const handleScroll = () => {
      if (animationFrameId !== null) {
        return;
      }

      animationFrameId =
        window.requestAnimationFrame(updateActiveCapability);
    };

    updateActiveCapability();

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    window.addEventListener("resize", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);

      if (animationFrameId !== null) {
        window.cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  /*
   * ============================================================
   * NAVIGATION
   * ============================================================
   */

  const handleCapabilityNavigation = (index) => {
    const target = sectionRefs.current[index];

    if (!target) {
      return;
    }

    target.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  };

  return (
<section
  id="capabilities"
  className="
    relative
    px-5
    pb-10
    pt-14

    sm:px-8
    sm:pb-12
    sm:pt-16

    lg:px-12
    lg:pb-16
    lg:pt-14

    xl:px-16
  "
>
      <div className="mx-auto max-w-[1440px]">

        {/* =====================================================
            CAPABILITIES INTRO
        ====================================================== */}

        <div
          className="
            relative
            mb-12
            min-h-[300px]
            overflow-hidden
            border-b
            border-white/[0.08]

            sm:mb-14
            sm:min-h-[330px]

            lg:mb-16
            lg:min-h-[350px]
          "
        >
          <img
            src="/images/capabilities/01_background_earth.jpg"
            alt=""
            aria-hidden="true"
            className="
              absolute
              inset-0
              h-full
              w-full
              object-cover
              object-center
              opacity-100
            "
          />

          {/* Left readability gradient */}
          <div
            aria-hidden="true"
            className="
              absolute
              inset-0
              bg-gradient-to-r
              from-[#050816]/95
              via-[#050816]/35
              to-transparent
            "
          />

          {/* Bottom fade */}
          <div
            aria-hidden="true"
            className="
              absolute
              inset-x-0
              bottom-0
              h-32
              bg-gradient-to-t
              from-[#050816]
              to-transparent
            "
          />

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
              amount: 0.3,
            }}
            transition={{
              duration: 0.7,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="
              relative
              z-10
              flex
              min-h-[300px]
              max-w-[650px]
              flex-col
              justify-end
              pb-8

              sm:min-h-[330px]
              sm:pb-10

              lg:min-h-[350px]
              lg:pb-12
            "
          >
            {/* Section label */}
            <p
              className="
                mb-3
                font-brand
                text-[9px]
                font-medium
                uppercase
                tracking-[0.2em]
                text-cyan-200/65
              "
            >
              CAPABILITIES
            </p>

            {/* Main heading */}
            <h2
              className="
                font-brand
                text-balance
                text-[2.6rem]
                font-medium
                uppercase
                leading-[0.92]
                tracking-[-0.04em]
                text-white

                sm:text-5xl
                md:text-6xl
                lg:text-[4.5rem]
              "
            >
              What OrbitGuard
              <span className="block text-slate-300/60">
                can do.
              </span>
            </h2>

            {/* Description intentionally stays Inter */}
            <p
              className="
                mt-5
                max-w-[520px]
                font-sans
                text-sm
                leading-6
                text-slate-300/65

                sm:text-[15px]
                sm:leading-7
              "
            >
              From satellite monitoring to collision-risk intelligence
              and AI-assisted analysis, OrbitGuard brings the orbital
              environment into one operational experience.
            </p>
          </motion.div>

          {/* Technical metadata */}
          <div
            aria-hidden="true"
            className="
              absolute
              right-6
              top-7
              z-10
              hidden
              text-right
              font-brand
              text-[8px]
              uppercase
              leading-4
              tracking-[0.2em]
              text-white/30

              sm:block

              lg:right-8
              lg:top-8
            "
          >
            <span className="block">
              SIX CAPABILITIES.
            </span>

            <span className="block">
              ONE ORBITAL VIEW.
            </span>
          </div>
        </div>

        {/* =====================================================
            CAPABILITY SYSTEM
        ====================================================== */}

        <div
          className="
            relative

            lg:grid
            lg:grid-cols-[110px_minmax(0,1fr)]
            lg:gap-5
          "
        >

          {/* =================================================
              DESKTOP NAVIGATION RAIL
          ================================================== */}

          <aside
            className="
              sticky
              top-28
              z-30
              hidden
              self-start
              lg:block
            "
            style={{
              height: railHeight || "auto",
            }}
          >
            <div className="relative h-full">

              {/* Base timeline */}
              <div
                aria-hidden="true"
                className="
                  absolute
                  left-[10px]
                  top-0
                  h-full
                  w-px
                  bg-white/[0.14]
                "
              />

              {/* Active / completed progress */}
              <motion.div
                aria-hidden="true"
                className="
                  absolute
                  left-[10px]
                  top-0
                  w-px
                  origin-top
                  bg-cyan-300/65
                "
                animate={{
                  height:
                    railPositions.length > 0 &&
                    railPositions[activeCapability]
                      ? railPositions[activeCapability]
                      : 0,
                }}
                transition={{
                  duration: 0.5,
                  ease: [0.22, 1, 0.36, 1],
                }}
              />

              {/* Capability nodes */}
              {capabilities.map((capability, index) => {
                const isActive =
                  activeCapability === index;

                const isCompleted =
                  activeCapability > index;

                const nodePosition =
                  railPositions[index] ?? 0;

                return (
                  <button
                    key={capability.number}
                    type="button"
                    onClick={() =>
                      handleCapabilityNavigation(index)
                    }
                    className="
                      group
                      absolute
                      left-0
                      flex
                      -translate-y-1/2
                      items-center
                      gap-3
                      text-left
                    "
                    style={{
                      top: nodePosition,
                    }}
                    aria-label={`Go to ${capability.shortLabel}`}
                    aria-current={
                      isActive ? "step" : undefined
                    }
                  >
                    {/* Node */}
                    <motion.span
                      animate={{
                        scale: isActive ? 1.08 : 1,
                      }}
                      transition={{
                        duration: 0.35,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      className={`
                        relative
                        z-10
                        flex
                        h-[21px]
                        w-[21px]
                        shrink-0
                        items-center
                        justify-center
                        rounded-full
                        border
                        bg-[#050816]
                        transition-all
                        duration-500

                        ${
                          isActive
                            ? `
                              border-cyan-300
                              shadow-[0_0_18px_rgba(103,232,249,0.30)]
                            `
                            : isCompleted
                              ? `
                                border-cyan-300/40
                              `
                              : `
                                border-white/25
                                group-hover:border-white/55
                              `
                        }
                      `}
                    >
                      <motion.span
                        animate={{
                          scale: isActive ? 1.25 : 1,
                          opacity: isActive
                            ? 1
                            : isCompleted
                              ? 0.6
                              : 0.3,
                        }}
                        transition={{
                          duration: 0.3,
                        }}
                        className={`
                          h-1.5
                          w-1.5
                          rounded-full

                          ${
                            isActive
                              ? "bg-cyan-200"
                              : isCompleted
                                ? "bg-cyan-300/60"
                                : "bg-white/30"
                          }
                        `}
                      />
                    </motion.span>

                    {/* Label */}
                    <span
                      className={`
                        hidden
                        font-brand
                        text-[9px]
                        uppercase
                        tracking-[0.1em]
                        transition-all
                        duration-500
                        xl:block

                        ${
                          isActive
                            ? "text-cyan-200/90"
                            : isCompleted
                              ? "text-slate-300/45"
                              : "text-slate-300/30 group-hover:text-slate-300/60"
                        }
                      `}
                    >
                      <span>
                        {capability.number}
                      </span>

                      <span className="ml-2">
                        {capability.shortLabel}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </aside>

          {/* =================================================
              CAPABILITY PANELS
          ================================================== */}

          <div
            ref={panelsRef}
            className="space-y-5 sm:space-y-6"
          >
            {capabilities.map((capability, index) => {
              const Icon = capability.icon;

              const isActive =
                activeCapability === index;

              return (
                <motion.article
                  key={capability.number}
                  ref={(element) => {
                    sectionRefs.current[index] =
                      element;
                  }}
                  initial={{
                    opacity: 0,
                    y: 22,
                  }}
                  whileInView={{
                    opacity: 1,
                    y: 0,
                  }}
                  viewport={{
                    once: true,
                    amount: 0.15,
                  }}
                  transition={{
                    duration: 0.65,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className={`
                    group
                    relative
                    overflow-hidden
                    border
                    bg-[#07111f]/70
                    transition-all
                    duration-500

                    ${
                      isActive
                        ? "border-cyan-200/[0.22]"
                        : "border-white/[0.09]"
                    }
                  `}
                >
                  <div
                    className="
                      relative
                      grid
                      min-h-[360px]

                      lg:grid-cols-[47%_53%]
                      lg:min-h-[310px]

                      xl:min-h-[325px]
                    "
                  >

                    {/* =================================================
                        CONTENT
                    ================================================== */}

                    <div
                      className="
                        relative
                        z-20
                        flex
                        flex-col
                        justify-between
                        p-6

                        sm:p-7
                        lg:p-7
                        xl:p-8
                      "
                    >
                      <div>

                        {/* Number + eyebrow */}
                        <div className="flex items-center gap-3">

                          <span
                            className="
                              font-brand
                              text-[15px]
                              tracking-[0.14em]
                              text-white/65
                            "
                          >
                            {capability.number}
                          </span>

                          <span
                            aria-hidden="true"
                            className="
                              h-px
                              w-7
                              bg-white/15
                            "
                          />

                          <span
                            className="
                              font-brand
                              text-[11px]
                              uppercase
                              tracking-[0.18em]
                              text-cyan-100/60
                            "
                          >
                            {capability.eyebrow}
                          </span>
                        </div>

                        {/* Heading */}
                        <motion.h3
                          initial={{
                            opacity: 0,
                            y: 12,
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
                            duration: 0.55,
                            delay: 0.05,
                            ease: [0.22, 1, 0.36, 1],
                          }}
                          className="
                            mt-4
                            max-w-[500px]
                            font-brand
                            text-balance
                            text-[2rem]
                            font-medium
                            uppercase
                            leading-[0.96]
                            tracking-[-0.035em]
                            text-white

                            sm:text-4xl
                            lg:text-[2.55rem]
                            xl:text-[2.85rem]
                          "
                        >
                          {capability.title}
                        </motion.h3>

                        {/* Description */}
                        <motion.p
                          initial={{
                            opacity: 0,
                            y: 10,
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
                            duration: 0.5,
                            delay: 0.12,
                          }}
                          className="
                            mt-4
                            max-w-[500px]
                            font-sans
                            text-xs
                            leading-5
                            text-slate-300/65

                            sm:text-sm
                            sm:leading-6
                          "
                        >
                          {capability.description}
                        </motion.p>
                      </div>

                      <div className="mt-6">

                        {/* Features */}
                        <motion.div
                          variants={revealContainer}
                          initial="hidden"
                          whileInView="visible"
                          viewport={{
                            once: true,
                            amount: 0.2,
                          }}
                          className="
                            grid
                            grid-cols-1
                            gap-x-6
                            gap-y-2

                            sm:grid-cols-2
                          "
                        >
                          {capability.features.map(
                            (feature) => (
                              <motion.div
                                key={feature}
                                variants={revealItem}
                                className="
                                  flex
                                  items-center
                                  gap-2
                                  font-sans
                                  text-[12px]
                                  uppercase
                                  tracking-[0.05em]
                                  text-slate-200/55
                                "
                              >
                                <span
                                  className="
                                    h-1.5
                                    w-1.5
                                    shrink-0
                                    rounded-full
                                    bg-cyan-300/55
                                  "
                                />

                                {feature}
                              </motion.div>
                            ),
                          )}
                        </motion.div>

                        {/* Action */}
                        <Link
                          to={capability.target}
                          className="
                            mt-5
                            inline-flex
                            items-center
                            gap-3
                            border
                            border-cyan-200/25
                            bg-cyan-300/[0.025]
                            px-3.5
                            py-2
                            font-brand
                            text-[8px]
                            font-medium
                            uppercase
                            tracking-[0.16em]
                            text-slate-200/75
                            transition-all
                            duration-300
                            hover:border-cyan-200/50
                            hover:bg-cyan-300/[0.07]
                            hover:text-white
                          "
                        >
                          {capability.action}

                          <FiArrowUpRight
                            size={12}
                            className="
                              transition-transform
                              duration-300
                              group-hover:translate-x-0.5
                              group-hover:-translate-y-0.5
                            "
                          />
                        </Link>
                      </div>
                    </div>

                    {/* =================================================
                        IMAGE
                    ================================================== */}

                    <div
                      className="
                        relative
                        min-h-[220px]
                        overflow-hidden

                        lg:min-h-0
                      "
                    >
                      <img
                        src={capability.image}
                        alt=""
                        aria-hidden="true"
                        className="
                          absolute
                          inset-0
                          h-full
                          w-full
                          object-cover
                          object-center
                          transition-transform
                          duration-[1400ms]
                          ease-out
                          group-hover:scale-[1.035]
                        "
                      />

                      {/* Image edge blending */}
                      <div
                        aria-hidden="true"
                        className="
                          absolute
                          inset-0
                          bg-gradient-to-r
                          from-[#07111f]
                          via-[#07111f]/20
                          to-transparent

                          lg:from-[#07111f]
                          lg:via-[#07111f]/10
                          lg:to-transparent
                        "
                      />

                      <div
                        aria-hidden="true"
                        className="
                          absolute
                          inset-0
                          bg-gradient-to-t
                          from-[#050816]/45
                          via-transparent
                          to-transparent
                        "
                      />

                      {/* Image label */}
                      <div
                        className="
                          absolute
                          right-5
                          top-5
                          text-right
                          font-brand
                          text-[7px]
                          uppercase
                          leading-4
                          tracking-[0.18em]
                          text-white/45
                        "
                      >
                        <span className="block">
                          ORBITGUARD
                        </span>

                        <span className="block">
                          {capability.number} / 06
                        </span>
                      </div>

                      {/* Technical corner */}
                      <span
                        aria-hidden="true"
                        className="
                          absolute
                          bottom-5
                          right-5
                          h-5
                          w-5
                          border-b
                          border-r
                          border-white/20
                        "
                      />
                    </div>
                  </div>

                  {/* Active bottom signal */}
                  <motion.div
                    aria-hidden="true"
                    animate={{
                      scaleX: isActive ? 1 : 0.2,
                      opacity: isActive ? 1 : 0.25,
                    }}
                    transition={{
                      duration: 0.45,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="
                      absolute
                      bottom-0
                      left-0
                      h-px
                      w-full
                      origin-left
                      bg-cyan-300/70
                    "
                  />
                </motion.article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Capabilities;