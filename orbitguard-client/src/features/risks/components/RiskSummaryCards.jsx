import {
    FiAlertTriangle,
    FiArrowRight,
    FiCheckCircle,
    FiEye,
    FiShield,
} from "react-icons/fi";

/**
 * ================================================================
 * OrbitGuard AI - Risk Summary Cards
 * ================================================================
 *
 * PURPOSE
 * ----------------------------------------------------------------
 * Displays the four operational risk-level summaries:
 *
 *   CRITICAL
 *   HIGH
 *   MEDIUM
 *   LOW
 *
 * DATA FLOW
 * ----------------------------------------------------------------
 *
 * RiskOverviewPage
 *        ↓
 * Risk API / derived overview data
 *        ↓
 * RiskSummaryCards
 *
 * IMPORTANT ARCHITECTURE
 * ----------------------------------------------------------------
 * - This component does NOT call the API.
 * - This component does NOT calculate risk.
 * - This component does NOT calculate collision probability.
 * - RiskLevel values come from the backend.
 * - Counts are supplied by the parent.
 * - No dummy assessment records are used.
 * - The component is reusable and presentation-focused.
 *
 * Supported backend risk levels:
 *
 *   LOW
 *   MEDIUM
 *   HIGH
 *   CRITICAL
 *
 * Example:
 *
 * <RiskSummaryCards
 *     summary={{
 *         critical: 2,
 *         high: 5,
 *         medium: 8,
 *         low: 21,
 *     }}
 *     onRiskLevelSelect={handleRiskLevelSelect}
 * />
 *
 * ================================================================
 */


/* ================================================================
   RISK CARD CONFIGURATION
================================================================ */

const RISK_CARD_CONFIG = [
    {
        key: "critical",
        level: "CRITICAL",
        title: "Critical Risks",
        description: "Immediate action required",
        icon: FiAlertTriangle,

        cardClassName: `
            border-red-500/25
            bg-[linear-gradient(135deg,rgba(127,29,29,0.24),rgba(15,23,42,0.72))]
            hover:border-red-400/40
            hover:bg-[linear-gradient(135deg,rgba(127,29,29,0.30),rgba(15,23,42,0.78))]
        `,

        iconClassName: `
            border-red-400/20
            bg-red-400/[0.08]
            text-red-400
        `,

        countClassName: "text-red-300",

        accentClassName: "bg-red-400",

        glowClassName: `
            bg-red-500/10
            group-hover:bg-red-500/20
        `,
    },

    {
        key: "high",
        level: "HIGH",
        title: "High Risks",
        description: "Close monitoring required",
        icon: FiAlertTriangle,

        cardClassName: `
            border-orange-500/25
            bg-[linear-gradient(135deg,rgba(124,45,18,0.22),rgba(15,23,42,0.72))]
            hover:border-orange-400/40
            hover:bg-[linear-gradient(135deg,rgba(124,45,18,0.28),rgba(15,23,42,0.78))]
        `,

        iconClassName: `
            border-orange-400/20
            bg-orange-400/[0.08]
            text-orange-400
        `,

        countClassName: "text-orange-300",

        accentClassName: "bg-orange-400",

        glowClassName: `
            bg-orange-500/10
            group-hover:bg-orange-500/20
        `,
    },

    {
        key: "medium",
        level: "MEDIUM",
        title: "Medium Risks",
        description: "Increased observation",
        icon: FiEye,

        cardClassName: `
            border-yellow-500/25
            bg-[linear-gradient(135deg,rgba(113,63,18,0.20),rgba(15,23,42,0.72))]
            hover:border-yellow-400/40
            hover:bg-[linear-gradient(135deg,rgba(113,63,18,0.26),rgba(15,23,42,0.78))]
        `,

        iconClassName: `
            border-yellow-400/20
            bg-yellow-400/[0.08]
            text-yellow-300
        `,

        countClassName: "text-yellow-300",

        accentClassName: "bg-yellow-400",

        glowClassName: `
            bg-yellow-500/10
            group-hover:bg-yellow-500/20
        `,
    },

    {
        key: "low",
        level: "LOW",
        title: "Low Risks",
        description: "No immediate action",
        icon: FiCheckCircle,

        cardClassName: `
            border-cyan-500/20
            bg-[linear-gradient(135deg,rgba(8,47,73,0.22),rgba(15,23,42,0.72))]
            hover:border-cyan-400/35
            hover:bg-[linear-gradient(135deg,rgba(8,47,73,0.28),rgba(15,23,42,0.78))]
        `,

        iconClassName: `
            border-cyan-400/20
            bg-cyan-400/[0.07]
            text-cyan-300
        `,

        countClassName: "text-cyan-300",

        accentClassName: "bg-cyan-400",

        glowClassName: `
            bg-cyan-500/10
            group-hover:bg-cyan-500/20
        `,
    },
];


/* ================================================================
   VALUE NORMALIZATION
================================================================ */

/**
 * Safely convert a supplied count into a displayable number.
 *
 * The backend remains the source of truth.
 * This only protects the UI from null / malformed values.
 */
const normalizeCount = (value) => {
    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return 0;
    }

    const numericValue = Number(value);

    if (!Number.isFinite(numericValue)) {
        return 0;
    }

    return Math.max(0, Math.floor(numericValue));
};


/* ================================================================
   LOADING CARD
================================================================ */

const RiskSummaryCardSkeleton = () => {
    return (
        <div
            className="
                relative
                min-w-0
                overflow-hidden
                rounded-xl
                border
                border-white/[0.06]
                bg-[#04101d]/80
                px-4
                py-4
                shadow-[0_10px_30px_rgba(0,0,0,0.16)]
                backdrop-blur-xl
                sm:px-5
            "
            aria-hidden="true"
        >
            <div className="flex items-start justify-between gap-4">

                <div
                    className="
                        h-9
                        w-9
                        animate-pulse
                        rounded-lg
                        bg-white/[0.06]
                    "
                />

                <div
                    className="
                        h-3
                        w-16
                        animate-pulse
                        rounded
                        bg-white/[0.05]
                    "
                />

            </div>

            <div
                className="
                    mt-4
                    h-8
                    w-12
                    animate-pulse
                    rounded
                    bg-white/[0.06]
                "
            />

            <div
                className="
                    mt-2
                    h-2.5
                    w-32
                    animate-pulse
                    rounded
                    bg-white/[0.04]
                "
            />

            <div
                className="
                    mt-4
                    h-px
                    w-full
                    bg-white/[0.04]
                "
            />

            <div
                className="
                    mt-3
                    h-2
                    w-24
                    animate-pulse
                    rounded
                    bg-white/[0.04]
                "
            />
        </div>
    );
};


/* ================================================================
   RISK SUMMARY CARD
================================================================ */

const RiskSummaryCard = ({
    config,
    count,
    selected = false,
    onClick,
}) => {

    const Icon = config.icon;

    const isInteractive =
        typeof onClick === "function";

    const handleClick = () => {
        if (isInteractive) {
            onClick(config.level);
        }
    };

    const handleKeyDown = (event) => {
        if (!isInteractive) {
            return;
        }

        if (
            event.key === "Enter" ||
            event.key === " "
        ) {
            event.preventDefault();
            handleClick();
        }
    };

    return (
        <div
            role={isInteractive ? "button" : undefined}
            tabIndex={isInteractive ? 0 : undefined}
            aria-pressed={
                isInteractive
                    ? selected
                    : undefined
            }
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            className={`
                group
                relative
                min-w-0
                overflow-hidden
                rounded-xl
                border
                px-4
                py-4
                shadow-[0_10px_30px_rgba(0,0,0,0.18)]
                backdrop-blur-xl
                transition-all
                duration-300
                sm:px-5

                ${config.cardClassName}

                ${
                    isInteractive
                        ? `
                            cursor-pointer
                            focus:outline-none
                            focus:ring-1
                            focus:ring-cyan-400/40
                        `
                        : ""
                }

                ${
                    selected
                        ? `
                            ring-1
                            ring-cyan-400/35
                            shadow-[0_0_24px_rgba(34,211,238,0.08)]
                        `
                        : ""
                }
            `}
        >

            {/* =====================================================
                AMBIENT GLOW
            ===================================================== */}

            <div
                className={`
                    pointer-events-none
                    absolute
                    -right-8
                    -top-8
                    h-24
                    w-24
                    rounded-full
                    blur-2xl
                    transition-all
                    duration-500
                    ${config.glowClassName}
                `}
            />


            {/* =====================================================
                TOP ROW
            ===================================================== */}

            <div
                className="
                    relative
                    flex
                    items-start
                    justify-between
                    gap-3
                "
            >

                <div
                    className={`
                        flex
                        h-9
                        w-9
                        shrink-0
                        items-center
                        justify-center
                        rounded-lg
                        border
                        transition-transform
                        duration-300
                        group-hover:scale-105
                        ${config.iconClassName}
                    `}
                >
                    <Icon size={16} />
                </div>


                <div
                    className="
                        flex
                        min-w-0
                        items-center
                        gap-2
                    "
                >

                    <span
                        className={`
                            h-1.5
                            w-1.5
                            shrink-0
                            rounded-full
                            ${config.accentClassName}
                        `}
                    />

                    <span
                        className="
                            truncate
                            font-['Orbitron']
                            text-[8px]
                            font-semibold
                            uppercase
                            tracking-[0.12em]
                            text-slate-400
                            sm:text-[9px]
                        "
                    >
                        {config.level}
                    </span>

                </div>

            </div>


            {/* =====================================================
                COUNT
            ===================================================== */}

            <div
                className="
                    relative
                    mt-3
                    flex
                    items-end
                    justify-between
                    gap-3
                "
            >

                <div className="min-w-0">

                    <div
                        className={`
                            font-['Orbitron']
                            text-2xl
                            font-bold
                            leading-none
                            tracking-tight
                            sm:text-3xl
                            ${config.countClassName}
                        `}
                    >
                        {count}
                    </div>

                    <p
                        className="
                            mt-1.5
                            truncate
                            font-['Inter']
                            text-[9px]
                            leading-4
                            text-slate-400
                            sm:text-[10px]
                        "
                    >
                        {config.description}
                    </p>

                </div>


                {isInteractive && (
                    <div
                        className="
                            mb-0.5
                            flex
                            h-7
                            w-7
                            shrink-0
                            items-center
                            justify-center
                            rounded-md
                            border
                            border-white/[0.06]
                            bg-white/[0.025]
                            text-slate-500
                            opacity-60
                            transition-all
                            duration-300
                            group-hover:translate-x-0.5
                            group-hover:border-white/[0.10]
                            group-hover:text-slate-300
                            group-focus:translate-x-0.5
                        "
                    >
                        <FiArrowRight size={13} />
                    </div>
                )}

            </div>


            {/* =====================================================
                BOTTOM STATUS
            ===================================================== */}

            <div
                className="
                    relative
                    mt-4
                    flex
                    items-center
                    gap-2
                    border-t
                    border-white/[0.05]
                    pt-3
                "
            >

                <FiShield
                    className="
                        shrink-0
                        text-slate-600
                    "
                    size={11}
                />

                <span
                    className="
                        truncate
                        font-['Inter']
                        text-[8px]
                        uppercase
                        tracking-[0.08em]
                        text-slate-600
                        sm:text-[9px]
                    "
                >
                    Active risk assessment
                </span>

            </div>


            {/* =====================================================
                SELECTED INDICATOR
            ===================================================== */}

            <div
                className={`
                    pointer-events-none
                    absolute
                    bottom-0
                    left-0
                    h-[2px]
                    transition-all
                    duration-300
                    ${config.accentClassName}
                    ${
                        selected
                            ? "w-full opacity-100"
                            : "w-0 opacity-0 group-hover:w-full group-hover:opacity-60"
                    }
                `}
            />

        </div>
    );
};


/* ================================================================
   MAIN COMPONENT
================================================================ */

const RiskSummaryCards = ({
    summary = {},
    loading = false,
    selectedRiskLevel = null,
    onRiskLevelSelect,
}) => {

    /* ============================================================
       LOADING STATE
    ============================================================ */

    if (loading) {
        return (
            <section
                aria-label="Risk summary"
                className="
                    grid
                    grid-cols-1
                    gap-3
                    sm:grid-cols-2
                    xl:grid-cols-4
                "
            >
                {RISK_CARD_CONFIG.map((config) => (
                    <RiskSummaryCardSkeleton
                        key={config.key}
                    />
                ))}
            </section>
        );
    }


    /* ============================================================
       NORMAL RENDER
    ============================================================ */

    return (
        <section
            aria-label="Collision risk summary"
            className="
                grid
                grid-cols-1
                gap-3
                sm:grid-cols-2
                xl:grid-cols-4
            "
        >

            {RISK_CARD_CONFIG.map((config) => {

                const count = normalizeCount(
                    summary[config.key],
                );

                const selected =
                    selectedRiskLevel !== null &&
                    selectedRiskLevel !== undefined &&
                    String(selectedRiskLevel).toUpperCase() ===
                        config.level;

                return (
                    <RiskSummaryCard
                        key={config.key}
                        config={config}
                        count={count}
                        selected={selected}
                        onClick={onRiskLevelSelect}
                    />
                );
            })}

        </section>
    );
};


export default RiskSummaryCards;