
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
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.nio.charset.StandardCharsets;
import java.util.List;

/**
 * REST controller for the OrbitGuard AI Reports module.
 *
 * Exposes report creation, retrieval, filtering, PDF download,
 * and deletion endpoints.
 *
 * Business operations are delegated to ReportService.
 * JSON responses use the existing ApiResponse contract.
 * PDF downloads return binary content with application/pdf.
 *
 * @author OrbitGuard AI Team
 * @version 1.1
 */
@RestController
@RequestMapping(ReportApiConstants.REPORTS_BASE_PATH)
@RequiredArgsConstructor
@Tag(
        name = "Reports",
        description = "APIs for generating and managing OrbitGuard AI reports."
)
public class ReportController {

    private final ReportService reportService;

    /**
     * Creates report metadata.
     *
     * POST /api/reports
     */
    @Operation(
            summary = "Generate a report",
            description = "Creates and persists a new OrbitGuard AI report. " +
                    "The returned status indicates its current processing state."
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
     * Retrieves a report using its business code.
     *
     * GET /api/reports/{reportId}
     *
     * The existing route variable is named reportId for compatibility,
     * but its value represents a business code such as RPT-000001.
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
     * Generates and downloads a PDF for an existing report.
     *
     * GET /api/reports/{reportId}/pdf
     */
    @Operation(
            summary = "Download report PDF",
            description = "Generates a PDF document for an existing report."
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

        String filename = createPdfFilename(reportId);

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        ContentDisposition.attachment()
                                .filename(
                                        filename,
                                        StandardCharsets.UTF_8
                                )
                                .build()
                                .toString()
                )
                .contentLength(pdfBytes.length)
                .body(pdfBytes);
    }

    /**
     * Retrieves all report summaries.
     *
     * GET /api/reports
     */
    @Operation(
            summary = "Get all reports",
            description = "Retrieves all reports as lightweight summaries."
    )
    @GetMapping
    public ResponseEntity<ApiResponse<List<ReportSummaryResponse>>>
    getAllReports() {
        ApiResponse<List<ReportSummaryResponse>> response =
                reportService.getAllReports();

        return ResponseEntity.ok(response);
    }

    /**
     * Retrieves report summaries filtered by type.
     *
     * GET /api/reports/type/{reportType}
     */
    @Operation(
            summary = "Get reports by type",
            description = "Retrieves reports matching the supplied report type."
    )
    @GetMapping("/type/{reportType}")
    public ResponseEntity<ApiResponse<List<ReportSummaryResponse>>>
    getReportsByType(
            @Parameter(
                    description = "Report type used for filtering.",
                    required = true
            )
            @PathVariable("reportType") ReportType reportType
    ) {
        ApiResponse<List<ReportSummaryResponse>> response =
                reportService.getReportsByType(reportType);

        return ResponseEntity.ok(response);
    }

    /**
     * Retrieves report summaries filtered by status.
     *
     * GET /api/reports/status/{status}
     */
    @Operation(
            summary = "Get reports by status",
            description = "Retrieves reports matching the supplied status."
    )
    @GetMapping("/status/{status}")
    public ResponseEntity<ApiResponse<List<ReportSummaryResponse>>>
    getReportsByStatus(
            @Parameter(
                    description = "Report processing status.",
                    required = true
            )
            @PathVariable("status") ReportStatus status
    ) {
        ApiResponse<List<ReportSummaryResponse>> response =
                reportService.getReportsByStatus(status);

        return ResponseEntity.ok(response);
    }

    /**
     * Retrieves reports filtered by both type and status.
     *
     * GET /api/reports/filter?reportType=RISK_ASSESSMENT&status=PENDING
     */
    @Operation(
            summary = "Filter reports",
            description = "Retrieves reports matching both report type and status."
    )
    @GetMapping("/filter")
    public ResponseEntity<ApiResponse<List<ReportSummaryResponse>>>
    getReportsByTypeAndStatus(
            @Parameter(
                    description = "Report type used for filtering.",
                    required = true
            )
            @RequestParam("reportType") ReportType reportType,

            @Parameter(
                    description = "Report status used for filtering.",
                    required = true
            )
            @RequestParam("status") ReportStatus status
    ) {
        ApiResponse<List<ReportSummaryResponse>> response =
                reportService.getReportsByTypeAndStatus(
                        reportType,
                        status
                );

        return ResponseEntity.ok(response);
    }

    /**
     * Deletes a report using its business code.
     *
     * DELETE /api/reports/{reportId}
     */
    @Operation(
            summary = "Delete report",
            description = "Deletes an existing report using its business code."
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

    /**
     * Creates a safe attachment filename without allowing arbitrary
     * path characters from the request value.
     */
    private String createPdfFilename(String reportId) {
        if (reportId == null || reportId.isBlank()) {
            return "report.pdf";
        }

        String safeReportId = reportId.trim()
                .replaceAll("[^A-Za-z0-9._-]", "_");

        return safeReportId + ".pdf";
    }
}
