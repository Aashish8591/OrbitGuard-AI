import { useMemo } from "react";
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { motion } from "framer-motion";
import {
  FiAlertCircle,
  FiAlertTriangle,
  FiCheckCircle,
  FiShield,
} from "react-icons/fi";

/**
 * ================================================================
 * OrbitGuard AI — Risk Level Panel
 * ================================================================
 *
 * Displays collision-risk assessment distribution supplied by
 * Dashboard Analytics.
 *
 * Backend contract:
 *
 * data.riskAnalytics.byRiskLevel
 *
 * Example:
 *
 * {
 *   riskAnalytics: {
 *     byRiskLevel: [
 *       {
 *         label: "HIGH",
 *         count: 3
 *       },
 *       {
 *         label: "MEDIUM",
 *         count: 7
 *       },
 *       {
 *         label: "LOW",
 *         count: 18
 *       }
 *     ]
 *   }
 * }
 *
 * This component:
 * - Reads backend risk analytics
 * - Normalizes labels for the fixed UI categories
 * - Calculates display percentages from backend counts
 *
 * This component does NOT:
 * - Call APIs
 * - Create risk records
 * - Calculate risk
 * - Generate demo values
 * - Modify backend analytics
 *
 * Dashboard.jsx owns backend communication.
 * ================================================================
 */

const RISK_DEFINITIONS = [
  {
    key: "high",
    label: "High",
    level: "HIGH",
    icon: FiAlertCircle,
    color: "#f87171",
    textClass: "text-red-300",
    borderClass: "border-red-300/15",
    backgroundClass: "bg-red-400/[0.05]",
  },
  {
    key: "medium",
    label: "Medium",
    level: "MEDIUM",
    icon: FiAlertTriangle,
    color: "#fbbf24",
    textClass: "text-amber-300",
    borderClass: "border-amber-300/15",
    backgroundClass: "bg-amber-400/[0.05]",
  },
  {
    key: "low",
    label: "Low",
    level: "LOW",
    icon: FiCheckCircle,
    color: "#22d3ee",
    textClass: "text-cyan-300",
    borderClass: "border-cyan-300/15",
    backgroundClass: "bg-cyan-400/[0.05]",
  },
];

const RiskLevelPanel = ({
  data = null,
  loading = false,
}) => {
  const normalizedData = useMemo(
    () => normalizeRiskData(data),
    [data],
  );

  const {
    total,
    distribution,
    hasData,
  } = normalizedData;

  return (
    <motion.section
      initial={{
        opacity: 0,
        y: 8,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.45,
        delay: 0.05,
        ease: "easeOut",
      }}
      aria-labelledby="risk-level-panel-title"
      className="
        relative
        h-full
        min-h-[390px]
        overflow-hidden
        border
        border-white/[0.08]
        bg-[#06101c]/90
        backdrop-blur-md
      "
    >
      {/* =========================================================
          TECHNICAL ACCENTS
          ========================================================= */}

      <div
        className="
          pointer-events-none
          absolute
          left-0
          top-0
          h-px
          w-24
          bg-gradient-to-r
          from-amber-300/60
          to-transparent
        "
        aria-hidden="true"
      />

      <div
        className="
          pointer-events-none
          absolute
          right-0
          top-0
          h-12
          w-12
          border-b
          border-l
          border-white/[0.035]
        "
        aria-hidden="true"
      />

      {/* =========================================================
          HEADER
          ========================================================= */}

      <div
        className="
          flex
          items-start
          justify-between
          gap-4
          border-b
          border-white/[0.055]
          px-4
          py-4
          sm:px-5
          sm:py-5
        "
      >
        <div className="flex min-w-0 items-center gap-3">
          <div
            className="
              flex
              h-8
              w-8
              shrink-0
              items-center
              justify-center
              border
              border-amber-300/15
              bg-amber-400/[0.05]
            "
          >
            <FiShield
              className="h-3.5 w-3.5 text-amber-300"
              aria-hidden="true"
            />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2
                id="risk-level-panel-title"
                className="
                  font-['Orbitron']
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-[0.18em]
                  text-slate-200
                  sm:text-[11px]
                "
              >
                Risk Levels
              </h2>

              <span
                className="
                  hidden
                  font-['Orbitron']
                  text-[7px]
                  uppercase
                  tracking-[0.15em]
                  text-slate-600
                  sm:inline
                "
              >
                Distribution
              </span>
            </div>

            <p
              className="
                mt-1.5
                font-['Inter']
                text-[10px]
                leading-4
                text-slate-500
                sm:text-[11px]
              "
            >
              Current collision-risk assessment distribution by
              severity.
            </p>
          </div>
        </div>

        <span
          className="
            shrink-0
            font-['Orbitron']
            text-[7px]
            uppercase
            tracking-[0.15em]
            text-slate-600
          "
        >
          RISK
        </span>
      </div>

      {/* =========================================================
          MAIN CONTENT
          ========================================================= */}

      <div
        className="
          grid
          min-h-[290px]
          grid-cols-1
          gap-4
          px-4
          py-5
          sm:grid-cols-[minmax(170px,0.9fr)_1fr]
          sm:items-center
          sm:px-5
          sm:py-6
        "
      >
        {/* =======================================================
            DONUT
            ======================================================= */}

        <div
          className="
            relative
            mx-auto
            flex
            h-[190px]
            w-full
            max-w-[210px]
            items-center
            justify-center
            sm:h-[220px]
            sm:max-w-[220px]
          "
        >
          {loading ? (
            <DonutLoadingState />
          ) : hasData ? (
            <>
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <PieChart>
                  <Pie
                    data={distribution}
                    dataKey="count"
                    nameKey="label"
                    cx="50%"
                    cy="50%"
                    innerRadius="64%"
                    outerRadius="82%"
                    paddingAngle={2}
                    startAngle={90}
                    endAngle={-270}
                    stroke="none"
                    isAnimationActive
                    animationDuration={800}
                  >
                    {distribution.map((item) => (
                      <Cell
                        key={item.key}
                        fill={item.color}
                        fillOpacity={0.82}
                      />
                    ))}
                  </Pie>

                  <Tooltip
                    content={<RiskTooltip />}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Center information */}
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
                    text-[7px]
                    uppercase
                    tracking-[0.17em]
                    text-slate-600
                  "
                >
                  Total
                </span>

                <span
                  className="
                    mt-1
                    font-['Orbitron']
                    text-2xl
                    font-semibold
                    leading-none
                    tabular-nums
                    text-slate-100
                    sm:text-3xl
                  "
                >
                  {total}
                </span>

                <span
                  className="
                    mt-1.5
                    font-['Inter']
                    text-[8px]
                    uppercase
                    tracking-[0.08em]
                    text-slate-600
                  "
                >
                  Assessments
                </span>
              </div>
            </>
          ) : (
            <DonutEmptyState />
          )}
        </div>

        {/* =======================================================
            RISK BREAKDOWN
            ======================================================= */}

        <div className="w-full">
          <div className="space-y-2.5">
            {RISK_DEFINITIONS.map((definition) => {
              const item = distribution.find(
                (entry) =>
                  entry.key === definition.key,
              );

              return (
                <RiskLevelRow
                  key={definition.key}
                  definition={definition}
                  count={item?.count ?? 0}
                  percentage={item?.percentage ?? 0}
                  disabled={!hasData}
                />
              );
            })}
          </div>

          {/* Overall status */}
          <div
            className="
              mt-5
              border-t
              border-white/[0.05]
              pt-4
            "
          >
            <div className="flex items-center justify-between gap-3">
              <span
                className="
                  font-['Inter']
                  text-[9px]
                  uppercase
                  tracking-[0.08em]
                  text-slate-600
                "
              >
                Distribution status
              </span>

              <span className="flex items-center gap-1.5">
                <span
                  className="
                    h-1.5
                    w-1.5
                    rounded-full
                    bg-cyan-300
                    shadow-[0_0_7px_rgba(103,232,249,0.6)]
                  "
                />

                <span
                  className="
                    font-['Orbitron']
                    text-[7px]
                    uppercase
                    tracking-[0.12em]
                    text-cyan-300/70
                  "
                >
                  {hasData
                    ? "Live dataset"
                    : "Awaiting data"}
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================
          FOOTER
          ========================================================= */}

      <div
        className="
          flex
          min-h-[50px]
          items-center
          justify-between
          gap-3
          border-t
          border-white/[0.045]
          px-4
          py-3
          sm:px-5
        "
      >
        <span
          className="
            font-['Inter']
            text-[9px]
            text-slate-600
          "
        >
          Severity classification
        </span>

        <span
          className="
            font-['Orbitron']
            text-[8px]
            uppercase
            tracking-[0.12em]
            text-slate-600
          "
        >
          ORBITGUARD / RISK
        </span>
      </div>
    </motion.section>
  );
};

/* ===============================================================
   RISK LEVEL ROW
   =============================================================== */

const RiskLevelRow = ({
  definition,
  count,
  percentage,
  disabled,
}) => {
  const Icon = definition.icon;

  return (
    <div
      className="
        border
        border-white/[0.055]
        bg-white/[0.015]
        p-3
        transition
        duration-200
        hover:border-white/[0.09]
        hover:bg-white/[0.025]
      "
    >
      <div className="flex items-center gap-3">
        <div
          className={`
            flex
            h-8
            w-8
            shrink-0
            items-center
            justify-center
            border
            ${definition.borderClass}
            ${definition.backgroundClass}
          `}
        >
          <Icon
            className={`
              h-3.5
              w-3.5
              ${definition.textClass}
            `}
            aria-hidden="true"
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <span
              className="
                font-['Orbitron']
                text-[8px]
                font-medium
                uppercase
                tracking-[0.12em]
                text-slate-400
              "
            >
              {definition.label}
            </span>

            <div className="flex items-baseline gap-2">
              <span
                className={`
                  font-['Orbitron']
                  text-sm
                  font-semibold
                  tabular-nums
                  ${
                    disabled
                      ? "text-slate-600"
                      : "text-slate-200"
                  }
                `}
              >
                {disabled ? "—" : count}
              </span>

              <span
                className="
                  font-['Inter']
                  text-[8px]
                  tabular-nums
                  text-slate-600
                "
              >
                {disabled
                  ? "—"
                  : `${percentage}%`}
              </span>
            </div>
          </div>

          <div
            className="
              mt-2
              h-1
              w-full
              overflow-hidden
              bg-white/[0.04]
            "
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{
                width: disabled
                  ? "0%"
                  : `${percentage}%`,
              }}
              transition={{
                duration: 0.7,
                ease: "easeOut",
              }}
              className="h-full"
              style={{
                backgroundColor:
                  definition.color,
                opacity: 0.65,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

/* ===============================================================
   TOOLTIP
   =============================================================== */

const RiskTooltip = ({
  active,
  payload,
}) => {
  if (
    !active ||
    !Array.isArray(payload) ||
    payload.length === 0
  ) {
    return null;
  }

  const item = payload[0]?.payload;

  if (!item) {
    return null;
  }

  return (
    <div
      className="
        border
        border-white/[0.09]
        bg-[#06111f]/95
        px-3
        py-2.5
        shadow-xl
        backdrop-blur-md
      "
    >
      <div className="flex items-center gap-2">
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{
            backgroundColor: item.color,
          }}
        />

        <span
          className="
            font-['Orbitron']
            text-[8px]
            uppercase
            tracking-[0.12em]
            text-slate-300
          "
        >
          {item.label}
        </span>
      </div>

      <div className="mt-1.5 flex items-baseline gap-2">
        <span
          className="
            font-['Orbitron']
            text-sm
            font-semibold
            tabular-nums
            text-slate-100
          "
        >
          {item.count}
        </span>

        <span
          className="
            font-['Inter']
            text-[9px]
            text-slate-500
          "
        >
          assessments
        </span>
      </div>

      <span
        className="
          mt-1
          block
          font-['Inter']
          text-[9px]
          text-slate-600
        "
      >
        {item.percentage}%
      </span>
    </div>
  );
};

/* ===============================================================
   EMPTY STATE
   =============================================================== */

const DonutEmptyState = () => (
  <div
    className="
      relative
      flex
      h-[155px]
      w-[155px]
      items-center
      justify-center
      rounded-full
      border
      border-dashed
      border-white/[0.08]
      sm:h-[175px]
      sm:w-[175px]
    "
  >
    <div
      className="
        flex
        h-[105px]
        w-[105px]
        items-center
        justify-center
        rounded-full
        border
        border-white/[0.045]
        bg-white/[0.01]
        sm:h-[120px]
        sm:w-[120px]
      "
    >
      <div className="text-center">
        <FiShield
          className="
            mx-auto
            h-4
            w-4
            text-slate-600
          "
          aria-hidden="true"
        />

        <span
          className="
            mt-2
            block
            font-['Orbitron']
            text-[7px]
            uppercase
            tracking-[0.13em]
            text-slate-600
          "
        >
          No Data
        </span>
      </div>
    </div>
  </div>
);

/* ===============================================================
   LOADING STATE
   =============================================================== */

const DonutLoadingState = () => (
  <div
    className="
      relative
      h-[165px]
      w-[165px]
      animate-pulse
      rounded-full
      border-[18px]
      border-white/[0.035]
      sm:h-[180px]
      sm:w-[180px]
    "
    aria-label="Loading risk distribution"
  >
    <div
      className="
        absolute
        inset-5
        rounded-full
        border
        border-white/[0.04]
      "
    />
  </div>
);

/* ===============================================================
   BACKEND → UI NORMALIZATION
   =============================================================== */

const normalizeRiskData = (data) => {
  const backendDistribution =
    data?.riskAnalytics?.byRiskLevel;

  if (!Array.isArray(backendDistribution)) {
    return {
      total: null,
      distribution: [],
      hasData: false,
    };
  }

  const distribution = RISK_DEFINITIONS.map(
    (definition) => {
      const matchingItem =
        backendDistribution.find((item) => {
          const label = String(
            item?.label ?? "",
          ).trim().toUpperCase();

          return label === definition.level;
        });

      const rawCount = Number(
        matchingItem?.count ?? 0,
      );

      const count =
        Number.isFinite(rawCount) && rawCount >= 0
          ? rawCount
          : 0;

      return {
        ...definition,
        count,
      };
    },
  );

  const total = distribution.reduce(
    (sum, item) => sum + item.count,
    0,
  );

  const hasData = total > 0;

  return {
    total: hasData ? total : null,
    distribution: distribution.map((item) => ({
      ...item,
      percentage:
        total > 0
          ? Number(
              ((item.count / total) * 100).toFixed(1),
            )
          : 0,
    })),
    hasData,
  };
};

export default RiskLevelPanel;