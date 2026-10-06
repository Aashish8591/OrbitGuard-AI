import {
    FiCalendar,
    FiCheckCircle,
    FiClock,
    FiHash,
    FiRadio,
} from "react-icons/fi";


/* ================================================================
   HELPERS
================================================================ */

const formatDateTime = (value) => {
    if (!value) {
        return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "—";
    }

    return new Intl.DateTimeFormat(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
        },
    ).format(date);
};


const getStatusStyle = (value) => {
    const status =
        String(value ?? "").toUpperCase();

    switch (status) {
        case "ANALYZED":
            return {
                dot: "bg-cyan-300",
                text: "text-cyan-300",
                border: "border-cyan-400/25",
                background:
                    "bg-cyan-400/[0.07]",
                glow:
                    "shadow-[0_0_14px_rgba(34,211,238,0.16)]",
                label: "Assessment analyzed",
            };

        case "PENDING":
            return {
                dot: "bg-amber-300",
                text: "text-amber-300",
                border: "border-amber-400/25",
                background:
                    "bg-amber-400/[0.07]",
                glow:
                    "shadow-[0_0_14px_rgba(251,191,36,0.14)]",
                label: "Awaiting analysis",
            };

        case "MITIGATED":
            return {
                dot: "bg-emerald-300",
                text: "text-emerald-300",
                border:
                    "border-emerald-400/25",
                background:
                    "bg-emerald-400/[0.07]",
                glow:
                    "shadow-[0_0_14px_rgba(52,211,153,0.14)]",
                label: "Risk mitigated",
            };

        case "CLOSED":
            return {
                dot: "bg-slate-300",
                text: "text-slate-300",
                border:
                    "border-slate-400/20",
                background:
                    "bg-slate-400/[0.05]",
                glow: "",
                label: "Assessment closed",
            };

        default:
            return {
                dot: "bg-slate-400",
                text: "text-slate-400",
                border:
                    "border-white/[0.08]",
                background:
                    "bg-white/[0.025]",
                glow: "",
                label: "Status unavailable",
            };
    }
};


/* ================================================================
   TELEMETRY ITEM
================================================================ */

const DetailItem = ({
    icon: Icon,
    label,
    children,
    accent = "cyan",
}) => {
    const accentStyles = {
        cyan: {
            icon:
                "border-cyan-400/20 bg-cyan-400/[0.05] text-cyan-300",
            line:
                "bg-cyan-400/70",
        },

        amber: {
            icon:
                "border-amber-400/20 bg-amber-400/[0.05] text-amber-300",
            line:
                "bg-amber-400/70",
        },

        slate: {
            icon:
                "border-slate-400/15 bg-white/[0.025] text-slate-400",
            line:
                "bg-slate-400/40",
        },
    };

    const style =
        accentStyles[accent] ||
        accentStyles.cyan;

    return (
        <div className="group relative min-w-0">
            {/* Left telemetry accent */}

            <div
                className={`
                    absolute
                    left-0
                    top-1
                    bottom-1
                    w-px
                    rounded-full
                    opacity-40
                    transition-opacity
                    duration-300
                    group-hover:opacity-100
                    ${style.line}
                `}
            />

            <div className="pl-3">
                {/* Label */}

                <div className="flex items-center gap-2">
                    <div
                        className={`
                            flex
                            h-6
                            w-6
                            shrink-0
                            items-center
                            justify-center
                            rounded-md
                            border
                            ${style.icon}
                        `}
                    >
                        <Icon size={11} />
                    </div>

                    <div className="min-w-0">
                        <p
                            className="
                                font-['Inter']
                                text-[7px]
                                font-semibold
                                uppercase
                                tracking-[0.15em]
                                text-slate-600
                            "
                        >
                            {label}
                        </p>

                        <div
                            className="
                                mt-1
                                min-w-0
                                font-['Inter']
                                text-[11px]
                                font-medium
                                text-slate-200
                            "
                        >
                            {children}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


/* ================================================================
   RISK ASSESSMENT DETAILS
================================================================ */

const RiskAssessmentDetails = ({ risk }) => {
    if (!risk) {
        return null;
    }

    const status =
        String(risk.status ?? "")
            .toUpperCase();

    const statusStyle =
        getStatusStyle(status);

    return (
        <section
            aria-label="Risk assessment details"
            className="
                group
                relative
                overflow-hidden
                rounded-2xl
                border
                border-cyan-400/[0.10]
                bg-[#020a16]
                shadow-[0_18px_50px_rgba(0,0,0,0.22)]
            "
        >
            {/* =====================================================
                ATMOSPHERIC BACKGROUND
            ===================================================== */}

            <div
                aria-hidden="true"
                className="
                    pointer-events-none
                    absolute
                    inset-0
                    bg-[radial-gradient(circle_at_8%_50%,rgba(34,211,238,0.045),transparent_30%),radial-gradient(circle_at_92%_50%,rgba(34,211,238,0.025),transparent_28%)]
                "
            />

            {/* Technical grid */}

            <div
                aria-hidden="true"
                className="
                    pointer-events-none
                    absolute
                    inset-0
                    opacity-[0.18]
                    [background-image:linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)]
                    [background-size:32px_32px]
                    [mask-image:linear-gradient(to_right,transparent,black_18%,black_82%,transparent)]
                "
            />

            {/* Top accent */}

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
                    via-cyan-400/45
                    to-transparent
                "
            />

            {/* =====================================================
                HEADER
            ===================================================== */}

            <div
                className="
                    relative
                    z-10
                    flex
                    flex-col
                    gap-3
                    border-b
                    border-white/[0.055]
                    px-4
                    py-4
                    sm:flex-row
                    sm:items-center
                    sm:justify-between
                    sm:px-5
                "
            >
                <div className="flex items-center gap-3">
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
                            border-cyan-400/20
                            bg-cyan-400/[0.05]
                            text-cyan-300
                        "
                    >
                        <FiRadio size={14} />

                        <span
                            className="
                                absolute
                                -right-1
                                -top-1
                                h-1.5
                                w-1.5
                                rounded-full
                                bg-cyan-300
                                shadow-[0_0_8px_rgba(103,232,249,0.8)]
                            "
                        />
                    </div>

                    <div>
                        <h2
                            className="
                                font-['Orbitron']
                                text-[10px]
                                font-semibold
                                uppercase
                                tracking-[0.13em]
                                text-slate-100
                            "
                        >
                            Assessment Telemetry
                        </h2>

                        <p
                            className="
                                mt-1
                                font-['Inter']
                                text-[8px]
                                text-slate-600
                            "
                        >
                            Backend assessment record
                        </p>
                    </div>
                </div>

                {/* System status */}

                <div
                    className={`
                        inline-flex
                        w-fit
                        items-center
                        gap-2
                        rounded-full
                        border
                        px-2.5
                        py-1.5
                        ${statusStyle.border}
                        ${statusStyle.background}
                        ${statusStyle.glow}
                    `}
                >
                    <span
                        className={`
                            h-1.5
                            w-1.5
                            rounded-full
                            ${statusStyle.dot}
                        `}
                    />

                    <span
                        className={`
                            font-['Inter']
                            text-[7px]
                            font-semibold
                            uppercase
                            tracking-[0.12em]
                            ${statusStyle.text}
                        `}
                    >
                        {status || "UNKNOWN"}
                    </span>

                    <span
                        className="
                            hidden
                            h-3
                            w-px
                            bg-white/[0.08]
                            sm:block
                        "
                    />

                    <span
                        className="
                            hidden
                            font-['Inter']
                            text-[7px]
                            text-slate-600
                            sm:block
                        "
                    >
                        {statusStyle.label}
                    </span>
                </div>
            </div>


            {/* =====================================================
                TELEMETRY GRID
            ===================================================== */}

            <div
                className="
                    relative
                    z-10
                    grid
                    grid-cols-1
                    sm:grid-cols-2
                    lg:grid-cols-4
                "
            >
                {/* =================================================
                    RISK CODE
                ================================================= */}

                <div
                    className="
                        border-b
                        border-white/[0.05]
                        px-4
                        py-4
                        sm:border-r
                        sm:px-5
                        lg:border-b-0
                    "
                >
                    <DetailItem
                        icon={FiHash}
                        label="Risk Code"
                        accent="cyan"
                    >
                        <span
                            className="
                                block
                                truncate
                                font-['Orbitron']
                                text-[11px]
                                font-semibold
                                tracking-[0.03em]
                                text-slate-100
                            "
                            title={
                                risk.riskCode ||
                                "—"
                            }
                        >
                            {risk.riskCode ||
                                "—"}
                        </span>

                        <span
                            className="
                                mt-1
                                block
                                font-['Inter']
                                text-[7px]
                                uppercase
                                tracking-[0.08em]
                                text-slate-600
                            "
                        >
                            Assessment identifier
                        </span>
                    </DetailItem>
                </div>


                {/* =================================================
                    STATUS
                ================================================= */}

                <div
                    className="
                        border-b
                        border-white/[0.05]
                        px-4
                        py-4
                        sm:px-5
                        lg:border-r
                        lg:border-b-0
                    "
                >
                    <DetailItem
                        icon={FiCheckCircle}
                        label="Status"
                        accent="cyan"
                    >
                        {status ? (
                            <div className="flex min-w-0 items-center gap-2">
                                <span
                                    className={`
                                        inline-flex
                                        min-w-0
                                        items-center
                                        gap-1.5
                                        rounded-lg
                                        border
                                        px-2
                                        py-1
                                        ${statusStyle.border}
                                        ${statusStyle.background}
                                        ${statusStyle.glow}
                                    `}
                                >
                                    <span
                                        className={`
                                            h-1.5
                                            w-1.5
                                            shrink-0
                                            rounded-full
                                            ${statusStyle.dot}
                                        `}
                                    />

                                    <span
                                        className={`
                                            truncate
                                            font-['Orbitron']
                                            text-[8px]
                                            font-semibold
                                            tracking-[0.04em]
                                            ${statusStyle.text}
                                        `}
                                    >
                                        {status}
                                    </span>
                                </span>
                            </div>
                        ) : (
                            <span className="text-slate-600">
                                —
                            </span>
                        )}
                    </DetailItem>
                </div>


                {/* =================================================
                    ASSESSED
                ================================================= */}

                <div
                    className="
                        border-b
                        border-white/[0.05]
                        px-4
                        py-4
                        sm:border-r
                        sm:px-5
                        lg:border-b-0
                    "
                >
                    <DetailItem
                        icon={FiCalendar}
                        label="Assessed"
                        accent="cyan"
                    >
                        <span
                            className="
                                block
                                font-['Orbitron']
                                text-[9px]
                                font-medium
                                leading-4
                                text-slate-200
                            "
                        >
                            {formatDateTime(
                                risk.assessedAt,
                            )}
                        </span>

                        <span
                            className="
                                mt-1
                                block
                                font-['Inter']
                                text-[7px]
                                uppercase
                                tracking-[0.08em]
                                text-slate-600
                            "
                        >
                            Initial assessment
                        </span>
                    </DetailItem>
                </div>


                {/* =================================================
                    UPDATED
                ================================================= */}

                <div
                    className="
                        px-4
                        py-4
                        sm:px-5
                    "
                >
                    <DetailItem
                        icon={FiClock}
                        label="Updated"
                        accent="slate"
                    >
                        <span
                            className="
                                block
                                font-['Orbitron']
                                text-[9px]
                                font-medium
                                leading-4
                                text-slate-200
                            "
                        >
                            {formatDateTime(
                                risk.updatedAt,
                            )}
                        </span>

                        <span
                            className="
                                mt-1
                                block
                                font-['Inter']
                                text-[7px]
                                uppercase
                                tracking-[0.08em]
                                text-slate-600
                            "
                        >
                            Latest backend update
                        </span>
                    </DetailItem>
                </div>
            </div>


            {/* =====================================================
                FOOTER SYSTEM LINE
            ===================================================== */}

            <div
                className="
                    relative
                    z-10
                    flex
                    items-center
                    justify-between
                    gap-3
                    border-t
                    border-white/[0.045]
                    bg-white/[0.012]
                    px-4
                    py-2.5
                    sm:px-5
                "
            >
                <div className="flex items-center gap-2">
                    <span
                        className="
                            h-1
                            w-1
                            rounded-full
                            bg-emerald-400
                            shadow-[0_0_7px_rgba(52,211,153,0.75)]
                        "
                    />

                    <span
                        className="
                            font-['Inter']
                            text-[7px]
                            font-medium
                            uppercase
                            tracking-[0.10em]
                            text-slate-600
                        "
                    >
                        Backend source of truth
                    </span>
                </div>

                <span
                    className="
                        font-['Inter']
                        text-[7px]
                        uppercase
                        tracking-[0.10em]
                        text-slate-700
                    "
                >
                    OrbitGuard / Risk Engine
                </span>
            </div>
        </section>
    );
};

export default RiskAssessmentDetails;