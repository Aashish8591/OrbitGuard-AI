import {
    useEffect,
    useState,
} from "react";

import {
    FiBox,
    FiCheckCircle,
    FiCrosshair,
    FiNavigation,
    FiRadio,
} from "react-icons/fi";

import satelliteService from "../../../services/satelliteService";
import debrisService from "../../../services/debrisService";


/**
 * ================================================================
 * OrbitGuard AI — Risk Object Pair
 * ================================================================
 *
 * Displays the REAL satellite and debris involved in the
 * collision-risk assessment.
 *
 * Backend source of truth.
 *
 * Data flow:
 *
 * risk.satelliteId
 *        ↓
 * satelliteService.getSatelliteById()
 *        ↓
 * satelliteName
 *
 * risk.debrisId
 *        ↓
 * debrisService.getDebrisById()
 *        ↓
 * debrisName
 *
 * UI responsibilities only:
 * - Resolve display names
 * - Visualize conjunction relationship
 * - Present object identities
 * - Present tracking state
 *
 * No risk calculations are performed here.
 * ================================================================
 */


/* ================================================================
   HELPERS
================================================================ */

/**
 * Resolve the display name from SatelliteResponse.
 */
const resolveSatelliteName = (satellite) => {
    if (!satellite) {
        return "";
    }

    return (
        satellite.satelliteName ||
        satellite.name ||
        satellite.objectName ||
        ""
    );
};


/**
 * Resolve the display name from DebrisResponse.
 */
const resolveDebrisName = (debris) => {
    if (!debris) {
        return "";
    }

    return (
        debris.debrisName ||
        debris.name ||
        debris.objectName ||
        ""
    );
};


/* ================================================================
   OBJECT NODE
================================================================ */

const ObjectNode = ({
    type,
    value,
    fallbackValue,
    icon: Icon,
    warning = false,
    loading = false,
}) => {
    const displayValue =
        loading
            ? "Resolving object..."
            : value ||
              fallbackValue ||
              "Unknown object";

    return (
        <div
            className={`
                group
                relative
                z-40
                flex
                w-full
                min-w-0
                items-center
                gap-3
                overflow-hidden
                rounded-xl
                border
                px-3
                py-3
                shadow-[0_12px_35px_rgba(0,0,0,0.28)]
                transition-all
                duration-300
                hover:-translate-y-0.5
                ${
                    warning
                        ? `
                            border-amber-400/30
                            bg-[#071522]/95
                            hover:border-amber-400/50
                            hover:shadow-[0_0_30px_rgba(251,191,36,0.10)]
                        `
                        : `
                            border-cyan-400/25
                            bg-[#061522]/95
                            hover:border-cyan-400/45
                            hover:shadow-[0_0_30px_rgba(34,211,238,0.10)]
                        `
                }
            `}
        >
            {/* ----------------------------------------------------
                Node accent line
            ---------------------------------------------------- */}

            <div
                className={`
                    pointer-events-none
                    absolute
                    inset-y-0
                    left-0
                    w-[2px]
                    ${
                        warning
                            ? "bg-amber-400/70"
                            : "bg-cyan-400/70"
                    }
                `}
            />

            {/* ----------------------------------------------------
                Ambient glow
            ---------------------------------------------------- */}

            <div
                aria-hidden="true"
                className={`
                    pointer-events-none
                    absolute
                    -inset-10
                    opacity-0
                    blur-3xl
                    transition-opacity
                    duration-300
                    group-hover:opacity-100
                    ${
                        warning
                            ? "bg-amber-400/[0.035]"
                            : "bg-cyan-400/[0.035]"
                    }
                `}
            />

            {/* ----------------------------------------------------
                Object icon
            ---------------------------------------------------- */}

            <div
                className={`
                    relative
                    z-10
                    flex
                    h-10
                    w-10
                    shrink-0
                    items-center
                    justify-center
                    rounded-lg
                    border
                    ${
                        warning
                            ? `
                                border-amber-400/30
                                bg-amber-400/[0.08]
                                text-amber-300
                            `
                            : `
                                border-cyan-400/25
                                bg-cyan-400/[0.07]
                                text-cyan-300
                            `
                    }
                `}
            >
                <Icon size={17} />

                <span
                    className={`
                        absolute
                        -right-1
                        -top-1
                        h-2
                        w-2
                        rounded-full
                        border
                        border-[#06101b]
                        ${
                            warning
                                ? "bg-amber-300"
                                : "bg-cyan-300"
                        }
                    `}
                />
            </div>

            {/* ----------------------------------------------------
                Object information
            ---------------------------------------------------- */}

            <div className="relative z-10 min-w-0 flex-1">
                <div className="flex min-w-0 items-center gap-2">
                    <p
                        className="
                            shrink-0
                            font-['Inter']
                            text-[8px]
                            font-semibold
                            uppercase
                            tracking-[0.14em]
                            text-slate-500
                        "
                    >
                        {type}
                    </p>

                    {!loading && (
                        <span
                            className="
                                shrink-0
                                rounded-full
                                border
                                border-emerald-400/20
                                bg-emerald-400/[0.06]
                                px-1.5
                                py-0.5
                                font-['Inter']
                                text-[6px]
                                font-semibold
                                uppercase
                                tracking-[0.08em]
                                text-emerald-300
                            "
                        >
                            LIVE
                        </span>
                    )}
                </div>

                <p
                    className={`
                        mt-1.5
                        truncate
                        font-['Inter']
                        text-[10px]
                        font-semibold
                        leading-4
                        ${
                            loading
                                ? "animate-pulse text-slate-600"
                                : "text-slate-100"
                        }
                    `}
                    title={
                        value ||
                        fallbackValue ||
                        "Unknown object"
                    }
                >
                    {displayValue}
                </p>
            </div>
        </div>
    );
};


/* ================================================================
   CONJUNCTION CORE
================================================================ */

const ConjunctionCore = () => {
    return (
        <div
            className="
                absolute
                left-1/2
                top-1/2
                z-50
                flex
                -translate-x-1/2
                -translate-y-1/2
                flex-col
                items-center
            "
        >
            {/* =====================================================
                RADAR FIELD
            ===================================================== */}

            <div
                aria-hidden="true"
                className="
                    absolute
                    left-1/2
                    top-1/2
                    h-[120px]
                    w-[120px]
                    -translate-x-1/2
                    -translate-y-1/2
                    rounded-full
                    border
                    border-amber-400/[0.06]
                "
            />

            <div
                aria-hidden="true"
                className="
                    absolute
                    left-1/2
                    top-1/2
                    h-[92px]
                    w-[92px]
                    -translate-x-1/2
                    -translate-y-1/2
                    rounded-full
                    border
                    border-amber-400/[0.10]
                "
            />

            {/* =====================================================
                RADAR CORE
            ===================================================== */}

            <div
                className="
                    relative
                    flex
                    h-[62px]
                    w-[62px]
                    items-center
                    justify-center
                    rounded-full
                    border
                    border-amber-300/50
                    bg-[#071522]/95
                    text-amber-300
                    shadow-[0_0_18px_rgba(251,191,36,0.16),0_0_55px_rgba(251,191,36,0.08)]
                "
            >
                {/* inner core */}

                <div
                    className="
                        absolute
                        inset-[7px]
                        rounded-full
                        border
                        border-amber-400/20
                        bg-amber-400/[0.05]
                    "
                />

                {/* scan line */}

                <div
                    aria-hidden="true"
                    className="
                        absolute
                        left-1/2
                        top-1/2
                        h-[46px]
                        w-px
                        origin-bottom
                        -translate-x-1/2
                        -translate-y-full
                        rotate-45
                        bg-gradient-to-t
                        from-amber-300/60
                        to-transparent
                    "
                />

                <FiCrosshair
                    size={22}
                    className="
                        relative
                        z-10
                        drop-shadow-[0_0_8px_rgba(251,191,36,0.7)]
                    "
                />

                {/* outer pulse */}

                <span
                    className="
                        absolute
                        inset-[-8px]
                        rounded-full
                        border
                        border-amber-400/15
                    "
                />

                <span
                    className="
                        absolute
                        inset-[-17px]
                        rounded-full
                        border
                        border-amber-400/[0.06]
                    "
                />
            </div>

            {/* =====================================================
                CONJUNCTION LABEL
            ===================================================== */}

            <div
                className="
                    relative
                    mt-4
                    flex
                    items-center
                    gap-2
                    whitespace-nowrap
                    rounded-lg
                    border
                    border-amber-400/30
                    bg-[#050f19]/98
                    px-3
                    py-2
                    shadow-[0_8px_30px_rgba(0,0,0,0.40),0_0_20px_rgba(251,191,36,0.06)]
                "
            >
                <div
                    className="
                        flex
                        h-5
                        w-5
                        items-center
                        justify-center
                        rounded-md
                        border
                        border-amber-400/20
                        bg-amber-400/[0.07]
                    "
                >
                    <FiRadio
                        size={10}
                        className="text-amber-300"
                    />
                </div>

                <div>
                    <p
                        className="
                            font-['Orbitron']
                            text-[8px]
                            font-semibold
                            uppercase
                            tracking-[0.10em]
                            text-amber-300
                        "
                    >
                        Conjunction Risk
                    </p>

                    <p
                        className="
                            mt-0.5
                            font-['Inter']
                            text-[6px]
                            uppercase
                            tracking-[0.08em]
                            text-amber-400/45
                        "
                    >
                        Proximity event detected
                    </p>
                </div>
            </div>
        </div>
    );
};


/* ================================================================
   RISK OBJECT PAIR
================================================================ */

const RiskObjectPair = ({
    satelliteId,
    debrisId,
}) => {
    const [satelliteName, setSatelliteName] =
        useState("");

    const [debrisName, setDebrisName] =
        useState("");

    const [isResolving, setIsResolving] =
        useState(true);


    /* ============================================================
       RESOLVE BACKEND OBJECTS
    ============================================================ */

    useEffect(() => {
        let mounted = true;

        const resolveObjects = async () => {
            setIsResolving(true);

            setSatelliteName("");
            setDebrisName("");

            const satelliteRequest =
                satelliteId
                    ? satelliteService.getSatelliteById(
                          satelliteId,
                      )
                    : Promise.resolve(null);

            const debrisRequest =
                debrisId
                    ? debrisService.getDebrisById(
                          debrisId,
                      )
                    : Promise.resolve(null);

            try {
                const [
                    satellite,
                    debris,
                ] = await Promise.allSettled([
                    satelliteRequest,
                    debrisRequest,
                ]);

                if (!mounted) {
                    return;
                }

                /* ------------------------------------------------
                   SATELLITE
                ------------------------------------------------ */

                if (
                    satellite.status ===
                        "fulfilled" &&
                    satellite.value
                ) {
                    setSatelliteName(
                        resolveSatelliteName(
                            satellite.value,
                        ),
                    );
                }

                /* ------------------------------------------------
                   DEBRIS
                ------------------------------------------------ */

                if (
                    debris.status ===
                        "fulfilled" &&
                    debris.value
                ) {
                    setDebrisName(
                        resolveDebrisName(
                            debris.value,
                        ),
                    );
                }

                /* ------------------------------------------------
                   DEVELOPMENT LOGGING
                ------------------------------------------------ */

                if (import.meta.env.DEV) {
                    if (
                        satellite.status ===
                        "rejected"
                    ) {
                        console.error(
                            "[RiskObjectPair] Satellite lookup failed:",
                            satellite.reason,
                        );
                    }

                    if (
                        debris.status ===
                        "rejected"
                    ) {
                        console.error(
                            "[RiskObjectPair] Debris lookup failed:",
                            debris.reason,
                        );
                    }
                }
            } finally {
                if (mounted) {
                    setIsResolving(false);
                }
            }
        };

        resolveObjects();

        return () => {
            mounted = false;
        };
    }, [
        satelliteId,
        debrisId,
    ]);


    /* ============================================================
       RENDER
    ============================================================ */

    return (
        <section
            aria-label="Risk object pair"
            className="
                relative
                min-h-[390px]
                overflow-hidden
                rounded-2xl
                border
                border-cyan-400/[0.12]
                bg-[#020a16]
                shadow-[0_0_55px_rgba(0,0,0,0.28)]
            "
        >
            {/* =====================================================
                BACKGROUND IMAGE
            ===================================================== */}

            <div
                aria-hidden="true"
                className="
                    pointer-events-none
                    absolute
                    inset-0
                    z-0
                    bg-cover
                    bg-center
                    bg-no-repeat
                "
                style={{
                    backgroundImage:
                        "url('/images/risk/objectpairbg.png')",
                }}
            />

            {/* =====================================================
                LIGHT IMAGE READABILITY LAYER

                IMPORTANT:
                Previous version used:
                    opacity-35
                    + 0.72 / 0.82 / 0.94 overlay

                That made the background look blurred.

                Now the actual image stays strong and clear.
            ===================================================== */}

            <div
                aria-hidden="true"
                className="
                    pointer-events-none
                    absolute
                    inset-0
                    z-[1]
                    bg-[linear-gradient(180deg,rgba(2,10,22,0.18)_0%,rgba(2,10,22,0.30)_50%,rgba(2,10,22,0.48)_100%)]
                "
            />

            {/* Center atmospheric glow */}

            <div
                aria-hidden="true"
                className="
                    pointer-events-none
                    absolute
                    left-1/2
                    top-1/2
                    z-[2]
                    h-72
                    w-72
                    -translate-x-1/2
                    -translate-y-1/2
                    rounded-full
                    bg-cyan-400/[0.025]
                    blur-[90px]
                "
            />

            {/* =====================================================
                HEADER
            ===================================================== */}

            <div
                className="
                    relative
                    z-50
                    flex
                    items-center
                    justify-between
                    gap-3
                    border-b
                    border-white/[0.07]
                    bg-[#020a16]/70
                    px-5
                    py-4
                    backdrop-blur-sm
                "
            >
                <div className="flex items-center gap-2.5">
                    <div
                        className="
                            flex
                            h-7
                            w-7
                            shrink-0
                            items-center
                            justify-center
                            rounded-lg
                            border
                            border-cyan-400/20
                            bg-cyan-400/[0.06]
                            text-cyan-300
                            shadow-[0_0_15px_rgba(34,211,238,0.06)]
                        "
                    >
                        <FiCrosshair size={14} />
                    </div>

                    <div>
                        <h2
                            className="
                                font-['Orbitron']
                                text-[10px]
                                font-semibold
                                uppercase
                                tracking-[0.12em]
                                text-slate-100
                            "
                        >
                            Object Pair
                        </h2>

                        <p
                            className="
                                mt-0.5
                                font-['Inter']
                                text-[8px]
                                text-slate-500
                            "
                        >
                            Collision conjunction
                        </p>
                    </div>
                </div>

                {/* Tracking indicator */}

                <div
                    className="
                        flex
                        items-center
                        gap-1.5
                        rounded-full
                        border
                        border-cyan-400/15
                        bg-cyan-400/[0.05]
                        px-2.5
                        py-1.5
                    "
                >
                    <span
                        className="
                            h-1.5
                            w-1.5
                            animate-pulse
                            rounded-full
                            bg-cyan-300
                            shadow-[0_0_8px_rgba(103,232,249,0.75)]
                        "
                    />

                    <span
                        className="
                            font-['Inter']
                            text-[7px]
                            font-semibold
                            uppercase
                            tracking-[0.10em]
                            text-cyan-300
                        "
                    >
                        Tracking
                    </span>
                </div>
            </div>


            {/* =====================================================
                VISUALIZATION
            ===================================================== */}

            <div
                className="
                    relative
                    z-10
                    min-h-[315px]
                    overflow-hidden
                    px-4
                    py-6
                    sm:px-5
                "
            >
                {/* =================================================
                    ORBITAL RINGS
                ================================================= */}

                <div
                    aria-hidden="true"
                    className="
                        pointer-events-none
                        absolute
                        left-1/2
                        top-1/2
                        h-[180px]
                        w-[84%]
                        max-w-[500px]
                        -translate-x-1/2
                        -translate-y-1/2
                        rotate-[12deg]
                        rounded-[50%]
                        border
                        border-cyan-300/15
                        shadow-[0_0_35px_rgba(34,211,238,0.025)]
                    "
                />

                <div
                    aria-hidden="true"
                    className="
                        pointer-events-none
                        absolute
                        left-1/2
                        top-1/2
                        h-[125px]
                        w-[64%]
                        max-w-[370px]
                        -translate-x-1/2
                        -translate-y-1/2
                        -rotate-[12deg]
                        rounded-[50%]
                        border
                        border-cyan-300/[0.10]
                    "
                />

                <div
                    aria-hidden="true"
                    className="
                        pointer-events-none
                        absolute
                        left-1/2
                        top-1/2
                        h-[55px]
                        w-[48%]
                        max-w-[250px]
                        -translate-x-1/2
                        -translate-y-1/2
                        rotate-[4deg]
                        rounded-[50%]
                        border
                        border-cyan-300/[0.06]
                    "
                />

                {/* =================================================
                    CENTER TRAJECTORY
                ================================================= */}

                <div
                    aria-hidden="true"
                    className="
                        pointer-events-none
                        absolute
                        left-1/2
                        top-[13%]
                        h-[74%]
                        -translate-x-1/2
                        border-l
                        border-dashed
                        border-cyan-300/20
                    "
                />

                {/* =================================================
                    SATELLITE NODE
                ================================================= */}

                <div
                    className="
                        absolute
                        left-[3%]
                        top-[7%]
                        z-40
                        w-[47%]
                        max-w-[270px]
                        sm:left-[6%]
                        sm:w-[43%]
                    "
                >
                    <ObjectNode
                        type="Satellite"
                        value={satelliteName}
                        fallbackValue={satelliteId}
                        icon={FiNavigation}
                        loading={isResolving}
                    />
                </div>


                {/* =================================================
                    CONJUNCTION CORE
                ================================================= */}

                <ConjunctionCore />


                {/* =================================================
                    DEBRIS NODE
                ================================================= */}

                <div
                    className="
                        absolute
                        bottom-[7%]
                        right-[3%]
                        z-40
                        w-[47%]
                        max-w-[270px]
                        sm:right-[6%]
                        sm:w-[43%]
                    "
                >
                    <ObjectNode
                        type="Space Debris"
                        value={debrisName}
                        fallbackValue={debrisId}
                        icon={FiBox}
                        warning
                        loading={isResolving}
                    />
                </div>


                {/* =================================================
                    TRAJECTORY ARROWS
                ================================================= */}

                <div
                    aria-hidden="true"
                    className="
                        absolute
                        left-1/2
                        top-[30%]
                        z-20
                        -translate-x-1/2
                        text-cyan-300/75
                    "
                >
                    <span className="text-sm">
                        ↓
                    </span>
                </div>

                <div
                    aria-hidden="true"
                    className="
                        absolute
                        bottom-[30%]
                        left-1/2
                        z-20
                        -translate-x-1/2
                        text-amber-300/70
                    "
                >
                    <span className="text-sm">
                        ↑
                    </span>
                </div>


                {/* =================================================
                    FOOTER STATUS
                ================================================= */}

                <div
                    className="
                        absolute
                        bottom-2
                        left-1/2
                        z-50
                        flex
                        -translate-x-1/2
                        items-center
                        gap-1.5
                        whitespace-nowrap
                    "
                >
                    <FiCheckCircle
                        size={9}
                        className="text-emerald-400/80"
                    />

                    <span
                        className="
                            font-['Inter']
                            text-[7px]
                            font-medium
                            uppercase
                            tracking-[0.10em]
                            text-slate-500
                        "
                    >
                        Backend Object Registry
                    </span>
                </div>
            </div>
        </section>
    );
};

export default RiskObjectPair;