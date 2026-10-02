import { useCallback, useEffect, useMemo, useState } from "react";

import DebrisHero from "../components/DebrisHero";
import DebrisOverviewStats from "../components/DebrisStats";
import DebrisToolbar from "../components/DebrisToolbar";
import DebrisGrid from "../components/DebrisTable";

import debrisService from "../../../services/debrisService";

/**
 * ================================================================
 * OrbitGuard AI - Debris Overview Page
 * ================================================================
 *
 * Debris Registry presentation + backend orchestration layer.
 *
 * Backend:
 *   GET    /api/v1/debris
 *   GET    /api/v1/debris/{id}
 *   POST   /api/v1/debris
 *   PUT    /api/v1/debris/{id}
 *   DELETE /api/v1/debris/{id}
 *   POST   /api/v1/debris/synchronize?group={group}
 *
 * Backend list response:
 *
 * {
 *   success: true,
 *   message: "...",
 *   data: {
 *     content: [],
 *     page: 0,
 *     size: 5,
 *     totalElements: 113,
 *     totalPages: 23,
 *     last: false
 *   }
 * }
 *
 * Important:
 * - Backend owns pagination.
 * - Backend owns search.
 * - Backend owns sorting.
 * - Current page contains only active debris records.
 * - No dummy debris data is used.
 * ================================================================
 */

/* ================================================================
   UI CONFIGURATION
================================================================ */

const DEFAULT_PAGE = 0;

const DEFAULT_PAGE_SIZE = 5;

const PAGE_SIZE_OPTIONS = [5, 10, 25, 50];

const DEFAULT_SORT_BY = "createdAt";

const DEFAULT_SORT_DIRECTION = "desc";

/**
 * CelesTrak group used by the backend synchronization endpoint.
 *
 * Keep this value aligned with the group accepted by your backend
 * CelesTrak debris synchronization service.
 */
const DEFAULT_SYNC_GROUP = "DEB";

/* ================================================================
   PAGINATION HELPERS
================================================================ */

const buildPageNumbers = (currentPage, totalPages) => {
  if (totalPages <= 0) {
    return [];
  }

  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const current = currentPage + 1;

  const pages = [];

  pages.push(1);

  if (current <= 4) {
    pages.push(2);
    pages.push(3);
    pages.push(4);
    pages.push(5);
    pages.push("...");
    pages.push(totalPages);

    return pages;
  }

  if (current >= totalPages - 3) {
    pages.push("...");
    pages.push(totalPages - 4);
    pages.push(totalPages - 3);
    pages.push(totalPages - 2);
    pages.push(totalPages - 1);
    pages.push(totalPages);

    return pages;
  }

  pages.push("...");
  pages.push(current - 1);
  pages.push(current);
  pages.push(current + 1);
  pages.push("...");
  pages.push(totalPages);

  return pages;
};

/* ================================================================
   ERROR HELPER
================================================================ */

/**
 * Convert Axios/service errors into a readable UI message.
 *
 * This does not change the service contract.
 */
const getErrorMessage = (error, fallbackMessage) => {
  if (!error) {
    return fallbackMessage;
  }

  const responseMessage = error?.response?.data?.message;

  if (typeof responseMessage === "string" && responseMessage.trim()) {
    return responseMessage;
  }

  if (typeof error?.message === "string" && error.message.trim()) {
    return error.message;
  }

  return fallbackMessage;
};

/* ================================================================
   COMPONENT
================================================================ */

const DebrisOverviewPage = () => {
  /* ============================================================
     DEBRIS DATA
  ============================================================ */

  const [debris, setDebris] = useState([]);

  /* ============================================================
     LOADING
  ============================================================ */

  const [isLoading, setIsLoading] = useState(false);

  const [isSyncing, setIsSyncing] = useState(false);

  /* ============================================================
     ERROR
  ============================================================ */

  const [errorMessage, setErrorMessage] = useState("");

  /* ============================================================
     SEARCH / SORT
  ============================================================ */

  const [searchQuery, setSearchQuery] = useState("");

  const [sortBy, setSortBy] = useState(DEFAULT_SORT_BY);

  const [sortDirection, setSortDirection] = useState(DEFAULT_SORT_DIRECTION);

  /* ============================================================
     PAGINATION
  ============================================================ */

  const [page, setPage] = useState(DEFAULT_PAGE);

  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  /**
   * Backend pagination metadata.
   *
   * This is intentionally state rather than a constant because
   * these values come from Spring Boot.
   */
  const [pagination, setPagination] = useState({
    totalElements: 0,
    totalPages: 0,
    currentPage: DEFAULT_PAGE,
    pageSize: DEFAULT_PAGE_SIZE,
    last: true,
  });

  /* ============================================================
     PAGE NUMBERS
  ============================================================ */

  const pageNumbers = useMemo(
    () => buildPageNumbers(pagination.currentPage, pagination.totalPages),
    [pagination.currentPage, pagination.totalPages],
  );

  /* ============================================================
     LOAD DEBRIS
  ============================================================ */

  const loadDebris = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await debrisService.getDebris({
        search: searchQuery.trim(),
        page,
        size: pageSize,
        sort: `${sortBy},${sortDirection}`,
      });

      /**
       * Expected service response:
       *
       * {
       *   content,
       *   page,
       *   size,
       *   totalElements,
       *   totalPages,
       *   last
       * }
       */
      const content = Array.isArray(response?.content) ? response.content : [];

      setDebris(content);

      setPagination({
        totalElements: Number(response?.totalElements) || 0,

        totalPages: Number(response?.totalPages) || 0,

        currentPage: Number.isInteger(response?.page) ? response.page : page,

        pageSize: Number(response?.size) || pageSize,

        last: Boolean(response?.last),
      });
    } catch (error) {
      console.error("[DebrisOverviewPage] Failed to load debris:", error);

      setDebris([]);

      setPagination({
        totalElements: 0,
        totalPages: 0,
        currentPage: page,
        pageSize,
        last: true,
      });

      setErrorMessage(
        getErrorMessage(error, "Unable to load debris registry."),
      );
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, searchQuery, sortBy, sortDirection]);

  /* ============================================================
     INITIAL LOAD + QUERY CHANGES
  ============================================================ */

  useEffect(() => {
    loadDebris();
  }, [loadDebris]);

  /* ============================================================
     SEARCH
  ============================================================ */

  const handleSearchChange = useCallback((value) => {
    setSearchQuery(value);
    setPage(DEFAULT_PAGE);
  }, []);

  /* ============================================================
     SORT
  ============================================================ */

  const handleSortChange = useCallback((value) => {
    setSortBy(value);
    setPage(DEFAULT_PAGE);
  }, []);

  /* ============================================================
     SORT DIRECTION
  ============================================================ */

  const handleSortDirectionChange = useCallback((value) => {
    setSortDirection(value);
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
      /**
       * Existing backend contract:
       *
       * POST /api/v1/debris/synchronize?group=...
       */
      await debrisService.synchronizeDebris();

      /**
       * After synchronization, reload the current
       * registry from MongoDB through Spring Boot.
       *
       * We intentionally do not insert the synchronized
       * response directly into frontend state.
       *
       * MongoDB -> Spring Boot -> debrisService -> UI
       * remains the source-of-truth flow.
       */
      await loadDebris();
    } catch (error) {
      console.error(
        "[DebrisOverviewPage] Debris synchronization failed:",
        error,
      );

      setErrorMessage(getErrorMessage(error, "Debris synchronization failed."));
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing, loadDebris]);

  /* ============================================================
     VIEW DEBRIS
  ============================================================ */

  const handleViewDebris = useCallback((debrisObject) => {
    if (import.meta.env.DEV) {
      console.info("[DebrisOverviewPage] View debris:", debrisObject);
    }

    /**
     * Keep this connected to the existing detail
     * implementation when the Debris detail view is wired.
     */
  }, []);

  /* ============================================================
     EDIT DEBRIS
  ============================================================ */

  const handleEditDebris = useCallback((debrisObject) => {
    if (import.meta.env.DEV) {
      console.info("[DebrisOverviewPage] Edit debris:", debrisObject);
    }

    /**
     * Edit UI can call debrisService.updateDebris()
     * when the existing edit form/modal is connected.
     */
  }, []);

  /* ============================================================
     DELETE DEBRIS
  ============================================================ */

  const handleDeleteDebris = useCallback(
    async (debrisObject) => {
      if (!debrisObject?.id) {
        return;
      }

      setErrorMessage("");

      try {
        await debrisService.deleteDebris(debrisObject.id);

        /**
         * Backend DELETE is a soft delete.
         *
         * Reload instead of manually filtering local state
         * so the frontend always reflects the backend.
         */
        await loadDebris();
      } catch (error) {
        console.error("[DebrisOverviewPage] Delete debris failed:", error);

        setErrorMessage(getErrorMessage(error, "Unable to delete debris."));
      }
    },
    [loadDebris],
  );

  /* ============================================================
     OVERVIEW STATISTICS
  ============================================================ */

  /**
   * IMPORTANT:
   *
   * GET /api/v1/debris returns active debris records only.
   *
   * Therefore:
   *
   * totalElements = total active records represented by
   *                 the backend registry query.
   *
   * We must NOT calculate inactive/decommissioned totals
   * from the current page because that would be incorrect.
   *
   * Until a dedicated statistics endpoint exists, those
   * unavailable categories remain null.
   */
  const overviewStats = useMemo(
    () => ({
      total: pagination.totalElements,
      active: pagination.totalElements,
      inactive: null,
      decommissioned: null,
    }),
    [pagination.totalElements],
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
          <h2 id="debris-overview-stats" className="sr-only">
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
              Explore tracked orbital debris, orbital parameters, TLE-derived
              telemetry and object status across the OrbitGuard registry.
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
                  disabled={pagination.currentPage <= 0 || isLoading}
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
                        disabled={isLoading}
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

                            disabled:cursor-not-allowed
                            disabled:opacity-50
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
                    pagination.currentPage >= pagination.totalPages - 1 ||
                    isLoading
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
                    disabled={isLoading}
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
                      disabled:cursor-not-allowed
                      disabled:opacity-50
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
