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
 * Presentation-only component.
 *
 * IMPORTANT:
 * This component does NOT calculate statistics.
 *
 * All values must come from DebrisOverviewPage.
 *
 * Therefore:
 *
 * Backend aggregate statistics
 *          ↓
 * DebrisOverviewPage
 *          ↓
 * DebrisStats
 *
 * The values represent the COMPLETE debris registry,
 * not only the currently paginated page.
 *
 * IMPORTANT:
 * The structure and visual design intentionally follow
 * SatelliteStats so both registry pages remain consistent.
 * ================================================================
 */

const DebrisStats = ({ stats }) => {
  const statCards = [
    {
      id: "total",
      label: "TOTAL DEBRIS",
      value: stats.total,
      change: stats.totalChange,
      icon: FaMeteor,
      iconWrapper: "bg-cyan-500/10 border-cyan-400/20",
      iconColor: "text-cyan-400",
      accent: "cyan",
      chart: stats.totalChart,
    },
    {
      id: "active",
      label: "ACTIVE",
      value: stats.active,
      change: stats.activeChange,
      icon: FaCheckCircle,
      iconWrapper: "bg-emerald-500/10 border-emerald-400/20",
      iconColor: "text-emerald-400",
      accent: "emerald",
      chart: stats.activeChart,
    },
    {
      id: "inactive",
      label: "INACTIVE",
      value: stats.inactive,
      change: stats.inactiveChange,
      icon: FaPauseCircle,
      iconWrapper: "bg-amber-500/10 border-amber-400/20",
      iconColor: "text-amber-400",
      accent: "amber",
      chart: stats.inactiveChart,
    },
    {
      id: "decommissioned",
      label: "DECOMMISSIONED",
      value: stats.decommissioned,
      change: stats.decommissionedChange,
      icon: FaExclamationCircle,
      iconWrapper: "bg-red-500/10 border-red-400/20",
      iconColor: "text-red-400",
      accent: "red",
      chart: stats.decommissionedChart,
    },
  ];

  return (
    <section
      aria-label="Debris registry statistics"
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
            {/* ====================================================
                TOP GLOW
            ===================================================== */}

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
                  LEFT
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
                      className="
                        font-['Orbitron']
                        text-2xl
                        font-semibold
                        leading-none
                        tracking-wide
                        text-white
                      "
                    >
                      {formatStatValue(card.value)}
                    </span>

                    {card.change && (
                      <span
                        className={`
                          mb-0.5
                          whitespace-nowrap
                          font-['Inter']
                          text-[10px]
                          font-medium

                          ${
                            card.change.type === "negative"
                              ? "text-red-400"
                              : card.change.type === "warning"
                                ? "text-amber-400"
                                : "text-emerald-400"
                          }
                        `}
                      >
                        {card.change.direction === "up"
                          ? "↗"
                          : "↘"}{" "}
                        {card.change.value}
                      </span>
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
              />
            </div>
          </article>
        );
      })}
    </section>
  );
};

/**
 * ================================================================
 * MINI TELEMETRY CHART
 * ================================================================
 *
 * Decorative only.
 *
 * It is NOT presented as historical backend analytics.
 * ================================================================
 */

const MiniTelemetryChart = ({ data, accent }) => {
  const bars =
    Array.isArray(data) && data.length > 0
      ? data
      : [18, 25, 15, 31, 22, 38, 27, 44, 34, 48, 30, 40];

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
      {bars.map((height, index) => (
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

/**
 * ================================================================
 * VALUE FORMATTER
 * ================================================================
 */

const formatStatValue = (value) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "0";
  }

  if (typeof value === "number") {
    return new Intl.NumberFormat("en-US").format(value);
  }

  return value;
};

/**
 * ================================================================
 * PROP TYPES
 * ================================================================
 */

const changePropType = PropTypes.shape({
  value: PropTypes.string,
  direction: PropTypes.oneOf(["up", "down"]),
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

    totalChart: PropTypes.arrayOf(PropTypes.number),
    activeChart: PropTypes.arrayOf(PropTypes.number),
    inactiveChart: PropTypes.arrayOf(PropTypes.number),
    decommissionedChart: PropTypes.arrayOf(
      PropTypes.number,
    ),
  }).isRequired,
};

export default DebrisStats;