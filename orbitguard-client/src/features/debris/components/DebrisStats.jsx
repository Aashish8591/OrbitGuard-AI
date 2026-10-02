import PropTypes from "prop-types";
import {
  FaMeteor,
  FaCheckCircle,
  FaPauseCircle,
  FaExclamationCircle,
} from "react-icons/fa";

/**
 * ================================================================
 * OrbitGuard AI - Debris Statistics
 * ================================================================
 *
 * Presentation component for the Debris Registry.
 *
 * DATA FLOW
 * ----------------------------------------------------------------
 *
 * Spring Boot backend
 *        ↓
 * debrisService
 *        ↓
 * DebrisOverviewPage
 *        ↓
 * DebrisStats
 *
 * IMPORTANT
 * ----------------------------------------------------------------
 * This component does NOT:
 *
 * - call the backend
 * - calculate registry statistics
 * - calculate statistics from the current page
 * - generate fake backend values
 *
 * All statistics must be supplied by the parent.
 *
 * The values are expected to represent the COMPLETE debris
 * registry, not only the currently paginated records.
 * ================================================================
 */

const DebrisStats = ({ stats, isLoading = false }) => {
  /* ============================================================
     NORMALIZE BACKEND DATA
  ============================================================ */

  const safeStats = {
    total: normalizeNumber(stats?.total),
    active: normalizeNumber(stats?.active),
    inactive: normalizeNumber(stats?.inactive),
    decommissioned: normalizeNumber(
      stats?.decommissioned,
    ),

    totalChange: stats?.totalChange ?? null,
    activeChange: stats?.activeChange ?? null,
    inactiveChange: stats?.inactiveChange ?? null,
    decommissionedChange:
      stats?.decommissionedChange ?? null,

    totalChart: stats?.totalChart ?? [],
    activeChart: stats?.activeChart ?? [],
    inactiveChart: stats?.inactiveChart ?? [],
    decommissionedChart:
      stats?.decommissionedChart ?? [],
  };

  /* ============================================================
     STAT CARDS
  ============================================================ */

  const statCards = [
    {
      id: "total",
      label: "TOTAL DEBRIS",
      value: safeStats.total,
      change: safeStats.totalChange,
      icon: FaMeteor,
      iconWrapper:
        "bg-cyan-500/10 border-cyan-400/20",
      iconColor: "text-cyan-400",
      accent: "cyan",
      chart: safeStats.totalChart,
    },

    {
      id: "active",
      label: "ACTIVE",
      value: safeStats.active,
      change: safeStats.activeChange,
      icon: FaCheckCircle,
      iconWrapper:
        "bg-emerald-500/10 border-emerald-400/20",
      iconColor: "text-emerald-400",
      accent: "emerald",
      chart: safeStats.activeChart,
    },

    {
      id: "inactive",
      label: "INACTIVE",
      value: safeStats.inactive,
      change: safeStats.inactiveChange,
      icon: FaPauseCircle,
      iconWrapper:
        "bg-amber-500/10 border-amber-400/20",
      iconColor: "text-amber-400",
      accent: "amber",
      chart: safeStats.inactiveChart,
    },

    {
      id: "decommissioned",
      label: "DECOMMISSIONED",
      value: safeStats.decommissioned,
      change: safeStats.decommissionedChange,
      icon: FaExclamationCircle,
      iconWrapper:
        "bg-red-500/10 border-red-400/20",
      iconColor: "text-red-400",
      accent: "red",
      chart: safeStats.decommissionedChart,
    },
  ];

  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <section
      aria-label="Debris registry statistics"
      aria-busy={isLoading}
      className="
        grid
        grid-cols-1
        gap-4
        sm:grid-cols-2
        xl:grid-cols-4
      "
    >
      {statCards.map((card) => {
        const Icon = card.icon;

        return (
          <article
            key={card.id}
            className="
              group
              relative
              overflow-hidden
              rounded-xl
              border
              border-slate-800/80
              bg-slate-950/70
              px-5
              py-4
              backdrop-blur-xl
              transition-all
              duration-300
              hover:-translate-y-0.5
              hover:border-slate-700
              hover:bg-slate-900/80
            "
          >
            {/* ==================================================
                TOP GLOW
            ================================================== */}

            <div
              aria-hidden="true"
              className={`
                pointer-events-none
                absolute
                -top-16
                right-0
                h-32
                w-32
                rounded-full
                opacity-10
                blur-3xl
                transition-opacity
                duration-300
                group-hover:opacity-20

                ${
                  card.accent === "cyan"
                    ? "bg-cyan-400"
                    : card.accent === "emerald"
                      ? "bg-emerald-400"
                      : card.accent === "amber"
                        ? "bg-amber-400"
                        : "bg-red-400"
                }
              `}
            />

            <div className="relative flex items-center justify-between gap-4">
              {/* ==================================================
                  LEFT CONTENT
              ================================================== */}

              <div className="flex min-w-0 items-center gap-4">
                {/* ==================================================
                    ICON
                ================================================== */}

                <div
                  aria-hidden="true"
                  className={`
                    flex
                    h-12
                    w-12
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    border
                    ${card.iconWrapper}

                    ${
                      isLoading
                        ? "animate-pulse"
                        : ""
                    }
                  `}
                >
                  <Icon
                    className={`text-lg ${card.iconColor}`}
                  />
                </div>

                {/* ==================================================
                    VALUE
                ================================================== */}

                <div className="min-w-0">
                  <p
                    className="
                      font-['Orbitron']
                      text-[10px]
                      font-medium
                      tracking-[0.12em]
                      text-slate-400
                    "
                  >
                    {card.label}
                  </p>

                  <div className="mt-1 flex items-end gap-3">
                    <span
                      className={`
                        font-['Orbitron']
                        text-2xl
                        font-semibold
                        leading-none
                        tracking-wide
                        text-white

                        ${
                          isLoading
                            ? "animate-pulse"
                            : ""
                        }
                      `}
                    >
                      {isLoading
                        ? "—"
                        : formatStatValue(card.value)}
                    </span>

                    {!isLoading && card.change && (
                      <StatChange
                        change={card.change}
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* ==================================================
                  TELEMETRY
              ================================================== */}

              <MiniTelemetryChart
                data={card.chart}
                accent={card.accent}
                isLoading={isLoading}
              />
            </div>
          </article>
        );
      })}
    </section>
  );
};

/* ================================================================
   STAT CHANGE
================================================================ */

/**
 * Change values are optional.
 *
 * They should only be supplied when the backend actually provides
 * a meaningful comparison period.
 *
 * We do NOT invent change percentages on the frontend.
 */

const StatChange = ({ change }) => {
  if (
    !change ||
    change.value === null ||
    change.value === undefined ||
    change.value === ""
  ) {
    return null;
  }

  const direction =
    change.direction === "up"
      ? "↗"
      : change.direction === "down"
        ? "↘"
        : "→";

  const colorClass =
    change.type === "negative"
      ? "text-red-400"
      : change.type === "warning"
        ? "text-amber-400"
        : "text-emerald-400";

  return (
    <span
      className={`
        mb-0.5
        whitespace-nowrap
        font-['Inter']
        text-[10px]
        font-medium
        ${colorClass}
      `}
    >
      {direction} {change.value}
    </span>
  );
};

/* ================================================================
   MINI TELEMETRY CHART
================================================================ */

/**
 * IMPORTANT
 * ----------------------------------------------------------------
 * This chart is decorative unless real historical statistics are
 * supplied by the backend.
 *
 * If no backend chart data exists, the chart is not rendered.
 *
 * This avoids presenting generated numbers as real analytics.
 */

const MiniTelemetryChart = ({
  data,
  accent,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div
        className="
          hidden
          h-10
          w-16
          shrink-0
          items-end
          justify-end
          gap-[2px]
          sm:flex
        "
        aria-hidden="true"
      >
        {[18, 25, 20, 30, 24, 34].map(
          (height, index) => (
            <span
              key={`loading-${index}`}
              className="
                w-[3px]
                rounded-t-sm
                bg-slate-700
                animate-pulse
              "
              style={{
                height: `${height}%`,
              }}
            />
          ),
        )}
      </div>
    );
  }

  /**
   * Only render the chart when actual data was supplied.
   */
  if (!Array.isArray(data) || data.length === 0) {
    return null;
  }

  const barColor =
    accent === "cyan"
      ? "bg-cyan-400"
      : accent === "emerald"
        ? "bg-emerald-400"
        : accent === "amber"
          ? "bg-amber-400"
          : "bg-red-400";

  return (
    <div
      className="
        hidden
        h-10
        w-16
        shrink-0
        items-end
        justify-end
        gap-[2px]
        sm:flex
      "
      aria-hidden="true"
    >
      {data.map((height, index) => (
        <span
          key={`${index}-${height}`}
          className={`
            w-[3px]
            rounded-t-sm
            ${barColor}
            opacity-60
            transition-all
            duration-300
            group-hover:opacity-80
          `}
          style={{
            height: `${Math.max(
              8,
              Math.min(Number(height) || 8, 48),
            )}%`,
          }}
        />
      ))}
    </div>
  );
};

/* ================================================================
   VALUE NORMALIZER
================================================================ */

const normalizeNumber = (value) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return 0;
  }

  const numericValue = Number(value);

  return Number.isFinite(numericValue)
    ? numericValue
    : 0;
};

/* ================================================================
   VALUE FORMATTER
================================================================ */

const formatStatValue = (value) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "0";
  }

  if (typeof value === "number") {
    return new Intl.NumberFormat("en-US").format(
      value,
    );
  }

  return value;
};

/* ================================================================
   PROP TYPES
================================================================ */

const changePropType = PropTypes.shape({
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]),

  direction: PropTypes.oneOf([
    "up",
    "down",
  ]),

  type: PropTypes.oneOf([
    "positive",
    "negative",
    "warning",
  ]),
});

DebrisStats.propTypes = {
  stats: PropTypes.shape({
    total: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.string,
    ]),

    active: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.string,
    ]),

    inactive: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.string,
    ]),

    decommissioned: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.string,
    ]),

    totalChange: changePropType,
    activeChange: changePropType,
    inactiveChange: changePropType,
    decommissionedChange: changePropType,

    totalChart: PropTypes.arrayOf(
      PropTypes.number,
    ),

    activeChart: PropTypes.arrayOf(
      PropTypes.number,
    ),

    inactiveChart: PropTypes.arrayOf(
      PropTypes.number,
    ),

    decommissionedChart: PropTypes.arrayOf(
      PropTypes.number,
    ),
  }).isRequired,

  isLoading: PropTypes.bool,
};

export default DebrisStats;