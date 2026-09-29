import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";

import SatelliteHero from "../components/SatelliteHero";
import SatelliteOverviewStats from "../components/SatelliteStats";
import SatelliteToolbar from "../components/SatelliteToolbar";
import SatelliteGrid from "../components/SatelliteTable";

import satelliteService from "../../../services/satelliteService";
import { getApiErrorMessage } from "../../../services/api";

/**
 * ================================================================
 * OrbitGuard AI - Satellite Overview Page
 * ================================================================
 *
 * Container / orchestration layer for the Satellite Registry.
 *
 * Responsibilities:
 * - Fetch satellite data
 * - Maintain search state
 * - Maintain sorting state
 * - Maintain server-side pagination
 * - Maintain rows-per-page state
 * - Trigger CelesTrak synchronization
 * - Provide data/actions to child components
 * - Build overview statistics from backend-supported data
 *
 * Backend source of truth:
 * SatelliteResponse + paginated satellite response metadata
 *
 * IMPORTANT:
 * - Pagination remains SERVER-SIDE.
 * - Spring Boot page index remains 0-based.
 * - UI displays page numbers as 1-based.
 * - No dummy satellite data is created here.
 * - The registry currently stores ACTIVE satellites only.
 *
 * CURRENT STATUS MODEL:
 * ---------------------------------------------------------------
 * The current backend does not expose an aggregate statistics
 * endpoint.
 *
 * Current database state:
 * - All stored satellites are ACTIVE.
 * - No INACTIVE satellites are currently stored.
 * - No DECOMMISSIONED satellites are currently stored.
 *
 * Therefore:
 *
 *   TOTAL          = backend totalElements
 *   ACTIVE         = backend totalElements
 *   INACTIVE       = 0
 *   DECOMMISSIONED = 0
 *
 * IMPORTANT FUTURE CHANGE:
 * When the backend supports aggregate mission-status counts,
 * replace buildOverviewStats() with those backend-provided counts.
 *
 * Do NOT fetch the entire satellite registry just to calculate
 * statistics. Pagination must remain server-side.
 * ================================================================
 */

/* ================================================================
   BACKEND CONFIGURATION
================================================================ */

/**
 * CelesTrak group used by the backend synchronization endpoint.
 */
const CELESTRAK_GROUP = "active";

/**
 * Spring Boot pagination is 0-based.
 */
const DEFAULT_PAGE = 0;

/**
 * Initial number of rows displayed.
 */
const DEFAULT_PAGE_SIZE = 5;

/**
 * Available rows-per-page options.
 */
const PAGE_SIZE_OPTIONS = [5, 10, 25, 50];

/**
 * Default backend sorting configuration.
 */
const DEFAULT_SORT_BY = "createdAt";
const DEFAULT_SORT_DIRECTION = "desc";

/* ================================================================
   PAGINATION HELPERS
================================================================ */

/**
 * Build a compact page-number sequence.
 *
 * Returned page numbers are 1-based because they are UI values.
 */
const buildPageNumbers = (currentPage, totalPages) => {
  if (totalPages <= 0) {
    return [];
  }

  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const current = currentPage + 1;

  const pages = [];

  /* ------------------------------------------------------------
     Always show first page
  ------------------------------------------------------------ */

  pages.push(1);

  /* ------------------------------------------------------------
     Current page is near beginning
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
     Current page is near end
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
     Current page is in the middle
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
   OVERVIEW STATISTICS
================================================================ */

/**
 * Build Satellite Registry overview statistics.
 *
 * IMPORTANT:
 * This function intentionally does NOT count `satellites`.
 *
 * `satellites` only contains the currently loaded backend page.
 * With a page size of 5, counting that array would incorrectly
 * produce ACTIVE = 5.
 *
 * The backend currently stores only ACTIVE satellites, so the
 * complete registry statistics are derived from totalElements.
 *
 * Future backend aggregate statistics should replace this helper.
 */
const buildOverviewStats = (totalElements) => {
  const total = Math.max(0, Number(totalElements) || 0);

  return {
    total,
    active: total,
    inactive: 0,
    decommissioned: 0,
  };
};

/* ================================================================
   COMPONENT
================================================================ */

const SatelliteOverviewPage = () => {
  /* ============================================================
     SATELLITE DATA
  ============================================================ */

  const [satellites, setSatellites] = useState([]);

  const [isLoading, setIsLoading] = useState(true);

  const [isSyncing, setIsSyncing] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");

  /* ============================================================
     SERVER-SIDE QUERY STATE
  ============================================================ */

  const [searchQuery, setSearchQuery] = useState("");

  const [sortBy, setSortBy] = useState(DEFAULT_SORT_BY);

  const [sortDirection, setSortDirection] = useState(DEFAULT_SORT_DIRECTION);

  /* ============================================================
     PAGINATION STATE
  ============================================================ */

  /**
   * Backend page index.
   *
   * IMPORTANT:
   * This remains 0-based.
   */
  const [page, setPage] = useState(DEFAULT_PAGE);

  /**
   * Rows displayed per page.
   */
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  /* ============================================================
     PAGINATION METADATA
  ============================================================ */

  const [pagination, setPagination] = useState({
    totalElements: 0,
    totalPages: 0,
    currentPage: 0,
    pageSize: DEFAULT_PAGE_SIZE,
  });

  /* ============================================================
     LOAD SATELLITES
  ============================================================ */

  const loadSatellites = useCallback(
    async ({
      targetPage = page,
      targetSearch = searchQuery,
      targetSortBy = sortBy,
      targetSortDirection = sortDirection,
      targetPageSize = pageSize,
      showLoading = true,
    } = {}) => {
      if (showLoading) {
        setIsLoading(true);
      }

      setErrorMessage("");

      try {
        const result = await satelliteService.getSatellites({
          page: targetPage,
          size: targetPageSize,
          sortBy: targetSortBy,
          direction: targetSortDirection,
          keyword: targetSearch,
        });

        /* --------------------------------------------------------
           BACKEND PAGINATION CONTENT
        -------------------------------------------------------- */

        const content = Array.isArray(result?.content) ? result.content : [];

        /*
         * IMPORTANT:
         *
         * This is only the CURRENT PAGE.
         *
         * Do not use this array to calculate global registry
         * statistics.
         */
        setSatellites(content);

        /* --------------------------------------------------------
           PAGINATION METADATA
        -------------------------------------------------------- */

        setPagination({
          totalElements: Number(result?.totalElements) || 0,

          totalPages: Number(result?.totalPages) || 0,

          currentPage: Number.isFinite(Number(result?.number))
            ? Number(result.number)
            : targetPage,

          pageSize: Number(result?.size) || targetPageSize,
        });
      } catch (error) {
        const message = getApiErrorMessage(
          error,
          "Unable to load satellite registry.",
        );

        setErrorMessage(message);

        setSatellites([]);

        setPagination({
          totalElements: 0,
          totalPages: 0,
          currentPage: targetPage,
          pageSize: targetPageSize,
        });

        if (import.meta.env.DEV) {
          console.error(
            "[SatelliteOverviewPage] Failed to load satellites:",
            error,
          );
        }
      } finally {
        if (showLoading) {
          setIsLoading(false);
        }
      }
    },
    [page, pageSize, searchQuery, sortBy, sortDirection],
  );

  /* ============================================================
     INITIAL / QUERY DATA LOAD
  ============================================================ */

  useEffect(() => {
    loadSatellites({
      targetPage: page,
      targetSearch: searchQuery,
      targetSortBy: sortBy,
      targetSortDirection: sortDirection,
      targetPageSize: pageSize,
    });
  }, [page, pageSize, searchQuery, sortBy, sortDirection, loadSatellites]);

  /* ============================================================
     PAGE NUMBERS
  ============================================================ */

  const pageNumbers = useMemo(
    () => buildPageNumbers(pagination.currentPage, pagination.totalPages),
    [pagination.currentPage, pagination.totalPages],
  );

  /* ============================================================
     SEARCH
  ============================================================ */

  const handleSearchChange = useCallback((value) => {
    setSearchQuery(value);

    /*
     * New search starts from first page.
     */
    setPage(DEFAULT_PAGE);
  }, []);

  /* ============================================================
     SORT
  ============================================================ */

  const handleSortChange = useCallback((value) => {
    setSortBy(value);

    /*
     * New sort starts from first page.
     */
    setPage(DEFAULT_PAGE);
  }, []);

  /* ============================================================
     SORT DIRECTION
  ============================================================ */

  const handleSortDirectionChange = useCallback((value) => {
    setSortDirection(value);

    /*
     * New sort direction starts from first page.
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

      if (pagination.totalPages > 0 && nextPage >= pagination.totalPages) {
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
    setPage((currentPage) => Math.max(DEFAULT_PAGE, currentPage - 1));
  }, []);

  /* ============================================================
     NEXT PAGE
  ============================================================ */

  const handleNextPage = useCallback(() => {
    setPage((currentPage) => {
      if (pagination.totalPages <= 0) {
        return currentPage;
      }

      return Math.min(pagination.totalPages - 1, currentPage + 1);
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

  const handleSync = useCallback(async () => {
    if (isSyncing) {
      return;
    }

    setIsSyncing(true);
    setErrorMessage("");

    try {
      await satelliteService.synchronizeSatellites(CELESTRAK_GROUP);

      toast.success("Satellite data synchronized successfully.");

      /*
       * Reload the current backend page after
       * synchronization.
       */
      await loadSatellites({
        targetPage: page,
        targetSearch: searchQuery,
        targetSortBy: sortBy,
        targetSortDirection: sortDirection,
        targetPageSize: pageSize,
        showLoading: false,
      });
    } catch (error) {
      const message = getApiErrorMessage(
        error,
        "Satellite synchronization failed.",
      );

      setErrorMessage(message);

      toast.error(message);

      if (import.meta.env.DEV) {
        console.error(
          "[SatelliteOverviewPage] CelesTrak synchronization failed:",
          error,
        );
      }
    } finally {
      setIsSyncing(false);
    }
  }, [
    isSyncing,
    loadSatellites,
    page,
    pageSize,
    searchQuery,
    sortBy,
    sortDirection,
  ]);

  /* ============================================================
     OVERVIEW STATISTICS
  ============================================================ */

  /**
   * IMPORTANT:
   *
   * Do NOT calculate:
   *
   * satellites.filter(...).length
   *
   * because `satellites` contains only the current page.
   *
   * Example:
   *
   * totalElements = 16611
   * pageSize       = 5
   * satellites     = 5 records
   *
   * The old implementation therefore showed:
   *
   * ACTIVE = 5
   *
   * The current registry contains only ACTIVE satellites, so
   * the correct global statistics are:
   *
   * TOTAL          = 16611
   * ACTIVE         = 16611
   * INACTIVE       = 0
   * DECOMMISSIONED = 0
   */
  const overviewStats = useMemo(
    () => buildOverviewStats(pagination.totalElements),
    [pagination.totalElements],
  );

  /* ============================================================
     ADD SATELLITE
  ============================================================ */

  const handleAddSatellite = useCallback(() => {
    if (import.meta.env.DEV) {
      console.info("[SatelliteOverviewPage] Add Satellite requested.");
    }
  }, []);

  /* ============================================================
     VIEW SATELLITE
  ============================================================ */

  const handleViewSatellite = useCallback((satellite) => {
    if (import.meta.env.DEV) {
      console.info("[SatelliteOverviewPage] View satellite:", satellite);
    }
  }, []);

  /* ============================================================
     EDIT SATELLITE
  ============================================================ */

  const handleEditSatellite = useCallback((satellite) => {
    if (import.meta.env.DEV) {
      console.info("[SatelliteOverviewPage] Edit satellite:", satellite);
    }
  }, []);

  /* ============================================================
     DELETE SATELLITE
  ============================================================ */

  const handleDeleteSatellite = useCallback(
    async (satellite) => {
      if (!satellite?.id) {
        return;
      }

      try {
        await satelliteService.deleteSatellite(satellite.id);

        toast.success("Satellite deleted successfully.");

        await loadSatellites({
          targetPage: page,
          targetSearch: searchQuery,
          targetSortBy: sortBy,
          targetSortDirection: sortDirection,
          targetPageSize: pageSize,
          showLoading: false,
        });
      } catch (error) {
        const message = getApiErrorMessage(
          error,
          "Unable to delete satellite.",
        );

        toast.error(message);

        if (import.meta.env.DEV) {
          console.error("[SatelliteOverviewPage] Delete failed:", error);
        }
      }
    },
    [loadSatellites, page, pageSize, searchQuery, sortBy, sortDirection],
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
            SATELLITE HERO
        ================================================== */}

        <section
          aria-labelledby="satellite-page-heading"
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
          <SatelliteHero />
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
          aria-labelledby="satellite-overview-stats"
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
          <h2 id="satellite-overview-stats" className="sr-only">
            Satellite Overview Statistics
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
            <SatelliteOverviewStats stats={overviewStats} />
          </div>
        </section>

        {/* =================================================
            SATELLITE EXPLORER
        ================================================== */}

        <section
          aria-labelledby="satellite-explorer-heading"
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
              id="satellite-explorer-heading"
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
              Satellite Explorer
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
              Explore synchronized spacecraft, orbital parameters, TLE-derived
              telemetry and mission status across the OrbitGuard registry.
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
            <SatelliteToolbar
              searchQuery={searchQuery}
              onSearchChange={handleSearchChange}
              sortBy={sortBy}
              onSortChange={handleSortChange}
              sortDirection={sortDirection}
              onSortDirectionChange={handleSortDirectionChange}
              onSync={handleSync}
              isSyncing={isSyncing}
              onAddSatellite={handleAddSatellite}
            />
          </div>

          {/* =================================================
              SATELLITE REGISTRY
          ================================================== */}

          <div className="mt-4">
            <SatelliteGrid
              satellites={satellites}
              isLoading={isLoading}
              onViewSatellite={handleViewSatellite}
              onEditSatellite={handleEditSatellite}
              onDeleteSatellite={handleDeleteSatellite}
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
                aria-label="Satellite registry pagination"
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

                    const isCurrentPage = pagination.currentPage === pageIndex;

                    return (
                      <button
                        key={pageNumber}
                        type="button"
                        aria-label={`Go to page ${pageNumber}`}
                        aria-current={isCurrentPage ? "page" : undefined}
                        onClick={() => handlePageChange(pageIndex)}
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
                  disabled={pagination.currentPage >= pagination.totalPages - 1}
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

export default SatelliteOverviewPage;
