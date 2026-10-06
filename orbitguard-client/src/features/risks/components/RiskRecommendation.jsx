import {
    FiCheckCircle,
    FiMessageSquare,
    FiRadio,
    FiShield,
} from "react-icons/fi";


/**
 * ================================================================
 * OrbitGuard AI — Risk Engine Recommendation
 * ================================================================
 *
 * Displays recommendation and remarks returned by the backend
 * risk assessment.
 *
 * Backend source of truth:
 * - recommendation
 * - remarks
 *
 * This component:
 * - does NOT call APIs
 * - does NOT generate recommendations
 * - does NOT calculate risk
 * - does NOT modify backend data
 * ================================================================
 */


/* ================================================================
   MAIN COMPONENT
================================================================ */

const RiskRecommendation = ({ risk }) => {
    if (!risk) {
        return null;
    }


    const recommendation =
        risk.recommendation;

    const remarks =
        risk.remarks;


    const hasRecommendation =
        recommendation !== null &&
        recommendation !== undefined &&
        String(recommendation).trim() !== "";


    const hasRemarks =
        remarks !== null &&
        remarks !== undefined &&
        String(remarks).trim() !== "";


    return (
        <section
            aria-label="Risk engine recommendation"
            className="
                group
                relative
                overflow-hidden
                rounded-2xl
                border
                border-white/[0.07]
                bg-[#020914]
                shadow-[0_18px_55px_rgba(0,0,0,0.20)]
            "
        >

            {/* =====================================================
                ATMOSPHERE
            ===================================================== */}

            <div
                aria-hidden="true"
                className="
                    pointer-events-none
                    absolute
                    -right-24
                    -top-28
                    h-64
                    w-64
                    rounded-full
                    bg-cyan-400/[0.045]
                    blur-[90px]
                "
            />

            <div
                aria-hidden="true"
                className="
                    pointer-events-none
                    absolute
                    -bottom-32
                    left-1/3
                    h-56
                    w-56
                    rounded-full
                    bg-blue-400/[0.025]
                    blur-[80px]
                "
            />


            {/* =====================================================
                SUBTLE GRID
            ===================================================== */}

            <div
                aria-hidden="true"
                className="
                    pointer-events-none
                    absolute
                    inset-0
                    opacity-[0.16]
                    [background-image:linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)]
                    [background-size:28px_28px]
                    [mask-image:linear-gradient(to_bottom,black,transparent_70%)]
                "
            />


            {/* =====================================================
                TOP ACCENT
            ===================================================== */}

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


            {/* =====================================================
                HEADER
            ===================================================== */}

            <header
                className="
                    relative
                    z-10
                    flex
                    items-center
                    justify-between
                    gap-4
                    border-b
                    border-white/[0.045]
                    bg-[#020914]/75
                    px-5
                    py-4
                    backdrop-blur-md
                    sm:px-6
                "
            >

                <div className="flex min-w-0 items-center gap-3">

                    {/* Icon */}

                    <div
                        className="
                            relative
                            flex
                            h-9
                            w-9
                            shrink-0
                            items-center
                            justify-center
                            rounded-xl
                            border
                            border-cyan-400/15
                            bg-cyan-400/[0.035]
                            text-cyan-300
                            shadow-[0_0_22px_rgba(34,211,238,0.05)]
                        "
                    >
                        <FiShield size={16} />

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


                    {/* Heading */}

                    <div className="min-w-0">

                        <div className="flex flex-wrap items-center gap-2">

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
                                Risk Engine Recommendation
                            </h2>

                            <span
                                className="
                                    hidden
                                    items-center
                                    gap-1
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
                                    text-cyan-300/65
                                    sm:inline-flex
                                "
                            >
                                <FiRadio size={7} />

                                ENGINE OUTPUT
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
                            Backend assessment guidance
                        </p>

                    </div>

                </div>


                {/* Header status */}

                <div
                    className="
                        hidden
                        shrink-0
                        items-center
                        gap-1.5
                        rounded-full
                        border
                        border-emerald-400/10
                        bg-emerald-400/[0.025]
                        px-2.5
                        py-1.5
                        sm:flex
                    "
                >
                    <span
                        className="
                            h-1.5
                            w-1.5
                            rounded-full
                            bg-emerald-400
                            shadow-[0_0_8px_rgba(52,211,153,0.65)]
                        "
                    />

                    <span
                        className="
                            font-['Inter']
                            text-[7px]
                            font-semibold
                            uppercase
                            tracking-[0.1em]
                            text-emerald-300/70
                        "
                    >
                        Analysis Ready
                    </span>
                </div>

            </header>


            {/* =====================================================
                CONTENT
            ===================================================== */}

            <div
                className="
                    relative
                    z-10
                    p-5
                    sm:p-6
                "
            >

                {/* =================================================
                    RECOMMENDATION PANEL
                ================================================= */}

                <div
                    className="
                        relative
                        overflow-hidden
                        rounded-xl
                        border
                        border-cyan-400/10
                        bg-[#04101d]/80
                    "
                >

                    {/* Left command rail */}

                    <div
                        aria-hidden="true"
                        className="
                            absolute
                            bottom-0
                            left-0
                            top-0
                            w-0.5
                            bg-gradient-to-b
                            from-cyan-300
                            via-cyan-400/60
                            to-transparent
                        "
                    />


                    {/* Top micro-line */}

                    <div
                        aria-hidden="true"
                        className="
                            absolute
                            left-4
                            right-4
                            top-0
                            h-px
                            bg-gradient-to-r
                            from-cyan-400/25
                            via-cyan-400/5
                            to-transparent
                        "
                    />


                    <div
                        className="
                            flex
                            items-start
                            gap-4
                            p-4
                            sm:p-5
                        "
                    >

                        {/* Recommendation icon */}

                        <div
                            className="
                                relative
                                flex
                                h-10
                                w-10
                                shrink-0
                                items-center
                                justify-center
                                rounded-xl
                                border
                                border-cyan-400/15
                                bg-cyan-400/[0.035]
                                text-cyan-300
                            "
                        >
                            <FiMessageSquare size={16} />

                            <span
                                className="
                                    absolute
                                    -bottom-0.5
                                    -right-0.5
                                    flex
                                    h-3.5
                                    w-3.5
                                    items-center
                                    justify-center
                                    rounded-full
                                    border
                                    border-[#04101d]
                                    bg-emerald-400
                                    text-[#02100c]
                                "
                            >
                                <FiCheckCircle size={8} />
                            </span>
                        </div>


                        {/* Recommendation content */}

                        <div className="min-w-0 flex-1">

                            <div
                                className="
                                    flex
                                    flex-wrap
                                    items-center
                                    justify-between
                                    gap-2
                                "
                            >

                                <div className="flex items-center gap-2">

                                    <p
                                        className="
                                            font-['Inter']
                                            text-[8px]
                                            font-semibold
                                            uppercase
                                            tracking-[0.13em]
                                            text-cyan-300/65
                                        "
                                    >
                                        Recommendation
                                    </p>

                                    <span
                                        className="
                                            h-px
                                            w-5
                                            bg-cyan-400/15
                                        "
                                    />

                                    <span
                                        className="
                                            font-['Inter']
                                            text-[6px]
                                            font-medium
                                            uppercase
                                            tracking-[0.1em]
                                            text-slate-700
                                        "
                                    >
                                        RISK ENGINE
                                    </span>

                                </div>


                                {/* Data indicator */}

                                <div
                                    className="
                                        flex
                                        items-center
                                        gap-1.5
                                        rounded-full
                                        border
                                        border-white/[0.05]
                                        bg-white/[0.015]
                                        px-2
                                        py-1
                                    "
                                >
                                    <span
                                        className="
                                            h-1
                                            w-1
                                            rounded-full
                                            bg-cyan-400
                                        "
                                    />

                                    <span
                                        className="
                                            font-['Inter']
                                            text-[6px]
                                            font-medium
                                            uppercase
                                            tracking-[0.09em]
                                            text-slate-600
                                        "
                                    >
                                        Backend
                                    </span>
                                </div>

                            </div>


                            {/* Actual recommendation */}

                            <p
                                className={`
                                    mt-3
                                    max-w-4xl
                                    font-['Inter']
                                    text-[11px]
                                    leading-6
                                    ${
                                        hasRecommendation
                                            ? "text-slate-200"
                                            : "text-slate-600"
                                    }
                                `}
                            >
                                {hasRecommendation
                                    ? String(
                                          recommendation,
                                      )
                                    : "No recommendation provided by the risk engine."}
                            </p>

                        </div>

                    </div>

                </div>


                {/* =================================================
                    REMARKS
                ================================================= */}

                {hasRemarks ? (
                    <div
                        className="
                            mt-4
                            grid
                            grid-cols-1
                            gap-4
                            sm:grid-cols-[auto_minmax(0,1fr)]
                        "
                    >

                        {/* Remarks label */}

                        <div
                            className="
                                flex
                                items-center
                                gap-2
                                sm:flex-col
                                sm:items-start
                                sm:justify-start
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
                                    border-white/[0.06]
                                    bg-white/[0.02]
                                    text-slate-500
                                "
                            >
                                <FiMessageSquare size={13} />
                            </div>

                            <div className="sm:mt-1">

                                <p
                                    className="
                                        font-['Inter']
                                        text-[7px]
                                        font-semibold
                                        uppercase
                                        tracking-[0.12em]
                                        text-slate-600
                                    "
                                >
                                    Remarks
                                </p>

                                <p
                                    className="
                                        mt-0.5
                                        hidden
                                        font-['Inter']
                                        text-[6px]
                                        uppercase
                                        tracking-[0.08em]
                                        text-slate-700
                                        sm:block
                                    "
                                >
                                    Operator context
                                </p>

                            </div>

                        </div>


                        {/* Remarks content */}

                        <div
                            className="
                                relative
                                rounded-xl
                                border
                                border-white/[0.055]
                                bg-white/[0.012]
                                px-4
                                py-3.5
                            "
                        >

                            <span
                                aria-hidden="true"
                                className="
                                    absolute
                                    bottom-3
                                    left-0
                                    top-3
                                    w-px
                                    bg-slate-600/40
                                "
                            />

                            <p
                                className="
                                    pl-2
                                    font-['Inter']
                                    text-[10px]
                                    leading-5
                                    text-slate-500
                                "
                            >
                                {String(remarks)}
                            </p>

                        </div>

                    </div>
                ) : (
                    /* No remarks state */

                    <div
                        className="
                            mt-4
                            flex
                            items-center
                            gap-2
                            rounded-lg
                            border
                            border-white/[0.045]
                            bg-white/[0.01]
                            px-3
                            py-2.5
                        "
                    >
                        <FiMessageSquare
                            size={10}
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
                            No operator remarks attached
                        </span>
                    </div>
                )}


                {/* =================================================
                    FOOTER TELEMETRY
                ================================================= */}

                <div
                    className="
                        mt-5
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

                    <div className="flex items-center gap-1.5">

                        <FiShield
                            size={9}
                            className="text-cyan-400/40"
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
                            Backend guidance
                        </span>

                    </div>


                    <div className="flex items-center gap-1.5">

                        <span
                            className="
                                h-1
                                w-1
                                rounded-full
                                bg-emerald-400/60
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
                            Source verified
                        </span>

                    </div>

                </div>

            </div>

        </section>
    );
};


export default RiskRecommendation;