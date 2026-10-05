/**
 * ================================================================
 * OrbitGuard AI — Risk Hero
 * ================================================================
 *
 * PURPOSE
 * ------------------------------------------------
 * Cinematic introduction section for the Risk Overview page.
 *
 * RESPONSIBILITY
 * ------------------------------------------------
 * - Displays Risk Analysis hero content.
 * - Displays operational capability indicators.
 * - Displays risk-engine capability information.
 * - Uses the existing OrbitGuard risk hero background.
 *
 * DATA RESPONSIBILITY
 * ------------------------------------------------
 * - Presentation-only component.
 * - No API calls.
 * - No backend data fetching.
 * - No risk calculations.
 * - No risk-level calculations.
 * - No assessment trend processing.
 * - No satellite/debris selection logic.
 *
 * BACKEND INTEGRATION
 * ------------------------------------------------
 * Backend integration belongs to the Risk Overview container
 * and dedicated functional components.
 *
 * ================================================================
 */

/* ================================================================
   REACT ICONS
================================================================ */

import {
    FiCrosshair,
    FiRadio,
    FiShield,
    FiTarget,
    FiZap,
} from "react-icons/fi";

/* ================================================================
   SAFE ICON
================================================================ */

const RiskIcon = ({
    icon: Icon,
    size = 14,
    className = "",
}) => {
    if (!Icon) {
        return null;
    }

    return (
        <Icon
            size={size}
            strokeWidth={1.8}
            className={className}
            aria-hidden="true"
        />
    );
};

/* ================================================================
   HERO METRIC
================================================================ */

const HeroMetric = ({
    icon: Icon,
    label,
    value,
    accent = "cyan",
}) => {
    const accentClasses = {
        cyan: {
            wrapper:
                "border-cyan-400/20 bg-cyan-400/[0.045]",
            icon:
                "border-cyan-400/20 bg-cyan-400/[0.08] text-cyan-300",
            value:
                "text-cyan-300",
        },

        red: {
            wrapper:
                "border-red-400/20 bg-red-400/[0.045]",
            icon:
                "border-red-400/20 bg-red-400/[0.08] text-red-300",
            value:
                "text-red-300",
        },

        amber: {
            wrapper:
                "border-amber-400/20 bg-amber-400/[0.045]",
            icon:
                "border-amber-400/20 bg-amber-400/[0.08] text-amber-300",
            value:
                "text-amber-300",
        },
    };

    const colors =
        accentClasses[accent] ||
        accentClasses.cyan;

    return (
        <div
            className={`
                flex
                min-w-0
                items-center
                gap-2.5
                rounded-lg
                border
                px-3
                py-2.5
                ${colors.wrapper}
            `}
        >
            {/* ICON */}

            <div
                className={`
                    flex
                    h-8
                    w-8
                    shrink-0
                    items-center
                    justify-center
                    rounded-lg
                    border
                    ${colors.icon}
                `}
            >
                <RiskIcon
                    icon={Icon}
                    size={14}
                />
            </div>

            {/* CONTENT */}

            <div className="min-w-0">
                <p
                    className="
                        truncate
                        font-['Inter']
                        text-[8px]
                        uppercase
                        tracking-[0.12em]
                        text-slate-500
                    "
                >
                    {label}
                </p>

                <p
                    className={`
                        mt-0.5
                        truncate
                        font-['Orbitron']
                        text-[13px]
                        font-semibold
                        ${colors.value}
                    `}
                >
                    {value}
                </p>
            </div>
        </div>
    );
};

/* ================================================================
   MAIN RISK HERO
================================================================ */

const RiskHero = ({
    className = "",
}) => {
    return (
        <section
            aria-labelledby="risk-operations-heading"
            className={`
                relative
                min-w-0
                overflow-hidden
                rounded-xl
                border
                border-cyan-400/10
                bg-[#020914]
                shadow-[0_20px_70px_rgba(0,0,0,0.35)]
                ${className}
            `}
        >
            {/* =====================================================
                BACKGROUND
            ===================================================== */}

            <div
                aria-hidden="true"
                className="
                    pointer-events-none
                    absolute
                    inset-0
                    bg-cover
                    bg-center
                    bg-no-repeat
                "
                style={{
                    backgroundImage:
                        "url('/images/risk/riskHerobg.png')",
                }}
            />

            {/* =====================================================
                DARK OVERLAY
            ===================================================== */}

            <div
                aria-hidden="true"
                className="
                    pointer-events-none
                    absolute
                    inset-0
                    bg-gradient-to-r
                    from-[#020914]/96
                    via-[#020914]/58
                    to-[#020914]/18
                "
            />

            <div
                aria-hidden="true"
                className="
                    pointer-events-none
                    absolute
                    inset-0
                    bg-gradient-to-t
                    from-[#020914]/95
                    via-transparent
                    to-[#020914]/15
                "
            />

            {/* =====================================================
                HERO CONTENT
            ===================================================== */}

            <div
                className="
                    relative
                    z-10
                    min-h-[460px]
                    p-4
                    sm:min-h-[500px]
                    sm:p-5
                    lg:min-h-[560px]
                    lg:p-6
                    xl:min-h-[460px]
                    2xl:min-h-[620px]
                "
            >
                {/* =================================================
                    MAIN CONTENT
                ================================================= */}

                <div
                    className="
                        min-w-0
                        max-w-[650px]
                    "
                >
                    {/* =================================================
                        EYEBROW
                    ================================================= */}

                    <div
                        className="
                            mb-2
                            flex
                            items-center
                            gap-2
                        "
                    >
                        <span
                            aria-hidden="true"
                            className="
                                h-1.5
                                w-1.5
                                shrink-0
                                rounded-full
                                bg-red-400
                                shadow-[0_0_10px_rgba(248,113,113,0.8)]
                            "
                        />

                        <span
                            className="
                                font-['Orbitron']
                                text-[8px]
                                font-semibold
                                uppercase
                                tracking-[0.18em]
                                text-cyan-300
                            "
                        >
                            Collision Risk Analysis
                        </span>
                    </div>

                    {/* =================================================
                        TITLE
                    ================================================= */}

                    <h1
                        id="risk-operations-heading"
                        className="
                            max-w-[650px]
                            font-['Orbitron']
                            text-[25px]
                            font-bold
                            leading-[1.04]
                            tracking-[-0.02em]
                            text-white
                            sm:text-[30px]
                            lg:text-[34px]
                            xl:text-[38px]
                        "
                    >
                        Protect Space Assets

                        <span
                            className="
                                block
                                text-red-400
                            "
                        >
                            Before It Happens
                        </span>
                    </h1>

                    {/* =================================================
                        DESCRIPTION
                    ================================================= */}

                    <p
                        className="
                            mt-2
                            max-w-[520px]
                            font-['Inter']
                            text-[9px]
                            leading-4
                            text-slate-400
                            sm:text-[10px]
                            sm:leading-[1.65]
                        "
                    >
                        Analyze, monitor and manage potential
                        collision risks between active satellites
                        and space debris using real orbital
                        dynamics.
                    </p>

                    {/* =================================================
                        OPERATIONAL INDICATORS
                    ================================================= */}

                    <div
                        className="
                            mt-4
                            grid
                            max-w-[600px]
                            grid-cols-1
                            gap-2
                            min-[420px]:grid-cols-2
                            sm:flex
                            sm:flex-wrap
                        "
                    >
                        <HeroMetric
                            icon={FiRadio}
                            label="Real-Time"
                            value="Analysis"
                        />

                        <HeroMetric
                            icon={FiShield}
                            label="Risk"
                            value="Prediction"
                            accent="red"
                        />

                        <HeroMetric
                            icon={FiTarget}
                            label="Actionable"
                            value="Insights"
                            accent="cyan"
                        />
                    </div>
                </div>

                {/* =================================================
                    LIVE ENGINE STATUS

                    Desktop:
                    Explicitly anchored to the bottom of the hero.

                    Mobile/tablet:
                    Remains in normal document flow so it does not
                    overlap the hero content.
                ================================================= */}

                <div
                    className="
                        mt-8
                        flex
                        flex-wrap
                        items-center
                        gap-x-10
                        gap-y-2

                        lg:absolute
                        lg:bottom-5
                        lg:left-6
                        lg:right-6

                        xl:bottom-6
                        2xl:bottom-7
                    "
                >
                    {/* =================================================
                        RISK ENGINE
                    ================================================= */}

                    <div
                        className="
                            flex
                            items-center
                            gap-2
                        "
                    >
                        <span
                            aria-hidden="true"
                            className="
                                h-1.5
                                w-1.5
                                shrink-0
                                rounded-full
                                bg-emerald-400
                                shadow-[0_0_8px_rgba(52,211,153,0.7)]
                            "
                        />

                        <span
                            className="
                                font-['Inter']
                                text-[8px]
                                text-slate-400
                            "
                        >
                            Risk Engine Online
                        </span>
                    </div>

                    {/* =================================================
                        SGP4
                    ================================================= */}

                    <div
                        className="
                            flex
                            items-center
                            gap-2
                        "
                    >
                        <RiskIcon
                            icon={FiCrosshair}
                            size={10}
                            className="text-cyan-400"
                        />

                        <span
                            className="
                                font-['Inter']
                                text-[8px]
                                text-slate-400
                            "
                        >
                            SGP4 Propagation
                        </span>
                    </div>

                    {/* =================================================
                        RULE ENGINE
                    ================================================= */}

                    <div
                        className="
                            flex
                            items-center
                            gap-2
                        "
                    >
                        <RiskIcon
                            icon={FiZap}
                            size={10}
                            className="text-amber-400"
                        />

                        <span
                            className="
                                font-['Inter']
                                text-[8px]
                                text-slate-400
                            "
                        >
                            Rule-Based Assessment
                        </span>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default RiskHero;