/**
 * ================================================================
 * OrbitGuard AI — Latest Risk Assessment
 * ================================================================
 *
 * PURPOSE
 * ------------------------------------------------
 * Compact presentation component for the latest collision-risk
 * assessment.
 *
 * ARCHITECTURE
 * ------------------------------------------------
 * - No API calls.
 * - No dummy data.
 * - No risk calculation.
 * - Backend remains the source of truth.
 * - Only visual formatting is performed here.
 * - Null / undefined / empty values display as "—".
 *
 * UI PRINCIPLES
 * ------------------------------------------------
 * - Compact mission-control layout
 * - Strong information hierarchy
 * - No oversized numbers
 * - No unnecessary recommendation/footer sections
 * - Responsive at all breakpoints
 * - Long IDs never break the layout
 *
 * ================================================================
 */

import {
    MdAnalytics,
    MdCalendarToday,
    MdCheckCircleOutline,
    MdDeleteOutline,
    MdOutlineAssessment,
    MdSatelliteAlt,
    MdWarningAmber,
} from "react-icons/md";

/* ================================================================
   FORMATTERS
================================================================ */

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
        hour12: false,
    });
};

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
   NORMALIZER
================================================================ */

const normalizeEnum = (value) => {
    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return "";
    }

    return String(value)
        .trim()
        .toUpperCase();
};

/* ================================================================
   RISK CONFIGURATION
================================================================ */

const getRiskLevelConfig = (riskLevel) => {
    switch (normalizeEnum(riskLevel)) {
        case "CRITICAL":
            return {
                label: "CRITICAL",
                Icon: MdWarningAmber,
                text: "text-rose-300",
                border: "border-rose-400/25",
                background: "bg-rose-400/[0.06]",
                accent: "bg-rose-400",
                iconBackground: "bg-rose-400/[0.06]",
            };

        case "HIGH":
            return {
                label: "HIGH",
                Icon: MdWarningAmber,
                text: "text-orange-300",
                border: "border-orange-400/25",
                background: "bg-orange-400/[0.06]",
                accent: "bg-orange-400",
                iconBackground: "bg-orange-400/[0.06]",
            };

        case "MEDIUM":
            return {
                label: "MEDIUM",
                Icon: MdWarningAmber,
                text: "text-amber-300",
                border: "border-amber-400/25",
                background: "bg-amber-400/[0.06]",
                accent: "bg-amber-400",
                iconBackground: "bg-amber-400/[0.06]",
            };

        case "LOW":
            return {
                label: "LOW",
                Icon: MdCheckCircleOutline,
                text: "text-emerald-300",
                border: "border-emerald-400/25",
                background: "bg-emerald-400/[0.06]",
                accent: "bg-emerald-400",
                iconBackground: "bg-emerald-400/[0.06]",
            };

        default:
            return {
                label: displayValue(riskLevel),
                Icon: MdOutlineAssessment,
                text: "text-slate-300",
                border: "border-white/[0.08]",
                background: "bg-white/[0.025]",
                accent: "bg-slate-500",
                iconBackground: "bg-white/[0.025]",
            };
    }
};

/* ================================================================
   STATUS CONFIGURATION
================================================================ */

const getStatusConfig = (status) => {
    switch (normalizeEnum(status)) {
        case "ANALYZED":
            return {
                label: "ANALYZED",
                className:
                    "border-cyan-400/20 bg-cyan-400/[0.06] text-cyan-300",
            };

        case "PENDING":
            return {
                label: "PENDING",
                className:
                    "border-amber-400/20 bg-amber-400/[0.06] text-amber-300",
            };

        case "MITIGATED":
            return {
                label: "MITIGATED",
                className:
                    "border-emerald-400/20 bg-emerald-400/[0.06] text-emerald-300",
            };

        case "CLOSED":
            return {
                label: "CLOSED",
                className:
                    "border-slate-500/25 bg-slate-500/[0.05] text-slate-400",
            };

        default:
            return {
                label: displayValue(status),
                className:
                    "border-white/[0.08] bg-white/[0.025] text-slate-400",
            };
    }
};

/* ================================================================
   SECTION LABEL
================================================================ */

const SectionLabel = ({
    Icon,
    children,
}) => {
    return (
        <div className="flex min-w-0 items-center gap-2">
            {Icon && (
                <Icon
                    size={13}
                    className="shrink-0 text-cyan-400"
                    aria-hidden="true"
                />
            )}

            <span
                className="
                    truncate
                    font-['Orbitron']
                    text-[8px]
                    font-semibold
                    uppercase
                    tracking-[0.16em]
                    text-slate-500
                "
            >
                {children}
            </span>
        </div>
    );
};

/* ================================================================
   OBJECT ROW
================================================================ */

const ObjectRow = ({
    Icon,
    label,
    value,
}) => {
    return (
        <div className="flex min-w-0 items-center gap-3">
            <div
                className="
                    flex
                    h-9
                    w-9
                    shrink-0
                    items-center
                    justify-center
                    rounded-lg
                    border
                    border-cyan-400/15
                    bg-cyan-400/[0.035]
                "
            >
                <Icon
                    size={18}
                    className="text-cyan-300"
                    aria-hidden="true"
                />
            </div>

            <div className="min-w-0 flex-1">
                <p
                    className="
                        font-['Inter']
                        text-[7px]
                        font-medium
                        uppercase
                        tracking-[0.10em]
                        text-slate-600
                    "
                >
                    {label}
                </p>

                <p
                    className="
                        mt-1
                        overflow-hidden
                        text-ellipsis
                        whitespace-nowrap
                        font-mono
                        text-[10px]
                        font-semibold
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
   TELEMETRY CARD
================================================================ */

const TelemetryCard = ({
    label,
    value,
    unit,
}) => {
    return (
        <div
            className="
                min-w-0
                rounded-lg
                border
                border-white/[0.055]
                bg-[#020914]/65
                px-3
                py-2.5
            "
        >
            <p
                className="
                    truncate
                    font-['Inter']
                    text-[7px]
                    font-medium
                    uppercase
                    tracking-[0.10em]
                    text-slate-600
                "
            >
                {label}
            </p>

            <div className="mt-1 flex min-w-0 items-baseline gap-1">
                <span
                    className="
                        min-w-0
                        truncate
                        font-mono
                        text-[13px]
                        font-semibold
                        tabular-nums
                        text-slate-200
                    "
                >
                    {value}
                </span>

                {unit && (
                    <span
                        className="
                            shrink-0
                            font-['Inter']
                            text-[7px]
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

/* ================================================================
   EMPTY STATE
================================================================ */

const EmptyLatestRisk = () => {
    return (
        <section
            className="
                w-full
                overflow-hidden
                rounded-xl
                border
                border-white/[0.06]
                bg-[#020817]/90
            "
        >
            <div
                className="
                    flex
                    min-h-[170px]
                    flex-col
                    items-center
                    justify-center
                    px-5
                    text-center
                "
            >
                <div
                    className="
                        flex
                        h-10
                        w-10
                        items-center
                        justify-center
                        rounded-lg
                        border
                        border-cyan-400/15
                        bg-cyan-400/[0.035]
                    "
                >
                    <MdOutlineAssessment
                        size={20}
                        className="text-cyan-400"
                        aria-hidden="true"
                    />
                </div>

                <h3
                    className="
                        mt-3
                        font-['Orbitron']
                        text-[9px]
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
                        mt-1.5
                        max-w-xs
                        font-['Inter']
                        text-[9px]
                        leading-4
                        text-slate-600
                    "
                >
                    No collision-risk assessment is currently
                    available from the backend.
                </p>
            </div>
        </section>
    );
};

/* ================================================================
   MAIN COMPONENT
================================================================ */

const LatestRiskAssessment = ({
    risk,
    assessment,
}) => {
    /*
     * Backend remains the source of truth.
     *
     * Supports both prop names without creating
     * or transforming backend data.
     */
    const latestRisk = risk ?? assessment;

    if (!latestRisk) {
        return <EmptyLatestRisk />;
    }

    const riskConfig = getRiskLevelConfig(
        latestRisk.riskLevel,
    );

    const statusConfig = getStatusConfig(
        latestRisk.status,
    );

    const RiskIcon = riskConfig.Icon;

    /* ------------------------------------------------------------
       Probability
    ------------------------------------------------------------ */

    const probability = Number(
        latestRisk.collisionProbability,
    );

    const hasProbability =
        Number.isFinite(probability);

    const probabilityWidth = hasProbability
        ? Math.max(
              0,
              Math.min(probability, 100),
          )
        : 0;

    /* ------------------------------------------------------------
       Render
    ------------------------------------------------------------ */

    return (
        <section
            aria-labelledby="latest-risk-assessment-heading"
            className="
                w-full
                min-w-0
                overflow-hidden
                rounded-xl
                border
                border-white/[0.065]
                bg-[#020817]/90
                shadow-[0_12px_40px_rgba(0,0,0,0.18)]
                backdrop-blur-xl
            "
        >
            {/* ====================================================
                HEADER
            ==================================================== */}

            <header
                className="
                    flex
                    min-w-0
                    flex-col
                    gap-3
                    border-b
                    border-white/[0.05]
                    px-4
                    py-3.5
                    sm:px-5
                    sm:py-4
                    lg:flex-row
                    lg:items-start
                    lg:justify-between
                "
            >
                <div className="min-w-0">
                    <SectionLabel Icon={MdOutlineAssessment}>
                        Latest Assessment
                    </SectionLabel>

                    <h2
                        id="latest-risk-assessment-heading"
                        className="
                            mt-1.5
                            font-['Orbitron']
                            text-[11px]
                            font-semibold
                            uppercase
                            leading-[1.35]
                            tracking-[0.07em]
                            text-slate-100
                            sm:text-xs
                        "
                    >
                        Latest Risk Assessment
                    </h2>

                    <div className="mt-1.5 flex items-center gap-2">
                        <span
                            className="
                                h-1.5
                                w-1.5
                                shrink-0
                                rounded-full
                                bg-slate-600
                            "
                        />

                        <span
                            className="
                                truncate
                                font-mono
                                text-[8px]
                                text-slate-600
                            "
                            title={displayValue(
                                latestRisk.riskCode,
                            )}
                        >
                            {displayValue(
                                latestRisk.riskCode,
                            )}
                        </span>
                    </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                    {/* STATUS */}

                    <div
                        className={`
                            inline-flex
                            items-center
                            gap-1.5
                            rounded-lg
                            border
                            px-2.5
                            py-1.5
                            font-['Orbitron']
                            text-[7px]
                            font-semibold
                            uppercase
                            tracking-[0.07em]
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

                    {/* RISK */}

                    <div
                        className={`
                            inline-flex
                            items-center
                            gap-1.5
                            rounded-lg
                            border
                            px-2.5
                            py-1.5
                            font-['Orbitron']
                            text-[7px]
                            font-semibold
                            uppercase
                            tracking-[0.07em]
                            ${riskConfig.border}
                            ${riskConfig.background}
                            ${riskConfig.text}
                        `}
                    >
                        <RiskIcon
                            size={12}
                            aria-hidden="true"
                        />

                        {riskConfig.label}
                    </div>
                </div>
            </header>

            {/* ====================================================
                MAIN CONTENT
            ==================================================== */}

            <div className="grid min-w-0 grid-cols-1 gap-3 p-3.5 sm:p-4 lg:grid-cols-[0.9fr_1.1fr]">
                {/* =================================================
                    LEFT — RISK SUMMARY
                ================================================= */}

                <div
                    className="
                        min-w-0
                        rounded-xl
                        border
                        border-white/[0.055]
                        bg-[#030b17]/70
                        p-4
                    "
                >
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                            <p
                                className="
                                    font-['Inter']
                                    text-[8px]
                                    font-medium
                                    uppercase
                                    tracking-[0.11em]
                                    text-slate-600
                                "
                            >
                                Collision Probability
                            </p>

                            <div className="mt-1 flex items-baseline gap-1">
                                <span
                                    className={`
                                        font-['Orbitron']
                                        text-[2rem]
                                        font-semibold
                                        leading-none
                                        tracking-tight
                                        ${riskConfig.text}
                                        sm:text-[1.3rem]
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
                                        text-[12px]
                                        text-slate-600
                                    "
                                >
                                    %
                                </span>
                            </div>

                            <p
                                className="
                                    mt-1.5
                                    font-['Inter']
                                    text-[8px]
                                    text-slate-600
                                "
                            >
                                Backend risk-engine result
                            </p>
                        </div>

                        {/* SMALL RISK ICON */}

                        <div
                            className={`
                                flex
                                h-10
                                w-10
                                shrink-0
                                items-center
                                justify-center
                                rounded-lg
                                border
                                ${riskConfig.border}
                                ${riskConfig.iconBackground}
                                ${riskConfig.text}
                            `}
                        >
                            <RiskIcon
                                size={21}
                                aria-hidden="true"
                            />
                        </div>
                    </div>

                    {/* PROBABILITY BAR */}

                    <div className="mt-4">
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
                                    ${riskConfig.accent}
                                `}
                                style={{
                                    width: `${probabilityWidth}%`,
                                }}
                            />
                        </div>

                        <div
                            className="
                                mt-1.5
                                flex
                                justify-between
                                font-mono
                                text-[6px]
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

                    {/* TELEMETRY */}

                    <div className="mt-3 grid grid-cols-2 gap-2">
                        <TelemetryCard
                            label="Closest Approach"
                            value={formatNumber(
                                latestRisk.closestApproachDistanceKm,
                                3,
                            )}
                            unit="km"
                        />

                        <TelemetryCard
                            label="Relative Velocity"
                            value={formatNumber(
                                latestRisk.relativeVelocityKmPerSec,
                                3,
                            )}
                            unit="km/s"
                        />
                    </div>
                </div>

                {/* =================================================
                    RIGHT — OBJECT PAIR
                ================================================= */}

                <div
                    className="
                        min-w-0
                        rounded-xl
                        border
                        border-white/[0.055]
                        bg-[#030b17]/70
                        p-4
                    "
                >
                    <SectionLabel Icon={MdAnalytics}>
                        Object Pair
                    </SectionLabel>

                    <div className="mt-4 space-y-3">
                        <ObjectRow
                            Icon={MdSatelliteAlt}
                            label="Satellite ID"
                            value={
                                latestRisk.satelliteId
                            }
                        />

                        <div className="flex items-center gap-3 pl-4">
                            <div
                                className="
                                    h-4
                                    border-l
                                    border-dashed
                                    border-cyan-400/15
                                "
                            />

                            <span
                                className="
                                    flex
                                    h-5
                                    w-5
                                    items-center
                                    justify-center
                                    rounded-full
                                    border
                                    border-cyan-400/10
                                    bg-[#030b17]
                                "
                            >
                                <span
                                    className="
                                        font-mono
                                        text-[9px]
                                        text-cyan-400
                                    "
                                >
                                    ↕
                                </span>
                            </span>
                        </div>

                        <ObjectRow
                            Icon={MdDeleteOutline}
                            label="Debris ID"
                            value={
                                latestRisk.debrisId
                            }
                        />
                    </div>

                    {/* ASSESSMENT TYPE */}

                    <div
                        className="
                            mt-4
                            flex
                            items-center
                            justify-between
                            gap-3
                            border-t
                            border-white/[0.05]
                            pt-3.5
                        "
                    >
                        <span
                            className="
                                font-['Inter']
                                text-[8px]
                                font-medium
                                uppercase
                                tracking-[0.09em]
                                text-slate-600
                            "
                        >
                            Assessment Type
                        </span>

                        <span
                            className="
                                max-w-[140px]
                                truncate
                                rounded-md
                                border
                                border-white/[0.07]
                                bg-white/[0.025]
                                px-2
                                py-1.5
                                font-mono
                                text-[7px]
                                font-medium
                                text-slate-400
                            "
                            title={displayValue(
                                latestRisk.assessmentType,
                            )}
                        >
                            {displayValue(
                                latestRisk.assessmentType,
                            )}
                        </span>
                    </div>
                </div>
            </div>

            {/* ====================================================
                SMALL METADATA FOOTER
            ==================================================== */}

            <footer
                className="
                    flex
                    flex-wrap
                    items-center
                    justify-between
                    gap-2
                    border-t
                    border-white/[0.045]
                    px-4
                    py-2.5
                    sm:px-5
                "
            >
                <div className="flex items-center gap-1.5">
                    <MdCalendarToday
                        size={10}
                        className="text-slate-700"
                        aria-hidden="true"
                    />

                    <span
                        className="
                            font-['Inter']
                            text-[7px]
                            text-slate-600
                        "
                    >
                        Assessed
                    </span>

                    <span
                        className="
                            font-mono
                            text-[7px]
                            text-slate-500
                        "
                    >
                        {formatDateTime(
                            latestRisk.assessedAt,
                        )}
                    </span>
                </div>

                <div className="flex items-center gap-1.5">
                    <MdCheckCircleOutline
                        size={10}
                        className="text-slate-700"
                        aria-hidden="true"
                    />

                    <span
                        className="
                            font-['Inter']
                            text-[7px]
                            text-slate-600
                        "
                    >
                        Updated
                    </span>

                    <span
                        className="
                            font-mono
                            text-[7px]
                            text-slate-500
                        "
                    >
                        {formatShortDate(
                            latestRisk.updatedAt,
                        )}
                    </span>
                </div>
            </footer>
        </section>
    );
};

export default LatestRiskAssessment;