package com.orbitguard.report.mapper;

import com.orbitguard.report.dto.request.ReportGenerationRequest;
import com.orbitguard.report.dto.response.ReportResponse;
import com.orbitguard.report.dto.response.ReportSummaryResponse;
import com.orbitguard.report.entity.Report;
import org.springframework.stereotype.Component;

/**
 * Mapper responsible for converting Report entities and DTOs.
 *
 * <p>
 * This class keeps object-conversion logic separate from the
 * controller and service layers.
 * </p>
 */
@Component
public class ReportMapper {

    /**
     * Converts a report-generation request into a Report entity.
     *
     * <p>
     * Backend-managed fields such as ID, report code, status,
     * and timestamps are intentionally not populated here.
     * Those values belong to the service/persistence lifecycle.
     * </p>
     *
     * @param request report generation request
     * @return mapped Report entity
     */
    public Report toEntity(ReportGenerationRequest request) {

        if (request == null) {
            return null;
        }

        return Report.builder()
                .reportType(request.getReportType())
                .title(request.getTitle())
                .description(request.getDescription())
                .build();
    }

    /**
     * Converts a Report entity into a detailed response DTO.
     *
     * @param report report entity
     * @return detailed report response
     */
    public ReportResponse toResponse(Report report) {

        if (report == null) {
            return null;
        }

        return ReportResponse.builder()
                .id(report.getId())
                .reportCode(report.getReportCode())
                .reportType(report.getReportType())
                .status(report.getStatus())
                .title(report.getTitle())
                .description(report.getDescription())
                .createdAt(report.getCreatedAt())
                .updatedAt(report.getUpdatedAt())
                .build();
    }

    /**
     * Converts a Report entity into a lightweight summary response.
     *
     * @param report report entity
     * @return report summary response
     */
    public ReportSummaryResponse toSummaryResponse(Report report) {

        if (report == null) {
            return null;
        }

        return ReportSummaryResponse.builder()
                .id(report.getId())
                .reportCode(report.getReportCode())
                .reportType(report.getReportType())
                .status(report.getStatus())
                .title(report.getTitle())
                .createdAt(report.getCreatedAt())
                .build();
    }
}