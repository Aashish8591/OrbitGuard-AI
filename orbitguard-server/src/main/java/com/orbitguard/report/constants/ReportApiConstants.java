package com.orbitguard.report.constants;

/**
 * Centralized constants used by the Reports module.
 *
 * <p>
 * This class contains API paths, request parameter names,
 * and standard messages related to report operations.
 * </p>
 *
 * <p>
 * Business logic must not be implemented in this class.
 * </p>
 */
public final class ReportApiConstants {

    /**
     * Private constructor to prevent instantiation.
     */
    private ReportApiConstants() {
        throw new IllegalStateException("Utility class");
    }

    // ============================================================
    // API BASE PATHS
    // ============================================================

    /**
     * Base API path for Reports module.
     */
    public static final String REPORTS_BASE_PATH = "/api/reports";

    /**
     * API path for operations on a specific report.
     */
    public static final String REPORT_BY_ID_PATH = "/{reportId}";

    /**
     * Complete API path for a specific report.
     */
    public static final String REPORT_DETAILS_PATH =
            REPORTS_BASE_PATH + REPORT_BY_ID_PATH;


    // ============================================================
    // REQUEST PARAMETER NAMES
    // ============================================================

    /**
     * Request parameter used to filter reports by report type.
     */
    public static final String REPORT_TYPE_PARAM = "reportType";

    /**
     * Request parameter used to filter reports by report status.
     */
    public static final String REPORT_STATUS_PARAM = "status";

    /**
     * Request parameter used for pagination page number.
     */
    public static final String PAGE_PARAM = "page";

    /**
     * Request parameter used for pagination page size.
     */
    public static final String SIZE_PARAM = "size";

    /**
     * Request parameter used for sorting.
     */
    public static final String SORT_BY_PARAM = "sortBy";

    /**
     * Request parameter used for sorting direction.
     */
    public static final String SORT_DIRECTION_PARAM = "sortDirection";


    // ============================================================
    // PATH VARIABLE NAMES
    // ============================================================

    /**
     * Path variable representing the report identifier.
     */
    public static final String REPORT_ID_PATH_VARIABLE = "reportId";


    // ============================================================
    // SUCCESS MESSAGES
    // ============================================================

    /**
     * Message returned after successful report generation.
     */
    public static final String REPORT_GENERATED_SUCCESS_MESSAGE =
            "Report generated successfully.";

    /**
     * Message returned after successfully retrieving reports.
     */
    public static final String REPORTS_RETRIEVED_SUCCESS_MESSAGE =
            "Reports retrieved successfully.";

    /**
     * Message returned after successfully retrieving a report.
     */
    public static final String REPORT_RETRIEVED_SUCCESS_MESSAGE =
            "Report retrieved successfully.";

    /**
     * Message returned after successfully generating a report PDF.
     */
    public static final String REPORT_PDF_GENERATED_SUCCESS_MESSAGE =
            "Report PDF generated successfully.";


    // ============================================================
    // ERROR MESSAGES
    // ============================================================

    /**
     * Message used when the requested report cannot be found.
     */
    public static final String REPORT_NOT_FOUND_MESSAGE =
            "Report not found.";

    /**
     * Message used when report generation fails.
     */
    public static final String REPORT_GENERATION_FAILED_MESSAGE =
            "Report generation failed.";

    /**
     * Message used when PDF generation fails.
     */
    public static final String REPORT_PDF_GENERATION_FAILED_MESSAGE =
            "Report PDF generation failed.";

    /**
     * Message used when an invalid report type is supplied.
     */
    public static final String INVALID_REPORT_TYPE_MESSAGE =
            "Invalid report type.";

    /**
     * Message used when an invalid report status is supplied.
     */
    public static final String INVALID_REPORT_STATUS_MESSAGE =
            "Invalid report status.";


    // ============================================================
    // VALIDATION / GENERAL CONSTANTS
    // ============================================================

    /**
     * Default page number used when pagination is not explicitly supplied.
     */
    public static final int DEFAULT_PAGE = 0;

    /**
     * Default page size used when pagination is not explicitly supplied.
     */
    public static final int DEFAULT_PAGE_SIZE = 10;

    /**
     * Maximum page size allowed for report listing APIs.
     */
    public static final int MAX_PAGE_SIZE = 100;
}