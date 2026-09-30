import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";

import {
  FaArrowUpRightFromSquare,
  FaCircle,
  FaSatellite,
} from "react-icons/fa6";

/**
 * ================================================================
 * OrbitGuard AI - Satellite Table
 * ================================================================
 *
 * Responsibilities:
 * - Display satellite registry data
 * - Navigate to satellite detail page
 *
 * Navigation:
 * - View Satellite -> /satellites/:satelliteId
 *
 * Edit action:
 * - Removed intentionally
 *
 * This component does NOT:
 * - call Axios
 * - call satelliteService
 * - fetch backend data
 * - perform filtering
 * - calculate orbital values
 *
 * Parent/container owns satellite data.
 * ================================================================
 */


/* ================================================================
   SATELLITE IMAGE CONFIGURATION
================================================================ */

const SATELLITE_IMAGES = [
  "/images/satellite/satellite-01.png",
  "/images/satellite/satellite-02.png",
  "/images/satellite/satellite-03.png",
  "/images/satellite/satellite-04.png",
  "/images/satellite/satellite-05.png",
  "/images/satellite/satellite-06.png",
  "/images/satellite/satellite-07.png",
];


/* ================================================================
   SATELLITE IMAGE
================================================================ */

const getSatelliteImage = (satellite) => {
  const identifier =
    satellite?.id ??
    satellite?.noradCatalogId ??
    satellite?.satelliteCode ??
    satellite?.satelliteName ??
    "default-satellite";

  const identifierString = String(identifier);

  let hash = 0;

  for (
    let index = 0;
    index < identifierString.length;
    index += 1
  ) {
    hash =
      (hash * 31 +
        identifierString.charCodeAt(index)) %
      SATELLITE_IMAGES.length;
  }

  return SATELLITE_IMAGES[
    Math.abs(hash) % SATELLITE_IMAGES.length
  ];
};


/* ================================================================
   MISSION STATUS BADGE
================================================================ */

const MissionStatusBadge = ({ status }) => {
  const normalizedStatus =
    typeof status === "string"
      ? status.trim().toUpperCase()
      : "";

  const statusConfig = {
    ACTIVE: {
      className:
        "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
      dot: "text-emerald-400",
      label: "ACTIVE",
    },

    INACTIVE: {
      className:
        "border-amber-400/20 bg-amber-400/10 text-amber-300",
      dot: "text-amber-400",
      label: "INACTIVE",
    },

    DECOMMISSIONED: {
      className:
        "border-red-400/20 bg-red-400/10 text-red-300",
      dot: "text-red-400",
      label: "DECOMMISSIONED",
    },
  };

  const config =
    statusConfig[normalizedStatus] ?? {
      className:
        "border-slate-700 bg-slate-800/60 text-slate-400",
      dot: "text-slate-500",
      label: normalizedStatus || "UNKNOWN",
    };

  return (
    <span
      className={`
        inline-flex
        items-center
        gap-2
        rounded-md
        border
        px-2.5
        py-1
        font-['Orbitron']
        text-[9px]
        font-semibold
        tracking-[0.06em]
        ${config.className}
      `}
    >
      <FaCircle
        className={`text-[5px] ${config.dot}`}
        aria-hidden="true"
      />

      {config.label}
    </span>
  );
};

MissionStatusBadge.propTypes = {
  status: PropTypes.string,
};


/* ================================================================
   ACTIVE BADGE
================================================================ */

const ActiveBadge = ({ active }) => {
  if (active === true) {
    return (
      <span
        className="
          font-['Orbitron']
          text-[9px]
          font-semibold
          tracking-[0.06em]
          text-emerald-300
        "
      >
        YES
      </span>
    );
  }

  if (active === false) {
    return (
      <span
        className="
          font-['Orbitron']
          text-[9px]
          font-semibold
          tracking-[0.06em]
          text-slate-500
        "
      >
        NO
      </span>
    );
  }

  return (
    <span
      className="
        font-['Orbitron']
        text-[9px]
        font-semibold
        tracking-[0.06em]
        text-slate-600
      "
    >
      —
    </span>
  );
};

ActiveBadge.propTypes = {
  active: PropTypes.bool,
};


/* ================================================================
   FORMATTERS
================================================================ */

const formatDateTime = (date) => {
  if (!date) {
    return "—";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return String(date);
  }

  return parsedDate.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};


const formatNumber = (value, decimals = 1) => {
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

  return numericValue.toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
};


const formatAngle = (value, decimals = 2) => {
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

  return numericValue.toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
};


/* ================================================================
   TABLE HEADER
================================================================ */

const TableHeader = ({
  children,
  align = "left",
  sticky = false,
}) => {
  const alignmentClass =
    align === "right"
      ? "text-right"
      : "text-left";

  return (
    <th
      scope="col"
      className={`
        ${sticky ? "sticky right-0 z-30" : ""}
        ${alignmentClass}
        whitespace-nowrap
        border-b
        border-slate-800/80
        bg-slate-900
        px-4
        py-3
        font-['Orbitron']
        text-[9px]
        font-medium
        tracking-[0.08em]
        text-slate-500
        ${
          sticky
            ? "border-l border-slate-800/80 shadow-[-8px_0_18px_rgba(0,0,0,0.20)]"
            : ""
        }
      `}
    >
      {children}
    </th>
  );
};

TableHeader.propTypes = {
  children: PropTypes.node.isRequired,
  align: PropTypes.oneOf(["left", "right"]),
  sticky: PropTypes.bool,
};


/* ================================================================
   SATELLITE TABLE
================================================================ */

const SatelliteTable = ({
  satellites = [],
  isLoading = false,
}) => {
  const navigate = useNavigate();


  /* ==============================================================
     VIEW SATELLITE
  ============================================================== */

  const handleViewSatellite = (satellite) => {
    if (!satellite) {
      console.warn(
        "Cannot open satellite detail: satellite object is missing."
      );

      return;
    }

    /*
     * IMPORTANT:
     * The current route uses the backend satellite `id`.
     *
     * Do not silently fall back to NORAD here because the
     * detail endpoint must use the identifier expected by
     * SatelliteDetailPage / satelliteService.
     */
    const satelliteId = satellite.id;

    if (
      satelliteId === null ||
      satelliteId === undefined ||
      satelliteId === ""
    ) {
      console.warn(
        "Cannot open satellite detail: satellite.id is missing.",
        satellite
      );

      return;
    }

    const targetPath =
      `/satellites/${encodeURIComponent(
        String(satelliteId)
      )}`;

    console.log(
      "Opening satellite detail:",
      targetPath,
      satellite
    );

    navigate(targetPath);
  };


  return (
    <section
      className="
        w-full
        overflow-hidden
        rounded-xl
        border
        border-slate-800/80
        bg-slate-950/65
        shadow-[0_18px_60px_rgba(0,0,0,0.22)]
        backdrop-blur-xl
      "
      aria-label="Satellite registry"
    >

      {/* ==========================================================
          TABLE HEADER
      =========================================================== */}

      <div
        className="
          flex
          flex-col
          gap-2
          border-b
          border-slate-800/80
          px-5
          py-4
          sm:flex-row
          sm:items-center
          sm:justify-between
        "
      >

        <div className="flex items-center gap-3">

          <div
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-lg
              border
              border-cyan-400/20
              bg-cyan-400/10
              text-cyan-400
            "
          >
            <FaSatellite
              className="text-sm"
              aria-hidden="true"
            />
          </div>

          <div>

            <h2
              className="
                font-['Orbitron']
                text-xs
                font-semibold
                tracking-[0.08em]
                text-slate-200
              "
            >
              SATELLITE REGISTRY
            </h2>

            <p
              className="
                mt-1
                font-['Inter']
                text-[10px]
                text-slate-500
              "
            >
              Orbital assets synchronized with OrbitGuard
            </p>

          </div>

        </div>

        <div
          className="
            font-['Inter']
            tabular-nums
            text-[10px]
            font-medium
            tracking-[0.06em]
            text-slate-500
          "
        >
          {satellites.length} RECORD
          {satellites.length === 1 ? "" : "S"}
        </div>

      </div>


      {/* ==========================================================
          TABLE
      =========================================================== */}

      <div className="overflow-x-auto">

        <table
          className="
            w-full
            min-w-[1250px]
            border-collapse
          "
        >

          <thead>

            <tr className="bg-slate-900/35">

              <TableHeader>
                SATELLITE
              </TableHeader>

              <TableHeader>
                NORAD
                <br />
                ID
              </TableHeader>

              <TableHeader>
                OBJECT ID
              </TableHeader>

              <TableHeader align="right">
                MEAN
                <br />
                MOTION
              </TableHeader>

              <TableHeader align="right">
                INCLINATION
              </TableHeader>

              <TableHeader align="right">
                ALTITUDE
              </TableHeader>

              <TableHeader align="right">
                VELOCITY
              </TableHeader>

              <TableHeader>
                STATUS
              </TableHeader>

              <TableHeader>
                ACTIVE
              </TableHeader>

              <TableHeader>
                EPOCH
              </TableHeader>

              <TableHeader
                align="right"
                sticky
              >
                ACTIONS
              </TableHeader>

            </tr>

          </thead>


          <tbody>

            {/* ======================================================
                LOADING
            ======================================================= */}

            {isLoading &&
              Array.from({ length: 6 }).map(
                (_, rowIndex) => (
                  <tr
                    key={`skeleton-${rowIndex}`}
                    className="
                      border-b
                      border-slate-800/60
                    "
                  >

                    {Array.from({
                      length: 11,
                    }).map(
                      (_, cellIndex) => (
                        <td
                          key={`skeleton-cell-${cellIndex}`}
                          className="px-4 py-4"
                        >
                          <div
                            className="
                              h-4
                              animate-pulse
                              rounded
                              bg-slate-800/80
                            "
                          />
                        </td>
                      )
                    )}

                  </tr>
                )
              )}


            {/* ======================================================
                EMPTY
            ======================================================= */}

            {!isLoading &&
              satellites.length === 0 && (
                <tr>

                  <td
                    colSpan={11}
                    className="px-6 py-20 text-center"
                  >

                    <div
                      className="
                        mx-auto
                        flex
                        max-w-sm
                        flex-col
                        items-center
                      "
                    >

                      <div
                        className="
                          flex
                          h-14
                          w-14
                          items-center
                          justify-center
                          rounded-full
                          border
                          border-slate-700
                          bg-slate-900
                          text-slate-500
                        "
                      >
                        <FaSatellite
                          className="text-lg"
                          aria-hidden="true"
                        />
                      </div>

                      <h3
                        className="
                          mt-4
                          font-['Orbitron']
                          text-xs
                          font-semibold
                          tracking-[0.06em]
                          text-slate-300
                        "
                      >
                        NO SATELLITES FOUND
                      </h3>

                      <p
                        className="
                          mt-2
                          font-['Inter']
                          text-xs
                          leading-5
                          text-slate-500
                        "
                      >
                        No satellite records match the
                        current search or filter criteria.
                      </p>

                    </div>

                  </td>

                </tr>
              )}


            {/* ======================================================
                SATELLITE RECORDS
            ======================================================= */}

            {!isLoading &&
              satellites.map((satellite, index) => {

                const satelliteName =
                  satellite.satelliteName ??
                  "Unnamed Satellite";

                const satelliteImage =
                  getSatelliteImage(satellite);

                /*
                 * Prefer backend id for React key.
                 * Fall back only for rendering safety.
                 */
                const rowKey =
                  satellite.id ??
                  satellite.noradCatalogId ??
                  satellite.satelliteCode ??
                  `satellite-${index}`;

                return (
                  <tr
                    key={rowKey}
                    className="
                      group
                      border-b
                      border-slate-800/60
                      transition-colors
                      duration-200
                      hover:bg-cyan-400/[0.025]
                    "
                  >

                    {/* ==================================================
                        SATELLITE
                    =================================================== */}

                    <td className="px-5 py-4">

                      <button
                        type="button"
                        onClick={() =>
                          handleViewSatellite(
                            satellite
                          )
                        }
                        className="
                          flex
                          min-w-[230px]
                          items-center
                          gap-3
                          text-left
                          outline-none
                        "
                      >

                        <div
                          className="
                            flex
                            h-10
                            w-10
                            shrink-0
                            items-center
                            justify-center
                            overflow-hidden
                            rounded-lg
                            border
                            border-slate-700
                            bg-slate-900
                            p-1
                            transition-all
                            duration-200
                            group-hover:border-cyan-400/30
                            group-hover:bg-cyan-400/5
                          "
                        >

                          <img
                            src={satelliteImage}
                            alt={`${satelliteName} satellite`}
                            className="
                              h-full
                              w-full
                              object-contain
                              transition-transform
                              duration-300
                              group-hover:scale-110
                            "
                            loading="lazy"
                            draggable="false"
                          />

                        </div>

                        <div className="min-w-0">

                          <p
                            className="
                              truncate
                              font-['Inter']
                              text-xs
                              font-semibold
                              text-slate-200
                              transition-colors
                              group-hover:text-cyan-300
                            "
                          >
                            {satelliteName}
                          </p>

                          <p
                            className="
                              mt-1
                              truncate
                              font-['Orbitron']
                              text-[8px]
                              tracking-[0.08em]
                              text-slate-500
                            "
                          >
                            {satellite.satelliteCode ??
                              "NO CODE"}
                          </p>

                        </div>

                      </button>

                    </td>


                    {/* NORAD */}

                    <td className="px-4 py-4">
                      <span
                        className="
                          whitespace-nowrap
                          font-['Inter']
                          tabular-nums
                          text-[11px]
                          font-medium
                          text-slate-300
                        "
                      >
                        {satellite.noradCatalogId ?? "—"}
                      </span>
                    </td>


                    {/* OBJECT ID */}

                    <td className="px-4 py-4">
                      <span
                        className="
                          whitespace-nowrap
                          font-['Inter']
                          tabular-nums
                          text-[10px]
                          font-medium
                          text-slate-400
                        "
                      >
                        {satellite.objectId ?? "—"}
                      </span>
                    </td>


                    {/* MEAN MOTION */}

                    <td className="px-4 py-4 text-right">
                      <div className="whitespace-nowrap">

                        <span
                          className="
                            font-['Inter']
                            tabular-nums
                            text-[11px]
                            font-medium
                            text-slate-200
                          "
                        >
                          {formatNumber(
                            satellite.meanMotion,
                            4
                          )}
                        </span>

                        <span
                          className="
                            ml-1
                            font-['Inter']
                            text-[8px]
                            text-slate-500
                          "
                        >
                          rev/day
                        </span>

                      </div>
                    </td>


                    {/* INCLINATION */}

                    <td className="px-4 py-4 text-right">
                      <div className="whitespace-nowrap">

                        <span
                          className="
                            font-['Inter']
                            tabular-nums
                            text-[11px]
                            font-medium
                            text-slate-300
                          "
                        >
                          {formatAngle(
                            satellite.inclination,
                            3
                          )}
                        </span>

                        <span
                          className="
                            ml-1
                            font-['Inter']
                            text-[8px]
                            text-slate-500
                          "
                        >
                          °
                        </span>

                      </div>
                    </td>


                    {/* ALTITUDE */}

                    <td className="px-4 py-4 text-right">
                      <div className="whitespace-nowrap">

                        <span
                          className="
                            font-['Inter']
                            tabular-nums
                            text-[11px]
                            font-medium
                            text-slate-200
                          "
                        >
                          {formatNumber(
                            satellite.altitude,
                            0
                          )}
                        </span>

                        <span
                          className="
                            ml-1
                            font-['Inter']
                            text-[9px]
                            text-slate-500
                          "
                        >
                          km
                        </span>

                      </div>
                    </td>


                    {/* VELOCITY */}

                    <td className="px-4 py-4 text-right">
                      <div className="whitespace-nowrap">

                        <span
                          className="
                            font-['Inter']
                            tabular-nums
                            text-[11px]
                            font-medium
                            text-slate-200
                          "
                        >
                          {formatNumber(
                            satellite.velocity,
                            2
                          )}
                        </span>

                        <span
                          className="
                            ml-1
                            font-['Inter']
                            text-[9px]
                            text-slate-500
                          "
                        >
                          km/s
                        </span>

                      </div>
                    </td>


                    {/* STATUS */}

                    <td className="px-4 py-4">
                      <MissionStatusBadge
                        status={
                          satellite.missionStatus
                        }
                      />
                    </td>


                    {/* ACTIVE */}

                    <td className="px-4 py-4">
                      <ActiveBadge
                        active={satellite.active}
                      />
                    </td>


                    {/* EPOCH */}

                    <td className="px-4 py-4">
                      <span
                        className="
                          whitespace-nowrap
                          font-['Inter']
                          tabular-nums
                          text-[10px]
                          text-slate-400
                        "
                      >
                        {formatDateTime(
                          satellite.epoch
                        )}
                      </span>
                    </td>


                    {/* ==================================================
                        ACTION
                    =================================================== */}

                    <td
                      className="
                        sticky
                        right-0
                        z-20
                        min-w-[88px]
                        border-l
                        border-slate-800/80
                        bg-slate-950
                        px-4
                        py-4
                        shadow-[-8px_0_18px_rgba(0,0,0,0.20)]
                      "
                    >

                      <div className="flex justify-end">

                        <button
                          type="button"
                          onClick={() =>
                            handleViewSatellite(
                              satellite
                            )
                          }
                          title="View satellite"
                          aria-label={`View ${satelliteName}`}
                          className="
                            flex
                            h-8
                            w-8
                            items-center
                            justify-center
                            rounded-md
                            border
                            border-transparent
                            text-slate-500
                            transition-all
                            duration-200
                            hover:border-cyan-400/20
                            hover:bg-cyan-400/10
                            hover:text-cyan-300
                            focus:outline-none
                            focus:ring-2
                            focus:ring-cyan-400/30
                          "
                        >
                          <FaArrowUpRightFromSquare
                            className="text-[10px]"
                            aria-hidden="true"
                          />
                        </button>

                      </div>

                    </td>

                  </tr>
                );
              })}

          </tbody>

        </table>

      </div>


      {/* ============================================================
          MOBILE SCROLL INDICATOR
      ============================================================= */}

      <div
        className="
          border-t
          border-slate-800/60
          px-4
          py-2
          text-center
          lg:hidden
        "
      >
        <span
          className="
            font-['Inter']
            text-[9px]
            text-slate-600
          "
        >
          Swipe horizontally to view satellite telemetry
        </span>
      </div>

    </section>
  );
};


/* ================================================================
   PROPTYPES
================================================================ */

SatelliteTable.propTypes = {
  satellites: PropTypes.arrayOf(
    PropTypes.shape({

      id: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
      ]),

      satelliteName: PropTypes.string,

      satelliteCode: PropTypes.string,

      noradCatalogId: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
      ]),

      objectId: PropTypes.string,

      epoch: PropTypes.string,

      classificationType:
        PropTypes.string,

      ephemerisType: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
      ]),

      elementSetNumber: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
      ]),

      revolutionAtEpoch:
        PropTypes.oneOfType([
          PropTypes.string,
          PropTypes.number,
        ]),

      meanMotion: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
      ]),

      meanMotionDot: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
      ]),

      meanMotionDdot: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
      ]),

      eccentricity: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
      ]),

      inclination: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
      ]),

      rightAscensionOfAscendingNode:
        PropTypes.oneOfType([
          PropTypes.string,
          PropTypes.number,
        ]),

      argumentOfPericenter:
        PropTypes.oneOfType([
          PropTypes.string,
          PropTypes.number,
        ]),

      meanAnomaly: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
      ]),

      bstar: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
      ]),

      altitude: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
      ]),

      velocity: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
      ]),

      missionStatus: PropTypes.string,

      active: PropTypes.bool,

      createdAt: PropTypes.string,

      updatedAt: PropTypes.string,
    })
  ),

  isLoading: PropTypes.bool,
};


export default SatelliteTable;