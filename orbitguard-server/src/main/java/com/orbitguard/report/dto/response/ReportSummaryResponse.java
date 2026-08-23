package com.orbitguard.report.dto.response;

import com.orbitguard.report.enums.ReportStatus;
import com.orbitguard.report.enums.ReportType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Lightweight response DTO used when returning report summaries.
 *
 * <p>
 * This DTO is intended for report listing and overview APIs where
 * the client does not require the complete report representation.
 * </p>
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportSummaryResponse {

    /**
     * MongoDB identifier of the report.
     */
    private String id;

    /**
     * Business identifier of the report.
     */
    private String reportCode;

    /**
     * Type of report.
     */
    private ReportType reportType;

    /**
     * Current processing status of the report.
     */
    private ReportStatus status;

    /**
     * Human-readable report title.
     */
    private String title;

    /**
     * Timestamp when the report was created.
     */
    private LocalDateTime createdAt;
}