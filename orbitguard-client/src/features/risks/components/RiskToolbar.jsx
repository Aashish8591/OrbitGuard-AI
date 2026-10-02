import {
    FiCalendar,
    FiChevronDown,
    FiFilter,
    FiRefreshCw,
    FiSearch,
    FiSliders,
    FiX,
} from "react-icons/fi";

/**
 * ================================================================
 * OrbitGuard AI — Risk Toolbar
 * ================================================================
 *
 * PURPOSE
 * ----------------------------------------------------------------
 * Toolbar for the Collision Risk Operations Center.
 *
 * RESPONSIBILITY
 * ----------------------------------------------------------------
 * - Search risk assessments
 * - Filter by risk level
 * - Filter by risk status
 * - Filter by assessment type
 * - Filter by satellite
 * - Filter by debris
 * - Filter by assessment date range
 * - Reset active filters
 *
 * IMPORTANT ARCHITECTURE
 * ----------------------------------------------------------------
 * This component DOES NOT:
 *
 * - call the API
 * - build API URLs
 * - perform backend requests
 * - calculate risk
 * - calculate probability
 * - manipulate backend data
 *
 * The parent RiskOverviewPage owns the actual filter state
 * and backend integration.
 *
 * Backend query parameters supported:
 *
 * search
 * riskLevel
 * status
 * assessmentType
 * satelliteId
 * debrisId
 * fromDate
 * toDate
 *
 * ================================================================
 */


/* ================================================================
   CONSTANTS
================================================================ */

const RISK_LEVEL_OPTIONS = [
    {
        value: "",
        label: "All Risk Levels",
    },
    {
        value: "LOW",
        label: "Low",
    },
    {
        value: "MEDIUM",
        label: "Medium",
    },
    {
        value: "HIGH",
        label: "High",
    },
    {
        value: "CRITICAL",
        label: "Critical",
    },
];


const RISK_STATUS_OPTIONS = [
    {
        value: "",
        label: "All Status",
    },
    {
        value: "PENDING",
        label: "Pending",
    },
    {
        value: "ANALYZED",
        label: "Analyzed",
    },
    {
        value: "MITIGATED",
        label: "Mitigated",
    },
    {
        value: "CLOSED",
        label: "Closed",
    },
];


const ASSESSMENT_TYPE_OPTIONS = [
    {
        value: "",
        label: "All Assessment Types",
    },
    {
        value: "MANUAL",
        label: "Manual",
    },
    {
        value: "SCHEDULED",
        label: "Scheduled",
    },
    {
        value: "RULE_BASED",
        label: "Rule Based",
    },
    {
        value: "AI_GENERATED",
        label: "AI Generated",
    },
];


/* ================================================================
   SMALL UI COMPONENTS
================================================================ */

/**
 * Select field used by the toolbar.
 */
const FilterSelect = ({
    value,
    onChange,
    options,
    ariaLabel,
    className = "",
}) => {
    return (
        <div
            className={`
                relative
                min-w-0
                ${className}
            `}
        >
            <select
                value={value ?? ""}
                onChange={(event) =>
                    onChange(event.target.value)
                }
                aria-label={ariaLabel}
                className="
                    h-10
                    w-full
                    appearance-none
                    rounded-xl
                    border
                    border-white/[0.07]
                    bg-[#06111f]
                    px-3
                    pr-9
                    font-['Inter']
                    text-[11px]
                    font-medium
                    text-slate-300
                    outline-none
                    transition

                    hover:border-cyan-400/20

                    focus:border-cyan-400/40
                    focus:ring-1
                    focus:ring-cyan-400/10

                    [&>option]:bg-[#06111f]
                    [&>option]:text-slate-200

                    sm:text-xs
                "
            >
                {options.map((option) => (
                    <option
                        key={option.value || "all"}
                        value={option.value}
                    >
                        {option.label}
                    </option>
                ))}
            </select>

            <FiChevronDown
                size={14}
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
    );
};


/**
 * Input used for satellite/debris IDs.
 */
const FilterInput = ({
    value,
    onChange,
    placeholder,
    ariaLabel,
}) => {
    return (
        <input
            type="text"
            value={value ?? ""}
            onChange={(event) =>
                onChange(event.target.value)
            }
            placeholder={placeholder}
            aria-label={ariaLabel}
            className="
                h-10
                w-full
                rounded-xl
                border
                border-white/[0.07]
                bg-[#06111f]
                px-3
                font-['Inter']
                text-[11px]
                font-medium
                text-slate-300
                outline-none
                placeholder:text-slate-700
                transition

                hover:border-cyan-400/20

                focus:border-cyan-400/40
                focus:ring-1
                focus:ring-cyan-400/10

                sm:text-xs
            "
        />
    );
};


/**
 * Date input.
 */
const DateFilter = ({
    value,
    onChange,
    label,
}) => {
    return (
        <div className="relative min-w-0">

            <FiCalendar
                size={13}
                className="
                    pointer-events-none
                    absolute
                    left-3
                    top-1/2
                    -translate-y-1/2
                    text-slate-600
                "
            />

            <input
                type="datetime-local"
                value={value ?? ""}
                onChange={(event) =>
                    onChange(event.target.value)
                }
                aria-label={label}
                className="
                    h-10
                    w-full
                    rounded-xl
                    border
                    border-white/[0.07]
                    bg-[#06111f]
                    pl-9
                    pr-3
                    font-['Inter']
                    text-[10px]
                    font-medium
                    text-slate-300
                    outline-none
                    transition

                    hover:border-cyan-400/20

                    focus:border-cyan-400/40
                    focus:ring-1
                    focus:ring-cyan-400/10

                    [color-scheme:dark]

                    sm:text-[11px]
                "
            />

        </div>
    );
};


/**
 * Active filter chip.
 */
const FilterChip = ({
    label,
    value,
    onClear,
}) => {
    if (!value) {
        return null;
    }

    return (
        <div
            className="
                inline-flex
                max-w-full
                items-center
                gap-1.5
                rounded-full
                border
                border-cyan-400/15
                bg-cyan-400/[0.05]
                px-2.5
                py-1
                font-['Inter']
                text-[9px]
                text-cyan-300
            "
        >
            <span className="truncate">
                {label}: {value}
            </span>

            <button
                type="button"
                onClick={onClear}
                aria-label={`Clear ${label} filter`}
                className="
                    shrink-0
                    rounded-full
                    p-0.5
                    text-cyan-400/60
                    transition
                    hover:bg-cyan-400/10
                    hover:text-cyan-300
                "
            >
                <FiX size={10} />
            </button>
        </div>
    );
};


/* ================================================================
   MAIN COMPONENT
================================================================ */

const RiskToolbar = ({
    filters = {},

    onSearchChange,
    onRiskLevelChange,
    onStatusChange,
    onAssessmentTypeChange,
    onSatelliteIdChange,
    onDebrisIdChange,
    onFromDateChange,
    onToDateChange,

    onReset,

    loading = false,
}) => {

    const {
        search = "",
        riskLevel = "",
        status = "",
        assessmentType = "",
        satelliteId = "",
        debrisId = "",
        fromDate = "",
        toDate = "",
    } = filters;


    /* ============================================================
       ACTIVE FILTER COUNT
    ============================================================ */

    const activeFilterCount = [
        riskLevel,
        status,
        assessmentType,
        satelliteId,
        debrisId,
        fromDate,
        toDate,
    ].filter(Boolean).length;


    const hasAnyFilter =
        Boolean(search) ||
        activeFilterCount > 0;


    /* ============================================================
       RENDER
    ============================================================ */

    return (
        <section
            aria-label="Risk assessment filters"
            className="
                overflow-hidden
                rounded-2xl
                border
                border-white/[0.06]
                bg-[#020817]/80
                shadow-[0_12px_40px_rgba(0,0,0,0.16)]
                backdrop-blur-xl
            "
        >

            {/* =====================================================
                TOOLBAR HEADER
            ===================================================== */}

            <div
                className="
                    flex
                    flex-col
                    gap-3
                    border-b
                    border-white/[0.045]
                    px-4
                    py-4

                    sm:px-5
                    lg:flex-row
                    lg:items-center
                    lg:justify-between
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
                            rounded-xl
                            border
                            border-cyan-400/15
                            bg-cyan-400/[0.05]
                            text-cyan-300
                        "
                    >
                        <FiSliders size={16} />
                    </div>

                    <div className="min-w-0">

                        <div
                            className="
                                flex
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
                                    tracking-[0.14em]
                                    text-slate-200
                                    sm:text-[11px]
                                "
                            >
                                Risk Operations
                            </h2>

                            {activeFilterCount > 0 && (
                                <span
                                    className="
                                        rounded-full
                                        border
                                        border-cyan-400/15
                                        bg-cyan-400/[0.06]
                                        px-1.5
                                        py-0.5
                                        font-['Orbitron']
                                        text-[8px]
                                        font-semibold
                                        text-cyan-300
                                    "
                                >
                                    {activeFilterCount}
                                </span>
                            )}

                        </div>

                        <p
                            className="
                                mt-1
                                font-['Inter']
                                text-[10px]
                                text-slate-600
                                sm:text-[11px]
                            "
                        >
                            Search and filter collision assessments
                        </p>

                    </div>

                </div>


                {/* RESET */}

                {hasAnyFilter && (
                    <button
                        type="button"
                        onClick={onReset}
                        disabled={loading}
                        className="
                            inline-flex
                            h-9
                            w-fit
                            items-center
                            gap-2
                            rounded-lg
                            border
                            border-white/[0.07]
                            bg-white/[0.02]
                            px-3
                            font-['Inter']
                            text-[10px]
                            font-medium
                            text-slate-400
                            transition

                            hover:border-cyan-400/20
                            hover:bg-cyan-400/[0.04]
                            hover:text-cyan-300

                            disabled:cursor-not-allowed
                            disabled:opacity-40
                        "
                    >
                        <FiRefreshCw
                            size={12}
                            className={
                                loading
                                    ? "animate-spin"
                                    : ""
                            }
                        />

                        Reset Filters
                    </button>
                )}

            </div>


            {/* =====================================================
                PRIMARY FILTERS
            ===================================================== */}

            <div className="p-4 sm:p-5">

                <div
                    className="
                        grid
                        grid-cols-1
                        gap-3

                        md:grid-cols-2

                        xl:grid-cols-4
                    "
                >

                    {/* SEARCH */}

                    <div
                        className="
                            relative
                            md:col-span-2
                            xl:col-span-1
                        "
                    >

                        <FiSearch
                            size={14}
                            className="
                                pointer-events-none
                                absolute
                                left-3
                                top-1/2
                                -translate-y-1/2
                                text-slate-600
                            "
                        />

                        <input
                            type="search"
                            value={search}
                            onChange={(event) =>
                                onSearchChange?.(
                                    event.target.value,
                                )
                            }
                            placeholder="Search risk code, recommendation..."
                            aria-label="Search risk assessments"
                            className="
                                h-10
                                w-full
                                rounded-xl
                                border
                                border-white/[0.07]
                                bg-[#06111f]
                                pl-9
                                pr-9
                                font-['Inter']
                                text-[11px]
                                font-medium
                                text-slate-300
                                outline-none
                                transition

                                hover:border-cyan-400/20

                                focus:border-cyan-400/40
                                focus:ring-1
                                focus:ring-cyan-400/10

                                placeholder:text-slate-700

                                sm:text-xs
                            "
                        />

                        {search && (
                            <button
                                type="button"
                                onClick={() =>
                                    onSearchChange?.("")
                                }
                                aria-label="Clear search"
                                className="
                                    absolute
                                    right-3
                                    top-1/2
                                    -translate-y-1/2
                                    text-slate-600
                                    transition
                                    hover:text-slate-300
                                "
                            >
                                <FiX size={13} />
                            </button>
                        )}

                    </div>


                    {/* RISK LEVEL */}

                    <FilterSelect
                        value={riskLevel}
                        onChange={onRiskLevelChange}
                        options={RISK_LEVEL_OPTIONS}
                        ariaLabel="Filter by risk level"
                    />


                    {/* STATUS */}

                    <FilterSelect
                        value={status}
                        onChange={onStatusChange}
                        options={RISK_STATUS_OPTIONS}
                        ariaLabel="Filter by risk status"
                    />


                    {/* ASSESSMENT TYPE */}

                    <FilterSelect
                        value={assessmentType}
                        onChange={onAssessmentTypeChange}
                        options={ASSESSMENT_TYPE_OPTIONS}
                        ariaLabel="Filter by assessment type"
                    />

                </div>


                {/* =================================================
                    ADVANCED ENTITY FILTERS
                ================================================= */}

                <div
                    className="
                        mt-3
                        grid
                        grid-cols-1
                        gap-3

                        md:grid-cols-2

                        xl:grid-cols-4
                    "
                >

                    <FilterInput
                        value={satelliteId}
                        onChange={onSatelliteIdChange}
                        placeholder="Satellite ID"
                        ariaLabel="Filter by satellite ID"
                    />

                    <FilterInput
                        value={debrisId}
                        onChange={onDebrisIdChange}
                        placeholder="Debris ID"
                        ariaLabel="Filter by debris ID"
                    />

                    <DateFilter
                        value={fromDate}
                        onChange={onFromDateChange}
                        label="Assessment start date"
                    />

                    <DateFilter
                        value={toDate}
                        onChange={onToDateChange}
                        label="Assessment end date"
                    />

                </div>


                {/* =================================================
                    ACTIVE FILTERS
                ================================================= */}

                {hasAnyFilter && (
                    <div
                        className="
                            mt-4
                            flex
                            flex-wrap
                            items-center
                            gap-2
                            border-t
                            border-white/[0.035]
                            pt-4
                        "
                    >

                        <div
                            className="
                                mr-1
                                inline-flex
                                items-center
                                gap-1.5
                                font-['Inter']
                                text-[9px]
                                uppercase
                                tracking-[0.08em]
                                text-slate-600
                            "
                        >
                            <FiFilter size={10} />
                            Active
                        </div>


                        <FilterChip
                            label="Risk"
                            value={riskLevel}
                            onClear={() =>
                                onRiskLevelChange?.("")
                            }
                        />

                        <FilterChip
                            label="Status"
                            value={status}
                            onClear={() =>
                                onStatusChange?.("")
                            }
                        />

                        <FilterChip
                            label="Type"
                            value={assessmentType}
                            onClear={() =>
                                onAssessmentTypeChange?.("")
                            }
                        />

                        <FilterChip
                            label="Satellite"
                            value={satelliteId}
                            onClear={() =>
                                onSatelliteIdChange?.("")
                            }
                        />

                        <FilterChip
                            label="Debris"
                            value={debrisId}
                            onClear={() =>
                                onDebrisIdChange?.("")
                            }
                        />

                    </div>
                )}

            </div>

        </section>
    );
};

export default RiskToolbar;