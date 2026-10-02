import {
    FiAlertTriangle,
    FiArrowRight,
    FiChevronDown,
    FiCrosshair,
    FiRadio,
    FiShield,
    FiTarget,
    FiZap,
} from "react-icons/fi";

/**
 * ================================================================
 * OrbitGuard AI - Risk Hero
 * ================================================================
 *
 * PURPOSE
 * -------
 * Primary visual/header section for the Collision Risk module.
 *
 * RESPONSIBILITIES
 * ----------------
 * - Present the Collision Risk Operations identity.
 * - Display the cinematic risk background.
 * - Show high-level risk context supplied by the parent.
 * - Provide the "Analyze New Risk" interaction.
 *
 * IMPORTANT ARCHITECTURE
 * ----------------------
 * This component DOES NOT:
 *
 * - Call APIs
 * - Fetch satellites
 * - Fetch debris
 * - Calculate collision probability
 * - Calculate risk level
 * - Perform orbital calculations
 * - Generate dummy satellite/debris data
 *
 * The parent RiskOverviewPage owns data loading and API
 * orchestration.
 *
 * Backend analyze endpoint:
 *
 * POST /api/v1/risk/analyze
 *
 * Request:
 *
 * {
 *   satelliteId: "...",
 *   debrisId: "..."
 * }
 *
 * ================================================================
 */


/* ================================================================
   SMALL HELPERS
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
                rounded-xl
                border
                px-2.5
                py-2
                backdrop-blur-sm
                ${colors.wrapper}
            `}
        >

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
                <Icon size={14} />
            </div>

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
                        text-[11px]
                        font-semibold
                        ${colors.value}
                    `}
                >
                    {displayValue(value)}
                </p>

            </div>

        </div>
    );
};


/* ================================================================
   ANALYZE PANEL
================================================================ */

const AnalyzeRiskPanel = ({
    satellites = [],
    debris = [],
    selectedSatelliteId = "",
    selectedDebrisId = "",
    onSatelliteChange,
    onDebrisChange,
    onAnalyze,
    loading = false,
}) => {

    const canAnalyze =
        Boolean(selectedSatelliteId) &&
        Boolean(selectedDebrisId) &&
        !loading;

    const handleSubmit = (event) => {

        event.preventDefault();

        if (!canAnalyze) {
            return;
        }

        onAnalyze?.({
            satelliteId: selectedSatelliteId,
            debrisId: selectedDebrisId,
        });
    };

    return (
        <div
            className="
                relative
                z-20
                w-full
                lg:w-[270px]
                xl:w-[285px]
                shrink-0
            "
        >

            <div
                className="
                    relative
                    overflow-hidden
                    rounded-xl
                    border
                    border-cyan-400/15
                    bg-[#020914]/90
                    p-4
                    shadow-[0_18px_55px_rgba(0,0,0,0.45)]
                    backdrop-blur-xl
                "
            >

                {/* Top glow */}

                <div
                    className="
                        pointer-events-none
                        absolute
                        inset-x-0
                        top-0
                        h-px
                        bg-gradient-to-r
                        from-transparent
                        via-cyan-400/70
                        to-transparent
                    "
                />

                {/* Header */}

                <div className="mb-4">

                    <div className="flex items-center gap-2">

                        <div
                            className="
                                flex
                                h-7
                                w-7
                                items-center
                                justify-center
                                rounded-lg
                                border
                                border-cyan-400/20
                                bg-cyan-400/[0.06]
                                text-cyan-300
                            "
                        >
                            <FiCrosshair size={14} />
                        </div>

                        <div>

                            <p
                                className="
                                    font-['Orbitron']
                                    text-[9px]
                                    font-semibold
                                    uppercase
                                    tracking-[0.13em]
                                    text-slate-200
                                "
                            >
                                Analyze New Risk
                            </p>

                            <p
                                className="
                                    mt-0.5
                                    font-['Inter']
                                    text-[9px]
                                    text-slate-500
                                "
                            >
                                Create conjunction assessment
                            </p>

                        </div>

                    </div>

                </div>


                <form
                    onSubmit={handleSubmit}
                    className="space-y-3"
                >

                    {/* Satellite */}

                    <div>

                        <label
                            htmlFor="risk-satellite"
                            className="
                                mb-1.5
                                block
                                font-['Inter']
                                text-[9px]
                                font-medium
                                uppercase
                                tracking-[0.08em]
                                text-slate-500
                            "
                        >
                            Select Satellite
                        </label>

                        <div className="relative">

                            <select
                                id="risk-satellite"
                                value={selectedSatelliteId}
                                onChange={(event) =>
                                    onSatelliteChange?.(
                                        event.target.value,
                                    )
                                }
                                disabled={loading}
                                className="
                                    w-full
                                    appearance-none
                                    rounded-lg
                                    border
                                    border-white/[0.08]
                                    bg-[#071321]
                                    px-3
                                    py-2.5
                                    pr-9
                                    font-['Inter']
                                    text-[10px]
                                    text-slate-300
                                    outline-none
                                    transition
                                    focus:border-cyan-400/40
                                    focus:ring-1
                                    focus:ring-cyan-400/10
                                    disabled:cursor-not-allowed
                                    disabled:opacity-50
                                "
                            >

                                <option value="">
                                    Choose a satellite
                                </option>

                                {satellites.map((satellite) => (
                                    <option
                                        key={satellite.id}
                                        value={satellite.id}
                                    >
                                        {displayValue(
                                            satellite.satelliteName ||
                                            satellite.name ||
                                            satellite.satelliteCode,
                                        )}
                                        {" "}
                                        —
                                        {" "}
                                        {displayValue(
                                            satellite.satelliteCode,
                                        )}
                                    </option>
                                ))}

                            </select>

                            <FiChevronDown
                                size={13}
                                className="
                                    pointer-events-none
                                    absolute
                                    right-3
                                    top-1/2
                                    -translate-y-1/2
                                    text-slate-600
                                "
                            />

                        </div>

                    </div>


                    {/* Connection indicator */}

                    <div className="flex items-center gap-2">

                        <div className="h-px flex-1 bg-white/[0.05]" />

                        <div
                            className="
                                flex
                                h-6
                                w-6
                                items-center
                                justify-center
                                rounded-full
                                border
                                border-cyan-400/15
                                bg-cyan-400/[0.04]
                                text-cyan-400
                            "
                        >
                            <FiArrowRight size={11} />
                        </div>

                        <div className="h-px flex-1 bg-white/[0.05]" />

                    </div>


                    {/* Debris */}

                    <div>

                        <label
                            htmlFor="risk-debris"
                            className="
                                mb-1.5
                                block
                                font-['Inter']
                                text-[9px]
                                font-medium
                                uppercase
                                tracking-[0.08em]
                                text-slate-500
                            "
                        >
                            Select Space Debris
                        </label>

                        <div className="relative">

                            <select
                                id="risk-debris"
                                value={selectedDebrisId}
                                onChange={(event) =>
                                    onDebrisChange?.(
                                        event.target.value,
                                    )
                                }
                                disabled={loading}
                                className="
                                    w-full
                                    appearance-none
                                    rounded-lg
                                    border
                                    border-white/[0.08]
                                    bg-[#071321]
                                    px-3
                                    py-2.5
                                    pr-9
                                    font-['Inter']
                                    text-[10px]
                                    text-slate-300
                                    outline-none
                                    transition
                                    focus:border-cyan-400/40
                                    focus:ring-1
                                    focus:ring-cyan-400/10
                                    disabled:cursor-not-allowed
                                    disabled:opacity-50
                                "
                            >

                                <option value="">
                                    Choose a debris object
                                </option>

                                {debris.map((item) => (
                                    <option
                                        key={item.id}
                                        value={item.id}
                                    >
                                        {displayValue(
                                            item.debrisName ||
                                            item.name ||
                                            item.debrisCode,
                                        )}
                                        {" "}
                                        —
                                        {" "}
                                        {displayValue(
                                            item.debrisCode,
                                        )}
                                    </option>
                                ))}

                            </select>

                            <FiChevronDown
                                size={13}
                                className="
                                    pointer-events-none
                                    absolute
                                    right-3
                                    top-1/2
                                    -translate-y-1/2
                                    text-slate-600
                                "
                            />

                        </div>

                    </div>


                    {/* Analyze */}

                    <button
                        type="submit"
                        disabled={!canAnalyze}
                        className="
                            group
                            mt-1
                            flex
                            w-full
                            items-center
                            justify-center
                            gap-2
                            rounded-lg
                            border
                            border-cyan-300/30
                            bg-cyan-400
                            px-4
                            py-2.5
                            font-['Orbitron']
                            text-[9px]
                            font-bold
                            uppercase
                            tracking-[0.08em]
                            text-[#021018]
                            shadow-[0_0_20px_rgba(34,211,238,0.12)]
                            transition-all
                            duration-200
                            hover:bg-cyan-300
                            hover:shadow-[0_0_28px_rgba(34,211,238,0.22)]
                            disabled:cursor-not-allowed
                            disabled:border-white/[0.06]
                            disabled:bg-slate-700/50
                            disabled:text-slate-500
                            disabled:shadow-none
                        "
                    >

                        {loading ? (
                            <>
                                <span
                                    className="
                                        h-3
                                        w-3
                                        animate-spin
                                        rounded-full
                                        border-2
                                        border-slate-700
                                        border-t-transparent
                                    "
                                />

                                Analyzing...
                            </>
                        ) : (
                            <>
                                <FiZap size={12} />

                                Analyze Risk
                            </>
                        )}

                    </button>

                </form>


                {/* Footer */}

                <div
                    className="
                        mt-3
                        flex
                        items-center
                        justify-center
                        gap-1.5
                        border-t
                        border-white/[0.04]
                        pt-3
                    "
                >

                    <FiShield
                        size={10}
                        className="text-emerald-400"
                    />

                    <span
                        className="
                            font-['Inter']
                            text-[8px]
                            text-slate-600
                        "
                    >
                        Backend orbital propagation
                    </span>

                </div>

            </div>

        </div>
    );
};


/* ================================================================
   MAIN COMPONENT
================================================================ */

const RiskHero = ({
    summary = {},

    satellites = [],
    debris = [],

    selectedSatelliteId = "",
    selectedDebrisId = "",

    onSatelliteChange,
    onDebrisChange,
    onAnalyze,

    analyzing = false,
}) => {

    return (
        <section
            aria-labelledby="risk-operations-heading"
            className="
                relative
                overflow-hidden
                rounded-2xl
                border
                border-cyan-400/10
                bg-[#020914]
                shadow-[0_20px_70px_rgba(0,0,0,0.35)]
            "
        >

            {/* =====================================================
                BACKGROUND IMAGE
            ===================================================== */}

            <div
                className="
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
                IMAGE READABILITY OVERLAY
            ===================================================== */}

            <div
                className="
                    absolute
                    inset-0
                    bg-gradient-to-r
                    from-[#020914]/95
                    via-[#020914]/55
                    to-[#020914]/25
                "
            />

            <div
                className="
                    absolute
                    inset-0
                    bg-gradient-to-t
                    from-[#020914]
                    via-transparent
                    to-[#020914]/20
                "
            />

            {/* subtle cyan atmospheric glow */}

            <div
                className="
                    pointer-events-none
                    absolute
                    -left-24
                    top-1/2
                    h-64
                    w-64
                    -translate-y-1/2
                    rounded-full
                    bg-cyan-400/[0.06]
                    blur-3xl
                "
            />


            {/* =====================================================
                CONTENT
            ===================================================== */}

            <div
                className="
                    relative
                    z-10
                    flex
                    min-h-[350px]
                    flex-col
                    gap-5
                    p-4
                    sm:p-5
                    lg:min-h-[365px]
                    lg:flex-row
                    lg:items-stretch
                    lg:justify-between
                    lg:p-6
                "
            >

                {/* =================================================
                    LEFT / HERO INFORMATION
                ================================================= */}

                <div
                    className="
                        flex
                        min-w-0
                        flex-1
                        flex-col
                        justify-between
                    "
                >

                    <div className="max-w-[570px]">

                        {/* Eyebrow */}

                        <div
                            className="
                                mb-3
                                flex
                                items-center
                                gap-2
                            "
                        >

                            <span
                                className="
                                    h-1.5
                                    w-1.5
                                    rounded-full
                                    bg-red-400
                                    shadow-[0_0_10px_rgba(248,113,113,0.8)]
                                "
                            />

                            <span
                                className="
                                    font-['Orbitron']
                                    text-[9px]
                                    font-semibold
                                    uppercase
                                    tracking-[0.18em]
                                    text-cyan-300
                                "
                            >
                                Collision Risk Operations
                            </span>

                        </div>


                        {/* Main title */}

                        <h1
                            id="risk-operations-heading"
                            className="
                                max-w-[540px]
                                font-['Orbitron']
                                text-2xl
                                font-bold
                                leading-[1.08]
                                tracking-[-0.02em]
                                text-white
                                sm:text-3xl
                                lg:text-[34px]
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


                        {/* Description */}

                        <p
                            className="
                                mt-3
                                max-w-[470px]
                                font-['Inter']
                                text-[10px]
                                leading-5
                                text-slate-400
                                sm:text-[11px]
                            "
                        >
                            Analyze, monitor and manage potential
                            collision risks between active satellites
                            and space debris using real orbital
                            propagation data.
                        </p>


                        {/* Operational indicators */}

                        <div
                            className="
                                mt-5
                                grid
                                max-w-[430px]
                                grid-cols-3
                                gap-2
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
                                label="Orbital"
                                value="Assessment"
                                accent="amber"
                            />

                        </div>

                    </div>


                    {/* =================================================
                        LIVE CONTEXT STRIP
                    ================================================= */}

                    <div
                        className="
                            mt-6
                            flex
                            flex-wrap
                            items-center
                            gap-x-5
                            gap-y-2
                        "
                    >

                        <div className="flex items-center gap-2">

                            <span
                                className="
                                    h-1.5
                                    w-1.5
                                    rounded-full
                                    bg-emerald-400
                                    shadow-[0_0_8px_rgba(52,211,153,0.7)]
                                "
                            />

                            <span
                                className="
                                    font-['Inter']
                                    text-[9px]
                                    text-slate-400
                                "
                            >
                                Risk Engine Online
                            </span>

                        </div>


                        <div className="flex items-center gap-2">

                            <FiCrosshair
                                size={11}
                                className="text-cyan-400"
                            />

                            <span
                                className="
                                    font-['Inter']
                                    text-[9px]
                                    text-slate-400
                                "
                            >
                                SGP4 Propagation
                            </span>

                        </div>


                        <div className="flex items-center gap-2">

                            <FiZap
                                size={11}
                                className="text-amber-400"
                            />

                            <span
                                className="
                                    font-['Inter']
                                    text-[9px]
                                    text-slate-400
                                "
                            >
                                Rule-Based Assessment
                            </span>

                        </div>

                    </div>

                </div>


                {/* =================================================
                    RIGHT / ANALYZE PANEL
                ================================================= */}

                <AnalyzeRiskPanel
                    satellites={satellites}
                    debris={debris}
                    selectedSatelliteId={
                        selectedSatelliteId
                    }
                    selectedDebrisId={
                        selectedDebrisId
                    }
                    onSatelliteChange={
                        onSatelliteChange
                    }
                    onDebrisChange={
                        onDebrisChange
                    }
                    onAnalyze={onAnalyze}
                    loading={analyzing}
                />

            </div>


            {/* =====================================================
                BOTTOM OPERATIONAL METRICS
            ===================================================== */}

            <div
                className="
                    relative
                    z-10
                    grid
                    grid-cols-2
                    border-t
                    border-white/[0.06]
                    bg-[#020914]/65
                    backdrop-blur-md
                    sm:grid-cols-4
                "
            >

                <HeroMetric
                    icon={FiAlertTriangle}
                    label="Critical Risks"
                    value={summary.critical}
                    accent="red"
                />

                <HeroMetric
                    icon={FiTarget}
                    label="High Risks"
                    value={summary.high}
                    accent="amber"
                />

                <HeroMetric
                    icon={FiCrosshair}
                    label="Medium Risks"
                    value={summary.medium}
                    accent="amber"
                />

                <HeroMetric
                    icon={FiRadio}
                    label="Low Risks"
                    value={summary.low}
                />

            </div>

        </section>
    );
};

export default RiskHero;