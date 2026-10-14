import { useMemo } from "react";
import {
  FiChevronLeft,
  FiChevronRight,
  FiChevronsLeft,
  FiChevronsRight,
} from "react-icons/fi";

const DEFAULT_PAGE_SIZES = [10, 20, 50, 100];

function getPageItems(currentPage, totalPages) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, "ellipsis-right", totalPages];
  }

  if (currentPage >= totalPages - 3) {
    return [
      1,
      "ellipsis-left",
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }

  return [
    1,
    "ellipsis-left",
    currentPage - 1,
    currentPage,
    currentPage + 1,
    "ellipsis-right",
    totalPages,
  ];
}

function PaginationButton({
  label,
  onClick,
  disabled = false,
  active = false,
  children,
  className = "",
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-current={active ? "page" : undefined}
      disabled={disabled}
      onClick={onClick}
      className={[
        "inline-flex h-9 min-w-9 items-center justify-center rounded-lg",
        "border px-2 text-sm font-medium transition-colors duration-150",
        "focus-visible:outline-none focus-visible:ring-2",
        "focus-visible:ring-cyan-400 focus-visible:ring-offset-2",
        "focus-visible:ring-offset-slate-950",
        active
          ? "border-cyan-400/50 bg-cyan-400 text-slate-950"
          : "border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-700 hover:bg-slate-800 hover:text-white",
        disabled
          ? "cursor-not-allowed opacity-40 hover:border-slate-800 hover:bg-slate-900 hover:text-slate-300"
          : "",
        className,
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function ReportPagination({
  page = 1,
  totalPages,
  totalItems,
  pageSize = 10,
  onPageChange,
  onPageSizeChange,
  pageSizes = DEFAULT_PAGE_SIZES,
  loading = false,
  showPageSize = true,
  showItemCount = true,
  className = "",
}) {
  const normalizedPageSize = Math.max(1, Number(pageSize) || 10);
  const normalizedTotalItems = Math.max(0, Number(totalItems) || 0);

  const calculatedTotalPages = Math.ceil(
    normalizedTotalItems / normalizedPageSize,
  );

  const resolvedTotalPages =
    totalPages == null
      ? calculatedTotalPages
      : Math.max(0, Number(totalPages) || 0);

  const safeTotalPages =
    normalizedTotalItems === 0 && totalPages == null
      ? 0
      : resolvedTotalPages;

  const currentPage =
    safeTotalPages === 0
      ? 1
      : Math.min(
          Math.max(1, Number(page) || 1),
          safeTotalPages,
        );

  const pageItems = useMemo(
    () => getPageItems(currentPage, safeTotalPages),
    [currentPage, safeTotalPages],
  );

  const firstItem =
    normalizedTotalItems === 0
      ? 0
      : (currentPage - 1) * normalizedPageSize + 1;

  const lastItem = Math.min(
    currentPage * normalizedPageSize,
    normalizedTotalItems,
  );

  const canGoPrevious = currentPage > 1;
  const canGoNext =
    safeTotalPages > 0 && currentPage < safeTotalPages;

  const handlePageChange = (nextPage) => {
    if (
      loading ||
      typeof onPageChange !== "function" ||
      nextPage < 1 ||
      nextPage > safeTotalPages ||
      nextPage === currentPage
    ) {
      return;
    }

    onPageChange(nextPage);
  };

  const handlePageSizeChange = (event) => {
    const nextSize = Number(event.target.value);

    if (
      !Number.isFinite(nextSize) ||
      nextSize <= 0 ||
      nextSize === normalizedPageSize ||
      typeof onPageSizeChange !== "function"
    ) {
      return;
    }

    onPageSizeChange(nextSize);
  };

  if (safeTotalPages <= 1 && !showPageSize) {
    return null;
  }

  return (
    <nav
      aria-label="Report pagination"
      className={[
        "flex min-w-0 flex-col gap-4 border-t border-slate-800",
        "px-4 py-4 sm:px-5",
        "lg:flex-row lg:items-center lg:justify-between",
        className,
      ].join(" ")}
      aria-busy={loading}
    >
      {/* Item range and page size */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between lg:justify-start">
        {showItemCount && (
          <p
            className="text-xs leading-5 text-slate-400"
            aria-live="polite"
          >
            {normalizedTotalItems === 0 ? (
              "No reports to display"
            ) : (
              <>
                Showing{" "}
                <span className="font-semibold text-slate-200">
                  {firstItem}–{lastItem}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-slate-200">
                  {normalizedTotalItems}
                </span>{" "}
                reports
              </>
            )}
          </p>
        )}

        {showPageSize && (
          <label className="flex items-center gap-2 text-xs text-slate-400">
            <span className="shrink-0">Rows per page</span>

            <select
              value={normalizedPageSize}
              onChange={handlePageSizeChange}
              disabled={loading || typeof onPageSizeChange !== "function"}
              className={[
                "h-9 rounded-lg border border-slate-800",
                "bg-slate-900 px-2 text-sm text-slate-200",
                "outline-none transition-colors",
                "focus:border-cyan-400/60 focus:ring-1 focus:ring-cyan-400/30",
                "disabled:cursor-not-allowed disabled:opacity-50",
              ].join(" ")}
            >
              {!pageSizes.includes(normalizedPageSize) && (
                <option value={normalizedPageSize}>
                  {normalizedPageSize}
                </option>
              )}

              {pageSizes.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      {/* Page controls */}
      {safeTotalPages > 1 && (
        <div className="flex min-w-0 items-center justify-between gap-2 sm:justify-end">
          <div className="flex items-center gap-1">
            <PaginationButton
              label="Go to first page"
              disabled={!canGoPrevious || loading}
              onClick={() => handlePageChange(1)}
              className="hidden sm:inline-flex"
            >
              <FiChevronsLeft size={16} />
            </PaginationButton>

            <PaginationButton
              label="Go to previous page"
              disabled={!canGoPrevious || loading}
              onClick={() => handlePageChange(currentPage - 1)}
            >
              <FiChevronLeft size={16} />
              <span className="ml-1 hidden sm:inline">Previous</span>
            </PaginationButton>
          </div>

          <div className="flex min-w-0 items-center gap-1">
            {pageItems.map((item, index) => {
              if (typeof item === "string") {
                return (
                  <span
                    key={`${item}-${index}`}
                    aria-hidden="true"
                    className="flex h-9 min-w-5 items-center justify-center text-sm text-slate-500"
                  >
                    …
                  </span>
                );
              }

              return (
                <PaginationButton
                  key={item}
                  label={`Go to page ${item}`}
                  active={item === currentPage}
                  disabled={loading}
                  onClick={() => handlePageChange(item)}
                  className={
                    item !== currentPage
                      ? "hidden sm:inline-flex"
                      : ""
                  }
                >
                  {item}
                </PaginationButton>
              );
            })}
          </div>

          <div className="flex items-center gap-1">
            <PaginationButton
              label="Go to next page"
              disabled={!canGoNext || loading}
              onClick={() => handlePageChange(currentPage + 1)}
            >
              <span className="mr-1 hidden sm:inline">Next</span>
              <FiChevronRight size={16} />
            </PaginationButton>

            <PaginationButton
              label="Go to last page"
              disabled={!canGoNext || loading}
              onClick={() => handlePageChange(safeTotalPages)}
              className="hidden sm:inline-flex"
            >
              <FiChevronsRight size={16} />
            </PaginationButton>
          </div>
        </div>
      )}
    </nav>
  );
}

export default ReportPagination;