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
 * Responsibilities:
 * - Display debris registry data
 * - Display synchronized debris imagery
 * - Navigate to debris detail page
 *
 * Navigation:
 * - View Debris -> /debris/:debrisId
 *
 * This component does NOT:
 * - call Axios
 * - call debrisService
 * - fetch backend data
 * - perform filtering
 * - calculate orbital values
 * - calculate debris status
 *
 * Parent/container owns debris data.
 *
 * Backend source of truth:
 * DebrisResponse
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
      (hash * 31 +
        identifierString.charCodeAt(index)) %
      DEBRIS_IMAGES.length;
  }

  return DEBRIS_IMAGES[
    Math.abs(hash) % DEBRIS_IMAGES.length
  ];
};


/* ================================================================
   DEBRIS STATUS BADGE
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

    DECAYED: {
      className:
        "border-amber-400/20 bg-amber-400/10 text-amber-300",
      dot: "text-amber-400",
      label: "DECAYED",
    },

    LOST_TRACK: {
      className:
        "border-red-400/20 bg-red-400/10 text-red-300",
      dot: "text-red-400",
      label: "LOST TRACK",
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
        whitespace-nowrap
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

DebrisStatusBadge.propTypes = {
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

const formatDate = (date) => {
  if (!date) {
    return "—";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return String(date);
  }

  return parsedDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
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
        "Cannot open debris detail: debris object is missing."
      );

      return;
    }

    /*
     * IMPORTANT:
     * Debris detail endpoint uses the backend MongoDB `id`.
     *
     * Do not silently replace it with NORAD ID.
     */
    const debrisId = item.id;

    if (
      debrisId === null ||
      debrisId === undefined ||
      debrisId === ""
    ) {
      console.warn(
        "Cannot open debris detail: debris.id is missing.",
        item
      );

      return;
    }

    const targetPath =
      `/debris/${encodeURIComponent(
        String(debrisId)
      )}`;

    console.log(
      "Opening debris detail:",
      targetPath,
      item
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
      =========================================================== */}

      <div className="overflow-x-auto">

        <table
          className="
            w-full
            min-w-[1400px]
            border-collapse
          "
        >

          <thead>

            <tr className="bg-slate-900/35">

              <TableHeader>
                DEBRIS
              </TableHeader>

              <TableHeader>
                NORAD
                <br />
                ID
              </TableHeader>

              <TableHeader>
                OBJECT
                <br />
                TYPE
              </TableHeader>

              <TableHeader>
                ORBIT
                <br />
                TYPE
              </TableHeader>

              <TableHeader align="right">
                SIZE
              </TableHeader>

              <TableHeader align="right">
                MASS
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
                LAUNCH
                <br />
                DATE
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
                      length: 12,
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
              debris.length === 0 && (
                <tr>

                  <td
                    colSpan={12}
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
                        No debris records match the
                        current search or filter criteria.
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

                /*
                 * Prefer backend ID for React key.
                 * Fall back only for rendering safety.
                 */
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
                          min-w-[245px]
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
                          >
                            {item.debrisCode ??
                              "NO CODE"}
                          </p>

                        </div>

                      </button>

                    </td>


                    {/* NORAD ID */}

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
                        {item.noradId ?? "—"}
                      </span>

                    </td>


                    {/* OBJECT TYPE */}

                    <td className="px-4 py-4">

                      <span
                        className="
                          whitespace-nowrap
                          font-['Orbitron']
                          text-[9px]
                          font-medium
                          tracking-[0.04em]
                          text-slate-400
                        "
                      >
                        {item.objectType ?? "—"}
                      </span>

                    </td>


                    {/* ORBIT TYPE */}

                    <td className="px-4 py-4">

                      <span
                        className="
                          whitespace-nowrap
                          font-['Orbitron']
                          text-[9px]
                          font-medium
                          tracking-[0.04em]
                          text-cyan-300/80
                        "
                      >
                        {item.orbitType ?? "—"}
                      </span>

                    </td>


                    {/* SIZE */}

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
                          {formatNumber(item.size, 2)}
                        </span>

                        <span
                          className="
                            ml-1
                            font-['Inter']
                            text-[8px]
                            text-slate-500
                          "
                        >
                          m
                        </span>

                      </div>

                    </td>


                    {/* MASS */}

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
                          {formatNumber(item.mass, 1)}
                        </span>

                        <span
                          className="
                            ml-1
                            font-['Inter']
                            text-[8px]
                            text-slate-500
                          "
                        >
                          kg
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
                            item.altitude,
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
                            item.velocity,
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

                      <DebrisStatusBadge
                        status={item.status}
                      />

                    </td>


                    {/* ACTIVE */}

                    <td className="px-4 py-4">

                      <ActiveBadge
                        active={item.isActive}
                      />

                    </td>


                    {/* LAUNCH DATE */}

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
                        {formatDate(
                          item.launchDate
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
                            handleViewDebris(item)
                          }
                          title="View debris"
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

      id: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
      ]),

      debrisCode: PropTypes.string,

      debrisName: PropTypes.string,

      noradId: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
      ]),

      objectType: PropTypes.string,

      orbitType: PropTypes.string,

      country: PropTypes.string,

      size: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
      ]),

      mass: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
      ]),

      velocity: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
      ]),

      altitude: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
      ]),

      inclination: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
      ]),

      eccentricity: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
      ]),

      launchDate: PropTypes.string,

      description: PropTypes.string,

      status: PropTypes.string,

      isActive: PropTypes.bool,

      createdAt: PropTypes.string,

      updatedAt: PropTypes.string,
    })
  ),

  isLoading: PropTypes.bool,
};


export default DebrisTable;