import { Link } from "react-router-dom";
import { FaArrowLeft, FaSatellite } from "react-icons/fa";

/**
 * SatelliteHero
 *
 * Presentation-only component for the Satellite Registry.
 *
 * Responsibilities:
 * - Display satellite module identity
 * - Display breadcrumb navigation
 * - Display page title and description
 * - Display satellite registry telemetry
 * - Display satellite-themed visual background
 *
 * This component intentionally does NOT:
 * - Call APIs
 * - Import satelliteService
 * - Manage backend state
 * - Perform data fetching
 * - Contain satellite business logic
 *
 * Backend data is provided by SatelliteOverviewPage through props.
 */
const SatelliteHero = ({
  totalSatellites = 0,
  activeSatellites = 0,
}) => {
  return (
    <section
      className="
        relative
        isolate
        min-h-[190px]
        overflow-hidden
        rounded-2xl
        border
        border-slate-800/80
        bg-slate-950
        sm:min-h-[205px]
        lg:min-h-[220px]
      "
      aria-labelledby="satellite-registry-title"
    >
      {/* ============================================================
          BACKGROUND IMAGE
          ============================================================ */}

      <div
        className="
          absolute
          inset-0
          -z-20
          bg-cover
          bg-[position:center_35%]
          sm:bg-[position:center_30%]
        "
        style={{
          backgroundImage:
            "url('/images/satellite/satellite-overview-bg.png')",
        }}
        aria-hidden="true"
      />

      {/* ============================================================
          DARK SPACE OVERLAY
          ============================================================ */}

      <div
        className="
          absolute
          inset-0
          -z-10
          bg-gradient-to-r
          from-[#020812]
          via-[#020812]/85
          to-[#020812]/20
        "
        aria-hidden="true"
      />

      {/* Bottom fade into the page */}

      <div
        className="
          absolute
          inset-x-0
          bottom-0
          -z-10
          h-24
          bg-gradient-to-t
          from-[#020812]
          to-transparent
        "
        aria-hidden="true"
      />

      {/* Subtle top atmospheric glow */}

      <div
        className="
          pointer-events-none
          absolute
          -right-20
          -top-24
          -z-10
          h-64
          w-64
          rounded-full
          bg-cyan-500/10
          blur-3xl
        "
        aria-hidden="true"
      />

      {/* ============================================================
          CONTENT
          ============================================================ */}

      <div
        className="
          relative
          flex
          h-full
          min-h-[190px]
          flex-col
          justify-between
          px-5
          py-5
          sm:min-h-[205px]
          sm:px-7
          sm:py-6
          lg:min-h-[220px]
          lg:px-8
        "
      >
        {/* ============================================================
            BREADCRUMB
            ============================================================ */}

        <nav
          aria-label="Breadcrumb"
          className="
            flex
            items-center
            gap-2
            font-['Inter']
            text-xs
            text-slate-400
          "
        >
          <Link
            to="/dashboard"
            className="
              inline-flex
              items-center
              justify-center
              rounded-md
              p-1
              text-slate-300
              transition-colors
              duration-200
              hover:bg-white/5
              hover:text-cyan-400
              focus:outline-none
              focus:ring-2
              focus:ring-cyan-400/50
            "
            aria-label="Back to dashboard"
          >
            <FaArrowLeft
              className="text-[11px]"
              aria-hidden="true"
            />
          </Link>

          <span className="text-slate-700">›</span>

          <span className="text-slate-300">
            Satellites
          </span>
        </nav>

        {/* ============================================================
            MAIN HERO CONTENT
            ============================================================ */}

        <div className="flex items-end justify-between gap-6">
          {/* Left content */}

          <div className="max-w-2xl">
            <div className="flex items-start gap-3 sm:gap-4">
              {/* Satellite module icon */}

              <div
                className="
                  mt-1
                  flex
                  h-9
                  w-9
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-cyan-400/60
                  bg-slate-950/60
                  text-cyan-400
                  shadow-[0_0_20px_rgba(34,211,238,0.12)]
                  sm:h-10
                  sm:w-10
                "
                aria-hidden="true"
              >
                <FaSatellite className="text-sm sm:text-base" />
              </div>

              <div>
                {/* Page title */}

                <h1
                  id="satellite-registry-title"
                  className="
                    font-['Orbitron']
                    text-2xl
                    font-bold
                    leading-tight
                    tracking-[0.08em]
                    text-white
                    sm:text-3xl
                    lg:text-4xl
                  "
                >
                  SATELLITE REGISTRY
                </h1>

                {/* Description */}

                <p
                  className="
                    mt-2
                    max-w-xl
                    font-['Inter']
                    text-xs
                    leading-relaxed
                    text-slate-300
                    sm:text-sm
                  "
                >
                  Monitor and manage tracked orbital assets across
                  Earth&apos;s orbits
                </p>

                {/* ====================================================
                    LIVE REGISTRY TELEMETRY

                    Values come from the Spring Boot backend through
                    SatelliteOverviewPage.
                ==================================================== */}

                <div
                  className="
                    mt-3
                    flex
                    flex-wrap
                    items-center
                    gap-x-4
                    gap-y-1.5
                    font-['Orbitron']
                    text-[8px]
                    uppercase
                    tracking-[0.16em]
                    text-slate-400
                    sm:text-[9px]
                  "
                  aria-label="Satellite registry status"
                >
                  <span className="inline-flex items-center gap-1.5">
                    <span
                      className="
                        h-1.5
                        w-1.5
                        rounded-full
                        bg-cyan-400
                        shadow-[0_0_8px_rgba(34,211,238,0.8)]
                      "
                      aria-hidden="true"
                    />

                    {totalSatellites} TRACKED
                  </span>

                  <span className="text-slate-700">
                    /
                  </span>

                  <span className="text-cyan-300/80">
                    {activeSatellites} ACTIVE
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================
              RIGHT-SIDE ORBITGUARD IDENTITY
              ======================================================== */}

          <div
            className="
              hidden
              shrink-0
              border-l
              border-cyan-400/20
              pl-5
              pr-1
              sm:block
              lg:pl-7
            "
            aria-hidden="true"
          >
            <div className="space-y-1">
              <HeroIdentityLine text="TRACK" />
              <HeroIdentityLine text="ANALYZE" />
              <HeroIdentityLine text="PREDICT" />
              <HeroIdentityLine text="PROTECT" />
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================
          BOTTOM ACCENT LINE
          ============================================================ */}

      <div
        className="
          absolute
          bottom-0
          left-0
          h-px
          w-2/3
          bg-gradient-to-r
          from-cyan-400/70
          via-cyan-400/20
          to-transparent
        "
        aria-hidden="true"
      />
    </section>
  );
};

/**
 * Right-side hero identity line.
 */
const HeroIdentityLine = ({ text }) => {
  return (
    <div
      className="
        flex
        items-center
        gap-2
        font-['Orbitron']
        text-[9px]
        font-medium
        tracking-[0.18em]
        text-slate-300
        lg:text-[10px]
      "
    >
      <span
        className="
          h-1
          w-1
          rounded-full
          bg-cyan-400
          shadow-[0_0_8px_rgba(34,211,238,0.8)]
        "
      />

      <span>{text}</span>
    </div>
  );
};

export default SatelliteHero;