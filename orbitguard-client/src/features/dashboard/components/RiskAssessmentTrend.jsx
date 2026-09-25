import { useMemo, useState } from "react";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  FiActivity,
  FiCalendar,
  FiChevronDown,
  FiDatabase,
} from "react-icons/fi";
import { motion } from "framer-motion";

/**
 * ================================================================
 * OrbitGuard AI — Risk Assessment Trend
 * ================================================================
 *
 * Presentation component for backend-provided daily risk
 * assessment trend analytics.
 *
 * Backend source:
 *
 * GET /api/dashboard?trendDays={days}
 *
 * DashboardResponse:
 *
 * {
 *   ...
 *   riskTrends: [
 *     {
 *       date: "2026-09-24",
 *       count: 8
 *     }
 *   ]
 * }
 *
 * Responsibilities:
 * - Display backend risk trend data
 * - Normalize date/count values for Recharts
 * - Display selected period
 * - Notify parent when the period changes
 * - Display loading / empty states
 *
 * This component does NOT:
 * - Call APIs
 * - Calculate risk
 * - Generate analytics
 * - Generate dummy data
 * - Modify backend values
 *
 * The Dashboard page owns API communication.
 * ================================================================
 */

const PERIOD_OPTIONS = [
  {
    value: "7d",
    days: 7,
    label: "Last 7 days",
  },
  {
    value: "30d",
    days: 30,
    label: "Last 30 days",
  },
  {
    value: "90d",
    days: 90,
    label: "Last 90 days",
  },
];

const DEFAULT_PERIOD = "7d";

const RiskAssessmentTrend = ({
  data = null,
  loading = false,
  selectedPeriod = DEFAULT_PERIOD,
  onPeriodChange,
}) => {
  const [isPeriodOpen, setIsPeriodOpen] = useState(false);

  const selectedOption =
    PERIOD_OPTIONS.find(
      (option) => option.value === selectedPeriod,
    ) ?? PERIOD_OPTIONS[0];

  /**
   * --------------------------------------------------------------
   * Backend risk trend data
   * --------------------------------------------------------------
   *
   * Real backend field:
   *
   * data.riskTrends
   *
   * Do not silently fall back to unrelated property names.
   * A contract mismatch should remain visible.
   */

  const trendData = useMemo(() => {
    if (!Array.isArray(data?.riskTrends)) {
      return [];
    }

    return data.riskTrends
      .filter((item) => item != null)
      .map(normalizeTrendItem)
      .filter((item) => item.date !== "");
  }, [data]);

  /**
   * --------------------------------------------------------------
   * Recharts data
   * --------------------------------------------------------------
   */

  const chartData = useMemo(
    () =>
      trendData.map((item) => ({
        ...item,
        label: formatChartDate(item.date),
      })),
    [trendData],
  );

  const hasData = chartData.length > 0;

  /**
   * --------------------------------------------------------------
   * Total assessments
   * --------------------------------------------------------------
   *
   * This is only a display aggregation of backend trend records.
   *
   * It is NOT used as a replacement for backend analytics.
   */

  const totalAssessments = useMemo(() => {
    if (!hasData) {
      return null;
    }

    return chartData.reduce(
      (total, item) => total + item.count,
      0,
    );
  }, [chartData, hasData]);

  /**
   * --------------------------------------------------------------
   * Period selection
   * --------------------------------------------------------------
   */

  const handlePeriodSelect = (period) => {
    setIsPeriodOpen(false);

    if (
      period === selectedPeriod ||
      typeof onPeriodChange !== "function"
    ) {
      return;
    }

    onPeriodChange(period);
  };

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
        ease: "easeOut",
      }}
      aria-labelledby="risk-assessment-trend-title"
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
          w-32
          bg-gradient-to-r
          from-cyan-300/70
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
          flex-col
          gap-4
          border-b
          border-white/[0.055]
          px-4
          py-4
          sm:flex-row
          sm:items-start
          sm:justify-between
          sm:px-5
          sm:py-5
        "
      >
        <div className="min-w-0">
          <div className="flex items-center gap-2.5">
            <div
              className="
                flex
                h-8
                w-8
                shrink-0
                items-center
                justify-center
                border
                border-cyan-300/15
                bg-cyan-400/[0.05]
              "
            >
              <FiActivity
                className="h-3.5 w-3.5 text-cyan-300"
                aria-hidden="true"
              />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2
                  id="risk-assessment-trend-title"
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
                  Risk Assessment Trend
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
                  Analytics
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
                Daily collision-risk assessment activity for the
                selected observation period.
              </p>
            </div>
          </div>
        </div>

        {/* =======================================================
            PERIOD SELECTOR
            ======================================================= */}

        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() =>
              setIsPeriodOpen((current) => !current)
            }
            aria-haspopup="listbox"
            aria-expanded={isPeriodOpen}
            className="
              flex
              min-w-[145px]
              items-center
              justify-between
              gap-3
              border
              border-white/[0.08]
              bg-[#081522]/90
              px-3
              py-2
              text-left
              transition
              duration-200
              hover:border-cyan-300/20
              hover:bg-[#0a1928]
              focus:outline-none
              focus:ring-1
              focus:ring-cyan-300/30
            "
          >
            <span className="flex items-center gap-2">
              <FiCalendar
                className="h-3 w-3 text-cyan-300/80"
                aria-hidden="true"
              />

              <span
                className="
                  font-['Orbitron']
                  text-[8px]
                  font-medium
                  uppercase
                  tracking-[0.12em]
                  text-slate-300
                "
              >
                {selectedOption.label}
              </span>
            </span>

            <FiChevronDown
              className={`
                h-3
                w-3
                text-slate-500
                transition-transform
                duration-200
                ${isPeriodOpen ? "rotate-180" : ""}
              `}
              aria-hidden="true"
            />
          </button>

          {isPeriodOpen && (
            <div
              role="listbox"
              aria-label="Assessment period"
              className="
                absolute
                right-0
                top-[calc(100%+6px)]
                z-30
                min-w-full
                overflow-hidden
                border
                border-white/[0.09]
                bg-[#07121f]
                p-1
                shadow-2xl
              "
            >
              {PERIOD_OPTIONS.map((option) => {
                const isSelected =
                  option.value === selectedPeriod;

                return (
                  <button
                    key={option.value}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() =>
                      handlePeriodSelect(option.value)
                    }
                    className={`
                      flex
                      w-full
                      items-center
                      justify-between
                      gap-4
                      px-3
                      py-2
                      text-left
                      transition
                      duration-150
                      ${
                        isSelected
                          ? "bg-cyan-400/[0.07] text-cyan-200"
                          : "text-slate-400 hover:bg-white/[0.04] hover:text-slate-200"
                      }
                    `}
                  >
                    <span
                      className="
                        font-['Inter']
                        text-[10px]
                      "
                    >
                      {option.label}
                    </span>

                    {isSelected && (
                      <span
                        className="
                          h-1.5
                          w-1.5
                          rounded-full
                          bg-cyan-300
                          shadow-[0_0_7px_rgba(103,232,249,0.8)]
                        "
                        aria-hidden="true"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* =========================================================
          CHART
          ========================================================= */}

      <div
        className="
          relative
          h-[290px]
          px-2
          pb-2
          pt-5
          sm:h-[315px]
          sm:px-4
          sm:pt-6
        "
      >
        {loading ? (
          <ChartLoadingState />
        ) : hasData ? (
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <ComposedChart
              data={chartData}
              margin={{
                top: 8,
                right: 10,
                left: -18,
                bottom: 4,
              }}
            >
              <defs>
                <linearGradient
                  id="riskTrendBarGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor="#22d3ee"
                    stopOpacity={0.55}
                  />

                  <stop
                    offset="100%"
                    stopColor="#0e7490"
                    stopOpacity={0.16}
                  />
                </linearGradient>
              </defs>

              <CartesianGrid
                vertical={false}
                stroke="rgba(148,163,184,0.07)"
                strokeDasharray="2 5"
              />

              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{
                  fill: "#64748b",
                  fontSize: 9,
                  fontFamily: "Inter",
                }}
                tickMargin={10}
                minTickGap={18}
              />

              <YAxis
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
                width={38}
                tick={{
                  fill: "#475569",
                  fontSize: 9,
                  fontFamily: "Orbitron",
                }}
              />

              <Tooltip
                cursor={{
                  fill: "rgba(34,211,238,0.035)",
                }}
                content={<RiskTrendTooltip />}
              />

              <Bar
                dataKey="count"
                name="Assessments"
                fill="url(#riskTrendBarGradient)"
                radius={[2, 2, 0, 0]}
                maxBarSize={32}
                animationDuration={700}
              />

              <Line
                type="monotone"
                dataKey="count"
                stroke="#67e8f9"
                strokeWidth={1.5}
                dot={{
                  r: 2.5,
                  fill: "#67e8f9",
                  stroke: "#06101c",
                  strokeWidth: 1.5,
                }}
                activeDot={{
                  r: 4,
                  fill: "#67e8f9",
                  stroke: "#08202d",
                  strokeWidth: 2,
                }}
                animationDuration={800}
              />
            </ComposedChart>
          </ResponsiveContainer>
        ) : (
          <ChartEmptyState />
        )}
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
          gap-4
          border-t
          border-white/[0.045]
          px-4
          py-3
          sm:px-5
        "
      >
        <div className="flex min-w-0 items-center gap-2">
          <FiDatabase
            className="h-3 w-3 shrink-0 text-slate-600"
            aria-hidden="true"
          />

          <span
            className="
              truncate
              font-['Inter']
              text-[9px]
              text-slate-600
            "
          >
            Collision risk assessment activity
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <span
            className="
              font-['Orbitron']
              text-[8px]
              uppercase
              tracking-[0.12em]
              text-slate-600
            "
          >
            Total
          </span>

          <span
            className="
              font-['Orbitron']
              text-[10px]
              font-semibold
              tabular-nums
              text-slate-400
            "
          >
            {totalAssessments !== null
              ? totalAssessments
              : "—"}
          </span>
        </div>
      </div>
    </motion.section>
  );
};

/* ===============================================================
   BACKEND → UI NORMALIZATION
   =============================================================== */

const normalizeTrendItem = (item) => {
  const rawCount = Number(item?.count);

  return {
    date:
      typeof item?.date === "string"
        ? item.date
        : "",
    count:
      Number.isFinite(rawCount) && rawCount >= 0
        ? rawCount
        : 0,
  };
};

/* ===============================================================
   TOOLTIP
   =============================================================== */

const RiskTrendTooltip = ({
  active,
  payload,
  label,
}) => {
  if (
    !active ||
    !Array.isArray(payload) ||
    payload.length === 0
  ) {
    return null;
  }

  const value = payload[0]?.value;

  return (
    <div
      className="
        border
        border-cyan-300/15
        bg-[#06111f]/95
        px-3
        py-2.5
        shadow-xl
        backdrop-blur-md
      "
    >
      <p
        className="
          font-['Orbitron']
          text-[8px]
          uppercase
          tracking-[0.12em]
          text-slate-500
        "
      >
        {label || "Assessment"}
      </p>

      <div className="mt-1.5 flex items-center gap-2">
        <span
          className="
            h-1.5
            w-1.5
            rounded-full
            bg-cyan-300
            shadow-[0_0_7px_rgba(103,232,249,0.8)]
          "
        />

        <span
          className="
            font-['Orbitron']
            text-xs
            font-semibold
            tabular-nums
            text-cyan-200
          "
        >
          {value ?? "—"}
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
    </div>
  );
};

/* ===============================================================
   EMPTY STATE
   =============================================================== */

const ChartEmptyState = () => (
  <div
    className="
      flex
      h-full
      flex-col
      items-center
      justify-center
      px-6
      text-center
    "
  >
    <div
      className="
        flex
        h-11
        w-11
        items-center
        justify-center
        border
        border-cyan-300/10
        bg-cyan-400/[0.035]
      "
    >
      <FiActivity
        className="h-4 w-4 text-cyan-300/45"
        aria-hidden="true"
      />
    </div>

    <p
      className="
        mt-4
        font-['Orbitron']
        text-[9px]
        font-semibold
        uppercase
        tracking-[0.16em]
        text-slate-500
      "
    >
      Assessment history unavailable
    </p>

    <p
      className="
        mt-2
        max-w-[280px]
        font-['Inter']
        text-[10px]
        leading-4
        text-slate-600
      "
    >
      No risk-assessment trend records were returned by the
      dashboard analytics service for this period.
    </p>
  </div>
);

/* ===============================================================
   LOADING STATE
   =============================================================== */

const ChartLoadingState = () => (
  <div
    className="
      flex
      h-full
      flex-col
      justify-end
      gap-3
      px-5
      pb-8
    "
    aria-label="Loading risk assessment trend"
  >
    <div
      className="
        flex
        h-[220px]
        items-end
        justify-between
        gap-2
      "
    >
      {[36, 58, 42, 76, 52, 68, 45].map(
        (height, index) => (
          <div
            key={index}
            className="
              w-full
              animate-pulse
              bg-cyan-300/[0.05]
            "
            style={{
              height: `${height}%`,
            }}
          />
        ),
      )}
    </div>

    <div
      className="
        h-px
        w-full
        animate-pulse
        bg-white/[0.06]
      "
    />
  </div>
);

/* ===============================================================
   DATE FORMATTER
   =============================================================== */

const formatChartDate = (dateValue) => {
  if (!dateValue) {
    return "";
  }

  const parsedDate = new Date(
    `${dateValue}T00:00:00`,
  );

  if (Number.isNaN(parsedDate.getTime())) {
    return String(dateValue);
  }

  return parsedDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

export default RiskAssessmentTrend;