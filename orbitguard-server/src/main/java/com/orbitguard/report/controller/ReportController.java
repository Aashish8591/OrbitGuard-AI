package com.orbitguard.report.controller;

import com.orbitguard.common.response.ApiResponse;
import com.orbitguard.report.constants.ReportApiConstants;
import com.orbitguard.report.dto.request.ReportGenerationRequest;
import com.orbitguard.report.dto.response.ReportResponse;
import com.orbitguard.report.dto.response.ReportSummaryResponse;
import com.orbitguard.report.enums.ReportStatus;
import com.orbitguard.report.enums.ReportType;
import com.orbitguard.report.service.ReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * ==============================================================
 * Report Controller
 * ==============================================================
 *
 * REST controller responsible for exposing the OrbitGuard AI
 * Reports module APIs.
 *
 * <p>
 * The controller acts as the HTTP boundary of the Reports module.
 * It delegates business operations to {@link ReportService} and
 * does not contain report-generation or persistence logic.
 * </p>
 *
 * <p>
 * JSON-based operations use the common {@link ApiResponse}
 * response structure already established in the OrbitGuard AI
 * backend.
 * </p>
 *
 * <p>
 * PDF responses are handled separately because generated PDF
 * content is binary data and should be returned using the
 * {@code application/pdf} media type.
 * </p>
 *
 * Module : Reports
 *
 * @author OrbitGuard AI Team
 * @version 1.0
 */
@RestController
@RequestMapping(ReportApiConstants.REPORTS_BASE_PATH)
@RequiredArgsConstructor
@Tag(
        name = "Reports",
        description = "APIs for generating and managing OrbitGuard AI reports."
)
public class ReportController {


    /**
     * Service responsible for Reports business operations.
     */
    private final ReportService reportService;


    /**
     * ==============================================================
     * Generate Report
     * ==============================================================
     *
     * Creates and persists a new report using the supplied request.
     *
     * Endpoint:
     *
     * POST /api/reports
     *
     * @param request report generation request
     * @return generated report response
     */
    @Operation(
            summary = "Generate a report",
            description = "Creates and persists a new OrbitGuard AI report."
    )
    @PostMapping
    public ResponseEntity<ApiResponse<ReportResponse>> generateReport(
            @Valid @RequestBody ReportGenerationRequest request
    ) {

        ApiResponse<ReportResponse> response =
                reportService.generateReport(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }


    /**
     * ==============================================================
     * Get Report By Code
     * ==============================================================
     *
     * Retrieves a single report using its business code.
     *
     * Endpoint:
     *
     * GET /api/reports/{reportId}
     *
     * <p>
     * The existing API contract calls this path variable
     * {@code reportId}; however, the service operates using the
     * report's business code. Therefore the value is passed to
     * the service as the report code.
     * </p>
     *
     * @param reportId report business code
     * @return requested report
     */
    @Operation(
            summary = "Get report by code",
            description = "Retrieves a report using its unique business code."
    )
    @GetMapping(ReportApiConstants.REPORT_BY_ID_PATH)
    public ResponseEntity<ApiResponse<ReportResponse>> getReportByCode(

            @Parameter(
                    description = "Unique report business code.",
                    example = "RPT-000001",
                    required = true
            )
            @PathVariable(
                    ReportApiConstants.REPORT_ID_PATH_VARIABLE
            )
            String reportId
    ) {

        ApiResponse<ReportResponse> response =
                reportService.getReportByCode(reportId);

        return ResponseEntity.ok(response);
    }


    /**
     * ==============================================================
     * Generate Report PDF
     * ==============================================================
     *
     * Generates and returns the PDF representation of an existing
     * report using its unique business code.
     *
     * Endpoint:
     *
     * GET /api/reports/{reportId}/pdf
     *
     * <p>
     * PDF generation is delegated to the service layer. The
     * controller is responsible only for returning the generated
     * binary content using the {@code application/pdf} media type.
     * </p>
     *
     * @param reportId report business code
     * @return generated PDF document
     */
    @Operation(
            summary = "Generate report PDF",
            description = "Generates and downloads a PDF for an existing report."
    )
    @GetMapping(
            value = ReportApiConstants.REPORT_BY_ID_PATH + "/pdf",
            produces = MediaType.APPLICATION_PDF_VALUE
    )
    public ResponseEntity<byte[]> generateReportPdf(

            @Parameter(
                    description = "Unique report business code.",
                    example = "RPT-000001",
                    required = true
            )
            @PathVariable(
                    ReportApiConstants.REPORT_ID_PATH_VARIABLE
            )
            String reportId
    ) {

        byte[] pdfBytes =
                reportService.generateReportPdf(reportId);

        return ResponseEntity
                .ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(
                        "Content-Disposition",
                        "attachment; filename=\""
                                + reportId
                                + ".pdf\""
                )
                .body(pdfBytes);
    }


    /**
     * ==============================================================
     * Get All Reports
     * ==============================================================
     *
     * Retrieves all reports as lightweight summary responses.
     *
     * Endpoint:
     *
     * GET /api/reports
     *
     * @return list of report summaries
     */
    @Operation(
            summary = "Get all reports",
            description = "Retrieves all reports as lightweight summaries."
    )
    @GetMapping
    public ResponseEntity<
            ApiResponse<List<ReportSummaryResponse>>
            > getAllReports() {

        ApiResponse<List<ReportSummaryResponse>> response =
                reportService.getAllReports();

        return ResponseEntity.ok(response);
    }


    /**
     * ==============================================================
     * Get Reports By Type
     * ==============================================================
     *
     * Retrieves reports filtered by report type.
     *
     * Endpoint:
     *
     * GET /api/reports/type/{reportType}
     *
     * @param reportType report type
     * @return matching report summaries
     */
    @Operation(
            summary = "Get reports by type",
            description = "Retrieves reports filtered by report type."
    )
    @GetMapping("/type/{reportType}")
    public ResponseEntity<
            ApiResponse<List<ReportSummaryResponse>>
            > getReportsByType(

            @Parameter(
                    description = "Report type used for filtering.",
                    required = true
            )
            @PathVariable ReportType reportType
    ) {

        ApiResponse<List<ReportSummaryResponse>> response =
                reportService.getReportsByType(reportType);

        return ResponseEntity.ok(response);
    }


    /**
     * ==============================================================
     * Get Reports By Status
     * ==============================================================
     *
     * Retrieves reports filtered by processing status.
     *
     * Endpoint:
     *
     * GET /api/reports/status/{status}
     *
     * @param status report processing status
     * @return matching report summaries
     */
    @Operation(
            summary = "Get reports by status",
            description = "Retrieves reports filtered by processing status."
    )
    @GetMapping("/status/{status}")
    public ResponseEntity<
            ApiResponse<List<ReportSummaryResponse>>
            > getReportsByStatus(

            @Parameter(
                    description = "Report status used for filtering.",
                    required = true
            )
            @PathVariable ReportStatus status
    ) {

        ApiResponse<List<ReportSummaryResponse>> response =
                reportService.getReportsByStatus(status);

        return ResponseEntity.ok(response);
    }


    /**
     * ==============================================================
     * Get Reports By Type And Status
     * ==============================================================
     *
     * Retrieves reports filtered by both report type and status.
     *
     * Endpoint:
     *
     * GET /api/reports/filter?reportType=...&status=...
     *
     * @param reportType report type
     * @param status report processing status
     * @return matching report summaries
     */
    @Operation(
            summary = "Filter reports",
            description = "Retrieves reports filtered by type and status."
    )
    @GetMapping("/filter")
    public ResponseEntity<
            ApiResponse<List<ReportSummaryResponse>>
            > getReportsByTypeAndStatus(

            @Parameter(
                    description = "Report type used for filtering.",
                    required = true
            )
            @RequestParam ReportType reportType,

            @Parameter(
                    description = "Report status used for filtering.",
                    required = true
            )
            @RequestParam ReportStatus status
    ) {

        ApiResponse<List<ReportSummaryResponse>> response =
                reportService.getReportsByTypeAndStatus(
                        reportType,
                        status
                );

        return ResponseEntity.ok(response);
    }


    /**
     * ==============================================================
     * Delete Report
     * ==============================================================
     *
     * Deletes a report using its business code.
     *
     * Endpoint:
     *
     * DELETE /api/reports/{reportId}
     *
     * @param reportId report business code
     * @return deletion response
     */
    @Operation(
            summary = "Delete report",
            description = "Deletes a report using its unique business code."
    )
    @DeleteMapping(ReportApiConstants.REPORT_BY_ID_PATH)
    public ResponseEntity<ApiResponse<Void>> deleteReport(

            @Parameter(
                    description = "Unique report business code.",
                    example = "RPT-000001",
                    required = true
            )
            @PathVariable(
                    ReportApiConstants.REPORT_ID_PATH_VARIABLE
            )
            String reportId
    ) {

        ApiResponse<Void> response =
                reportService.deleteReport(reportId);

        return ResponseEntity.ok(response);
    }
}