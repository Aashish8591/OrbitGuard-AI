import { FiArrowDown, FiArrowUp, FiMinus, FiTrendingUp } from "react-icons/fi";
import { motion, useReducedMotion } from "framer-motion";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
} from "recharts";

/**
 * OrbitGuard AI — Dashboard Stat Card
 *
 * Presentation-only component.
 * Backend remains the source of truth for values, trends and sparklines.
 */

const VARIANT_CONFIG = {
  cyan: {
    icon: "border-cyan-300/20 bg-cyan-400/[0.09] text-cyan-300",
    border: "border-cyan-300/15",
    glow: "group-hover:border-cyan-300/35 group-hover:shadow-[0_8px_30px_rgba(34,211,238,0.07)]",
    indicator: "bg-cyan-300",
    line: "#22d3ee",
    wash: "from-cyan-400/[0.08]",
  },
  blue: {
    icon: "border-blue-300/20 bg-blue-400/[0.09] text-blue-300",
    border: "border-blue-300/15",
    glow: "group-hover:border-blue-300/35 group-hover:shadow-[0_8px_30px_rgba(59,130,246,0.07)]",
    indicator: "bg-blue-300",
    line: "#60a5fa",
    wash: "from-blue-400/[0.08]",
  },
  warning: {
    icon: "border-amber-300/20 bg-amber-400/[0.09] text-amber-300",
    border: "border-amber-300/15",
    glow: "group-hover:border-amber-300/35 group-hover:shadow-[0_8px_30px_rgba(245,158,11,0.07)]",
    indicator: "bg-amber-300",
    line: "#fbbf24",
    wash: "from-amber-400/[0.08]",
  },
  danger: {
    icon: "border-red-300/20 bg-red-400/[0.09] text-red-300",
    border: "border-red-300/15",
    glow: "group-hover:border-red-300/35 group-hover:shadow-[0_8px_30px_rgba(248,113,113,0.07)]",
    indicator: "bg-red-300",
    line: "#f87171",
    wash: "from-red-400/[0.08]",
  },
};

const TREND_CONFIG = {
  up: {
    icon: FiArrowUp,
    className: "text-emerald-300",
    background: "border-emerald-400/15 bg-emerald-400/[0.07]",
  },
  down: {
    icon: FiArrowDown,
    className: "text-amber-300",
    background: "border-amber-400/15 bg-amber-400/[0.07]",
  },
  neutral: {
    icon: FiMinus,
    className: "text-slate-400",
    background: "border-slate-400/15 bg-slate-400/[0.05]",
  },
};

const hasValue = (value) =>
  value !== undefined && value !== null && value !== "";

const formatKpiValue = (value) => {
  if (!hasValue(value)) return "—";

  if (typeof value === "number" && Number.isFinite(value)) {
    return value.toLocaleString("en-IN");
  }

  if (typeof value === "string" || typeof value === "boolean") {
    return String(value);
  }

  return "—";
};

const normalizeSparkline = (sparkline) => {
  if (!Array.isArray(sparkline)) return [];

  return sparkline
    .map((point, index) => {
      const value = typeof point === "number" ? point : point?.value;

      if (typeof value !== "number" || !Number.isFinite(value)) {
        return null;
      }

      return { index, value };
    })
    .filter(Boolean);
};

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
  const shouldReduceMotion = useReducedMotion();

  const variantConfig =
    VARIANT_CONFIG[variant] ?? VARIANT_CONFIG.cyan;

  const trendConfig =
    TREND_CONFIG[trendDirection] ?? TREND_CONFIG.neutral;

  const TrendIcon = trendConfig.icon;
  const chartData = normalizeSparkline(sparkline);
  const hasSparkline = chartData.length > 1;
  const hasTrend = hasValue(trend);

  return (
    <motion.article
      initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
      animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
      transition={
        shouldReduceMotion
          ? undefined
          : { duration: 0.35, ease: "easeOut" }
      }
      whileHover={
        shouldReduceMotion
          ? undefined
          : {
              y: -2,
              transition: { duration: 0.2, ease: "easeOut" },
            }
      }
      className={[
        "group relative isolate h-full min-w-0 overflow-hidden",
        "border bg-[#06101c]/95",
        variantConfig.border,
        "shadow-[0_4px_18px_rgba(0,0,0,0.12)]",
        "transition-[border-color,box-shadow] duration-300",
        variantConfig.glow,
      ].join(" ")}
    >
      {/* Subtle card atmosphere */}
      <div
        aria-hidden="true"
        className={[
          "pointer-events-none absolute inset-0 -z-10",
          "bg-gradient-to-br via-transparent to-[#020711]/35",
          variantConfig.wash,
        ].join(" ")}
      />

      {/* Top accent */}
      <div
        aria-hidden="true"
        className={[
          "absolute left-0 top-0 h-[2px] w-14",
          "transition-all duration-300 group-hover:w-24",
          variantConfig.indicator,
        ].join(" ")}
      />

      {/* Decorative corner */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none absolute right-0 top-0
          h-7 w-7 border-b border-l border-white/[0.06]
          sm:h-9 sm:w-9
        "
      />

      <div className="relative flex h-full min-w-0 flex-col p-3 sm:p-4 lg:p-5">
        {/* Header */}
        <div className="flex min-w-0 items-start justify-between gap-2 sm:gap-3">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <div
              className={[
                "flex h-8 w-8 shrink-0 items-center justify-center",
                "border transition-transform duration-300",
                "group-hover:scale-[1.04] sm:h-10 sm:w-10",
                variantConfig.icon,
              ].join(" ")}
            >
              {Icon && (
                <Icon
                  className="h-4 w-4 sm:h-[18px] sm:w-[18px]"
                  strokeWidth={1.7}
                  aria-hidden="true"
                />
              )}
            </div>

            <div className="min-w-0">
              <p
                className="
                  break-words font-['Orbitron']
                  text-[8px] font-semibold uppercase
                  leading-4 tracking-[0.11em] text-slate-300
                  sm:text-[9px] sm:tracking-[0.16em]
                  lg:text-[10px]
                "
              >
                {label}
              </p>

              <div className="mt-1 flex min-w-0 items-center gap-1.5">
                <span
                  className={[
                    "h-1.5 w-1.5 shrink-0 rounded-full",
                    variantConfig.indicator,
                  ].join(" ")}
                  aria-hidden="true"
                />

                <span className="truncate font-['Inter'] text-[7px] uppercase tracking-[0.06em] text-slate-500 sm:text-[8px] sm:tracking-[0.08em]">
                  Operational metric
                </span>
              </div>
            </div>
          </div>

          <span
            className="
              hidden shrink-0 border border-white/[0.06]
              px-1.5 py-1 font-['Orbitron'] text-[7px]
              uppercase tracking-wider text-slate-500
              sm:inline-flex
            "
            aria-hidden="true"
          >
            KPI
          </span>
        </div>

        {/* Value and description */}
        <div className="mt-4 flex min-w-0 flex-1 items-start justify-between gap-2 sm:mt-5 sm:gap-3">
          <div className="min-w-0 flex-1">
            {loading ? (
              <div
                role="status"
                aria-label={`Loading ${label || "dashboard metric"}`}
                className="h-7 w-16 max-w-full animate-pulse bg-white/[0.08] sm:h-9 sm:w-20 motion-reduce:animate-none"
              />
            ) : (
              <p
                className="
                  break-words font-['Orbitron']
                  text-[clamp(1.15rem,3.5vw,2rem)]
                  font-semibold leading-tight tracking-[-0.04em]
                  tabular-nums text-slate-100
                  sm:text-3xl lg:text-[2rem]
                "
              >
                {formatKpiValue(value)}
              </p>
            )}

            <p className="mt-1.5 break-words font-['Inter'] text-[9px] leading-4 text-slate-400 sm:mt-2 sm:text-[11px]">
              {description || "Data unavailable"}
            </p>
          </div>

          {hasTrend && !loading && (
            <div
              className={[
                "mt-0.5 flex shrink-0 items-center gap-1",
                "border px-1.5 py-1 sm:px-2",
                trendConfig.background,
              ].join(" ")}
              title="Change provided by backend"
            >
              <TrendIcon
                className={`h-2.5 w-2.5 ${trendConfig.className}`}
                aria-hidden="true"
              />
              <span
                className={[
                  "font-['Orbitron'] text-[7px] font-semibold",
                  "tabular-nums sm:text-[8px]",
                  trendConfig.className,
                ].join(" ")}
              >
                {String(trend)}
              </span>
            </div>
          )}
        </div>

        {/* Sparkline or restrained divider */}
        <div
          className="
            mt-3 h-7 w-full shrink-0 overflow-hidden
            border-t border-white/[0.07] pt-2
            sm:mt-4 sm:h-9
          "
          aria-hidden="true"
        >
          {loading ? (
            <div className="h-full w-full animate-pulse bg-white/[0.025] motion-reduce:animate-none" />
          ) : hasSparkline ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 2, right: 0, left: 0, bottom: 0 }}
              >
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={variantConfig.line}
                  strokeWidth={1.4}
                  fill={variantConfig.line}
                  fillOpacity={0.07}
                  isAnimationActive={!shouldReduceMotion}
                  animationDuration={shouldReduceMotion ? 0 : 700}
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center">
              <div
                className={[
                  "h-px w-full bg-gradient-to-r",
                  "from-white/[0.10] via-white/[0.035] to-transparent",
                ].join(" ")}
              />
            </div>
          )}
        </div>
      </div>

      {/* Bottom accent */}
      <div
        aria-hidden="true"
        className={[
          "pointer-events-none absolute inset-x-0 bottom-0",
          "h-px opacity-0 transition-opacity duration-300",
          "group-hover:opacity-60",
          variantConfig.indicator,
        ].join(" ")}
      />
    </motion.article>
  );
};

export default DashboardStatCard;
