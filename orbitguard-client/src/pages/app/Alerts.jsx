
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  FiAlertCircle,
  FiRefreshCw,
} from "react-icons/fi";

import api from "../../services/api";

import AlertsHeader from "../../features/alerts/components/AlertsHeader";
import AlertSummary from "../../features/alerts/components/AlertSummary";
import AlertToolbar from "../../features/alerts/components/AlertToolbar";
import AlertList from "../../features/alerts/components/AlertList";
import AlertListSkeleton from "../../features/alerts/components/AlertListSkeleton";
import AlertDetailsPanel from "../../features/alerts/components/AlertDetailsPanel";
import AlertStatusActions from "../../features/alerts/components/AlertStatusActions";
import AlertEmptyState from "../../features/alerts/components/AlertEmptyState";

const ALERTS_ENDPOINT = "/api/v1/alerts";
const PAGE_SIZE = 8;

const INITIAL_FILTERS = {
  search: "",
  severity: "",
  status: "",
  source: "",
  type: "",
  fromDate: "",
  toDate: "",
  sortBy: "generatedAt",
  sortDirection: "desc",
};

function getErrorMessage(error) {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    "An unexpected error occurred. Please try again."
  );
}

function unwrapResponse(response) {
  let payload = response?.data;

  // Support APIs returning { data: ... }.
  if (
    payload &&
    !Array.isArray(payload) &&
    typeof payload === "object" &&
    Object.prototype.hasOwnProperty.call(payload, "data")
  ) {
    payload = payload.data;
  }

  return payload;
}

function normalizeAlertsResponse(response) {
  const payload = unwrapResponse(response);

  if (Array.isArray(payload)) {
    return {
      alerts: payload,
      totalElements: payload.length,
    };
  }

  const content =
    payload?.content ??
    payload?.items ??
    payload?.alerts ??
    payload?.records;

  if (Array.isArray(content)) {
    return {
      alerts: content,
      totalElements:
        payload.totalElements ??
        payload.total ??
        payload.totalCount ??
        content.length,
    };
  }

  return {
    alerts: [],
    totalElements: 0,
  };
}

function getAlertId(alert) {
  return alert?.id ?? alert?.alertId ?? alert?._id ?? null;
}

function normalizeText(value) {
  return String(value ?? "").trim().toLowerCase();
}

function getAlertDate(alert) {
  const value =
    alert?.generatedAt ??
    alert?.createdAt ??
    alert?.updatedAt;

  if (!value) return null;

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
}

function matchesDateFilter(alert, filters) {
  const date = getAlertDate(alert);

  if (!filters.fromDate && !filters.toDate) return true;
  if (!date) return false;

  // Compare calendar dates in local time, consistent with
  // the dates entered in native date inputs.
  if (filters.fromDate) {
    const start = new Date(`${filters.fromDate}T00:00:00`);

    if (!Number.isNaN(start.getTime()) && date < start) {
      return false;
    }
  }

  if (filters.toDate) {
    const end = new Date(`${filters.toDate}T23:59:59.999`);

    if (!Number.isNaN(end.getTime()) && date > end) {
      return false;
    }
  }

  return true;
}

function matchesAlert(alert, filters) {
  const search = normalizeText(filters.search);

  if (search) {
    const searchableFields = [
      alert?.alertCode,
      alert?.title,
      alert?.message,
      alert?.remarks,
      alert?.satelliteId,
      alert?.debrisId,
      alert?.riskId,
      alert?.source,
      alert?.type,
      alert?.severity,
      alert?.status,
    ];

    const matchesSearch = searchableFields.some((value) =>
      normalizeText(value).includes(search)
    );

    if (!matchesSearch) return false;
  }

  for (const key of ["severity", "status", "source", "type"]) {
    const selected = filters[key];

    if (
      selected &&
      selected !== "ALL" &&
      normalizeText(alert?.[key]) !== normalizeText(selected)
    ) {
      return false;
    }
  }

  return matchesDateFilter(alert, filters);
}

function getSeverityRank(severity) {
  const ranks = {
    CRITICAL: 4,
    HIGH: 3,
    MEDIUM: 2,
    LOW: 1,
  };

  return ranks[String(severity ?? "").toUpperCase()] ?? 0;
}

function getSortTimestamp(alert, sortBy) {
  const value =
    sortBy === "updatedAt"
      ? alert?.updatedAt ?? alert?.generatedAt ?? alert?.createdAt
      : alert?.generatedAt ?? alert?.createdAt ?? alert?.updatedAt;

  if (!value) return 0;

  const timestamp = new Date(value).getTime();

  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function sortAlerts(alerts, sortBy, sortDirection) {
  const direction = sortDirection === "asc" ? 1 : -1;

  return [...alerts].sort((a, b) => {
    if (sortBy === "severity") {
      return (
        (getSeverityRank(a?.severity) -
          getSeverityRank(b?.severity)) *
        direction
      );
    }

    return (
      (getSortTimestamp(a, sortBy) -
        getSortTimestamp(b, sortBy)) *
      direction
    );
  });
}

function normalizeSummary(alerts) {
  return alerts.reduce(
    (summary, alert) => {
      const status = String(alert?.status ?? "").toUpperCase();
      const severity = String(alert?.severity ?? "").toUpperCase();

      if (status === "PENDING") summary.pending += 1;

      if (status === "ACKNOWLEDGED") {
        summary.acknowledged += 1;
      }

      if (status === "RESOLVED" || status === "CLOSED") {
        summary.resolved += 1;
      }

      if (severity === "CRITICAL") summary.critical += 1;

      return summary;
    },
    {
      pending: 0,
      acknowledged: 0,
      resolved: 0,
      critical: 0,
    }
  );
}

function AlertsPage() {
  const [alerts, setAlerts] = useState([]);
  const [filters, setFilters] = useState(INITIAL_FILTERS);

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [selectedAlertId, setSelectedAlertId] = useState(null);
  const [selectedAlert, setSelectedAlert] = useState(null);

  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");
  const [statusError, setStatusError] = useState("");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const [currentPage, setCurrentPage] = useState(0);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchAlerts = useCallback(async ({ refresh = false } = {}) => {
    if (refresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    setError("");

    try {
      const response = await api.get(ALERTS_ENDPOINT);
      const result = normalizeAlertsResponse(response);

      setAlerts(result.alerts);
      setLastUpdated(new Date());

      // Keep the selected alert synchronized with the latest list.
      setSelectedAlert((currentSelected) => {
        if (!currentSelected) return currentSelected;

        const selectedId = getAlertId(currentSelected);

        const latest = result.alerts.find(
          (item) =>
            String(getAlertId(item)) === String(selectedId)
        );

        return latest ?? currentSelected;
      });
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  const fetchAlertDetails = useCallback(async (alertId) => {
    if (alertId === null || alertId === undefined || alertId === "") {
      return;
    }

    setIsDetailLoading(true);
    setDetailError("");

    try {
      const response = await api.get(
        `${ALERTS_ENDPOINT}/${encodeURIComponent(alertId)}`
      );

      const payload = unwrapResponse(response);
      const detail = payload?.alert ?? payload;

      if (
        !detail ||
        typeof detail !== "object" ||
        Array.isArray(detail)
      ) {
        throw new Error("The server returned an invalid alert response.");
      }

      // Avoid showing details for an alert that has since been closed.
      setSelectedAlertId((currentId) => {
        if (String(currentId) === String(alertId)) {
          setSelectedAlert(detail);
        }

        return currentId;
      });
    } catch (requestError) {
      setDetailError(getErrorMessage(requestError));
    } finally {
      setIsDetailLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  useEffect(() => {
    if (selectedAlertId === null || selectedAlertId === "") {
      setSelectedAlert(null);
      setDetailError("");
      setStatusError("");
      return;
    }

    fetchAlertDetails(selectedAlertId);
  }, [selectedAlertId, fetchAlertDetails]);

  const filteredAlerts = useMemo(() => {
    const matching = alerts.filter((alert) =>
      matchesAlert(alert, filters)
    );

    return sortAlerts(
      matching,
      filters.sortBy,
      filters.sortDirection
    );
  }, [alerts, filters]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredAlerts.length / PAGE_SIZE)
  );

  const safeCurrentPage = Math.min(currentPage, totalPages - 1);

  const visibleAlerts = useMemo(() => {
    const start = safeCurrentPage * PAGE_SIZE;

    return filteredAlerts.slice(start, start + PAGE_SIZE);
  }, [filteredAlerts, safeCurrentPage]);

  const summary = useMemo(
    () => normalizeSummary(alerts),
    [alerts]
  );

  const hasActiveFilters = Boolean(
    filters.search ||
      filters.fromDate ||
      filters.toDate ||
      filters.severity ||
      filters.status ||
      filters.source ||
      filters.type
  );

  const handleFiltersChange = useCallback((nextFilters) => {
    setFilters((current) => ({
      ...current,
      ...nextFilters,
    }));

    setCurrentPage(0);
  }, []);

  const handleSearchChange = useCallback((search) => {
    setFilters((current) => ({
      ...current,
      search,
    }));

    setCurrentPage(0);
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({ ...INITIAL_FILTERS });
    setCurrentPage(0);
  }, []);

  const handleSelectAlert = useCallback((alert) => {
    const id = getAlertId(alert);

    if (id === null || id === undefined || id === "") {
      setDetailError("This alert does not contain a usable identifier.");
      return;
    }

    setStatusError("");
    setDetailError("");
    setSelectedAlert(alert);
    setSelectedAlertId(id);
  }, []);

  const handleCloseDetails = useCallback(() => {
    setSelectedAlertId(null);
    setSelectedAlert(null);
    setDetailError("");
    setStatusError("");
    setIsDetailLoading(false);
  }, []);

  const handleStatusChange = useCallback(
    async (nextStatus, remarks) => {
      const alertId = getAlertId(selectedAlert);

      if (alertId === null || alertId === undefined || alertId === "") {
        throw new Error("Unable to identify the selected alert.");
      }

      setIsUpdatingStatus(true);
      setStatusError("");

      try {
        // Preserve the existing status endpoint and request DTO shape.
        await api.put(
          `${ALERTS_ENDPOINT}/${encodeURIComponent(alertId)}/status`,
          {
            status: nextStatus,
            remarks: remarks || "",
          }
        );

        await fetchAlerts({ refresh: true });
        await fetchAlertDetails(alertId);
      } catch (requestError) {
        const message = getErrorMessage(requestError);
        setStatusError(message);
        throw new Error(message);
      } finally {
        setIsUpdatingStatus(false);
      }
    },
    [selectedAlert, fetchAlerts, fetchAlertDetails]
  );

  const handlePageChange = useCallback(
    (nextPage) => {
      const page = Number(nextPage);

      if (!Number.isFinite(page)) return;

      setCurrentPage(
        Math.max(0, Math.min(Math.floor(page), totalPages - 1))
      );
    },
    [totalPages]
  );

  // These callbacks intentionally do not navigate until the real
  // application route paths are confirmed.
  const handleViewRisk = useCallback((riskId) => {
    if (!riskId) return;
  }, []);

  const handleViewSatellite = useCallback((satelliteId) => {
    if (!satelliteId) return;
  }, []);

  const handleViewDebris = useCallback((debrisId) => {
    if (!debrisId) return;
  }, []);

  return (
    <main className="relative min-h-full min-w-0 overflow-x-clip bg-[#020914] text-slate-100">
      <div className="mx-auto w-full max-w-[1800px] min-w-0 space-y-5 px-4 py-5 sm:space-y-6 sm:px-6 sm:py-6 xl:px-8 xl:py-7">
        {/* Page header */}
        <section className="min-w-0">
          <AlertsHeader
            onRefresh={() => fetchAlerts({ refresh: true })}
            isRefreshing={isRefreshing}
            lastUpdated={lastUpdated}
            pendingCount={summary.pending}
          />
        </section>

        {/* Summary cards */}
        <section className="min-w-0" aria-label="Alert summary">
          <AlertSummary
            alerts={alerts}
            summary={summary}
            isLoading={isLoading}
            error={error}
            activeFilter={filters.status || "ALL"}
            onSelectFilter={(status) => {
              handleFiltersChange({
                status: status === "ALL" ? "" : status,
              });
            }}
          />
        </section>

        {/* Search and filters */}
        <section
          className="min-w-0"
          aria-label="Search and filter alerts"
        >
          <AlertToolbar
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onSearchChange={handleSearchChange}
            onRefresh={() => fetchAlerts({ refresh: true })}
            isRefreshing={isRefreshing}
            isLoading={isLoading}
          />
        </section>

        {/* The single visible Alert Feed heading belongs here. */}
        <section
          className="min-w-0"
          aria-label="Alert feed"
          aria-live="polite"
        >
          <div className="mb-3 flex flex-col gap-2 border-b border-white/[0.06] pb-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span
                  className="h-4 w-1 shrink-0 rounded-full bg-cyan-300"
                  aria-hidden="true"
                />

                <h2 className="font-['Orbitron'] text-base font-semibold tracking-wide text-slate-100 sm:text-lg">
                  Alert Feed
                </h2>
              </div>

              <p className="mt-1 pl-3 text-xs leading-5 text-slate-500 sm:text-sm">
                Monitor, investigate, and manage orbital incidents.
              </p>
            </div>

            {!isLoading && !error && (
              <p className="shrink-0 pl-3 text-xs text-slate-400 sm:pl-0">
                <span className="font-semibold text-slate-200">
                  {filteredAlerts.length}
                </span>{" "}
                matching{" "}
                {filteredAlerts.length === 1 ? "alert" : "alerts"}
              </p>
            )}
          </div>

          {isLoading ? (
            <AlertListSkeleton count={4} />
          ) : error ? (
            <AlertEmptyState
              variant="error"
              title="Unable to load alerts"
              description={error}
              onRetry={() => fetchAlerts()}
              isLoading={isRefreshing}
            />
          ) : filteredAlerts.length === 0 ? (
            <AlertEmptyState
              variant={hasActiveFilters ? "filtered" : "default"}
              title={
                hasActiveFilters
                  ? "No matching alerts"
                  : "No alerts available"
              }
              description={
                hasActiveFilters
                  ? "Adjust your search or filters to find matching alerts."
                  : "Alerts will appear here when returned by the backend."
              }
              hasActiveFilters={hasActiveFilters}
              onClearFilters={handleClearFilters}
            />
          ) : (
            <AlertList
              alerts={visibleAlerts}
              isLoading={false}
              error={null}
              onRetry={() => fetchAlerts()}
              onSelectAlert={handleSelectAlert}
              selectedAlertId={selectedAlertId}
              hasActiveFilters={hasActiveFilters}
              onClearFilters={handleClearFilters}
              totalElements={filteredAlerts.length}
              currentPage={safeCurrentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </section>

        {/* Refresh feedback */}
        {isRefreshing && (
          <div
            className="flex items-center gap-2 text-xs text-slate-500"
            role="status"
            aria-live="polite"
          >
            <FiRefreshCw className="h-3.5 w-3.5 animate-spin motion-reduce:animate-none" />
            Synchronizing alerts with the server…
          </div>
        )}
      </div>

      {/* Selected alert details drawer */}
      {selectedAlertId !== null && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <button
            type="button"
            className="absolute inset-0 cursor-default bg-black/65 backdrop-blur-sm"
            aria-label="Close alert details"
            onClick={handleCloseDetails}
          />

          <aside
            className="relative z-10 flex h-full w-full max-w-2xl flex-col overflow-y-auto overscroll-contain border-l border-white/[0.08] bg-[#030b16] shadow-2xl"
            aria-label="Alert details panel"
            aria-busy={isDetailLoading || isUpdatingStatus}
          >
            <AlertDetailsPanel
              alert={selectedAlert}
              onClose={handleCloseDetails}
              onViewRisk={handleViewRisk}
              onViewSatellite={handleViewSatellite}
              onViewDebris={handleViewDebris}
              isLoading={isDetailLoading}
              error={detailError}
              onRetry={() => fetchAlertDetails(selectedAlertId)}
              actions={
                selectedAlert ? (
                  <div className="space-y-3">
                    {statusError && (
                      <div
                        className="flex items-start gap-2 break-words rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300"
                        role="alert"
                      >
                        <FiAlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                        <span>{statusError}</span>
                      </div>
                    )}

                    <AlertStatusActions
                      alert={selectedAlert}
                      onStatusChange={handleStatusChange}
                      isUpdating={isUpdatingStatus}
                      error={statusError}
                    />
                  </div>
                ) : null
              }
            />
          </aside>
        </div>
      )}
    </main>
  );
}

export default AlertsPage;
