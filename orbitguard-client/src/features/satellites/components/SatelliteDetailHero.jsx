import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
    FiArrowLeft,
    FiActivity,
    FiChevronRight,
    FiCircle,
    FiCompass,
    FiDatabase,
    FiDisc,
    FiRadio,
    FiTarget,
    FiTrendingUp,
} from "react-icons/fi";

/**
 * ================================================================
 * OrbitGuard AI
 * Satellite Detail Hero
 * ================================================================
 *
 * DATA FLOW
 *
 * SatelliteDetailPage
 *        ↓
 * GET /api/satellites/{satelliteId}
 *        ↓
 * satellite object
 *        ↓
 * SatelliteDetailHero
 *
 * IMPORTANT:
 * - This component does NOT fetch satellite data.
 * - This component receives the already-loaded satellite object.
 * - SatelliteDetailPage is the single owner of satellite loading.
 * - No dummy satellite data.
 * - No invented operator/country/mission information.
 * - No edit/deactivate actions.
 *
 * Backend source of truth:
 *
 * GET /api/satellites/{satelliteId}
 * ================================================================
 */


/* ================================================================
   SATELLITE IMAGE CONFIGURATION
================================================================ */

const SATELLITE_IMAGES = [
    "/images/satellite/satellite-01.png",
    "/images/satellite/satellite-02.png",
    "/images/satellite/satellite-03.png",
    "/images/satellite/satellite-04.png",
    "/images/satellite/satellite-05.png",
    "/images/satellite/satellite-06.png",
    "/images/satellite/satellite-07.png",
];


/* ================================================================
   STABLE HASH
================================================================ */

const createStableHash = (value) => {
    if (!value) {
        return 0;
    }

    let hash = 0;

    for (let index = 0; index < value.length; index += 1) {
        hash =
            (hash << 5) -
            hash +
            value.charCodeAt(index);

        hash |= 0;
    }

    return Math.abs(hash);
};


/* ================================================================
   SATELLITE IMAGE
================================================================ */

const getSatelliteImage = (satellite) => {
    if (!satellite) {
        return SATELLITE_IMAGES[0];
    }

    const stableIdentifier =
        satellite.noradCatalogId ??
        satellite.id ??
        satellite.objectId ??
        satellite.satelliteCode ??
        satellite.satelliteName ??
        "";

    const index =
        createStableHash(
            String(stableIdentifier),
        ) % SATELLITE_IMAGES.length;

    return SATELLITE_IMAGES[index];
};


/* ================================================================
   FORMATTERS
================================================================ */

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
            maximumFractionDigits,
        },
    );
};


const formatAltitude = (value) => {
    const numericValue = Number(value);

    if (!Number.isFinite(numericValue)) {
        return "—";
    }

    return `${formatNumber(value, 0)} km`;
};


const formatVelocity = (value) => {
    const numericValue = Number(value);

    if (!Number.isFinite(numericValue)) {
        return "—";
    }

    return `${formatNumber(value, 2)} km/s`;
};


const formatStatus = (satellite) => {
    if (!satellite) {
        return "UNKNOWN";
    }

    if (satellite.active === true) {
        return "ACTIVE";
    }

    if (satellite.active === false) {
        return "INACTIVE";
    }

    if (satellite.missionStatus) {
        return String(
            satellite.missionStatus,
        ).toUpperCase();
    }

    return "UNKNOWN";
};


/* ================================================================
   TELEMETRY ITEM
================================================================ */

const TelemetryItem = ({
    icon: Icon,
    label,
    value,
    description,
}) => {
    return (
        <div
            className="
                group
                min-w-0
                rounded-xl
                border
                border-white/[0.055]
                bg-[#020817]/55
                px-3
                py-2.5
                backdrop-blur-md
                transition-all
                duration-200
                hover:border-cyan-400/20
                hover:bg-[#06111f]/70
                sm:px-3.5
                sm:py-3
            "
        >
            <div
                className="
                    flex
                    items-center
                    gap-2
                "
            >
                <div
                    className="
                        flex
                        h-6
                        w-6
                        shrink-0
                        items-center
                        justify-center
                        rounded-md
                        border
                        border-cyan-400/15
                        bg-cyan-400/[0.06]
                        text-cyan-300/80
                    "
                >
                    <Icon className="h-3.5 w-3.5" />
                </div>

                <span
                    className="
                        truncate
                        font-['Orbitron']
                        text-[7px]
                        font-medium
                        uppercase
                        tracking-[0.16em]
                        text-slate-500
                        sm:text-[8px]
                    "
                >
                    {label}
                </span>
            </div>

            <div
                className="
                    mt-2
                    truncate
                    font-['Inter']
                    text-sm
                    font-semibold
                    tabular-nums
                    text-slate-100
                    sm:text-base
                "
            >
                {value}
            </div>

            {description && (
                <div
                    className="
                        mt-0.5
                        truncate
                        font-['Inter']
                        text-[8px]
                        text-slate-600
                        sm:text-[9px]
                    "
                >
                    {description}
                </div>
            )}
        </div>
    );
};


/* ================================================================
   COMPONENT
================================================================ */

/**
 * IMPORTANT:
 *
 * Receive `satellite`, NOT `satelliteId`.
 *
 * SatelliteDetailPage already loads the satellite.
 */
const SatelliteDetailHero = ({
    satellite,
}) => {
    /* ============================================================
       DERIVED DATA
    ============================================================ */

    const satelliteImage = useMemo(
        () => getSatelliteImage(satellite),
        [satellite],
    );

    const status = useMemo(
        () => formatStatus(satellite),
        [satellite],
    );

    const isActive =
        satellite?.active === true ||
        (
            satellite?.active === undefined &&
            String(
                satellite?.missionStatus ?? "",
            ).toUpperCase() === "ACTIVE"
        );


    /* ============================================================
       NO DATA STATE
    ============================================================ */

    if (!satellite) {
        return (
            <section
                aria-label="Satellite detail unavailable"
                className="
                    rounded-2xl
                    border
                    border-red-500/15
                    bg-[#020817]
                    px-5
                    py-8
                "
            >
                <div
                    className="
                        font-['Orbitron']
                        text-[10px]
                        uppercase
                        tracking-[0.2em]
                        text-red-300
                    "
                >
                    Satellite unavailable
                </div>

                <p
                    className="
                        mt-2
                        font-['Inter']
                        text-xs
                        text-slate-500
                    "
                >
                    Satellite data is not available.
                </p>
            </section>
        );
    }


    /* ============================================================
       RENDER
    ============================================================ */

    return (
        <section
            aria-labelledby="satellite-detail-heading"
            className="
                relative
                overflow-hidden
                rounded-2xl
                border
                border-white/[0.07]
                bg-[#020817]
                shadow-[0_18px_60px_rgba(0,0,0,0.28)]
            "
        >
            {/* ====================================================
                BACKGROUND
            ==================================================== */}

            <div
                aria-hidden="true"
                className="
                    pointer-events-none
                    absolute
                    inset-0
                "
            >
                <div
                    className="
                        absolute
                        inset-0
                        bg-[url('/images/satellite/satellite-detail-bg.png')]
                        bg-cover
                        bg-center
                        opacity-[0.72]
                    "
                />

                <div
                    className="
                        absolute
                        inset-0
                        bg-gradient-to-r
                        from-[#020817]/[0.98]
                        via-[#020817]/[0.78]
                        to-[#020817]/[0.42]
                    "
                />

                <div
                    className="
                        absolute
                        inset-0
                        bg-gradient-to-t
                        from-[#020817]
                        via-transparent
                        to-[#020817]/20
                    "
                />

                <div
                    className="
                        absolute
                        right-[15%]
                        top-[-35%]
                        h-[360px]
                        w-[360px]
                        rounded-full
                        bg-cyan-400/[0.035]
                        blur-[100px]
                    "
                />
            </div>


            {/* ====================================================
                CONTENT
            ==================================================== */}

            <div
                className="
                    relative
                    z-10
                    p-3
                    sm:p-4
                    lg:p-5
                "
            >

                {/* ==================================================
                    BREADCRUMB
                ================================================== */}

                <div
                    className="
                        mb-4
                        flex
                        min-w-0
                        items-center
                        gap-1.5
                    "
                >
                    <Link
                        to="/satellites"
                        className="
                            inline-flex
                            shrink-0
                            items-center
                            gap-1.5
                            rounded-md
                            px-1
                            py-1
                            font-['Inter']
                            text-[9px]
                            text-slate-500
                            transition-colors
                            hover:text-cyan-300
                            sm:text-[10px]
                        "
                    >
                        <FiArrowLeft className="h-3 w-3" />

                        Satellites
                    </Link>

                    <FiChevronRight
                        className="
                            h-3
                            w-3
                            shrink-0
                            text-slate-700
                        "
                    />

                    <span
                        className="
                            min-w-0
                            truncate
                            font-['Inter']
                            text-[9px]
                            text-slate-600
                            sm:text-[10px]
                        "
                    >
                        {satellite.satelliteName ||
                            "Satellite"}
                    </span>
                </div>


                {/* ==================================================
                    MAIN HERO GRID
                ================================================== */}

                <div
                    className="
                        grid
                        grid-cols-1
                        gap-4
                        xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1.85fr)]
                        xl:gap-6
                    "
                >

                    {/* ==================================================
                        IDENTITY
                    ================================================== */}

                    <div
                        className="
                            flex
                            min-w-0
                            items-center
                            gap-3
                            sm:gap-4
                        "
                    >

                        {/* Satellite Image */}

                        <div
                            className="
                                relative
                                h-[82px]
                                w-[82px]
                                shrink-0
                                overflow-hidden
                                rounded-xl
                                border
                                border-cyan-400/15
                                bg-[#06111f]
                                shadow-[0_0_30px_rgba(34,211,238,0.07)]
                                sm:h-[100px]
                                sm:w-[100px]
                            "
                        >
                            <img
                                src={satelliteImage}
                                alt={`${satellite.satelliteName || "Satellite"} satellite`}
                                className="
                                    h-full
                                    w-full
                                    object-cover
                                "
                            />

                            <div
                                aria-hidden="true"
                                className="
                                    absolute
                                    inset-0
                                    bg-gradient-to-t
                                    from-[#020817]/35
                                    to-transparent
                                "
                            />

                            <div
                                className="
                                    absolute
                                    bottom-2
                                    left-2
                                    h-1.5
                                    w-1.5
                                    rounded-full
                                    bg-cyan-300
                                    shadow-[0_0_8px_rgba(103,232,249,0.8)]
                                "
                            />
                        </div>


                        {/* Identity Information */}

                        <div
                            className="
                                min-w-0
                                flex-1
                            "
                        >
                            <div
                                className="
                                    flex
                                    flex-wrap
                                    items-center
                                    gap-2
                                "
                            >
                                <h1
                                    id="satellite-detail-heading"
                                    className="
                                        min-w-0
                                        break-words
                                        font-['Orbitron']
                                        text-lg
                                        font-semibold
                                        leading-tight
                                        tracking-tight
                                        text-white
                                        sm:text-xl
                                        lg:text-2xl
                                    "
                                >
                                    {satellite.satelliteName ||
                                        "Unnamed Satellite"}
                                </h1>

                                {/* STATUS */}

                                <span
                                    className={`
                                        inline-flex
                                        shrink-0
                                        items-center
                                        gap-1.5
                                        rounded-full
                                        border
                                        px-2
                                        py-1
                                        font-['Orbitron']
                                        text-[7px]
                                        font-semibold
                                        uppercase
                                        tracking-[0.12em]

                                        ${
                                            isActive
                                                ? "border-emerald-400/20 bg-emerald-400/[0.08] text-emerald-300"
                                                : "border-slate-500/20 bg-slate-500/[0.08] text-slate-400"
                                        }
                                    `}
                                >
                                    <span
                                        className={`
                                            h-1.5
                                            w-1.5
                                            rounded-full

                                            ${
                                                isActive
                                                    ? "bg-emerald-300 shadow-[0_0_7px_rgba(110,231,183,0.8)]"
                                                    : "bg-slate-500"
                                            }
                                        `}
                                    />

                                    {status}
                                </span>
                            </div>


                            {/* CODE + NORAD */}

                            <div
                                className="
                                    mt-2
                                    flex
                                    flex-wrap
                                    items-center
                                    gap-x-2
                                    gap-y-1
                                    font-['Inter']
                                    text-[10px]
                                    text-slate-500
                                    sm:text-xs
                                "
                            >
                                <span className="text-slate-300">
                                    {satellite.satelliteCode ||
                                        satellite.objectId ||
                                        "—"}
                                </span>

                                <span className="text-slate-700">
                                    /
                                </span>

                                <span>
                                    NORAD{" "}
                                    <span className="text-slate-300">
                                        {satellite.noradCatalogId ||
                                            "—"}
                                    </span>
                                </span>
                            </div>


                            {/* SMALL DATA IDENTIFIERS */}

                            <div
                                className="
                                    mt-3
                                    flex
                                    flex-wrap
                                    gap-1.5
                                "
                            >
                                {satellite.classificationType && (
                                    <span
                                        className="
                                            rounded-md
                                            border
                                            border-white/[0.07]
                                            bg-white/[0.025]
                                            px-2
                                            py-1
                                            font-['Inter']
                                            text-[8px]
                                            uppercase
                                            tracking-[0.08em]
                                            text-slate-500
                                        "
                                    >
                                        Class{" "}
                                        <span className="text-slate-300">
                                            {
                                                satellite.classificationType
                                            }
                                        </span>
                                    </span>
                                )}

                                {satellite.ephemerisType !==
                                    null &&
                                    satellite.ephemerisType !==
                                        undefined && (
                                        <span
                                            className="
                                                rounded-md
                                                border
                                                border-white/[0.07]
                                                bg-white/[0.025]
                                                px-2
                                                py-1
                                                font-['Inter']
                                                text-[8px]
                                                uppercase
                                                tracking-[0.08em]
                                                text-slate-500
                                            "
                                        >
                                            Ephemeris{" "}
                                            <span className="text-slate-300">
                                                {
                                                    satellite.ephemerisType
                                                }
                                            </span>
                                        </span>
                                    )}

                                {satellite.elementSetNumber !==
                                    null &&
                                    satellite.elementSetNumber !==
                                        undefined && (
                                        <span
                                            className="
                                                rounded-md
                                                border
                                                border-white/[0.07]
                                                bg-white/[0.025]
                                                px-2
                                                py-1
                                                font-['Inter']
                                                text-[8px]
                                                uppercase
                                                tracking-[0.08em]
                                                text-slate-500
                                            "
                                        >
                                            Element Set{" "}
                                            <span className="text-slate-300">
                                                {
                                                    satellite.elementSetNumber
                                                }
                                            </span>
                                        </span>
                                    )}
                            </div>
                        </div>
                    </div>


                    {/* ==================================================
                        TELEMETRY
                    ================================================== */}

                    <div
                        className="
                            grid
                            grid-cols-2
                            gap-2
                            sm:grid-cols-3
                            xl:grid-cols-5
                        "
                    >
                        <TelemetryItem
                            icon={FiTrendingUp}
                            label="Altitude"
                            value={formatAltitude(
                                satellite.altitude,
                            )}
                            description="Above Earth"
                        />

                        <TelemetryItem
                            icon={FiActivity}
                            label="Velocity"
                            value={formatVelocity(
                                satellite.velocity,
                            )}
                            description="Orbital speed"
                        />

                        <TelemetryItem
                            icon={FiRadio}
                            label="Mean Motion"
                            value={
                                satellite.meanMotion !==
                                    null &&
                                satellite.meanMotion !==
                                    undefined
                                    ? `${formatNumber(
                                          satellite.meanMotion,
                                          4,
                                      )} rev/day`
                                    : "—"
                            }
                            description="Orbital rate"
                        />

                        <TelemetryItem
                            icon={FiCompass}
                            label="Inclination"
                            value={
                                satellite.inclination !==
                                    null &&
                                satellite.inclination !==
                                    undefined
                                    ? `${formatNumber(
                                          satellite.inclination,
                                          3,
                                      )}°`
                                    : "—"
                            }
                            description="Orbital plane"
                        />

                        <TelemetryItem
                            icon={FiDisc}
                            label="Eccentricity"
                            value={formatNumber(
                                satellite.eccentricity,
                                6,
                            )}
                            description="Orbit shape"
                        />
                    </div>
                </div>


                {/* ==================================================
                    LOWER SIGNAL BAR
                ================================================== */}

                <div
                    className="
                        mt-4
                        flex
                        flex-wrap
                        items-center
                        justify-between
                        gap-2
                        border-t
                        border-white/[0.055]
                        pt-3
                    "
                >
                    <div
                        className="
                            flex
                            min-w-0
                            items-center
                            gap-2
                        "
                    >
                        <FiDatabase
                            className="
                                h-3
                                w-3
                                shrink-0
                                text-cyan-400/60
                            "
                        />

                        <span
                            className="
                                truncate
                                font-['Orbitron']
                                text-[7px]
                                uppercase
                                tracking-[0.16em]
                                text-slate-600
                                sm:text-[8px]
                            "
                        >
                            OrbitGuard Satellite Registry
                        </span>
                    </div>

                    <div
                        className="
                            flex
                            items-center
                            gap-2
                        "
                    >
                        <FiTarget
                            className="
                                h-3
                                w-3
                                text-cyan-400/60
                            "
                        />

                        <span
                            className="
                                font-['Inter']
                                text-[8px]
                                text-slate-600
                                sm:text-[9px]
                            "
                        >
                            NORAD{" "}
                            {satellite.noradCatalogId || "—"}
                        </span>

                        <FiCircle
                            className="
                                h-1
                                w-1
                                fill-current
                                text-emerald-400/70
                            "
                        />

                        <span
                            className="
                                font-['Inter']
                                text-[8px]
                                text-slate-600
                                sm:text-[9px]
                            "
                        >
                            Registry data
                        </span>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default SatelliteDetailHero;