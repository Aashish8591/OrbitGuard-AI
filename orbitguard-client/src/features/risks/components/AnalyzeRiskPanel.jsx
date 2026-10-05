import {
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import {
    FiActivity,
    FiAlertTriangle,
    FiChevronDown,
    FiCrosshair,
    FiLoader,
    FiPlay,
    FiRadio,
    FiSearch,
    FiShield,
    FiTarget,
    FiX,
} from "react-icons/fi";

/**
 * ================================================================
 * OrbitGuard AI — Analyze Risk Panel
 * ================================================================
 *
 * RESPONSIBILITIES
 * ------------------------------------------------
 * - Display satellite/debris selectors
 * - Keep search UI visible while backend search is running
 * - Keep selected objects visible while risk analysis is running
 * - Separate search loading from analysis loading
 * - Delegate backend calls to the parent component
 *
 * IMPORTANT
 * ------------------------------------------------
 * This component DOES NOT call the backend directly.
 *
 * Search flow:
 *
 * AnalyzeRiskPanel
 *      ↓
 * onSatelliteSearch / onDebrisSearch
 *      ↓
 * RiskOverviewPage
 *      ↓
 * Existing API / service layer
 *      ↓
 * Spring Boot
 *      ↓
 * MongoDB
 *
 * ================================================================
 */

/* ================================================================
   HELPERS
================================================================ */

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


/* ================================================================
   COLLECTION NORMALIZATION
================================================================ */

const normalizeCollection = (value, depth = 0) => {
    if (!value || depth > 5) {
        return [];
    }

    if (Array.isArray(value)) {
        return value;
    }

    if (typeof value !== "object") {
        return [];
    }

    const directKeys = [
        "content",
        "items",
        "results",
        "records",
        "satellites",
        "debris",
    ];

    for (const key of directKeys) {
        if (Array.isArray(value[key])) {
            return value[key];
        }
    }

    const wrapperKeys = [
        "data",
        "result",
        "response",
        "payload",
    ];

    for (const key of wrapperKeys) {
        if (value[key] !== undefined) {
            const normalized = normalizeCollection(
                value[key],
                depth + 1,
            );

            if (normalized.length > 0) {
                return normalized;
            }
        }
    }

    return [];
};


/* ================================================================
   GENERIC VALUE HELPER
================================================================ */

const getFirstValue = (item, keys = []) => {
    if (!item) {
        return "";
    }

    for (const key of keys) {
        const value = item[key];

        if (
            value !== null &&
            value !== undefined &&
            value !== ""
        ) {
            return String(value);
        }
    }

    return "";
};


/* ================================================================
   ENTITY ID HELPERS
================================================================ */

const getSatelliteId = (item) => {
    return getFirstValue(item, [
        "id",
        "_id",
        "satelliteId",
        "objectId",
        "noradCatalogId",
        "noradId",
        "satelliteCode",
        "objectCode",
    ]);
};


const getDebrisId = (item) => {
    return getFirstValue(item, [
        "id",
        "_id",
        "debrisId",
        "objectId",
        "noradCatalogId",
        "noradId",
        "debrisCode",
        "objectCode",
    ]);
};


/* ================================================================
   ENTITY LABEL HELPERS
================================================================ */

const getSatelliteLabel = (item) => {
    if (!item) {
        return "Unknown Satellite";
    }

    const satelliteName =
        item.satelliteName ??
        item.name ??
        item.objectName;

    const satelliteCode =
        item.satelliteCode ??
        item.code ??
        item.objectCode;

    if (
        satelliteName &&
        satelliteCode
    ) {
        return `${satelliteName} — ${satelliteCode}`;
    }

    return (
        satelliteName ||
        satelliteCode ||
        item.noradCatalogId ||
        item.noradId ||
        item.objectId ||
        item.id ||
        item._id ||
        "Satellite"
    );
};


const getDebrisLabel = (item) => {
    if (!item) {
        return "Unknown Debris";
    }

    const debrisName =
        item.debrisName ??
        item.name ??
        item.objectName;

    const debrisCode =
        item.debrisCode ??
        item.code ??
        item.objectCode;

    if (
        debrisName &&
        debrisCode
    ) {
        return `${debrisName} — ${debrisCode}`;
    }

    return (
        debrisName ||
        debrisCode ||
        item.noradId ||
        item.noradCatalogId ||
        item.objectId ||
        item.id ||
        item._id ||
        "Space Debris"
    );
};


/* ================================================================
   SEARCH TEXT
================================================================ */

const buildSearchText = (item, fields = []) => {
    if (!item) {
        return "";
    }

    return fields
        .map((field) => item[field])
        .filter(
            (value) =>
                value !== null &&
                value !== undefined &&
                value !== "",
        )
        .map((value) => String(value))
        .join(" ")
        .toLowerCase();
};


const getSatelliteSearchText = (item) => {
    return buildSearchText(item, [
        "satelliteName",
        "name",
        "objectName",
        "satelliteCode",
        "code",
        "objectCode",
        "noradCatalogId",
        "noradId",
        "noradNumber",
        "objectId",
        "id",
        "_id",
        "satelliteId",
    ]);
};


const getDebrisSearchText = (item) => {
    return buildSearchText(item, [
        "debrisName",
        "name",
        "objectName",
        "debrisCode",
        "code",
        "objectCode",
        "noradCatalogId",
        "noradId",
        "noradNumber",
        "objectId",
        "id",
        "_id",
        "debrisId",
    ]);
};


/* ================================================================
   SEARCHABLE ENTITY SELECT
================================================================ */

const EntitySelect = ({
    id,
    value,
    onChange,
    options = [],
    placeholder,
    loading = false,
    disabled = false,
    icon: Icon,
    searchPlaceholder = "Search objects...",
    objectType = "objects",
    onSearchChange,
}) => {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");

    const containerRef = useRef(null);
    const searchInputRef = useRef(null);

    /*
     * IMPORTANT
     * ------------------------------------------------------------
     * Search loading MUST NOT disable the dropdown.
     *
     * Previously:
     *
     * const isDisabled = disabled || loading;
     *
     * That caused:
     *
     * loading = true
     *       ↓
     * dropdown disabled
     *       ↓
     * dropdown hidden
     *       ↓
     * search input disappears
     *
     * Now only the actual parent-disabled state disables
     * the control.
     */
    const isDisabled = disabled;


    /* ------------------------------------------------------------
       SELECTED OPTION
    ------------------------------------------------------------ */

    const selectedOption = useMemo(() => {
        if (
            value === null ||
            value === undefined ||
            value === ""
        ) {
            return null;
        }

        return (
            options.find(
                (option) =>
                    String(option.value) ===
                    String(value),
            ) ?? null
        );
    }, [options, value]);


    /* ------------------------------------------------------------
       SEARCH RESULTS
    ------------------------------------------------------------ */

    const filteredOptions = useMemo(() => {
        const query = search
            .trim()
            .toLowerCase();

        if (!query) {
            return [];
        }

        return options.filter((option) => {
            const label = String(
                option.label ?? "",
            ).toLowerCase();

            const optionValue = String(
                option.value ?? "",
            ).toLowerCase();

            const searchText = String(
                option.searchText ?? "",
            ).toLowerCase();

            return (
                label.includes(query) ||
                optionValue.includes(query) ||
                searchText.includes(query)
            );
        });
    }, [options, search]);


    /* ------------------------------------------------------------
       OUTSIDE CLICK
    ------------------------------------------------------------ */

    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(
                    event.target,
                )
            ) {
                setOpen(false);
                setSearch("");
            }
        };

        document.addEventListener(
            "mousedown",
            handleOutsideClick,
        );

        return () => {
            document.removeEventListener(
                "mousedown",
                handleOutsideClick,
            );
        };
    }, []);


    /* ------------------------------------------------------------
       OPEN
    ------------------------------------------------------------ */

    const handleOpen = () => {
        if (isDisabled) {
            return;
        }

        setOpen(true);

        requestAnimationFrame(() => {
            searchInputRef.current?.focus();
        });
    };


    /* ------------------------------------------------------------
       SEARCH CHANGE
    ------------------------------------------------------------ */

    const handleSearchChange = (event) => {
        const nextValue = event.target.value;

        setSearch(nextValue);

        /*
         * Search request is delegated to parent.
         *
         * The dropdown stays mounted while loading.
         */
        onSearchChange?.(nextValue);
    };


    /* ------------------------------------------------------------
       SELECT
    ------------------------------------------------------------ */

    const handleSelect = (option) => {
        onChange?.(String(option.value));

        setOpen(false);
        setSearch("");
    };


    /* ------------------------------------------------------------
       CLEAR SELECTED VALUE
    ------------------------------------------------------------ */

    const handleClear = (event) => {
        event.stopPropagation();

        onChange?.("");

        setSearch("");
    };


    /* ------------------------------------------------------------
       CLEAR SEARCH
    ------------------------------------------------------------ */

    const handleClearSearch = () => {
        setSearch("");

        onSearchChange?.("");

        requestAnimationFrame(() => {
            searchInputRef.current?.focus();
        });
    };


    return (
        <div
            ref={containerRef}
            className="relative"
        >

            {/* MAIN CONTROL */}

            <button
                type="button"
                id={id}
                disabled={isDisabled}
                onClick={handleOpen}
                className="
                    flex
                    h-10
                    w-full
                    items-center
                    rounded-lg
                    border
                    border-white/[0.08]
                    bg-[#071321]
                    px-3
                    text-left
                    outline-none
                    transition-all
                    duration-200

                    hover:border-white/[0.12]

                    focus:border-cyan-400/35
                    focus:bg-[#081625]
                    focus:ring-1
                    focus:ring-cyan-400/10

                    disabled:cursor-not-allowed
                    disabled:opacity-50
                "
            >

                <span
                    className="
                        mr-2.5
                        shrink-0
                        text-slate-600
                    "
                >
                    {Icon && (
                        <Icon size={12} />
                    )}
                </span>


                <span
                    className={`
                        min-w-0
                        flex-1
                        truncate
                        font-['Inter']
                        text-[10px]

                        ${
                            selectedOption
                                ? "text-slate-300"
                                : "text-slate-600"
                        }
                    `}
                >
                    {selectedOption
                        ? selectedOption.label
                        : placeholder}
                </span>


                {selectedOption &&
                    !disabled && (
                        <span
                            role="button"
                            tabIndex={0}
                            onClick={handleClear}
                            onKeyDown={(event) => {
                                if (
                                    event.key ===
                                    "Enter"
                                ) {
                                    handleClear(
                                        event,
                                    );
                                }
                            }}
                            className="
                                mr-2
                                rounded
                                p-0.5
                                text-slate-600
                                transition
                                hover:bg-white/[0.05]
                                hover:text-slate-300
                            "
                            aria-label="Clear selection"
                        >
                            <FiX size={11} />
                        </span>
                    )}


                <span
                    className="
                        shrink-0
                        text-slate-600
                    "
                >
                    {loading ? (
                        <FiLoader
                            size={12}
                            className="
                                animate-spin
                                text-cyan-400/70
                            "
                        />
                    ) : (
                        <FiChevronDown
                            size={12}
                            className={`
                                transition-transform
                                duration-200

                                ${
                                    open
                                        ? "rotate-180"
                                        : ""
                                }
                            `}
                        />
                    )}
                </span>
            </button>


            {/* SEARCH DROPDOWN */}

            {open && !isDisabled && (
                <div
                    className="
                        absolute
                        left-0
                        right-0
                        z-50
                        mt-1.5
                        overflow-hidden
                        rounded-lg
                        border
                        border-white/[0.08]
                        bg-[#071321]
                        shadow-[0_18px_45px_rgba(0,0,0,0.55)]
                    "
                >

                    {/* SEARCH */}

                    <div
                        className="
                            border-b
                            border-white/[0.05]
                            p-2
                        "
                    >
                        <div
                            className="
                                flex
                                items-center
                                gap-2
                                rounded-md
                                border
                                border-white/[0.07]
                                bg-[#020914]
                                px-2.5
                            "
                        >
                            <FiSearch
                                size={11}
                                className="
                                    shrink-0
                                    text-slate-600
                                "
                            />

                            <input
                                ref={searchInputRef}
                                type="text"
                                value={search}
                                onChange={
                                    handleSearchChange
                                }
                                placeholder={
                                    searchPlaceholder
                                }
                                autoComplete="off"
                                disabled={disabled}
                                className="
                                    h-8
                                    min-w-0
                                    flex-1
                                    bg-transparent
                                    font-['Inter']
                                    text-[10px]
                                    text-slate-300
                                    outline-none
                                    placeholder:text-slate-700
                                    disabled:cursor-not-allowed
                                "
                            />

                            {search && (
                                <button
                                    type="button"
                                    onClick={
                                        handleClearSearch
                                    }
                                    className="
                                        text-slate-600
                                        hover:text-slate-300
                                    "
                                    aria-label="Clear search"
                                >
                                    <FiX size={10} />
                                </button>
                            )}
                        </div>
                    </div>


                    {/* RESULTS */}

                    <div
                        className="
                            max-h-52
                            overflow-y-auto
                            overscroll-contain
                        "
                    >

                        {!search.trim() ? (
                            <div
                                className="
                                    px-3
                                    py-5
                                    text-center
                                "
                            >
                                <FiSearch
                                    size={14}
                                    className="
                                        mx-auto
                                        mb-2
                                        text-slate-700
                                    "
                                />

                                <p
                                    className="
                                        font-['Orbitron']
                                        text-[7px]
                                        font-semibold
                                        uppercase
                                        tracking-[0.08em]
                                        text-slate-600
                                    "
                                >
                                    Search {objectType}
                                </p>

                                <p
                                    className="
                                        mt-1
                                        font-['Inter']
                                        text-[8px]
                                        text-slate-700
                                    "
                                >
                                    Type a name, code or NORAD ID
                                </p>
                            </div>
                        ) : loading ? (
                            /*
                             * IMPORTANT:
                             * The search box remains visible.
                             *
                             * Only the result area changes to
                             * a loading state.
                             */
                            <div
                                className="
                                    px-3
                                    py-6
                                    text-center
                                "
                            >
                                <FiLoader
                                    size={14}
                                    className="
                                        mx-auto
                                        mb-2
                                        animate-spin
                                        text-cyan-400/70
                                    "
                                />

                                <p
                                    className="
                                        font-['Orbitron']
                                        text-[7px]
                                        font-semibold
                                        uppercase
                                        tracking-[0.08em]
                                        text-slate-600
                                    "
                                >
                                    Searching
                                </p>

                                <p
                                    className="
                                        mt-1
                                        font-['Inter']
                                        text-[8px]
                                        text-slate-700
                                    "
                                >
                                    Querying backend records
                                </p>
                            </div>
                        ) : filteredOptions.length > 0 ? (
                            filteredOptions.map(
                                (option) => {
                                    const isSelected =
                                        String(
                                            option.value,
                                        ) ===
                                        String(value);

                                    return (
                                        <button
                                            key={`${option.value}`}
                                            type="button"
                                            onClick={() =>
                                                handleSelect(
                                                    option,
                                                )
                                            }
                                            className={`
                                                flex
                                                w-full
                                                items-center
                                                gap-2
                                                px-3
                                                py-2.5
                                                text-left
                                                transition-colors

                                                ${
                                                    isSelected
                                                        ? `
                                                            bg-cyan-400/[0.07]
                                                            text-cyan-300
                                                        `
                                                        : `
                                                            text-slate-300
                                                            hover:bg-white/[0.04]
                                                        `
                                                }
                                            `}
                                        >
                                            <span
                                                className={`
                                                    flex
                                                    h-5
                                                    w-5
                                                    shrink-0
                                                    items-center
                                                    justify-center
                                                    rounded

                                                    ${
                                                        isSelected
                                                            ? `
                                                                bg-cyan-400/[0.10]
                                                                text-cyan-300
                                                            `
                                                            : `
                                                                bg-white/[0.025]
                                                                text-slate-600
                                                            `
                                                    }
                                                `}
                                            >
                                                {Icon && (
                                                    <Icon
                                                        size={10}
                                                    />
                                                )}
                                            </span>

                                            <span
                                                className="
                                                    min-w-0
                                                    flex-1
                                                    truncate
                                                    font-['Inter']
                                                    text-[10px]
                                                "
                                            >
                                                {
                                                    option.label
                                                }
                                            </span>
                                        </button>
                                    );
                                },
                            )
                        ) : (
                            <div
                                className="
                                    px-3
                                    py-5
                                    text-center
                                "
                            >
                                <FiSearch
                                    size={12}
                                    className="
                                        mx-auto
                                        mb-1.5
                                        text-slate-700
                                    "
                                />

                                <p
                                    className="
                                        font-['Inter']
                                        text-[9px]
                                        text-slate-600
                                    "
                                >
                                    No matching {objectType}
                                </p>

                                <p
                                    className="
                                        mt-1
                                        font-['Inter']
                                        text-[8px]
                                        text-slate-700
                                    "
                                >
                                    Try another name, code or NORAD ID
                                </p>
                            </div>
                        )}

                    </div>
                </div>
            )}
        </div>
    );
};


/* ================================================================
   FIELD LABEL
================================================================ */

const FieldLabel = ({
    children,
    icon: Icon,
}) => {
    return (
        <div
            className="
                mb-1.5
                flex
                items-center
                gap-1.5
                font-['Inter']
                text-[8px]
                font-medium
                uppercase
                tracking-[0.09em]
                text-slate-500
            "
        >
            {Icon && (
                <Icon
                    size={10}
                    className="text-slate-600"
                />
            )}

            <span>
                {children}
            </span>
        </div>
    );
};


/* ================================================================
   OBJECT CONNECTION
================================================================ */

const ObjectConnection = ({
    satelliteSelected,
    debrisSelected,
}) => {
    const connected =
        satelliteSelected &&
        debrisSelected;

    return (
        <div
            className="
                flex
                items-center
                justify-center
                py-1
            "
        >
            <div
                className={`
                    h-px
                    flex-1
                    bg-gradient-to-r
                    from-transparent
                    ${
                        connected
                            ? "via-cyan-400/35"
                            : "via-white/[0.08]"
                    }
                    to-transparent
                `}
            />

            <div
                className={`
                    mx-2
                    flex
                    h-7
                    w-7
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    border
                    transition-all
                    duration-200

                    ${
                        connected
                            ? `
                                border-cyan-400/35
                                bg-cyan-400/[0.08]
                                text-cyan-300
                                shadow-[0_0_14px_rgba(34,211,238,0.10)]
                            `
                            : `
                                border-white/[0.08]
                                bg-white/[0.02]
                                text-slate-600
                            `
                    }
                `}
            >
                <FiCrosshair size={11} />
            </div>

            <div
                className={`
                    h-px
                    flex-1
                    bg-gradient-to-r
                    from-transparent
                    ${
                        connected
                            ? "via-cyan-400/35"
                            : "via-white/[0.08]"
                    }
                    to-transparent
                `}
            />
        </div>
    );
};


/* ================================================================
   SELECTION STATUS
================================================================ */

const SelectionStatus = ({
    satelliteSelected,
    debrisSelected,
    analysisRunning = false,
}) => {
    const ready =
        satelliteSelected &&
        debrisSelected;

    const statusReady =
        ready && !analysisRunning;

    return (
        <div
            className={`
                mt-3
                flex
                items-center
                gap-2
                rounded-lg
                border
                px-2.5
                py-2

                ${
                    analysisRunning
                        ? `
                            border-cyan-400/15
                            bg-cyan-400/[0.025]
                        `
                        : statusReady
                            ? `
                                border-emerald-400/10
                                bg-emerald-400/[0.025]
                            `
                            : `
                                border-white/[0.045]
                                bg-white/[0.012]
                            `
                }
            `}
        >
            <div
                className={`
                    flex
                    h-6
                    w-6
                    shrink-0
                    items-center
                    justify-center
                    rounded-md

                    ${
                        analysisRunning
                            ? `
                                bg-cyan-400/[0.08]
                                text-cyan-300
                            `
                            : statusReady
                                ? `
                                    bg-emerald-400/[0.08]
                                    text-emerald-300
                                `
                                : `
                                    bg-slate-400/[0.04]
                                    text-slate-600
                                `
                    }
                `}
            >
                {analysisRunning ? (
                    <FiLoader
                        size={11}
                        className="animate-spin"
                    />
                ) : statusReady ? (
                    <FiShield size={11} />
                ) : (
                    <FiAlertTriangle size={11} />
                )}
            </div>

            <div className="min-w-0">
                <p
                    className={`
                        font-['Orbitron']
                        text-[7px]
                        font-semibold
                        uppercase
                        tracking-[0.12em]

                        ${
                            analysisRunning
                                ? "text-cyan-300"
                                : statusReady
                                    ? "text-emerald-300"
                                    : "text-slate-600"
                        }
                    `}
                >
                    {analysisRunning
                        ? "Analysis In Progress"
                        : statusReady
                            ? "Analysis Ready"
                            : "Awaiting Selection"}
                </p>

                <p
                    className="
                        mt-0.5
                        truncate
                        font-['Inter']
                        text-[8px]
                        text-slate-600
                    "
                >
                    {analysisRunning
                        ? "Running orbital propagation and conjunction assessment"
                        : statusReady
                            ? "Both objects selected"
                            : "Select satellite and debris"}
                </p>
            </div>
        </div>
    );
};


/* ================================================================
   MAIN COMPONENT
================================================================ */

const AnalyzeRiskPanel = ({
    satellites = [],
    debris = [],

    selectedSatelliteId = "",
    selectedDebrisId = "",

    onSatelliteChange,
    onDebrisChange,

    onSatelliteSearch,
    onDebrisSearch,

    onAnalyze,

    loading = false,

    satellitesLoading = false,
    debrisLoading = false,

    error = null,
    onClearError,
}) => {

    /* ------------------------------------------------------------
       NORMALIZE COLLECTIONS
    ------------------------------------------------------------ */

    const satelliteList = useMemo(
        () => normalizeCollection(satellites),
        [satellites],
    );

    const debrisList = useMemo(
        () => normalizeCollection(debris),
        [debris],
    );


    /* ------------------------------------------------------------
       SATELLITE OPTIONS
    ------------------------------------------------------------ */

    const satelliteOptions = useMemo(() => {
        const mapped = satelliteList
            .map((item) => {
                const value =
                    getSatelliteId(item);

                return {
                    value,
                    label:
                        getSatelliteLabel(item),
                    searchText:
                        getSatelliteSearchText(item),
                };
            })
            .filter(
                (option) =>
                    option.value !== "",
            );

        const seen = new Set();

        return mapped.filter((option) => {
            const key = String(
                option.value,
            );

            if (seen.has(key)) {
                return false;
            }

            seen.add(key);

            return true;
        });
    }, [satelliteList]);


    /* ------------------------------------------------------------
       DEBRIS OPTIONS
    ------------------------------------------------------------ */

    const debrisOptions = useMemo(() => {
        const mapped = debrisList
            .map((item) => {
                const value =
                    getDebrisId(item);

                return {
                    value,
                    label:
                        getDebrisLabel(item),
                    searchText:
                        getDebrisSearchText(item),
                };
            })
            .filter(
                (option) =>
                    option.value !== "",
            );

        const seen = new Set();

        return mapped.filter((option) => {
            const key = String(
                option.value,
            );

            if (seen.has(key)) {
                return false;
            }

            seen.add(key);

            return true;
        });
    }, [debrisList]);


    /* ------------------------------------------------------------
       ANALYSIS LIFECYCLE
       ------------------------------------------------------------

       Keep a local lifecycle flag so the UI does not immediately
       lose its "analysis in progress" state because of unrelated
       search/result rendering.
    */

    const [analysisRunning, setAnalysisRunning] =
        useState(false);

    const previousLoadingRef = useRef(false);

    useEffect(() => {
        if (loading) {
            setAnalysisRunning(true);
        }

        /*
         * Only finish the local state when the parent's loading
         * state actually transitions from true -> false.
         */
        if (
            previousLoadingRef.current &&
            !loading
        ) {
            setAnalysisRunning(false);
        }

        previousLoadingRef.current = loading;
    }, [loading]);


    /*
     * Parent remains the source of truth.
     *
     * This component intentionally does NOT replace selected IDs
     * with local fake IDs. That prevents divergence between the
     * panel and RiskOverviewPage.
     */


    /* ------------------------------------------------------------
       SELECTION STATE
    ------------------------------------------------------------ */

    const satelliteSelected =
        Boolean(selectedSatelliteId);

    const debrisSelected =
        Boolean(selectedDebrisId);


    /*
     * Search loading must NOT block analysis merely because the
     * user is currently typing into a search field.
     *
     * However, analysis itself must remain disabled while search
     * requests are still resolving because the selected records
     * may not yet be available.
     */
    const canAnalyze =
        satelliteSelected &&
        debrisSelected &&
        !loading &&
        !satellitesLoading &&
        !debrisLoading;


    /* ------------------------------------------------------------
       CHANGE HANDLERS
    ------------------------------------------------------------ */

    const handleSatelliteChange = (value) => {
        onSatelliteChange?.(value);

        if (
            error &&
            typeof onClearError ===
                "function"
        ) {
            onClearError();
        }
    };


    const handleDebrisChange = (value) => {
        onDebrisChange?.(value);

        if (
            error &&
            typeof onClearError ===
                "function"
        ) {
            onClearError();
        }
    };


    /* ------------------------------------------------------------
       BACKEND SEARCH HANDLERS
    ------------------------------------------------------------ */

    const handleSatelliteSearch = (value) => {
        onSatelliteSearch?.(value);
    };


    const handleDebrisSearch = (value) => {
        onDebrisSearch?.(value);
    };


    /* ------------------------------------------------------------
       SUBMIT
    ------------------------------------------------------------ */

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!canAnalyze) {
            return;
        }

        if (
            typeof onAnalyze !==
            "function"
        ) {
            return;
        }

        /*
         * Set immediately before calling the parent.
         *
         * This prevents the button/status from waiting for the
         * parent state update before showing "Analysis In Progress".
         */
        setAnalysisRunning(true);

        try {
            await onAnalyze({
                satelliteId:
                    selectedSatelliteId,

                debrisId:
                    selectedDebrisId,
            });
        } catch (submitError) {
            /*
             * Parent owns the actual error state.
             *
             * We only make sure the panel does not remain in a
             * false local loading state if the parent throws.
             */
            setAnalysisRunning(false);

            throw submitError;
        }
    };


    /*
     * UI analysis state.
     *
     * `loading` is the authoritative backend loading state.
     * `analysisRunning` protects the immediate UI transition.
     */
    const isAnalysisRunning =
        loading || analysisRunning;


    /* ------------------------------------------------------------
       RENDER
    ------------------------------------------------------------ */

    return (
        <section
            aria-labelledby="analyze-risk-heading"
            className="
                relative
                w-full
                overflow-visible
                rounded-xl
                border
                border-cyan-400/10
                bg-[#020914]/90
                shadow-[0_18px_55px_rgba(0,0,0,0.45)]
                backdrop-blur-xl
            "
        >

            {/* TOP ACCENT */}

            <div
                className="
                    pointer-events-none
                    absolute
                    inset-x-0
                    top-0
                    h-px
                    bg-gradient-to-r
                    from-transparent
                    via-cyan-400/70
                    to-transparent
                "
            />


            {/* HEADER */}

            <div
                className="
                    border-b
                    border-white/[0.05]
                    px-4
                    py-3.5
                "
            >
                <div
                    className="
                        flex
                        items-center
                        justify-between
                        gap-3
                    "
                >
                    <div className="flex items-center gap-2.5">

                        <div
                            className={`
                                flex
                                h-7
                                w-7
                                shrink-0
                                items-center
                                justify-center
                                rounded-lg
                                border

                                ${
                                    isAnalysisRunning
                                        ? `
                                            border-cyan-400/30
                                            bg-cyan-400/[0.09]
                                            text-cyan-300
                                        `
                                        : `
                                            border-cyan-400/20
                                            bg-cyan-400/[0.06]
                                            text-cyan-300
                                        `
                                }
                            `}
                        >
                            {isAnalysisRunning ? (
                                <FiLoader
                                    size={13}
                                    className="animate-spin"
                                />
                            ) : (
                                <FiActivity size={13} />
                            )}
                        </div>

                        <div className="min-w-0">
                            <h2
                                id="analyze-risk-heading"
                                className="
                                    font-['Orbitron']
                                    text-[9px]
                                    font-semibold
                                    uppercase
                                    tracking-[0.13em]
                                    text-slate-100
                                "
                            >
                                Analyze New Risk
                            </h2>

                            <p
                                className="
                                    mt-0.5
                                    font-['Inter']
                                    text-[8px]
                                    text-slate-600
                                "
                            >
                                {isAnalysisRunning
                                    ? "Orbital conjunction assessment in progress"
                                    : "Create conjunction assessment"}
                            </p>
                        </div>
                    </div>


                    <div
                        className={`
                            flex
                            shrink-0
                            items-center
                            gap-1.5
                            rounded-full
                            border
                            px-2
                            py-1

                            ${
                                isAnalysisRunning
                                    ? `
                                        border-cyan-400/15
                                        bg-cyan-400/[0.04]
                                    `
                                    : `
                                        border-cyan-400/10
                                        bg-cyan-400/[0.025]
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
                                    isAnalysisRunning
                                        ? `
                                            bg-cyan-400
                                            shadow-[0_0_7px_rgba(34,211,238,0.7)]
                                        `
                                        : `
                                            bg-emerald-400
                                            shadow-[0_0_7px_rgba(52,211,153,0.7)]
                                        `
                                }
                            `}
                        />

                        <span
                            className={`
                                font-['Orbitron']
                                text-[6px]
                                font-semibold
                                uppercase
                                tracking-[0.08em]

                                ${
                                    isAnalysisRunning
                                        ? "text-cyan-300/80"
                                        : "text-emerald-300/80"
                                }
                            `}
                        >
                            {isAnalysisRunning
                                ? "Processing"
                                : "Ready"}
                        </span>
                    </div>
                </div>
            </div>


            {/* FORM */}

            <form
                onSubmit={handleSubmit}
                noValidate
            >
                <div className="p-4">

                    {/* SATELLITE */}

                    <div>
                        <FieldLabel icon={FiRadio}>
                            Select Satellite
                        </FieldLabel>

                        <EntitySelect
                            id="risk-satellite"
                            value={
                                selectedSatelliteId
                            }
                            onChange={
                                handleSatelliteChange
                            }
                            onSearchChange={
                                handleSatelliteSearch
                            }
                            options={
                                satelliteOptions
                            }
                            placeholder="Search for a satellite"
                            searchPlaceholder="Search satellite..."
                            objectType="satellites"
                            /*
                             * IMPORTANT:
                             * Risk analysis loading does NOT
                             * disable the selector.
                             *
                             * Search loading also does not
                             * disable the selector.
                             */
                            disabled={false}
                            loading={
                                satellitesLoading
                            }
                            icon={FiRadio}
                        />
                    </div>


                    {/* CONNECTION */}

                    <ObjectConnection
                        satelliteSelected={
                            satelliteSelected
                        }
                        debrisSelected={
                            debrisSelected
                        }
                    />


                    {/* DEBRIS */}

                    <div>
                        <FieldLabel icon={FiTarget}>
                            Select Space Debris
                        </FieldLabel>

                        <EntitySelect
                            id="risk-debris"
                            value={
                                selectedDebrisId
                            }
                            onChange={
                                handleDebrisChange
                            }
                            onSearchChange={
                                handleDebrisSearch
                            }
                            options={
                                debrisOptions
                            }
                            placeholder="Search for debris"
                            searchPlaceholder="Search debris..."
                            objectType="debris objects"
                            disabled={false}
                            loading={
                                debrisLoading
                            }
                            icon={FiTarget}
                        />
                    </div>


                    {/* SELECTION STATUS */}

                    <SelectionStatus
                        satelliteSelected={
                            satelliteSelected
                        }
                        debrisSelected={
                            debrisSelected
                        }
                        analysisRunning={
                            isAnalysisRunning
                        }
                    />


                    {/* ANALYSIS PROGRESS */}

                    {isAnalysisRunning && (
                        <div
                            className="
                                mt-3
                                overflow-hidden
                                rounded-lg
                                border
                                border-cyan-400/10
                                bg-cyan-400/[0.02]
                            "
                        >
                            <div
                                className="
                                    flex
                                    items-center
                                    gap-2
                                    px-2.5
                                    py-2
                                "
                            >
                                <FiActivity
                                    size={10}
                                    className="
                                        shrink-0
                                        text-cyan-400/70
                                    "
                                />

                                <span
                                    className="
                                        min-w-0
                                        flex-1
                                        font-['Inter']
                                        text-[8px]
                                        text-slate-600
                                    "
                                >
                                    Processing selected orbital objects...
                                </span>

                                <FiLoader
                                    size={10}
                                    className="
                                        shrink-0
                                        animate-spin
                                        text-cyan-400/70
                                    "
                                />
                            </div>

                            <div
                                className="
                                    h-px
                                    w-full
                                    overflow-hidden
                                    bg-white/[0.03]
                                "
                            >
                                <div
                                    className="
                                        h-full
                                        w-1/3
                                        animate-[progress-slide_1.6s_ease-in-out_infinite]
                                        bg-cyan-400/60
                                    "
                                />
                            </div>
                        </div>
                    )}


                    {/* ERROR */}

                    {error && (
                        <div
                            role="alert"
                            className="
                                mt-3
                                flex
                                items-start
                                gap-2
                                rounded-lg
                                border
                                border-red-400/15
                                bg-red-400/[0.035]
                                px-2.5
                                py-2.5
                            "
                        >
                            <FiAlertTriangle
                                size={12}
                                className="
                                    mt-0.5
                                    shrink-0
                                    text-red-300
                                "
                            />

                            <div
                                className="
                                    min-w-0
                                    flex-1
                                "
                            >
                                <p
                                    className="
                                        font-['Orbitron']
                                        text-[7px]
                                        font-semibold
                                        uppercase
                                        tracking-[0.1em]
                                        text-red-300
                                    "
                                >
                                    Analysis Failed
                                </p>

                                <p
                                    className="
                                        mt-1
                                        font-['Inter']
                                        text-[8px]
                                        leading-4
                                        text-red-200/60
                                    "
                                >
                                    {displayValue(error)}
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
                                        transition
                                        hover:bg-white/[0.04]
                                        hover:text-slate-300
                                    "
                                    aria-label="Dismiss error"
                                >
                                    <FiX size={11} />
                                </button>
                            )}
                        </div>
                    )}
                </div>


                {/* ACTION */}

                <div
                    className="
                        border-t
                        border-white/[0.05]
                        bg-white/[0.012]
                        p-3
                    "
                >
                    <button
                        type="submit"
                        disabled={!canAnalyze}
                        className="
                            group
                            flex
                            h-10
                            w-full
                            items-center
                            justify-center
                            gap-2
                            rounded-lg
                            border
                            border-cyan-300/30
                            bg-cyan-400
                            px-4
                            font-['Orbitron']
                            text-[8px]
                            font-bold
                            uppercase
                            tracking-[0.08em]
                            text-[#021018]
                            shadow-[0_0_20px_rgba(34,211,238,0.10)]
                            transition-all
                            duration-200

                            hover:bg-cyan-300
                            hover:shadow-[0_0_28px_rgba(34,211,238,0.20)]

                            disabled:cursor-not-allowed
                            disabled:border-white/[0.05]
                            disabled:bg-slate-700/40
                            disabled:text-slate-600
                            disabled:shadow-none
                        "
                    >
                        {isAnalysisRunning ? (
                            <>
                                <FiLoader
                                    size={12}
                                    className="animate-spin"
                                />

                                Analysis In Progress...
                            </>
                        ) : (
                            <>
                                <FiPlay
                                    size={10}
                                    fill="currentColor"
                                />

                                Analyze Risk
                            </>
                        )}
                    </button>


                    <div
                        className="
                            mt-2.5
                            flex
                            items-center
                            justify-center
                            gap-1.5
                        "
                    >
                        <FiShield
                            size={9}
                            className="text-emerald-400/70"
                        />

                        <span
                            className="
                                font-['Inter']
                                text-[7px]
                                text-slate-600
                            "
                        >
                            Backend orbital propagation
                        </span>
                    </div>
                </div>
            </form>
        </section>
    );
};


export default AnalyzeRiskPanel;