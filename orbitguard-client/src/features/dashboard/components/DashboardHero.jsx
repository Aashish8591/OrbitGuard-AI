import { motion, useReducedMotion } from "framer-motion";
import {
  FiActivity,
  FiAlertTriangle,
  FiAperture,
  FiRadio,
  FiWind,
} from "react-icons/fi";

/**
 * ================================================================
 * OrbitGuard AI - Dashboard Hero
 * ================================================================
 *
 * Presentation-only dashboard hero.
 *
 * Responsibilities:
 * - Display values received from DashboardResponse
 * - Format values for presentation
 * - Render the cinematic dashboard hero
 *
 * This component does NOT:
 * - Call APIs
 * - Calculate analytics
 * - Create fallback business data
 * - Calculate risk
 * - Generate dashboard metrics
 *
 * Backend remains the source of truth.
 * ================================================================
 */


/**
 * ----------------------------------------------------------------
 * Helpers
 * ----------------------------------------------------------------
 */

/**
 * Determines whether a backend value is actually available.
 *
 * Important:
 * 0 is a valid value.
 */
const hasValue = (value) =>
  value !== undefined &&
  value !== null &&
  value !== "";


/**
 * Presentation-only number/value formatting.
 */
const formatDashboardValue = (value) => {
  if (!hasValue(value)) {
    return "—";
  }

  if (
    typeof value === "number" &&
    Number.isFinite(value)
  ) {
    return value.toLocaleString();
  }

  return String(value);
};


/**
 * ================================================================
 * DashboardHero
 * ================================================================
 */

const DashboardHero = ({ data = null }) => {
  /**
   * --------------------------------------------------------------
   * Respect accessibility preference
   * --------------------------------------------------------------
   */

  const shouldReduceMotion = useReducedMotion();


  /**
   * --------------------------------------------------------------
   * Backend DashboardResponse
   * --------------------------------------------------------------
   */

  const overview = data?.overview ?? null;


  /**
   * --------------------------------------------------------------
   * REAL BACKEND VALUES
   * --------------------------------------------------------------
   *
   * These values are read directly from the backend response.
   *
   * No calculations are performed.
   */

  const activeSatellites =
    overview?.totalSatellites;

  const spaceDebris =
    overview?.totalDebris;

  const riskAssessments =
    overview?.totalRisks;


  /**
   * --------------------------------------------------------------
   * Optional backend fields
   * --------------------------------------------------------------
   *
   * These fields are not currently part of the documented
   * DashboardResponse.
   *
   * Therefore they are displayed only when actually provided
   * by the backend.
   */

  const trackedObjects =
    overview?.trackedObjects;

  const orbitalStatus =
    data?.orbitalStatus;


  /**
   * --------------------------------------------------------------
   * Motion configuration
   * --------------------------------------------------------------
   */

  const calloutMotion = (initial, animate, delay) => ({
    initial: shouldReduceMotion ? false : initial,

    animate: shouldReduceMotion
      ? undefined
      : animate,

    transition: shouldReduceMotion
      ? undefined
      : {
          duration: 0.6,
          delay,
        },
  });


  return (
    <section
      aria-labelledby="dashboard-hero-title"
      className="
        relative
        isolate
        min-h-[420px]
        overflow-hidden
        rounded-[1.25rem]
        border
        border-cyan-400/15
        bg-[#020914]
        shadow-[0_0_60px_rgba(14,165,233,0.06)]
        sm:min-h-[460px]
        lg:min-h-[500px]
        xl:min-h-[520px]
      "
    >

      {/* =========================================================
          CINEMATIC BACKGROUND
          ========================================================= */}

      <div
        className="
          absolute
          inset-0
          -z-20
          overflow-hidden
        "
        aria-hidden="true"
      >
        <img
          src="/images/dashboard/dashboardbg.png"
          alt=""
          loading="eager"
          draggable={false}
          className="
            h-full
            w-full
            select-none
            object-cover
            object-[62%_center]
          "
        />
      </div>


      {/* =========================================================
          CINEMATIC OVERLAYS
          ========================================================= */}

      <div
        className="
          absolute
          inset-0
          -z-10
          bg-[linear-gradient(90deg,rgba(2,9,20,0.96)_0%,rgba(2,9,20,0.76)_30%,rgba(2,9,20,0.12)_65%,rgba(2,9,20,0.18)_100%)]
        "
        aria-hidden="true"
      />

      <div
        className="
          absolute
          inset-x-0
          bottom-0
          -z-10
          h-40
          bg-gradient-to-t
          from-[#020914]
          via-[#020914]/45
          to-transparent
        "
        aria-hidden="true"
      />

      <div
        className="
          absolute
          inset-x-0
          top-0
          -z-10
          h-32
          bg-gradient-to-b
          from-[#01060d]/55
          to-transparent
        "
        aria-hidden="true"
      />


      {/* =========================================================
          TECHNICAL BORDER DETAILS
          ========================================================= */}

      <div
        className="
          pointer-events-none
          absolute
          left-0
          top-0
          h-px
          w-28
          bg-gradient-to-r
          from-cyan-300/70
          to-transparent
        "
        aria-hidden="true"
      />

      <div
        className="
          pointer-events-none
          absolute
          right-0
          top-0
          h-px
          w-40
          bg-gradient-to-l
          from-cyan-300/45
          to-transparent
        "
        aria-hidden="true"
      />

      <div
        className="
          pointer-events-none
          absolute
          bottom-0
          left-0
          h-px
          w-44
          bg-gradient-to-r
          from-cyan-400/30
          to-transparent
        "
        aria-hidden="true"
      />


      {/* =========================================================
          HERO CONTENT
          ========================================================= */}

      <div
        className="
          relative
          z-10
          flex
          min-h-[420px]
          flex-col
          justify-between
          p-5
          sm:min-h-[460px]
          sm:p-7
          lg:min-h-[500px]
          lg:p-8
          xl:min-h-[530px]
          xl:p-10
        "
      >

        {/* =======================================================
            LEFT INFORMATION BLOCK
            ======================================================= */}

        <div className="max-w-[460px]">

          <div className="mb-3 flex items-center gap-2">

            <span
              className="
                inline-flex
                h-1.5
                w-1.5
                rounded-full
                bg-cyan-300
                shadow-[0_0_10px_rgba(103,232,249,0.9)]
              "
              aria-hidden="true"
            />

            <span
              className="
                font-['Orbitron']
                text-[9px]
                font-semibold
                uppercase
                tracking-[0.34em]
                text-cyan-200/85
                sm:text-[10px]
              "
            >
              Live From Orbit
            </span>

          </div>


          <h1
            id="dashboard-hero-title"
            className="
              max-w-[440px]
              font-['Orbitron']
              text-[2rem]
              font-semibold
              uppercase
              leading-[1.02]
              tracking-[-0.035em]
              text-slate-100
              sm:text-[2.8rem]
              lg:text-[3.25rem]
              xl:text-[3.7rem]
            "
          >
            A Safer Sky{" "}
            <span className="text-cyan-300">
              Tomorrow
            </span>
          </h1>


          <p
            className="
              mt-4
              max-w-[380px]
              font-['Inter']
              text-xs
              leading-5
              text-slate-300/80
              sm:text-sm
              sm:leading-6
            "
          >
            Real-time orbital intelligence for monitoring space
            activity, understanding orbital environments, and
            supporting safer decisions.
          </p>


          {/* =====================================================
              TRACKING STATUS
              ===================================================== */}

          {hasValue(trackedObjects) && (
            <div
              className="
                mt-5
                inline-flex
                max-w-full
                items-center
                gap-2
                border-l
                border-cyan-400/30
                bg-slate-950/20
                py-1
                pl-3
                pr-2
                backdrop-blur-sm
              "
            >

              <FiActivity
                className="h-3.5 w-3.5 shrink-0 text-cyan-300"
                aria-hidden="true"
              />

              <span
                className="
                  font-['Orbitron']
                  text-[8px]
                  font-medium
                  uppercase
                  tracking-[0.22em]
                  text-slate-400
                  sm:text-[9px]
                "
              >
                Tracking
              </span>

              <span
                className="
                  font-['Orbitron']
                  text-[10px]
                  font-semibold
                  tabular-nums
                  text-cyan-200
                  sm:text-xs
                "
              >
                {formatDashboardValue(trackedObjects)}
              </span>

              <span
                className="
                  font-['Orbitron']
                  text-[8px]
                  uppercase
                  tracking-[0.14em]
                  text-slate-500
                  sm:text-[9px]
                "
              >
                Objects
              </span>

              <span
                className="
                  hidden
                  font-['Orbitron']
                  text-[8px]
                  uppercase
                  tracking-[0.14em]
                  text-slate-500
                  sm:inline
                  sm:text-[9px]
                "
              >
                In Real Time
              </span>

            </div>
          )}

        </div>


        {/* =======================================================
            ORBITAL CALLOUTS
            ======================================================= */}

        <div
          className="
            pointer-events-none
            absolute
            inset-0
          "
          aria-hidden="true"
        >

          {/* -----------------------------------------------------
              ACTIVE SATELLITES
              ----------------------------------------------------- */}

          <motion.div
            {...calloutMotion(
              {
                opacity: 0,
                y: 5,
              },
              {
                opacity: 1,
                y: 0,
              },
              0.15,
            )}
            className="
              absolute
              left-[47%]
              top-[11%]
              hidden
              sm:block
            "
          >

            <HeroCallout
              icon={FiAperture}
              label="Active Satellites"
              value={activeSatellites}
              tone="cyan"
            />

            <CalloutConnector
              className="
                left-[92%]
                top-[72%]
                h-px
                w-10
                origin-left
                rotate-[40deg]
                sm:w-14
              "
              tone="cyan"
            />

          </motion.div>


          {/* -----------------------------------------------------
              REAL-TIME ORBITAL VIEW
              ----------------------------------------------------- */}

          <motion.div
            {...calloutMotion(
              {
                opacity: 0,
                x: 8,
              },
              {
                opacity: 1,
                x: 0,
              },
              0.25,
            )}
            className="
              absolute
              right-4
              top-4
              hidden
              sm:block
              lg:right-7
              lg:top-6
            "
          >

            <div
              className="
                min-w-[178px]
                border
                border-cyan-300/15
                bg-[#06111f]/75
                px-4
                py-3
                shadow-[0_0_25px_rgba(14,165,233,0.05)]
                backdrop-blur-md
              "
            >

              <div className="flex items-center gap-2">

                <div
                  className="
                    flex
                    h-7
                    w-7
                    items-center
                    justify-center
                    rounded-full
                    border
                    border-cyan-300/15
                    bg-cyan-400/5
                  "
                >
                  <FiRadio
                    className="h-3.5 w-3.5 text-cyan-300/80"
                    aria-hidden="true"
                  />
                </div>

                <div>

                  <p
                    className="
                      font-['Orbitron']
                      text-[8px]
                      font-semibold
                      uppercase
                      tracking-[0.2em]
                      text-cyan-200/80
                    "
                  >
                    Real-Time
                  </p>

                  <p
                    className="
                      mt-0.5
                      font-['Orbitron']
                      text-[8px]
                      uppercase
                      tracking-[0.15em]
                      text-slate-400
                    "
                  >
                    Orbital View
                  </p>

                </div>

              </div>


              {hasValue(orbitalStatus) ? (
                <div className="mt-3 flex items-center gap-2">

                  <span
                    className="
                      h-1.5
                      w-1.5
                      rounded-full
                      bg-emerald-400
                      shadow-[0_0_8px_rgba(52,211,153,0.8)]
                    "
                    aria-hidden="true"
                  />

                  <span
                    className="
                      font-['Inter']
                      text-[10px]
                      uppercase
                      tracking-[0.08em]
                      text-slate-300
                    "
                  >
                    {orbitalStatus}
                  </span>

                </div>
              ) : (
                <p
                  className="
                    mt-3
                    font-['Inter']
                    text-[10px]
                    uppercase
                    tracking-[0.08em]
                    text-slate-500
                  "
                >
                  Status unavailable
                </p>
              )}

            </div>

          </motion.div>


          {/* -----------------------------------------------------
              RISK ASSESSMENTS
              ----------------------------------------------------- */}

          <motion.div
            {...calloutMotion(
              {
                opacity: 0,
                x: 8,
              },
              {
                opacity: 1,
                x: 0,
              },
              0.35,
            )}
            className="
              absolute
              right-[11%]
              top-[29%]
              hidden
              sm:block
            "
          >

            <HeroCallout
              icon={FiAlertTriangle}
              label="Risk Assessments"
              value={riskAssessments}
              tone="risk"
            />

            <CalloutConnector
              className="
                right-[96%]
                top-[55%]
                h-px
                w-12
                origin-right
                rotate-[165deg]
                sm:w-16
              "
              tone="risk"
            />

          </motion.div>


          {/* -----------------------------------------------------
              SPACE DEBRIS
              ----------------------------------------------------- */}

          <motion.div
            {...calloutMotion(
              {
                opacity: 0,
                x: -8,
              },
              {
                opacity: 1,
                x: 0,
              },
              0.45,
            )}
            className="
              absolute
              right-[8%]
              bottom-[22%]
              hidden
              sm:block
            "
          >

            <HeroCallout
              icon={FiWind}
              label="Space Debris"
              value={spaceDebris}
              tone="neutral"
            />

            <CalloutConnector
              className="
                right-[96%]
                top-[30%]
                h-px
                w-10
                origin-right
                rotate-[185deg]
                sm:w-14
              "
              tone="neutral"
            />

          </motion.div>

        </div>


        {/* =======================================================
            ORBITAL INTELLIGENCE STATUS
            ======================================================= */}

        <div
          className="
            absolute
            bottom-5
            left-5
            z-20
            flex
            items-center
            gap-2
            sm:bottom-7
            sm:left-7
            lg:bottom-8
            lg:left-8
            xl:bottom-10
            xl:left-10
          "
        >

          <span
            className="
              h-1.5
              w-1.5
              rounded-full
              bg-cyan-300
              shadow-[0_0_8px_rgba(103,232,249,0.8)]
            "
            aria-hidden="true"
          />

          <span
            className="
              font-['Orbitron']
              text-[8px]
              uppercase
              tracking-[0.18em]
              text-slate-400
              sm:text-[9px]
            "
          >
            Orbital Intelligence
          </span>

        </div>

      </div>

    </section>
  );
};


/**
 * ================================================================
 * HeroCallout
 * ================================================================
 */

const HeroCallout = ({
  icon: Icon,
  label,
  value,
  tone = "cyan",
}) => {

  const toneStyles = {
    cyan: {
      container:
        "border-cyan-300/20 bg-[#061522]/80 shadow-[0_0_25px_rgba(34,211,238,0.06)]",
      icon:
        "border-cyan-300/15 bg-cyan-400/5 text-cyan-300",
      label:
        "text-cyan-200/75",
      value:
        "text-slate-100",
    },

    risk: {
      container:
        "border-red-400/25 bg-[#160b12]/80 shadow-[0_0_25px_rgba(248,113,113,0.07)]",
      icon:
        "border-red-400/15 bg-red-400/5 text-red-300",
      label:
        "text-red-300/85",
      value:
        "text-red-100",
    },

    neutral: {
      container:
        "border-slate-300/15 bg-[#0a111b]/80 shadow-[0_0_25px_rgba(148,163,184,0.04)]",
      icon:
        "border-slate-300/10 bg-slate-300/5 text-slate-300",
      label:
        "text-slate-300/75",
      value:
        "text-slate-100",
    },
  };


  const styles =
    toneStyles[tone] ??
    toneStyles.cyan;


  return (
    <div
      className={`
        min-w-[145px]
        border
        px-3.5
        py-2.5
        backdrop-blur-md
        ${styles.container}
      `}
    >

      <div className="flex items-center gap-2.5">

        <div
          className={`
            flex
            h-7
            w-7
            shrink-0
            items-center
            justify-center
            border
            ${styles.icon}
          `}
        >
          {Icon && (
            <Icon
              className="h-3.5 w-3.5"
              aria-hidden="true"
            />
          )}
        </div>


        <div className="min-w-0">

          <p
            className={`
              font-['Orbitron']
              text-[7px]
              font-semibold
              uppercase
              tracking-[0.18em]
              ${styles.label}
            `}
          >
            {label}
          </p>


          <p
            className={`
              mt-0.5
              font-['Orbitron']
              text-base
              font-semibold
              tabular-nums
              ${styles.value}
            `}
          >
            {formatDashboardValue(value)}
          </p>

        </div>

      </div>

    </div>
  );
};


/**
 * ================================================================
 * CalloutConnector
 * ================================================================
 */

const CalloutConnector = ({
  className = "",
  tone = "cyan",
}) => {

  const dotStyles = {
    cyan:
      "bg-cyan-300 shadow-[0_0_8px_rgba(103,232,249,0.9)]",

    risk:
      "bg-red-300 shadow-[0_0_8px_rgba(252,165,165,0.9)]",

    neutral:
      "bg-slate-200 shadow-[0_0_8px_rgba(226,232,240,0.7)]",
  };


  return (
    <div
      className={`
        pointer-events-none
        absolute
        ${className}
      `}
      aria-hidden="true"
    >

      <span
        className={`
          absolute
          -right-0.5
          -top-[2px]
          h-1
          w-1
          rounded-full
          ${dotStyles[tone] ?? dotStyles.cyan}
        `}
      />

      <span
        className="
          block
          h-px
          w-full
          bg-gradient-to-r
          from-current
          via-current
          to-transparent
          opacity-60
        "
      />

    </div>
  );
};


export default DashboardHero;