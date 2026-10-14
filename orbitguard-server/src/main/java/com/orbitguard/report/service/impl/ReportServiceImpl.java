
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
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.Objects;

/**
 * Business orchestration for the OrbitGuard AI Reports module.
 *
 * Handles report creation, retrieval, filtering, deletion,
 * and delegation of PDF generation.
 *
 * Persistence is delegated to ReportRepository, mapping to
 * ReportMapper, and PDF rendering to ReportPdfGenerator.
 *
 * @author OrbitGuard AI Team
 * @version 1.1
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class ReportServiceImpl implements ReportService {

    private static final String REPORT_CODE_PREFIX = "RPT";

    private static final String REPORT_DELETED_SUCCESS_MESSAGE =
            "Report deleted successfully.";

    private final ReportRepository reportRepository;
    private final ReportMapper reportMapper;
    private final SequenceGeneratorService sequenceGeneratorService;
    private final BusinessCodeGenerator businessCodeGenerator;
    private final ReportPdfGenerator reportPdfGenerator;

    /**
     * Creates and persists a report in PENDING status.
     *
     * This method creates report metadata. It does not claim that
     * the actual operational report has already been generated.
     */
    @Override
    @Transactional
    public ApiResponse<ReportResponse> generateReport(
            ReportGenerationRequest request
    ) {
        validateGenerationRequest(request);

        long sequence = sequenceGeneratorService.getNextSequence(
                SequenceConstants.REPORT_SEQUENCE
        );

        String reportCode = businessCodeGenerator.generate(
                REPORT_CODE_PREFIX,
                sequence
        );

        if (reportCode == null || reportCode.isBlank()) {
            log.error(
                    "BusinessCodeGenerator returned an invalid report code. sequence={}",
                    sequence
            );

            throw new IllegalStateException(
                    ReportApiConstants.REPORT_GENERATION_FAILED_MESSAGE
            );
        }

        reportCode = reportCode.trim();

        /*
         * Defensive pre-check. The MongoDB unique index must remain
         * in place because this check alone cannot prevent races
         * between concurrent requests.
         */
        if (reportRepository.existsByReportCode(reportCode)) {
            log.warn(
                    "Report code already exists before persistence. reportCode={}",
                    reportCode
            );

            throw new DuplicateResourceException(
                    "Report with code " + reportCode + " already exists."
            );
        }

        Report report = reportMapper.toEntity(request);

        if (report == null) {
            log.error(
                    "ReportMapper returned null while creating report. reportCode={}",
                    reportCode
            );

            throw new IllegalStateException(
                    ReportApiConstants.REPORT_GENERATION_FAILED_MESSAGE
            );
        }

        /*
         * Server-controlled fields must not be accepted from the
         * client request.
         */
        report.setReportCode(reportCode);
        report.setStatus(ReportStatus.PENDING);

        final Report savedReport;

        try {
            savedReport = reportRepository.save(report);
        } catch (DuplicateKeyException ex) {
            /*
             * Handles the concurrent-request case where another
             * request inserts the same unique report code after
             * the pre-check.
             */
            log.warn(
                    "MongoDB rejected a duplicate report key. reportCode={}",
                    reportCode,
                    ex
            );

            throw new DuplicateResourceException(
                    "Report with code " + reportCode + " already exists."
            );
        }

        if (savedReport == null) {
            log.error(
                    "ReportRepository returned null after saving. reportCode={}",
                    reportCode
            );

            throw new IllegalStateException(
                    ReportApiConstants.REPORT_GENERATION_FAILED_MESSAGE
            );
        }

        ReportResponse response = reportMapper.toResponse(savedReport);

        if (response == null) {
            log.error(
                    "ReportMapper returned a null response after persistence. reportCode={}",
                    reportCode
            );

            throw new IllegalStateException(
                    ReportApiConstants.REPORT_GENERATION_FAILED_MESSAGE
            );
        }

        log.info(
                "Report metadata created successfully. reportCode={}, status={}",
                savedReport.getReportCode(),
                savedReport.getStatus()
        );

        return ResponseBuilder.success(
                ReportApiConstants.REPORT_GENERATED_SUCCESS_MESSAGE,
                response
        );
    }

    /**
     * Retrieves a report using its unique business code.
     */
    @Override
    public ApiResponse<ReportResponse> getReportByCode(
            String reportCode
    ) {
        String normalizedCode = normalizeReportCode(reportCode);

        Report report = findReportByCode(normalizedCode);

        ReportResponse response = reportMapper.toResponse(report);

        if (response == null) {
            log.error(
                    "ReportMapper returned null while retrieving report. reportCode={}",
                    normalizedCode
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
     * Retrieves summary responses for all reports.
     */
    @Override
    public ApiResponse<List<ReportSummaryResponse>> getAllReports() {
        List<ReportSummaryResponse> responses =
                mapToSummaryResponses(reportRepository.findAll());

        return ResponseBuilder.success(
                ReportApiConstants.REPORTS_RETRIEVED_SUCCESS_MESSAGE,
                responses
        );
    }

    /**
     * Retrieves reports filtered by report type.
     */
    @Override
    public ApiResponse<List<ReportSummaryResponse>> getReportsByType(
            ReportType reportType
    ) {
        validateReportType(reportType);

        List<ReportSummaryResponse> responses =
                mapToSummaryResponses(
                        reportRepository.findByReportType(reportType)
                );

        return ResponseBuilder.success(
                ReportApiConstants.REPORTS_RETRIEVED_SUCCESS_MESSAGE,
                responses
        );
    }

    /**
     * Retrieves reports filtered by status.
     */
    @Override
    public ApiResponse<List<ReportSummaryResponse>> getReportsByStatus(
            ReportStatus status
    ) {
        validateReportStatus(status);

        List<ReportSummaryResponse> responses =
                mapToSummaryResponses(
                        reportRepository.findByStatus(status)
                );

        return ResponseBuilder.success(
                ReportApiConstants.REPORTS_RETRIEVED_SUCCESS_MESSAGE,
                responses
        );
    }

    /**
     * Retrieves reports matching both report type and status.
     */
    @Override
    public ApiResponse<List<ReportSummaryResponse>>
    getReportsByTypeAndStatus(
            ReportType reportType,
            ReportStatus status
    ) {
        validateReportType(reportType);
        validateReportStatus(status);

        List<ReportSummaryResponse> responses =
                mapToSummaryResponses(
                        reportRepository.findByReportTypeAndStatus(
                                reportType,
                                status
                        )
                );

        return ResponseBuilder.success(
                ReportApiConstants.REPORTS_RETRIEVED_SUCCESS_MESSAGE,
                responses
        );
    }

    /**
     * Deletes a report using its unique business code.
     */
    @Override
    @Transactional
    public ApiResponse<Void> deleteReport(String reportCode) {
        String normalizedCode = normalizeReportCode(reportCode);

        Report report = findReportByCode(normalizedCode);

        reportRepository.delete(report);

        log.info(
                "Report deleted successfully. reportCode={}",
                normalizedCode
        );

        return ResponseBuilder.success(
                REPORT_DELETED_SUCCESS_MESSAGE,
                null
        );
    }

    /**
     * Generates PDF bytes for an existing report.
     *
     * PDF layout and rendering remain the responsibility of
     * ReportPdfGenerator.
     */
    @Override
    public byte[] generateReportPdf(String reportCode) {
        String normalizedCode = normalizeReportCode(reportCode);

        Report report = findReportByCode(normalizedCode);

        try {
            byte[] pdfBytes = reportPdfGenerator.generate(report);

            if (pdfBytes == null || pdfBytes.length == 0) {
                log.error(
                        "PDF generator returned an empty document. reportCode={}",
                        normalizedCode
                );

                throw new IllegalStateException(
                        ReportApiConstants.REPORT_PDF_GENERATION_FAILED_MESSAGE
                );
            }

            log.debug(
                    "Report PDF generated successfully. reportCode={}, bytes={}",
                    normalizedCode,
                    pdfBytes.length
            );

            return pdfBytes;
        } catch (Exception ex) {
            /*
             * Preserve the established PDF failure contract while
             * avoiding redundant wrapping of our own failure exception.
             */
            if (ex instanceof IllegalStateException
                    && ReportApiConstants.REPORT_PDF_GENERATION_FAILED_MESSAGE
                    .equals(ex.getMessage())) {
                throw (IllegalStateException) ex;
            }

            log.error(
                    "Failed to generate PDF. reportCode={}",
                    normalizedCode,
                    ex
            );

            throw new IllegalStateException(
                    ReportApiConstants.REPORT_PDF_GENERATION_FAILED_MESSAGE,
                    ex
            );
        }
    }

    /**
     * Retrieves an entity by its business code or throws the
     * existing application-level not-found exception.
     */
    private Report findReportByCode(String reportCode) {
        return reportRepository.findByReportCode(reportCode)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                ReportApiConstants.REPORT_NOT_FOUND_MESSAGE
                        )
                );
    }

    /**
     * Converts entities to summary DTOs.
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
     * Performs the service-level null check. Bean Validation
     * remains responsible for request-field constraints.
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
     * Validates and normalizes a report business code.
     */
    private String normalizeReportCode(String reportCode) {
        if (reportCode == null || reportCode.isBlank()) {
            throw new BadRequestException(
                    "Report code must not be null or blank."
            );
        }

        return reportCode.trim();
    }

    private void validateReportType(ReportType reportType) {
        if (reportType == null) {
            throw new BadRequestException(
                    ReportApiConstants.INVALID_REPORT_TYPE_MESSAGE
            );
        }
    }

    private void validateReportStatus(ReportStatus status) {
        if (status == null) {
            throw new BadRequestException(
                    ReportApiConstants.INVALID_REPORT_STATUS_MESSAGE
            );
        }
    }
}
