import { useState } from "react";
import {
    FiActivity,
    FiAlertTriangle,
    FiChevronDown,
    FiCrosshair,
    FiDatabase,
    FiLoader,
    FiPlay,
    FiRadio,
    FiShield,
    FiTarget,
    FiX,
} from "react-icons/fi";

/**
 * ================================================================
 * OrbitGuard AI — Analyze Risk Panel
 * ================================================================
 *
 * PURPOSE
 * ------------------------------------------------
 * Creates a new collision-risk assessment.
 *
 * BACKEND CONTRACT
 * ------------------------------------------------
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
 * Response:
 *
 * RiskAssessmentResponse
 *
 * IMPORTANT ARCHITECTURE
 * ------------------------------------------------
 * - This component does NOT perform orbital calculations.
 * - This component does NOT calculate probability.
 * - This component does NOT determine risk level.
 * - Backend is the source of truth.
 * - Parent component owns API integration.
 * - Parent provides satellite/debris options.
 * - Parent receives successful analysis through onAnalyze.
 *
 * This keeps the component reusable and prevents API logic
 * from being duplicated across the Risk module.
 * ================================================================
 */


/* ================================================================
   SMALL UI COMPONENTS
================================================================ */

/**
 * Panel section heading.
 */
const PanelSectionHeader = ({
    icon: Icon,
    eyebrow,
    title,
    description,
}) => {
    return (
        <div className="flex items-start gap-3">

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
                    border-cyan-400/20
                    bg-cyan-400/[0.06]
                    text-cyan-300
                "
            >
                <Icon size={16} />
            </div>

            <div className="min-w-0">

                {eyebrow && (
                    <p
                        className="
                            font-['Orbitron']
                            text-[8px]
                            font-semibold
                            uppercase
                            tracking-[0.18em]
                            text-cyan-400/70
                        "
                    >
                        {eyebrow}
                    </p>
                )}

                <h2
                    className="
                        mt-0.5
                        font-['Orbitron']
                        text-xs
                        font-semibold
                        uppercase
                        tracking-[0.12em]
                        text-slate-100
                        sm:text-sm
                    "
                >
                    {title}
                </h2>

                {description && (
                    <p
                        className="
                            mt-1
                            max-w-xl
                            font-['Inter']
                            text-[10px]
                            leading-4
                            text-slate-500
                            sm:text-[11px]
                        "
                    >
                        {description}
                    </p>
                )}

            </div>

        </div>
    );
};


/**
 * Field label.
 */
const FieldLabel = ({
    htmlFor,
    icon: Icon,
    children,
    required = false,
}) => {
    return (
        <label
            htmlFor={htmlFor}
            className="
                mb-2
                flex
                items-center
                gap-1.5
                font-['Inter']
                text-[10px]
                font-medium
                uppercase
                tracking-[0.08em]
                text-slate-500
            "
        >

            {Icon && (
                <Icon
                    size={11}
                    className="text-slate-600"
                />
            )}

            <span>{children}</span>

            {required && (
                <span className="text-cyan-400">
                    *
                </span>
            )}

        </label>
    );
};


/**
 * Select field.
 */
const EntitySelect = ({
    id,
    value,
    onChange,
    options = [],
    placeholder,
    disabled = false,
    loading = false,
    emptyMessage,
    ariaLabel,
}) => {
    return (
        <div className="relative">

            <select
                id={id}
                value={value}
                onChange={onChange}
                disabled={disabled || loading}
                aria-label={ariaLabel}
                className="
                    h-11
                    w-full
                    appearance-none
                    rounded-xl
                    border
                    border-white/[0.07]
                    bg-[#030b17]/90
                    px-3
                    pr-10
                    font-['Inter']
                    text-[11px]
                    text-slate-200
                    outline-none
                    transition-all
                    duration-200

                    hover:border-white/[0.11]

                    focus:border-cyan-400/30
                    focus:bg-[#04101d]
                    focus:ring-1
                    focus:ring-cyan-400/10

                    disabled:cursor-not-allowed
                    disabled:opacity-50
                "
            >

                <option
                    value=""
                    className="bg-[#030b17] text-slate-500"
                >
                    {loading
                        ? "Loading objects..."
                        : options.length === 0
                            ? emptyMessage || "No objects available"
                            : placeholder}
                </option>

                {options.map((option) => (
                    <option
                        key={option.value}
                        value={option.value}
                        className="bg-[#030b17] text-slate-200"
                    >
                        {option.label}
                    </option>
                ))}

            </select>

            <div
                className="
                    pointer-events-none
                    absolute
                    inset-y-0
                    right-3
                    flex
                    items-center
                    text-slate-600
                "
            >
                {loading ? (
                    <FiLoader
                        size={13}
                        className="animate-spin"
                    />
                ) : (
                    <FiChevronDown size={14} />
                )}
            </div>

        </div>
    );
};


/**
 * Connection indicator between satellite and debris.
 */
const AnalysisConnection = () => {
    return (
        <div
            className="
                hidden
                items-center
                justify-center
                lg:flex
                lg:pt-7
            "
            aria-hidden="true"
        >

            <div
                className="
                    relative
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-full
                    border
                    border-cyan-400/20
                    bg-cyan-400/[0.04]
                    text-cyan-400
                "
            >

                <div
                    className="
                        absolute
                        inset-1
                        rounded-full
                        border
                        border-dashed
                        border-cyan-400/15
                    "
                />

                <FiCrosshair size={15} />

            </div>

        </div>
    );
};


/**
 * Selected-object mini status card.
 */
const SelectionStatus = ({
    satelliteSelected,
    debrisSelected,
}) => {
    const ready =
        satelliteSelected &&
        debrisSelected;

    return (
        <div
            className={`
                mt-5
                rounded-xl
                border
                px-3
                py-3
                transition-colors

                ${
                    ready
                        ? `
                            border-emerald-400/15
                            bg-emerald-400/[0.035]
                        `
                        : `
                            border-white/[0.045]
                            bg-white/[0.015]
                        `
                }
            `}
        >

            <div className="flex items-center gap-2">

                <div
                    className={`
                        flex
                        h-7
                        w-7
                        shrink-0
                        items-center
                        justify-center
                        rounded-lg
                        ${
                            ready
                                ? `
                                    bg-emerald-400/[0.08]
                                    text-emerald-300
                                `
                                : `
                                    bg-slate-400/[0.05]
                                    text-slate-500
                                `
                        }
                    `}
                >
                    {ready ? (
                        <FiShield size={13} />
                    ) : (
                        <FiAlertTriangle size={13} />
                    )}
                </div>

                <div className="min-w-0">

                    <p
                        className={`
                            font-['Orbitron']
                            text-[8px]
                            font-semibold
                            uppercase
                            tracking-[0.13em]
                            ${
                                ready
                                    ? "text-emerald-300"
                                    : "text-slate-500"
                            }
                        `}
                    >
                        {ready
                            ? "Analysis Ready"
                            : "Awaiting Selection"}
                    </p>

                    <p
                        className="
                            mt-0.5
                            font-['Inter']
                            text-[9px]
                            text-slate-600
                        "
                    >
                        {ready
                            ? "Both orbital objects are selected."
                            : "Select one satellite and one debris object."}
                    </p>

                </div>

            </div>

        </div>
    );
};


/* ================================================================
   MAIN COMPONENT
================================================================ */

/**
 * AnalyzeRiskPanel
 *
 * @param {Array} satellites
 * Satellite selection options.
 *
 * Expected shape:
 * [
 *   {
 *      id: "mongo-id",
 *      satelliteName: "ISS",
 *      satelliteCode: "SAT-0001",
 *      noradCatalogId: 25544
 *   }
 * ]
 *
 * @param {Array} debris
 * Debris selection options.
 *
 * Expected shape:
 * [
 *   {
 *      id: "mongo-id",
 *      debrisName: "OBJECT",
 *      debrisCode: "DEB-0001",
 *      noradId: 12345
 *   }
 * ]
 *
 * @param {Function} onAnalyze
 * Parent callback.
 *
 * The callback receives:
 *
 * {
 *    satelliteId,
 *    debrisId
 * }
 *
 * The parent should perform the actual POST request.
 *
 * @param {boolean} loading
 * API loading state.
 *
 * @param {string|null} error
 * Backend/API error message.
 *
 * @param {Function} onClearError
 * Clears the parent error.
 */
const AnalyzeRiskPanel = ({
    satellites = [],
    debris = [],
    onAnalyze,
    loading = false,
    error = null,
    onClearError,
}) => {

    const [satelliteId, setSatelliteId] =
        useState("");

    const [debrisId, setDebrisId] =
        useState("");


    /* ============================================================
       NORMALIZE OPTIONS
    ============================================================ */

    const satelliteOptions =
        satellites
            .filter((item) => item?.id)
            .map((item) => ({
                value: item.id,
                label:
                    item.satelliteName
                        ? item.satelliteCode
                            ? `${item.satelliteName} — ${item.satelliteCode}`
                            : item.satelliteName
                        : item.satelliteCode ||
                          item.noradCatalogId ||
                          item.id,
            }));


    const debrisOptions =
        debris
            .filter((item) => item?.id)
            .map((item) => ({
                value: item.id,
                label:
                    item.debrisName
                        ? item.debrisCode
                            ? `${item.debrisName} — ${item.debrisCode}`
                            : item.debrisName
                        : item.debrisCode ||
                          item.noradId ||
                          item.id,
            }));


    /* ============================================================
       SUBMIT
    ============================================================ */

    const handleSubmit = async (event) => {

        event.preventDefault();

        if (
            !satelliteId ||
            !debrisId ||
            loading
        ) {
            return;
        }

        if (
            typeof onAnalyze !==
            "function"
        ) {
            return;
        }

        /*
         * Backend request contract:
         *
         * {
         *     satelliteId,
         *     debrisId
         * }
         */
        await onAnalyze({
            satelliteId,
            debrisId,
        });
    };


    /* ============================================================
       CLEAR ERROR WHEN SELECTION CHANGES
    ============================================================ */

    const handleSatelliteChange = (
        event,
    ) => {

        const value =
            event.target.value;

        setSatelliteId(value);

        if (
            error &&
            typeof onClearError ===
                "function"
        ) {
            onClearError();
        }
    };


    const handleDebrisChange = (
        event,
    ) => {

        const value =
            event.target.value;

        setDebrisId(value);

        if (
            error &&
            typeof onClearError ===
                "function"
        ) {
            onClearError();
        }
    };


    const canAnalyze =
        Boolean(
            satelliteId &&
            debrisId &&
            !loading,
        );


    /* ============================================================
       RENDER
    ============================================================ */

    return (
        <section
            aria-labelledby="analyze-risk-heading"
            className="
                overflow-hidden
                rounded-2xl
                border
                border-white/[0.06]
                bg-[#020817]/75
                shadow-[0_16px_55px_rgba(0,0,0,0.2)]
                backdrop-blur-xl
            "
        >

            {/* =====================================================
                HEADER
            ===================================================== */}

            <div
                className="
                    border-b
                    border-white/[0.05]
                    px-4
                    py-4
                    sm:px-5
                    sm:py-5
                "
            >

                <div
                    className="
                        flex
                        flex-col
                        gap-4
                        sm:flex-row
                        sm:items-start
                        sm:justify-between
                    "
                >

                    <PanelSectionHeader
                        icon={FiActivity}
                        eyebrow="Collision Risk Engine"
                        title="Analyze Collision Risk"
                        description="
                            Select a satellite and debris object to
                            initiate a backend orbital risk assessment.
                        "
                    />

                    <div
                        className="
                            hidden
                            shrink-0
                            items-center
                            gap-2
                            rounded-full
                            border
                            border-cyan-400/10
                            bg-cyan-400/[0.035]
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
                                bg-cyan-400
                                shadow-[0_0_8px_rgba(34,211,238,0.7)]
                            "
                        />

                        <span
                            className="
                                font-['Orbitron']
                                text-[8px]
                                font-semibold
                                uppercase
                                tracking-[0.1em]
                                text-cyan-300/80
                            "
                        >
                            Engine Ready
                        </span>

                    </div>

                </div>

            </div>


            {/* =====================================================
                FORM
            ===================================================== */}

            <form
                onSubmit={handleSubmit}
                noValidate
            >

                <div
                    className="
                        p-4
                        sm:p-5
                    "
                >

                    <div
                        className="
                            grid
                            grid-cols-1
                            gap-4
                            lg:grid-cols-[1fr_auto_1fr]
                        "
                    >

                        {/* =========================================
                            SATELLITE
                        ========================================= */}

                        <div>

                            <FieldLabel
                                htmlFor="risk-satellite"
                                icon={FiRadio}
                                required
                            >
                                Satellite
                            </FieldLabel>

                            <EntitySelect
                                id="risk-satellite"
                                value={satelliteId}
                                onChange={
                                    handleSatelliteChange
                                }
                                options={
                                    satelliteOptions
                                }
                                placeholder="Select satellite"
                                disabled={loading}
                                loading={false}
                                emptyMessage="No satellites available"
                                ariaLabel="Select satellite for risk analysis"
                            />

                            <p
                                className="
                                    mt-2
                                    flex
                                    items-center
                                    gap-1.5
                                    font-['Inter']
                                    text-[9px]
                                    text-slate-600
                                "
                            >
                                <FiDatabase
                                    size={10}
                                />

                                MongoDB satellite
                                identifier
                            </p>

                        </div>


                        {/* =========================================
                            CONNECTION
                        ========================================= */}

                        <AnalysisConnection />


                        {/* =========================================
                            DEBRIS
                        ========================================= */}

                        <div>

                            <FieldLabel
                                htmlFor="risk-debris"
                                icon={FiTarget}
                                required
                            >
                                Space Debris
                            </FieldLabel>

                            <EntitySelect
                                id="risk-debris"
                                value={debrisId}
                                onChange={
                                    handleDebrisChange
                                }
                                options={
                                    debrisOptions
                                }
                                placeholder="Select debris"
                                disabled={loading}
                                loading={false}
                                emptyMessage="No debris available"
                                ariaLabel="Select debris for risk analysis"
                            />

                            <p
                                className="
                                    mt-2
                                    flex
                                    items-center
                                    gap-1.5
                                    font-['Inter']
                                    text-[9px]
                                    text-slate-600
                                "
                            >
                                <FiDatabase
                                    size={10}
                                />

                                MongoDB debris
                                identifier
                            </p>

                        </div>

                    </div>


                    {/* =================================================
                        SELECTION STATUS
                    ================================================= */}

                    <SelectionStatus
                        satelliteSelected={
                            Boolean(satelliteId)
                        }
                        debrisSelected={
                            Boolean(debrisId)
                        }
                    />


                    {/* =================================================
                        ERROR
                    ================================================= */}

                    {error && (
                        <div
                            role="alert"
                            className="
                                mt-4
                                flex
                                items-start
                                gap-3
                                rounded-xl
                                border
                                border-red-400/15
                                bg-red-400/[0.035]
                                px-3
                                py-3
                            "
                        >

                            <div
                                className="
                                    mt-0.5
                                    flex
                                    h-7
                                    w-7
                                    shrink-0
                                    items-center
                                    justify-center
                                    rounded-lg
                                    bg-red-400/[0.08]
                                    text-red-300
                                "
                            >
                                <FiAlertTriangle
                                    size={13}
                                />
                            </div>

                            <div className="min-w-0 flex-1">

                                <p
                                    className="
                                        font-['Orbitron']
                                        text-[8px]
                                        font-semibold
                                        uppercase
                                        tracking-[0.12em]
                                        text-red-300
                                    "
                                >
                                    Analysis Failed
                                </p>

                                <p
                                    className="
                                        mt-1
                                        font-['Inter']
                                        text-[10px]
                                        leading-4
                                        text-red-200/60
                                    "
                                >
                                    {error}
                                </p>

                            </div>

                            {typeof onClearError ===
                                "function" && (
                                <button
                                    type="button"
                                    onClick={
                                        onClearError
                                    }
                                    className="
                                        shrink-0
                                        rounded-md
                                        p-1
                                        text-slate-600
                                        transition-colors
                                        hover:bg-white/[0.04]
                                        hover:text-slate-300
                                    "
                                    aria-label="Dismiss error"
                                >
                                    <FiX
                                        size={13}
                                    />
                                </button>
                            )}

                        </div>
                    )}

                </div>


                {/* =====================================================
                    ACTION FOOTER
                ===================================================== */}

                <div
                    className="
                        flex
                        flex-col
                        gap-3
                        border-t
                        border-white/[0.05]
                        bg-white/[0.012]
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
                            items-start
                            gap-2
                        "
                    >

                        <FiShield
                            size={12}
                            className="
                                mt-0.5
                                shrink-0
                                text-slate-600
                            "
                        />

                        <p
                            className="
                                max-w-lg
                                font-['Inter']
                                text-[9px]
                                leading-4
                                text-slate-600
                            "
                        >
                            Orbital propagation, distance,
                            relative velocity, collision
                            probability and risk classification
                            are calculated by the backend risk
                            engine.
                        </p>

                    </div>


                    <button
                        type="submit"
                        disabled={!canAnalyze}
                        className="
                            inline-flex
                            h-10
                            shrink-0
                            items-center
                            justify-center
                            gap-2
                            rounded-xl
                            border
                            border-cyan-400/25
                            bg-cyan-400/[0.09]
                            px-5
                            font-['Orbitron']
                            text-[9px]
                            font-semibold
                            uppercase
                            tracking-[0.1em]
                            text-cyan-300
                            shadow-[0_0_25px_rgba(34,211,238,0.05)]
                            transition-all
                            duration-200

                            hover:border-cyan-400/40
                            hover:bg-cyan-400/[0.14]
                            hover:shadow-[0_0_30px_rgba(34,211,238,0.09)]

                            disabled:cursor-not-allowed
                            disabled:border-white/[0.05]
                            disabled:bg-white/[0.02]
                            disabled:text-slate-600
                            disabled:shadow-none

                            sm:min-w-[170px]
                        "
                    >

                        {loading ? (
                            <>
                                <FiLoader
                                    size={13}
                                    className="animate-spin"
                                />

                                Analyzing
                            </>
                        ) : (
                            <>
                                <FiPlay
                                    size={12}
                                />

                                Analyze Risk
                            </>
                        )}

                    </button>

                </div>

            </form>

        </section>
    );
};

export default AnalyzeRiskPanel;