import {
    FiCalendar,
    FiChevronDown,
    FiFilter,
    FiRefreshCw,
    FiSearch,
    FiSliders,
    FiX,
} from "react-icons/fi";
import { useRef } from "react";

/**
 * ================================================================
 * OrbitGuard AI — Risk Toolbar
 * ================================================================
 *
 * PURPOSE
 * ----------------------------------------------------------------
 * Compact filtering toolbar for the Collision Risk Operations
 * section.
 *
 * VISIBLE FILTERS
 * ----------------------------------------------------------------
 * - Search
 * - Risk Level
 * - Satellite ID
 * - Debris ID
 * - Assessment Date
 *
 * REMOVED
 * ----------------------------------------------------------------
 * - Status
 * - Assessment Type
 * - End Date
 * - Time selection
 *
 * RESPONSIBILITY
 * ----------------------------------------------------------------
 * This component only controls filter UI.
 *
 * It does NOT:
 * - call the API
 * - build API URLs
 * - calculate risk
 * - calculate probability
 * - manipulate backend data
 *
 * RiskOverviewPage remains responsible for:
 * - filter state
 * - backend integration
 * - API query construction
 * - loading state
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

/* ================================================================
   HELPERS
================================================================ */

/**
 * Convert internal filter value into readable UI text.
 */
const getOptionLabel = (options, value) => {
    if (!value) {
        return "";
    }

    return (
        options.find(
            (option) => option.value === value,
        )?.label ?? value
    );
};

/**
 * Format selected date for active filter chip.
 *
 * Example:
 * 2026-10-05
 * -> 05 Oct 2026
 */
const formatDateLabel = (value) => {
    if (!value) {
        return "";
    }

    const date = new Date(`${value}T00:00:00`);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return new Intl.DateTimeFormat("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    }).format(date);
};

/* ================================================================
   SELECT FIELD
================================================================ */

const FilterSelect = ({
    value,
    onChange,
    options,
    ariaLabel,
}) => {
    return (
        <div className="relative min-w-0">
            <select
                value={value ?? ""}
                onChange={(event) =>
                    onChange?.(event.target.value)
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
                    text-xs
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

/* ================================================================
   TEXT INPUT
================================================================ */

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
                onChange?.(event.target.value)
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
                text-xs
                font-medium
                text-slate-300
                outline-none
                transition

                placeholder:text-slate-700

                hover:border-cyan-400/20

                focus:border-cyan-400/40
                focus:ring-1
                focus:ring-cyan-400/10
            "
        />
    );
};

/* ================================================================
   DATE FILTER
================================================================ */

/**
 * Single assessment date filter.
 *
 * DESIGN
 * ----------------------------------------------------------------
 * Left  -> OrbitGuard calendar identity icon
 * Right -> visible OrbitGuard calendar action button
 *
 * The browser's native calendar indicator is hidden because its
 * appearance cannot be reliably styled to match the OrbitGuard UI.
 *
 * The right calendar button opens the native date picker.
 */
const DateFilter = ({
    value,
    onChange,
}) => {
    const inputRef = useRef(null);

    const openDatePicker = () => {
        const input = inputRef.current;

        if (!input) {
            return;
        }

        /*
         * Chromium / Edge / supported browsers.
         *
         * showPicker() opens the native date picker without exposing
         * the browser's ugly default calendar icon.
         */
        if (typeof input.showPicker === "function") {
            try {
                input.showPicker();
                return;
            } catch {
                // Fallback below.
            }
        }

        /*
         * Fallback for browsers that do not support showPicker().
         */
        input.focus();
    };

    return (
        <div className="relative min-w-0">
            {/* =====================================================
                LEFT CALENDAR ICON
            ===================================================== */}

            <FiCalendar
                size={15}
                aria-hidden="true"
                className="
                    pointer-events-none
                    absolute
                    left-3
                    top-1/2
                    z-10
                    -translate-y-1/2
                    text-cyan-400
                "
            />

            {/* =====================================================
                DATE INPUT
            ===================================================== */}

            <input
                ref={inputRef}
                type="date"
                value={value ?? ""}
                onChange={(event) =>
                    onChange?.(event.target.value)
                }
                aria-label="Assessment date"
                title="Assessment date"
                className="
                    h-10
                    w-full
                    appearance-none
                    rounded-xl
                    border
                    border-white/[0.07]
                    bg-[#06111f]
                    pl-10
                    pr-11
                    font-['Inter']
                    text-xs
                    font-medium
                    text-slate-300
                    outline-none
                    transition

                    hover:border-cyan-400/20

                    focus:border-cyan-400/40
                    focus:ring-1
                    focus:ring-cyan-400/10

                    [color-scheme:dark]

                    /* Hide native browser calendar icon */
                    [&::-webkit-calendar-picker-indicator]:opacity-0
                    [&::-webkit-calendar-picker-indicator]:absolute
                    [&::-webkit-calendar-picker-indicator]:right-0
                    [&::-webkit-calendar-picker-indicator]:h-full
                    [&::-webkit-calendar-picker-indicator]:w-10
                    [&::-webkit-calendar-picker-indicator]:cursor-pointer
                "
            />

            {/* =====================================================
                RIGHT CALENDAR ACTION
            ===================================================== */}

            <button
                type="button"
                onClick={openDatePicker}
                aria-label="Open assessment date picker"
                title="Select assessment date"
                className="
                    absolute
                    right-2
                    top-1/2
                    flex
                    h-7
                    w-7
                    -translate-y-1/2
                    items-center
                    justify-center
                    rounded-lg
                    text-cyan-400
                    transition

                    hover:bg-cyan-400/10
                    hover:text-cyan-300

                    focus:outline-none
                    focus:ring-1
                    focus:ring-cyan-400/30

                    active:scale-95
                "
            >
                <FiCalendar
                    size={14}
                    aria-hidden="true"
                />
            </button>
        </div>
    );
};

/* ================================================================
   ACTIVE FILTER CHIP
================================================================ */

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
    onSatelliteIdChange,
    onDebrisIdChange,
    onFromDateChange,

    onReset,

    loading = false,
}) => {
    const {
        search = "",
        riskLevel = "",
        satelliteId = "",
        debrisId = "",
        fromDate = "",
    } = filters;

    /* ============================================================
       ACTIVE FILTER COUNT
    ============================================================ */

    const activeFilterCount = [
        search,
        riskLevel,
        satelliteId,
        debrisId,
        fromDate,
    ].filter(Boolean).length;

    const hasAnyFilter = activeFilterCount > 0;

    /* ============================================================
       DISPLAY LABEL
    ============================================================ */

    const riskLevelLabel = getOptionLabel(
        RISK_LEVEL_OPTIONS,
        riskLevel,
    );

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
                bg-[#020817]/90
                shadow-[0_12px_40px_rgba(0,0,0,0.16)]
                backdrop-blur-xl
            "
        >
            {/* =====================================================
                HEADER
            ===================================================== */}

            <div
                className="
                    flex
                    items-center
                    justify-between
                    gap-4
                    border-b
                    border-white/[0.045]
                    px-4
                    py-4
                    sm:px-5
                "
            >
                <div className="flex min-w-0 items-center gap-3">
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
                        <div className="flex items-center gap-2">
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
                            shrink-0
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

                        Reset
                    </button>
                )}
            </div>

            {/* =====================================================
                FILTER GRID
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
                            xl:col-span-2
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
                            placeholder="Search risk code or recommendation..."
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
                                text-xs
                                font-medium
                                text-slate-300
                                outline-none
                                transition

                                hover:border-cyan-400/20

                                focus:border-cyan-400/40
                                focus:ring-1
                                focus:ring-cyan-400/10

                                placeholder:text-slate-700
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

                    {/* ASSESSMENT DATE */}

                    <DateFilter
                        value={fromDate}
                        onChange={onFromDateChange}
                    />
                </div>

                {/* =================================================
                    ENTITY FILTERS
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
                    {/* SATELLITE */}

                    <FilterInput
                        value={satelliteId}
                        onChange={onSatelliteIdChange}
                        placeholder="Satellite ID"
                        ariaLabel="Filter by satellite ID"
                    />

                    {/* DEBRIS */}

                    <FilterInput
                        value={debrisId}
                        onChange={onDebrisIdChange}
                        placeholder="Debris ID"
                        ariaLabel="Filter by debris ID"
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
                            pt-3
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
                            label="Search"
                            value={search}
                            onClear={() =>
                                onSearchChange?.("")
                            }
                        />

                        <FilterChip
                            label="Risk"
                            value={riskLevelLabel}
                            onClear={() =>
                                onRiskLevelChange?.("")
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

                        <FilterChip
                            label="Date"
                            value={formatDateLabel(fromDate)}
                            onClear={() =>
                                onFromDateChange?.("")
                            }
                        />
                    </div>
                )}
            </div>
        </section>
    );
};

export default RiskToolbar;