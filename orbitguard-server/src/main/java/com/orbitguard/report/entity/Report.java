package com.orbitguard.report.entity;

import com.orbitguard.report.enums.ReportStatus;
import com.orbitguard.report.enums.ReportType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

/**
 * MongoDB document representing a generated report in OrbitGuard AI.
 *
 * <p>
 * This entity is responsible only for report persistence data.
 * Report-generation business logic belongs in the service layer.
 * </p>
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "reports")
public class Report {

    /**
     * MongoDB document identifier.
     */
    @Id
    private String id;

    /**
     * Unique business identifier of the report.
     *
     * <p>
     * This is different from the MongoDB document ID and can be
     * safely exposed as the report's business reference.
     * </p>
     */
    @Indexed(unique = true)
    private String reportCode;

    /**
     * Type of report.
     */
    private ReportType reportType;

    /**
     * Current lifecycle status of the report.
     */
    private ReportStatus status;

    /**
     * Human-readable report title.
     */
    private String title;

    /**
     * Short description of the report.
     */
    private String description;

    /**
     * Timestamp when the report was created.
     */
    @CreatedDate
    private LocalDateTime createdAt;

    /**
     * Timestamp when the report was last updated.
     */
    @LastModifiedDate
    private LocalDateTime updatedAt;
}