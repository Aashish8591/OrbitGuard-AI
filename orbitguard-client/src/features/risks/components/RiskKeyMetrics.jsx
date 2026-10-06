import {
    FiActivity,
    FiCompass,
    FiFileText,
} from "react-icons/fi";


/* ================================================================
   FORMATTERS
================================================================ */

const formatNumber = (
    value,
    decimals = 3,
) => {
    const number = Number(value);

    if (!Number.isFinite(number)) {
        return "—";
    }

    return number.toLocaleString("en-US", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    });
};


const formatAssessmentType = (value) => {
    if (
        value === null ||
        value === undefined ||
        String(value).trim() === ""
    ) {
        return "—";
    }

    return String(value)
        .replace(/_/g, " ")
        .toUpperCase();
};


/* ================================================================
   METRIC CONFIGURATION
================================================================ */

const getMetricStyles = (accent) => {
    switch (accent) {
        case "amber":
            return {
                icon:
                    "border-amber-400/25 bg-amber-400/[0.06] text-amber-300",
                value:
                    "text-amber-200",
                glow:
                    "bg-amber-400/[0.035]",
                line:
                    "from-transparent via-amber-400/50 to-transparent",
                dot:
                    "bg-amber-300",
                border:
                    "group-hover:border-amber-400/25",
                index:
                    "text-amber-400/40",
            };

        case "blue":
            return {
                icon:
                    "border-blue-400/25 bg-blue-400/[0.06] text-blue-300",
                value:
                    "text-blue-100",
                glow:
                    "bg-blue-400/[0.03]",
                line:
                    "from-transparent via-blue-400/45 to-transparent",
                dot:
                    "bg-blue-300",
                border:
                    "group-hover:border-blue-400/25",
                index:
                    "text-blue-400/40",
            };

        case "cyan":
        default:
            return {
                icon:
                    "border-cyan-400/25 bg-cyan-400/[0.06] text-cyan-300",
                value:
                    "text-slate-100",
                glow:
                    "bg-cyan-400/[0.035]",
                line:
                    "from-transparent via-cyan-400/50 to-transparent",
                dot:
                    "bg-cyan-300",
                border:
                    "group-hover:border-cyan-400/25",
                index:
                    "text-cyan-400/40",
            };
    }
};


/* ================================================================
   METRIC CARD
================================================================ */

const MetricCard = ({
    icon: Icon,
    label,
    value,
    unit,
    accent = "cyan",
    index,
    description,
}) => {
    const styles = getMetricStyles(accent);

    return (
        <article
            className={`
                group
                relative
                min-w-0
                overflow-hidden
                rounded-2xl
                border
                border-white/[0.07]
                bg-[#020a16]
                px-4
                py-4
                shadow-[0_14px_35px_rgba(0,0,0,0.16)]
                transition-all
                duration-300
                hover:-translate-y-0.5
                hover:shadow-[0_18px_45px_rgba(0,0,0,0.24)]
                ${styles.border}
                sm:px-5
                sm:py-5
            `}
        >
            {/* =====================================================
                ATMOSPHERIC GLOW
            ===================================================== */}

            <div
                aria-hidden="true"
                className={`
                    pointer-events-none
                    absolute
                    -right-20
                    -top-20
                    h-40
                    w-40
                    rounded-full
                    blur-[70px]
                    opacity-60
                    transition-opacity
                    duration-300
                    group-hover:opacity-100
                    ${styles.glow}
                `}
            />

            {/* =====================================================
                TECHNICAL GRID
            ===================================================== */}

            <div
                aria-hidden="true"
                className="
                    pointer-events-none
                    absolute
                    inset-0
                    opacity-[0.16]
                    [background-image:linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)]
                    [background-size:26px_26px]
                    [mask-image:linear-gradient(to_bottom,black,transparent)]
                "
            />

            {/* =====================================================
                TOP SCAN LINE
            ===================================================== */}

            <div
                aria-hidden="true"
                className={`
                    pointer-events-none
                    absolute
                    left-0
                    right-0
                    top-0
                    h-px
                    bg-gradient-to-r
                    ${styles.line}
                    opacity-60
                `}
            />

            {/* =====================================================
                HEADER ROW
            ===================================================== */}

            <div
                className="
                    relative
                    z-10
                    flex
                    items-start
                    justify-between
                    gap-3
                "
            >
                {/* Icon */}

                <div
                    className={`
                        relative
                        flex
                        h-10
                        w-10
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        border
                        ${styles.icon}
                    `}
                >
                    <Icon size={17} />

                    {/* Status point */}

                    <span
                        className={`
                            absolute
                            -right-1
                            -top-1
                            h-1.5
                            w-1.5
                            rounded-full
                            ${styles.dot}
                            shadow-[0_0_8px_currentColor]
                        `}
                    />
                </div>

                {/* Metric number */}

                <span
                    className={`
                        font-['Orbitron']
                        text-[8px]
                        font-semibold
                        tracking-[0.12em]
                        ${styles.index}
                    `}
                >
                    {index}
                </span>
            </div>


            {/* =====================================================
                LABEL
            ===================================================== */}

            <div
                className="
                    relative
                    z-10
                    mt-4
                "
            >
                <div className="flex items-center gap-2">
                    <span
                        className={`
                            h-1
                            w-1
                            shrink-0
                            rounded-full
                            ${styles.dot}
                            opacity-70
                        `}
                    />

                    <p
                        className="
                            truncate
                            font-['Inter']
                            text-[8px]
                            font-semibold
                            uppercase
                            tracking-[0.13em]
                            text-slate-500
                        "
                        title={label}
                    >
                        {label}
                    </p>
                </div>
            </div>


            {/* =====================================================
                VALUE
            ===================================================== */}

            <div
                className="
                    relative
                    z-10
                    mt-2
                    flex
                    min-w-0
                    items-baseline
                    gap-2
                "
            >
                <span
                    className={`
                        min-w-0
                        truncate
                        font-['Orbitron']
                        text-[20px]
                        font-semibold
                        leading-none
                        tracking-[0.01em]
                        sm:text-[22px]
                        ${styles.value}
                    `}
                    title={value}
                >
                    {value}
                </span>

                {unit && (
                    <span
                        className="
                            shrink-0
                            font-['Inter']
                            text-[8px]
                            font-medium
                            uppercase
                            tracking-[0.08em]
                            text-slate-600
                        "
                    >
                        {unit}
                    </span>
                )}
            </div>


            {/* =====================================================
                DESCRIPTION
            ===================================================== */}

            <p
                className="
                    relative
                    z-10
                    mt-2
                    truncate
                    font-['Inter']
                    text-[7px]
                    uppercase
                    tracking-[0.07em]
                    text-slate-700
                "
            >
                {description}
            </p>


            {/* =====================================================
                BOTTOM TELEMETRY LINE
            ===================================================== */}

            <div
                className="
                    relative
                    z-10
                    mt-4
                    flex
                    items-center
                    justify-between
                "
            >
                <div className="flex items-center gap-1.5">
                    <span
                        className={`
                            h-1
                            w-1
                            rounded-full
                            ${styles.dot}
                            opacity-60
                        `}
                    />

                    <span
                        className="
                            font-['Inter']
                            text-[6px]
                            font-medium
                            uppercase
                            tracking-[0.12em]
                            text-slate-700
                        "
                    >
                        Backend telemetry
                    </span>
                </div>

                <span
                    className="
                        font-['Orbitron']
                        text-[6px]
                        tracking-[0.08em]
                        text-slate-700
                    "
                >
                    LIVE
                </span>
            </div>
        </article>
    );
};


/* ================================================================
   RISK KEY METRICS
================================================================ */

const RiskKeyMetrics = ({ risk }) => {
    if (!risk) {
        return null;
    }

    return (
        <section
            aria-label="Risk key metrics"
            className="
                relative
            "
        >
            {/* =====================================================
                SECTION HEADER
            ===================================================== */}

            <div
                className="
                    mb-3
                    flex
                    items-center
                    justify-between
                    gap-3
                    px-1
                "
            >
                <div className="flex items-center gap-2.5">
                    <div
                        className="
                            flex
                            h-6
                            w-6
                            items-center
                            justify-center
                            rounded-md
                            border
                            border-cyan-400/15
                            bg-cyan-400/[0.035]
                            text-cyan-300
                        "
                    >
                        <FiActivity size={12} />
                    </div>

                    <div>
                        <h2
                            className="
                                font-['Orbitron']
                                text-[9px]
                                font-semibold
                                uppercase
                                tracking-[0.13em]
                                text-slate-200
                            "
                        >
                            Key Metrics
                        </h2>

                        <p
                            className="
                                mt-0.5
                                font-['Inter']
                                text-[7px]
                                uppercase
                                tracking-[0.08em]
                                text-slate-700
                            "
                        >
                            Collision telemetry
                        </p>
                    </div>
                </div>

                <div
                    className="
                        hidden
                        items-center
                        gap-1.5
                        sm:flex
                    "
                >
                    <span
                        className="
                            h-1
                            w-1
                            rounded-full
                            bg-emerald-400
                            shadow-[0_0_7px_rgba(52,211,153,0.7)]
                        "
                    />

                    <span
                        className="
                            font-['Inter']
                            text-[7px]
                            font-medium
                            uppercase
                            tracking-[0.1em]
                            text-slate-700
                        "
                    >
                        Telemetry available
                    </span>
                </div>
            </div>


            {/* =====================================================
                METRIC GRID
            ===================================================== */}

            <div
                className="
                    grid
                    grid-cols-1
                    gap-3
                    md:grid-cols-3
                "
            >
                <MetricCard
                    icon={FiCompass}
                    label="Closest Approach Distance"
                    value={formatNumber(
                        risk.closestApproachDistanceKm,
                    )}
                    unit="km"
                    accent="cyan"
                    index="01"
                    description="Minimum separation distance"
                />

                <MetricCard
                    icon={FiActivity}
                    label="Relative Velocity"
                    value={formatNumber(
                        risk.relativeVelocityKmPerSec,
                    )}
                    unit="km/s"
                    accent="blue"
                    index="02"
                    description="Relative object velocity"
                />

                <MetricCard
                    icon={FiFileText}
                    label="Assessment Type"
                    value={formatAssessmentType(
                        risk.assessmentType,
                    )}
                    accent="amber"
                    index="03"
                    description="Risk engine methodology"
                />
            </div>
        </section>
    );
};


export default RiskKeyMetrics;