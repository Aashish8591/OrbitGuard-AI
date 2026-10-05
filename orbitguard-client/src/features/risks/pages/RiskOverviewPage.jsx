import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useNavigate } from "react-router-dom";

import RiskHero from "../components/RiskHero";
import RiskLevelDistribution from "../components/RiskLevelDistribution";
import RiskAssessmentTrend from "../components/RiskAssessmentTrend";
import LatestRiskAssessment from "../components/LatestRiskAssessment";
import AnalyzeRiskPanel from "../components/AnalyzeRiskPanel";
import RiskToolbar from "../components/RiskToolbar";
import RiskTable from "../components/RiskTable";

import { getRiskAssessments, analyzeRisk } from "../../../services/riskService";

import { getSatellites } from "../../../services/satelliteService";

import { getDebris } from "../../../services/debrisService";

/* ========================================================================
   CONSTANTS
======================================================================== */

const DEFAULT_PAGE_SIZE = 10;

const OBJECT_SEARCH_PAGE_SIZE = 20;

const SEARCH_DEBOUNCE_MS = 300;

const MIN_OBJECT_SEARCH_LENGTH = 1;

const DEFAULT_RISK_SORT = "assessedAt,desc";

const DEFAULT_OBJECT_SORT = "createdAt";

const DEFAULT_DEBRIS_SORT = "debrisName,asc";

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

/* ========================================================================
   RESPONSE HELPERS
======================================================================== */

const extractPageData = (response) => {
  if (!response) {
    return {};
  }

  if (Array.isArray(response)) {
    return {
      content: response,
    };
  }

  if (Array.isArray(response.content) || Array.isArray(response.items)) {
    return response;
  }

  if (
    response.data &&
    typeof response.data === "object" &&
    !Array.isArray(response.data)
  ) {
    if (
      Array.isArray(response.data.content) ||
      Array.isArray(response.data.items)
    ) {
      return response.data;
    }

    if (
      response.data.data &&
      typeof response.data.data === "object" &&
      !Array.isArray(response.data.data)
    ) {
      if (
        Array.isArray(response.data.data.content) ||
        Array.isArray(response.data.data.items)
      ) {
        return response.data.data;
      }
    }
  }

  return {};
};

const extractPageContent = (response) => {
  const pageData = extractPageData(response);

  if (Array.isArray(pageData.content)) {
    return pageData.content;
  }

  if (Array.isArray(pageData.items)) {
    return pageData.items;
  }

  return [];
};

const getErrorMessage = (error, fallback = "Something went wrong.") => {
  return (
    error?.response?.data?.message ??
    error?.response?.data?.error ??
    error?.response?.data?.detail ??
    error?.message ??
    fallback
  );
};

const normalizeRiskLevel = (value) => {
  return String(value ?? "")
    .trim()
    .toUpperCase();
};

const normalizeId = (value) => {
  if (value === null || value === undefined || value === "") {
    return "";
  }

  return String(value);
};

const safeNumber = (value, fallback = 0) => {
  const number = Number(value);

  return Number.isFinite(number) ? number : fallback;
};

/* ========================================================================
   OBJECT HELPERS
======================================================================== */

const getSatelliteRecordId = (item) => {
  if (!item) {
    return "";
  }

  return normalizeId(item.id ?? item._id ?? item.satelliteId);
};

const getDebrisRecordId = (item) => {
  if (!item) {
    return "";
  }

  return normalizeId(item.id ?? item._id ?? item.debrisId);
};

const uniqueById = (items, getId) => {
  if (!Array.isArray(items)) {
    return [];
  }

  const seen = new Set();
  const result = [];

  for (const item of items) {
    const id = getId(item);

    if (!id || seen.has(id)) {
      continue;
    }

    seen.add(id);
    result.push(item);
  }

  return result;
};

/* ========================================================================
   TREND DATA
======================================================================== */

const buildTrendData = (risks) => {
  if (!Array.isArray(risks) || risks.length === 0) {
    return [];
  }

  const grouped = new Map();

  for (const risk of risks) {
    const timestamp = risk?.assessedAt ?? risk?.createdAt ?? risk?.updatedAt;

    if (!timestamp) {
      continue;
    }

    const dateObject = new Date(timestamp);

    if (Number.isNaN(dateObject.getTime())) {
      continue;
    }

    const year = dateObject.getFullYear();

    const month = String(dateObject.getMonth() + 1).padStart(2, "0");

    const day = String(dateObject.getDate()).padStart(2, "0");

    const dateKey = `${year}-${month}-${day}`;

    if (!grouped.has(dateKey)) {
      grouped.set(dateKey, {
        date: dateObject.toLocaleDateString("en-IN", {
          month: "short",
          day: "2-digit",
        }),
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
        timestamp: dateObject.getTime(),
      });
    }

    const bucket = grouped.get(dateKey);

    switch (normalizeRiskLevel(risk?.riskLevel)) {
      case "CRITICAL":
        bucket.critical += 1;
        break;

      case "HIGH":
        bucket.high += 1;
        break;

      case "MEDIUM":
        bucket.medium += 1;
        break;

      case "LOW":
        bucket.low += 1;
        break;

      default:
        break;
    }
  }

  return Array.from(grouped.values())
    .sort((first, second) => first.timestamp - second.timestamp)
    .map(({ date, critical, high, medium, low }) => ({
      date,
      critical,
      high,
      medium,
      low,
    }));
};

/* ========================================================================
   COMPONENT
======================================================================== */

const RiskOverviewPage = () => {
  const navigate = useNavigate();

  /* ====================================================================
       RISK DATA
    ==================================================================== */

  const [risks, setRisks] = useState([]);

  const [latestAssessment, setLatestAssessment] = useState(null);

  const [summary, setSummary] = useState(EMPTY_SUMMARY);

  /* ====================================================================
       ANALYZE OBJECT SEARCH
    ==================================================================== */

  const [satellites, setSatellites] = useState([]);

  const [debris, setDebris] = useState([]);

  const [satellitesLoading, setSatellitesLoading] = useState(false);

  const [debrisLoading, setDebrisLoading] = useState(false);

  const [satelliteSearch, setSatelliteSearch] = useState("");

  const [debrisSearch, setDebrisSearch] = useState("");

  const [satelliteSearchError, setSatelliteSearchError] = useState("");

  const [debrisSearchError, setDebrisSearchError] = useState("");

  const [selectedSatelliteId, setSelectedSatelliteId] = useState("");

  const [selectedDebrisId, setSelectedDebrisId] = useState("");

  /* ====================================================================
       REQUEST GUARDS
    ==================================================================== */

  const satelliteSearchRequestRef = useRef(0);

  const debrisSearchRequestRef = useRef(0);

  const riskRequestRef = useRef(0);

  const latestRequestRef = useRef(0);

  const summaryRequestRef = useRef(0);

  /* ====================================================================
       UI STATE
    ==================================================================== */

  const [loading, setLoading] = useState(true);

  const [latestLoading, setLatestLoading] = useState(true);

  const [summaryLoading, setSummaryLoading] = useState(true);

  const [analyzing, setAnalyzing] = useState(false);

  const [pageError, setPageError] = useState("");

  const [actionError, setActionError] = useState("");

  /* ====================================================================
       PAGINATION
    ==================================================================== */

  const [page, setPage] = useState(0);

  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const [totalElements, setTotalElements] = useState(0);

  const [totalPages, setTotalPages] = useState(0);

  const [first, setFirst] = useState(true);

  const [last, setLast] = useState(true);

  /* ====================================================================
       FILTERS
    ==================================================================== */

  const [filters, setFilters] = useState({
    ...DEFAULT_FILTERS,
  });

  /* ====================================================================
       SATELLITE SEARCH
       Existing backend endpoint:
       GET /api/satellites
    ==================================================================== */

  useEffect(() => {
    const query = satelliteSearch.trim();

    if (query.length < MIN_OBJECT_SEARCH_LENGTH) {
      satelliteSearchRequestRef.current += 1;

      setSatellites([]);
      setSatelliteSearchError("");
      setSatellitesLoading(false);

      return undefined;
    }

    const requestId = ++satelliteSearchRequestRef.current;

    const timer = setTimeout(async () => {
      try {
        setSatellitesLoading(true);
        setSatelliteSearchError("");

        const response = await getSatellites({
          page: 0,
          size: OBJECT_SEARCH_PAGE_SIZE,
          sortBy: DEFAULT_OBJECT_SORT,
          direction: "desc",
          keyword: query,
        });

        if (requestId !== satelliteSearchRequestRef.current) {
          return;
        }

        setSatellites(
          uniqueById(extractPageContent(response), getSatelliteRecordId),
        );
      } catch (error) {
        if (requestId !== satelliteSearchRequestRef.current) {
          return;
        }

        console.error("Failed to search satellites:", error);

        setSatellites([]);

        setSatelliteSearchError(
          getErrorMessage(error, "Unable to search satellites."),
        );
      } finally {
        if (requestId === satelliteSearchRequestRef.current) {
          setSatellitesLoading(false);
        }
      }
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
    };
  }, [satelliteSearch]);

  /* ====================================================================
       DEBRIS SEARCH
       Existing backend endpoint:
       GET /api/v1/debris
    ==================================================================== */

  useEffect(() => {
    const query = debrisSearch.trim();

    if (query.length < MIN_OBJECT_SEARCH_LENGTH) {
      debrisSearchRequestRef.current += 1;

      setDebris([]);
      setDebrisSearchError("");
      setDebrisLoading(false);

      return undefined;
    }

    const requestId = ++debrisSearchRequestRef.current;

    const timer = setTimeout(async () => {
      try {
        setDebrisLoading(true);
        setDebrisSearchError("");

        const response = await getDebris({
          search: query,
          page: 0,
          size: OBJECT_SEARCH_PAGE_SIZE,
          sort: DEFAULT_DEBRIS_SORT,
        });

        if (requestId !== debrisSearchRequestRef.current) {
          return;
        }

        setDebris(uniqueById(extractPageContent(response), getDebrisRecordId));
      } catch (error) {
        if (requestId !== debrisSearchRequestRef.current) {
          return;
        }

        console.error("Failed to search debris:", error);

        setDebris([]);

        setDebrisSearchError(
          getErrorMessage(error, "Unable to search space debris."),
        );
      } finally {
        if (requestId === debrisSearchRequestRef.current) {
          setDebrisLoading(false);
        }
      }
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
    };
  }, [debrisSearch]);

  /* ====================================================================
       LOAD RISK TABLE
    ==================================================================== */

  const loadRisks = useCallback(
    async (currentPage = 0, currentPageSize = DEFAULT_PAGE_SIZE) => {
      const requestId = ++riskRequestRef.current;

      try {
        setLoading(true);
        setPageError("");

        const response = await getRiskAssessments({
          ...filters,
          page: currentPage,
          size: currentPageSize,
          sort: DEFAULT_RISK_SORT,
        });

        if (requestId !== riskRequestRef.current) {
          return;
        }

        const pageData = extractPageData(response);

        const content = extractPageContent(response);

        const safeTotalElements = safeNumber(pageData?.totalElements);

        const safeTotalPages = safeNumber(pageData?.totalPages);

        setRisks(content);

        setTotalElements(safeTotalElements);

        setTotalPages(safeTotalPages);

        setFirst(
          typeof pageData?.first === "boolean"
            ? pageData.first
            : currentPage === 0,
        );

        setLast(
          typeof pageData?.last === "boolean"
            ? pageData.last
            : safeTotalPages === 0 || currentPage >= safeTotalPages - 1,
        );
      } catch (error) {
        if (requestId !== riskRequestRef.current) {
          return;
        }

        console.error("Failed to load risk assessments:", error);

        setRisks([]);
        setTotalElements(0);
        setTotalPages(0);
        setFirst(true);
        setLast(true);

        setPageError(
          getErrorMessage(error, "Unable to load collision risk assessments."),
        );
      } finally {
        if (requestId === riskRequestRef.current) {
          setLoading(false);
        }
      }
    },
    [filters],
  );

  /* ====================================================================
       LOAD LATEST ASSESSMENT
    ==================================================================== */

  const loadLatestAssessment = useCallback(async () => {
    const requestId = ++latestRequestRef.current;

    try {
      setLatestLoading(true);

      const response = await getRiskAssessments({
        ...filters,
        page: 0,
        size: 1,
        sort: DEFAULT_RISK_SORT,
      });

      if (requestId !== latestRequestRef.current) {
        return;
      }

      const content = extractPageContent(response);

      setLatestAssessment(content[0] ?? null);
    } catch (error) {
      if (requestId !== latestRequestRef.current) {
        return;
      }

      console.error("Failed to load latest risk assessment:", error);

      setLatestAssessment(null);
    } finally {
      if (requestId === latestRequestRef.current) {
        setLatestLoading(false);
      }
    }
  }, [filters]);

  /* ====================================================================
       LOAD SUMMARY
    ==================================================================== */

  const loadSummary = useCallback(async () => {
    const requestId = ++summaryRequestRef.current;

    try {
      setSummaryLoading(true);

      const baseFilters = {
        ...filters,
        riskLevel: "",
        page: 0,
        size: 1,
        sort: DEFAULT_RISK_SORT,
      };

      const [
        totalResponse,
        criticalResponse,
        highResponse,
        mediumResponse,
        lowResponse,
      ] = await Promise.all([
        getRiskAssessments(baseFilters),

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

      if (requestId !== summaryRequestRef.current) {
        return;
      }

      const totalData = extractPageData(totalResponse);

      const criticalData = extractPageData(criticalResponse);

      const highData = extractPageData(highResponse);

      const mediumData = extractPageData(mediumResponse);

      const lowData = extractPageData(lowResponse);

      setSummary({
        total: safeNumber(totalData?.totalElements),
        critical: safeNumber(criticalData?.totalElements),
        high: safeNumber(highData?.totalElements),
        medium: safeNumber(mediumData?.totalElements),
        low: safeNumber(lowData?.totalElements),
      });
    } catch (error) {
      if (requestId !== summaryRequestRef.current) {
        return;
      }

      console.error("Failed to load risk summary:", error);

      setSummary(EMPTY_SUMMARY);
    } finally {
      if (requestId === summaryRequestRef.current) {
        setSummaryLoading(false);
      }
    }
  }, [filters]);

  /* ====================================================================
       DATA LOAD EFFECTS
    ==================================================================== */

  useEffect(() => {
    loadRisks(page, pageSize);
  }, [loadRisks, page, pageSize]);

  useEffect(() => {
    loadLatestAssessment();
  }, [loadLatestAssessment]);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  /* ====================================================================
       CHART DATA
    ==================================================================== */

  const trendData = useMemo(() => buildTrendData(risks), [risks]);

  /* ====================================================================
       REFRESH RISK DATA
    ==================================================================== */

  const refreshRiskData = useCallback(
    async (targetPage = 0) => {
      await Promise.all([
        loadRisks(targetPage, pageSize),
        loadLatestAssessment(),
        loadSummary(),
      ]);
    },
    [loadRisks, loadLatestAssessment, loadSummary, pageSize],
  );

  /* ====================================================================
       ANALYZE NEW RISK
    ==================================================================== */

  const handleAnalyzeRisk = useCallback(
    async ({ satelliteId, debrisId }) => {
      const normalizedSatelliteId = normalizeId(satelliteId);

      const normalizedDebrisId = normalizeId(debrisId);

      if (!normalizedSatelliteId || !normalizedDebrisId) {
        setActionError(
          "Select both a satellite and a debris object before analysis.",
        );

        return;
      }

      try {
        setAnalyzing(true);
        setActionError("");

        await analyzeRisk({
          satelliteId: normalizedSatelliteId,
          debrisId: normalizedDebrisId,
        });

        setSelectedSatelliteId(normalizedSatelliteId);

        setSelectedDebrisId(normalizedDebrisId);

        setPage(0);

        await refreshRiskData(0);
      } catch (error) {
        console.error("Risk analysis failed:", error);

        setActionError(
          getErrorMessage(error, "Unable to analyze collision risk."),
        );
      } finally {
        setAnalyzing(false);
      }
    },
    [refreshRiskData],
  );

  /* ====================================================================
       FILTER CHANGE
    ==================================================================== */

  const handleFilterChange = useCallback((name, value) => {
    setPage(0);

    setFilters((currentFilters) => ({
      ...currentFilters,
      [name]: value ?? "",
    }));

    setPageError("");
  }, []);

  /* ====================================================================
       CLEAR FILTERS
    ==================================================================== */

  const handleClearFilters = useCallback(() => {
    setPage(0);

    setFilters({
      ...DEFAULT_FILTERS,
    });

    setPageError("");
    setActionError("");
  }, []);

  /* ====================================================================
       PAGE CHANGE
    ==================================================================== */

  const handlePageChange = useCallback(
    (nextPage) => {
      const safePage = Number(nextPage);

      if (!Number.isInteger(safePage)) {
        return;
      }

      if (safePage < 0) {
        return;
      }

      if (totalPages > 0 && safePage >= totalPages) {
        return;
      }

      setPage(safePage);
    },
    [totalPages],
  );

  /* ====================================================================
       PAGE SIZE CHANGE
    ==================================================================== */

  const handlePageSizeChange = useCallback((nextSize) => {
    const numericSize = Number(nextSize);

    if (!Number.isInteger(numericSize) || numericSize <= 0) {
      return;
    }

    setPageSize(numericSize);
    setPage(0);
  }, []);

  /* ====================================================================
       VIEW RISK
    ==================================================================== */

  const handleViewRisk = useCallback(
    (risk) => {
      const riskId = normalizeId(risk?.id ?? risk?._id);

      if (!riskId) {
        return;
      }

      navigate(`/app/risks/${riskId}`);
    },
    [navigate],
  );

  /* ====================================================================
       RENDER
    ==================================================================== */

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
        {/* PAGE ERROR */}

        {pageError && (
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
            <span>{pageError}</span>

            <button
              type="button"
              onClick={() => setPageError("")}
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

        {/* ========================================================
                    HERO + ANALYZE PANEL

                    Desktop:
                    The hero receives enough vertical space to contain
                    the AnalyzeRiskPanel even when the panel expands.

                    Mobile / tablet:
                    The panel remains in normal document flow.
                ======================================================== */}

        <section
          className="
                        relative
                        min-w-0
                        overflow-visible

                        xl:min-h-[470px]
                        2xl:min-h-[690px]
                    "
        >
          <RiskHero
            totalRisks={summary.total}
            criticalRisks={summary.critical}
            loading={loading || summaryLoading}
          />

          <div
            className="
                            relative
                            z-20
                            mt-3

                            xl:absolute
                            xl:right-5
                            xl:top-5
                            xl:mt-0
                            xl:w-[340px]

                            2xl:right-6
                            2xl:top-6
                            2xl:w-[340px]
                        "
          >
            <AnalyzeRiskPanel
              satellites={satellites}
              debris={debris}
              selectedSatelliteId={selectedSatelliteId}
              selectedDebrisId={selectedDebrisId}
              onSatelliteChange={setSelectedSatelliteId}
              onDebrisChange={setSelectedDebrisId}
              satelliteSearch={satelliteSearch}
              debrisSearch={debrisSearch}
              onSatelliteSearch={setSatelliteSearch}
              onDebrisSearch={setDebrisSearch}
              satellitesLoading={satellitesLoading}
              debrisLoading={debrisLoading}
              satelliteSearchError={satelliteSearchError}
              debrisSearchError={debrisSearchError}
              loading={analyzing}
              error={actionError}
              onClearError={() => setActionError("")}
              onAnalyze={handleAnalyzeRisk}
            />
          </div>
        </section>

        {/* ========================================================
                    ANALYTICS
                ======================================================== */}

        <section
          className="
        mt-3
        grid
        min-w-0
        grid-cols-1
        items-start
        gap-3
        lg:grid-cols-[0.9fr_1.45fr_1fr]
    "
        >
          <RiskLevelDistribution data={summary} loading={summaryLoading} />

          <RiskAssessmentTrend data={trendData} loading={loading} />

          <LatestRiskAssessment
            assessment={latestAssessment}
            loading={latestLoading}
          />
        </section>

        {/* ========================================================
                    RISK OPERATIONS
                ======================================================== */}

        <section
          className="
                        mt-3
                        min-w-0
                        overflow-hidden
                        rounded-2xl
                        border
                        border-white/[0.07]
                        bg-[#030d1b]/80
                        shadow-[0_18px_60px_rgba(0,0,0,0.22)]
                        backdrop-blur-xl
                    "
        >
          <RiskToolbar
            filters={filters}
            onSearchChange={(value) => handleFilterChange("search", value)}
            onRiskLevelChange={(value) =>
              handleFilterChange("riskLevel", value)
            }
            onStatusChange={(value) => handleFilterChange("status", value)}
            onAssessmentTypeChange={(value) =>
              handleFilterChange("assessmentType", value)
            }
            onSatelliteIdChange={(value) =>
              handleFilterChange("satelliteId", value)
            }
            onDebrisIdChange={(value) => handleFilterChange("debrisId", value)}
            onFromDateChange={(value) => handleFilterChange("fromDate", value)}
            onToDateChange={(value) => handleFilterChange("toDate", value)}
            onReset={handleClearFilters}
            loading={loading}
          />

          <RiskTable
            risks={risks}
            loading={loading}
            error={pageError}
            pageNumber={page}
            pageSize={pageSize}
            totalElements={totalElements}
            totalPages={totalPages}
            first={first}
            last={last}
            onPageChange={handlePageChange}
            onViewRisk={handleViewRisk}
            onPageSizeChange={handlePageSizeChange}
          />
        </section>
      </div>
    </main>
  );
};

export default RiskOverviewPage;
