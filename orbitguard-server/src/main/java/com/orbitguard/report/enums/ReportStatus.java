package com.orbitguard.report.enums;

/**
 * Represents the lifecycle status of a report.
 *
 * <p>
 * A report moves through these states while it is being
 * generated, processed, and made available to the user.
 * </p>
 */
public enum ReportStatus {

    /**
     * Report generation has been requested but processing
     * has not started yet.
     */
    PENDING,

    /**
     * Report generation is currently in progress.
     */
    PROCESSING,

    /**
     * Report generation completed successfully and the
     * generated report is available.
     */
    COMPLETED,

    /**
     * Report generation failed during processing.
     */
    FAILED
}