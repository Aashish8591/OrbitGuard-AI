import { FiArrowDown, FiArrowUp, FiMinus, FiTrendingUp } from "react-icons/fi";
import { motion, useReducedMotion } from "framer-motion";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
} from "recharts";

/**
 * ================================================================
 * OrbitGuard AI — Dashboard Stat Card
 * ================================================================
 *
 * Presentation-only KPI component.
 *
 * Responsibilities:
 * - Display a backend-provided KPI value
 * - Display an optional backend-provided trend
 * - Display optional backend-provided sparkline data
 * - Handle loading / unavailable states
 * - Provide accessible motion behaviour
 *
 * This component does NOT:
 * - Call APIs
 * - Calculate analytics
 * - Generate trend values
 * - Generate sparkline values
 * - Create fallback business data
 *
 * Backend remains the source of truth.
 * ================================================================
 */


/**
 * ================================================================
 * KPI VARIANTS
 * ================================================================
 */

const VARIANT_CONFIG = {
  cyan: {
    icon:
      "border-cyan-300/15 bg-cyan-400/[0.06] text-cyan-300",

    glow:
      "group-hover:border-cyan-300/25 group-hover:shadow-[0_0_30px_rgba(34,211,238,0.07)]",

    indicator:
      "bg-cyan-300",

    line:
      "#22d3ee",
  },

  blue: {
    icon:
      "border-blue-300/15 bg-blue-400/[0.06] text-blue-300",

    glow:
      "group-hover:border-blue-300/25 group-hover:shadow-[0_0_30px_rgba(59,130,246,0.07)]",

    indicator:
      "bg-blue-300",

    line:
      "#60a5fa",
  },

  warning: {
    icon:
      "border-amber-300/15 bg-amber-400/[0.06] text-amber-300",

    glow:
      "group-hover:border-amber-300/25 group-hover:shadow-[0_0_30px_rgba(245,158,11,0.07)]",

    indicator:
      "bg-amber-300",

    line:
      "#fbbf24",
  },

  danger: {
    icon:
      "border-red-300/15 bg-red-400/[0.06] text-red-300",

    glow:
      "group-hover:border-red-300/25 group-hover:shadow-[0_0_30px_rgba(248,113,113,0.07)]",

    indicator:
      "bg-red-300",

    line:
      "#f87171",
  },
};


/**
 * ================================================================
 * TREND VARIANTS
 * ================================================================
 */

const TREND_CONFIG = {
  up: {
    icon: FiArrowUp,
    className: "text-emerald-300",
    background:
      "border-emerald-400/10 bg-emerald-400/[0.05]",
  },

  down: {
    icon: FiArrowDown,
    className: "text-amber-300",
    background:
      "border-amber-400/10 bg-amber-400/[0.05]",
  },

  neutral: {
    icon: FiMinus,
    className: "text-slate-400",
    background:
      "border-slate-400/10 bg-slate-400/[0.04]",
  },
};


/**
 * ================================================================
 * VALUE HELPERS
 * ================================================================
 */

const hasValue = (value) => {
  return (
    value !== undefined &&
    value !== null &&
    value !== ""
  );
};


/**
 * ---------------------------------------------------------------
 * Format KPI value
 * ---------------------------------------------------------------
 *
 * Presentation-only formatting.
 *
 * Examples:
 *
 * 28       -> "28"
 * 113      -> "113"
 * 1000     -> "1,000"
 * null     -> "—"
 *
 * No analytics are calculated here.
 * ---------------------------------------------------------------
 */

const formatKpiValue = (value) => {
  if (!hasValue(value)) {
    return "—";
  }

  if (
    typeof value === "number" &&
    Number.isFinite(value)
  ) {
    return value.toLocaleString();
  }

  if (
    typeof value === "string" ||
    typeof value === "boolean"
  ) {
    return String(value);
  }

  return "—";
};


/**
 * ================================================================
 * SPARKLINE NORMALIZATION
 * ================================================================
 *
 * Backend sparkline data may arrive as:
 *
 * [10, 20, 30]
 *
 * or:
 *
 * [
 *   { value: 10 },
 *   { value: 20 },
 *   { value: 30 }
 * ]
 *
 * This function only adapts the existing backend values into
 * the shape required by Recharts.
 *
 * It does NOT calculate anything.
 * ================================================================
 */

const normalizeSparkline = (sparkline) => {
  if (!Array.isArray(sparkline)) {
    return [];
  }

  return sparkline
    .map((point, index) => {
      const value =
        typeof point === "number"
          ? point
          : point?.value;

      if (
        typeof value !== "number" ||
        !Number.isFinite(value)
      ) {
        return null;
      }

      return {
        index,
        value,
      };
    })
    .filter(Boolean);
};


/**
 * ================================================================
 * DashboardStatCard
 * ================================================================
 */

const DashboardStatCard = ({
  label,
  value,
  description,
  trend,
  trendDirection = "neutral",
  sparkline = null,
  icon: Icon = FiTrendingUp,
  variant = "cyan",
  loading = false,
}) => {
  /**
   * --------------------------------------------------------------
   * Accessibility
   * --------------------------------------------------------------
   */

  const shouldReduceMotion = useReducedMotion();


  /**
   * --------------------------------------------------------------
   * Visual configuration
   * --------------------------------------------------------------
   */

  const variantConfig =
    VARIANT_CONFIG[variant] ??
    VARIANT_CONFIG.cyan;

  const trendConfig =
    TREND_CONFIG[trendDirection] ??
    TREND_CONFIG.neutral;

  const TrendIcon =
    trendConfig.icon;


  /**
   * --------------------------------------------------------------
   * KPI state
   * --------------------------------------------------------------
   */

  const hasStatValue =
    hasValue(value);


  /**
   * --------------------------------------------------------------
   * Trend state
   * --------------------------------------------------------------
   *
   * Trend must be supplied by the parent/backend.
   *
   * This component never calculates it.
   * --------------------------------------------------------------
   */

  const hasTrend =
    hasValue(trend);


  /**
   * --------------------------------------------------------------
   * Sparkline state
   * --------------------------------------------------------------
   */

  const chartData =
    normalizeSparkline(sparkline);

  const hasSparkline =
    chartData.length > 1;


  /**
   * --------------------------------------------------------------
   * Motion configuration
   * --------------------------------------------------------------
   */

  const cardInitial =
    shouldReduceMotion
      ? false
      : {
          opacity: 0,
          y: 8,
        };

  const cardAnimate =
    shouldReduceMotion
      ? undefined
      : {
          opacity: 1,
          y: 0,
        };


  return (
    <motion.article
      initial={cardInitial}
      animate={cardAnimate}
      transition={
        shouldReduceMotion
          ? undefined
          : {
              duration: 0.4,
              ease: "easeOut",
            }
      }
      whileHover={
        shouldReduceMotion
          ? undefined
          : {
              y: -2,
              transition: {
                duration: 0.2,
                ease: "easeOut",
              },
            }
      }
      className={`
        group
        relative
        min-w-0
        overflow-hidden
        border
        border-white/[0.08]
        bg-[#06101c]/90
        backdrop-blur-md
        transition-[border-color,box-shadow,background-color]
        duration-300
        ${variantConfig.glow}
      `}
    >

      {/* =========================================================
          TECHNICAL ACCENT LINE
          ========================================================= */}

      <div
        className={`
          absolute
          left-0
          top-0
          h-px
          w-20
          opacity-70
          transition-all
          duration-300
          group-hover:w-32
          ${variantConfig.indicator}
        `}
        aria-hidden="true"
      />


      {/* =========================================================
          CORNER DETAIL
          ========================================================= */}

      <div
        className="
          pointer-events-none
          absolute
          right-0
          top-0
          h-10
          w-10
          border-l
          border-b
          border-white/[0.035]
        "
        aria-hidden="true"
      />


      <div className="relative p-4 sm:p-5">

        {/* =======================================================
            HEADER
            ======================================================= */}

        <div className="flex items-start justify-between gap-3">

          <div className="flex min-w-0 items-center gap-3">

            {/* Icon */}

            <div
              className={`
                flex
                h-9
                w-9
                shrink-0
                items-center
                justify-center
                border
                transition-transform
                duration-300
                group-hover:scale-[1.04]
                ${variantConfig.icon}
              `}
            >
              {Icon && (
                <Icon
                  className="h-4 w-4"
                  strokeWidth={1.7}
                  aria-hidden="true"
                />
              )}
            </div>


            {/* Label */}

            <div className="min-w-0">

              <p
                className="
                  truncate
                  font-['Orbitron']
                  text-[8px]
                  font-semibold
                  uppercase
                  tracking-[0.19em]
                  text-slate-400
                  sm:text-[9px]
                "
              >
                {label}
              </p>


              <div className="mt-1 flex items-center gap-1.5">

                <span
                  className={`
                    h-1
                    w-1
                    rounded-full
                    ${variantConfig.indicator}
                  `}
                  aria-hidden="true"
                />

                <span
                  className="
                    font-['Inter']
                    text-[8px]
                    uppercase
                    tracking-[0.08em]
                    text-slate-600
                  "
                >
                  Operational Metric
                </span>

              </div>

            </div>

          </div>


          {/* KPI identifier */}

          <span
            className="
              shrink-0
              font-['Orbitron']
              text-[7px]
              uppercase
              tracking-[0.15em]
              text-slate-600
            "
            aria-hidden="true"
          >
            KPI
          </span>

        </div>


        {/* =======================================================
            VALUE + DESCRIPTION
            ======================================================= */}

        <div
          className="
            mt-5
            flex
            min-h-[62px]
            items-end
            justify-between
            gap-4
          "
        >

          <div className="min-w-0">

            {/* Value */}

            {loading ? (
              <div
                className="
                  h-9
                  w-20
                  animate-pulse
                  bg-white/[0.06]
                "
                aria-label="Loading dashboard metric"
              />
            ) : (
              <p
                className="
                  font-['Orbitron']
                  text-3xl
                  font-semibold
                  leading-none
                  tracking-[-0.035em]
                  tabular-nums
                  text-slate-100
                  sm:text-[2rem]
                "
              >
                {hasStatValue
                  ? formatKpiValue(value)
                  : "—"}
              </p>
            )}


            {/* Description */}

            <p
              className="
                mt-2
                max-w-[190px]
                font-['Inter']
                text-[10px]
                leading-4
                text-slate-500
                sm:text-[11px]
              "
            >
              {description || "Data unavailable"}
            </p>

          </div>


          {/* =====================================================
              BACKEND-PROVIDED TREND
              ===================================================== */}

          {hasTrend && !loading && (
            <div
              className={`
                mb-1
                flex
                shrink-0
                items-center
                gap-1
                border
                px-2
                py-1
                ${trendConfig.background}
              `}
              title="Change provided by backend"
            >

              <TrendIcon
                className={`
                  h-2.5
                  w-2.5
                  ${trendConfig.className}
                `}
                aria-hidden="true"
              />

              <span
                className={`
                  font-['Orbitron']
                  text-[8px]
                  font-semibold
                  tabular-nums
                  ${trendConfig.className}
                `}
              >
                {String(trend)}
              </span>

            </div>
          )}

        </div>


        {/* =======================================================
            SPARKLINE
            ======================================================= */}

        <div
          className="
            mt-4
            h-10
            w-full
            overflow-hidden
            border-t
            border-white/[0.045]
            pt-2
          "
          aria-hidden="true"
        >

          {loading ? (

            <div
              className="
                h-full
                w-full
                animate-pulse
                bg-white/[0.025]
              "
            />

          ) : hasSparkline ? (

            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <AreaChart
                data={chartData}
                margin={{
                  top: 2,
                  right: 0,
                  left: 0,
                  bottom: 0,
                }}
              >
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={variantConfig.line}
                  strokeWidth={1.25}
                  fill={variantConfig.line}
                  fillOpacity={0.04}
                  isAnimationActive={!shouldReduceMotion}
                  animationDuration={
                    shouldReduceMotion
                      ? 0
                      : 700
                  }
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>

          ) : (

            <div className="flex h-full items-center">

              <div
                className="
                  h-px
                  w-full
                  bg-gradient-to-r
                  from-white/[0.07]
                  via-white/[0.025]
                  to-transparent
                "
              />

            </div>

          )}

        </div>

      </div>


      {/* =========================================================
          BOTTOM HOVER ILLUMINATION
          ========================================================= */}

      <div
        className={`
          pointer-events-none
          absolute
          inset-x-0
          bottom-0
          h-px
          opacity-0
          transition-opacity
          duration-300
          group-hover:opacity-60
          ${variantConfig.indicator}
        `}
        aria-hidden="true"
      />

    </motion.article>
  );
};


export default DashboardStatCard;