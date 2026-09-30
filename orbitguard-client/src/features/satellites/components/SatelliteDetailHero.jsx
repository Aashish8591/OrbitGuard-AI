import React from "react";

/**
 * ================================================================
 * OrbitGuard AI - Satellite Detail Hero
 * ================================================================
 *
 * Backend-driven hero section for the Satellite Detail page.
 *
 * Expected SatelliteResponse:
 *
 * {
 *   id,
 *   satelliteName,
 *   satelliteCode,
 *   noradCatalogId,
 *   objectId,
 *   epoch,
 *   altitude,
 *   velocity,
 *   missionStatus,
 *   active
 * }
 *
 * No module-specific API calls are made here.
 * The parent page is responsible for fetching the satellite.
 * ================================================================
 */

const SatelliteDetailHero = ({
  satellite,
  onBack,
}) => {
  if (!satellite) {
    return (
      <section className="relative overflow-hidden rounded-2xl border border-cyan-400/15 bg-[#020914]">
        <div className="flex min-h-[280px] items-center justify-center">
          <p className="font-['Inter'] text-sm text-slate-400">
            Satellite data unavailable.
          </p>
        </div>
      </section>
    );
  }

  const {
    satelliteName,
    satelliteCode,
    noradCatalogId,
    missionStatus,
    active,
    altitude,
    velocity,
  } = satellite;

  const isActive =
    active === true ||
    String(missionStatus || "").toUpperCase() === "ACTIVE";

  const displayName =
    satelliteName?.trim() || "Unknown Satellite";

  const displayCode =
    satelliteCode?.trim() || "N/A";

  const displayNorad =
    noradCatalogId ?? "N/A";

  const displayMissionStatus =
    missionStatus
      ? String(missionStatus).toUpperCase()
      : isActive
        ? "ACTIVE"
        : "INACTIVE";

  const formatAltitude = () => {
    if (
      altitude === null ||
      altitude === undefined ||
      altitude === ""
    ) {
      return "N/A";
    }

    return `${Number(altitude).toLocaleString(undefined, {
      maximumFractionDigits: 1,
    })} km`;
  };

  const formatVelocity = () => {
    if (
      velocity === null ||
      velocity === undefined ||
      velocity === ""
    ) {
      return "N/A";
    }

    return `${Number(velocity).toLocaleString(undefined, {
      maximumFractionDigits: 2,
    })} km/s`;
  };

  return (
    <section
      className="
        relative
        overflow-hidden
        rounded-2xl
        border border-cyan-400/15
        bg-[#020914]
      "
    >
      {/* ============================================================
          BACKGROUND
          ============================================================ */}

      <div className="absolute inset-0">
        <img
          src="/images/satellites/satellite-detail-bg.png"
          alt=""
          aria-hidden="true"
          className="
            h-full
            w-full
            object-cover
            object-center
            opacity-70
          "
        />

        {/* Dark cinematic overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#020914] via-[#020914]/85 to-[#020914]/30" />

        {/* Bottom fade */}
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#020914] to-transparent" />

        {/* Blue atmospheric glow */}
        <div className="absolute -right-24 top-0 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
      </div>

      {/* ============================================================
          CONTENT
          ============================================================ */}

      <div className="relative z-10">

        {/* ----------------------------------------------------------
            BREADCRUMB
            ---------------------------------------------------------- */}

        <div className="px-5 pt-5 sm:px-7 sm:pt-6">
          <button
            type="button"
            onClick={onBack}
            className="
              group
              inline-flex
              items-center
              gap-2
              rounded-md
              px-1
              py-1
              font-['Inter']
              text-xs
              text-slate-400
              transition
              hover:text-cyan-300
            "
          >
            <span
              className="
                text-base
                transition-transform
                duration-200
                group-hover:-translate-x-1
              "
            >
              ←
            </span>

            <span>Satellites</span>

            <span className="text-slate-600">
              /
            </span>

            <span className="max-w-[180px] truncate text-slate-300">
              {displayName}
            </span>
          </button>
        </div>

        {/* ----------------------------------------------------------
            MAIN HERO
            ---------------------------------------------------------- */}

        <div
          className="
            grid
            grid-cols-1
            gap-6
            px-5
            pb-7
            pt-5
            sm:px-7
            lg:grid-cols-[auto_minmax(0,1fr)_auto]
            lg:items-center
            lg:gap-8
          "
        >

          {/* --------------------------------------------------------
              SATELLITE IMAGE
              -------------------------------------------------------- */}

          <div
            className="
              relative
              h-24
              w-24
              overflow-hidden
              rounded-xl
              border
              border-cyan-400/30
              bg-[#061321]
              shadow-[0_0_30px_rgba(0,200,255,0.08)]
              sm:h-28
              sm:w-28
            "
          >
            <img
              src="/images/satellites/satellite-placeholder.png"
              alt={displayName}
              className="
                h-full
                w-full
                object-cover
              "
              onError={(event) => {
                event.currentTarget.style.display = "none";
              }}
            />

            {/* Scanner effect */}
            <div
              className="
                pointer-events-none
                absolute
                inset-x-0
                top-0
                h-px
                bg-cyan-300/70
                shadow-[0_0_12px_rgba(34,211,238,0.8)]
              "
            />
          </div>

          {/* --------------------------------------------------------
              SATELLITE IDENTITY
              -------------------------------------------------------- */}

          <div className="min-w-0">

            <div className="flex flex-wrap items-center gap-3">

              <h1
                className="
                  font-['Orbitron']
                  text-2xl
                  font-bold
                  uppercase
                  tracking-wide
                  text-white
                  sm:text-3xl
                  lg:text-4xl
                "
              >
                {displayName}
              </h1>

              {/* Status */}
              <span
                className={`
                  inline-flex
                  items-center
                  gap-2
                  rounded-full
                  border
                  px-3
                  py-1
                  font-['Orbitron']
                  text-[10px]
                  font-semibold
                  tracking-wider
                  ${
                    isActive
                      ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-400"
                      : "border-red-400/30 bg-red-400/10 text-red-400"
                  }
                `}
              >
                <span
                  className={`
                    h-1.5
                    w-1.5
                    rounded-full
                    ${
                      isActive
                        ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]"
                        : "bg-red-400"
                    }
                  `}
                />

                {displayMissionStatus}
              </span>
            </div>

            {/* Code + NORAD */}
            <div
              className="
                mt-2
                flex
                flex-wrap
                items-center
                gap-x-4
                gap-y-1
                font-['Inter']
                text-sm
                text-slate-400
              "
            >
              <span>
                {displayCode}
              </span>

              <span className="text-slate-700">
                |
              </span>

              <span>
                NORAD{" "}
                <span className="text-slate-300">
                  {displayNorad}
                </span>
              </span>
            </div>

            {/* Small system label */}
            <div
              className="
                mt-4
                flex
                items-center
                gap-2
                font-['Orbitron']
                text-[9px]
                uppercase
                tracking-[0.2em]
                text-cyan-400/70
              "
            >
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />

              Orbital Asset
            </div>
          </div>

          {/* --------------------------------------------------------
              QUICK TELEMETRY
              -------------------------------------------------------- */}

          <div
            className="
              grid
              grid-cols-2
              gap-2
              sm:grid-cols-3
              lg:grid-cols-1
              lg:min-w-[190px]
            "
          >

            {/* Altitude */}
            <div
              className="
                rounded-lg
                border
                border-cyan-400/15
                bg-[#061321]/80
                px-4
                py-3
                backdrop-blur-sm
              "
            >
              <p
                className="
                  font-['Orbitron']
                  text-[9px]
                  uppercase
                  tracking-wider
                  text-slate-500
                "
              >
                Altitude
              </p>

              <p
                className="
                  mt-1
                  font-['Inter']
                  text-sm
                  font-semibold
                  text-white
                "
              >
                {formatAltitude()}
              </p>
            </div>

            {/* Velocity */}
            <div
              className="
                rounded-lg
                border
                border-cyan-400/15
                bg-[#061321]/80
                px-4
                py-3
                backdrop-blur-sm
              "
            >
              <p
                className="
                  font-['Orbitron']
                  text-[9px]
                  uppercase
                  tracking-wider
                  text-slate-500
                "
              >
                Velocity
              </p>

              <p
                className="
                  mt-1
                  font-['Inter']
                  text-sm
                  font-semibold
                  text-white
                "
              >
                {formatVelocity()}
              </p>
            </div>

            {/* NORAD */}
            <div
              className="
                rounded-lg
                border
                border-cyan-400/15
                bg-[#061321]/80
                px-4
                py-3
                backdrop-blur-sm
              "
            >
              <p
                className="
                  font-['Orbitron']
                  text-[9px]
                  uppercase
                  tracking-wider
                  text-slate-500
                "
              >
                NORAD ID
              </p>

              <p
                className="
                  mt-1
                  font-['Inter']
                  text-sm
                  font-semibold
                  text-white
                "
              >
                {displayNorad}
              </p>
            </div>

          </div>
        </div>

        {/* ==========================================================
            HERO BOTTOM SYSTEM LINE
            ========================================================== */}

        <div
          className="
            flex
            items-center
            gap-3
            border-t
            border-cyan-400/10
            px-5
            py-2.5
            sm:px-7
          "
        >
          <span className="h-1 w-1 rounded-full bg-cyan-400" />

          <span
            className="
              font-['Orbitron']
              text-[8px]
              uppercase
              tracking-[0.18em]
              text-slate-500
            "
          >
            Satellite Registry
          </span>

          <span className="h-px flex-1 bg-cyan-400/10" />

          <span
            className="
              font-['Orbitron']
              text-[8px]
              uppercase
              tracking-[0.18em]
              text-cyan-400/60
            "
          >
            LIVE ASSET DATA
          </span>
        </div>

      </div>
    </section>
  );
};

export default SatelliteDetailHero;