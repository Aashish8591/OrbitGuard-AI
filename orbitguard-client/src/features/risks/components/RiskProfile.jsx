import {
    FiActivity,
    FiAlertTriangle,
    FiCheckCircle,
    FiRadio,
    FiShield,
} from "react-icons/fi";


/**
 * ================================================================
 * OrbitGuard AI — Risk Profile
 * ================================================================
 *
 * Primary collision-risk visualization.
 *
 * Backend source of truth:
 * - collisionProbability
 * - riskLevel
 *
 * This component:
 * - does NOT call APIs
 * - does NOT calculate risk
 * - does NOT generate recommendations
 * - does NOT modify backend data
 * ================================================================
 */


/* ================================================================
   HELPERS
================================================================ */

const normalizeProbability = (value) => {
    const numericValue = Number(value);

    if (!Number.isFinite(numericValue)) {
        return 0;
    }

    return Math.min(
        100,
        Math.max(0, numericValue),
    );
};


const formatProbability = (value) => {
    const numericValue = Number(value);

    if (!Number.isFinite(numericValue)) {
        return "—";
    }

    return numericValue.toFixed(2);
};


const normalizeRiskLevel = (value) => {
    const normalized = String(
        value ?? "",
    ).toUpperCase();

    return [
        "LOW",
        "MEDIUM",
        "HIGH",
        "CRITICAL",
    ].includes(normalized)
        ? normalized
        : "LOW";
};


/* ================================================================
   RISK CONFIGURATION
================================================================ */

const RISK_CONFIG = {
    LOW: {
        label: "LOW RISK",
        shortLabel: "LOW",
        text: "text-cyan-300",
        border: "border-cyan-400/20",
        background: "bg-cyan-400/[0.045]",
        softBackground: "bg-cyan-400/[0.025]",
        progress: "bg-cyan-400",
        glow: "bg-cyan-400",
        ring: "border-cyan-400/20",
        shadow:
            "shadow-[0_0_18px_rgba(34,211,238,0.30)]",
        icon: FiCheckCircle,
        description:
            "Collision probability remains within the low-risk operating band.",
    },

    MEDIUM: {
        label: "MEDIUM RISK",
        shortLabel: "MEDIUM",
        text: "text-amber-300",
        border: "border-amber-400/20",
        background: "bg-amber-400/[0.045]",
        softBackground: "bg-amber-400/[0.025]",
        progress: "bg-amber-400",
        glow: "bg-amber-400",
        ring: "border-amber-400/20",
        shadow:
            "shadow-[0_0_18px_rgba(251,191,36,0.32)]",
        icon: FiAlertTriangle,
        description:
            "Collision probability requires additional operational attention.",
    },

    HIGH: {
        label: "HIGH RISK",
        shortLabel: "HIGH",
        text: "text-orange-300",
        border: "border-orange-400/20",
        background: "bg-orange-400/[0.045]",
        softBackground: "bg-orange-400/[0.025]",
        progress: "bg-orange-400",
        glow: "bg-orange-400",
        ring: "border-orange-400/20",
        shadow:
            "shadow-[0_0_18px_rgba(251,146,60,0.32)]",
        icon: FiAlertTriangle,
        description:
            "Elevated collision probability detected by the risk engine.",
    },

    CRITICAL: {
        label: "CRITICAL RISK",
        shortLabel: "CRITICAL",
        text: "text-red-300",
        border: "border-red-400/20",
        background: "bg-red-400/[0.045]",
        softBackground: "bg-red-400/[0.025]",
        progress: "bg-red-400",
        glow: "bg-red-400",
        ring: "border-red-400/20",
        shadow:
            "shadow-[0_0_18px_rgba(248,113,113,0.35)]",
        icon: FiAlertTriangle,
        description:
            "Critical collision probability requires immediate attention.",
    },
};


/* ================================================================
   PROBABILITY SCALE
================================================================ */

const ProbabilityScale = ({
    probability,
    config,
}) => {
    const markers = [
        0,
        25,
        50,
        75,
        100,
    ];

    return (
        <div className="relative mt-5">

            {/* Track */}

            <div
                className="
                    relative
                    h-2
                    overflow-hidden
                    rounded-full
                    border
                    border-white/[0.055]
                    bg-[#07111f]
                "
            >

                {/* Filled value */}

                <div
                    className={`
                        relative
                        h-full
                        rounded-full
                        ${config.progress}
                        ${config.shadow}
                        transition-[width]
                        duration-700
                        ease-out
                    `}
                    style={{
                        width: `${probability}%`,
                    }}
                >

                    <div
                        aria-hidden="true"
                        className="
                            absolute
                            right-0
                            top-0
                            h-full
                            w-12
                            bg-gradient-to-r
                            from-transparent
                            to-white/30
                            blur-[2px]
                        "
                    />

                </div>

            </div>


            {/* Markers */}

            <div
                aria-hidden="true"
                className="
                    pointer-events-none
                    absolute
                    inset-x-0
                    top-0
                    flex
                    h-2
                    justify-between
                "
            >
                {markers.map((marker) => (
                    <span
                        key={marker}
                        className="
                            h-2
                            w-px
                            bg-white/[0.12]
                        "
                    />
                ))}
            </div>


            {/* Labels */}

            <div
                className="
                    mt-2
                    flex
                    justify-between
                    font-['Inter']
                    text-[7px]
                    font-medium
                    uppercase
                    tracking-[0.08em]
                    text-slate-700
                "
            >
                {markers.map((marker) => (
                    <span key={marker}>
                        {marker}%
                    </span>
                ))}
            </div>

        </div>
    );
};


/* ================================================================
   RADAR DISPLAY
================================================================ */

const ProbabilityRadar = ({
    probability,
    config,
}) => {
    const sweepAngle = Math.min(
        360,
        Math.max(12, probability * 3.6),
    );

    return (
        <div
            className="
                relative
                flex
                h-[190px]
                w-[190px]
                shrink-0
                items-center
                justify-center
                sm:h-[205px]
                sm:w-[205px]
            "
        >

            {/* =================================================
                ATMOSPHERIC GLOW
            ================================================= */}

            <div
                aria-hidden="true"
                className={`
                    pointer-events-none
                    absolute
                    inset-[22%]
                    rounded-full
                    opacity-20
                    blur-3xl
                    ${config.glow}
                `}
            />


            {/* =================================================
                RADAR RINGS
            ================================================= */}

            <div
                className="
                    absolute
                    inset-1
                    rounded-full
                    border
                    border-white/[0.055]
                "
            />

            <div
                className={`
                    absolute
                    inset-4
                    rounded-full
                    border
                    ${config.ring}
                `}
            />

            <div
                className="
                    absolute
                    inset-8
                    rounded-full
                    border
                    border-white/[0.05]
                "
            />

            <div
                className="
                    absolute
                    inset-12
                    rounded-full
                    border
                    border-white/[0.045]
                "
            />


            {/* =================================================
                RADAR GRID
            ================================================= */}

            <div
                aria-hidden="true"
                className="
                    pointer-events-none
                    absolute
                    inset-4
                    overflow-hidden
                    rounded-full
                "
            >

                {/* Vertical */}

                <div
                    className="
                        absolute
                        bottom-0
                        left-1/2
                        top-0
                        w-px
                        -translate-x-1/2
                        bg-white/[0.055]
                    "
                />

                {/* Horizontal */}

                <div
                    className="
                        absolute
                        left-0
                        right-0
                        top-1/2
                        h-px
                        -translate-y-1/2
                        bg-white/[0.055]
                    "
                />

                {/* Diagonal */}

                <div
                    className="
                        absolute
                        left-1/2
                        top-1/2
                        h-[72%]
                        w-[72%]
                        -translate-x-1/2
                        -translate-y-1/2
                        rotate-45
                        border
                        border-white/[0.025]
                    "
                />

            </div>


            {/* =================================================
                RADAR SWEEP
            ================================================= */}

            <div
                aria-hidden="true"
                className="
                    pointer-events-none
                    absolute
                    inset-5
                    overflow-hidden
                    rounded-full
                "
            >
                <div
                    className={`
                        absolute
                        left-1/2
                        top-1/2
                        h-1/2
                        w-px
                        origin-bottom
                        -translate-x-1/2
                        -translate-y-full
                        bg-gradient-to-t
                        from-transparent
                        to-current
                        ${config.text}
                        opacity-40
                    `}
                    style={{
                        transform:
                            `translate(-50%, -100%) rotate(${sweepAngle}deg)`,
                    }}
                />
            </div>


            {/* =================================================
                CENTER TARGET
            ================================================= */}

            <div
                className="
                    relative
                    z-10
                    flex
                    h-[100px]
                    w-[100px]
                    items-center
                    justify-center
                    rounded-full
                    border
                    border-white/[0.07]
                    bg-[#020914]/95
                    shadow-[0_0_35px_rgba(0,0,0,0.55)]
                "
            >

                {/* Inner ring */}

                <div
                    className={`
                        pointer-events-none
                        absolute
                        inset-2
                        rounded-full
                        border
                        ${config.ring}
                    `}
                />


                {/* Crosshair */}

                <div
                    className="
                        absolute
                        bottom-2
                        left-1/2
                        top-2
                        w-px
                        -translate-x-1/2
                        bg-white/[0.08]
                    "
                />

                <div
                    className="
                        absolute
                        left-2
                        right-2
                        top-1/2
                        h-px
                        -translate-y-1/2
                        bg-white/[0.08]
                    "
                />


                {/* Center dot */}

                <div
                    className={`
                        absolute
                        h-1.5
                        w-1.5
                        rounded-full
                        ${config.progress}
                        ${config.shadow}
                    `}
                />


                {/* Value */}

                <div className="relative text-center">

                    <p
                        className="
                            font-['Inter']
                            text-[6px]
                            font-semibold
                            uppercase
                            tracking-[0.15em]
                            text-slate-600
                        "
                    >
                        Probability
                    </p>

                    <div
                        className="
                            mt-1
                            flex
                            items-baseline
                            justify-center
                        "
                    >

                        <span
                            className={`
                                font-['Orbitron']
                                text-[25px]
                                font-semibold
                                leading-none
                                tracking-[-0.04em]
                                ${config.text}
                            `}
                        >
                            {formatProbability(
                                probability,
                            )}
                        </span>

                        <span
                            className="
                                ml-0.5
                                font-['Orbitron']
                                text-[10px]
                                text-slate-600
                            "
                        >
                            %
                        </span>

                    </div>

                    <div
                        className="
                            mt-2
                            flex
                            items-center
                            justify-center
                            gap-1.5
                        "
                    >
                        <span
                            className={`
                                h-1
                                w-1
                                rounded-full
                                ${config.progress}
                            `}
                        />

                        <span
                            className="
                                font-['Inter']
                                text-[5.5px]
                                font-semibold
                                uppercase
                                tracking-[0.1em]
                                text-slate-600
                            "
                        >
                            Assessment
                        </span>
                    </div>

                </div>

            </div>


            {/* =================================================
                RADAR LABELS
            ================================================= */}

            <span
                className="
                    absolute
                    left-0
                    top-5
                    font-['Inter']
                    text-[5.5px]
                    font-medium
                    uppercase
                    tracking-[0.12em]
                    text-slate-700
                "
            >
                RISK VECTOR
            </span>

            <span
                className="
                    absolute
                    bottom-3
                    right-0
                    font-['Inter']
                    text-[5.5px]
                    font-medium
                    uppercase
                    tracking-[0.12em]
                    text-slate-700
                "
            >
                PROBABILITY
            </span>

        </div>
    );
};


/* ================================================================
   RISK PROFILE
================================================================ */

const RiskProfile = ({
    collisionProbability,
    riskLevel,
}) => {
    const probability =
        normalizeProbability(
            collisionProbability,
        );

    const normalizedRiskLevel =
        normalizeRiskLevel(riskLevel);

    const config =
        RISK_CONFIG[
            normalizedRiskLevel
        ];

    const Icon = config.icon;


    return (
        <section
            aria-label="Risk profile"
            className="
                group
                relative
                overflow-hidden
                rounded-2xl
                border
                border-white/[0.07]
                bg-[#020914]
                shadow-[0_18px_55px_rgba(0,0,0,0.22)]
            "
        >

            {/* =================================================
                BACKGROUND GRID
            ================================================= */}

            <div
                aria-hidden="true"
                className="
                    pointer-events-none
                    absolute
                    inset-0
                    opacity-[0.18]
                    [background-image:linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)]
                    [background-size:28px_28px]
                    [mask-image:linear-gradient(to_bottom,black,transparent_80%)]
                "
            />


            {/* =================================================
                RISK ATMOSPHERE
            ================================================= */}

            <div
                aria-hidden="true"
                className={`
                    pointer-events-none
                    absolute
                    -right-28
                    -top-28
                    h-72
                    w-72
                    rounded-full
                    opacity-[0.08]
                    blur-[90px]
                    ${config.glow}
                `}
            />

            <div
                aria-hidden="true"
                className={`
                    pointer-events-none
                    absolute
                    -bottom-32
                    -left-24
                    h-64
                    w-64
                    rounded-full
                    opacity-[0.035]
                    blur-[80px]
                    ${config.glow}
                `}
            />


            {/* =================================================
                TOP ACCENT
            ================================================= */}

            <div
                aria-hidden="true"
                className="
                    absolute
                    left-0
                    right-0
                    top-0
                    h-px
                    bg-gradient-to-r
                    from-transparent
                    via-cyan-400/50
                    to-transparent
                "
            />


            {/* =================================================
                HEADER
            ================================================= */}

            <header
                className="
                    relative
                    z-20
                    flex
                    items-center
                    justify-between
                    gap-3
                    border-b
                    border-white/[0.045]
                    bg-[#020914]/80
                    px-5
                    py-3.5
                    backdrop-blur-md
                    sm:px-6
                "
            >

                <div className="flex min-w-0 items-center gap-3">

                    {/* Header icon */}

                    <div
                        className="
                            relative
                            flex
                            h-8
                            w-8
                            shrink-0
                            items-center
                            justify-center
                            rounded-lg
                            border
                            border-cyan-400/15
                            bg-cyan-400/[0.035]
                            text-cyan-300
                        "
                    >
                        <FiActivity size={15} />

                        <span
                            className="
                                absolute
                                -right-0.5
                                -top-0.5
                                h-1.5
                                w-1.5
                                rounded-full
                                bg-cyan-300
                                shadow-[0_0_8px_rgba(103,232,249,0.75)]
                            "
                        />
                    </div>


                    <div className="min-w-0">

                        <div
                            className="
                                flex
                                flex-wrap
                                items-center
                                gap-2
                            "
                        >

                            <h2
                                className="
                                    font-['Orbitron']
                                    text-[10px]
                                    font-semibold
                                    uppercase
                                    tracking-[0.13em]
                                    text-slate-200
                                "
                            >
                                Risk Profile
                            </h2>

                            <span
                                className="
                                    hidden
                                    rounded-full
                                    border
                                    border-cyan-400/10
                                    bg-cyan-400/[0.025]
                                    px-1.5
                                    py-0.5
                                    font-['Inter']
                                    text-[6px]
                                    font-semibold
                                    uppercase
                                    tracking-[0.1em]
                                    text-cyan-300/60
                                    sm:inline-flex
                                "
                            >
                                ENGINE
                            </span>

                        </div>

                        <p
                            className="
                                mt-0.5
                                font-['Inter']
                                text-[8px]
                                text-slate-600
                            "
                        >
                            Collision probability assessment
                        </p>

                    </div>

                </div>


                {/* Risk status */}

                <div
                    className={`
                        flex
                        shrink-0
                        items-center
                        gap-1.5
                        rounded-full
                        border
                        px-2
                        py-1
                        ${config.border}
                        ${config.softBackground}
                    `}
                >

                    <span
                        className={`
                            h-1.5
                            w-1.5
                            rounded-full
                            ${config.progress}
                        `}
                    />

                    <span
                        className={`
                            font-['Inter']
                            text-[6px]
                            font-semibold
                            uppercase
                            tracking-[0.1em]
                            ${config.text}
                        `}
                    >
                        {config.shortLabel}
                    </span>

                </div>

            </header>


            {/* =================================================
                MAIN CONTENT
            ================================================= */}

            <div
                className="
                    relative
                    z-10
                    p-5
                    sm:p-6
                "
            >

                <div
                    className="
                        grid
                        grid-cols-1
                        items-center
                        gap-5
                        md:grid-cols-[205px_minmax(0,1fr)]
                        md:gap-6
                        lg:grid-cols-[220px_minmax(0,1fr)]
                    "
                >

                    {/* =================================================
                        RADAR
                    ================================================= */}

                    <div
                        className="
                            flex
                            justify-center
                            md:justify-start
                        "
                    >
                        <ProbabilityRadar
                            probability={probability}
                            config={config}
                        />
                    </div>


                    {/* =================================================
                        TELEMETRY
                    ================================================= */}

                    <div className="min-w-0">

                        {/* Probability heading */}

                        <div
                            className="
                                flex
                                items-end
                                justify-between
                                gap-4
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
                                    <span
                                        className="
                                            h-px
                                            w-5
                                            bg-cyan-400/30
                                        "
                                    />

                                    <p
                                        className="
                                            font-['Inter']
                                            text-[8px]
                                            font-semibold
                                            uppercase
                                            tracking-[0.13em]
                                            text-slate-600
                                        "
                                    >
                                        Collision Probability
                                    </p>
                                </div>


                                <div
                                    className="
                                        mt-1.5
                                        flex
                                        items-baseline
                                        gap-2
                                    "
                                >

                                    <span
                                        className={`
                                            font-['Orbitron']
                                            text-[40px]
                                            font-semibold
                                            leading-none
                                            tracking-[-0.045em]
                                            ${config.text}
                                            sm:text-[46px]
                                        `}
                                    >
                                        {formatProbability(
                                            collisionProbability,
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

                            </div>


                            {/* Risk icon */}

                            <div
                                className={`
                                    flex
                                    h-11
                                    w-11
                                    shrink-0
                                    items-center
                                    justify-center
                                    rounded-xl
                                    border
                                    ${config.border}
                                    ${config.background}
                                    ${config.text}
                                    ${config.shadow}
                                `}
                            >
                                <Icon size={18} />
                            </div>

                        </div>


                        {/* Probability scale */}

                        <ProbabilityScale
                            probability={probability}
                            config={config}
                        />


                        {/* =================================================
                            RISK STATUS
                        ================================================= */}

                        <div
                            className={`
                                relative
                                mt-5
                                overflow-hidden
                                rounded-xl
                                border
                                ${config.border}
                                ${config.background}
                            `}
                        >

                            {/* Accent rail */}

                            <div
                                className={`
                                    absolute
                                    bottom-0
                                    left-0
                                    top-0
                                    w-0.5
                                    ${config.progress}
                                `}
                            />


                            <div
                                className="
                                    flex
                                    items-start
                                    gap-3
                                    p-3.5
                                "
                            >

                                {/* Status icon */}

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
                                        ${config.border}
                                        ${config.softBackground}
                                        ${config.text}
                                    `}
                                >
                                    <Icon size={15} />
                                </div>


                                {/* Status text */}

                                <div className="min-w-0 flex-1">

                                    <div
                                        className="
                                            flex
                                            flex-wrap
                                            items-center
                                            gap-2
                                        "
                                    >

                                        <p
                                            className={`
                                                font-['Orbitron']
                                                text-[10px]
                                                font-semibold
                                                uppercase
                                                tracking-[0.07em]
                                                ${config.text}
                                            `}
                                        >
                                            {config.label}
                                        </p>

                                        <span
                                            className="
                                                rounded-full
                                                border
                                                border-white/[0.06]
                                                bg-white/[0.015]
                                                px-1.5
                                                py-0.5
                                                font-['Inter']
                                                text-[6px]
                                                font-medium
                                                uppercase
                                                tracking-[0.1em]
                                                text-slate-600
                                            "
                                        >
                                            BACKEND
                                        </span>

                                    </div>


                                    <p
                                        className="
                                            mt-1
                                            font-['Inter']
                                            text-[9px]
                                            leading-4
                                            text-slate-500
                                        "
                                    >
                                        {config.description}
                                    </p>

                                </div>

                            </div>

                        </div>


                        {/* =================================================
                            TELEMETRY FOOTER
                        ================================================= */}

                        <div
                            className="
                                mt-4
                                flex
                                flex-wrap
                                items-center
                                justify-between
                                gap-3
                                border-t
                                border-white/[0.045]
                                pt-3
                            "
                        >

                            <div
                                className="
                                    flex
                                    items-center
                                    gap-1.5
                                "
                            >
                                <FiRadio
                                    size={9}
                                    className="text-slate-700"
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
                                    Risk engine telemetry
                                </span>
                            </div>


                            <div
                                className="
                                    flex
                                    items-center
                                    gap-1.5
                                "
                            >
                                <FiShield
                                    size={9}
                                    className="text-emerald-400/50"
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
                                    Backend source of truth
                                </span>
                            </div>

                        </div>

                    </div>

                </div>

            </div>

        </section>
    );
};


export default RiskProfile;