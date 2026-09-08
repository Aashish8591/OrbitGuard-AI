package com.orbitguard.report.service.impl;

import com.orbitguard.common.exception.BadRequestException;
import com.orbitguard.common.exception.ResourceNotFoundException;
import com.orbitguard.common.response.ApiResponse;
import com.orbitguard.common.sequence.SequenceConstants;
import com.orbitguard.common.sequence.SequenceGeneratorService;
import com.orbitguard.common.util.BusinessCodeGenerator;
import com.orbitguard.report.dto.request.ReportGenerationRequest;
import com.orbitguard.report.dto.response.ReportResponse;
import com.orbitguard.report.dto.response.ReportSummaryResponse;
import com.orbitguard.report.entity.Report;
import com.orbitguard.report.enums.ReportStatus;
import com.orbitguard.report.enums.ReportType;
import com.orbitguard.report.mapper.ReportMapper;
import com.orbitguard.report.repository.ReportRepository;
import com.orbitguard.report.util.ReportPdfGenerator;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReportServiceImplTest {

    @Mock
    private ReportRepository reportRepository;

    @Mock
    private ReportMapper reportMapper;

    @Mock
    private SequenceGeneratorService sequenceGeneratorService;

    @Mock
    private BusinessCodeGenerator businessCodeGenerator;

    @Mock
    private ReportPdfGenerator reportPdfGenerator;

    @InjectMocks
    private ReportServiceImpl reportService;

    private ReportGenerationRequest request;
    private Report report;
    private ReportResponse reportResponse;
    private ReportSummaryResponse summaryResponse;

    @BeforeEach
    void setUp() {

        request = ReportGenerationRequest.builder()
                .reportType(ReportType.SATELLITE_ANALYSIS)
                .title("Satellite Analysis Report")
                .description("Satellite orbital analysis report.")
                .build();

        report = Report.builder()
                .id("report-id-1")
                .reportCode("RPT-000001")
                .reportType(ReportType.SATELLITE_ANALYSIS)
                .status(ReportStatus.PENDING)
                .title("Satellite Analysis Report")
                .description("Satellite orbital analysis report.")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        reportResponse = ReportResponse.builder()
                .id(report.getId())
                .reportCode(report.getReportCode())
                .reportType(report.getReportType())
                .status(report.getStatus())
                .title(report.getTitle())
                .description(report.getDescription())
                .createdAt(report.getCreatedAt())
                .updatedAt(report.getUpdatedAt())
                .build();

        summaryResponse = ReportSummaryResponse.builder()
                .id(report.getId())
                .reportCode(report.getReportCode())
                .reportType(report.getReportType())
                .status(report.getStatus())
                .title(report.getTitle())
                .createdAt(report.getCreatedAt())
                .build();
    }

    /**
     * ==============================================================
     * Generate Report
     * ==============================================================
     */
    @Test
    void generateReport_shouldCreateSuccessfully() {

        when(sequenceGeneratorService.getNextSequence(
                SequenceConstants.REPORT_SEQUENCE
        )).thenReturn(1L);

        when(businessCodeGenerator.generate(
                "RPT",
                1L
        )).thenReturn("RPT-000001");

        when(reportRepository.existsByReportCode(
                "RPT-000001"
        )).thenReturn(false);

        when(reportMapper.toEntity(request))
                .thenReturn(report);

        when(reportRepository.save(report))
                .thenReturn(report);

        when(reportMapper.toResponse(report))
                .thenReturn(reportResponse);

        ApiResponse<ReportResponse> result =
                reportService.generateReport(request);

        assertNotNull(result);

        verify(sequenceGeneratorService)
                .getNextSequence(
                        SequenceConstants.REPORT_SEQUENCE
                );

        verify(businessCodeGenerator)
                .generate(
                        "RPT",
                        1L
                );

        verify(reportMapper)
                .toEntity(request);

        verify(reportRepository)
                .save(report);

        verify(reportMapper)
                .toResponse(report);
    }

    /**
     * ==============================================================
     * Generate Report - Verify Generated Business Code
     * ==============================================================
     */
    @Test
    void generateReport_shouldSetGeneratedReportCode() {

        Report mappedReport = Report.builder()
                .reportType(request.getReportType())
                .title(request.getTitle())
                .description(request.getDescription())
                .build();

        when(sequenceGeneratorService.getNextSequence(
                SequenceConstants.REPORT_SEQUENCE
        )).thenReturn(2L);

        when(businessCodeGenerator.generate(
                "RPT",
                2L
        )).thenReturn("RPT-000002");

        when(reportRepository.existsByReportCode(
                "RPT-000002"
        )).thenReturn(false);

        when(reportMapper.toEntity(request))
                .thenReturn(mappedReport);

        when(reportRepository.save(any(Report.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        when(reportMapper.toResponse(any(Report.class)))
                .thenReturn(reportResponse);

        reportService.generateReport(request);

        assertEquals(
                "RPT-000002",
                mappedReport.getReportCode()
        );

        assertEquals(
                ReportStatus.PENDING,
                mappedReport.getStatus()
        );

        verify(reportRepository)
                .save(mappedReport);
    }

    /**
     * ==============================================================
     * Get Report By Code
     * ==============================================================
     */
    @Test
    void getReportByCode_shouldReturnReport() {

        when(reportRepository.findByReportCode(
                "RPT-000001"
        )).thenReturn(Optional.of(report));

        when(reportMapper.toResponse(report))
                .thenReturn(reportResponse);

        ApiResponse<ReportResponse> result =
                reportService.getReportByCode(
                        "RPT-000001"
                );

        assertNotNull(result);

        verify(reportRepository)
                .findByReportCode("RPT-000001");

        verify(reportMapper)
                .toResponse(report);
    }

    /**
     * ==============================================================
     * Get All Reports
     * ==============================================================
     */
    @Test
    void getAllReports_shouldReturnReports() {

        Report secondReport = Report.builder()
                .id("report-id-2")
                .reportCode("RPT-000002")
                .reportType(ReportType.RISK_ASSESSMENT)
                .status(ReportStatus.COMPLETED)
                .title("Risk Assessment Report")
                .createdAt(LocalDateTime.now())
                .build();

        ReportSummaryResponse secondSummary =
                ReportSummaryResponse.builder()
                        .id(secondReport.getId())
                        .reportCode(secondReport.getReportCode())
                        .reportType(secondReport.getReportType())
                        .status(secondReport.getStatus())
                        .title(secondReport.getTitle())
                        .createdAt(secondReport.getCreatedAt())
                        .build();

        when(reportRepository.findAll())
                .thenReturn(List.of(report, secondReport));

        when(reportMapper.toSummaryResponse(report))
                .thenReturn(summaryResponse);

        when(reportMapper.toSummaryResponse(secondReport))
                .thenReturn(secondSummary);

        ApiResponse<List<ReportSummaryResponse>> result =
                reportService.getAllReports();

        assertNotNull(result);

        verify(reportRepository)
                .findAll();

        verify(reportMapper)
                .toSummaryResponse(report);

        verify(reportMapper)
                .toSummaryResponse(secondReport);
    }

    /**
     * ==============================================================
     * Get Reports By Type
     * ==============================================================
     */
    @Test
    void getReportsByType_shouldReturnMatchingReports() {

        when(reportRepository.findByReportType(
                ReportType.SATELLITE_ANALYSIS
        )).thenReturn(List.of(report));

        when(reportMapper.toSummaryResponse(report))
                .thenReturn(summaryResponse);

        ApiResponse<List<ReportSummaryResponse>> result =
                reportService.getReportsByType(
                        ReportType.SATELLITE_ANALYSIS
                );

        assertNotNull(result);

        verify(reportRepository)
                .findByReportType(
                        ReportType.SATELLITE_ANALYSIS
                );

        verify(reportMapper)
                .toSummaryResponse(report);
    }

    /**
     * ==============================================================
     * Get Reports By Status
     * ==============================================================
     */
    @Test
    void getReportsByStatus_shouldReturnMatchingReports() {

        when(reportRepository.findByStatus(
                ReportStatus.PENDING
        )).thenReturn(List.of(report));

        when(reportMapper.toSummaryResponse(report))
                .thenReturn(summaryResponse);

        ApiResponse<List<ReportSummaryResponse>> result =
                reportService.getReportsByStatus(
                        ReportStatus.PENDING
                );

        assertNotNull(result);

        verify(reportRepository)
                .findByStatus(
                        ReportStatus.PENDING
                );

        verify(reportMapper)
                .toSummaryResponse(report);
    }

    /**
     * ==============================================================
     * Get Reports By Type And Status
     * ==============================================================
     */
    @Test
    void getReportsByTypeAndStatus_shouldReturnMatchingReports() {

        when(reportRepository.findByReportTypeAndStatus(
                ReportType.SATELLITE_ANALYSIS,
                ReportStatus.PENDING
        )).thenReturn(List.of(report));

        when(reportMapper.toSummaryResponse(report))
                .thenReturn(summaryResponse);

        ApiResponse<List<ReportSummaryResponse>> result =
                reportService.getReportsByTypeAndStatus(
                        ReportType.SATELLITE_ANALYSIS,
                        ReportStatus.PENDING
                );

        assertNotNull(result);

        verify(reportRepository)
                .findByReportTypeAndStatus(
                        ReportType.SATELLITE_ANALYSIS,
                        ReportStatus.PENDING
                );

        verify(reportMapper)
                .toSummaryResponse(report);
    }

    /**
     * ==============================================================
     * Delete Report
     * ==============================================================
     */
    @Test
    void deleteReport_shouldDeleteSuccessfully() {

        when(reportRepository.findByReportCode(
                "RPT-000001"
        )).thenReturn(Optional.of(report));

        doNothing()
                .when(reportRepository)
                .delete(report);

        ApiResponse<Void> result =
                reportService.deleteReport(
                        "RPT-000001"
                );

        assertNotNull(result);

        verify(reportRepository)
                .findByReportCode("RPT-000001");

        verify(reportRepository)
                .delete(report);
    }

    /**
     * ==============================================================
     * Generate PDF
     * ==============================================================
     */
    @Test
    void generateReportPdf_shouldGenerateSuccessfully() {

        byte[] expectedPdf =
                new byte[]{1, 2, 3};

        when(reportRepository.findByReportCode(
                "RPT-000001"
        )).thenReturn(Optional.of(report));

        when(reportPdfGenerator.generate(report))
                .thenReturn(expectedPdf);

        byte[] result =
                reportService.generateReportPdf(
                        "RPT-000001"
                );

        assertNotNull(result);

        assertArrayEquals(
                expectedPdf,
                result
        );

        verify(reportRepository)
                .findByReportCode("RPT-000001");

        verify(reportPdfGenerator)
                .generate(report);
    }

    /**
     * ==============================================================
     * Validation - Null Request
     * ==============================================================
     */
    @Test
    void generateReport_shouldRejectNullRequest() {

        assertThrows(
                BadRequestException.class,
                () -> reportService.generateReport(null)
        );

        verifyNoInteractions(
                reportRepository,
                reportMapper,
                sequenceGeneratorService,
                businessCodeGenerator
        );
    }

    /**
     * ==============================================================
     * Validation - Report Not Found
     * ==============================================================
     */
    @Test
    void getReportByCode_shouldThrowWhenReportNotFound() {

        when(reportRepository.findByReportCode(
                "RPT-999999"
        )).thenReturn(Optional.empty());

        assertThrows(
                ResourceNotFoundException.class,
                () -> reportService.getReportByCode(
                        "RPT-999999"
                )
        );

        verify(reportRepository)
                .findByReportCode("RPT-999999");

        verifyNoInteractions(reportMapper);
    }

    /**
     * ==============================================================
     * Validation - Delete Report Not Found
     * ==============================================================
     */
    @Test
    void deleteReport_shouldThrowWhenReportNotFound() {

        when(reportRepository.findByReportCode(
                "RPT-999999"
        )).thenReturn(Optional.empty());

        assertThrows(
                ResourceNotFoundException.class,
                () -> reportService.deleteReport(
                        "RPT-999999"
                )
        );

        verify(reportRepository)
                .findByReportCode("RPT-999999");

        verify(reportRepository, never())
                .delete(any(Report.class));
    }

    /**
     * ==============================================================
     * Validation - PDF Report Not Found
     * ==============================================================
     */
    @Test
    void generateReportPdf_shouldThrowWhenReportNotFound() {

        when(reportRepository.findByReportCode(
                "RPT-999999"
        )).thenReturn(Optional.empty());

        assertThrows(
                ResourceNotFoundException.class,
                () -> reportService.generateReportPdf(
                        "RPT-999999"
                )
        );

        verify(reportRepository)
                .findByReportCode("RPT-999999");

        verifyNoInteractions(reportPdfGenerator);
    }
}