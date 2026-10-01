import { useCallback, useMemo, useState } from "react";

import DebrisHero from "../components/DebrisHero";
import DebrisOverviewStats from "../components/DebrisStats";
import DebrisToolbar from "../components/DebrisToolbar";
import DebrisGrid from "../components/DebrisTable";

/**
 * ================================================================
 * OrbitGuard AI - Debris Overview Page
 * ================================================================
 *
 * UI / presentation orchestration layer for the Debris Registry.
 *
 * IMPORTANT:
 * ---------------------------------------------------------------
 * This is the FIRST UI phase for the Debris module.
 *
 * Backend connection is intentionally NOT implemented yet.
 *
 * The visual structure is designed to follow the existing
 * Satellite Registry page.
 *
 * Satellite UI = visual source of truth.
 *
 * Later phase:
 * - Connect debrisService
 * - Connect Spring Boot pagination
 * - Connect search
 * - Connect sorting
 * - Connect CelesTrak synchronization
 * - Connect real debris statistics
 *
 * Current phase:
 * - UI only
 * - Same layout language as Satellite Registry
 * - No dummy backend data
 * ================================================================
 */

/* ================================================================
   UI CONFIGURATION
================================================================ */

/**
 * Initial UI page.
 *
 * We keep the same 0-based page convention that will later be
 * used by the Spring Boot backend.
 */
const DEFAULT_PAGE = 0;

/**
 * Initial rows per page.
 */
const DEFAULT_PAGE_SIZE = 5;

/**
 * Available rows-per-page options.
 */
const PAGE_SIZE_OPTIONS = [5, 10, 25, 50];

/**
 * Default sorting configuration.
 *
 * These are UI values for now.
 * They will be connected to the backend later.
 */
const DEFAULT_SORT_BY = "createdAt";
const DEFAULT_SORT_DIRECTION = "desc";

/* ================================================================
   PAGINATION HELPERS
================================================================ */

/**
 * Build compact pagination numbers.
 *
 * UI page numbers are 1-based.
 * Backend page index will remain 0-based.
 */
const buildPageNumbers = (currentPage, totalPages) => {
  if (totalPages <= 0) {
    return [];
  }

  if (totalPages <= 7) {
    return Array.from(
      { length: totalPages },
      (_, index) => index + 1,
    );
  }

  const current = currentPage + 1;

  const pages = [];

  /* ------------------------------------------------------------
     Always show first page
  ------------------------------------------------------------ */

  pages.push(1);

  /* ------------------------------------------------------------
     Current page near beginning
  ------------------------------------------------------------ */

  if (current <= 4) {
    pages.push(2);
    pages.push(3);
    pages.push(4);
    pages.push(5);
    pages.push("...");
    pages.push(totalPages);

    return pages;
  }

  /* ------------------------------------------------------------
     Current page near end
  ------------------------------------------------------------ */

  if (current >= totalPages - 3) {
    pages.push("...");
    pages.push(totalPages - 4);
    pages.push(totalPages - 3);
    pages.push(totalPages - 2);
    pages.push(totalPages - 1);
    pages.push(totalPages);

    return pages;
  }

  /* ------------------------------------------------------------
     Current page in middle
  ------------------------------------------------------------ */

  pages.push("...");
  pages.push(current - 1);
  pages.push(current);
  pages.push(current + 1);
  pages.push("...");
  pages.push(totalPages);

  return pages;
};

/* ================================================================
   COMPONENT
================================================================ */

const DebrisOverviewPage = () => {
  /* ============================================================
     DEBRIS UI STATE
  ============================================================ */

  /**
   * No backend data yet.
   *
   * This will later be populated by debrisService.
   */
  const [debris, setDebris] = useState([]);

  /**
   * UI loading state.
   *
   * Kept here so DebrisGrid can already support the same loading
   * behavior as SatelliteGrid.
   */
  const [isLoading, setIsLoading] = useState(false);

  /**
   * CelesTrak synchronization state.
   *
   * Backend connection will be added later.
   */
  const [isSyncing, setIsSyncing] = useState(false);

  /**
   * Error state.
   */
  const [errorMessage, setErrorMessage] = useState("");

  /* ============================================================
     SEARCH / SORT STATE
  ============================================================ */

  const [searchQuery, setSearchQuery] = useState("");

  const [sortBy, setSortBy] = useState(DEFAULT_SORT_BY);

  const [sortDirection, setSortDirection] = useState(
    DEFAULT_SORT_DIRECTION,
  );

  /* ============================================================
     PAGINATION STATE
  ============================================================ */

  const [page, setPage] = useState(DEFAULT_PAGE);

  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  /**
   * Pagination metadata.
   *
   * These values will later come directly from the backend.
   */
  const [pagination] = useState({
    totalElements: 0,
    totalPages: 0,
    currentPage: 0,
    pageSize: DEFAULT_PAGE_SIZE,
  });

  /* ============================================================
     PAGE NUMBERS
  ============================================================ */

  const pageNumbers = useMemo(
    () =>
      buildPageNumbers(
        pagination.currentPage,
        pagination.totalPages,
      ),
    [pagination.currentPage, pagination.totalPages],
  );

  /* ============================================================
     SEARCH
  ============================================================ */

  const handleSearchChange = useCallback((value) => {
    setSearchQuery(value);

    /**
     * New search starts from first page.
     */
    setPage(DEFAULT_PAGE);
  }, []);

  /* ============================================================
     SORT
  ============================================================ */

  const handleSortChange = useCallback((value) => {
    setSortBy(value);

    /**
     * New sorting starts from first page.
     */
    setPage(DEFAULT_PAGE);
  }, []);

  /* ============================================================
     SORT DIRECTION
  ============================================================ */

  const handleSortDirectionChange = useCallback((value) => {
    setSortDirection(value);

    /**
     * New sorting direction starts from first page.
     */
    setPage(DEFAULT_PAGE);
  }, []);

  /* ============================================================
     ROWS PER PAGE
  ============================================================ */

  const handlePageSizeChange = useCallback((event) => {
    const nextPageSize = Number(event.target.value);

    if (!PAGE_SIZE_OPTIONS.includes(nextPageSize)) {
      return;
    }

    setPageSize(nextPageSize);
    setPage(DEFAULT_PAGE);
  }, []);

  /* ============================================================
     PAGE NAVIGATION
  ============================================================ */

  const handlePageChange = useCallback(
    (nextPage) => {
      if (!Number.isInteger(nextPage)) {
        return;
      }

      if (nextPage < 0) {
        return;
      }

      if (
        pagination.totalPages > 0 &&
        nextPage >= pagination.totalPages
      ) {
        return;
      }

      setPage(nextPage);
    },
    [pagination.totalPages],
  );

  /* ============================================================
     PREVIOUS PAGE
  ============================================================ */

  const handlePreviousPage = useCallback(() => {
    setPage((currentPage) =>
      Math.max(DEFAULT_PAGE, currentPage - 1),
    );
  }, []);

  /* ============================================================
     NEXT PAGE
  ============================================================ */

  const handleNextPage = useCallback(() => {
    setPage((currentPage) => {
      if (pagination.totalPages <= 0) {
        return currentPage;
      }

      return Math.min(
        pagination.totalPages - 1,
        currentPage + 1,
      );
    });
  }, [pagination.totalPages]);

  /* ============================================================
     RESET FILTERS
  ============================================================ */

  const handleResetFilters = useCallback(() => {
    setSearchQuery("");

    setSortBy(DEFAULT_SORT_BY);

    setSortDirection(DEFAULT_SORT_DIRECTION);

    setPage(DEFAULT_PAGE);
  }, []);

  /* ============================================================
     CELESTRAK SYNCHRONIZATION
  ============================================================ */

  /**
   * UI-only for now.
   *
   * Real debris synchronization will be connected after the
   * complete Debris UI is finished.
   */
  const handleSync = useCallback(async () => {
    if (isSyncing) {
      return;
    }

    setIsSyncing(true);
    setErrorMessage("");

    /**
     * Backend connection intentionally omitted.
     *
     * Later:
     *
     * await debrisService.synchronizeDebris(...);
     *
     * then reload the debris registry.
     */

    setTimeout(() => {
      setIsSyncing(false);
    }, 700);
  }, [isSyncing]);

  /* ============================================================
     VIEW DEBRIS
  ============================================================ */

  const handleViewDebris = useCallback((debrisObject) => {
    if (import.meta.env.DEV) {
      console.info(
        "[DebrisOverviewPage] View debris:",
        debrisObject,
      );
    }
  }, []);

  /* ============================================================
     EDIT DEBRIS
  ============================================================ */

  const handleEditDebris = useCallback((debrisObject) => {
    if (import.meta.env.DEV) {
      console.info(
        "[DebrisOverviewPage] Edit debris:",
        debrisObject,
      );
    }
  }, []);

  /* ============================================================
     DELETE DEBRIS
  ============================================================ */

  const handleDeleteDebris = useCallback(async (debrisObject) => {
    if (!debrisObject?.id) {
      return;
    }

    /**
     * Backend delete connection will be added later.
     */
    if (import.meta.env.DEV) {
      console.info(
        "[DebrisOverviewPage] Delete debris requested:",
        debrisObject,
      );
    }
  }, []);

  /* ============================================================
     OVERVIEW STATISTICS
  ============================================================ */

  /**
   * UI structure only.
   *
   * Real statistics will be connected from the backend later.
   *
   * We intentionally do NOT calculate statistics from `debris`
   * because the array will eventually represent only the current
   * server-side page.
   */
  const overviewStats = useMemo(
    () => ({
      total: 0,
      active: 0,
      inactive: 0,
      decommissioned: 0,
    }),
    [],
  );

  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <main
      className="
        relative
        min-h-screen
        overflow-x-hidden
        bg-transparent
        text-white
      "
    >
      {/* ====================================================
          LOCAL PAGE ATMOSPHERE
      ===================================================== */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-x-0
          top-0
          z-0
          h-[700px]
          overflow-hidden
        "
      >
        <div
          className="
            absolute
            left-[18%]
            top-[8%]
            h-[280px]
            w-[480px]
            rounded-full
            bg-cyan-400/[0.025]
            blur-[120px]
          "
        />

        <div
          className="
            absolute
            right-[8%]
            top-[18%]
            h-[320px]
            w-[360px]
            rounded-full
            bg-blue-500/[0.02]
            blur-[130px]
          "
        />

        <div
          className="
            absolute
            inset-x-0
            top-0
            h-[220px]
            bg-gradient-to-b
            from-[#020617]/20
            to-transparent
          "
        />
      </div>

      {/* ====================================================
          PAGE CONTENT
      ===================================================== */}

      <div
        className="
          relative
          z-10
          mx-auto
          w-full
        "
      >
        {/* =================================================
            DEBRIS HERO
        ================================================== */}

        <section
          aria-labelledby="debris-page-heading"
          className="
            mx-auto
            w-full
            max-w-[1680px]
            px-3
            pt-3
            sm:px-5
            sm:pt-4
            lg:px-7
            xl:px-8
          "
        >
          <DebrisHero />
        </section>

        {/* =================================================
            ERROR MESSAGE
        ================================================== */}

        {errorMessage && (
          <section
            className="
              mx-auto
              w-full
              max-w-[1680px]
              px-3
              pt-3
              sm:px-5
              lg:px-7
              xl:px-8
            "
          >
            <div
              role="alert"
              className="
                rounded-xl
                border
                border-red-500/20
                bg-red-500/5
                px-4
                py-3
                font-['Inter']
                text-xs
                text-red-300
              "
            >
              {errorMessage}
            </div>
          </section>
        )}

        {/* =================================================
            OVERVIEW STATISTICS
        ================================================== */}

        <section
          aria-labelledby="debris-overview-stats"
          className="
            mx-auto
            w-full
            max-w-[1680px]
            px-3
            pt-3
            sm:px-5
            lg:px-7
            xl:px-8
          "
        >
          <h2
            id="debris-overview-stats"
            className="sr-only"
          >
            Debris Overview Statistics
          </h2>

          <div
            className="
              rounded-2xl
              border
              border-white/[0.045]
              bg-[#020817]/20
              p-1
              backdrop-blur-[1px]
            "
          >
            <DebrisOverviewStats stats={overviewStats} />
          </div>
        </section>

        {/* =================================================
            DEBRIS EXPLORER
        ================================================== */}

        <section
          aria-labelledby="debris-explorer-heading"
          className="
            mx-auto
            w-full
            max-w-[1680px]
            px-3
            pb-16
            pt-7
            sm:px-5
            sm:pb-20
            sm:pt-9
            lg:px-7
            xl:px-8
          "
        >
          {/* =================================================
              SECTION HEADER
          ================================================== */}

          <div className="mb-5">
            <div className="mb-2 flex items-center gap-3">
              <span
                className="
                  h-px
                  w-8
                  bg-cyan-400/80
                "
              />

              <span
                className="
                  font-['Orbitron']
                  text-[9px]
                  font-semibold
                  uppercase
                  tracking-[0.3em]
                  text-cyan-300/80
                  sm:text-[10px]
                "
              >
                Orbital Intelligence
              </span>
            </div>

            <h2
              id="debris-explorer-heading"
              className="
                font-['Orbitron']
                text-xl
                font-semibold
                tracking-tight
                text-white
                sm:text-2xl
                lg:text-3xl
              "
            >
              Debris Explorer
            </h2>

            <p
              className="
                mt-1.5
                max-w-2xl
                font-['Inter']
                text-xs
                leading-5
                text-slate-400
                sm:text-sm
                sm:leading-6
              "
            >
              Explore tracked orbital debris, orbital parameters,
              TLE-derived telemetry and object status across the
              OrbitGuard registry.
            </p>
          </div>

          {/* =================================================
              TOOLBAR
          ================================================== */}

          <div
            className="
              rounded-2xl
              border
              border-white/[0.055]
              bg-[#020817]/35
              p-2
              backdrop-blur-md
              sm:p-2.5
            "
          >
            <DebrisToolbar
              searchQuery={searchQuery}
              onSearchChange={handleSearchChange}
              sortBy={sortBy}
              onSortChange={handleSortChange}
              sortDirection={sortDirection}
              onSortDirectionChange={handleSortDirectionChange}
              onSync={handleSync}
              isSyncing={isSyncing}
            />
          </div>

          {/* =================================================
              DEBRIS REGISTRY
          ================================================== */}

          <div className="mt-4">
            <DebrisGrid
              debris={debris}
              isLoading={isLoading}
              onViewDebris={handleViewDebris}
              onEditDebris={handleEditDebris}
              onDeleteDebris={handleDeleteDebris}
            />
          </div>

          {/* =================================================
              PAGINATION
          ================================================== */}

          {pagination.totalPages > 0 && (
            <div
              className="
                relative
                mt-4
                min-h-[58px]
                rounded-xl
                border
                border-slate-800/60
                bg-slate-950/30
                px-4
                py-3
                sm:px-5
              "
            >
              {/* =================================================
                  CENTERED PAGE NAVIGATION
              ================================================== */}

              <div
                className="
                  flex
                  w-full
                  items-center
                  justify-center
                "
                aria-label="Debris registry pagination"
              >
                {/* PREVIOUS */}

                <button
                  type="button"
                  disabled={pagination.currentPage <= 0}
                  onClick={handlePreviousPage}
                  aria-label="Previous page"
                  className="
                    flex
                    h-8
                    w-8
                    shrink-0
                    items-center
                    justify-center
                    rounded-md
                    border
                    border-slate-700/80
                    bg-slate-900/60
                    font-['Inter']
                    text-sm
                    font-medium
                    text-slate-300
                    transition-all
                    duration-200
                    hover:border-cyan-400/40
                    hover:bg-cyan-400/10
                    hover:text-cyan-300
                    disabled:cursor-not-allowed
                    disabled:opacity-35
                  "
                >
                  ‹
                </button>

                {/* PAGE NUMBERS */}

                <div
                  className="
                    mx-1
                    flex
                    items-center
                    gap-1
                  "
                >
                  {pageNumbers.map((pageNumber, index) => {
                    if (pageNumber === "...") {
                      return (
                        <span
                          key={`ellipsis-${index}`}
                          className="
                            flex
                            h-8
                            min-w-7
                            items-center
                            justify-center
                            px-1
                            font-['Inter']
                            text-[10px]
                            text-slate-600
                          "
                        >
                          …
                        </span>
                      );
                    }

                    const pageIndex = pageNumber - 1;

                    const isCurrentPage =
                      pagination.currentPage === pageIndex;

                    return (
                      <button
                        key={pageNumber}
                        type="button"
                        aria-label={`Go to page ${pageNumber}`}
                        aria-current={
                          isCurrentPage ? "page" : undefined
                        }
                        onClick={() =>
                          handlePageChange(pageIndex)
                        }
                        className={`
                          flex
                          h-8
                          min-w-8
                          items-center
                          justify-center
                          rounded-md
                          border
                          px-2
                          font-['Inter']
                          text-[10px]
                          font-medium
                          tabular-nums
                          transition-all
                          duration-200

                          ${
                            isCurrentPage
                              ? "border-cyan-400/50 bg-cyan-400/15 text-cyan-300 shadow-[0_0_14px_rgba(34,211,238,0.10)]"
                              : "border-transparent text-slate-400 hover:border-slate-700 hover:bg-slate-800/70 hover:text-slate-200"
                          }
                        `}
                      >
                        {pageNumber}
                      </button>
                    );
                  })}
                </div>

                {/* NEXT */}

                <button
                  type="button"
                  disabled={
                    pagination.currentPage >=
                    pagination.totalPages - 1
                  }
                  onClick={handleNextPage}
                  aria-label="Next page"
                  className="
                    flex
                    h-8
                    w-8
                    shrink-0
                    items-center
                    justify-center
                    rounded-md
                    border
                    border-slate-700/80
                    bg-slate-900/60
                    font-['Inter']
                    text-sm
                    font-medium
                    text-slate-300
                    transition-all
                    duration-200
                    hover:border-cyan-400/40
                    hover:bg-cyan-400/10
                    hover:text-cyan-300
                    disabled:cursor-not-allowed
                    disabled:opacity-35
                  "
                >
                  ›
                </button>
              </div>

              {/* =================================================
                  ROWS PER PAGE
              ================================================== */}

              <div
                className="
                  mt-3
                  flex
                  items-center
                  justify-center
                  gap-2
                  sm:absolute
                  sm:right-5
                  sm:top-1/2
                  sm:mt-0
                  sm:-translate-y-1/2
                  sm:justify-end
                "
              >
                <span
                  className="
                    font-['Inter']
                    text-[9px]
                    text-slate-500
                  "
                >
                  Rows per page
                </span>

                <div className="relative">
                  <select
                    value={pageSize}
                    onChange={handlePageSizeChange}
                    aria-label="Rows per page"
                    className="
                      h-8
                      min-w-[58px]
                      appearance-none
                      rounded-md
                      border
                      border-slate-700/80
                      bg-slate-900
                      px-3
                      pr-7
                      font-['Inter']
                      text-[10px]
                      font-medium
                      tabular-nums
                      text-slate-300
                      outline-none
                      transition-all
                      focus:border-cyan-400/40
                      focus:ring-1
                      focus:ring-cyan-400/20
                    "
                  >
                    {PAGE_SIZE_OPTIONS.map((option) => (
                      <option
                        key={option}
                        value={option}
                        className="
                          bg-slate-900
                          text-slate-200
                        "
                      >
                        {option}
                      </option>
                    ))}
                  </select>

                  <span
                    aria-hidden="true"
                    className="
                      pointer-events-none
                      absolute
                      right-2
                      top-1/2
                      -translate-y-1/2
                      font-['Inter']
                      text-[9px]
                      text-slate-500
                    "
                  >
                    ▼
                  </span>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* ====================================================
          EDGE ATMOSPHERE
      ===================================================== */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-y-0
          left-0
          z-0
          w-24
          bg-gradient-to-r
          from-cyan-400/[0.012]
          to-transparent
        "
      />

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-y-0
          right-0
          z-0
          w-24
          bg-gradient-to-l
          from-blue-500/[0.01]
          to-transparent
        "
      />
    </main>
  );
};

export default DebrisOverviewPage;