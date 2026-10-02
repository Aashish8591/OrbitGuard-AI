import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";

import {
  FaArrowUpRightFromSquare,
  FaCircle,
  FaMeteor,
} from "react-icons/fa6";

/**
 * ================================================================
 * OrbitGuard AI - Debris Table
 * ================================================================
 *
 * Presentation-only component.
 *
 * Backend source of truth:
 *
 * GET /api/v1/debris
 *        ↓
 * DebrisResponse
 *        ↓
 * DebrisOverviewPage
 *        ↓
 * DebrisTable
 *
 * This component:
 * - DOES NOT call Axios
 * - DOES NOT fetch data
 * - DOES NOT calculate orbital values
 * - DOES NOT modify backend data
 *
 * Responsive behavior:
 * - Desktop/tablet: normal wide registry table
 * - Mobile: horizontal table scrolling
 * - ACTIONS column remains sticky on the right
 * - Table columns never squeeze into the mobile viewport
 *
 * ================================================================
 */

/* ================================================================
   DEBRIS IMAGE CONFIGURATION
================================================================ */

const DEBRIS_IMAGES = [
  "/images/debris/debris-01.png",
  "/images/debris/debris-02.png",
  "/images/debris/debris-03.png",
  "/images/debris/debris-04.png",
  "/images/debris/debris-05.png",
  "/images/debris/debris-06.png",
  "/images/debris/debris-07.png",
  "/images/debris/debris-08.png",
];

/* ================================================================
   DEBRIS IMAGE
================================================================ */

const getDebrisImage = (debris) => {
  const identifier =
    debris?.id ??
    debris?.noradId ??
    debris?.debrisCode ??
    debris?.debrisName ??
    "default-debris";

  const identifierString = String(identifier);

  let hash = 0;

  for (
    let index = 0;
    index < identifierString.length;
    index += 1
  ) {
    hash =
      (hash * 31 + identifierString.charCodeAt(index)) %
      DEBRIS_IMAGES.length;
  }

  return DEBRIS_IMAGES[
    Math.abs(hash) % DEBRIS_IMAGES.length
  ];
};

/* ================================================================
   STATUS BADGE
================================================================ */

const DebrisStatusBadge = ({ status }) => {
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
        max-w-full
        items-center
        gap-2
        whitespace-nowrap
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
      title={`Debris status: ${config.label}`}
      aria-label={`Debris status: ${config.label}`}
    >
      <FaCircle
        className={`shrink-0 text-[5px] ${config.dot}`}
        aria-hidden="true"
      />

      {config.label}
    </span>
  );
};

DebrisStatusBadge.propTypes = {
  status: PropTypes.string,
};

/* ================================================================
   GENERIC VALUE
================================================================ */

const displayValue = (value) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "—";
  }

  return String(value);
};

/* ================================================================
   NUMBER FORMATTER
================================================================ */

const formatNumber = (value, decimals = 2) => {
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
   DATE / TIME FORMATTER
================================================================ */

const formatDateTime = (value) => {
  if (!value) {
    return "—";
  }

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return String(value);
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
   DEBRIS TABLE
================================================================ */

const DebrisTable = ({
  debris = [],
  isLoading = false,
}) => {
  const navigate = useNavigate();

  /* ==============================================================
     VIEW DEBRIS
  ============================================================== */

  const handleViewDebris = (item) => {
    if (!item) {
      console.warn(
        "Cannot open debris detail: debris object is missing.",
      );

      return;
    }

    /*
     * Backend detail endpoint:
     *
     * GET /api/v1/debris/{id}
     *
     * MongoDB document ID is used for navigation.
     */
    const debrisId = item.id;

    if (
      debrisId === null ||
      debrisId === undefined ||
      debrisId === ""
    ) {
      console.warn(
        "Cannot open debris detail: backend debris.id is missing.",
        item,
      );

      return;
    }

    navigate(
      `/debris/${encodeURIComponent(
        String(debrisId),
      )}`,
    );
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
      aria-label="Debris registry"
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
            <FaMeteor
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
              DEBRIS REGISTRY
            </h2>

            <p
              className="
                mt-1
                font-['Inter']
                text-[10px]
                text-slate-500
              "
            >
              Orbital debris objects synchronized with OrbitGuard
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
          {debris.length} RECORD
          {debris.length === 1 ? "" : "S"}
        </div>
      </div>

      {/* ==========================================================
          TABLE

          IMPORTANT RESPONSIVE BEHAVIOR

          The table deliberately keeps a minimum width.

          On desktop:
          - table uses available width

          On mobile:
          - table does NOT squeeze
          - user can swipe horizontally
          - ACTIONS remains visible as sticky sidebar

          This follows the same responsive strategy as SatelliteTable.
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
              {/* 1 - DEBRIS */}

              <TableHeader>
                DEBRIS
              </TableHeader>

              {/* 2 - NORAD */}

              <TableHeader>
                NORAD
                <br />
                ID
              </TableHeader>

              {/* 3 - OBJECT ID */}

              <TableHeader>
                OBJECT ID
              </TableHeader>

              {/* 4 - MEAN MOTION */}

              <TableHeader align="right">
                MEAN
                <br />
                MOTION
              </TableHeader>

              {/* 5 - INCLINATION */}

              <TableHeader align="right">
                INCLINATION
              </TableHeader>

              {/* 6 - ALTITUDE */}

              <TableHeader align="right">
                ALTITUDE
              </TableHeader>

              {/* 7 - VELOCITY */}

              <TableHeader align="right">
                VELOCITY
              </TableHeader>

              {/* 8 - STATUS */}

              <TableHeader>
                STATUS
              </TableHeader>

              {/* 9 - EPOCH */}

              <TableHeader>
                EPOCH
              </TableHeader>

              {/* 10 - ACTIONS */}

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
                      length: 10,
                    }).map(
                      (_, cellIndex) => (
                        <td
                          key={`skeleton-cell-${rowIndex}-${cellIndex}`}
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
                      ),
                    )}
                  </tr>
                ),
              )}

            {/* ======================================================
                EMPTY
            ======================================================= */}

            {!isLoading &&
              debris.length === 0 && (
                <tr>
                  <td
                    colSpan={10}
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
                        <FaMeteor
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
                        NO DEBRIS FOUND
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
                        No debris records match the current
                        search or filter criteria.
                      </p>
                    </div>
                  </td>
                </tr>
              )}

            {/* ======================================================
                DEBRIS RECORDS
            ======================================================= */}

            {!isLoading &&
              debris.map((item, index) => {
                const debrisName =
                  item.debrisName ??
                  "Unnamed Debris";

                const debrisImage =
                  getDebrisImage(item);

                const rowKey =
                  item.id ??
                  item.noradId ??
                  item.debrisCode ??
                  `debris-${index}`;

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
                        DEBRIS
                    =================================================== */}

                    <td className="px-5 py-4">
                      <button
                        type="button"
                        onClick={() =>
                          handleViewDebris(item)
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
                            src={debrisImage}
                            alt={`${debrisName} debris`}
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
                            title={debrisName}
                          >
                            {debrisName}
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
                            title={
                              item.debrisCode ??
                              "NO CODE"
                            }
                          >
                            {item.debrisCode ??
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
                          text-slate-300
                        "
                        title={displayValue(item.noradId)}
                      >
                        {displayValue(item.noradId)}
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
                          text-slate-400
                        "
                        title={displayValue(item.objectId)}
                      >
                        {displayValue(item.objectId)}
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
                            item.meanMotion,
                            4,
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
                          {formatNumber(
                            item.inclination,
                            4,
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
                            item.altitude,
                            0,
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
                            item.velocity,
                            2,
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
                        STATUS
                    =================================================== */}

                    <td className="px-4 py-4">
                      <DebrisStatusBadge
                        status={item.status}
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
                        title={formatDateTime(item.epoch)}
                      >
                        {formatDateTime(item.epoch)}
                      </span>
                    </td>

                    {/* ==================================================
                        ACTION

                        IMPORTANT:
                        Sticky right column exactly like SatelliteTable.
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
                            handleViewDebris(item)
                          }
                          title="View debris details"
                          aria-label={`View ${debrisName}`}
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
          Swipe horizontally to view debris telemetry
        </span>
      </div>
    </section>
  );
};

/* ================================================================
   PROPTYPES
================================================================ */

DebrisTable.propTypes = {
  debris: PropTypes.arrayOf(
    PropTypes.shape({
      /* MongoDB document ID */
      id: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
      ]),

      /* Registry identity */
      debrisCode: PropTypes.string,
      debrisName: PropTypes.string,

      /* NORAD / orbital identity */
      noradId: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
      ]),

      objectId: PropTypes.string,

      /* TLE / orbital data */
      epoch: PropTypes.string,

      /* Detail-page TLE/orbital fields */
      classificationType: PropTypes.string,

      ephemerisType: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
      ]),

      elementSetNumber: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
      ]),

      revolutionAtEpoch: PropTypes.oneOfType([
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

      /* Calculated / synchronized orbital values */
      velocity: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
      ]),

      altitude: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
      ]),

      /* State */
      status: PropTypes.string,

      /* Audit */
      createdAt: PropTypes.string,
      updatedAt: PropTypes.string,
    }),
  ),

  isLoading: PropTypes.bool,
};

export default DebrisTable;