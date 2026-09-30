import React from "react";

/**
 * ================================================================
 * OrbitGuard AI - Satellite Information Card
 * ================================================================
 *
 * Displays core satellite identity and TLE metadata.
 *
 * Data source:
 * SatelliteResponse
 *
 * Fields used:
 * - satelliteName
 * - satelliteCode
 * - noradCatalogId
 * - objectId
 * - classificationType
 * - ephemerisType
 * - elementSetNumber
 * - revolutionAtEpoch
 * - epoch
 *
 * No API call is made inside this component.
 * ================================================================
 */

const SatelliteInformationCard = ({ satellite }) => {
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
          Satellite information unavailable.
        </p>
      </section>
    );
  }

  const {
    satelliteName,
    satelliteCode,
    noradCatalogId,
    objectId,
    classificationType,
    ephemerisType,
    elementSetNumber,
    revolutionAtEpoch,
    epoch,
  } = satellite;

  const valueOrNA = (value) => {
    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      return "N/A";
    }

    return value;
  };

  const formatEpoch = (value) => {
    if (!value) {
      return "N/A";
    }

    try {
      const date = new Date(value);

      if (Number.isNaN(date.getTime())) {
        return value;
      }

      return date.toISOString().replace("T", " ");
    } catch {
      return value;
    }
  };

  const formatClassification = (value) => {
    if (!value) {
      return "N/A";
    }

    const normalized = String(value).toUpperCase();

    if (normalized === "U") {
      return "U (Unclassified)";
    }

    return normalized;
  };

  return (
    <section
      className="
        overflow-hidden
        rounded-xl
        border border-cyan-400/15
        bg-[#020b16]
        shadow-[0_0_30px_rgba(0,0,0,0.18)]
      "
    >
      {/* ============================================================
          HEADER
          ============================================================ */}

      <div
        className="
          flex
          items-center
          gap-3
          border-b
          border-cyan-400/10
          px-5
          py-4
        "
      >
        {/* Icon */}
        <div
          className="
            flex
            h-8
            w-8
            shrink-0
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
            strokeWidth="1.7"
            className="h-4 w-4"
          >
            <circle cx="12" cy="12" r="8" />
            <circle cx="12" cy="12" r="3" />
            <path d="M12 4V2" />
            <path d="M12 22v-2" />
            <path d="M4 12H2" />
            <path d="M22 12h-2" />
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
            Satellite Information
          </h2>

          <p
            className="
              mt-0.5
              font-['Inter']
              text-[10px]
              text-slate-500
            "
          >
            Identity & orbital element metadata
          </p>
        </div>
      </div>

      {/* ============================================================
          INFORMATION
          ============================================================ */}

      <div className="px-5 py-3">

        {/* Satellite Name */}
        <InformationRow
          label="Satellite Name"
          value={valueOrNA(satelliteName)}
          emphasize
        />

        {/* Satellite Code */}
        <InformationRow
          label="Satellite Code"
          value={valueOrNA(satelliteCode)}
        />

        {/* NORAD */}
        <InformationRow
          label="NORAD Catalog ID"
          value={valueOrNA(noradCatalogId)}
          mono
        />

        {/* Object ID */}
        <InformationRow
          label="Object ID"
          value={valueOrNA(objectId)}
          mono
        />

        {/* Classification */}
        <InformationRow
          label="Classification Type"
          value={formatClassification(classificationType)}
        />

        {/* Ephemeris */}
        <InformationRow
          label="Ephemeris Type"
          value={valueOrNA(ephemerisType)}
        />

        {/* Element Set */}
        <InformationRow
          label="Element Set Number"
          value={valueOrNA(elementSetNumber)}
        />

        {/* Revolution */}
        <InformationRow
          label="Revolution at Epoch"
          value={valueOrNA(revolutionAtEpoch)}
        />

        {/* Epoch */}
        <InformationRow
          label="Epoch"
          value={formatEpoch(epoch)}
          mono
          last
        />

      </div>
    </section>
  );
};

/**
 * ================================================================
 * INFORMATION ROW
 * ================================================================
 */

const InformationRow = ({
  label,
  value,
  mono = false,
  emphasize = false,
  last = false,
}) => {
  return (
    <div
      className={`
        grid
        grid-cols-[minmax(125px,42%)_minmax(0,1fr)]
        items-center
        gap-3
        py-2.5
        ${
          !last
            ? "border-b border-cyan-400/[0.06]"
            : ""
        }
      `}
    >
      {/* Label */}
      <span
        className="
          min-w-0
          font-['Inter']
          text-[10px]
          font-medium
          text-slate-500
          sm:text-[11px]
        "
      >
        {label}
      </span>

      {/* Value */}
      <span
        title={String(value)}
        className={`
          min-w-0
          truncate
          font-['Inter']
          text-[10px]
          sm:text-[11px]
          ${
            emphasize
              ? "font-medium text-slate-200"
              : "text-slate-300"
          }
          ${
            mono
              ? "font-mono tracking-tight"
              : ""
          }
        `}
      >
        {value}
      </span>
    </div>
  );
};

export default SatelliteInformationCard;