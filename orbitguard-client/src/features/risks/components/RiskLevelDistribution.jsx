import { useMemo } from "react";

import {
    Cell,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
} from "recharts";

import { FiActivity } from "react-icons/fi";

/**
 * ==============================================================
 * OrbitGuard AI — Risk Level Distribution
 * ==============================================================
 *
 * PURPOSE
 * --------------------------------------------------------------
 * Presentational analytics component for the Risk Overview page.
 *
 * RESPONSIBILITY
 * --------------------------------------------------------------
 * - Displays risk-level distribution.
 * - Displays backend-provided risk counts.
 * - Can derive display counts from already-loaded risk records.
 * - Does NOT call the backend directly.
 * - Does NOT calculate collision probability.
 * - Does NOT calculate risk level.
 *
 * DATA FLOW
 * --------------------------------------------------------------
 * RiskOverviewPage
 *       |
 *       |-- backend risk data
 *       |-- summary
 *       |-- risks
 *       |
 *       v
 * RiskLevelDistribution
 *
 * IMPORTANT UI CHANGE
 * --------------------------------------------------------------
 * - Card uses h-fit and self-start.
 * - Prevents parent dashboard grid from stretching this card
 *   into a large empty vertical panel.
 * - Content remains compact and data-driven.
 *
 * BACKEND
 * --------------------------------------------------------------
 * Backend remains the source of truth.
 *
 * ==============================================================
 */

/* ==============================================================
   RISK LEVELS
   ============================================================== */

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

/* ==============================================================
   EMPTY SUMMARY
   ============================================================== */

const EMPTY_SUMMARY = {
    total: 0,
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
};

/* ==============================================================
   NORMALIZE COUNT
   ============================================================== */

function normalizeCount(value) {
    const number = Number(value);

    if (!Number.isFinite(number) || number < 0) {
        return 0;
    }

    return Math.floor(number);
}

/* ==============================================================
   NORMALIZE RISK LEVEL
   ============================================================== */

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

/* ==============================================================
   BUILD SUMMARY FROM LOADED RISKS
   ============================================================== */

function getSummaryFromRisks(risks) {
    const summary = {
        total: 0,
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
    };

    if (!Array.isArray(risks)) {
        return summary;
    }

    risks.forEach((risk) => {
        if (!risk) {
            return;
        }

        const level = normalizeRiskLevel(risk);

        if (!level) {
            return;
        }

        summary[level] += 1;
    });

    summary.total =
        summary.critical +
        summary.high +
        summary.medium +
        summary.low;

    return summary;
}

/* ==============================================================
   NORMALIZE SUMMARY
   ============================================================== */

function normalizeSummary(source) {
    if (!source || typeof source !== "object") {
        return EMPTY_SUMMARY;
    }

    const critical = normalizeCount(
        source.critical ??
            source.CRITICAL ??
            source.criticalCount ??
            source.criticalRiskCount,
    );

    const high = normalizeCount(
        source.high ??
            source.HIGH ??
            source.highCount ??
            source.highRiskCount,
    );

    const medium = normalizeCount(
        source.medium ??
            source.MEDIUM ??
            source.mediumCount ??
            source.mediumRiskCount,
    );

    const low = normalizeCount(
        source.low ??
            source.LOW ??
            source.lowCount ??
            source.lowRiskCount,
    );

    const total =
        critical +
        high +
        medium +
        low;

    return {
        total,
        critical,
        high,
        medium,
        low,
    };
}

/* ==============================================================
   EXPLICIT DISTRIBUTION DATA DETECTION
   ============================================================== */

function hasExplicitDistributionData(data) {
    if (Array.isArray(data)) {
        return data.length > 0;
    }

    if (!data || typeof data !== "object") {
        return false;
    }

    return (
        data.critical !== undefined ||
        data.CRITICAL !== undefined ||
        data.criticalCount !== undefined ||
        data.criticalRiskCount !== undefined ||
        data.high !== undefined ||
        data.HIGH !== undefined ||
        data.highCount !== undefined ||
        data.highRiskCount !== undefined ||
        data.medium !== undefined ||
        data.MEDIUM !== undefined ||
        data.mediumCount !== undefined ||
        data.mediumRiskCount !== undefined ||
        data.low !== undefined ||
        data.LOW !== undefined ||
        data.lowCount !== undefined ||
        data.lowRiskCount !== undefined
    );
}

/* ==============================================================
   NORMALIZE ARRAY DATA
   ============================================================== */

function normalizeArrayDistribution(data) {
    if (!Array.isArray(data) || data.length === 0) {
        return null;
    }

    const counts = {
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
    };

    data.forEach((item) => {
        if (!item) {
            return;
        }

        const rawKey =
            item?.key ??
            item?.riskLevel ??
            item?.level ??
            item?.name ??
            item?.label;

        const key = String(rawKey ?? "")
            .trim()
            .toLowerCase();

        if (!Object.prototype.hasOwnProperty.call(counts, key)) {
            return;
        }

        counts[key] += normalizeCount(
            item?.value ??
                item?.count ??
                item?.total,
        );
    });

    return counts;
}

/* ==============================================================
   TOOLTIP
   ============================================================== */

function DistributionTooltip({
    active,
    payload,
}) {
    if (!active || !payload?.length) {
        return null;
    }

    const item = payload[0];
    const data = item?.payload;

    if (!data) {
        return null;
    }

    return (
        <div
            className="
                rounded-lg
                border
                border-slate-700/80
                bg-[#06111d]/95
                px-3
                py-2
                shadow-xl
                backdrop-blur-md
            "
        >
            <p
                className="
                    font-['Orbitron']
                    text-[10px]
                    uppercase
                    tracking-[0.12em]
                    text-slate-400
                "
            >
                {data.label}
            </p>

            <p
                className="
                    mt-1
                    font-['Inter']
                    text-sm
                    font-semibold
                    text-slate-100
                "
            >
                {data.value} assessment
                {data.value === 1 ? "" : "s"}
            </p>

            <p
                className="
                    font-['Inter']
                    text-[10px]
                    text-slate-500
                "
            >
                {data.percentage}% of displayed risks
            </p>
        </div>
    );
}

/* ==============================================================
   MAIN COMPONENT
   ============================================================== */

function RiskLevelDistribution({
    risks = [],
    summary = null,
    data = null,
    loading = false,
}) {
    /* ============================================================
       BUILD DISTRIBUTION
       ============================================================ */

    const distribution = useMemo(() => {
        let source = null;

        /* --------------------------------------------------------
           1. Explicit distribution data
           -------------------------------------------------------- */

        if (hasExplicitDistributionData(data)) {
            if (Array.isArray(data)) {
                source = normalizeArrayDistribution(data);
            } else {
                source = normalizeSummary(data);
            }
        }

        /* --------------------------------------------------------
           2. Parent-provided summary
           -------------------------------------------------------- */

        if (!source && summary) {
            source = normalizeSummary(summary);
        }

        /* --------------------------------------------------------
           3. Loaded backend risk records
           -------------------------------------------------------- */

        if (!source) {
            source = getSummaryFromRisks(risks);
        }

        /* --------------------------------------------------------
           Safety fallback
           -------------------------------------------------------- */

        if (!source) {
            source = EMPTY_SUMMARY;
        }

        const values = RISK_LEVELS.map((level) => ({
            ...level,
            value: normalizeCount(
                source[level.key],
            ),
        }));

        const total = values.reduce(
            (sum, item) =>
                sum + item.value,
            0,
        );

        return {
            total,

            items: values.map((item) => ({
                ...item,

                percentage:
                    total > 0
                        ? Number(
                              (
                                  (item.value /
                                      total) *
                                  100
                              ).toFixed(1),
                          )
                        : 0,
            })),
        };
    }, [
        data,
        summary,
        risks,
    ]);

    const hasData =
        distribution.total > 0;

    /* ============================================================
       RENDER
       ============================================================ */

    return (
        <section
            className="
                relative
                min-w-0
                h-fit
                self-start
                overflow-hidden
                rounded-xl
                border
                border-cyan-500/20
                bg-[#03101c]/90
                shadow-[0_0_30px_rgba(0,180,255,0.04)]
                backdrop-blur-md
            "
            aria-label="Risk level distribution"
        >
            {/* ====================================================
                Ambient Background
            ==================================================== */}

            <div
                aria-hidden="true"
                className="
                    pointer-events-none
                    absolute
                    inset-0
                    bg-[radial-gradient(circle_at_20%_50%,rgba(0,200,255,0.07),transparent_38%)]
                "
            />

            <div
                aria-hidden="true"
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

            {/* ====================================================
                Header
            ==================================================== */}

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
                <div
                    className="
                        flex
                        min-w-0
                        items-center
                        gap-2.5
                    "
                >
                    {/* Icon */}

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
                        <FiActivity
                            size={13}
                            strokeWidth={1.8}
                            aria-hidden="true"
                        />
                    </div>

                    {/* Title */}

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
                            Collision assessment distribution
                        </p>
                    </div>
                </div>

                {/* Live indicator */}

                <span
                    className="
                        hidden
                        items-center
                        gap-1.5
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
                    <span
                        aria-hidden="true"
                        className="
                            h-1.5
                            w-1.5
                            animate-pulse
                            rounded-full
                            bg-cyan-400
                        "
                    />

                    Distribution
                </span>
            </header>

            {/* ====================================================
                CONTENT
            ==================================================== */}

            <div
                className="
                    relative
                    px-3
                    py-3
                    sm:px-4
                    sm:py-3.5
                "
            >
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
                            gap-3
                            sm:grid-cols-[minmax(145px,0.9fr)_minmax(125px,1fr)]
                            sm:gap-3
                        "
                    >
                        {/* ========================================
                            Donut Chart
                        ======================================== */}

                        <div
                            className="
                                relative
                                mx-auto
                                h-[145px]
                                w-full
                                max-w-[175px]
                                sm:h-[150px]
                            "
                        >
                            <ResponsiveContainer
                                width="100%"
                                height="100%"
                            >
                                <PieChart>
                                    <Pie
                                        data={
                                            distribution.items
                                        }
                                        dataKey="value"
                                        nameKey="label"
                                        cx="50%"
                                        cy="50%"
                                        innerRadius="58%"
                                        outerRadius="80%"
                                        paddingAngle={2}
                                        stroke="none"
                                        isAnimationActive
                                        animationDuration={
                                            700
                                        }
                                    >
                                        {distribution.items.map(
                                            (item) => (
                                                <Cell
                                                    key={
                                                        item.key
                                                    }
                                                    fill={
                                                        item.color
                                                    }
                                                />
                                            ),
                                        )}
                                    </Pie>

                                    <Tooltip
                                        content={
                                            <DistributionTooltip />
                                        }
                                        cursor={false}
                                    />
                                </PieChart>
                            </ResponsiveContainer>

                            {/* Donut Center */}

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
                                    {distribution.total}
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

                        {/* ========================================
                            Risk Breakdown
                        ======================================== */}

                        <div className="min-w-0">
                            <div className="space-y-1.5">
                                {distribution.items.map(
                                    (item) => (
                                        <div
                                            key={
                                                item.key
                                            }
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
                                            {/* Status Dot */}

                                            <span
                                                aria-hidden="true"
                                                className={`
                                                    h-2
                                                    w-2
                                                    shrink-0
                                                    rounded-full
                                                    ${item.dotClass}
                                                `}
                                            />

                                            {/* Level */}

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
                                                {
                                                    item.value
                                                }
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
                                                {
                                                    item.percentage
                                                }
                                                %
                                            </span>
                                        </div>
                                    ),
                                )}
                            </div>

                            {/* Distribution Bar */}

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
                                    {distribution.items.map(
                                        (item) => {
                                            if (
                                                item.percentage <=
                                                0
                                            ) {
                                                return null;
                                            }

                                            return (
                                                <div
                                                    key={
                                                        item.key
                                                    }
                                                    className="
                                                        h-full
                                                        transition-all
                                                        duration-700
                                                    "
                                                    style={{
                                                        width: `${item.percentage}%`,
                                                        backgroundColor:
                                                            item.color,
                                                    }}
                                                    title={`${item.label}: ${item.percentage}%`}
                                                />
                                            );
                                        },
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}

/* ==============================================================
   LOADING STATE
   ============================================================== */

function DistributionSkeleton() {
    return (
        <div
            className="
                grid
                grid-cols-1
                items-center
                gap-3
                sm:grid-cols-[minmax(145px,0.9fr)_minmax(125px,1fr)]
            "
        >
            <div className="flex justify-center">
                <div
                    className="
                        h-[145px]
                        w-[145px]
                        animate-pulse
                        rounded-full
                        border-[24px]
                        border-slate-800/80
                    "
                />
            </div>

            <div className="space-y-3">
                {[1, 2, 3, 4].map(
                    (item) => (
                        <div
                            key={item}
                            className="
                                flex
                                items-center
                                gap-2
                            "
                        >
                            <div
                                className="
                                    h-2
                                    w-2
                                    animate-pulse
                                    rounded-full
                                    bg-slate-800
                                "
                            />

                            <div
                                className="
                                    h-2
                                    w-16
                                    animate-pulse
                                    rounded
                                    bg-slate-800
                                "
                            />

                            <div
                                className="
                                    ml-auto
                                    h-2
                                    w-6
                                    animate-pulse
                                    rounded
                                    bg-slate-800
                                "
                            />

                            <div
                                className="
                                    h-2
                                    w-8
                                    animate-pulse
                                    rounded
                                    bg-slate-800
                                "
                            />
                        </div>
                    ),
                )}
            </div>
        </div>
    );
}

/* ==============================================================
   EMPTY STATE
   ============================================================== */

function EmptyDistribution() {
    return (
        <div
            className="
                flex
                min-h-[145px]
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
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-full
                    border
                    border-slate-700
                    bg-slate-900/60
                    text-slate-500
                "
            >
                <FiActivity
                    size={17}
                    strokeWidth={1.7}
                    aria-hidden="true"
                />
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
                Risk distribution will appear after
                collision assessments are available.
            </p>
        </div>
    );
}

export default RiskLevelDistribution;