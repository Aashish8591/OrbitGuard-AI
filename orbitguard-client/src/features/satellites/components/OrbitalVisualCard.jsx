import {
  FiActivity,
  FiArrowUpRight,
  FiCircle,
  FiRadio,
  FiTarget,
} from "react-icons/fi";

/**
 * ================================================================
 * OrbitGuard AI - Orbital Visual Card
 * ================================================================
 *
 * PURPOSE
 * ----------------------------------------------------------------
 * Medium-sized orbital preview for the Satellite Detail page.
 *
 * This is a visual preview only.
 *
 * The dedicated visualization page will later handle:
 * - Real 3D Earth
 * - Real satellite position
 * - Real propagated trajectory
 * - SGP4 / Orekit
 * - Camera controls
 * - Orbital animation
 *
 * This component does NOT:
 * - make API requests
 * - calculate orbital coordinates
 * - perform SGP4 calculations
 * - perform Orekit calculations
 * - generate fake satellite positions
 * - invent operator/country information
 *
 * Artwork:
 * /public/images/satellite/satellitevisualcard.png
 *
 * The artwork is UI visualization only.
 * ================================================================
 */

/* ================================================================
   FORMATTERS
================================================================ */

const formatNumber = (value, maximumFractionDigits = 3) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "—";
  }

  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return "—";
  }

  return numericValue.toLocaleString("en-US", {
    maximumFractionDigits,
  });
};

const formatWithUnit = (
  value,
  unit,
  maximumFractionDigits = 3,
) => {
  const formattedValue = formatNumber(
    value,
    maximumFractionDigits,
  );

  if (formattedValue === "—") {
    return "—";
  }

  return `${formattedValue} ${unit}`;
};

const hasValue = (value) => {
  return (
    value !== null &&
    value !== undefined &&
    value !== ""
  );
};

/* ================================================================
   TELEMETRY ITEM
================================================================ */

const TelemetryItem = ({
  icon: Icon,
  label,
  value,
}) => {
  return (
    <div
      className="
        min-w-0
        px-3
        py-3.5

        sm:px-3.5
        sm:py-4

        lg:px-3
      "
    >
      {/* LABEL */}

      <div
        className="
          flex
          min-w-0
          items-center
          gap-1.5
        "
      >
        <Icon
          size={11}
          className="
            shrink-0
            text-cyan-400/85
          "
        />

        <span
          className="
            min-w-0
            truncate
            font-['Orbitron']
            text-[7px]
            font-medium
            uppercase
            tracking-[0.08em]
            text-slate-500

            sm:text-[8px]
          "
        >
          {label}
        </span>
      </div>

      {/* VALUE */}

      <div
        className="
          mt-1.5
          truncate
          font-mono
          text-[11px]
          font-semibold
          tabular-nums
          text-slate-100

          sm:text-xs
        "
      >
        {value}
      </div>
    </div>
  );
};

/* ================================================================
   NO DATA
================================================================ */

const NoOrbitalData = () => {
  return (
    <section
      className="
        overflow-hidden
        rounded-2xl
        border
        border-white/[0.06]
        bg-[#020817]/85
        shadow-[0_14px_45px_rgba(0,0,0,0.20)]
      "
    >
      <div
        className="
          flex
          min-h-[280px]
          items-center
          justify-center
          px-5
          text-center
        "
      >
        <div>
          <div
            className="
              mx-auto
              flex
              h-11
              w-11
              items-center
              justify-center
              rounded-xl
              border
              border-cyan-400/15
              bg-cyan-400/[0.045]
              text-cyan-300
            "
          >
            <FiTarget size={17} />
          </div>

          <h2
            className="
              mt-3
              font-['Orbitron']
              text-[10px]
              font-semibold
              uppercase
              tracking-[0.13em]
              text-slate-300
            "
          >
            Orbital Visualization
          </h2>

          <p
            className="
              mt-1.5
              font-['Inter']
              text-xs
              text-slate-500
            "
          >
            No orbital information is available.
          </p>
        </div>
      </div>
    </section>
  );
};

/* ================================================================
   COMPONENT
================================================================ */

const OrbitalVisualCard = ({
  satellite,
  onOpenVisualization,
}) => {
  /* ============================================================
     NO SATELLITE
  ============================================================ */

  if (!satellite) {
    return <NoOrbitalData />;
  }

  /* ============================================================
     BACKEND VALUES
  ============================================================ */

  const satelliteName =
    satellite.satelliteName ||
    "Unknown Satellite";

  const noradCatalogId =
    satellite.noradCatalogId ?? "—";

  const isActive =
    satellite.active === true;

  const altitude = formatWithUnit(
    satellite.altitude,
    "km",
    2,
  );

  const velocity = formatWithUnit(
    satellite.velocity,
    "km/s",
    3,
  );

  const inclination =
    hasValue(satellite.inclination)
      ? `${formatNumber(
          satellite.inclination,
          2,
        )}°`
      : "—";

  const meanMotion =
    hasValue(satellite.meanMotion)
      ? formatNumber(
          satellite.meanMotion,
          4,
        )
      : "—";

  const eccentricity =
    formatNumber(
      satellite.eccentricity,
      6,
    );

  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <section
      className="
        group
        overflow-hidden
        rounded-2xl
        border
        border-white/[0.065]
        bg-[#020817]/90
        shadow-[0_16px_50px_rgba(0,0,0,0.22)]
      "
    >
      {/* ==========================================================
          HEADER
      ========================================================== */}

      <header
        className="
          flex
          min-w-0
          items-center
          justify-between
          gap-3
          border-b
          border-white/[0.055]
          px-4
          py-3.5

          sm:px-5
          sm:py-4
        "
      >
        {/* TITLE */}

        <div
          className="
            flex
            min-w-0
            items-center
            gap-3
          "
        >
          <div
            className="
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-lg
              border
              border-cyan-400/20
              bg-cyan-400/[0.055]
              text-cyan-300
            "
          >
            <FiTarget size={15} />
          </div>

          <div className="min-w-0">
            <h2
              className="
                truncate
                font-['Orbitron']
                text-[10px]
                font-semibold
                uppercase
                tracking-[0.12em]
                text-slate-200

                sm:text-[11px]
              "
            >
              Orbital Visualization
            </h2>

            <p
              className="
                mt-1
                truncate
                font-['Inter']
                text-[9px]
                text-slate-500

                sm:text-[10px]
              "
            >
              Satellite orbital preview
            </p>
          </div>
        </div>

        {/* STATUS */}

        <div
          className={`
            flex
            shrink-0
            items-center
            gap-1.5
            rounded-full
            border
            px-2.5
            py-1.5

            ${
              isActive
                ? `
                  border-emerald-400/20
                  bg-emerald-400/[0.045]
                `
                : `
                  border-slate-500/20
                  bg-slate-500/[0.04]
                `
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
                  ? `
                    bg-emerald-400
                    shadow-[0_0_9px_rgba(52,211,153,0.75)]
                  `
                  : "bg-slate-500"
              }
            `}
          />

          <span
            className={`
              font-['Orbitron']
              text-[7px]
              font-medium
              uppercase
              tracking-[0.08em]

              ${
                isActive
                  ? "text-emerald-300"
                  : "text-slate-500"
              }
            `}
          >
            {isActive ? "Active" : "Inactive"}
          </span>
        </div>
      </header>

      {/* ==========================================================
          VISUAL PREVIEW
      ========================================================== */}

      <div
        className="
          relative
          h-[285px]
          overflow-hidden

          sm:h-[315px]
          lg:h-[325px]
        "
      >
        {/* ========================================================
            ARTWORK
        ======================================================== */}

        <img
          src="/images/satellite/satellitevisualcard.png"
          alt="Orbital visualization preview"
          aria-hidden="true"
          className="
            absolute
            inset-0
            h-full
            w-full
            object-cover
            object-center
            transition-transform
            duration-700
            ease-out
            group-hover:scale-[1.018]
          "
        />

        {/* ========================================================
            READABILITY OVERLAYS
        ======================================================== */}

        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            inset-0
            bg-[#020817]/10
          "
        />

        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            inset-0
            bg-gradient-to-b
            from-[#020817]/55
            via-transparent
            to-[#020817]/90
          "
        />

        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            inset-0
            bg-gradient-to-r
            from-[#020817]/50
            via-transparent
            to-[#020817]/15
          "
        />

        {/* ========================================================
            TRACKING OBJECT
        ======================================================== */}

        <div
          className="
            absolute
            left-4
            top-4
            max-w-[70%]
            rounded-xl
            border
            border-white/[0.075]
            bg-[#020817]/72
            px-3
            py-2.5
            shadow-[0_10px_35px_rgba(0,0,0,0.20)]
            backdrop-blur-md

            sm:left-5
            sm:top-5
            sm:px-3.5
            sm:py-3
          "
        >
          <div
            className="
              flex
              items-center
              gap-1.5
            "
          >
            <FiRadio
              size={10}
              className="text-cyan-300"
            />

            <span
              className="
                font-['Orbitron']
                text-[7px]
                font-medium
                uppercase
                tracking-[0.11em]
                text-cyan-300/80
              "
            >
              Tracking Object
            </span>
          </div>

          <div
            className="
              mt-1.5
              truncate
              font-['Inter']
              text-xs
              font-semibold
              text-white

              sm:text-[13px]
            "
          >
            {satelliteName}
          </div>

          <div
            className="
              mt-1
              font-mono
              text-[8px]
              tabular-nums
              text-slate-500
            "
          >
            NORAD {noradCatalogId}
          </div>
        </div>

        {/* ========================================================
            PREVIEW STATUS
        ======================================================== */}

        <div
          className="
            absolute
            right-4
            top-4
            flex
            items-center
            gap-1.5
            rounded-full
            border
            border-cyan-300/15
            bg-[#020817]/65
            px-2.5
            py-1.5
            backdrop-blur-md

            sm:right-5
            sm:top-5
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
          />

          <span
            className="
              font-['Orbitron']
              text-[7px]
              uppercase
              tracking-[0.08em]
              text-cyan-200/80
            "
          >
            Preview
          </span>
        </div>

        {/* ========================================================
            BOTTOM ARTWORK LABEL
        ======================================================== */}

        <div
          className="
            absolute
            bottom-4
            left-4

            sm:bottom-5
            sm:left-5
          "
        >
          <div
            className="
              rounded-lg
              border
              border-white/[0.07]
              bg-[#020817]/65
              px-3
              py-2
              backdrop-blur-md
            "
          >
            <div
              className="
                font-['Orbitron']
                text-[7px]
                font-medium
                uppercase
                tracking-[0.1em]
                text-cyan-200/80
              "
            >
              Orbital Preview
            </div>

            <div
              className="
                mt-0.5
                font-['Inter']
                text-[8px]
                text-slate-500
              "
            >
              Satellite registry visualization
            </div>
          </div>
        </div>

        {/* ========================================================
            SMALL VISUAL MARKER
        ======================================================== */}

        <div
          aria-hidden="true"
          className="
            absolute
            bottom-5
            right-5
            hidden
            h-8
            w-8
            items-center
            justify-center
            rounded-full
            border
            border-cyan-300/15
            bg-cyan-300/[0.04]
            backdrop-blur-sm

            sm:flex
          "
        >
          <FiTarget
            size={13}
            className="text-cyan-300/60"
          />
        </div>
      </div>

      {/* ==========================================================
          TELEMETRY
      ========================================================== */}

      <div
        className="
          border-t
          border-white/[0.055]
          bg-[#020817]/95
        "
      >
        {/* TELEMETRY HEADER */}

        <div
          className="
            flex
            items-center
            justify-between
            gap-3
            border-b
            border-white/[0.045]
            px-4
            py-2.5

            sm:px-5
            sm:py-3
          "
        >
          <div
            className="
              flex
              items-center
              gap-2
            "
          >
            <FiActivity
              size={11}
              className="text-cyan-300"
            />

            <span
              className="
                font-['Orbitron']
                text-[7px]
                font-medium
                uppercase
                tracking-[0.11em]
                text-slate-400

                sm:text-[8px]
              "
            >
              Orbital Telemetry
            </span>
          </div>

          <span
            className="
              font-['Inter']
              text-[8px]
              text-slate-600
            "
          >
            Backend values
          </span>
        </div>

        {/* TELEMETRY GRID */}

        <div
          className="
            grid
            grid-cols-2
            divide-x
            divide-y
            divide-white/[0.045]

            sm:grid-cols-5
            sm:divide-y-0
          "
        >
          <TelemetryItem
            icon={FiActivity}
            label="Altitude"
            value={altitude}
          />

          <TelemetryItem
            icon={FiActivity}
            label="Velocity"
            value={velocity}
          />

          <TelemetryItem
            icon={FiTarget}
            label="Inclination"
            value={inclination}
          />

          <TelemetryItem
            icon={FiRadio}
            label="Mean Motion"
            value={meanMotion}
          />

          <TelemetryItem
            icon={FiCircle}
            label="Eccentricity"
            value={eccentricity}
          />
        </div>
      </div>

      {/* ==========================================================
          OPEN 3D VIEW
      ========================================================== */}

      {onOpenVisualization && (
        <button
          type="button"
          onClick={() =>
            onOpenVisualization(satellite)
          }
          className="
            group/action
            flex
            w-full
            items-center
            justify-between
            gap-4
            border-t
            border-white/[0.055]
            bg-[#020817]/95
            px-4
            py-3
            text-left
            transition
            duration-200
            hover:bg-cyan-400/[0.035]

            sm:px-5
            sm:py-3.5
          "
        >
          <div className="min-w-0">
            <div
              className="
                flex
                items-center
                gap-2
              "
            >
              <span
                className="
                  font-['Orbitron']
                  text-[8px]
                  font-medium
                  uppercase
                  tracking-[0.1em]
                  text-cyan-300
                "
              >
                Open 3D View
              </span>

              <span
                className="
                  rounded-full
                  border
                  border-cyan-400/10
                  bg-cyan-400/[0.035]
                  px-1.5
                  py-0.5
                  font-['Orbitron']
                  text-[6px]
                  uppercase
                  tracking-[0.06em]
                  text-cyan-400/60
                "
              >
                SGP4
              </span>
            </div>

            <p
              className="
                mt-1
                truncate
                font-['Inter']
                text-[8px]
                text-slate-600
              "
            >
              View propagated satellite position
            </p>
          </div>

          <span
            className="
              flex
              h-8
              w-8
              shrink-0
              items-center
              justify-center
              rounded-lg
              border
              border-cyan-400/15
              bg-cyan-400/[0.045]
              text-cyan-300
              transition
              duration-200
              group-hover/action:border-cyan-400/30
              group-hover/action:bg-cyan-400/[0.08]
              group-hover/action:text-cyan-200
            "
          >
            <FiArrowUpRight size={14} />
          </span>
        </button>
      )}
    </section>
  );
};

export default OrbitalVisualCard;