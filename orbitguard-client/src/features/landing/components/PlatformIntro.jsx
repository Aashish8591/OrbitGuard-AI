import { motion } from 'framer-motion'
import { FiArrowDown, FiArrowUpRight } from 'react-icons/fi'
import HeroEarth from './HeroEarth'

const intelligenceFlow = [
  {
    number: '01',
    title: 'OBSERVE',
    description: 'See the orbital environment.',
  },
  {
    number: '02',
    title: 'ANALYZE',
    description: 'Understand orbital context.',
  },
  {
    number: '03',
    title: 'PREDICT',
    description: 'Identify potential risk.',
  },
]

const revealContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
    },
  },
}

const revealItem = {
  hidden: {
    opacity: 0,
    y: 22,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: [0.22, 1, 0.36, 1],
    },
  },
}

const softReveal = {
  hidden: {
    opacity: 0,
    y: 14,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.65,
      ease: [0.22, 1, 0.36, 1],
    },
  },
}

function PlatformIntro() {
  return (
    <section
      id="platform"
      className="
        relative
        overflow-hidden
        px-5
        pb-24
        pt-16
        sm:px-8
        sm:pb-28
        sm:pt-20
        lg:px-12
        lg:pb-5
        lg:pt-45
        xl:px-16
      "
    >
      {/* =========================================================
          GLOBAL SPACE ENVIRONMENT

          SpaceBackground.jsx owns the complete atmosphere.
          No additional section background is required here.
      ========================================================== */}

      <div
        className="
          relative
          mx-auto
          max-w-[1440px]
        "
      >
        {/* =======================================================
            MAIN PLATFORM STAGE

            Desktop:

            LEFT
            Main platform statement

            CENTER-RIGHT
            Earth

            TOP-RIGHT
            Supporting message

            LOWER-RIGHT
            Secondary intelligence message + flow
        ======================================================== */}

        <div
          className="
            relative
            min-h-0
            lg:min-h-[700px]
          "
        >
          {/* =====================================================
              TOP-LEFT — MAIN PLATFORM STATEMENT
          ====================================================== */}

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
              z-30
              max-w-[620px]
              pt-4
              sm:pt-6
              lg:absolute
              lg:left-0
              lg:top-0
              lg:max-w-[610px]
              lg:pt-0
              xl:max-w-[650px]
            "
          >
            {/* =================================================
                HEADLINE

                Each line enters independently.
            ================================================== */}

            <motion.h2
              variants={revealContainer}
              className="
                text-balance
                text-[3.15rem]
                font-light
                uppercase
                leading-[0.9]
                tracking-[-0.055em]
                text-white
                sm:text-5xl
                md:text-6xl
                lg:text-[4.2rem]
                xl:text-[4.7rem]
              "
            >
              <motion.span
                variants={revealItem}
                className="block"
              >
                One platform.
              </motion.span>

              <motion.span
                variants={revealItem}
                className="block text-slate-300/60"
              >
                Complete orbital
              </motion.span>

              <motion.span
                variants={revealItem}
                className="block"
              >
                awareness.
              </motion.span>
            </motion.h2>

            {/* =================================================
                DESCRIPTION
            ================================================== */}

            <motion.p
              variants={softReveal}
              className="
                mt-6
                max-w-[520px]
                text-sm
                leading-6
                text-slate-300/60
                sm:text-base
                sm:leading-7
              "
            >
              OrbitGuard AI unifies satellite monitoring, space-debris
              intelligence, collision-risk assessment, analytics, alerts,
              reporting, and AI-powered insights in one operational
              environment.
            </motion.p>

            {/* =================================================
                CTA
            ================================================== */}

            <motion.a
              variants={softReveal}
              href="#capabilities"
              className="
                group
                mt-6
                inline-flex
                items-center
                gap-3
                text-[10px]
                font-medium
                uppercase
                tracking-[0.2em]
                text-slate-300/65
                transition-colors
                duration-300
                hover:text-white
              "
            >
              Explore capabilities

              <motion.span
                whileHover={{
                  scale: 1.04,
                }}
                transition={{
                  duration: 0.2,
                }}
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
                  group-hover:bg-cyan-300/[0.08]
                "
              >
                <FiArrowUpRight
                  size={14}
                  className="
                    transition-transform
                    duration-300
                    group-hover:-translate-y-0.5
                    group-hover:translate-x-0.5
                  "
                />
              </motion.span>
            </motion.a>
          </motion.div>

          {/* =====================================================
              CENTER-RIGHT — EARTH

              Position and size intentionally unchanged.

              The animation only controls the entrance of the
              Earth container. HeroEarth keeps ownership of
              the actual 3D interaction and rotation.
          ====================================================== */}

          <motion.div
            initial={{
              opacity: 0,
              y: 20,
              scale: 0.96,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            viewport={{
              once: true,
              amount: 0.12,
            }}
            transition={{
              duration: 1.15,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="
              relative
              z-10
              mx-auto
              mt-[-24px]
              w-full
              max-w-[520px]
              sm:mt-[-30px]
              sm:max-w-[570px]
              md:max-w-[610px]
              lg:absolute
              lg:left-[54%]
              lg:top-[36%]
              lg:mt-0
              lg:w-[590px]
              lg:max-w-none
              lg:-translate-x-1/2
              lg:-translate-y-1/2
              xl:w-[630px]
            "
          >
            <HeroEarth />

            {/* =================================================
                VERY SUBTLE AMBIENT BREATHING LIGHT

                Slow enough to be felt rather than noticed.
            ================================================== */}

            <motion.div
              aria-hidden="true"
              className="
                pointer-events-none
                absolute
                left-1/2
                top-1/2
                -z-10
                h-[52%]
                w-[52%]
                -translate-x-1/2
                -translate-y-1/2
                rounded-full
                bg-cyan-400/[0.045]
                blur-[90px]
              "
              animate={{
                opacity: [0.45, 0.75, 0.45],
                scale: [0.94, 1.04, 0.94],
              }}
              transition={{
                duration: 9,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          </motion.div>

          {/* =====================================================
              LOWER-RIGHT — SECONDARY INTELLIGENCE MESSAGE

              Explicitly positioned on desktop.
          ====================================================== */}

          <motion.div
            initial={{
              opacity: 0,
              x: 24,
            }}
            whileInView={{
              opacity: 1,
              x: 0,
            }}
            viewport={{
              once: true,
              amount: 0.18,
            }}
            transition={{
              duration: 0.8,
              delay: 0.12,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="
              relative
              z-30
              mt-10
              ml-auto
              max-w-[340px]
              sm:max-w-[390px]
              lg:absolute
              lg:right-0
              lg:top-[1%]
              lg:mt-0
              lg:max-w-[350px]
              xl:max-w-[380px]
            "
          >
            {/* =================================================
                EDITORIAL MESSAGE
            ================================================== */}

            <motion.div
              variants={revealContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{
                once: true,
                amount: 0.25,
              }}
              className="text-left"
            >
              {/* Primary message */}

              <motion.h3
                variants={revealContainer}
                className="
                  text-2xl
                  font-light
                  uppercase
                  leading-[1.02]
                  tracking-[-0.04em]
                  text-white
                  sm:text-3xl
                "
              >
                <motion.span
                  variants={revealItem}
                  className="block"
                >
                  See the
                </motion.span>

                <motion.span
                  variants={revealItem}
                  className="block"
                >
                  environment.
                </motion.span>

                {/* Secondary message */}

                <motion.span
                  variants={revealItem}
                  className="
                    mt-2
                    block
                    text-slate-300/58
                  "
                >
                  Understand
                  <br />
                  what moves
                  <br />
                  within it.
                </motion.span>
              </motion.h3>

              {/* Supporting description */}

              <motion.p
                variants={softReveal}
                className="
                  mt-5
                  max-w-[330px]
                  text-xs
                  leading-6
                  text-slate-300/60
                  sm:text-sm
                "
              >
                OrbitGuard AI brings orbital objects, environmental context,
                and risk intelligence into one operational view.
              </motion.p>
            </motion.div>

            {/* =================================================
                INTELLIGENCE FLOW

                Observe → Analyze → Predict

                The cards reveal sequentially and the connector
                carries a subtle moving cyan signal.
            ================================================== */}

            <div className="mt-7 w-full max-w-[300px]">
              {intelligenceFlow.map((step, index) => (
                <div key={step.number}>
                  {/* =================================================
                      INTELLIGENCE CARD
                  ================================================== */}

                  <motion.div
                    initial={{
                      opacity: 0,
                      x: 12,
                    }}
                    whileInView={{
                      opacity: 1,
                      x: 0,
                    }}
                    viewport={{
                      once: true,
                      amount: 0.35,
                    }}
                    transition={{
                      duration: 0.55,
                      delay: index * 0.16,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    whileHover={{
                      x: 3,
                      transition: {
                        duration: 0.2,
                      },
                    }}
                    className="
                      group
                      relative
                      flex
                      items-center
                      gap-4
                      border
                      border-white/[0.09]
                      bg-white/[0.012]
                      px-3
                      py-2.5
                      transition-colors
                      duration-300
                      hover:border-cyan-300/25
                      hover:bg-cyan-300/[0.025]
                    "
                  >
                    {/* Number */}

                    <span
                      className="
                        w-5
                        shrink-0
                        font-mono
                        text-[10px]
                        tracking-[0.14em]
                        text-slate-300/40
                        transition-colors
                        duration-300
                        group-hover:text-cyan-300/60
                      "
                    >
                      {step.number}
                    </span>

                    {/* Vertical divider */}

                    <span
                      aria-hidden="true"
                      className="
                        h-6
                        w-px
                        bg-white/[0.08]
                        transition-colors
                        duration-300
                        group-hover:bg-cyan-300/20
                      "
                    />

                    {/* Stage content */}

                    <div>
                      <p
                        className="
                          text-[15px]
                          font-medium
                          uppercase
                          tracking-[0.18em]
                          text-slate-200/70
                          transition-colors
                          duration-300
                          group-hover:text-cyan-200/80
                        "
                      >
                        {step.title}
                      </p>

                      <p
                        className="
                          mt-1
                          text-[10px]
                          leading-4
                          text-slate-300/50
                        "
                      >
                        {step.description}
                      </p>
                    </div>

                    {/* Active edge */}

                    <span
                      aria-hidden="true"
                      className="
                        absolute
                        bottom-0
                        left-0
                        h-px
                        w-0
                        bg-cyan-300/50
                        transition-all
                        duration-500
                        group-hover:w-full
                      "
                    />
                  </motion.div>

                  {/* =================================================
                      DOWNWARD CONNECTOR
                  ================================================== */}

                  {index < intelligenceFlow.length - 1 && (
                    <div
                      aria-hidden="true"
                      className="
                        relative
                        flex
                        h-7
                        w-full
                        items-center
                        justify-start
                        pl-[24px]
                      "
                    >
                      <div
                        className="
                          relative
                          flex
                          h-full
                          flex-col
                          items-center
                        "
                      >
                        {/* Base connector */}

                        <span
                          className="
                            h-full
                            w-px
                            bg-white/[0.1]
                          "
                        />

                        {/* Moving signal */}

                        <motion.span
                          className="
                            absolute
                            top-0
                            h-1.5
                            w-1.5
                            -translate-x-1/2
                            rounded-full
                            bg-cyan-300
                            shadow-[0_0_10px_rgba(103,232,249,0.7)]
                          "
                          animate={{
                            y: [0, 17],
                            opacity: [0, 1, 0],
                          }}
                          transition={{
                            duration: 1.4,
                            delay: index * 0.35 + 0.7,
                            repeat: Infinity,
                            repeatDelay: 3.5,
                            ease: 'easeInOut',
                          }}
                        />

                        {/* Arrow */}

                        <FiArrowDown
                          size={10}
                          className="
                            absolute
                            bottom-0
                            translate-y-1/2
                            text-cyan-300/40
                          "
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default PlatformIntro