import React from "react";
import {
  FiActivity,
  FiCheckCircle,
  FiClock,
  FiDatabase,
  FiRefreshCw,
} from "react-icons/fi";

/**
 * ================================================================
 * OrbitGuard AI - Satellite Status Card
 * ================================================================
 *
 * Displays the current operational / record status of a satellite.
 *
 * Backend source:
 * SatelliteResponse
 *
 * Uses only:
 * - missionStatus
 * - active
 * - createdAt
 * - updatedAt
 *
 * No API calls.
 * No calculations.
 * No dummy data.
 * ================================================================
 */

const SatelliteStatusCard = ({ satellite }) => {
  /**
   * --------------------------------------------------------------
   * Safe value helpers
   * --------------------------------------------------------------
   */

  const getDisplayValue = (value) => {
    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      return "—";
    }

    return String(value);
  };

  /**
   * --------------------------------------------------------------
   * Mission status
   * --------------------------------------------------------------
   */

  const missionStatus =
    satellite?.missionStatus;

  const normalizedMissionStatus =
    typeof missionStatus === "string"
      ? missionStatus.toUpperCase()
      : "";

  const missionStatusLabel =
    normalizedMissionStatus || "UNKNOWN";

  /**
   * --------------------------------------------------------------
   * Active state
   * --------------------------------------------------------------
   */

  const isActive =
    satellite?.active === true;

  /**
   * --------------------------------------------------------------
   * Date formatter
   * --------------------------------------------------------------
   *
   * Backend returns LocalDateTime.
   *
   * Example:
   * 2026-09-30T09:20:15
   *
   * We display it in a readable UTC-style format.
   * --------------------------------------------------------------
   */

  const formatDateTime = (value) => {
    if (!value) {
      return "—";
    }

    try {
      const date = new Date(value);

      if (Number.isNaN(date.getTime())) {
        return value;
      }

      return date.toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
        timeZone: "UTC",
      }) + " UTC";
    } catch {
      return value;
    }
  };

  /**
   * --------------------------------------------------------------
   * Status presentation
   * --------------------------------------------------------------
   */

  const missionStatusIsActive =
    normalizedMissionStatus === "ACTIVE";

  const missionStatusIsInactive =
    normalizedMissionStatus === "INACTIVE";

  const missionStatusIsDecommissioned =
    normalizedMissionStatus === "DECOMMISSIONED";

  let statusClass =
    "border-slate-400/20 bg-slate-400/5 text-slate-400";

  let StatusIcon = FiActivity;

  if (missionStatusIsActive) {
    statusClass =
      "border-emerald-400/25 bg-emerald-400/10 text-emerald-400";

    StatusIcon = FiCheckCircle;
  } else if (missionStatusIsInactive) {
    statusClass =
      "border-amber-400/25 bg-amber-400/10 text-amber-400";

    StatusIcon = FiClock;
  } else if (missionStatusIsDecommissioned) {
    statusClass =
      "border-red-400/25 bg-red-400/10 text-red-400";

    StatusIcon = FiActivity;
  }

  return (
    <section
      className="
        w-full
        rounded-2xl
        border
        border-cyan-400/15
        bg-[#03101d]/90
        p-4
        shadow-[0_0_30px_rgba(0,180,255,0.04)]
        sm:p-5
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
            Mission Status
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
            Current satellite operational state
          </p>
        </div>
      </div>

      {/* =========================================================
          STATUS CONTENT
         ========================================================= */}

      <div
        className="
          grid
          grid-cols-1
          gap-3
          sm:grid-cols-2
        "
      >
        {/* -------------------------------------------------------
             Mission Status
           ------------------------------------------------------- */}

        <div
          className="
            rounded-xl
            border
            border-white/5
            bg-[#061522]/80
            p-4
          "
        >
          <p
            className="
              mb-3
              text-[10px]
              font-medium
              uppercase
              tracking-wider
              text-slate-500
            "
          >
            Mission Status
          </p>

          <div
            className={`
              inline-flex
              items-center
              gap-2
              rounded-full
              border
              px-3
              py-1.5
              text-[10px]
              font-semibold
              tracking-wide
              ${statusClass}
            `}
          >
            <StatusIcon size={13} />

            <span>
              {missionStatusLabel}
            </span>
          </div>
        </div>

        {/* -------------------------------------------------------
             Active State
           ------------------------------------------------------- */}

        <div
          className="
            rounded-xl
            border
            border-white/5
            bg-[#061522]/80
            p-4
          "
        >
          <p
            className="
              mb-3
              text-[10px]
              font-medium
              uppercase
              tracking-wider
              text-slate-500
            "
          >
            Registry State
          </p>

          <div className="flex items-center gap-2">
            <span
              className={`
                h-2
                w-2
                rounded-full
                ${
                  isActive
                    ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)]"
                    : "bg-slate-500"
                }
              `}
            />

            <span
              className="
                text-sm
                font-medium
                text-slate-200
              "
            >
              {isActive
                ? "Active"
                : "Inactive"}
            </span>
          </div>
        </div>

        {/* -------------------------------------------------------
             Created At
           ------------------------------------------------------- */}

        <div
          className="
            rounded-xl
            border
            border-white/5
            bg-[#061522]/80
            p-4
          "
        >
          <div
            className="
              mb-2
              flex
              items-center
              gap-2
            "
          >
            <FiDatabase
              size={14}
              className="text-cyan-400"
            />

            <p
              className="
                text-[10px]
                font-medium
                uppercase
                tracking-wider
                text-slate-500
              "
            >
              Created At
            </p>
          </div>

          <p
            className="
              text-xs
              font-medium
              text-slate-300
              sm:text-sm
            "
          >
            {formatDateTime(
              satellite?.createdAt
            )}
          </p>
        </div>

        {/* -------------------------------------------------------
             Updated At
           ------------------------------------------------------- */}

        <div
          className="
            rounded-xl
            border
            border-white/5
            bg-[#061522]/80
            p-4
          "
        >
          <div
            className="
              mb-2
              flex
              items-center
              gap-2
            "
          >
            <FiRefreshCw
              size={14}
              className="text-cyan-400"
            />

            <p
              className="
                text-[10px]
                font-medium
                uppercase
                tracking-wider
                text-slate-500
              "
            >
              Last Updated
            </p>
          </div>

          <p
            className="
              text-xs
              font-medium
              text-slate-300
              sm:text-sm
            "
          >
            {formatDateTime(
              satellite?.updatedAt
            )}
          </p>
        </div>
      </div>
    </section>
  );
};

export default SatelliteStatusCard;