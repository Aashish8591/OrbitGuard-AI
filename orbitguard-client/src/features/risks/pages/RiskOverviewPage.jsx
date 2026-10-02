import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import { useNavigate } from "react-router-dom";

import RiskHero from "../components/RiskHero";
import RiskSummaryCards from "../components/RiskSummaryCards";
import RiskLevelDistribution from "../components/RiskLevelDistribution";
import RiskAssessmentTrend from "../components/RiskAssessmentTrend";
import LatestRiskAssessment from "../components/LatestRiskAssessment";
import AnalyzeRiskPanel from "../components/AnalyzeRiskPanel";
import RiskToolbar from "../components/RiskToolbar";
import RiskTable from "../components/RiskTable";

import {
    getRiskAssessments,
    analyzeRisk,
} from "../../../services/riskService";


/* ================================================================
   CONSTANTS
================================================================ */

const DEFAULT_PAGE_SIZE = 10;

const DEFAULT_FILTERS = {
    search: "",
    riskLevel: "",
    status: "",
    assessmentType: "",
    satelliteId: "",
    debrisId: "",
    fromDate: "",
    toDate: "",
};

const EMPTY_SUMMARY = {
    total: 0,
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
};


/* ================================================================
   HELPERS
================================================================ */

/**
 * Extract the paged payload from the common API response.
 *
 * Backend:
 *
 * ApiResponse<PagedResponse<RiskAssessmentResponse>>
 */
const extractPageData = (response) => {
    return (
        response?.data ??
        response?.data?.data ??
        response ??
        {}
    );
};


/**
 * Safely extract API error message.
 */
const getErrorMessage = (
    error,
    fallback,
) => {

    return (
        error?.response?.data?.message ??
        error?.response?.data?.error ??
        error?.message ??
        fallback
    );
};


/**
 * Normalize risk level.
 */
const normalizeRiskLevel = (value) => {
    return String(value ?? "").trim().toUpperCase();
};


/* ================================================================
   COMPONENT
================================================================ */

const RiskOverviewPage = () => {

    const navigate = useNavigate();


    /* ============================================================
       RISK DATA
    ============================================================ */

    const [risks, setRisks] = useState([]);

    const [summary, setSummary] = useState(
        EMPTY_SUMMARY,
    );


    /* ============================================================
       UI STATE
    ============================================================ */

    const [loading, setLoading] = useState(true);

    const [summaryLoading, setSummaryLoading] =
        useState(true);

    const [analyzing, setAnalyzing] =
        useState(false);

    const [error, setError] =
        useState("");


    /* ============================================================
       PAGINATION
    ============================================================ */

    const [page, setPage] = useState(0);

    const [pageSize, setPageSize] =
        useState(DEFAULT_PAGE_SIZE);

    const [totalElements, setTotalElements] =
        useState(0);

    const [totalPages, setTotalPages] =
        useState(0);

    const [first, setFirst] =
        useState(true);

    const [last, setLast] =
        useState(true);


    /* ============================================================
       FILTERS
    ============================================================ */

    const [filters, setFilters] =
        useState(DEFAULT_FILTERS);


    /* ============================================================
       LOAD RISK ASSESSMENTS
    ============================================================ */

    const loadRisks = useCallback(
        async (
            currentPage = 0,
            currentPageSize = pageSize,
        ) => {

            try {

                setLoading(true);
                setError("");

                const response =
                    await getRiskAssessments({
                        ...filters,
                        page: currentPage,
                        size: currentPageSize,
                    });

                const pageData =
                    extractPageData(response);

                const content =
                    pageData?.content ??
                    pageData?.items ??
                    [];

                const safeRisks =
                    Array.isArray(content)
                        ? content
                        : [];

                setRisks(safeRisks);

                setTotalElements(
                    Number(
                        pageData?.totalElements ?? 0,
                    ),
                );

                setTotalPages(
                    Number(
                        pageData?.totalPages ?? 0,
                    ),
                );

                setFirst(
                    Boolean(
                        pageData?.first ??
                        currentPage === 0,
                    ),
                );

                setLast(
                    Boolean(
                        pageData?.last ??
                        (
                            Number(
                                pageData?.totalPages ?? 0,
                            ) <= currentPage + 1
                        ),
                    ),
                );

            } catch (requestError) {

                console.error(
                    "Failed to load risk assessments:",
                    requestError,
                );

                setRisks([]);

                setTotalElements(0);
                setTotalPages(0);

                setError(
                    getErrorMessage(
                        requestError,
                        "Unable to load collision risk assessments.",
                    ),
                );

            } finally {

                setLoading(false);
            }

        },
        [
            filters,
            pageSize,
        ],
    );


    /* ============================================================
       LOAD SUMMARY
       
       IMPORTANT:
       The Risk API is paginated.

       Therefore the summary must NOT be calculated only from
       the current 10 table records.

       Until a dedicated analytics endpoint exists, we query the
       backend for counts for each risk level using size=1 and
       read totalElements from each response.
    ============================================================ */

    const loadSummary = useCallback(
        async () => {

            try {

                setSummaryLoading(true);

                const baseFilters = {
                    ...filters,
                    riskLevel: "",
                    page: 0,
                    size: 1,
                };


                const [
                    totalResponse,
                    criticalResponse,
                    highResponse,
                    mediumResponse,
                    lowResponse,
                ] = await Promise.all([
                    getRiskAssessments(
                        baseFilters,
                    ),

                    getRiskAssessments({
                        ...baseFilters,
                        riskLevel: "CRITICAL",
                    }),

                    getRiskAssessments({
                        ...baseFilters,
                        riskLevel: "HIGH",
                    }),

                    getRiskAssessments({
                        ...baseFilters,
                        riskLevel: "MEDIUM",
                    }),

                    getRiskAssessments({
                        ...baseFilters,
                        riskLevel: "LOW",
                    }),
                ]);


                const totalData =
                    extractPageData(
                        totalResponse,
                    );

                const criticalData =
                    extractPageData(
                        criticalResponse,
                    );

                const highData =
                    extractPageData(
                        highResponse,
                    );

                const mediumData =
                    extractPageData(
                        mediumResponse,
                    );

                const lowData =
                    extractPageData(
                        lowResponse,
                    );


                setSummary({
                    total: Number(
                        totalData?.totalElements ?? 0,
                    ),

                    critical: Number(
                        criticalData?.totalElements ?? 0,
                    ),

                    high: Number(
                        highData?.totalElements ?? 0,
                    ),

                    medium: Number(
                        mediumData?.totalElements ?? 0,
                    ),

                    low: Number(
                        lowData?.totalElements ?? 0,
                    ),
                });

            } catch (requestError) {

                console.error(
                    "Failed to load risk summary:",
                    requestError,
                );

                /*
                 * Do not destroy the table when summary
                 * loading fails.
                 */
                setSummary(
                    EMPTY_SUMMARY,
                );

            } finally {

                setSummaryLoading(false);
            }

        },
        [
            filters,
        ],
    );


    /* ============================================================
       INITIAL / FILTERED DATA LOAD
    ============================================================ */

    useEffect(() => {

        loadRisks(
            page,
            pageSize,
        );

    }, [
        loadRisks,
        page,
        pageSize,
    ]);


    /* ============================================================
       SUMMARY LOAD
    ============================================================ */

    useEffect(() => {

        loadSummary();

    }, [
        loadSummary,
    ]);


    /* ============================================================
       LATEST ASSESSMENT
    ============================================================ */

    const latestAssessment =
        useMemo(() => {

            if (!risks.length) {
                return null;
            }

            return [...risks].sort(
                (firstRisk, secondRisk) => {

                    const firstDate =
                        new Date(
                            firstRisk?.assessedAt ??
                            firstRisk?.createdAt ??
                            0,
                        ).getTime();

                    const secondDate =
                        new Date(
                            secondRisk?.assessedAt ??
                            secondRisk?.createdAt ??
                            0,
                        ).getTime();

                    return secondDate - firstDate;
                },
            )[0];

        }, [
            risks,
        ]);


    /* ============================================================
       ANALYZE NEW RISK
    ============================================================ */

    const handleAnalyzeRisk =
        useCallback(
            async ({
                satelliteId,
                debrisId,
            }) => {

                try {

                    setAnalyzing(true);
                    setError("");

                    await analyzeRisk({
                        satelliteId,
                        debrisId,
                    });

                    /*
                     * New assessment has been created.
                     *
                     * Return the table to page 1.
                     */
                    setPage(0);

                    /*
                     * The page effect will reload:
                     *
                     * 1. risk table
                     * 2. summary
                     */

                } catch (requestError) {

                    console.error(
                        "Risk analysis failed:",
                        requestError,
                    );

                    setError(
                        getErrorMessage(
                            requestError,
                            "Unable to analyze collision risk.",
                        ),
                    );

                } finally {

                    setAnalyzing(false);
                }

            },
            [],
        );


    /* ============================================================
       FILTER CHANGE
    ============================================================ */

    const handleFilterChange =
        useCallback(
            (
                name,
                value,
            ) => {

                setPage(0);

                setFilters(
                    (currentFilters) => ({
                        ...currentFilters,
                        [name]: value,
                    }),
                );
            },
            [],
        );


    /* ============================================================
       CLEAR FILTERS
    ============================================================ */

    const handleClearFilters =
        useCallback(
            () => {

                setPage(0);

                setFilters({
                    ...DEFAULT_FILTERS,
                });

            },
            [],
        );


    /* ============================================================
       PAGE CHANGE
    ============================================================ */

    const handlePageChange =
        useCallback(
            (nextPage) => {

                const safePage =
                    Number(nextPage);

                if (
                    !Number.isInteger(
                        safePage,
                    )
                ) {
                    return;
                }

                if (safePage < 0) {
                    return;
                }

                if (
                    totalPages > 0 &&
                    safePage >= totalPages
                ) {
                    return;
                }

                setPage(safePage);

            },
            [
                totalPages,
            ],
        );


    /* ============================================================
       PAGE SIZE CHANGE
    ============================================================ */

    const handlePageSizeChange =
        useCallback(
            (nextSize) => {

                const numericSize =
                    Number(nextSize);

                if (
                    !Number.isFinite(
                        numericSize,
                    ) ||
                    numericSize <= 0
                ) {
                    return;
                }

                setPageSize(
                    numericSize,
                );

                setPage(0);

            },
            [],
        );


    /* ============================================================
       VIEW RISK
    ============================================================ */

    const handleViewRisk =
        useCallback(
            (risk) => {

                if (!risk?.id) {
                    return;
                }

                navigate(
                    `/app/risks/${risk.id}`,
                );

            },
            [
                navigate,
            ],
        );


    /* ============================================================
       RENDER
    ============================================================ */

    return (
        <main
            className="
                min-h-screen
                w-full
                bg-[#020914]
                text-slate-100
                font-['Inter']
            "
        >

            <div
                className="
                    mx-auto
                    w-full
                    max-w-[1800px]
                    space-y-4
                    px-3
                    py-4
                    sm:px-4
                    lg:px-5
                    xl:px-6
                "
            >

                {/* =================================================
                    ERROR BANNER
                ================================================= */}

                {error && (
                    <section
                        role="alert"
                        className="
                            flex
                            items-center
                            justify-between
                            gap-4
                            rounded-xl
                            border
                            border-red-400/20
                            bg-red-500/[0.06]
                            px-4
                            py-3
                            text-xs
                            text-red-300
                        "
                    >

                        <span>
                            {error}
                        </span>

                        <button
                            type="button"
                            onClick={() => setError("")}
                            className="
                                shrink-0
                                rounded-md
                                px-2
                                py-1
                                text-red-300
                                transition
                                hover:bg-red-400/10
                            "
                        >
                            Dismiss
                        </button>

                    </section>
                )}


                {/* =================================================
                    HERO
                ================================================= */}

                <RiskHero
                    totalRisks={summary.total}
                    criticalRisks={summary.critical}
                    loading={
                        loading ||
                        summaryLoading
                    }
                />


                {/* =================================================
                    SUMMARY + ANALYZE
                ================================================= */}

                <section
                    className="
                        grid
                        grid-cols-1
                        gap-4
                        xl:grid-cols-[minmax(0,1fr)_340px]
                    "
                >

                    <RiskSummaryCards
                        summary={summary}
                        loading={summaryLoading}
                    />

                    <AnalyzeRiskPanel
                        loading={analyzing}
                        onAnalyze={
                            handleAnalyzeRisk
                        }
                    />

                </section>


                {/* =================================================
                    ANALYTICS
                ================================================= */}

                <section
                    className="
                        grid
                        grid-cols-1
                        gap-4
                        xl:grid-cols-[0.9fr_1.45fr_1fr]
                    "
                >

                    <RiskLevelDistribution
                        risks={risks}
                        summary={summary}
                    />

                    <RiskAssessmentTrend
                        risks={risks}
                    />

                    <LatestRiskAssessment
                        assessment={
                            latestAssessment
                        }
                    />

                </section>


                {/* =================================================
                    RISK OPERATIONS TABLE
                ================================================= */}

                <section
                    className="
                        overflow-hidden
                        rounded-2xl
                        border
                        border-white/[0.07]
                        bg-[#030d1b]/80
                        shadow-[0_18px_60px_rgba(0,0,0,0.22)]
                        backdrop-blur-xl
                    "
                >

                    {/* ------------------------------------------------
                        TOOLBAR
                    ------------------------------------------------ */}

                    <RiskToolbar
                        filters={filters}
                        onFilterChange={
                            handleFilterChange
                        }
                        onClear={
                            handleClearFilters
                        }
                        totalElements={
                            totalElements
                        }
                    />


                    {/* ------------------------------------------------
                        TABLE
                    ------------------------------------------------ */}

                    <RiskTable
                        risks={risks}
                        loading={loading}
                        error={error}
                        pageNumber={page}
                        pageSize={pageSize}
                        totalElements={
                            totalElements
                        }
                        totalPages={
                            totalPages
                        }
                        first={first}
                        last={last}
                        onPageChange={
                            handlePageChange
                        }
                        onViewRisk={
                            handleViewRisk
                        }
                    />

                </section>

            </div>

        </main>
    );
};


export default RiskOverviewPage;