/**
 * ================================================================
 * OrbitGuard AI — Risk Assessment Trend
 * ================================================================
 *
 * PURPOSE
 * ------------------------------------------------
 * Displays collision-risk assessment history as a trend chart.
 *
 * ARCHITECTURE
 * ------------------------------------------------
 * - No API calls.
 * - No dummy data.
 * - No collision probability calculation.
 * - No risk-level calculation.
 * - Backend remains the source of truth.
 * - `data` is preferred when supplied by the parent.
 * - Supports the real Dashboard backend `riskTrends` contract:
 *      { date, count }
 * - `risks` is used as a fallback when individual risk records
 *   are supplied by the parent.
 *
 * BACKEND DASHBOARD CONTRACT
 * ------------------------------------------------
 * GET /api/dashboard?trendDays={days}
 *
 * DashboardResponse:
 *
 * {
 *   riskTrends: [
 *     {
 *       date: "...",
 *       count: 4
 *     }
 *   ]
 * }
 *
 * IMPORTANT
 * ------------------------------------------------
 * `count` represents the total number of assessments for that date.
 *
 * This component does NOT convert total counts into risk levels.
 * Critical / High / Medium / Low are only displayed when the
 * parent supplies actual risk-level data or individual risk records.
 *
 * UI BEHAVIOR
 * ------------------------------------------------
 * - Card height is content-driven.
 * - Prevents CSS grid row stretching from creating large empty space.
 * - Keeps the chart compact and operational-dashboard focused.
 *
 * ================================================================
 */

import { useMemo } from "react";

import { MdShowChart } from "react-icons/md";

import {
    CartesianGrid,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

/* ================================================================
   RISK SERIES
================================================================ */

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

/* ================================================================
   TOTAL ASSESSMENT SERIES
================================================================ */

const TOTAL_SERIES = {
    key: "count",
    label: "Total Assessments",
    stroke: "#22d3ee",
};

/* ================================================================
   SAFE NUMBER
================================================================ */

function safeNumber(value) {
    const number = Number(value);

    if (!Number.isFinite(number) || number < 0) {
        return 0;
    }

    return number;
}

/* ================================================================
   DATE HELPERS
================================================================ */

function getAssessmentDate(risk) {
    return (
        risk?.assessedAt ??
        risk?.assessmentDate ??
        risk?.createdAt ??
        risk?.updatedAt ??
        null
    );
}

function formatDateLabel(dateValue) {
    if (!dateValue) {
        return "Unknown";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
        return "Unknown";
    }

    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
    });
}

function getDateKey(dateValue) {
    if (!dateValue) {
        return null;
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
        return null;
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

/* ================================================================
   RISK LEVEL NORMALIZATION
================================================================ */

/**
 * This function only normalizes the backend risk-level value.
 *
 * It does NOT calculate risk.
 */

function normalizeRiskLevel(risk) {
    const value = String(
        risk?.riskLevel ??
            risk?.level ??
            risk?.riskSeverity ??
            "",
    )
        .trim()
        .toUpperCase();

    if (value === "CRITICAL") {
        return "critical";
    }

    if (value === "HIGH") {
        return "high";
    }

    if (value === "MEDIUM") {
        return "medium";
    }

    if (value === "LOW") {
        return "low";
    }

    return null;
}

/* ================================================================
   BUILD TREND FROM BACKEND RISK RECORDS
================================================================ */

/**
 * Fallback mode.
 *
 * Used only when the parent supplies individual risk records.
 *
 * The component groups those existing backend records by date
 * and counts their already-provided risk levels.
 *
 * No risk classification is performed here.
 */

function buildTrendFromRisks(risks) {
    if (!Array.isArray(risks) || risks.length === 0) {
        return [];
    }

    const grouped = new Map();

    risks.forEach((risk) => {
        if (!risk) {
            return;
        }

        const dateValue = getAssessmentDate(risk);
        const dateKey = getDateKey(dateValue);

        if (!dateKey) {
            return;
        }

        const riskLevel = normalizeRiskLevel(risk);

        if (!riskLevel) {
            return;
        }

        if (!grouped.has(dateKey)) {
            grouped.set(dateKey, {
                dateKey,
                date: formatDateLabel(dateValue),
                critical: 0,
                high: 0,
                medium: 0,
                low: 0,
            });
        }

        const entry = grouped.get(dateKey);

        entry[riskLevel] += 1;
    });

    return Array.from(grouped.values())
        .sort((a, b) =>
            a.dateKey.localeCompare(b.dateKey),
        )
        .map(
            ({
                dateKey,
                date,
                critical,
                high,
                medium,
                low,
            }) => ({
                dateKey,
                date,
                critical,
                high,
                medium,
                low,
            }),
        );
}

/* ================================================================
   NORMALIZE BACKEND DASHBOARD TREND DATA
================================================================ */

/**
 * Supports the actual backend DashboardResponse contract:
 *
 * riskTrends: [
 *     {
 *         date: "...",
 *         count: 4
 *     }
 * ]
 *
 * IMPORTANT:
 * `count` is the backend-provided total assessment count.
 *
 * We do not transform this into risk-level counts because the
 * backend contract does not provide per-date risk-level breakdown.
 */

function normalizeBackendTrendData(data) {
    if (!Array.isArray(data)) {
        return [];
    }

    return data
        .map((item, index) => {
            const dateValue =
                item?.date ??
                item?.assessmentDate ??
                item?.createdAt ??
                null;

            const dateKey =
                getDateKey(dateValue) ??
                String(item?.date ?? index);

            return {
                dateKey,
                date:
                    dateValue
                        ? formatDateLabel(dateValue)
                        : String(
                              item?.date ??
                                  item?.label ??
                                  `Point ${index + 1}`,
                          ),
                count: safeNumber(item?.count),
            };
        })
        .filter((item) => item.count > 0);
}

/* ================================================================
   NORMALIZE EXTERNAL LEVEL-BASED CHART DATA
================================================================ */

/**
 * Supports prepared chart data supplied by the parent:
 *
 * {
 *     date,
 *     critical,
 *     high,
 *     medium,
 *     low
 * }
 *
 * This is only used when the parent explicitly supplies
 * risk-level trend data.
 */

function normalizeRiskLevelChartData(data) {
    if (!Array.isArray(data)) {
        return [];
    }

    return data
        .map((item, index) => ({
            ...item,

            date:
                item?.date ??
                item?.label ??
                `Point ${index + 1}`,

            critical: safeNumber(item?.critical),
            high: safeNumber(item?.high),
            medium: safeNumber(item?.medium),
            low: safeNumber(item?.low),
        }))
        .filter(
            (item) =>
                item.critical > 0 ||
                item.high > 0 ||
                item.medium > 0 ||
                item.low > 0,
        );
}

/* ================================================================
   DETECT CHART DATA TYPE
================================================================ */

function isRiskLevelChartData(data) {
    if (!Array.isArray(data) || data.length === 0) {
        return false;
    }

    return data.some(
        (item) =>
            item &&
            (
                Object.prototype.hasOwnProperty.call(
                    item,
                    "critical",
                ) ||
                Object.prototype.hasOwnProperty.call(
                    item,
                    "high",
                ) ||
                Object.prototype.hasOwnProperty.call(
                    item,
                    "medium",
                ) ||
                Object.prototype.hasOwnProperty.call(
                    item,
                    "low",
                )
            ),
    );
}

/* ================================================================
   CUSTOM TOOLTIP
================================================================ */

function CustomTooltip({
    active,
    payload,
    label,
    series,
}) {
    if (
        !active ||
        !Array.isArray(payload) ||
        payload.length === 0
    ) {
        return null;
    }

    const visibleItems = payload.filter(
        (item) =>
            item?.value !== undefined &&
            item?.value !== null,
    );

    if (!visibleItems.length) {
        return null;
    }

    return (
        <div
            className="
                min-w-[150px]
                overflow-hidden
                rounded-lg
                border
                border-cyan-400/20
                bg-[#061522]/95
                shadow-[0_10px_35px_rgba(0,0,0,0.45)]
                backdrop-blur-md
            "
        >
            {/* TOOLTIP HEADER */}

            <div
                className="
                    border-b
                    border-cyan-400/10
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

            {/* TOOLTIP VALUES */}

            <div
                className="
                    space-y-1.5
                    px-3
                    py-2
                "
            >
                {series.map((seriesItem) => {
                    const item = visibleItems.find(
                        (entry) =>
                            entry?.dataKey ===
                            seriesItem.key,
                    );

                    if (!item) {
                        return null;
                    }

                    return (
                        <div
                            key={seriesItem.key}
                            className="
                                flex
                                items-center
                                justify-between
                                gap-6
                            "
                        >
                            <div
                                className="
                                    flex
                                    items-center
                                    gap-2
                                "
                            >
                                <span
                                    className="
                                        h-1.5
                                        w-1.5
                                        shrink-0
                                        rounded-full
                                    "
                                    style={{
                                        backgroundColor:
                                            seriesItem.stroke,
                                    }}
                                />

                                <span
                                    className="
                                        font-['Inter']
                                        text-[9px]
                                        text-slate-400
                                    "
                                >
                                    {seriesItem.label}
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
                                {safeNumber(item.value)}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

/* ================================================================
   EMPTY STATE
================================================================ */

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
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-lg
                    border
                    border-cyan-400/15
                    bg-cyan-400/[0.04]
                    text-cyan-400/70
                "
            >
                <MdShowChart
                    size={22}
                    aria-hidden="true"
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
                No Assessment Trend Data
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
                Assessment history will appear
                here when risk records are
                available.
            </p>
        </div>
    );
}

/* ================================================================
   LOADING STATE
================================================================ */

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

/* ================================================================
   MAIN COMPONENT
================================================================ */

export default function RiskAssessmentTrend({
    data = null,
    risks = [],
    loading = false,
    dateRange = null,
}) {
    /* ============================================================
       CHART MODE
    ============================================================ */

    const chartMode = useMemo(() => {
        if (
            Array.isArray(data) &&
            data.length > 0
        ) {
            /*
             * If the parent supplied explicit risk-level
             * series, preserve that contract.
             */

            if (isRiskLevelChartData(data)) {
                return "risk-level";
            }

            /*
             * Otherwise treat the data as the real
             * backend Dashboard riskTrends contract:
             *
             * { date, count }
             */

            return "total";
        }

        /*
         * Fallback to individual backend risk records.
         */

        if (
            Array.isArray(risks) &&
            risks.length > 0
        ) {
            return "risk-level";
        }

        return "empty";
    }, [data, risks]);

    /* ============================================================
       CHART DATA
    ============================================================ */

    const chartData = useMemo(() => {
        /*
         * Parent supplied explicit risk-level trend data.
         */

        if (chartMode === "risk-level") {
            if (
                Array.isArray(data) &&
                data.length > 0 &&
                isRiskLevelChartData(data)
            ) {
                return normalizeRiskLevelChartData(
                    data,
                );
            }

            /*
             * Fallback from individual backend risk records.
             */

            return buildTrendFromRisks(risks);
        }

        /*
         * Actual Dashboard backend trend:
         *
         * { date, count }
         */

        if (chartMode === "total") {
            return normalizeBackendTrendData(data);
        }

        return [];
    }, [
        chartMode,
        data,
        risks,
    ]);

    /* ============================================================
       SERIES
    ============================================================ */

    const series = useMemo(() => {
        if (chartMode === "total") {
            return [TOTAL_SERIES];
        }

        return RISK_SERIES;
    }, [chartMode]);

    /* ============================================================
       DATA STATE
    ============================================================ */

    const hasData = chartData.length > 0;

    /* ============================================================
       RENDER
    ============================================================ */

    return (
        <section
            aria-labelledby="risk-assessment-trend-title"
            className="
                relative
                h-fit
                self-start
                min-w-0
                overflow-hidden
                rounded-xl
                border
                border-cyan-400/20
                bg-[#04111d]/90
                shadow-[0_0_30px_rgba(0,180,255,0.05)]
                backdrop-blur-md
            "
        >
            {/* =====================================================
                HEADER
            ===================================================== */}

            <header
                className="
                    flex
                    min-h-[58px]
                    items-center
                    justify-between
                    gap-4
                    border-b
                    border-cyan-400/10
                    px-4
                    py-3
                "
            >
                <div className="min-w-0">
                    <div
                        className="
                            flex
                            items-center
                            gap-2
                        "
                    >
                        <MdShowChart
                            size={16}
                            className="
                                shrink-0
                                text-cyan-400/80
                            "
                            aria-hidden="true"
                        />

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
                        Collision-risk assessments
                        over time
                    </p>
                </div>

                {/* DATE RANGE */}

                {dateRange && (
                    <div
                        className="
                            hidden
                            shrink-0
                            rounded-md
                            border
                            border-slate-700/50
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
            </header>

            {/* =====================================================
                CHART
            ===================================================== */}

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
                            data={chartData}
                            margin={{
                                top: 8,
                                right: 10,
                                left: -18,
                                bottom: 0,
                            }}
                        >
                            {/* GRID */}

                            <CartesianGrid
                                stroke="rgba(100,116,139,0.12)"
                                strokeDasharray="3 5"
                                vertical={false}
                            />

                            {/* X AXIS */}

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

                            {/* Y AXIS */}

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

                            {/* TOOLTIP */}

                            <Tooltip
                                cursor={{
                                    stroke:
                                        "rgba(34,211,238,0.18)",
                                    strokeWidth: 1,
                                    strokeDasharray:
                                        "4 4",
                                }}
                                content={
                                    <CustomTooltip
                                        series={series}
                                    />
                                }
                            />

                            {/* RISK / TOTAL LINES */}

                            {series.map(
                                (seriesItem) => (
                                    <Line
                                        key={
                                            seriesItem.key
                                        }
                                        type="monotone"
                                        dataKey={
                                            seriesItem.key
                                        }
                                        name={
                                            seriesItem.label
                                        }
                                        stroke={
                                            seriesItem.stroke
                                        }
                                        strokeWidth={1.8}
                                        dot={{
                                            r: 2.2,
                                            strokeWidth: 0,
                                            fill:
                                                seriesItem.stroke,
                                        }}
                                        activeDot={{
                                            r: 4,
                                            strokeWidth: 2,
                                            stroke:
                                                "#04111d",
                                            fill:
                                                seriesItem.stroke,
                                        }}
                                        connectNulls
                                        isAnimationActive
                                        animationDuration={
                                            700
                                        }
                                    />
                                ),
                            )}
                        </LineChart>
                    </ResponsiveContainer>
                )}
            </div>

            {/* =====================================================
                LEGEND
            ===================================================== */}

            <footer
                className="
                    flex
                    flex-wrap
                    items-center
                    justify-center
                    gap-x-4
                    gap-y-2
                    border-t
                    border-cyan-400/10
                    bg-black/10
                    px-3
                    py-2.5
                "
            >
                {series.map((seriesItem) => (
                    <div
                        key={seriesItem.key}
                        className="
                            flex
                            items-center
                            gap-1.5
                        "
                    >
                        <span
                            className="
                                h-1.5
                                w-1.5
                                rounded-full
                            "
                            style={{
                                backgroundColor:
                                    seriesItem.stroke,

                                boxShadow:
                                    `0 0 6px ${seriesItem.stroke}`,
                            }}
                        />

                        <span
                            className="
                                font-['Inter']
                                text-[8px]
                                text-slate-500
                            "
                        >
                            {seriesItem.label}
                        </span>
                    </div>
                ))}
            </footer>
        </section>
    );
}