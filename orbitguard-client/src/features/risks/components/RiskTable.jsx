import {
    FiActivity,
    FiAlertCircle,
    FiArrowRight,
    FiCalendar,
    FiChevronLeft,
    FiChevronRight,
    FiCircle,
    FiEye,
    FiRadio,
    FiShield,
    FiTarget,
} from "react-icons/fi";

/**
 * ================================================================
 * OrbitGuard AI - Risk Operations Center
 * RiskTable
 * ================================================================
 *
 * RESPONSIBILITY
 * ----------------------------------------------------------------
 * Present paginated collision-risk assessments returned by the
 * OrbitGuard backend.
 *
 * This component:
 *
 * - DOES NOT call the API
 * - DOES NOT calculate risk
 * - DOES NOT modify backend values
 * - DOES NOT generate dummy records
 * - DOES NOT determine risk level
 * - DOES NOT calculate collision probability
 *
 * Parent/container is responsible for:
 *
 * - API requests
 * - pagination state
 * - filtering
 * - sorting
 * - navigation
 *
 * Expected backend record:
 *
 * {
 *   id,
 *   riskCode,
 *   satelliteId,
 *   debrisId,
 *   closestApproachDistanceKm,
 *   relativeVelocityKmPerSec,
 *   collisionProbability,
 *   riskLevel,
 *   status,
 *   assessmentType,
 *   recommendation,
 *   remarks,
 *   assessedAt,
 *   createdAt,
 *   updatedAt
 * }
 *
 * Expected pagination object:
 *
 * {
 *   content: [],
 *   pageNumber,
 *   pageSize,
 *   totalElements,
 *   totalPages,
 *   first,
 *   last
 * }
 * ================================================================
 */


/* ================================================================
   FORMATTERS
================================================================ */

/**
 * Safely display backend values.
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
 * Format numeric backend values.
 *
 * This is presentation-only.
 * No backend value is changed.
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

    return numericValue.toLocaleString(
        "en-US",
        {
            minimumFractionDigits: 0,
            maximumFractionDigits,
        },
    );
};


/**
 * Format probability returned by backend.
 *
 * Backend stores probability as 0 - 100.
 */
const formatProbability = (value) => {
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

    return `${numericValue.toFixed(2)}%`;
};


/**
 * Format assessment timestamp.
 */
const formatDateTime = (value) => {
    if (!value) {
        return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return String(value);
    }

    return date.toLocaleString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
        },
    );
};


/* ================================================================
   RISK LEVEL
================================================================ */

/**
 * Backend RiskLevel:
 *
 * LOW
 * MEDIUM
 * HIGH
 * CRITICAL
 */
const getRiskConfig = (riskLevel) => {
    const normalized =
        riskLevel
            ? String(riskLevel).toUpperCase()
            : "";

    switch (normalized) {

        case "CRITICAL":
            return {
                label: "CRITICAL",
                className:
                    "border-rose-400/30 bg-rose-400/[0.08] text-rose-300",
                dotClass:
                    "bg-rose-400 shadow-[0_0_9px_rgba(251,113,133,0.8)]",
                icon: FiAlertCircle,
            };

        case "HIGH":
            return {
                label: "HIGH",
                className:
                    "border-orange-400/30 bg-orange-400/[0.08] text-orange-300",
                dotClass:
                    "bg-orange-400 shadow-[0_0_9px_rgba(251,146,60,0.8)]",
                icon: FiAlertCircle,
            };

        case "MEDIUM":
            return {
                label: "MEDIUM",
                className:
                    "border-amber-400/30 bg-amber-400/[0.08] text-amber-300",
                dotClass:
                    "bg-amber-400 shadow-[0_0_9px_rgba(251,191,36,0.8)]",
                icon: FiActivity,
            };

        case "LOW":
            return {
                label: "LOW",
                className:
                    "border-emerald-400/30 bg-emerald-400/[0.08] text-emerald-300",
                dotClass:
                    "bg-emerald-400 shadow-[0_0_9px_rgba(52,211,153,0.8)]",
                icon: FiShield,
            };

        default:
            return {
                label: "UNKNOWN",
                className:
                    "border-slate-600/40 bg-slate-700/20 text-slate-400",
                dotClass:
                    "bg-slate-500",
                icon: FiCircle,
            };
    }
};


/**
 * Risk level badge.
 */
const RiskLevelBadge = ({
    riskLevel,
}) => {

    const config =
        getRiskConfig(riskLevel);

    const Icon =
        config.icon;

    return (
        <span
            className={`
                inline-flex
                items-center
                gap-1.5
                rounded-full
                border
                px-2.5
                py-1
                font-['Orbitron']
                text-[8px]
                font-semibold
                uppercase
                tracking-[0.08em]
                whitespace-nowrap
                ${config.className}
            `}
        >

            <span
                className={`
                    h-1.5
                    w-1.5
                    shrink-0
                    rounded-full
                    ${config.dotClass}
                `}
            />

            <Icon
                size={10}
                className="shrink-0"
            />

            {config.label}

        </span>
    );
};


/* ================================================================
   STATUS
================================================================ */

/**
 * Backend RiskStatus:
 *
 * PENDING
 * ANALYZED
 * MITIGATED
 * CLOSED
 */
const getStatusConfig = (status) => {

    const normalized =
        status
            ? String(status).toUpperCase()
            : "";

    switch (normalized) {

        case "ANALYZED":
            return {
                label: "ANALYZED",
                className:
                    "border-cyan-400/25 bg-cyan-400/[0.07] text-cyan-300",
                dotClass:
                    "bg-cyan-400",
            };

        case "PENDING":
            return {
                label: "PENDING",
                className:
                    "border-amber-400/25 bg-amber-400/[0.07] text-amber-300",
                dotClass:
                    "bg-amber-400",
            };

        case "MITIGATED":
            return {
                label: "MITIGATED",
                className:
                    "border-emerald-400/25 bg-emerald-400/[0.07] text-emerald-300",
                dotClass:
                    "bg-emerald-400",
            };

        case "CLOSED":
            return {
                label: "CLOSED",
                className:
                    "border-slate-500/30 bg-slate-700/20 text-slate-400",
                dotClass:
                    "bg-slate-500",
            };

        default:
            return {
                label: "UNKNOWN",
                className:
                    "border-slate-600/30 bg-slate-700/20 text-slate-400",
                dotClass:
                    "bg-slate-500",
            };
    }
};


const StatusBadge = ({
    status,
}) => {

    const config =
        getStatusConfig(status);

    return (
        <span
            className={`
                inline-flex
                items-center
                gap-1.5
                rounded-full
                border
                px-2
                py-1
                font-['Inter']
                text-[9px]
                font-medium
                uppercase
                tracking-[0.05em]
                whitespace-nowrap
                ${config.className}
            `}
        >

            <span
                className={`
                    h-1.5
                    w-1.5
                    rounded-full
                    ${config.dotClass}
                `}
            />

            {config.label}

        </span>
    );
};


/* ================================================================
   ASSESSMENT TYPE
================================================================ */

const AssessmentTypeBadge = ({
    assessmentType,
}) => {

    const normalized =
        assessmentType
            ? String(assessmentType).toUpperCase()
            : "";

    return (
        <span
            className="
                inline-flex
                items-center
                rounded-md
                border
                border-white/[0.07]
                bg-white/[0.025]
                px-2
                py-1
                font-['Inter']
                text-[9px]
                font-medium
                uppercase
                tracking-[0.04em]
                text-slate-400
                whitespace-nowrap
            "
        >
            {displayValue(normalized)}
        </span>
    );
};


/* ================================================================
   TABLE HEADER
================================================================ */

const TableHeader = ({
    children,
    className = "",
}) => {
    return (
        <th
            className={`
                whitespace-nowrap
                px-4
                py-3.5
                text-left
                font-['Orbitron']
                text-[8px]
                font-semibold
                uppercase
                tracking-[0.13em]
                text-slate-500
                ${className}
            `}
        >
            {children}
        </th>
    );
};


/* ================================================================
   EMPTY STATE
================================================================ */

const EmptyState = () => {
    return (
        <div
            className="
                flex
                min-h-[260px]
                flex-col
                items-center
                justify-center
                px-6
                py-12
                text-center
            "
        >

            <div
                className="
                    mb-4
                    flex
                    h-12
                    w-12
                    items-center
                    justify-center
                    rounded-xl
                    border
                    border-cyan-400/15
                    bg-cyan-400/[0.04]
                    text-cyan-400/60
                "
            >
                <FiShield size={21} />
            </div>

            <h3
                className="
                    font-['Orbitron']
                    text-[11px]
                    font-semibold
                    uppercase
                    tracking-[0.12em]
                    text-slate-300
                "
            >
                No Risk Assessments
            </h3>

            <p
                className="
                    mt-2
                    max-w-sm
                    font-['Inter']
                    text-[11px]
                    leading-5
                    text-slate-500
                "
            >
                No collision-risk assessments match the
                current operational filters.
            </p>

        </div>
    );
};


/* ================================================================
   LOADING STATE
================================================================ */

const LoadingState = () => {
    return (
        <div
            className="
                min-h-[260px]
                px-4
                py-8
            "
        >

            <div className="space-y-3">

                {Array.from(
                    { length: 6 },
                ).map((_, index) => (
                    <div
                        key={index}
                        className="
                            h-12
                            animate-pulse
                            rounded-lg
                            bg-white/[0.025]
                        "
                    />
                ))}

            </div>

        </div>
    );
};


/* ================================================================
   ERROR STATE
================================================================ */

const ErrorState = ({
    message,
}) => {
    return (
        <div
            className="
                flex
                min-h-[260px]
                flex-col
                items-center
                justify-center
                px-6
                py-12
                text-center
            "
        >

            <div
                className="
                    mb-4
                    flex
                    h-12
                    w-12
                    items-center
                    justify-center
                    rounded-xl
                    border
                    border-rose-400/20
                    bg-rose-400/[0.05]
                    text-rose-300
                "
            >
                <FiAlertCircle size={21} />
            </div>

            <h3
                className="
                    font-['Orbitron']
                    text-[11px]
                    font-semibold
                    uppercase
                    tracking-[0.12em]
                    text-slate-300
                "
            >
                Risk Data Unavailable
            </h3>

            <p
                className="
                    mt-2
                    max-w-md
                    font-['Inter']
                    text-[11px]
                    leading-5
                    text-slate-500
                "
            >
                {displayValue(message)}
            </p>

        </div>
    );
};


/* ================================================================
   PAGINATION
================================================================ */

const Pagination = ({
    pageNumber,
    pageSize,
    totalElements,
    totalPages,
    first,
    last,
    onPageChange,
}) => {

    const safePageNumber =
        Number.isFinite(Number(pageNumber))
            ? Number(pageNumber)
            : 0;

    const safePageSize =
        Number.isFinite(Number(pageSize))
            ? Number(pageSize)
            : 10;

    const safeTotalElements =
        Number.isFinite(Number(totalElements))
            ? Number(totalElements)
            : 0;

    const safeTotalPages =
        Number.isFinite(Number(totalPages))
            ? Number(totalPages)
            : 0;

    const start =
        safeTotalElements === 0
            ? 0
            : (safePageNumber * safePageSize) + 1;

    const end =
        Math.min(
            (safePageNumber + 1) * safePageSize,
            safeTotalElements,
        );

    if (safeTotalElements === 0) {
        return null;
    }

    return (
        <div
            className="
                flex
                flex-col
                gap-3
                border-t
                border-white/[0.05]
                px-4
                py-3.5
                sm:flex-row
                sm:items-center
                sm:justify-between
                sm:px-5
            "
        >

            <div
                className="
                    font-['Inter']
                    text-[10px]
                    text-slate-500
                "
            >
                Showing{" "}
                <span className="text-slate-300">
                    {start}
                </span>
                {" – "}
                <span className="text-slate-300">
                    {end}
                </span>
                {" of "}
                <span className="text-slate-300">
                    {safeTotalElements}
                </span>
                {" assessments"}
            </div>


            <div
                className="
                    flex
                    items-center
                    gap-2
                "
            >

                <button
                    type="button"
                    disabled={
                        first ||
                        safePageNumber <= 0
                    }
                    onClick={() =>
                        onPageChange?.(
                            safePageNumber - 1,
                        )
                    }
                    className="
                        inline-flex
                        h-8
                        w-8
                        items-center
                        justify-center
                        rounded-lg
                        border
                        border-white/[0.07]
                        bg-white/[0.02]
                        text-slate-400
                        transition
                        hover:border-cyan-400/20
                        hover:bg-cyan-400/[0.05]
                        hover:text-cyan-300
                        disabled:cursor-not-allowed
                        disabled:opacity-30
                    "
                    aria-label="Previous page"
                >
                    <FiChevronLeft size={14} />
                </button>


                <div
                    className="
                        flex
                        min-w-[74px]
                        items-center
                        justify-center
                        rounded-lg
                        border
                        border-white/[0.06]
                        bg-white/[0.02]
                        px-3
                        py-1.5
                        font-['Orbitron']
                        text-[9px]
                        text-slate-400
                    "
                >
                    {safeTotalPages === 0
                        ? "0 / 0"
                        : `${safePageNumber + 1} / ${safeTotalPages}`}
                </div>


                <button
                    type="button"
                    disabled={
                        last ||
                        safePageNumber >= safeTotalPages - 1
                    }
                    onClick={() =>
                        onPageChange?.(
                            safePageNumber + 1,
                        )
                    }
                    className="
                        inline-flex
                        h-8
                        w-8
                        items-center
                        justify-center
                        rounded-lg
                        border
                        border-white/[0.07]
                        bg-white/[0.02]
                        text-slate-400
                        transition
                        hover:border-cyan-400/20
                        hover:bg-cyan-400/[0.05]
                        hover:text-cyan-300
                        disabled:cursor-not-allowed
                        disabled:opacity-30
                    "
                    aria-label="Next page"
                >
                    <FiChevronRight size={14} />
                </button>

            </div>

        </div>
    );
};


/* ================================================================
   MAIN COMPONENT
================================================================ */

const RiskTable = ({
    risks = [],
    loading = false,
    error = null,

    pageNumber = 0,
    pageSize = 10,
    totalElements = 0,
    totalPages = 0,
    first = true,
    last = true,

    onPageChange,
    onViewRisk,
}) => {

    /*
     * ------------------------------------------------------------
     * Normalize content
     * ------------------------------------------------------------
     *
     * Backend PagedResponse normally provides content.
     * This component receives the already extracted array.
     */
    const records =
        Array.isArray(risks)
            ? risks
            : [];


    /* ------------------------------------------------------------
       Loading
    ------------------------------------------------------------ */

    if (loading) {
        return (
            <section
                className="
                    overflow-hidden
                    rounded-2xl
                    border
                    border-white/[0.06]
                    bg-[#020817]/75
                    shadow-[0_18px_50px_rgba(0,0,0,0.22)]
                    backdrop-blur-xl
                "
            >
                <LoadingState />
            </section>
        );
    }


    /* ------------------------------------------------------------
       Error
    ------------------------------------------------------------ */

    if (error) {
        return (
            <section
                className="
                    overflow-hidden
                    rounded-2xl
                    border
                    border-white/[0.06]
                    bg-[#020817]/75
                    shadow-[0_18px_50px_rgba(0,0,0,0.22)]
                    backdrop-blur-xl
                "
            >
                <ErrorState
                    message={error}
                />
            </section>
        );
    }


    /* ------------------------------------------------------------
       Main Table
    ------------------------------------------------------------ */

    return (
        <section
            aria-labelledby="risk-table-heading"
            className="
                overflow-hidden
                rounded-2xl
                border
                border-white/[0.06]
                bg-[#020817]/75
                shadow-[0_18px_50px_rgba(0,0,0,0.22)]
                backdrop-blur-xl
            "
        >

            {/* =====================================================
                TABLE HEADER
            ===================================================== */}

            <div
                className="
                    flex
                    flex-col
                    gap-3
                    border-b
                    border-white/[0.05]
                    px-4
                    py-4
                    sm:flex-row
                    sm:items-center
                    sm:justify-between
                    sm:px-5
                "
            >

                <div
                    className="
                        flex
                        min-w-0
                        items-center
                        gap-3
                    "
                >

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
                            bg-cyan-400/[0.05]
                            text-cyan-300
                        "
                    >
                        <FiTarget size={16} />
                    </div>

                    <div className="min-w-0">

                        <h2
                            id="risk-table-heading"
                            className="
                                font-['Orbitron']
                                text-[10px]
                                font-semibold
                                uppercase
                                tracking-[0.13em]
                                text-slate-200
                                sm:text-[11px]
                            "
                        >
                            Collision Risk Assessments
                        </h2>

                        <p
                            className="
                                mt-1
                                font-['Inter']
                                text-[10px]
                                text-slate-500
                                sm:text-[11px]
                            "
                        >
                            Live assessment records from the
                            OrbitGuard risk engine.
                        </p>

                    </div>

                </div>


                <div
                    className="
                        inline-flex
                        w-fit
                        items-center
                        gap-2
                        rounded-full
                        border
                        border-white/[0.06]
                        bg-white/[0.02]
                        px-2.5
                        py-1.5
                        font-['Inter']
                        text-[9px]
                        text-slate-500
                    "
                >
                    <FiRadio
                        size={10}
                        className="text-cyan-400"
                    />

                    {totalElements}{" "}
                    {totalElements === 1
                        ? "assessment"
                        : "assessments"}

                </div>

            </div>


            {/* =====================================================
                TABLE
            ===================================================== */}

            {records.length === 0 ? (

                <EmptyState />

            ) : (

                <div className="w-full overflow-x-auto">

                    <table
                        className="
                            min-w-[1120px]
                            w-full
                            border-collapse
                        "
                    >

                        <thead
                            className="
                                border-b
                                border-white/[0.05]
                                bg-white/[0.015]
                            "
                        >

                            <tr>

                                <TableHeader>
                                    Risk
                                </TableHeader>

                                <TableHeader>
                                    Satellite / Debris
                                </TableHeader>

                                <TableHeader>
                                    Closest Approach
                                </TableHeader>

                                <TableHeader>
                                    Relative Velocity
                                </TableHeader>

                                <TableHeader>
                                    Probability
                                </TableHeader>

                                <TableHeader>
                                    Risk Level
                                </TableHeader>

                                <TableHeader>
                                    Status
                                </TableHeader>

                                <TableHeader>
                                    Assessed
                                </TableHeader>

                                <TableHeader className="text-right">
                                    Action
                                </TableHeader>

                            </tr>

                        </thead>


                        <tbody>

                            {records.map(
                                (risk, index) => {

                                    const riskId =
                                        risk?.id;

                                    const riskLevel =
                                        risk?.riskLevel;

                                    return (
                                        <tr
                                            key={
                                                riskId ||
                                                risk?.riskCode ||
                                                index
                                            }
                                            className="
                                                group
                                                border-b
                                                border-white/[0.035]
                                                transition-colors
                                                last:border-b-0
                                                hover:bg-cyan-400/[0.018]
                                            "
                                        >

                                            {/* =================================
                                                RISK IDENTITY
                                            ================================= */}

                                            <td className="px-4 py-4">

                                                <div
                                                    className="
                                                        flex
                                                        items-start
                                                        gap-3
                                                    "
                                                >

                                                    <div
                                                        className="
                                                            mt-0.5
                                                            flex
                                                            h-8
                                                            w-8
                                                            shrink-0
                                                            items-center
                                                            justify-center
                                                            rounded-lg
                                                            border
                                                            border-white/[0.06]
                                                            bg-white/[0.025]
                                                            text-slate-500
                                                            transition
                                                            group-hover:border-cyan-400/15
                                                            group-hover:text-cyan-300
                                                        "
                                                    >
                                                        <FiShield
                                                            size={14}
                                                        />
                                                    </div>

                                                    <div className="min-w-0">

                                                        <div
                                                            className="
                                                                font-['Orbitron']
                                                                text-[9px]
                                                                font-semibold
                                                                tracking-[0.07em]
                                                                text-slate-200
                                                            "
                                                        >
                                                            {displayValue(
                                                                risk?.riskCode,
                                                            )}
                                                        </div>

                                                        <div
                                                            className="
                                                                mt-1
                                                                font-['Inter']
                                                                text-[9px]
                                                                text-slate-600
                                                            "
                                                        >
                                                            ID{" "}
                                                            {displayValue(
                                                                riskId,
                                                            )}
                                                        </div>

                                                    </div>

                                                </div>

                                            </td>


                                            {/* =================================
                                                SATELLITE / DEBRIS
                                            ================================= */}

                                            <td className="px-4 py-4">

                                                <div className="space-y-2">

                                                    <div
                                                        className="
                                                            flex
                                                            items-center
                                                            gap-2
                                                        "
                                                    >

                                                        <FiRadio
                                                            size={11}
                                                            className="
                                                                shrink-0
                                                                text-cyan-400/60
                                                            "
                                                        />

                                                        <div className="min-w-0">

                                                            <div
                                                                className="
                                                                    font-['Inter']
                                                                    text-[10px]
                                                                    font-medium
                                                                    text-slate-300
                                                                "
                                                            >
                                                                Satellite
                                                            </div>

                                                            <div
                                                                className="
                                                                    max-w-[150px]
                                                                    truncate
                                                                    font-mono
                                                                    text-[9px]
                                                                    text-slate-500
                                                                "
                                                                title={
                                                                    risk?.satelliteId
                                                                }
                                                            >
                                                                {displayValue(
                                                                    risk?.satelliteId,
                                                                )}
                                                            </div>

                                                        </div>

                                                    </div>


                                                    <div
                                                        className="
                                                            flex
                                                            items-center
                                                            gap-2
                                                        "
                                                    >

                                                        <FiCircle
                                                            size={11}
                                                            className="
                                                                shrink-0
                                                                text-orange-300/60
                                                            "
                                                        />

                                                        <div className="min-w-0">

                                                            <div
                                                                className="
                                                                    font-['Inter']
                                                                    text-[10px]
                                                                    font-medium
                                                                    text-slate-300
                                                                "
                                                            >
                                                                Debris
                                                            </div>

                                                            <div
                                                                className="
                                                                    max-w-[150px]
                                                                    truncate
                                                                    font-mono
                                                                    text-[9px]
                                                                    text-slate-500
                                                                "
                                                                title={
                                                                    risk?.debrisId
                                                                }
                                                            >
                                                                {displayValue(
                                                                    risk?.debrisId,
                                                                )}
                                                            </div>

                                                        </div>

                                                    </div>

                                                </div>

                                            </td>


                                            {/* =================================
                                                DISTANCE
                                            ================================= */}

                                            <td className="px-4 py-4">

                                                <div
                                                    className="
                                                        font-['Inter']
                                                        text-[11px]
                                                        font-medium
                                                        tabular-nums
                                                        text-slate-200
                                                    "
                                                >
                                                    {risk?.closestApproachDistanceKm !==
                                                    null &&
                                                    risk?.closestApproachDistanceKm !==
                                                    undefined
                                                        ? formatNumber(
                                                            risk.closestApproachDistanceKm,
                                                            3,
                                                        )
                                                        : "—"}
                                                </div>

                                                <div
                                                    className="
                                                        mt-1
                                                        font-['Inter']
                                                        text-[8px]
                                                        uppercase
                                                        tracking-[0.08em]
                                                        text-slate-600
                                                    "
                                                >
                                                    kilometers
                                                </div>

                                            </td>


                                            {/* =================================
                                                RELATIVE VELOCITY
                                            ================================= */}

                                            <td className="px-4 py-4">

                                                <div
                                                    className="
                                                        font-['Inter']
                                                        text-[11px]
                                                        font-medium
                                                        tabular-nums
                                                        text-slate-200
                                                    "
                                                >
                                                    {risk?.relativeVelocityKmPerSec !==
                                                    null &&
                                                    risk?.relativeVelocityKmPerSec !==
                                                    undefined
                                                        ? formatNumber(
                                                            risk.relativeVelocityKmPerSec,
                                                            3,
                                                        )
                                                        : "—"}
                                                </div>

                                                <div
                                                    className="
                                                        mt-1
                                                        font-['Inter']
                                                        text-[8px]
                                                        uppercase
                                                        tracking-[0.08em]
                                                        text-slate-600
                                                    "
                                                >
                                                    km/s
                                                </div>

                                            </td>


                                            {/* =================================
                                                PROBABILITY
                                            ================================= */}

                                            <td className="px-4 py-4">

                                                <div
                                                    className="
                                                        flex
                                                        min-w-[90px]
                                                        items-center
                                                        gap-2
                                                    "
                                                >

                                                    <div
                                                        className="
                                                            h-1.5
                                                            flex-1
                                                            overflow-hidden
                                                            rounded-full
                                                            bg-white/[0.05]
                                                        "
                                                    >

                                                        <div
                                                            className="
                                                                h-full
                                                                rounded-full
                                                                bg-cyan-400/70
                                                            "
                                                            style={{
                                                                width:
                                                                    Number.isFinite(
                                                                        Number(
                                                                            risk?.collisionProbability,
                                                                        ),
                                                                    )
                                                                        ? `${Math.min(
                                                                            Math.max(
                                                                                Number(
                                                                                    risk.collisionProbability,
                                                                                ),
                                                                                0,
                                                                            ),
                                                                            100,
                                                                        )}%`
                                                                        : "0%",
                                                            }}
                                                        />

                                                    </div>

                                                    <span
                                                        className="
                                                            font-['Inter']
                                                            text-[10px]
                                                            font-semibold
                                                            tabular-nums
                                                            text-slate-200
                                                        "
                                                    >
                                                        {formatProbability(
                                                            risk?.collisionProbability,
                                                        )}
                                                    </span>

                                                </div>

                                            </td>


                                            {/* =================================
                                                RISK LEVEL
                                            ================================= */}

                                            <td className="px-4 py-4">

                                                <RiskLevelBadge
                                                    riskLevel={
                                                        riskLevel
                                                    }
                                                />

                                            </td>


                                            {/* =================================
                                                STATUS
                                            ================================= */}

                                            <td className="px-4 py-4">

                                                <div className="space-y-1.5">

                                                    <StatusBadge
                                                        status={
                                                            risk?.status
                                                        }
                                                    />

                                                    <AssessmentTypeBadge
                                                        assessmentType={
                                                            risk?.assessmentType
                                                        }
                                                    />

                                                </div>

                                            </td>


                                            {/* =================================
                                                ASSESSED
                                            ================================= */}

                                            <td className="px-4 py-4">

                                                <div
                                                    className="
                                                        flex
                                                        items-center
                                                        gap-2
                                                    "
                                                >

                                                    <FiCalendar
                                                        size={11}
                                                        className="
                                                            shrink-0
                                                            text-slate-600
                                                        "
                                                    />

                                                    <span
                                                        className="
                                                            whitespace-nowrap
                                                            font-['Inter']
                                                            text-[9px]
                                                            text-slate-400
                                                        "
                                                    >
                                                        {formatDateTime(
                                                            risk?.assessedAt,
                                                        )}
                                                    </span>

                                                </div>

                                            </td>


                                            {/* =================================
                                                ACTION
                                            ================================= */}

                                            <td className="px-4 py-4">

                                                <div className="flex justify-end">

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            onViewRisk?.(
                                                                risk,
                                                            )
                                                        }
                                                        disabled={
                                                            !riskId
                                                        }
                                                        className="
                                                            inline-flex
                                                            items-center
                                                            gap-2
                                                            rounded-lg
                                                            border
                                                            border-white/[0.07]
                                                            bg-white/[0.02]
                                                            px-3
                                                            py-2
                                                            font-['Inter']
                                                            text-[9px]
                                                            font-medium
                                                            text-slate-400
                                                            transition
                                                            hover:border-cyan-400/20
                                                            hover:bg-cyan-400/[0.05]
                                                            hover:text-cyan-300
                                                            disabled:cursor-not-allowed
                                                            disabled:opacity-30
                                                        "
                                                        aria-label={`View risk ${displayValue(
                                                            risk?.riskCode,
                                                        )}`}
                                                    >

                                                        <FiEye
                                                            size={12}
                                                        />

                                                        <span>
                                                            View
                                                        </span>

                                                        <FiArrowRight
                                                            size={11}
                                                            className="
                                                                transition-transform
                                                                group-hover:translate-x-0.5
                                                            "
                                                        />

                                                    </button>

                                                </div>

                                            </td>

                                        </tr>
                                    );
                                },
                            )}

                        </tbody>

                    </table>

                </div>

            )}


            {/* =====================================================
                PAGINATION
            ===================================================== */}

            {!loading &&
                !error &&
                records.length > 0 && (
                    <Pagination
                        pageNumber={
                            pageNumber
                        }
                        pageSize={
                            pageSize
                        }
                        totalElements={
                            totalElements
                        }
                        totalPages={
                            totalPages
                        }
                        first={first}
                        last={last}
                        onPageChange={
                            onPageChange
                        }
                    />
                )}

        </section>
    );
};

export default RiskTable;