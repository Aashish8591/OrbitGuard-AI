import PropTypes from "prop-types";

import {
  FaArrowUpRightFromSquare,
  FaCircle,
  FaEllipsisVertical,
  FaSatellite,
} from "react-icons/fa6";

/**
 * ================================================================
 * OrbitGuard AI - Satellite Table
 * ================================================================
 *
 * Presentation component for the Satellite Registry.
 *
 * Visible table columns:
 * - Satellite
 * - NORAD ID
 * - Object ID
 * - Mean Motion
 * - Inclination
 * - Altitude
 * - Velocity
 * - Status
 * - Active
 * - Epoch
 * - Actions
 *
 * Hidden ONLY from UI:
 * - Eccentricity
 * - Classification
 *
 * IMPORTANT:
 * These fields are NOT removed from:
 * - Backend
 * - MongoDB
 * - API response
 * - Entity
 * - PropTypes
 *
 * FONT SYSTEM:
 * - Orbitron: headings, labels, system identifiers
 * - Inter: readable text and numeric telemetry
 * - tabular-nums: consistent numeric alignment
 *
 * SATELLITE IMAGES:
 * - Images are loaded from /public/images/satellite/
 * - Seven satellite images are available
 * - Image selection is deterministic
 * - Same satellite keeps the same image after re-render
 *
 * This component:
 * - does NOT call Axios
 * - does NOT call satelliteService
 * - does NOT fetch backend data
 * - does NOT perform backend filtering
 * - does NOT calculate orbital business values
 *
 * Parent/container owns data fetching and state.
 * ================================================================
 */


/* ================================================================
   SATELLITE IMAGE CONFIGURATION
================================================================ */

/**
 * Store these files inside:
 *
 * public/images/satellite/
 *
 * satellite-01.png
 * satellite-02.png
 * satellite-03.png
 * satellite-04.png
 * satellite-05.png
 * satellite-06.png
 * satellite-07.png
 */

const SATELLITE_IMAGES = [
  "/images/satellite/satellite-01.png",
  "/images/satellite/satellite-02.png",
  "/images/satellite/satellite-03.png",
  "/images/satellite/satellite-04.png",
  "/images/satellite/satellite-05.png",
  "/images/satellite/satellite-06.png",
  "/images/satellite/satellite-07.png",
];


/**
 * Returns a stable image for a satellite.
 *
 * We intentionally DO NOT use Math.random().
 *
 * Math.random() would cause the image to potentially change
 * whenever the component re-renders.
 *
 * Instead, the satellite ID / NORAD ID is converted into
 * a deterministic index.
 */
const getSatelliteImage = (satellite) => {
  const identifier =
    satellite?.id ??
    satellite?.noradCatalogId ??
    satellite?.satelliteCode ??
    satellite?.satelliteName ??
    "default-satellite";

  const identifierString = String(identifier);

  let hash = 0;

  for (let index = 0; index < identifierString.length; index += 1) {
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

/**
 * Format backend LocalDateTime / date values.
 */
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


/**
 * Format numeric backend values.
 *
 * Inter is used for numbers because it provides
 * cleaner and more readable telemetry digits.
 */
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


/**
 * Format orbital angle.
 */
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
  onViewSatellite,
  onEditSatellite,
}) => {
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


        {/* RECORD COUNT */}

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
          TABLE CONTAINER
      =========================================================== */}

      <div className="overflow-x-auto">

        <table
          className="
            w-full
            min-w-[1250px]
            border-collapse
          "
        >

          {/* ========================================================
              TABLE HEAD
          ========================================================= */}

          <thead>
            <tr className="bg-slate-900/35">

              {/* SATELLITE */}

              <TableHeader>
                SATELLITE
              </TableHeader>


              {/* NORAD */}

              <TableHeader>
                NORAD
                <br />
                ID
              </TableHeader>


              {/* OBJECT ID */}

              <TableHeader>
                OBJECT ID
              </TableHeader>


              {/* MEAN MOTION */}

              <TableHeader align="right">
                MEAN
                <br />
                MOTION
              </TableHeader>


              {/* ==================================================
                  ECCENTRICITY INTENTIONALLY HIDDEN
              =================================================== */}


              {/* ==================================================
                  CLASSIFICATION INTENTIONALLY HIDDEN
              =================================================== */}


              {/* INCLINATION */}

              <TableHeader align="right">
                INCLINATION
              </TableHeader>


              {/* ALTITUDE */}

              <TableHeader align="right">
                ALTITUDE
              </TableHeader>


              {/* VELOCITY */}

              <TableHeader align="right">
                VELOCITY
              </TableHeader>


              {/* STATUS */}

              <TableHeader>
                STATUS
              </TableHeader>


              {/* ACTIVE */}

              <TableHeader>
                ACTIVE
              </TableHeader>


              {/* EPOCH */}

              <TableHeader>
                EPOCH
              </TableHeader>


              {/* ACTIONS */}

              <TableHeader
                align="right"
                sticky
              >
                ACTIONS
              </TableHeader>

            </tr>
          </thead>


          {/* ========================================================
              TABLE BODY
          ========================================================= */}

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
                          className="
                            px-4
                            py-4
                          "
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
                    className="
                      px-6
                      py-20
                      text-center
                    "
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
              satellites.map((satellite) => {

                const satelliteName =
                  satellite.satelliteName ??
                  "Unnamed Satellite";

                const satelliteImage =
                  getSatelliteImage(satellite);

                return (
                  <tr
                    key={satellite.id}
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
                          onViewSatellite?.(satellite)
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

                        {/* SATELLITE IMAGE */}

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


                        {/* SATELLITE INFORMATION */}

                        <div className="min-w-0">

                          {/* SATELLITE NAME */}

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


                          {/* SATELLITE CODE */}

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


                    {/* ==================================================
                        NORAD ID
                    =================================================== */}

                    <td className="px-4 py-4">

                      <span
                        className="
                          whitespace-nowrap
                          font-['Inter']
                          tabular-nums
                          text-[11px]
                          font-medium
                          tracking-[0.02em]
                          text-slate-300
                        "
                      >
                        {satellite.noradCatalogId ?? "—"}
                      </span>

                    </td>


                    {/* ==================================================
                        OBJECT ID
                    =================================================== */}

                    <td className="px-4 py-4">

                      <span
                        className="
                          whitespace-nowrap
                          font-['Inter']
                          tabular-nums
                          text-[10px]
                          font-medium
                          tracking-[0.01em]
                          text-slate-400
                        "
                      >
                        {satellite.objectId ?? "—"}
                      </span>

                    </td>


                    {/* ==================================================
                        MEAN MOTION
                    =================================================== */}

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


                    {/* ==================================================
                        ECCENTRICITY REMOVED FROM UI
                    =================================================== */}


                    {/* ==================================================
                        CLASSIFICATION REMOVED FROM UI
                    =================================================== */}


                    {/* ==================================================
                        INCLINATION
                    =================================================== */}

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


                    {/* ==================================================
                        ALTITUDE
                    =================================================== */}

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


                    {/* ==================================================
                        VELOCITY
                    =================================================== */}

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


                    {/* ==================================================
                        MISSION STATUS
                    =================================================== */}

                    <td className="px-4 py-4">

                      <MissionStatusBadge
                        status={
                          satellite.missionStatus
                        }
                      />

                    </td>


                    {/* ==================================================
                        ACTIVE
                    =================================================== */}

                    <td className="px-4 py-4">

                      <ActiveBadge
                        active={satellite.active}
                      />

                    </td>


                    {/* ==================================================
                        EPOCH
                    =================================================== */}

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
                        ACTIONS
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

                      <div
                        className="
                          flex
                          justify-end
                          gap-1
                        "
                      >

                        {/* VIEW */}

                        <button
                          type="button"
                          onClick={() =>
                            onViewSatellite?.(
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


                        {/* EDIT / MORE */}

                        <button
                          type="button"
                          onClick={() =>
                            onEditSatellite?.(
                              satellite
                            )
                          }
                          title="Edit satellite"
                          aria-label={`Edit ${satelliteName}`}
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
                            hover:border-slate-600
                            hover:bg-slate-800
                            hover:text-slate-200
                            focus:outline-none
                            focus:ring-2
                            focus:ring-slate-600
                          "
                        >
                          <FaEllipsisVertical
                            className="text-[11px]"
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

      /* Identity */

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


      /* CelesTrak / TLE */

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


      /* Kept in API contract even though hidden from table */

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


      /* Propagation */

      altitude: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
      ]),

      velocity: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
      ]),


      /* State */

      missionStatus: PropTypes.string,

      active: PropTypes.bool,


      /* Timestamps */

      createdAt: PropTypes.string,

      updatedAt: PropTypes.string,
    })
  ),

  isLoading: PropTypes.bool,

  onViewSatellite: PropTypes.func,

  onEditSatellite: PropTypes.func,
};


export default SatelliteTable;