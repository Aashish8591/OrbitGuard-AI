import React from "react";
import {
  FiActivity,
  FiAperture,
  FiCompass,
  FiCrosshair,
  FiDisc,
  FiNavigation,
  FiRotateCw,
  FiTarget,
  FiTrendingUp,
  FiWind,
  FiZap,
} from "react-icons/fi";

/**
 * ================================================================
 * OrbitGuard AI - Satellite Orbital Parameters
 * ================================================================
 *
 * Displays orbital / TLE / SGP4 parameters returned by the
 * SatelliteResponse backend DTO.
 *
 * Backend source:
 * SatelliteResponse
 *
 * This component:
 * - Does NOT fetch API data
 * - Does NOT calculate orbital values
 * - Does NOT create dummy satellite data
 * - Displays backend values exactly as provided
 * - Handles null / unavailable values safely
 * - Is responsive across desktop, tablet and mobile
 * ================================================================
 */

const SatelliteOrbitalParameters = ({ satellite }) => {
  /**
   * --------------------------------------------------------------
   * Safe value formatter
   * --------------------------------------------------------------
   */
  const formatValue = (value, digits = null) => {
    if (value === null || value === undefined || value === "") {
      return "—";
    }

    if (typeof value === "number" && digits !== null) {
      return value.toFixed(digits);
    }

    return String(value);
  };

  /**
   * --------------------------------------------------------------
   * Orbital parameter definitions
   *
   * These fields directly correspond to SatelliteResponse.
   * --------------------------------------------------------------
   */
  const parameters = [
    {
      label: "Mean Motion",
      value: formatValue(satellite?.meanMotion, 8),
      unit: "rev/day",
      icon: FiActivity,
    },
    {
      label: "Mean Motion Dot",
      value: formatValue(satellite?.meanMotionDot, 10),
      unit: "rev/day²",
      icon: FiTrendingUp,
    },
    {
      label: "Mean Motion Ddot",
      value: formatValue(satellite?.meanMotionDdot, 10),
      unit: "rev/day³",
      icon: FiNavigation,
    },
    {
      label: "Eccentricity",
      value: formatValue(satellite?.eccentricity, 8),
      unit: "",
      icon: FiDisc,
    },
    {
      label: "Inclination",
      value: formatValue(satellite?.inclination, 4),
      unit: "degrees",
      icon: FiCompass,
    },
    {
      label: "Right Ascension of Ascending Node",
      value: formatValue(
        satellite?.rightAscensionOfAscendingNode,
        4
      ),
      unit: "degrees",
      icon: FiTarget,
    },
    {
      label: "Argument of Pericenter",
      value: formatValue(
        satellite?.argumentOfPericenter,
        4
      ),
      unit: "degrees",
      icon: FiRotateCw,
    },
    {
      label: "Mean Anomaly",
      value: formatValue(satellite?.meanAnomaly, 4),
      unit: "degrees",
      icon: FiCrosshair,
    },
    {
      label: "BSTAR",
      value: formatValue(satellite?.bstar, 8),
      unit: "",
      icon: FiWind,
    },
    {
      label: "Altitude",
      value: formatValue(satellite?.altitude, 2),
      unit: "km",
      icon: FiZap,
    },
    {
      label: "Velocity",
      value: formatValue(satellite?.velocity, 3),
      unit: "km/s",
      icon: FiActivity,
    },
    {
      label: "Revolution at Epoch",
      value: formatValue(satellite?.revolutionAtEpoch),
      unit: "rev",
      icon: FiAperture,
    },
  ];

  return (
    <section
      className="
        w-full
        rounded-2xl
        border border-cyan-400/15
        bg-[#03101d]/90
        p-4
        shadow-[0_0_30px_rgba(0,180,255,0.04)]
        sm:p-5
        lg:p-6
      "
    >
      {/* =========================================================
          HEADER
         ========================================================= */}
      <div
        className="
          mb-5
          flex
          items-center
          gap-3
          border-b
          border-white/5
          pb-4
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
            border-cyan-400/25
            bg-cyan-400/8
            text-cyan-400
          "
        >
          <FiActivity size={18} />
        </div>

        <div className="min-w-0">
          <h2
            className="
              font-['Orbitron']
              text-sm
              font-semibold
              tracking-wide
              text-slate-100
              sm:text-base
            "
          >
            Orbital Parameters
          </h2>

          <p
            className="
              mt-0.5
              text-[10px]
              tracking-wide
              text-slate-500
              sm:text-xs
            "
          >
            TLE / SGP4 orbital data
          </p>
        </div>
      </div>

      {/* =========================================================
          PARAMETERS GRID
         ========================================================= */}
      <div
        className="
          grid
          grid-cols-1
          gap-3
          sm:grid-cols-2
          lg:grid-cols-3
          xl:grid-cols-4
        "
      >
        {parameters.map((parameter) => {
          const Icon = parameter.icon;

          return (
            <div
              key={parameter.label}
              className="
                group
                min-h-[104px]
                rounded-xl
                border
                border-cyan-400/10
                bg-[#061522]/80
                p-3
                transition-all
                duration-200
                hover:border-cyan-400/25
                hover:bg-[#081b2b]
              "
            >
              {/* Parameter heading */}
              <div className="flex items-start gap-3">
                <div
                  className="
                    mt-0.5
                    flex
                    h-8
                    w-8
                    shrink-0
                    items-center
                    justify-center
                    rounded-lg
                    border
                    border-cyan-400/15
                    bg-cyan-400/5
                    text-cyan-400
                    transition-colors
                    duration-200
                    group-hover:border-cyan-400/30
                    group-hover:bg-cyan-400/10
                  "
                >
                  <Icon size={15} />
                </div>

                <div className="min-w-0">
                  <p
                    className="
                      text-[10px]
                      font-medium
                      leading-4
                      text-slate-400
                    "
                  >
                    {parameter.label}
                  </p>

                  {/* Value */}
                  <div
                    className="
                      mt-1
                      flex
                      flex-wrap
                      items-baseline
                      gap-x-1.5
                      gap-y-0.5
                    "
                  >
                    <span
                      className="
                        font-['Orbitron']
                        text-sm
                        font-semibold
                        tracking-wide
                        text-slate-100
                        sm:text-[15px]
                      "
                    >
                      {parameter.value}
                    </span>

                    {parameter.unit && (
                      <span
                        className="
                          text-[9px]
                          text-slate-500
                          sm:text-[10px]
                        "
                      >
                        {parameter.unit}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default SatelliteOrbitalParameters;