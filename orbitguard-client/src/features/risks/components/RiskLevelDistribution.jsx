import { useMemo } from "react";
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Activity } from "react-icons/fi";

/**
 * ==============================================================
 * Risk Level Distribution
 * ==============================================================
 *
 * Displays the distribution of active collision risk assessments
 * by risk level.
 *
 * Backend risk levels:
 * - LOW
 * - MEDIUM
 * - HIGH
 * - CRITICAL
 *
 * This is a presentational component.
 * Data must come from the Risk Overview page / backend layer.
 *
 * Expected data:
 *
 * {
 *   critical: number,
 *   high: number,
 *   medium: number,
 *   low: number
 * }
 *
 * Example:
 *
 * <RiskLevelDistribution
 *   data={{
 *     critical: 2,
 *     high: 5,
 *     medium: 8,
 *     low: 21
 *   }}
 * />
 *
 * ==============================================================
 */

const RISK_LEVELS = [
  {
    key: "critical",
    label: "Critical",
    color: "#ef4444",
    dotClass: "bg-red-500",
    textClass: "text-red-400",
  },
  {
    key: "high",
    label: "High",
    color: "#f97316",
    dotClass: "bg-orange-500",
    textClass: "text-orange-400",
  },
  {
    key: "medium",
    label: "Medium",
    color: "#eab308",
    dotClass: "bg-yellow-400",
    textClass: "text-yellow-400",
  },
  {
    key: "low",
    label: "Low",
    color: "#06b6d4",
    dotClass: "bg-cyan-400",
    textClass: "text-cyan-400",
  },
];

const EMPTY_DISTRIBUTION = {
  critical: 0,
  high: 0,
  medium: 0,
  low: 0,
};

function normalizeCount(value) {
  const number = Number(value);

  if (!Number.isFinite(number) || number < 0) {
    return 0;
  }

  return number;
}

function DistributionTooltip({ active, payload }) {
  if (!active || !payload?.length) {
    return null;
  }

  const item = payload[0];
  const data = item?.payload;

  if (!data) {
    return null;
  }

  return (
    <div className="rounded-lg border border-slate-700/80 bg-[#06111d]/95 px-3 py-2 shadow-xl backdrop-blur-md">
      <p className="font-['Orbitron'] text-[10px] uppercase tracking-[0.12em] text-slate-400">
        {data.label}
      </p>

      <p className="mt-1 font-['Inter'] text-sm font-semibold text-slate-100">
        {data.value} assessment{data.value === 1 ? "" : "s"}
      </p>

      <p className="font-['Inter'] text-[10px] text-slate-500">
        {data.percentage}% of active risks
      </p>
    </div>
  );
}

function RiskLevelDistribution({
  data = EMPTY_DISTRIBUTION,
  loading = false,
}) {
  const normalizedData = useMemo(() => {
    const safeData = data ?? EMPTY_DISTRIBUTION;

    const values = RISK_LEVELS.map((level) => ({
      ...level,
      value: normalizeCount(safeData[level.key]),
    }));

    const total = values.reduce(
      (sum, item) => sum + item.value,
      0,
    );

    return {
      total,
      items: values.map((item) => ({
        ...item,
        percentage:
          total > 0
            ? Number(((item.value / total) * 100).toFixed(1))
            : 0,
      })),
    };
  }, [data]);

  const hasData = normalizedData.total > 0;

  return (
    <section
      className="
        relative
        min-w-0
        overflow-hidden
        rounded-xl
        border border-cyan-500/20
        bg-[#03101c]/90
        shadow-[0_0_30px_rgba(0,180,255,0.04)]
        backdrop-blur-md
      "
      aria-label="Risk level distribution"
    >
      {/* -------------------------------------------------------
          Background atmosphere
      ------------------------------------------------------- */}
      <div
        className="
          pointer-events-none
          absolute
          inset-0
          bg-[radial-gradient(circle_at_20%_50%,rgba(0,200,255,0.07),transparent_38%)]
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          -right-16
          -top-20
          h-40
          w-40
          rounded-full
          bg-cyan-400/5
          blur-3xl
        "
      />

      {/* -------------------------------------------------------
          Header
      ------------------------------------------------------- */}
      <header
        className="
          relative
          flex
          items-center
          justify-between
          border-b
          border-slate-800/70
          px-4
          py-3
        "
      >
        <div className="flex min-w-0 items-center gap-2.5">
          <div
            className="
              flex
              h-7
              w-7
              shrink-0
              items-center
              justify-center
              rounded-md
              border
              border-cyan-400/20
              bg-cyan-400/5
              text-cyan-400
            "
          >
            <Activity size={13} />
          </div>

          <div className="min-w-0">
            <h2
              className="
                truncate
                font-['Orbitron']
                text-[10px]
                font-semibold
                uppercase
                tracking-[0.14em]
                text-slate-200
              "
            >
              Risk Level Distribution
            </h2>

            <p
              className="
                mt-0.5
                font-['Inter']
                text-[9px]
                uppercase
                tracking-[0.08em]
                text-slate-500
              "
            >
              Active collision assessments
            </p>
          </div>
        </div>

        <span
          className="
            hidden
            rounded-full
            border
            border-cyan-500/15
            bg-cyan-500/5
            px-2
            py-1
            font-['Orbitron']
            text-[8px]
            uppercase
            tracking-[0.12em]
            text-cyan-400/80
            sm:inline-flex
          "
        >
          Live Distribution
        </span>
      </header>

      {/* -------------------------------------------------------
          Content
      ------------------------------------------------------- */}
      <div className="relative p-3 sm:p-4">
        {loading ? (
          <DistributionSkeleton />
        ) : !hasData ? (
          <EmptyDistribution />
        ) : (
          <div
            className="
              grid
              grid-cols-1
              items-center
              gap-4
              sm:grid-cols-[minmax(150px,0.9fr)_minmax(130px,1fr)]
            "
          >
            {/* -------------------------------------------------
                Donut
            ------------------------------------------------- */}
            <div className="relative mx-auto h-[165px] w-full max-w-[190px]">
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <PieChart>
                  <Pie
                    data={normalizedData.items}
                    dataKey="value"
                    nameKey="label"
                    cx="50%"
                    cy="50%"
                    innerRadius="58%"
                    outerRadius="82%"
                    paddingAngle={2}
                    stroke="none"
                    isAnimationActive
                    animationDuration={700}
                  >
                    {normalizedData.items.map((item) => (
                      <Cell
                        key={item.key}
                        fill={item.color}
                      />
                    ))}
                  </Pie>

                  <Tooltip
                    content={<DistributionTooltip />}
                    cursor={false}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Center telemetry */}
              <div
                className="
                  pointer-events-none
                  absolute
                  inset-0
                  flex
                  flex-col
                  items-center
                  justify-center
                "
              >
                <span
                  className="
                    font-['Orbitron']
                    text-2xl
                    font-semibold
                    leading-none
                    text-slate-100
                  "
                >
                  {normalizedData.total}
                </span>

                <span
                  className="
                    mt-1
                    font-['Inter']
                    text-[9px]
                    uppercase
                    tracking-[0.16em]
                    text-slate-500
                  "
                >
                  Total
                </span>
              </div>
            </div>

            {/* -------------------------------------------------
                Legend / Breakdown
            ------------------------------------------------- */}
            <div className="space-y-2.5">
              {normalizedData.items.map((item) => (
                <div
                  key={item.key}
                  className="
                    group
                    flex
                    items-center
                    gap-2
                    rounded-md
                    px-1.5
                    py-1
                    transition-colors
                    hover:bg-white/[0.025]
                  "
                >
                  {/* Status dot */}
                  <span
                    className={`
                      h-2
                      w-2
                      shrink-0
                      rounded-full
                      ${item.dotClass}
                    `}
                  />

                  {/* Label */}
                  <span
                    className={`
                      min-w-0
                      flex-1
                      font-['Inter']
                      text-[10px]
                      font-medium
                      ${item.textClass}
                    `}
                  >
                    {item.label}
                  </span>

                  {/* Count */}
                  <span
                    className="
                      w-7
                      text-right
                      font-['Orbitron']
                      text-[10px]
                      font-medium
                      text-slate-300
                    "
                  >
                    {item.value}
                  </span>

                  {/* Percentage */}
                  <span
                    className="
                      w-11
                      text-right
                      font-['Inter']
                      text-[9px]
                      text-slate-500
                    "
                  >
                    {item.percentage}%
                  </span>
                </div>
              ))}

              {/* Distribution bar */}
              <div className="pt-2">
                <div
                  className="
                    flex
                    h-1.5
                    w-full
                    overflow-hidden
                    rounded-full
                    bg-slate-800/80
                  "
                  aria-label="Risk distribution bar"
                >
                  {normalizedData.items.map((item) => {
                    if (item.percentage <= 0) {
                      return null;
                    }

                    return (
                      <div
                        key={item.key}
                        className="h-full transition-all duration-700"
                        style={{
                          width: `${item.percentage}%`,
                          backgroundColor: item.color,
                        }}
                        title={`${item.label}: ${item.percentage}%`}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

/**
 * ==============================================================
 * Loading State
 * ==============================================================
 */

function DistributionSkeleton() {
  return (
    <div
      className="
        grid
        grid-cols-1
        items-center
        gap-4
        sm:grid-cols-[minmax(150px,0.9fr)_minmax(130px,1fr)]
      "
    >
      <div className="flex justify-center">
        <div
          className="
            h-[145px]
            w-[145px]
            animate-pulse
            rounded-full
            border-[25px]
            border-slate-800/80
          "
        />
      </div>

      <div className="space-y-4">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="flex items-center gap-2"
          >
            <div className="h-2 w-2 animate-pulse rounded-full bg-slate-800" />

            <div className="h-2 w-16 animate-pulse rounded bg-slate-800" />

            <div className="ml-auto h-2 w-6 animate-pulse rounded bg-slate-800" />

            <div className="h-2 w-8 animate-pulse rounded bg-slate-800" />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * ==============================================================
 * Empty State
 * ==============================================================
 */

function EmptyDistribution() {
  return (
    <div
      className="
        flex
        min-h-[165px]
        flex-col
        items-center
        justify-center
        text-center
      "
    >
      <div
        className="
          mb-3
          flex
          h-11
          w-11
          items-center
          justify-center
          rounded-full
          border
          border-slate-700
          bg-slate-900/60
          text-slate-500
        "
      >
        <Activity size={17} />
      </div>

      <p
        className="
          font-['Orbitron']
          text-[9px]
          uppercase
          tracking-[0.12em]
          text-slate-400
        "
      >
        No Risk Assessments
      </p>

      <p
        className="
          mt-1
          max-w-[220px]
          font-['Inter']
          text-[10px]
          leading-relaxed
          text-slate-600
        "
      >
        Risk distribution will appear after collision assessments
        are available.
      </p>
    </div>
  );
}

export default RiskLevelDistribution;