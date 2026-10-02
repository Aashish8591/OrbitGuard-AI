import {
    FiActivity,
    FiAlertCircle,
    FiArrowUpRight,
    FiClock,
    FiCompass,
    FiCrosshair,
    FiRadio,
    FiShield,
    FiTarget,
    FiZap,
} from "react-icons/fi";

/**
 * ================================================================
 * OrbitGuard AI — Latest Risk Assessment
 * ================================================================
 *
 * PURPOSE
 * -------
 * Presentation component for the latest collision-risk assessment.
 *
 * DATA FLOW
 * ---------
 *
 * RiskOverviewPage
 *        ↓
 * GET /api/v1/risk
 *        ↓
 * PagedResponse<RiskAssessmentResponse>
 *        ↓
 * LatestRiskAssessment
 *
 * IMPORTANT
 * ---------
 * - No API calls in this component.
 * - No dummy/generated risk calculations.
 * - Backend values are the source of truth.
 * - No frontend risk-level calculation.
 * - No frontend probability calculation.
 * - Null / undefined values are displayed as "—".
 *
 * Backend fields used:
 *
 * id
 * riskCode
 * satelliteId
 * debrisId
 * closestApproachDistanceKm
 * relativeVelocityKmPerSec
 * collisionProbability
 * riskLevel
 * status
 * assessmentType
 * recommendation
 * remarks
 * assessedAt
 * createdAt
 * updatedAt
 * ================================================================
 */


/* ================================================================
   FORMATTERS
================================================================ */

/**
 * Safely display a backend value.
 */
const displayValue = (value) => {
    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return "—";
    }

    return String(value);
};


/**
 * Format numeric values without changing backend data.
 */
const formatNumber = (
    value,
    maximumFractionDigits = 2,
) => {
    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return "—";
    }

    const numericValue = Number(value);

    if (!Number.isFinite(numericValue)) {
        return "—";
    }

    return numericValue.toLocaleString("en-US", {
        maximumFractionDigits,
    });
};


/**
 * Format backend LocalDateTime / ISO date.
 */
const formatDateTime = (value) => {
    if (!value) {
        return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return String(value);
    }

    return date.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    });
};


/**
 * Short date used in compact metadata.
 */
const formatShortDate = (value) => {
    if (!value) {
        return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return String(value);
    }

    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};


/* ================================================================
   NORMALIZERS
================================================================ */

/**
 * Normalize enum values from Spring Boot.
 */
const normalizeEnum = (value) => {
    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return "";
    }

    return String(value).trim().toUpperCase();
};


/**
 * Risk-level visual configuration.
 *
 * IMPORTANT:
 * This does NOT calculate risk.
 * It only determines how the backend-provided enum
 * should be visually represented.
 */
const getRiskLevelConfig = (riskLevel) => {
    switch (normalizeEnum(riskLevel)) {
        case "CRITICAL":
            return {
                label: "CRITICAL",
                text: "text-rose-300",
                border: "border-rose-400/30",
                background: "bg-rose-400/[0.08]",
                glow: "shadow-[0_0_30px_rgba(244,63,94,0.10)]",
                dot: "bg-rose-400",
                icon: FiAlertCircle,
            };

        case "HIGH":
            return {
                label: "HIGH",
                text: "text-orange-300",
                border: "border-orange-400/30",
                background: "bg-orange-400/[0.08]",
                glow: "shadow-[0_0_30px_rgba(251,146,60,0.08)]",
                dot: "bg-orange-400",
                icon: FiAlertCircle,
            };

        case "MEDIUM":
            return {
                label: "MEDIUM",
                text: "text-amber-300",
                border: "border-amber-400/30",
                background: "bg-amber-400/[0.08]",
                glow: "shadow-[0_0_30px_rgba(251,191,36,0.08)]",
                dot: "bg-amber-400",
                icon: FiActivity,
            };

        case "LOW":
            return {
                label: "LOW",
                text: "text-emerald-300",
                border: "border-emerald-400/30",
                background: "bg-emerald-400/[0.08]",
                glow: "shadow-[0_0_30px_rgba(52,211,153,0.07)]",
                dot: "bg-emerald-400",
                icon: FiShield,
            };

        default:
            return {
                label: "UNKNOWN",
                text: "text-slate-300",
                border: "border-white/[0.08]",
                background: "bg-white/[0.03]",
                glow: "",
                dot: "bg-slate-500",
                icon: FiActivity,
            };
    }
};


/**
 * Status visual configuration.
 */
const getStatusConfig = (status) => {
    switch (normalizeEnum(status)) {
        case "ANALYZED":
            return {
                label: "ANALYZED",
                className:
                    "border-cyan-400/20 bg-cyan-400/[0.07] text-cyan-300",
            };

        case "PENDING":
            return {
                label: "PENDING",
                className:
                    "border-amber-400/20 bg-amber-400/[0.07] text-amber-300",
            };

        case "MITIGATED":
            return {
                label: "MITIGATED",
                className:
                    "border-emerald-400/20 bg-emerald-400/[0.07] text-emerald-300",
            };

        case "CLOSED":
            return {
                label: "CLOSED",
                className:
                    "border-slate-500/30 bg-slate-500/[0.06] text-slate-400",
            };

        default:
            return {
                label: displayValue(status),
                className:
                    "border-white/[0.08] bg-white/[0.03] text-slate-400",
            };
    }
};


/* ================================================================
   SMALL COMPONENTS
================================================================ */

/**
 * Compact section label.
 */
const SectionLabel = ({
    icon: Icon,
    children,
}) => {
    return (
        <div
            className="
                flex
                items-center
                gap-2
                font-['Orbitron']
                text-[9px]
                font-semibold
                uppercase
                tracking-[0.18em]
                text-slate-500
            "
        >
            <Icon
                size={12}
                className="text-cyan-400/70"
            />

            <span>{children}</span>
        </div>
    );
};


/**
 * Small telemetry metric.
 */
const TelemetryMetric = ({
    icon: Icon,
    label,
    value,
    unit,
}) => {
    return (
        <div
            className="
                min-w-0
                rounded-xl
                border
                border-white/[0.055]
                bg-[#030b17]/70
                px-3
                py-3
            "
        >
            <div
                className="
                    flex
                    items-center
                    gap-1.5
                    font-['Inter']
                    text-[9px]
                    uppercase
                    tracking-[0.08em]
                    text-slate-600
                "
            >
                <Icon size={11} />

                <span className="truncate">
                    {label}
                </span>
            </div>

            <div
                className="
                    mt-2
                    flex
                    min-w-0
                    items-baseline
                    gap-1
                "
            >
                <span
                    className="
                        truncate
                        font-mono
                        text-sm
                        font-semibold
                        tabular-nums
                        text-slate-200
                        sm:text-base
                    "
                >
                    {value}
                </span>

                {unit && (
                    <span
                        className="
                            shrink-0
                            font-['Inter']
                            text-[9px]
                            text-slate-600
                        "
                    >
                        {unit}
                    </span>
                )}
            </div>
        </div>
    );
};


/**
 * Relationship identifier.
 */
const ObjectLink = ({
    label,
    value,
    icon: Icon,
}) => {
    return (
        <div
            className="
                flex
                min-w-0
                items-center
                gap-2
            "
        >
            <div
                className="
                    flex
                    h-7
                    w-7
                    shrink-0
                    items-center
                    justify-center
                    rounded-lg
                    border
                    border-cyan-400/10
                    bg-cyan-400/[0.04]
                    text-cyan-400/70
                "
            >
                <Icon size={12} />
            </div>

            <div className="min-w-0">
                <p
                    className="
                        font-['Inter']
                        text-[8px]
                        uppercase
                        tracking-[0.08em]
                        text-slate-600
                    "
                >
                    {label}
                </p>

                <p
                    className="
                        mt-0.5
                        truncate
                        font-mono
                        text-[10px]
                        text-slate-300
                    "
                    title={displayValue(value)}
                >
                    {displayValue(value)}
                </p>
            </div>
        </div>
    );
};


/* ================================================================
   EMPTY STATE
================================================================ */

const EmptyLatestRisk = () => {
    return (
        <section
            className="
                rounded-2xl
                border
                border-white/[0.06]
                bg-[#020817]/75
                p-5
                shadow-[0_15px_50px_rgba(0,0,0,0.20)]
                backdrop-blur-xl
                sm:p-6
            "
        >
            <div
                className="
                    flex
                    min-h-[260px]
                    flex-col
                    items-center
                    justify-center
                    text-center
                "
            >
                <div
                    className="
                        flex
                        h-12
                        w-12
                        items-center
                        justify-center
                        rounded-2xl
                        border
                        border-cyan-400/15
                        bg-cyan-400/[0.05]
                        text-cyan-400/70
                    "
                >
                    <FiCrosshair size={20} />
                </div>

                <h3
                    className="
                        mt-4
                        font-['Orbitron']
                        text-xs
                        font-semibold
                        uppercase
                        tracking-[0.12em]
                        text-slate-300
                    "
                >
                    No Risk Assessment
                </h3>

                <p
                    className="
                        mt-2
                        max-w-sm
                        font-['Inter']
                        text-[11px]
                        leading-5
                        text-slate-600
                    "
                >
                    No active collision-risk assessment is
                    currently available from the backend.
                </p>
            </div>
        </section>
    );
};


/* ================================================================
   MAIN COMPONENT
================================================================ */

/**
 * Latest Risk Assessment
 *
 * Expected usage:
 *
 * <LatestRiskAssessment risk={latestRisk} />
 *
 * OR:
 *
 * <LatestRiskAssessment assessment={latestRisk} />
 */
const LatestRiskAssessment = ({
    risk,
    assessment,
}) => {

    const latestRisk = risk ?? assessment;

    /* ============================================================
       NO DATA
    ============================================================ */

    if (!latestRisk) {
        return <EmptyLatestRisk />;
    }


    /* ============================================================
       VISUAL CONFIG
    ============================================================ */

    const riskConfig =
        getRiskLevelConfig(
            latestRisk.riskLevel,
        );

    const statusConfig =
        getStatusConfig(
            latestRisk.status,
        );

    const RiskIcon =
        riskConfig.icon;


    /* ============================================================
       RENDER
    ============================================================ */

    return (
        <section
            aria-labelledby="latest-risk-assessment-heading"
            className={`
                overflow-hidden
                rounded-2xl
                border
                border-white/[0.06]
                bg-[#020817]/80
                shadow-[0_15px_50px_rgba(0,0,0,0.20)]
                backdrop-blur-xl
                ${riskConfig.glow}
            `}
        >

            {/* =====================================================
                HEADER
            ===================================================== */}

            <div
                className="
                    flex
                    flex-col
                    gap-4
                    border-b
                    border-white/[0.05]
                    px-4
                    py-4
                    sm:px-5
                    lg:flex-row
                    lg:items-center
                    lg:justify-between
                "
            >

                <div className="min-w-0">

                    <SectionLabel icon={FiRadio}>
                        Collision Risk Monitor
                    </SectionLabel>

                    <div
                        className="
                            mt-2
                            flex
                            min-w-0
                            flex-wrap
                            items-center
                            gap-x-3
                            gap-y-2
                        "
                    >
                        <h2
                            id="latest-risk-assessment-heading"
                            className="
                                font-['Orbitron']
                                text-sm
                                font-semibold
                                uppercase
                                tracking-[0.08em]
                                text-slate-100
                                sm:text-base
                            "
                        >
                            Latest Assessment
                        </h2>

                        <span
                            className="
                                h-1
                                w-1
                                rounded-full
                                bg-slate-700
                            "
                        />

                        <span
                            className="
                                font-mono
                                text-[10px]
                                text-slate-500
                            "
                        >
                            {displayValue(
                                latestRisk.riskCode,
                            )}
                        </span>
                    </div>

                </div>


                {/* STATUS + RISK */}

                <div
                    className="
                        flex
                        flex-wrap
                        items-center
                        gap-2
                    "
                >

                    <div
                        className={`
                            inline-flex
                            items-center
                            gap-1.5
                            rounded-full
                            border
                            px-2.5
                            py-1.5
                            font-['Orbitron']
                            text-[8px]
                            font-semibold
                            uppercase
                            tracking-[0.10em]
                            ${statusConfig.className}
                        `}
                    >
                        <span
                            className="
                                h-1.5
                                w-1.5
                                rounded-full
                                bg-current
                            "
                        />

                        {statusConfig.label}
                    </div>


                    <div
                        className={`
                            inline-flex
                            items-center
                            gap-1.5
                            rounded-full
                            border
                            px-2.5
                            py-1.5
                            font-['Orbitron']
                            text-[8px]
                            font-semibold
                            uppercase
                            tracking-[0.10em]
                            ${riskConfig.border}
                            ${riskConfig.background}
                            ${riskConfig.text}
                        `}
                    >
                        <RiskIcon size={11} />

                        {riskConfig.label}
                    </div>

                </div>

            </div>


            {/* =====================================================
                MAIN ASSESSMENT
            ===================================================== */}

            <div className="p-4 sm:p-5">

                {/* =================================================
                    PRIMARY RISK SIGNAL
                ================================================= */}

                <div
                    className="
                        grid
                        grid-cols-1
                        gap-5
                        lg:grid-cols-[minmax(0,1fr)_260px]
                    "
                >

                    {/* LEFT SIDE */}

                    <div className="min-w-0">

                        <div
                            className="
                                rounded-2xl
                                border
                                border-white/[0.055]
                                bg-[#030b17]/70
                                p-4
                                sm:p-5
                            "
                        >

                            <div
                                className="
                                    flex
                                    flex-col
                                    gap-5
                                    sm:flex-row
                                    sm:items-center
                                    sm:justify-between
                                "
                            >

                                {/* PROBABILITY */}

                                <div>

                                    <p
                                        className="
                                            font-['Inter']
                                            text-[9px]
                                            uppercase
                                            tracking-[0.12em]
                                            text-slate-600
                                        "
                                    >
                                        Collision Probability
                                    </p>

                                    <div
                                        className="
                                            mt-2
                                            flex
                                            items-baseline
                                            gap-2
                                        "
                                    >
                                        <span
                                            className={`
                                                font-['Orbitron']
                                                text-4xl
                                                font-semibold
                                                leading-none
                                                tracking-tight
                                                sm:text-5xl
                                                ${riskConfig.text}
                                            `}
                                        >
                                            {formatNumber(
                                                latestRisk.collisionProbability,
                                                2,
                                            )}
                                        </span>

                                        <span
                                            className="
                                                font-['Orbitron']
                                                text-sm
                                                text-slate-600
                                            "
                                        >
                                            %
                                        </span>
                                    </div>

                                    <p
                                        className="
                                            mt-2
                                            font-['Inter']
                                            text-[10px]
                                            text-slate-600
                                        "
                                    >
                                        Backend risk-engine assessment
                                    </p>

                                </div>


                                {/* RISK ICON */}

                                <div
                                    className={`
                                        flex
                                        h-16
                                        w-16
                                        shrink-0
                                        items-center
                                        justify-center
                                        self-start
                                        rounded-2xl
                                        border
                                        sm:self-center
                                        ${riskConfig.border}
                                        ${riskConfig.background}
                                        ${riskConfig.text}
                                    `}
                                >
                                    <RiskIcon size={27} />
                                </div>

                            </div>


                            {/* PROBABILITY INDICATOR */}

                            <div className="mt-5">

                                <div
                                    className="
                                        h-1.5
                                        overflow-hidden
                                        rounded-full
                                        bg-white/[0.045]
                                    "
                                >
                                    <div
                                        className={`
                                            h-full
                                            rounded-full
                                            ${riskConfig.dot}
                                        `}
                                        style={{
                                            width:
                                                Number.isFinite(
                                                    Number(
                                                        latestRisk.collisionProbability,
                                                    ),
                                                )
                                                    ? `${Math.max(
                                                        0,
                                                        Math.min(
                                                            Number(
                                                                latestRisk.collisionProbability,
                                                            ),
                                                            100,
                                                        ),
                                                    )}%`
                                                    : "0%",
                                        }}
                                    />
                                </div>

                                <div
                                    className="
                                        mt-2
                                        flex
                                        justify-between
                                        font-mono
                                        text-[8px]
                                        text-slate-700
                                    "
                                >
                                    <span>0%</span>
                                    <span>25%</span>
                                    <span>50%</span>
                                    <span>75%</span>
                                    <span>100%</span>
                                </div>

                            </div>

                        </div>


                        {/* =================================================
                            TELEMETRY
                        ================================================= */}

                        <div
                            className="
                                mt-3
                                grid
                                grid-cols-1
                                gap-2
                                sm:grid-cols-2
                            "
                        >

                            <TelemetryMetric
                                icon={FiTarget}
                                label="Closest Approach"
                                value={formatNumber(
                                    latestRisk.closestApproachDistanceKm,
                                    3,
                                )}
                                unit="km"
                            />

                            <TelemetryMetric
                                icon={FiZap}
                                label="Relative Velocity"
                                value={formatNumber(
                                    latestRisk.relativeVelocityKmPerSec,
                                    3,
                                )}
                                unit="km/s"
                            />

                        </div>

                    </div>


                    {/* RIGHT SIDE — OBJECT PAIR */}

                    <div
                        className="
                            rounded-2xl
                            border
                            border-white/[0.055]
                            bg-[#030b17]/70
                            p-4
                            sm:p-5
                        "
                    >

                        <SectionLabel icon={FiCrosshair}>
                            Object Pair
                        </SectionLabel>

                        <div
                            className="
                                mt-4
                                space-y-4
                            "
                        >

                            <ObjectLink
                                icon={FiRadio}
                                label="Satellite ID"
                                value={
                                    latestRisk.satelliteId
                                }
                            />

                            <div
                                className="
                                    ml-3.5
                                    h-5
                                    border-l
                                    border-dashed
                                    border-cyan-400/15
                                "
                            />

                            <ObjectLink
                                icon={FiActivity}
                                label="Debris ID"
                                value={
                                    latestRisk.debrisId
                                }
                            />

                        </div>


                        <div
                            className="
                                mt-5
                                border-t
                                border-white/[0.045]
                                pt-4
                            "
                        >

                            <div
                                className="
                                    flex
                                    items-center
                                    justify-between
                                    gap-3
                                "
                            >

                                <span
                                    className="
                                        font-['Inter']
                                        text-[9px]
                                        uppercase
                                        tracking-[0.08em]
                                        text-slate-600
                                    "
                                >
                                    Assessment Type
                                </span>

                                <span
                                    className="
                                        rounded-md
                                        border
                                        border-white/[0.06]
                                        bg-white/[0.025]
                                        px-2
                                        py-1
                                        font-mono
                                        text-[8px]
                                        text-slate-400
                                    "
                                >
                                    {displayValue(
                                        latestRisk.assessmentType,
                                    )}
                                </span>

                            </div>

                        </div>

                    </div>

                </div>


                {/* =====================================================
                    RECOMMENDATION
                ===================================================== */}

                <div
                    className="
                        mt-4
                        rounded-2xl
                        border
                        border-cyan-400/10
                        bg-cyan-400/[0.025]
                        p-4
                        sm:p-5
                    "
                >

                    <div
                        className="
                            flex
                            items-start
                            gap-3
                        "
                    >

                        <div
                            className="
                                flex
                                h-8
                                w-8
                                shrink-0
                                items-center
                                justify-center
                                rounded-lg
                                border
                                border-cyan-400/15
                                bg-cyan-400/[0.05]
                                text-cyan-300
                            "
                        >
                            <FiCompass size={14} />
                        </div>

                        <div className="min-w-0">

                            <p
                                className="
                                    font-['Orbitron']
                                    text-[9px]
                                    font-semibold
                                    uppercase
                                    tracking-[0.14em]
                                    text-cyan-300
                                "
                            >
                                Risk Engine Recommendation
                            </p>

                            <p
                                className="
                                    mt-2
                                    font-['Inter']
                                    text-[11px]
                                    leading-5
                                    text-slate-400
                                "
                            >
                                {displayValue(
                                    latestRisk.recommendation,
                                )}
                            </p>

                        </div>

                    </div>

                </div>


                {/* =====================================================
                    FOOTER METADATA
                ===================================================== */}

                <div
                    className="
                        mt-4
                        flex
                        flex-col
                        gap-3
                        border-t
                        border-white/[0.045]
                        pt-4
                        sm:flex-row
                        sm:items-center
                        sm:justify-between
                    "
                >

                    <div
                        className="
                            flex
                            flex-wrap
                            items-center
                            gap-x-4
                            gap-y-2
                        "
                    >

                        <div
                            className="
                                flex
                                items-center
                                gap-1.5
                            "
                        >
                            <FiClock
                                size={11}
                                className="text-slate-700"
                            />

                            <span
                                className="
                                    font-['Inter']
                                    text-[9px]
                                    text-slate-600
                                "
                            >
                                Assessed
                            </span>

                            <span
                                className="
                                    font-mono
                                    text-[9px]
                                    text-slate-500
                                "
                            >
                                {formatDateTime(
                                    latestRisk.assessedAt,
                                )}
                            </span>
                        </div>


                        <div
                            className="
                                flex
                                items-center
                                gap-1.5
                            "
                        >
                            <FiActivity
                                size={11}
                                className="text-slate-700"
                            />

                            <span
                                className="
                                    font-['Inter']
                                    text-[9px]
                                    text-slate-600
                                "
                            >
                                Updated
                            </span>

                            <span
                                className="
                                    font-mono
                                    text-[9px]
                                    text-slate-500
                                "
                            >
                                {formatShortDate(
                                    latestRisk.updatedAt,
                                )}
                            </span>
                        </div>

                    </div>


                    {/* DETAIL INDICATOR */}

                    <div
                        className="
                            inline-flex
                            items-center
                            gap-1.5
                            self-start
                            font-['Orbitron']
                            text-[8px]
                            uppercase
                            tracking-[0.12em]
                            text-slate-600
                        "
                    >
                        <span>
                            Risk Assessment Record
                        </span>

                        <FiArrowUpRight size={11} />
                    </div>

                </div>

            </div>

        </section>
    );
};

export default LatestRiskAssessment;