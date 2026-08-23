package com.orbitguard.report.service.impl;

import com.orbitguard.common.exception.BadRequestException;
import com.orbitguard.common.exception.DuplicateResourceException;
import com.orbitguard.common.exception.ResourceNotFoundException;
import com.orbitguard.common.response.ApiResponse;
import com.orbitguard.common.sequence.SequenceConstants;
import com.orbitguard.common.sequence.SequenceGeneratorService;
import com.orbitguard.common.util.BusinessCodeGenerator;
import com.orbitguard.common.util.ResponseBuilder;
import com.orbitguard.report.constants.ReportApiConstants;
import com.orbitguard.report.dto.request.ReportGenerationRequest;
import com.orbitguard.report.dto.response.ReportResponse;
import com.orbitguard.report.dto.response.ReportSummaryResponse;
import com.orbitguard.report.entity.Report;
import com.orbitguard.report.enums.ReportStatus;
import com.orbitguard.report.enums.ReportType;
import com.orbitguard.report.mapper.ReportMapper;
import com.orbitguard.report.repository.ReportRepository;
import com.orbitguard.report.service.ReportService;
import com.orbitguard.report.util.ReportPdfGenerator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.Objects;

/**
 * ==============================================================
 * Report Service Implementation
 * ==============================================================
 *
 * Provides business orchestration for the OrbitGuard AI
 * Reports module.
 *
 * <p>
 * This service coordinates:
 *
 * <ul>
 *     <li>Report validation</li>
 *     <li>Business-code generation</li>
 *     <li>Report persistence</li>
 *     <li>Report retrieval</li>
 *     <li>Report filtering</li>
 *     <li>Report deletion</li>
 *     <li>Standard API response construction</li>
 * </ul>
 *
 * <p>
 * The service does not directly interact with MongoDB.
 * Database operations are delegated to {@link ReportRepository}.
 * </p>
 *
 * <p>
 * The service also does not contain PDF-generation logic.
 * PDF generation will be handled separately by
 * {@code ReportPdfGenerator} once its contract is implemented.
 * </p>
 *
 * Module : Reports
 *
 * @author OrbitGuard AI Team
 * @version 1.0
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class ReportServiceImpl implements ReportService {

    /**
     * Repository responsible for report persistence.
     */
    private final ReportRepository reportRepository;

    /**
     * Mapper responsible for converting between
     * Report entities and report DTOs.
     */
    private final ReportMapper reportMapper;

    /**
     * Generates sequential numbers using MongoDB.
     */
    private final SequenceGeneratorService sequenceGeneratorService;

    /**
     * Formats business codes such as:
     *
     * RPT-000001
     */
    private final BusinessCodeGenerator businessCodeGenerator;

    private final ReportPdfGenerator reportPdfGenerator;


    /**
     * ==============================================================
     * Generate Report
     * ==============================================================
     *
     * Creates and persists a new report.
     *
     * <p>
     * Business-code generation follows the existing OrbitGuard
     * sequence architecture:
     *
     * <pre>
     * SequenceGeneratorService
     *          ↓
     * REPORT_SEQUENCE
     *          ↓
     * BusinessCodeGenerator
     *          ↓
     * RPT-000001
     * </pre>
     *
     * @param request report generation request
     * @return standard API response containing generated report
     */
    @Override
    @Transactional
    public ApiResponse<ReportResponse> generateReport(
            ReportGenerationRequest request
    ) {

        validateGenerationRequest(request);

        /*
         * ----------------------------------------------------------
         * Generate next report sequence
         * ----------------------------------------------------------
         */
        long sequence =
                sequenceGeneratorService.getNextSequence(
                        SequenceConstants.REPORT_SEQUENCE
                );


        /*
         * ----------------------------------------------------------
         * Generate business report code
         * ----------------------------------------------------------
         */
        String reportCode =
                businessCodeGenerator.generate(
                        "RPT",
                        sequence
                );


        /*
         * ----------------------------------------------------------
         * Defensive duplicate check
         * ----------------------------------------------------------
         *
         * The sequence generator should provide unique values.
         * This additional check protects the business-code
         * uniqueness contract.
         */
        if (reportRepository.existsByReportCode(reportCode)) {

            log.error(
                    "Generated duplicate report code: {}",
                    reportCode
            );

            throw new DuplicateResourceException(
                    "Report with code "
                            + reportCode
                            + " already exists."
            );
        }


        /*
         * ----------------------------------------------------------
         * Map request to entity
         * ----------------------------------------------------------
         */
        Report report =
                reportMapper.toEntity(request);


        if (report == null) {

            log.error(
                    "ReportMapper returned null while generating report."
            );

            throw new IllegalStateException(
                    ReportApiConstants.REPORT_GENERATION_FAILED_MESSAGE
            );
        }


        /*
         * ----------------------------------------------------------
         * Set generated business fields
         * ----------------------------------------------------------
         *
         * These values are controlled by the service and must
         * not come from the client request.
         */
        report.setReportCode(reportCode);

        report.setStatus(
                ReportStatus.PENDING
        );


        /*
         * ----------------------------------------------------------
         * Persist report
         * ----------------------------------------------------------
         */
        Report savedReport =
                reportRepository.save(report);


        if (savedReport == null) {

            log.error(
                    "Repository returned null after saving report: {}",
                    reportCode
            );

            throw new IllegalStateException(
                    ReportApiConstants.REPORT_GENERATION_FAILED_MESSAGE
            );
        }


        /*
         * ----------------------------------------------------------
         * Map entity to response
         * ----------------------------------------------------------
         */
        ReportResponse response =
                reportMapper.toResponse(savedReport);


        if (response == null) {

            log.error(
                    "ReportMapper returned null response for report: {}",
                    reportCode
            );

            throw new IllegalStateException(
                    ReportApiConstants.REPORT_GENERATION_FAILED_MESSAGE
            );
        }


        log.info(
                "Report generated successfully. reportCode={}",
                reportCode
        );


        /*
         * ----------------------------------------------------------
         * Return standard OrbitGuard API response
         * ----------------------------------------------------------
         */
        return ResponseBuilder.success(
                ReportApiConstants.REPORT_GENERATED_SUCCESS_MESSAGE,
                response
        );
    }


    /**
     * ==============================================================
     * Get Report By Code
     * ==============================================================
     *
     * Retrieves a report using its unique business code.
     *
     * @param reportCode unique report business code
     * @return standard API response containing the report
     */
    @Override
    public ApiResponse<ReportResponse> getReportByCode(
            String reportCode
    ) {

        validateReportCode(reportCode);


        Report report =
                reportRepository.findByReportCode(
                                reportCode.trim()
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        ReportApiConstants.REPORT_NOT_FOUND_MESSAGE
                                )
                        );


        ReportResponse response =
                reportMapper.toResponse(report);


        if (response == null) {

            log.error(
                    "ReportMapper returned null response for report: {}",
                    reportCode
            );

            throw new IllegalStateException(
                    ReportApiConstants.REPORT_NOT_FOUND_MESSAGE
            );
        }


        return ResponseBuilder.success(
                ReportApiConstants.REPORT_RETRIEVED_SUCCESS_MESSAGE,
                response
        );
    }


    /**
     * ==============================================================
     * Get All Reports
     * ==============================================================
     *
     * Retrieves all reports and converts them into lightweight
     * summary responses.
     *
     * @return standard API response containing report summaries
     */
    @Override
    public ApiResponse<List<ReportSummaryResponse>> getAllReports() {

        List<Report> reports =
                reportRepository.findAll();


        if (reports == null || reports.isEmpty()) {

            return ResponseBuilder.success(
                    ReportApiConstants.REPORTS_RETRIEVED_SUCCESS_MESSAGE,
                    Collections.emptyList()
            );
        }


        List<ReportSummaryResponse> responses =
                reports.stream()
                        .filter(Objects::nonNull)
                        .map(reportMapper::toSummaryResponse)
                        .filter(Objects::nonNull)
                        .toList();


        return ResponseBuilder.success(
                ReportApiConstants.REPORTS_RETRIEVED_SUCCESS_MESSAGE,
                responses
        );
    }


    /**
     * ==============================================================
     * Get Reports By Type
     * ==============================================================
     *
     * Retrieves reports matching the supplied report type.
     *
     * @param reportType report type used for filtering
     * @return standard API response containing matching reports
     */
    @Override
    public ApiResponse<List<ReportSummaryResponse>> getReportsByType(
            ReportType reportType
    ) {

        validateReportType(reportType);


        List<Report> reports =
                reportRepository.findByReportType(
                        reportType
                );


        List<ReportSummaryResponse> responses =
                mapToSummaryResponses(reports);


        return ResponseBuilder.success(
                ReportApiConstants.REPORTS_RETRIEVED_SUCCESS_MESSAGE,
                responses
        );
    }


    /**
     * ==============================================================
     * Get Reports By Status
     * ==============================================================
     *
     * Retrieves reports matching the supplied status.
     *
     * @param status report processing status
     * @return standard API response containing matching reports
     */
    @Override
    public ApiResponse<List<ReportSummaryResponse>> getReportsByStatus(
            ReportStatus status
    ) {

        validateReportStatus(status);


        List<Report> reports =
                reportRepository.findByStatus(
                        status
                );


        List<ReportSummaryResponse> responses =
                mapToSummaryResponses(reports);


        return ResponseBuilder.success(
                ReportApiConstants.REPORTS_RETRIEVED_SUCCESS_MESSAGE,
                responses
        );
    }


    /**
     * ==============================================================
     * Get Reports By Type And Status
     * ==============================================================
     *
     * Retrieves reports matching both report type and status.
     *
     * @param reportType report type used for filtering
     * @param status report status used for filtering
     * @return standard API response containing matching reports
     */
    @Override
    public ApiResponse<List<ReportSummaryResponse>>
    getReportsByTypeAndStatus(
            ReportType reportType,
            ReportStatus status
    ) {

        validateReportType(reportType);

        validateReportStatus(status);


        List<Report> reports =
                reportRepository.findByReportTypeAndStatus(
                        reportType,
                        status
                );


        List<ReportSummaryResponse> responses =
                mapToSummaryResponses(reports);


        return ResponseBuilder.success(
                ReportApiConstants.REPORTS_RETRIEVED_SUCCESS_MESSAGE,
                responses
        );
    }


    /**
     * ==============================================================
     * Delete Report
     * ==============================================================
     *
     * Deletes a report using its business code.
     *
     * @param reportCode unique report business code
     * @return standard API response indicating deletion success
     */
    @Override
    @Transactional
    public ApiResponse<Void> deleteReport(
            String reportCode
    ) {

        validateReportCode(reportCode);


        Report report =
                reportRepository.findByReportCode(
                                reportCode.trim()
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        ReportApiConstants.REPORT_NOT_FOUND_MESSAGE
                                )
                        );


        reportRepository.delete(report);


        log.info(
                "Report deleted successfully. reportCode={}",
                reportCode
        );


        return ResponseBuilder.success(
                "Report deleted successfully.",
                null
        );
    }


    /**
     * ==============================================================
     * Map Reports To Summary Responses
     * ==============================================================
     *
     * Centralizes entity-to-summary conversion so that filtering
     * methods do not duplicate mapping logic.
     *
     * @param reports report entities
     * @return mapped summary responses
     */
    private List<ReportSummaryResponse> mapToSummaryResponses(
            List<Report> reports
    ) {

        if (reports == null || reports.isEmpty()) {
            return Collections.emptyList();
        }


        return reports.stream()
                .filter(Objects::nonNull)
                .map(reportMapper::toSummaryResponse)
                .filter(Objects::nonNull)
                .toList();
    }


    /**
     * ==============================================================
     * Validate Report Generation Request
     * ==============================================================
     *
     * Performs service-level validation for the report generation
     * request.
     *
     * Bean validation annotations should remain responsible for
     * structural request validation at the controller boundary.
     *
     * @param request report generation request
     */
    private void validateGenerationRequest(
            ReportGenerationRequest request
    ) {

        if (request == null) {

            throw new BadRequestException(
                    "Report generation request must not be null."
            );
        }
    }


    /**
     * ==============================================================
     * Validate Report Code
     * ==============================================================
     *
     * @param reportCode report business code
     */
    private void validateReportCode(
            String reportCode
    ) {

        if (reportCode == null || reportCode.isBlank()) {

            throw new BadRequestException(
                    "Report code must not be null or blank."
            );
        }
    }


    /**
     * ==============================================================
     * Validate Report Type
     * ==============================================================
     *
     * @param reportType report type
     */
    private void validateReportType(
            ReportType reportType
    ) {

        if (reportType == null) {

            throw new BadRequestException(
                    ReportApiConstants.INVALID_REPORT_TYPE_MESSAGE
            );
        }
    }


    /**
     * ==============================================================
     * Validate Report Status
     * ==============================================================
     *
     * @param status report status
     */
    private void validateReportStatus(
            ReportStatus status
    ) {

        if (status == null) {

            throw new BadRequestException(
                    ReportApiConstants.INVALID_REPORT_STATUS_MESSAGE
            );
        }
    }

    /**
     * ==============================================================
     * Generate Report PDF
     * ==============================================================
     *
     * Generates a PDF document for an existing report.
     *
     * <p>
     * The report is first retrieved using its business code.
     * The existing {@link ReportPdfGenerator} is then responsible
     * for converting the report entity into PDF content.
     * </p>
     *
     * <p>
     * This service method intentionally does not contain PDF
     * formatting logic. PDF generation remains isolated inside
     * {@code ReportPdfGenerator}.
     * </p>
     *
     * @param reportCode unique report business code
     * @return generated PDF content
     *
     * @throws ResourceNotFoundException when the report does not exist
     * @throws IllegalStateException when PDF generation fails
     */
    @Override
    @Transactional(readOnly = true)
    public byte[] generateReportPdf(String reportCode) {

        validateReportCode(reportCode);

        Report report = reportRepository.findByReportCode(reportCode.trim())
                .orElseThrow(() -> new ResourceNotFoundException(
                        ReportApiConstants.REPORT_NOT_FOUND_MESSAGE
                ));

        try {

            return reportPdfGenerator.generate(report);

        } catch (Exception ex) {

            throw new IllegalStateException(
                    ReportApiConstants.REPORT_PDF_GENERATION_FAILED_MESSAGE,
                    ex
            );
        }
    }
}