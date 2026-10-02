import {
    FiChevronLeft,
    FiChevronRight,
    FiChevronsLeft,
    FiChevronsRight,
} from "react-icons/fi";

/**
 * ================================================================
 * OrbitGuard AI — Risk Pagination
 * ================================================================
 *
 * RESPONSIBILITY
 * ------------------------------------------------
 * Presentation-only pagination control for the Risk module.
 *
 * DATA FLOW
 * ------------------------------------------------
 *
 * RiskOverviewPage
 *        ↓
 * pagination state
 *        ↓
 * RiskPagination
 *        ↓
 * onPageChange(page)
 *
 * IMPORTANT
 * ------------------------------------------------
 * - No API calls.
 * - No risk calculations.
 * - No backend data fetching.
 * - Page index is treated as ZERO-BASED.
 * - Backend remains the source of truth.
 * - Designed to work with Spring Data pagination.
 *
 * Expected backend pagination shape:
 *
 * {
 *   content: [...],
 *   pageNumber: 0,
 *   pageSize: 10,
 *   totalElements: 42,
 *   totalPages: 5,
 *   first: true,
 *   last: false
 * }
 *
 * If your PagedResponse uses different property names,
 * normalize them in the parent before passing them here.
 * ================================================================
 */


/* ================================================================
   CONSTANTS
================================================================ */

const DEFAULT_PAGE_SIZE = 10;


/* ================================================================
   SMALL UI COMPONENTS
================================================================ */

/**
 * Pagination button.
 */
const PaginationButton = ({
    children,
    onClick,
    disabled = false,
    active = false,
    ariaLabel,
}) => {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            aria-label={ariaLabel}
            aria-current={active ? "page" : undefined}
            className={`
                inline-flex
                h-8
                min-w-8
                items-center
                justify-center
                rounded-lg
                border
                px-2
                font-['Inter']
                text-[10px]
                font-medium
                transition-all
                duration-200

                ${
                    active
                        ? `
                            border-cyan-400/40
                            bg-cyan-400/[0.12]
                            text-cyan-300
                            shadow-[0_0_18px_rgba(34,211,238,0.08)]
                        `
                        : `
                            border-white/[0.06]
                            bg-white/[0.02]
                            text-slate-400
                            hover:border-cyan-400/20
                            hover:bg-cyan-400/[0.05]
                            hover:text-cyan-300
                        `
                }

                ${
                    disabled
                        ? `
                            cursor-not-allowed
                            border-white/[0.03]
                            bg-white/[0.01]
                            text-slate-700
                            opacity-60
                            hover:border-white/[0.03]
                            hover:bg-white/[0.01]
                            hover:text-slate-700
                        `
                        : ""
                }
            `}
        >
            {children}
        </button>
    );
};


/**
 * Ellipsis separator.
 */
const PaginationEllipsis = () => {
    return (
        <span
            aria-hidden="true"
            className="
                inline-flex
                h-8
                min-w-6
                items-center
                justify-center
                font-['Inter']
                text-[10px]
                text-slate-600
            "
        >
            …
        </span>
    );
};


/* ================================================================
   PAGE RANGE
================================================================ */

/**
 * Creates a compact page-number range.
 *
 * Page numbers displayed to the user are ONE-BASED.
 * Backend page numbers remain ZERO-BASED.
 */
const buildPageRange = (
    currentPage,
    totalPages,
) => {
    if (totalPages <= 1) {
        return [0];
    }

    /*
     * Small result set.
     */
    if (totalPages <= 5) {
        return Array.from(
            { length: totalPages },
            (_, index) => index,
        );
    }

    const pages = [];

    /*
     * Always show first page.
     */
    pages.push(0);

    /*
     * Add left ellipsis when current page
     * is sufficiently far from the beginning.
     */
    if (currentPage > 2) {
        pages.push("left-ellipsis");
    }

    /*
     * Current page neighborhood.
     */
    const start = Math.max(
        1,
        currentPage - 1,
    );

    const end = Math.min(
        totalPages - 2,
        currentPage + 1,
    );

    for (
        let page = start;
        page <= end;
        page += 1
    ) {
        if (!pages.includes(page)) {
            pages.push(page);
        }
    }

    /*
     * Add right ellipsis when current page
     * is sufficiently far from the end.
     */
    if (currentPage < totalPages - 3) {
        pages.push("right-ellipsis");
    }

    /*
     * Always show final page.
     */
    if (!pages.includes(totalPages - 1)) {
        pages.push(totalPages - 1);
    }

    return pages;
};


/* ================================================================
   COMPONENT
================================================================ */

/**
 * RiskPagination
 *
 * @param {number} currentPage
 * Zero-based current page.
 *
 * @param {number} totalPages
 * Total number of backend pages.
 *
 * @param {number} totalElements
 * Total number of risk assessments.
 *
 * @param {number} pageSize
 * Number of records per page.
 *
 * @param {function} onPageChange
 * Callback receiving ZERO-BASED page index.
 *
 * @param {boolean} loading
 * Disables navigation while the risk list is loading.
 */
const RiskPagination = ({
    currentPage = 0,
    totalPages = 0,
    totalElements = 0,
    pageSize = DEFAULT_PAGE_SIZE,
    onPageChange,
    loading = false,
}) => {

    /* ============================================================
       NORMALIZE PAGINATION VALUES
    ============================================================ */

    const safeCurrentPage = Math.max(
        0,
        Number(currentPage) || 0,
    );

    const safeTotalPages = Math.max(
        0,
        Number(totalPages) || 0,
    );

    const safeTotalElements = Math.max(
        0,
        Number(totalElements) || 0,
    );

    const safePageSize = Math.max(
        1,
        Number(pageSize) || DEFAULT_PAGE_SIZE,
    );


    /* ============================================================
       EMPTY / SINGLE PAGE
    ============================================================ */

    if (safeTotalElements === 0) {
        return null;
    }


    /*
     * Calculate visible record range.
     *
     * Example:
     * page = 1
     * pageSize = 10
     * total = 42
     *
     * Showing 11–20 of 42
     */
    const firstRecord =
        safeCurrentPage * safePageSize + 1;

    const lastRecord = Math.min(
        (safeCurrentPage + 1) * safePageSize,
        safeTotalElements,
    );


    /* ============================================================
       NAVIGATION STATE
    ============================================================ */

    const isFirstPage =
        safeCurrentPage <= 0;

    const isLastPage =
        safeTotalPages === 0 ||
        safeCurrentPage >= safeTotalPages - 1;


    /*
     * Protect against stale pagination data.
     */
    const goToPage = (page) => {

        if (loading) {
            return;
        }

        if (
            page < 0 ||
            page >= safeTotalPages
        ) {
            return;
        }

        if (page === safeCurrentPage) {
            return;
        }

        if (typeof onPageChange !== "function") {
            return;
        }

        onPageChange(page);
    };


    /* ============================================================
       PAGE RANGE
    ============================================================ */

    const pageRange = buildPageRange(
        safeCurrentPage,
        safeTotalPages,
    );


    /* ============================================================
       RENDER
    ============================================================ */

    return (
        <div
            className="
                border-t
                border-white/[0.05]
                px-4
                py-4
                sm:px-5
            "
        >

            <div
                className="
                    flex
                    flex-col
                    gap-4
                    lg:flex-row
                    lg:items-center
                    lg:justify-between
                "
            >

                {/* =================================================
                    RECORD INFORMATION
                ================================================= */}

                <div
                    className="
                        flex
                        min-w-0
                        items-center
                        gap-2
                    "
                >

                    <span
                        className="
                            font-['Orbitron']
                            text-[9px]
                            font-semibold
                            uppercase
                            tracking-[0.12em]
                            text-slate-500
                        "
                    >
                        Records
                    </span>

                    <span
                        className="
                            h-1
                            w-1
                            rounded-full
                            bg-cyan-400/50
                        "
                    />

                    <span
                        className="
                            font-['Inter']
                            text-[10px]
                            text-slate-500
                        "
                    >
                        <span className="font-medium text-slate-300">
                            {firstRecord.toLocaleString("en-IN")}
                        </span>

                        <span className="mx-1 text-slate-700">
                            –
                        </span>

                        <span className="font-medium text-slate-300">
                            {lastRecord.toLocaleString("en-IN")}
                        </span>

                        <span className="mx-1 text-slate-700">
                            /
                        </span>

                        <span>
                            {safeTotalElements.toLocaleString("en-IN")}
                        </span>
                    </span>

                </div>


                {/* =================================================
                    PAGINATION CONTROLS
                ================================================= */}

                <div
                    className="
                        flex
                        flex-wrap
                        items-center
                        gap-1.5
                    "
                    role="navigation"
                    aria-label="Risk assessment pagination"
                >

                    {/* First */}

                    <PaginationButton
                        ariaLabel="Go to first page"
                        disabled={
                            loading ||
                            isFirstPage
                        }
                        onClick={() => goToPage(0)}
                    >
                        <FiChevronsLeft size={13} />
                    </PaginationButton>


                    {/* Previous */}

                    <PaginationButton
                        ariaLabel="Go to previous page"
                        disabled={
                            loading ||
                            isFirstPage
                        }
                        onClick={() =>
                            goToPage(
                                safeCurrentPage - 1,
                            )
                        }
                    >
                        <FiChevronLeft size={13} />
                    </PaginationButton>


                    {/* Page numbers */}

                    <div
                        className="
                            flex
                            items-center
                            gap-1
                        "
                    >

                        {pageRange.map(
                            (page, index) => {

                                if (
                                    page ===
                                    "left-ellipsis"
                                ) {
                                    return (
                                        <PaginationEllipsis
                                            key={`left-${index}`}
                                        />
                                    );
                                }

                                if (
                                    page ===
                                    "right-ellipsis"
                                ) {
                                    return (
                                        <PaginationEllipsis
                                            key={`right-${index}`}
                                        />
                                    );
                                }

                                return (
                                    <PaginationButton
                                        key={page}
                                        active={
                                            page ===
                                            safeCurrentPage
                                        }
                                        disabled={loading}
                                        ariaLabel={`Go to page ${
                                            page + 1
                                        }`}
                                        onClick={() =>
                                            goToPage(page)
                                        }
                                    >
                                        {page + 1}
                                    </PaginationButton>
                                );
                            },
                        )}

                    </div>


                    {/* Next */}

                    <PaginationButton
                        ariaLabel="Go to next page"
                        disabled={
                            loading ||
                            isLastPage
                        }
                        onClick={() =>
                            goToPage(
                                safeCurrentPage + 1,
                            )
                        }
                    >
                        <FiChevronRight size={13} />
                    </PaginationButton>


                    {/* Last */}

                    <PaginationButton
                        ariaLabel="Go to last page"
                        disabled={
                            loading ||
                            isLastPage
                        }
                        onClick={() =>
                            goToPage(
                                safeTotalPages - 1,
                            )
                        }
                    >
                        <FiChevronsRight size={13} />
                    </PaginationButton>

                </div>

            </div>

        </div>
    );
};

export default RiskPagination;