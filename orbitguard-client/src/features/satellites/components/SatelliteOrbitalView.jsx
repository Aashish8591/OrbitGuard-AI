import React from "react";

/**
 * ================================================================
 * OrbitGuard AI - Orbital View
 * ================================================================
 *
 * Compact orbital visualization for Satellite Detail page.
 *
 * Current backend data used:
 * - altitude
 * - velocity
 * - noradCatalogId
 * - missionStatus
 * - active
 *
 * IMPORTANT:
 * The orbit shown here is currently a visual representation.
 * It does NOT pretend to know the satellite's real position.
 *
 * Real SGP4/Orekit position data can be connected later.
 * ================================================================
 */

const SatelliteOrbitalView = ({ satellite }) => {
  if (!satellite) {
    return (
      <section
        className="
          rounded-xl
          border border-cyan-400/15
          bg-[#020b16]
          p-5
        "
      >
        <p className="font-['Inter'] text-sm text-slate-500">
          Orbital data unavailable.
        </p>
      </section>
    );
  }

  const {
    altitude,
    velocity,
    noradCatalogId,
    missionStatus,
    active,
  } = satellite;

  const isActive =
    active === true ||
    String(missionStatus || "").toUpperCase() === "ACTIVE";

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
        min-h-[300px]
        overflow-hidden
        rounded-xl
        border border-cyan-400/15
        bg-[#020b16]
      "
    >
      {/* ============================================================
          SPACE BACKGROUND
          ============================================================ */}

      <div className="absolute inset-0">

        {/* Subtle star field */}
        <div
          className="
            absolute
            inset-0
            opacity-40
            [background-image:radial-gradient(circle,rgba(148,163,184,0.45)_1px,transparent_1px)]
            [background-size:42px_42px]
          "
        />

        {/* Blue atmospheric glow */}
        <div
          className="
            absolute
            left-1/2
            top-[62%]
            h-64
            w-64
            -translate-x-1/2
            -translate-y-1/2
            rounded-full
            bg-cyan-500/10
            blur-3xl
          "
        />

        {/* Bottom darkness */}
        <div
          className="
            absolute
            inset-x-0
            bottom-0
            h-24
            bg-gradient-to-t
            from-[#020b16]
            to-transparent
          "
        />
      </div>

      {/* ============================================================
          HEADER
          ============================================================ */}

      <div
        className="
          relative
          z-20
          flex
          items-center
          justify-between
          border-b
          border-cyan-400/10
          px-4
          py-3
          sm:px-5
        "
      >
        <div className="flex items-center gap-3">

          {/* Orbital icon */}
          <div
            className="
              flex
              h-8
              w-8
              items-center
              justify-center
              rounded-lg
              border
              border-cyan-400/25
              bg-cyan-400/5
              text-cyan-400
            "
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              className="h-4 w-4"
            >
              <circle cx="12" cy="12" r="3" />
              <ellipse cx="12" cy="12" rx="9" ry="4" />
              <path d="M12 3c2.5 2.7 2.5 15.3 0 18" />
            </svg>
          </div>

          <div>
            <h2
              className="
                font-['Orbitron']
                text-xs
                font-semibold
                uppercase
                tracking-wider
                text-slate-200
              "
            >
              Orbital View
            </h2>

            <p
              className="
                font-['Inter']
                text-[9px]
                text-slate-500
              "
            >
              Live orbital representation
            </p>
          </div>
        </div>

        {/* Status */}
        <div
          className={`
            flex
            items-center
            gap-1.5
            rounded-full
            border
            px-2.5
            py-1
            font-['Orbitron']
            text-[8px]
            uppercase
            tracking-wider
            ${
              isActive
                ? "border-emerald-400/20 bg-emerald-400/5 text-emerald-400"
                : "border-red-400/20 bg-red-400/5 text-red-400"
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
                  ? "bg-emerald-400 shadow-[0_0_7px_rgba(52,211,153,0.8)]"
                  : "bg-red-400"
              }
            `}
          />

          {isActive ? "Tracking" : "Inactive"}
        </div>
      </div>

      {/* ============================================================
          ORBITAL VISUALIZATION
          ============================================================ */}

      <div
        className="
          relative
          z-10
          h-[230px]
          overflow-hidden
        "
      >

        {/* ----------------------------------------------------------
            EARTH
            ---------------------------------------------------------- */}

        <div
          className="
            absolute
            bottom-[-82px]
            left-1/2
            h-[250px]
            w-[250px]
            -translate-x-1/2
            rounded-full
            border
            border-cyan-300/20
            bg-[radial-gradient(circle_at_38%_30%,#3b82f6_0%,#164e87_24%,#08213b_52%,#020b16_72%)]
            shadow-[0_0_45px_rgba(14,165,233,0.28),inset_0_0_45px_rgba(0,0,0,0.65)]
          "
        >

          {/* Atmosphere */}
          <div
            className="
              absolute
              -inset-2
              rounded-full
              border
              border-cyan-400/10
              shadow-[0_0_30px_rgba(34,211,238,0.12)]
            "
          />

          {/* Simplified continents */}
          <div
            className="
              absolute
              left-[26%]
              top-[20%]
              h-16
              w-8
              rotate-[25deg]
              rounded-[50%]
              bg-emerald-400/20
              blur-[2px]
            "
          />

          <div
            className="
              absolute
              left-[48%]
              top-[42%]
              h-12
              w-6
              -rotate-[20deg]
              rounded-[50%]
              bg-emerald-400/15
              blur-[2px]
            "
          />

          <div
            className="
              absolute
              left-[63%]
              top-[22%]
              h-8
              w-12
              rotate-[12deg]
              rounded-[50%]
              bg-emerald-400/15
              blur-[2px]
            "
          />
        </div>

        {/* ----------------------------------------------------------
            ORBIT RING
            ---------------------------------------------------------- */}

        <div
          className="
            absolute
            left-1/2
            top-[58%]
            h-[92px]
            w-[310px]
            -translate-x-1/2
            -translate-y-1/2
            rotate-[-12deg]
            rounded-[50%]
            border
            border-cyan-400/50
            shadow-[0_0_12px_rgba(34,211,238,0.12)]
          "
        />

        {/* Secondary orbit line */}
        <div
          className="
            absolute
            left-1/2
            top-[58%]
            h-[104px]
            w-[325px]
            -translate-x-1/2
            -translate-y-1/2
            rotate-[-12deg]
            rounded-[50%]
            border
            border-dashed
            border-cyan-400/10
          "
        />

        {/* ----------------------------------------------------------
            SATELLITE POSITION MARKER
            ---------------------------------------------------------- */}

        <div
          className="
            absolute
            left-[72%]
            top-[31%]
            z-20
            flex
            h-7
            w-7
            -translate-x-1/2
            -translate-y-1/2
            items-center
            justify-center
            rounded-full
            border
            border-cyan-300/50
            bg-[#061321]
            shadow-[0_0_15px_rgba(34,211,238,0.35)]
          "
          title="Satellite position visualization"
        >
          <div
            className="
              h-2
              w-2
              rounded-full
              bg-cyan-300
              shadow-[0_0_10px_rgba(103,232,249,1)]
            "
          />
        </div>

        {/* Connection line */}
        <div
          className="
            absolute
            left-[72%]
            top-[31%]
            h-12
            w-px
            origin-bottom
            rotate-[35deg]
            bg-gradient-to-t
            from-cyan-400/30
            to-transparent
          "
        />

        {/* ----------------------------------------------------------
            NORAD LABEL
            ---------------------------------------------------------- */}

        <div
          className="
            absolute
            left-[72%]
            top-[12%]
            -translate-x-1/2
            rounded-md
            border
            border-cyan-400/15
            bg-[#020b16]/80
            px-2.5
            py-1
            backdrop-blur-sm
          "
        >
          <p
            className="
              font-['Orbitron']
              text-[7px]
              tracking-wider
              text-cyan-400/70
            "
          >
            NORAD {noradCatalogId ?? "N/A"}
          </p>
        </div>
      </div>

      {/* ============================================================
          TELEMETRY PANEL
          ============================================================ */}

      <div
        className="
          absolute
          right-3
          top-[68px]
          z-30
          w-[135px]
          rounded-lg
          border
          border-cyan-400/15
          bg-[#020b16]/85
          p-3
          backdrop-blur-md
          sm:right-4
          sm:w-[145px]
        "
      >

        {/* Altitude */}
        <TelemetryItem
          label="Altitude"
          value={formatAltitude()}
          icon="altitude"
        />

        <div className="my-2 border-t border-cyan-400/[0.07]" />

        {/* Velocity */}
        <TelemetryItem
          label="Velocity"
          value={formatVelocity()}
          icon="velocity"
        />

        <div className="my-2 border-t border-cyan-400/[0.07]" />

        {/* Status */}
        <TelemetryItem
          label="Status"
          value={isActive ? "ACTIVE" : "INACTIVE"}
          icon="status"
          status={isActive}
        />
      </div>

      {/* ============================================================
          FOOTER
          ============================================================ */}

      <div
        className="
          absolute
          bottom-0
          left-0
          right-0
          z-20
          flex
          items-center
          justify-between
          border-t
          border-cyan-400/10
          bg-[#020b16]/70
          px-4
          py-2
          backdrop-blur-sm
        "
      >
        <span
          className="
            font-['Orbitron']
            text-[8px]
            uppercase
            tracking-[0.16em]
            text-slate-600
          "
        >
          Orbital visualization
        </span>

        <span
          className="
            font-['Inter']
            text-[9px]
            text-slate-500
          "
        >
          SGP4 / Orekit
        </span>
      </div>
    </section>
  );
};

/**
 * ================================================================
 * TELEMETRY ITEM
 * ================================================================
 */

const TelemetryItem = ({
  label,
  value,
  icon,
  status = false,
}) => {
  return (
    <div className="flex items-center gap-2.5">

      {/* Icon */}
      <div className="text-cyan-400/80">
        {icon === "altitude" && (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            className="h-4 w-4"
          >
            <path d="M12 19V5" />
            <path d="m7 10 5-5 5 5" />
            <path d="M5 19h14" />
          </svg>
        )}

        {icon === "velocity" && (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            className="h-4 w-4"
          >
            <path d="M4 12h14" />
            <path d="m14 7 5 5-5 5" />
            <path d="M4 7h4" />
            <path d="M4 17h4" />
          </svg>
        )}

        {icon === "status" && (
          <span
            className={`
              block
              h-2.5
              w-2.5
              rounded-full
              ${
                status
                  ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"
                  : "bg-red-400"
              }
            `}
          />
        )}
      </div>

      {/* Text */}
      <div className="min-w-0">
        <p
          className="
            font-['Orbitron']
            text-[8px]
            uppercase
            tracking-wider
            text-slate-500
          "
        >
          {label}
        </p>

        <p
          className={`
            mt-0.5
            truncate
            font-['Inter']
            text-[11px]
            font-semibold
            ${
              icon === "status"
                ? status
                  ? "text-emerald-400"
                  : "text-red-400"
                : "text-slate-200"
            }
          `}
        >
          {value}
        </p>
      </div>
    </div>
  );
};

export default SatelliteOrbitalView;