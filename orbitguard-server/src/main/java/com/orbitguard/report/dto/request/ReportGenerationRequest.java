package com.orbitguard.report.dto.request;

import com.orbitguard.report.enums.ReportType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO used to generate a report.
 *
 * <p>
 * This class represents the data supplied by the client when
 * requesting report generation.
 * </p>
 *
 * <p>
 * Persistence-related fields such as report ID, report code,
 * status, and timestamps are intentionally excluded because
 * those values are controlled by the backend.
 * </p>
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportGenerationRequest {

    /**
     * Type of report that needs to be generated.
     */
    @NotNull(message = "Report type is required.")
    private ReportType reportType;

    /**
     * Human-readable title for the requested report.
     */
    @NotBlank(message = "Report title is required.")
    @Size(
            min = 3,
            max = 150,
            message = "Report title must be between 3 and 150 characters."
    )
    private String title;

    /**
     * Optional description provided by the client.
     */
    @Size(
            max = 500,
            message = "Report description must not exceed 500 characters."
    )
    private String description;
}