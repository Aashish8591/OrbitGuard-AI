package com.orbitguard.report.dto.response;

import com.orbitguard.report.enums.ReportStatus;
import com.orbitguard.report.enums.ReportType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Response DTO representing report information returned by
 * the Reports REST API.
 *
 * <p>
 * This DTO is intentionally separated from the MongoDB
 * {@code Report} entity to prevent direct exposure of the
 * persistence model through the API.
 * </p>
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportResponse {

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
     * Description of the report.
     */
    private String description;

    /**
     * Timestamp when the report was created.
     */
    private LocalDateTime createdAt;

    /**
     * Timestamp when the report was last updated.
     */
    private LocalDateTime updatedAt;
}