package com.orbitguard.report.service;

import com.orbitguard.common.response.ApiResponse;
import com.orbitguard.report.dto.request.ReportGenerationRequest;
import com.orbitguard.report.dto.response.ReportResponse;
import com.orbitguard.report.dto.response.ReportSummaryResponse;
import com.orbitguard.report.enums.ReportStatus;
import com.orbitguard.report.enums.ReportType;

import java.util.List;

/**
 * ==============================================================
 * Report Service
 * ==============================================================
 *
 * Defines the business operations supported by the Reports
 * module of OrbitGuard AI.
 *
 * <p>
 * This interface represents the service-layer contract between
 * the Reports controller and the service implementation.
 * </p>
 *
 * <p>
 * The service layer is responsible for business orchestration,
 * validation, report lifecycle management, persistence
 * coordination, and response construction.
 * </p>
 *
 * <p>
 * Standard {@link ApiResponse} wrappers are used to maintain
 * consistency with the existing OrbitGuard AI backend response
 * architecture.
 * </p>
 *
 * @author OrbitGuard AI Team
 * @version 1.0
 */
public interface ReportService {

    /**
     * ==============================================================
     * Generate Report
     * ==============================================================
     *
     * Generates and persists a new report using the supplied
     * report-generation request.
     *
     * @param request report generation request
     * @return standard API response containing the generated report
     */
    ApiResponse<ReportResponse> generateReport(
            ReportGenerationRequest request
    );


    /**
     * ==============================================================
     * Get Report By Code
     * ==============================================================
     *
     * Retrieves a specific report using its unique business code.
     *
     * @param reportCode unique report business code
     * @return standard API response containing the requested report
     */
    ApiResponse<ReportResponse> getReportByCode(
            String reportCode
    );


    /**
     * ==============================================================
     * Get All Reports
     * ==============================================================
     *
     * Retrieves all reports as lightweight summary responses.
     *
     * <p>
     * Summary responses are used here instead of the detailed
     * {@link ReportResponse} representation to keep report-listing
     * responses lightweight.
     * </p>
     *
     * @return standard API response containing report summaries
     */
    ApiResponse<List<ReportSummaryResponse>> getAllReports();


    /**
     * ==============================================================
     * Get Reports By Type
     * ==============================================================
     *
     * Retrieves reports belonging to the specified report type.
     *
     * @param reportType report type used for filtering
     * @return standard API response containing matching reports
     */
    ApiResponse<List<ReportSummaryResponse>> getReportsByType(
            ReportType reportType
    );


    /**
     * ==============================================================
     * Get Reports By Status
     * ==============================================================
     *
     * Retrieves reports having the specified processing status.
     *
     * @param status report status used for filtering
     * @return standard API response containing matching reports
     */
    ApiResponse<List<ReportSummaryResponse>> getReportsByStatus(
            ReportStatus status
    );


    /**
     * ==============================================================
     * Get Reports By Type And Status
     * ==============================================================
     *
     * Retrieves reports matching both the supplied report type
     * and processing status.
     *
     * @param reportType report type used for filtering
     * @param status report status used for filtering
     * @return standard API response containing matching reports
     */
    ApiResponse<List<ReportSummaryResponse>>
    getReportsByTypeAndStatus(
            ReportType reportType,
            ReportStatus status
    );


    /**
     * ==============================================================
     * Delete Report
     * ==============================================================
     *
     * Deletes a report using its unique business code.
     *
     * @param reportCode unique report business code
     * @return standard API response indicating successful deletion
     */
    ApiResponse<Void> deleteReport(
            String reportCode
    );


    /**
     * ==============================================================
     * Generate Report PDF
     * ==============================================================
     *
     * Generates a PDF representation of an existing report.
     *
     * <p>
     * The report is located using its unique business code and
     * delegated to the PDF generator for document creation.
     * </p>
     *
     * @param reportCode unique report business code
     * @return generated PDF content as a byte array
     */
    byte[] generateReportPdf(String reportCode);
}