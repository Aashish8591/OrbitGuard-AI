
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  FiAlertCircle,
  FiRefreshCw,
  FiShield,
} from "react-icons/fi";

import {
  getAlerts,
  getAlertById,
  updateAlertStatus,
  getAlertErrorMessage,
} from "../../services/alertService";

import AlertsHeader from "../../features/alerts/components/AlertsHeader";
import AlertSummary from "../../features/alerts/components/AlertSummary";
import AlertToolbar from "../../features/alerts/components/AlertToolbar";
import AlertList from "../../features/alerts/components/AlertList";
import AlertListSkeleton from "../../features/alerts/components/AlertListSkeleton";
import AlertDetailsPanel from "../../features/alerts/components/AlertDetailsPanel";
import AlertStatusActions from "../../features/alerts/components/AlertStatusActions";
import AlertEmptyState from "../../features/alerts/components/AlertEmptyState";
import ProtectedBackground from "../../components/common/ProtectedBackground";

const PAGE_SIZE = 8;
const ALERT_FETCH_SIZE = 100;

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

/* -------------------------------------------------------------------------- */
/* API response normalization                                                 */
/* -------------------------------------------------------------------------- */

function unwrapResponse(response) {
  let payload = response?.data ?? response;

  // Unwrap recognized API response envelopes.
  // Limit nesting to avoid accidentally unwrapping domain objects.
  for (let depth = 0; depth < 3; depth += 1) {
    if (
      payload &&
      !Array.isArray(payload) &&
      typeof payload === "object" &&
      Object.prototype.hasOwnProperty.call(payload, "data") &&
      (
        Object.prototype.hasOwnProperty.call(payload, "success") ||
        Object.prototype.hasOwnProperty.call(payload, "message") ||
        Object.prototype.hasOwnProperty.call(payload, "status")
      )
    ) {
      payload = payload.data;
      continue;
    }

    break;
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

  if (!payload || typeof payload !== "object") {
    throw new Error(
      "The Alert API returned an unsupported response format.",
    );
  }

  const content =
    payload.content ??
    payload.items ??
    payload.alerts ??
    payload.records;

  if (!Array.isArray(content)) {
    throw new Error(
      "The Alert API response does not contain an alerts array. " +
      "Check the response structure in the browser Network tab.",
    );
  }

  const rawTotal =
    payload.totalElements ??
    payload.total ??
    payload.totalCount ??
    content.length;

  const parsedTotal = Number(rawTotal);

  return {
    alerts: content,
    totalElements:
      Number.isFinite(parsedTotal) && parsedTotal >= 0
        ? parsedTotal
        : content.length,
  };
}

function normalizeAlertDetails(response) {
  let payload = unwrapResponse(response);

  if (
    payload &&
    !Array.isArray(payload) &&
    typeof payload === "object" &&
    payload.alert
  ) {
    payload = payload.alert;
  }

  if (
    !payload ||
    typeof payload !== "object" ||
    Array.isArray(payload)
  ) {
    throw new Error(
      "The server returned an invalid alert response.",
    );
  }

  return payload;
}

/* -------------------------------------------------------------------------- */
/* Alert utilities                                                             */
/* -------------------------------------------------------------------------- */

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
  if (!filters.fromDate && !filters.toDate) {
    return true;
  }

  const date = getAlertDate(alert);

  if (!date) return false;

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

    const hasMatch = searchableFields.some((value) =>
      normalizeText(value).includes(search),
    );

    if (!hasMatch) return false;
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
  // Preserve the user's selected sorting semantics.
  // generatedAt remains the default because the backend uses it.
  const value =
    sortBy === "createdAt"
      ? alert?.createdAt ?? alert?.generatedAt ?? alert?.updatedAt
      : sortBy === "updatedAt"
        ? alert?.updatedAt ?? alert?.generatedAt ?? alert?.createdAt
        : alert?.generatedAt ?? alert?.createdAt ?? alert?.updatedAt;

  if (!value) return 0;

  const timestamp = new Date(value).getTime();

  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function sortAlerts(alerts, sortBy, sortDirection) {
  const direction =
    String(sortDirection).toLowerCase() === "asc" ? 1 : -1;

  return [...alerts].sort((a, b) => {
    if (sortBy === "severity") {
      return (
        (getSeverityRank(a?.severity) -
          getSeverityRank(b?.severity)) *
        direction
      );
    }

    const difference =
      getSortTimestamp(a, sortBy) -
      getSortTimestamp(b, sortBy);

    if (difference !== 0) {
      return difference * direction;
    }

    // Deterministic fallback for equal or missing timestamps.
    return String(getAlertId(b) ?? "").localeCompare(
      String(getAlertId(a) ?? ""),
    );
  });
}

function normalizeSummary(alerts) {
  return alerts.reduce(
    (summary, alert) => {
      const status = String(alert?.status ?? "").toUpperCase();
      const severity = String(alert?.severity ?? "").toUpperCase();

      if (status === "PENDING") summary.pending += 1;
      if (status === "ACKNOWLEDGED") summary.acknowledged += 1;

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
    },
  );
}

/* -------------------------------------------------------------------------- */
/* Alerts page                                                                 */
/* -------------------------------------------------------------------------- */

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

  const alertsRequestId = useRef(0);
  const detailRequestId = useRef(0);
  const statusRequestId = useRef(0);
  const mountedRef = useRef(false);

  const selectedAlertIdRef = useRef(null);
  const modalRef = useRef(null);
  const closeButtonRef = useRef(null);
  const previousFocusRef = useRef(null);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
      alertsRequestId.current += 1;
      detailRequestId.current += 1;
      statusRequestId.current += 1;
    };
  }, []);

  const fetchAlerts = useCallback(
    async ({ refresh = false } = {}) => {
      const requestId = ++alertsRequestId.current;

      if (refresh) {
        setCurrentPage(0);
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      setError("");

      try {
        const response = await getAlerts({
          page: 0,
          size: ALERT_FETCH_SIZE,
          sortBy: filters.sortBy || "generatedAt",
          sortDirection: filters.sortDirection || "desc",
        });

        const result = normalizeAlertsResponse(response);

        if (
          !mountedRef.current ||
          requestId !== alertsRequestId.current
        ) {
          return;
        }

        setAlerts(result.alerts);
        setLastUpdated(new Date());

        // Keep the open detail panel synchronized when the selected
        // alert is included in the newly fetched batch.
        setSelectedAlert((currentSelected) => {
          if (!currentSelected) return currentSelected;

          const selectedId = getAlertId(currentSelected);

          const latest = result.alerts.find(
            (item) =>
              String(getAlertId(item)) === String(selectedId),
          );

          return latest ?? currentSelected;
        });
      } catch (requestError) {
        if (
          mountedRef.current &&
          requestId === alertsRequestId.current
        ) {
          setError(getAlertErrorMessage(requestError));
        }
      } finally {
        if (
          mountedRef.current &&
          requestId === alertsRequestId.current
        ) {
          setIsLoading(false);
          setIsRefreshing(false);
        }
      }
    },
    [filters.sortBy, filters.sortDirection],
  );

  const fetchAlertDetails = useCallback(async (alertId) => {
    if (
      alertId === null ||
      alertId === undefined ||
      alertId === ""
    ) {
      return;
    }

    const requestId = ++detailRequestId.current;

    setIsDetailLoading(true);
    setDetailError("");

    try {
      const response = await getAlertById(alertId);
      const detail = normalizeAlertDetails(response);

      if (
        mountedRef.current &&
        requestId === detailRequestId.current &&
        String(selectedAlertIdRef.current) === String(alertId)
      ) {
        setSelectedAlert(detail);
      }
    } catch (requestError) {
      if (
        mountedRef.current &&
        requestId === detailRequestId.current &&
        String(selectedAlertIdRef.current) === String(alertId)
      ) {
        setDetailError(getAlertErrorMessage(requestError));
      }
    } finally {
      if (
        mountedRef.current &&
        requestId === detailRequestId.current
      ) {
        setIsDetailLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    void fetchAlerts();

    return () => {
      alertsRequestId.current += 1;
    };
  }, [fetchAlerts]);

  useEffect(() => {
    selectedAlertIdRef.current = selectedAlertId;

    if (selectedAlertId === null || selectedAlertId === "") {
      detailRequestId.current += 1;
      setSelectedAlert(null);
      setDetailError("");
      setStatusError("");
      setIsDetailLoading(false);
      return undefined;
    }

    void fetchAlertDetails(selectedAlertId);

    return () => {
      detailRequestId.current += 1;
    };
  }, [selectedAlertId, fetchAlertDetails]);

  // Lock background scrolling and restore focus after closing.
  useEffect(() => {
    if (selectedAlertId === null) return undefined;

    previousFocusRef.current = document.activeElement;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const frame = window.requestAnimationFrame(() => {
      closeButtonRef.current?.focus();
    });

    return () => {
      document.body.style.overflow = previousOverflow;
      window.cancelAnimationFrame(frame);

      const previousElement = previousFocusRef.current;

      if (previousElement && typeof previousElement.focus === "function") {
        previousElement.focus();
      }
    };
  }, [selectedAlertId]);

  const handleCloseDetails = useCallback(() => {
    if (isUpdatingStatus) return;

    detailRequestId.current += 1;
    selectedAlertIdRef.current = null;

    setSelectedAlertId(null);
    setSelectedAlert(null);
    setDetailError("");
    setStatusError("");
    setIsDetailLoading(false);
  }, [isUpdatingStatus]);

  // Escape closes the modal; Tab remains within the dialog.
  useEffect(() => {
    if (selectedAlertId === null) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !isUpdatingStatus) {
        handleCloseDetails();
      }

      if (event.key !== "Tab") return;

      const modal = modalRef.current;
      if (!modal) return;

      const focusable = modal.querySelectorAll(
        'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
      );

      const items = Array.from(focusable).filter(
        (element) =>
          !element.hasAttribute("aria-hidden") &&
          element.getAttribute("aria-disabled") !== "true",
      );

      if (!items.length) {
        event.preventDefault();
        modal.focus();
        return;
      }

      const first = items[0];
      const last = items[items.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (
        !event.shiftKey &&
        document.activeElement === last
      ) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    selectedAlertId,
    isUpdatingStatus,
    handleCloseDetails,
  ]);

  const filteredAlerts = useMemo(() => {
    const matching = alerts.filter((alert) =>
      matchesAlert(alert, filters),
    );

    return sortAlerts(
      matching,
      filters.sortBy,
      filters.sortDirection,
    );
  }, [alerts, filters]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredAlerts.length / PAGE_SIZE),
  );

  const safeCurrentPage = Math.min(currentPage, totalPages - 1);

  // Keep the controlled page index valid if filters reduce the
  // number of pages while the user is viewing a later page.
  useEffect(() => {
    if (currentPage !== safeCurrentPage) {
      setCurrentPage(safeCurrentPage);
    }
  }, [currentPage, safeCurrentPage]);

  const visibleAlerts = useMemo(() => {
    const start = safeCurrentPage * PAGE_SIZE;

    return filteredAlerts.slice(start, start + PAGE_SIZE);
  }, [filteredAlerts, safeCurrentPage]);

  const summary = useMemo(
    () => normalizeSummary(alerts),
    [alerts],
  );

  const hasActiveFilters = Boolean(
    filters.search ||
      filters.fromDate ||
      filters.toDate ||
      filters.severity ||
      filters.status ||
      filters.source ||
      filters.type,
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
      setDetailError(
        "This alert does not contain a usable identifier.",
      );
      return;
    }

    setStatusError("");
    setDetailError("");
    setSelectedAlert(alert);
    setSelectedAlertId(id);
  }, []);

  const handleStatusChange = useCallback(
    async (nextStatus, remarks) => {
      const alertId = getAlertId(selectedAlert);

      if (
        alertId === null ||
        alertId === undefined ||
        alertId === ""
      ) {
        throw new Error("Unable to identify the selected alert.");
      }

      if (isUpdatingStatus) return;

      const requestId = ++statusRequestId.current;

      setIsUpdatingStatus(true);
      setStatusError("");

      try {
        await updateAlertStatus(alertId, {
          status: nextStatus,
          remarks: remarks || "",
        });

        // Reload the list after the server confirms the status change.
        await fetchAlerts({ refresh: true });

        if (
          mountedRef.current &&
          String(selectedAlertIdRef.current) === String(alertId)
        ) {
          await fetchAlertDetails(alertId);
        }
      } catch (requestError) {
        const message = getAlertErrorMessage(requestError);

        if (mountedRef.current) {
          setStatusError(message);
        }

        throw new Error(message);
      } finally {
        if (
          mountedRef.current &&
          requestId === statusRequestId.current
        ) {
          setIsUpdatingStatus(false);
        }
      }
    },
    [
      selectedAlert,
      isUpdatingStatus,
      fetchAlerts,
      fetchAlertDetails,
    ],
  );

  const handlePageChange = useCallback(
    (nextPage) => {
      const page = Number(nextPage);

      if (!Number.isFinite(page)) return;

      setCurrentPage(
        Math.max(0, Math.min(Math.floor(page), totalPages - 1)),
      );
    },
    [totalPages],
  );

  // Keep these callbacks until the actual application route paths
  // for related risk, satellite and debris views are confirmed.
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
    <main className="relative isolate min-h-full min-w-0 overflow-x-clip bg-transparent text-slate-100">
      <ProtectedBackground />

      <div className="relative z-10 mx-auto w-full max-w-[1800px] min-w-0 space-y-5 px-4 py-5 sm:space-y-6 sm:px-6 sm:py-6 xl:px-8 xl:py-7">
        <section className="min-w-0">
          <AlertsHeader
            onRefresh={() => fetchAlerts({ refresh: true })}
            isRefreshing={isRefreshing}
            lastUpdated={lastUpdated}
            pendingCount={summary.pending}
          />
        </section>

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

      {selectedAlertId !== null && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center bg-black/80 pt-[84px] backdrop-blur-md sm:items-center sm:p-40 lg:p-20">
          <button
            type="button"
            className="absolute inset-0 cursor-default"
            aria-label="Close alert details"
            onClick={handleCloseDetails}
            disabled={isUpdatingStatus}
          />

          <section
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-label="Alert investigation console"
            tabIndex={-1}
            className="relative z-10 flex h-[calc(100dvh-84px)] w-full min-h-0 flex-col overflow-hidden border border-white/[0.08] bg-[#030b16] shadow-2xl shadow-black/60 sm:h-[92dvh] sm:max-h-[550px] sm:max-w-5xl sm:rounded-2xl lg:max-w-6xl"
          >
            <header className="flex shrink-0 items-center justify-between gap-3 border-b border-white/[0.08] bg-[#06101e] px-4 py-3 sm:px-6">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-cyan-300/15 bg-cyan-300/[0.07] text-cyan-300">
                  <FiShield className="h-4 w-4" aria-hidden="true" />
                </span>

                <div className="min-w-0">
                  <p className="font-['Orbitron'] text-xs font-semibold tracking-wide text-slate-100 sm:text-sm">
                    INCIDENT CONSOLE
                  </p>
                  <p className="mt-1 truncate text-[10px] text-slate-500 sm:text-xs">
                    OrbitGuard AI / Alert investigation
                  </p>
                </div>
              </div>

              <button
                ref={closeButtonRef}
                type="button"
                onClick={handleCloseDetails}
                disabled={isUpdatingStatus}
                aria-label="Close incident console"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 text-slate-400 transition-colors hover:bg-white/[0.06] hover:text-white disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60"
              >
                <span className="text-xl leading-none" aria-hidden="true">
                  ×
                </span>
              </button>
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
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
            </div>
          </section>
        </div>
      )}
    </main>
  );
}

export default AlertsPage;
