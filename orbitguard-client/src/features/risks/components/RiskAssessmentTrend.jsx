import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Activity } from "react-icons/fi";

/**
 * ============================================================
 * RiskAssessmentTrend
 * ============================================================
 *
 * Displays the number of collision-risk assessments over time,
 * grouped by backend RiskLevel:
 *
 *   CRITICAL
 *   HIGH
 *   MEDIUM
 *   LOW
 *
 * Responsibilities:
 * - Render the risk assessment trend chart
 * - Render chart legend
 * - Render loading state
 * - Render empty state
 * - Remain responsive
 *
 * This component does NOT:
 * - Call the backend
 * - Fetch risk data
 * - Calculate collision probability
 * - Calculate RiskLevel
 * - Perform pagination
 *
 * The parent page is responsible for preparing chart data.
 *
 * ============================================================
 */

const RISK_SERIES = [
  {
    key: "critical",
    label: "Critical",
    stroke: "#ef4444",
  },
  {
    key: "high",
    label: "High",
    stroke: "#f97316",
  },
  {
    key: "medium",
    label: "Medium",
    stroke: "#eab308",
  },
  {
    key: "low",
    label: "Low",
    stroke: "#06b6d4",
  },
];

/**
 * Expected data shape:
 *
 * [
 *   {
 *     date: "Sep 24",
 *     critical: 1,
 *     high: 3,
 *     medium: 4,
 *     low: 8
 *   },
 *   ...
 * ]
 */

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div
      className="
        min-w-[145px]
        overflow-hidden
        rounded-lg
        border border-cyan-400/20
        bg-[#061522]/95
        shadow-[0_10px_35px_rgba(0,0,0,0.45)]
        backdrop-blur-md
      "
    >
      <div
        className="
          border-b border-cyan-400/10
          px-3
          py-2
        "
      >
        <p
          className="
            font-['Orbitron']
            text-[8px]
            uppercase
            tracking-[0.12em]
            text-slate-300
          "
        >
          {label}
        </p>
      </div>

      <div className="space-y-1.5 px-3 py-2">
        {payload.map((item) => {
          const series = RISK_SERIES.find(
            (entry) => entry.key === item.dataKey
          );

          if (!series) {
            return null;
          }

          return (
            <div
              key={item.dataKey}
              className="
                flex
                items-center
                justify-between
                gap-5
              "
            >
              <div className="flex items-center gap-2">
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{
                    backgroundColor: series.stroke,
                  }}
                />

                <span
                  className="
                    font-['Inter']
                    text-[9px]
                    text-slate-400
                  "
                >
                  {series.label}
                </span>
              </div>

              <span
                className="
                  font-['Orbitron']
                  text-[9px]
                  font-semibold
                  text-slate-200
                "
              >
                {item.value}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function EmptyChartState() {
  return (
    <div
      className="
        absolute
        inset-0
        flex
        flex-col
        items-center
        justify-center
        px-6
      "
    >
      <div
        className="
          mb-3
          flex
          h-9
          w-9
          items-center
          justify-center
          rounded-lg
          border border-cyan-400/15
          bg-cyan-400/5
        "
      >
        <Activity
          size={16}
          className="text-cyan-500/70"
        />
      </div>

      <p
        className="
          font-['Orbitron']
          text-[9px]
          uppercase
          tracking-[0.12em]
          text-slate-500
        "
      >
        No assessment trend data
      </p>

      <p
        className="
          mt-1
          max-w-[240px]
          text-center
          font-['Inter']
          text-[9px]
          leading-relaxed
          text-slate-600
        "
      >
        Assessment history will appear here when risk
        records are available.
      </p>
    </div>
  );
}

function LoadingChartState() {
  return (
    <div
      className="
        absolute
        inset-0
        overflow-hidden
        px-5
        pb-5
        pt-8
      "
    >
      <div
        className="
          h-full
          w-full
          animate-pulse
          rounded-md
          bg-slate-800/20
        "
      />
    </div>
  );
}

export default function RiskAssessmentTrend({
  data = [],
  loading = false,
  dateRange = null,
}) {
  const hasData = Array.isArray(data) && data.length > 0;

  return (
    <section
      className="
        relative
        min-w-0
        overflow-hidden
        rounded-xl
        border border-cyan-400/20
        bg-[#04111d]/90
        shadow-[0_0_30px_rgba(0,180,255,0.05)]
      "
      aria-labelledby="risk-assessment-trend-title"
    >
      {/* ======================================================
          Header
      ======================================================= */}
      <div
        className="
          flex
          min-h-[58px]
          items-center
          justify-between
          gap-4
          border-b border-cyan-400/10
          px-4
          py-3
        "
      >
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2
              id="risk-assessment-trend-title"
              className="
                font-['Orbitron']
                text-[10px]
                font-semibold
                uppercase
                tracking-[0.16em]
                text-slate-200
                sm:text-[11px]
              "
            >
              Assessments Trend
            </h2>

            <span
              className="
                hidden
                h-1
                w-1
                rounded-full
                bg-cyan-400
                shadow-[0_0_6px_rgba(34,211,238,0.8)]
                sm:block
              "
            />
          </div>

          <p
            className="
              mt-0.5
              font-['Inter']
              text-[9px]
              text-slate-500
              sm:text-[10px]
            "
          >
            Collision-risk assessments over time
          </p>
        </div>

        {dateRange && (
          <div
            className="
              hidden
              shrink-0
              rounded-md
              border border-slate-700/50
              bg-slate-900/30
              px-2
              py-1
              sm:block
            "
          >
            <span
              className="
                font-['Inter']
                text-[8px]
                text-slate-500
              "
            >
              {dateRange}
            </span>
          </div>
        )}
      </div>

      {/* ======================================================
          Chart
      ======================================================= */}
      <div
        className="
          relative
          h-[215px]
          w-full
          px-2
          pb-3
          pt-4
          sm:h-[230px]
          sm:px-3
        "
      >
        {loading ? (
          <LoadingChartState />
        ) : !hasData ? (
          <EmptyChartState />
        ) : (
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <LineChart
              data={data}
              margin={{
                top: 8,
                right: 10,
                left: -18,
                bottom: 0,
              }}
            >
              <CartesianGrid
                stroke="rgba(100,116,139,0.12)"
                strokeDasharray="3 5"
                vertical={false}
              />

              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{
                  fill: "#64748b",
                  fontSize: 8,
                  fontFamily: "Inter",
                }}
                dy={6}
                minTickGap={12}
              />

              <YAxis
                allowDecimals={false}
                axisLine={false}
                tickLine={false}
                tick={{
                  fill: "#64748b",
                  fontSize: 8,
                  fontFamily: "Inter",
                }}
                width={30}
              />

              <Tooltip
                cursor={{
                  stroke: "rgba(34,211,238,0.18)",
                  strokeWidth: 1,
                  strokeDasharray: "4 4",
                }}
                content={<CustomTooltip />}
              />

              {RISK_SERIES.map((series) => (
                <Line
                  key={series.key}
                  type="monotone"
                  dataKey={series.key}
                  name={series.label}
                  stroke={series.stroke}
                  strokeWidth={1.8}
                  dot={{
                    r: 2.2,
                    strokeWidth: 0,
                    fill: series.stroke,
                  }}
                  activeDot={{
                    r: 4,
                    strokeWidth: 2,
                    stroke: "#04111d",
                    fill: series.stroke,
                  }}
                  connectNulls
                  isAnimationActive
                  animationDuration={700}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* ======================================================
          Legend
      ======================================================= */}
      <div
        className="
          flex
          flex-wrap
          items-center
          justify-center
          gap-x-4
          gap-y-2
          border-t border-cyan-400/10
          bg-black/10
          px-3
          py-2.5
        "
      >
        {RISK_SERIES.map((series) => (
          <div
            key={series.key}
            className="flex items-center gap-1.5"
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{
                backgroundColor: series.stroke,
                boxShadow: `0 0 6px ${series.stroke}`,
              }}
            />

            <span
              className="
                font-['Inter']
                text-[8px]
                text-slate-500
              "
            >
              {series.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}