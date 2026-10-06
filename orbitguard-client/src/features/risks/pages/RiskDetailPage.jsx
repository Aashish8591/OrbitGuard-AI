import {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    FiAlertTriangle,
    FiArrowLeft,
    FiCheckCircle,
    FiCrosshair,
    FiTarget,
} from "react-icons/fi";

import {
    useNavigate,
    useParams,
} from "react-router-dom";

import { getRiskById } from "../../../services/riskService";

import RiskObjectPair from "../components/RiskObjectPair";
import RiskKeyMetrics from "../components/RiskKeyMetrics";
import RiskRecommendation from "../components/RiskRecommendation";
import RiskAssessmentDetails from "../components/RiskAssessmentDetails";

/**
 * ================================================================
 * OrbitGuard AI — Risk Detail Page
 * ================================================================
 *
 * Route:
 * /risks/:id
 *
 * Responsibilities:
 * - Read risk assessment ID from route
 * - Fetch the real risk assessment from backend
 * - Handle loading state
 * - Handle API error state
 * - Render risk assessment details
 * - Compose all risk detail sections
 *
 * Backend:
 * - Backend remains the source of truth
 * - No dummy risk data
 * - No frontend risk calculation
 * - No modification of child component contracts
 *
 * IMPORTANT VISIBILITY STRUCTURE
 * ----------------------------------------------------------------
 * This page intentionally follows the same layering model as the
 * working SatelliteDetailPage:
 *
 *   page background / atmosphere -> z-0
 *   actual page content          -> z-10
 *
 * This prevents AppLayout/background visual layers from covering
 * the normal-flow Risk Detail sections.
 * ================================================================
 */

/* ================================================================
   HELPERS
================================================================ */

const toNumber = (value) => {
    const parsed = Number(value);

    return Number.isFinite(parsed)
        ? parsed
        : 0;
};

const formatProbability = (value) => {
    return toNumber(value).toFixed(2);
};

const formatEnumLabel = (value) => {
    if (!value) {
        return "—";
    }

    return String(value)
        .toLowerCase()
        .split("_")
        .map(
            (part) =>
                part.charAt(0).toUpperCase() +
                part.slice(1),
        )
        .join(" ");
};

const getRiskConfig = (riskLevel) => {
    switch (
        String(riskLevel ?? "").toUpperCase()
    ) {
        case "CRITICAL":
            return {
                label: "CRITICAL",
                text: "text-red-300",
                border: "border-red-400/30",
                bg: "bg-red-400/[0.08]",
                bar: "bg-red-400",
                icon: FiAlertTriangle,
            };

        case "HIGH":
            return {
                label: "HIGH",
                text: "text-orange-300",
                border: "border-orange-400/30",
                bg: "bg-orange-400/[0.08]",
                bar: "bg-orange-400",
                icon: FiAlertTriangle,
            };

        case "MEDIUM":
            return {
                label: "MEDIUM",
                text: "text-amber-300",
                border: "border-amber-400/30",
                bg: "bg-amber-400/[0.08]",
                bar: "bg-amber-400",
                icon: FiAlertTriangle,
            };

        case "LOW":
        default:
            return {
                label: "LOW",
                text: "text-cyan-300",
                border: "border-cyan-400/25",
                bg: "bg-cyan-400/[0.07]",
                bar: "bg-cyan-400",
                icon: FiCheckCircle,
            };
    }
};

/* ================================================================
   STATUS BADGE
================================================================ */

const StatusBadge = ({ status }) => {
    if (!status) {
        return null;
    }

    return (
        <div
            className="
                inline-flex
                items-center
                gap-2
                rounded-lg
                border
                border-cyan-400/20
                bg-cyan-400/[0.05]
                px-2.5
                py-1.5
                font-['Inter']
                text-[9px]
                font-semibold
                uppercase
                tracking-[0.08em]
                text-cyan-300
            "
        >
            <span
                className="
                    h-1.5
                    w-1.5
                    rounded-full
                    bg-cyan-300
                    shadow-[0_0_8px_rgba(103,232,249,0.65)]
                "
            />

            {formatEnumLabel(status)}
        </div>
    );
};

/* ================================================================
   RISK BADGE
================================================================ */

const RiskBadge = ({ riskLevel }) => {
    const config = getRiskConfig(riskLevel);

    const Icon = config.icon;

    return (
        <div
            className={`
                inline-flex
                items-center
                gap-2
                rounded-lg
                border
                ${config.border}
                ${config.bg}
                px-2.5
                py-1.5
                font-['Inter']
                text-[9px]
                font-semibold
                uppercase
                tracking-[0.08em]
                ${config.text}
            `}
        >
            <Icon size={12} />

            {config.label}
        </div>
    );
};

/* ================================================================
   LOADING STATE
================================================================ */

const LoadingState = () => {
    return (
        <main
            className="
                relative
                min-h-screen
                overflow-x-hidden
                bg-[#020817]
                text-slate-100
            "
        >
            {/* =====================================================
                LOCAL BACKGROUND ATMOSPHERE
            ===================================================== */}

            <div
                aria-hidden="true"
                className="
                    pointer-events-none
                    absolute
                    inset-x-0
                    top-0
                    z-0
                    h-[700px]
                    overflow-hidden
                "
            >
                <div
                    className="
                        absolute
                        left-[12%]
                        top-[8%]
                        h-[320px]
                        w-[520px]
                        rounded-full
                        bg-cyan-400/[0.025]
                        blur-[130px]
                    "
                />

                <div
                    className="
                        absolute
                        right-[8%]
                        top-[15%]
                        h-[340px]
                        w-[420px]
                        rounded-full
                        bg-blue-500/[0.025]
                        blur-[140px]
                    "
                />

                <div
                    className="
                        absolute
                        inset-x-0
                        top-0
                        h-[260px]
                        bg-gradient-to-b
                        from-[#020617]/30
                        to-transparent
                    "
                />
            </div>

            {/* =====================================================
                LOADING CONTENT
            ===================================================== */}

            <div
                className="
                    relative
                    z-10
                    mx-auto
                    w-full
                    max-w-[1500px]
                    px-4
                    py-5
                    sm:px-6
                    lg:px-8
                    xl:px-10
                "
            >
                <div className="animate-pulse">

                    <div
                        className="
                            h-4
                            w-36
                            rounded
                            bg-white/[0.05]
                        "
                    />

                    <div
                        className="
                            mt-5
                            h-7
                            w-52
                            rounded
                            bg-white/[0.05]
                        "
                    />

                    <div
                        className="
                            mt-2
                            h-3
                            w-40
                            rounded
                            bg-white/[0.04]
                        "
                    />

                    <div
                        className="
                            mt-6
                            grid
                            gap-4
                            lg:grid-cols-2
                        "
                    >
                        <div
                            className="
                                h-[280px]
                                rounded-2xl
                                bg-white/[0.03]
                            "
                        />

                        <div
                            className="
                                h-[280px]
                                rounded-2xl
                                bg-white/[0.03]
                            "
                        />
                    </div>

                    <div
                        className="
                            mt-4
                            grid
                            gap-3
                            md:grid-cols-3
                        "
                    >
                        <div
                            className="
                                h-20
                                rounded-xl
                                bg-white/[0.03]
                            "
                        />

                        <div
                            className="
                                h-20
                                rounded-xl
                                bg-white/[0.03]
                            "
                        />

                        <div
                            className="
                                h-20
                                rounded-xl
                                bg-white/[0.03]
                            "
                        />
                    </div>

                    <div
                        className="
                            mt-4
                            h-24
                            rounded-2xl
                            bg-white/[0.03]
                        "
                    />

                    <div
                        className="
                            mt-4
                            h-20
                            rounded-2xl
                            bg-white/[0.03]
                        "
                    />
                </div>
            </div>
        </main>
    );
};

/* ================================================================
   ERROR STATE
================================================================ */

const ErrorState = ({
    message,
    onBack,
}) => {
    return (
        <main
            className="
                relative
                flex
                min-h-screen
                items-center
                justify-center
                overflow-x-hidden
                bg-[#020817]
                px-4
                text-slate-100
            "
        >
            {/* Background atmosphere */}

            <div
                aria-hidden="true"
                className="
                    pointer-events-none
                    absolute
                    inset-0
                    z-0
                    overflow-hidden
                "
            >
                <div
                    className="
                        absolute
                        left-[15%]
                        top-[15%]
                        h-[280px]
                        w-[420px]
                        rounded-full
                        bg-cyan-400/[0.02]
                        blur-[120px]
                    "
                />

                <div
                    className="
                        absolute
                        right-[10%]
                        bottom-[10%]
                        h-[300px]
                        w-[420px]
                        rounded-full
                        bg-blue-500/[0.02]
                        blur-[130px]
                    "
                />
            </div>

            {/* Error content */}

            <div
                className="
                    relative
                    z-10
                    w-full
                    max-w-md
                    rounded-2xl
                    border
                    border-red-400/15
                    bg-[#030b18]
                    p-6
                    text-center
                "
            >
                <div
                    className="
                        mx-auto
                        flex
                        h-12
                        w-12
                        items-center
                        justify-center
                        rounded-full
                        border
                        border-red-400/20
                        bg-red-400/[0.06]
                        text-red-300
                    "
                >
                    <FiAlertTriangle size={20} />
                </div>

                <h2
                    className="
                        mt-4
                        font-['Orbitron']
                        text-sm
                        font-semibold
                        uppercase
                        tracking-[0.08em]
                        text-slate-200
                    "
                >
                    Risk Assessment Unavailable
                </h2>

                <p
                    className="
                        mt-2
                        font-['Inter']
                        text-xs
                        leading-5
                        text-slate-500
                    "
                >
                    {message ||
                        "The requested risk assessment could not be loaded."}
                </p>

                <button
                    type="button"
                    onClick={onBack}
                    className="
                        mt-5
                        inline-flex
                        items-center
                        gap-2
                        rounded-xl
                        border
                        border-cyan-400/20
                        bg-cyan-400/[0.05]
                        px-4
                        py-2.5
                        font-['Inter']
                        text-[10px]
                        font-semibold
                        uppercase
                        tracking-[0.08em]
                        text-cyan-300
                        transition
                        hover:border-cyan-400/35
                        hover:bg-cyan-400/[0.08]
                    "
                >
                    <FiArrowLeft size={13} />

                    Back to Risk Operations
                </button>
            </div>
        </main>
    );
};

/* ================================================================
   MAIN
================================================================ */

const RiskDetailPage = () => {
    const navigate = useNavigate();

    const { id } = useParams();

    const [risk, setRisk] = useState(null);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    /* ============================================================
       RESET SCROLL POSITION
    ============================================================ */

    useEffect(() => {
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: "auto",
        });
    }, [id]);

    /* ============================================================
       LOAD BACKEND RISK
    ============================================================ */

    useEffect(() => {
        let mounted = true;

        const loadRisk = async () => {
            if (!id) {
                if (mounted) {
                    setError(
                        "No risk assessment ID was provided.",
                    );

                    setRisk(null);
                    setLoading(false);
                }

                return;
            }

            try {
                setLoading(true);
                setError("");

                const response =
                    await getRiskById(id);

                if (!mounted) {
                    return;
                }

                if (
                    !response ||
                    typeof response !== "object"
                ) {
                    throw new Error(
                        "Risk assessment API returned invalid data.",
                    );
                }

                setRisk(response);
            } catch (requestError) {
                if (!mounted) {
                    return;
                }

                setError(
                    requestError?.message ||
                        "Unable to load the risk assessment.",
                );

                setRisk(null);
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };

        loadRisk();

        return () => {
            mounted = false;
        };
    }, [id]);

    /* ============================================================
       DERIVED VALUES
    ============================================================ */

    const riskConfig = useMemo(
        () =>
            getRiskConfig(
                risk?.riskLevel,
            ),
        [risk?.riskLevel],
    );

    const probability = useMemo(
        () =>
            Math.min(
                100,
                Math.max(
                    0,
                    toNumber(
                        risk?.collisionProbability,
                    ),
                ),
            ),
        [risk?.collisionProbability],
    );

    const RiskIcon = riskConfig.icon;

    /* ============================================================
       STATES
    ============================================================ */

    if (loading) {
        return <LoadingState />;
    }

    if (!risk) {
        return (
            <ErrorState
                message={error}
                onBack={() =>
                    navigate("/risks")
                }
            />
        );
    }

    /* ============================================================
       PAGE
    ============================================================ */

    return (
        <main
            className="
                relative
                min-h-screen
                overflow-x-hidden
                bg-[#020817]
                text-slate-100
            "
        >
            {/* =====================================================
                LOCAL SPACE ATMOSPHERE

                z-0 = visual/background layer
            ===================================================== */}

            <div
                aria-hidden="true"
                className="
                    pointer-events-none
                    absolute
                    inset-x-0
                    top-0
                    z-0
                    h-[700px]
                    overflow-hidden
                "
            >
                <div
                    className="
                        absolute
                        left-[12%]
                        top-[8%]
                        h-[320px]
                        w-[520px]
                        rounded-full
                        bg-cyan-400/[0.025]
                        blur-[130px]
                    "
                />

                <div
                    className="
                        absolute
                        right-[8%]
                        top-[15%]
                        h-[340px]
                        w-[420px]
                        rounded-full
                        bg-blue-500/[0.025]
                        blur-[140px]
                    "
                />

                <div
                    className="
                        absolute
                        inset-x-0
                        top-0
                        h-[260px]
                        bg-gradient-to-b
                        from-[#020617]/30
                        to-transparent
                    "
                />
            </div>

            {/* =====================================================
                ACTUAL PAGE CONTENT

                z-10 is intentional.

                This is the key visibility fix.
            ===================================================== */}

            <div
                className="
                    relative
                    z-10
                    mx-auto
                    w-full
                    max-w-[1500px]
                    px-4
                    py-5
                    sm:px-6
                    lg:px-8
                    xl:px-10
                "
            >

                {/* =================================================
                    HEADER
                ================================================= */}

                <header className="mb-5">

                    <div
                        className="
                            flex
                            items-center
                            justify-between
                            gap-3
                        "
                    >
                        <button
                            type="button"
                            onClick={() =>
                                navigate("/risks")
                            }
                            className="
                                inline-flex
                                items-center
                                gap-2
                                font-['Inter']
                                text-[10px]
                                font-medium
                                text-cyan-300
                                transition
                                hover:text-cyan-200
                            "
                        >
                            <FiArrowLeft size={14} />

                            Back to Risk Operations
                        </button>

                        <div
                            className="
                                hidden
                                items-center
                                gap-2
                                font-['Inter']
                                text-[9px]
                                uppercase
                                tracking-[0.1em]
                                text-slate-600
                                sm:flex
                            "
                        >
                            <FiCrosshair size={11} />

                            Assessment Details
                        </div>
                    </div>

                    <div
                        className="
                            mt-4
                            flex
                            flex-col
                            gap-3
                            lg:flex-row
                            lg:items-end
                            lg:justify-between
                        "
                    >
                        <div className="min-w-0">

                            <h1
                                className="
                                    font-['Orbitron']
                                    text-2xl
                                    font-semibold
                                    tracking-[0.04em]
                                    text-slate-100
                                    sm:text-3xl
                                "
                            >
                                {risk.riskCode ||
                                    "Risk Assessment"}
                            </h1>

                            <p
                                className="
                                    mt-1
                                    font-['Inter']
                                    text-xs
                                    text-slate-500
                                "
                            >
                                Collision Risk Assessment
                            </p>

                        </div>

                        <div
                            className="
                                flex
                                flex-wrap
                                items-center
                                gap-2
                            "
                        >
                            <StatusBadge
                                status={risk.status}
                            />

                            <RiskBadge
                                riskLevel={
                                    risk.riskLevel
                                }
                            />
                        </div>
                    </div>
                </header>

                {/* =================================================
                    TOP DETAIL GRID
                ================================================= */}

                <section
                    className="
                        grid
                        gap-4
                        lg:grid-cols-2
                        lg:items-stretch
                    "
                >

                    {/* =============================================
                        RISK PROFILE
                    ============================================= */}

                    <section
                        className="
                            flex
                            min-h-[320px]
                            flex-col
                            rounded-2xl
                            border
                            border-white/[0.07]
                            bg-[#030b18]
                            p-5
                            sm:p-6
                        "
                    >

                        <div
                            className="
                                flex
                                items-center
                                gap-2
                            "
                        >
                            <FiTarget
                                size={16}
                                className="text-cyan-300"
                            />

                            <h2
                                className="
                                    font-['Orbitron']
                                    text-[10px]
                                    font-semibold
                                    uppercase
                                    tracking-[0.12em]
                                    text-slate-200
                                "
                            >
                                Risk Profile
                            </h2>
                        </div>

                        {/* Probability */}

                        <div className="mt-8">

                            <p
                                className="
                                    font-['Inter']
                                    text-[9px]
                                    font-medium
                                    uppercase
                                    tracking-[0.13em]
                                    text-slate-500
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
                                    className="
                                        font-['Orbitron']
                                        text-4xl
                                        font-semibold
                                        leading-none
                                        tracking-[0.01em]
                                        text-amber-300
                                    "
                                >
                                    {formatProbability(
                                        risk.collisionProbability,
                                    )}
                                </span>

                                <span
                                    className="
                                        font-['Orbitron']
                                        text-base
                                        text-amber-300/70
                                    "
                                >
                                    %
                                </span>
                            </div>

                            {/* Progress */}

                            <div className="mt-6">

                                <div
                                    className="
                                        h-1.5
                                        overflow-hidden
                                        rounded-full
                                        bg-white/[0.05]
                                    "
                                >
                                    <div
                                        className={`
                                            h-full
                                            rounded-full
                                            ${riskConfig.bar}
                                        `}
                                        style={{
                                            width: `${probability}%`,
                                        }}
                                    />
                                </div>

                                <div
                                    className="
                                        mt-2
                                        flex
                                        justify-between
                                        font-['Inter']
                                        text-[8px]
                                        text-slate-600
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

                        {/* Risk summary */}

                        <div className="mt-auto pt-6">

                            <div
                                className={`
                                    flex
                                    items-center
                                    gap-3
                                    rounded-xl
                                    border
                                    ${riskConfig.border}
                                    ${riskConfig.bg}
                                    px-4
                                    py-3
                                `}
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
                                        ${riskConfig.border}
                                        ${riskConfig.bg}
                                        ${riskConfig.text}
                                    `}
                                >
                                    <RiskIcon size={16} />
                                </div>

                                <div className="min-w-0">

                                    <p
                                        className={`
                                            font-['Orbitron']
                                            text-[10px]
                                            font-semibold
                                            uppercase
                                            tracking-[0.08em]
                                            ${riskConfig.text}
                                        `}
                                    >
                                        {formatEnumLabel(
                                            risk.riskLevel,
                                        )}{" "}
                                        Risk
                                    </p>

                                    <p
                                        className="
                                            mt-0.5
                                            font-['Inter']
                                            text-[9px]
                                            text-slate-500
                                        "
                                    >
                                        Backend collision
                                        probability assessment
                                    </p>

                                </div>
                            </div>
                        </div>

                    </section>

                    {/* =============================================
                        OBJECT PAIR
                    ============================================= */}

                    <RiskObjectPair
                        satelliteId={
                            risk.satelliteId
                        }
                        debrisId={
                            risk.debrisId
                        }
                    />

                </section>

                {/* =================================================
                    KEY METRICS
                ================================================= */}

                <section className="mt-4">
                    <RiskKeyMetrics
                        risk={risk}
                    />
                </section>

                {/* =================================================
                    RECOMMENDATION
                ================================================= */}

                <section className="mt-4">
                    <RiskRecommendation
                        risk={risk}
                    />
                </section>

                {/* =================================================
                    ASSESSMENT DETAILS
                ================================================= */}

                <section className="mt-4">
                    <RiskAssessmentDetails
                        risk={risk}
                    />
                </section>

                {/* Bottom breathing room */}

                <div className="h-5" />

            </div>
        </main>
    );
};

export default RiskDetailPage;