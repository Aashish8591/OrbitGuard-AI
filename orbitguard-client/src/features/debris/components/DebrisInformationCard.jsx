import {
    FiActivity,
    FiCalendar,
    FiCircle,
    FiDatabase,
    FiHash,
    FiRadio,
    FiShield,
    FiTarget,
} from "react-icons/fi";

/**
 * ================================================================
 * OrbitGuard AI - Debris Information Card
 * ================================================================
 *
 * DATA FLOW
 *
 * DebrisDetailPage
 *        ↓
 * GET /api/v1/debris/{debrisId}
 *        ↓
 * debris object
 *        ↓
 * DebrisInformationCard
 *
 * IMPORTANT ARCHITECTURE:
 *
 * - This component DOES NOT call the API.
 * - This component receives the already-loaded debris object.
 * - DebrisDetailPage is responsible for loading the selected debris.
 * - No dummy debris data.
 * - No frontend orbital calculations.
 * - Backend response is the source of truth.
 * - Null / undefined backend values are displayed as "—".
 *
 * Displayed backend fields:
 *
 * id
 * debrisCode
 * debrisName
 * noradId
 * objectId
 *
 * epoch
 * classificationType
 * ephemerisType
 * elementSetNumber
 * revolutionAtEpoch
 *
 * meanMotion
 * meanMotionDot
 * meanMotionDdot
 * eccentricity
 * inclination
 * rightAscensionOfAscendingNode
 * argumentOfPericenter
 * meanAnomaly
 * bstar
 *
 * altitude
 * velocity
 *
 * status
 * isActive
 * createdAt
 * updatedAt
 *
 * Removed from this card:
 *
 * - objectType
 * - orbitType
 * - country
 * - size
 * - mass
 * - launchDate
 * - description
 *
 * ================================================================
 */


/* ================================================================
   FORMATTERS
================================================================ */

/**
 * Safely display backend values.
 *
 * Null / undefined / empty values remain visibly unavailable.
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
 * This only formats the display value.
 * It does not modify the backend value.
 */
const formatNumber = (
    value,
    maximumFractionDigits = 6,
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


/**
 * Format backend date/time.
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
            hour12: true,
        },
    );
};


/* ================================================================
   SMALL UI COMPONENTS
================================================================ */

/**
 * Section heading.
 */
const InformationSection = ({
    icon: Icon,
    title,
    description,
}) => {
    return (
        <div className="mb-4 flex items-start gap-3">

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

                <h3
                    className="
                        font-['Orbitron']
                        text-[11px]
                        font-semibold
                        uppercase
                        tracking-[0.16em]
                        text-slate-200
                        sm:text-xs
                    "
                >
                    {title}
                </h3>

                {description && (
                    <p
                        className="
                            mt-1
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
 * Individual information row.
 */
const InformationRow = ({
    icon: Icon,
    label,
    value,
    mono = false,
    valueClassName = "",
}) => {
    return (
        <div
            className="
                flex
                min-w-0
                items-center
                justify-between
                gap-4
                border-b
                border-white/[0.035]
                py-2.5
                last:border-b-0
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

                {Icon && (
                    <Icon
                        className="
                            shrink-0
                            text-slate-600
                        "
                        size={12}
                    />
                )}

                <span
                    className="
                        truncate
                        font-['Inter']
                        text-[10px]
                        text-slate-500
                        sm:text-[11px]
                    "
                >
                    {label}
                </span>

            </div>


            <span
                className={`
                    min-w-0
                    max-w-[62%]
                    truncate
                    text-right
                    font-['Inter']
                    text-[10px]
                    font-medium
                    text-slate-200
                    sm:text-[11px]
                    ${mono ? "font-mono tabular-nums" : ""}
                    ${valueClassName}
                `}
                title={
                    typeof value === "string"
                        ? value
                        : undefined
                }
            >
                {value}
            </span>

        </div>
    );
};


/**
 * Debris lifecycle / registry status badge.
 */
const StatusBadge = ({
    isActive,
    status,
}) => {

    const normalizedStatus =
        status !== null &&
        status !== undefined
            ? String(status).toUpperCase()
            : "";

    const active =
        isActive === true ||
        normalizedStatus === "ACTIVE";

    return (
        <div
            className={`
                inline-flex
                items-center
                gap-1.5
                rounded-full
                border
                px-2.5
                py-1
                font-['Orbitron']
                text-[9px]
                font-semibold
                uppercase
                tracking-[0.08em]

                ${
                    active
                        ? `
                            border-emerald-400/25
                            bg-emerald-400/[0.08]
                            text-emerald-300
                        `
                        : `
                            border-slate-600/40
                            bg-slate-700/20
                            text-slate-400
                        `
                }
            `}
        >

            <span
                className={`
                    h-1.5
                    w-1.5
                    rounded-full

                    ${
                        active
                            ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)]"
                            : "bg-slate-500"
                    }
                `}
            />

            {displayValue(status)}

        </div>
    );
};


/* ================================================================
   COMPONENT
================================================================ */

/**
 * IMPORTANT:
 *
 * Receive the already-loaded debris object.
 *
 * Parent:
 *
 * <DebrisInformationCard debris={debris} />
 */
const DebrisInformationCard = ({
    debris,
}) => {

    /* ============================================================
       NO DATA
    ============================================================ */

    if (!debris) {

        return (
            <section
                className="
                    rounded-2xl
                    border
                    border-white/[0.06]
                    bg-[#020817]/70
                    p-5
                    shadow-[0_12px_40px_rgba(0,0,0,0.18)]
                    backdrop-blur-xl
                "
            >

                <p
                    className="
                        font-['Inter']
                        text-xs
                        text-slate-500
                    "
                >
                    No debris information is available.
                </p>

            </section>
        );
    }


    /* ============================================================
       RENDER
    ============================================================ */

    return (
        <section
            aria-labelledby="debris-information-heading"
            className="
                overflow-hidden
                rounded-2xl
                border
                border-white/[0.06]
                bg-[#020817]/70
                shadow-[0_12px_40px_rgba(0,0,0,0.18)]
                backdrop-blur-xl
            "
        >

            {/* =====================================================
                CARD HEADER
            ===================================================== */}

            <div
                className="
                    border-b
                    border-white/[0.05]
                    px-4
                    py-4
                    sm:px-5
                "
            >

                <InformationSection
                    icon={FiRadio}
                    title="Debris Information"
                    description="Registry and orbital data received directly from the OrbitGuard backend."
                />

            </div>


            {/* =====================================================
                INFORMATION BODY
            ===================================================== */}

            <div className="p-4 sm:p-5">

                <div
                    className="
                        grid
                        grid-cols-1
                        gap-x-8
                        gap-y-7
                        lg:grid-cols-2
                    "
                >

                    {/* =================================================
                        IDENTITY
                    ================================================= */}

                    <div>

                        <InformationSection
                            icon={FiDatabase}
                            title="Identity"
                            description="Primary debris registry identifiers."
                        />

                        <div>

                            <InformationRow
                                icon={FiRadio}
                                label="Debris Name"
                                value={displayValue(
                                    debris.debrisName,
                                )}
                            />

                            <InformationRow
                                icon={FiRadio}
                                label="Debris Code"
                                value={displayValue(
                                    debris.debrisCode,
                                )}
                                mono
                            />

                            <InformationRow
                                icon={FiHash}
                                label="NORAD Catalog ID"
                                value={displayValue(
                                    debris.noradId,
                                )}
                                mono
                            />

                            <InformationRow
                                icon={FiHash}
                                label="Object ID"
                                value={displayValue(
                                    debris.objectId,
                                )}
                                mono
                            />

                            <InformationRow
                                icon={FiCalendar}
                                label="Epoch"
                                value={formatDateTime(
                                    debris.epoch,
                                )}
                                mono
                            />

                        </div>

                    </div>


                    {/* =================================================
                        CLASSIFICATION
                    ================================================= */}

                    <div>

                        <InformationSection
                            icon={FiTarget}
                            title="Classification"
                            description="Classification values supplied by the orbital dataset."
                        />

                        <div>

                            <InformationRow
                                icon={FiCircle}
                                label="Classification Type"
                                value={displayValue(
                                    debris.classificationType,
                                )}
                            />

                            <InformationRow
                                icon={FiCircle}
                                label="Ephemeris Type"
                                value={displayValue(
                                    debris.ephemerisType,
                                )}
                                mono
                            />

                            <InformationRow
                                icon={FiHash}
                                label="Element Set Number"
                                value={formatNumber(
                                    debris.elementSetNumber,
                                    0,
                                )}
                                mono
                            />

                            <InformationRow
                                icon={FiActivity}
                                label="Revolution at Epoch"
                                value={formatNumber(
                                    debris.revolutionAtEpoch,
                                    0,
                                )}
                                mono
                            />

                        </div>

                    </div>


                    {/* =================================================
                        ORBITAL ELEMENTS
                    ================================================= */}

                    <div className="lg:col-span-2">

                        <InformationSection
                            icon={FiActivity}
                            title="Orbital Elements"
                            description="Orbital parameters stored for this debris object."
                        />

                        <div
                            className="
                                grid
                                grid-cols-1
                                gap-x-8
                                md:grid-cols-2
                            "
                        >

                            {/* LEFT */}

                            <div>

                                <InformationRow
                                    icon={FiActivity}
                                    label="Mean Motion"
                                    value={
                                        debris.meanMotion !== null &&
                                        debris.meanMotion !== undefined
                                            ? `${formatNumber(
                                                debris.meanMotion,
                                                8,
                                            )} rev/day`
                                            : "—"
                                    }
                                    mono
                                />

                                <InformationRow
                                    icon={FiActivity}
                                    label="Mean Motion Dot"
                                    value={formatNumber(
                                        debris.meanMotionDot,
                                        10,
                                    )}
                                    mono
                                />

                                <InformationRow
                                    icon={FiActivity}
                                    label="Mean Motion DDot"
                                    value={formatNumber(
                                        debris.meanMotionDdot,
                                        12,
                                    )}
                                    mono
                                />

                                <InformationRow
                                    icon={FiCircle}
                                    label="Eccentricity"
                                    value={formatNumber(
                                        debris.eccentricity,
                                        10,
                                    )}
                                    mono
                                />

                                <InformationRow
                                    icon={FiActivity}
                                    label="Inclination"
                                    value={
                                        debris.inclination !== null &&
                                        debris.inclination !== undefined
                                            ? `${formatNumber(
                                                debris.inclination,
                                                4,
                                            )}°`
                                            : "—"
                                    }
                                    mono
                                />

                            </div>


                            {/* RIGHT */}

                            <div>

                                <InformationRow
                                    icon={FiActivity}
                                    label="RAAN"
                                    value={
                                        debris.rightAscensionOfAscendingNode !== null &&
                                        debris.rightAscensionOfAscendingNode !== undefined
                                            ? `${formatNumber(
                                                debris.rightAscensionOfAscendingNode,
                                                4,
                                            )}°`
                                            : "—"
                                    }
                                    mono
                                />

                                <InformationRow
                                    icon={FiActivity}
                                    label="Argument of Pericenter"
                                    value={
                                        debris.argumentOfPericenter !== null &&
                                        debris.argumentOfPericenter !== undefined
                                            ? `${formatNumber(
                                                debris.argumentOfPericenter,
                                                4,
                                            )}°`
                                            : "—"
                                    }
                                    mono
                                />

                                <InformationRow
                                    icon={FiActivity}
                                    label="Mean Anomaly"
                                    value={
                                        debris.meanAnomaly !== null &&
                                        debris.meanAnomaly !== undefined
                                            ? `${formatNumber(
                                                debris.meanAnomaly,
                                                4,
                                            )}°`
                                            : "—"
                                    }
                                    mono
                                />

                                <InformationRow
                                    icon={FiActivity}
                                    label="BSTAR"
                                    value={formatNumber(
                                        debris.bstar,
                                        12,
                                    )}
                                    mono
                                />

                            </div>

                        </div>

                    </div>


                    {/* =================================================
                        CURRENT ORBITAL STATE
                    ================================================= */}

                    <div>

                        <InformationSection
                            icon={FiActivity}
                            title="Current Orbital State"
                            description="Propagation values stored by the backend."
                        />

                        <InformationRow
                            icon={FiActivity}
                            label="Altitude"
                            value={
                                debris.altitude !== null &&
                                debris.altitude !== undefined
                                    ? `${formatNumber(
                                        debris.altitude,
                                        3,
                                    )} km`
                                    : "—"
                            }
                            mono
                        />

                        <InformationRow
                            icon={FiActivity}
                            label="Velocity"
                            value={
                                debris.velocity !== null &&
                                debris.velocity !== undefined
                                    ? `${formatNumber(
                                        debris.velocity,
                                        3,
                                    )} km/s`
                                    : "—"
                            }
                            mono
                        />

                    </div>


                    {/* =================================================
                        REGISTRY STATUS
                    ================================================= */}

                    <div>

                        <InformationSection
                            icon={FiShield}
                            title="Registry Status"
                            description="Current lifecycle state stored in the database."
                        />

                        <InformationRow
                            icon={FiShield}
                            label="Status"
                            value={
                                <StatusBadge
                                    isActive={
                                        debris.isActive
                                    }
                                    status={
                                        debris.status
                                    }
                                />
                            }
                        />

                        <InformationRow
                            icon={FiShield}
                            label="Active"
                            value={
                                debris.isActive === true
                                    ? "YES"
                                    : debris.isActive === false
                                        ? "NO"
                                        : "—"
                            }
                            valueClassName={
                                debris.isActive === true
                                    ? "text-emerald-300"
                                    : "text-slate-400"
                            }
                        />

                        <InformationRow
                            icon={FiCalendar}
                            label="Created At"
                            value={formatDateTime(
                                debris.createdAt,
                            )}
                            mono
                        />

                        <InformationRow
                            icon={FiCalendar}
                            label="Updated At"
                            value={formatDateTime(
                                debris.updatedAt,
                            )}
                            mono
                        />

                    </div>

                </div>

            </div>

        </section>
    );
};

export default DebrisInformationCard;