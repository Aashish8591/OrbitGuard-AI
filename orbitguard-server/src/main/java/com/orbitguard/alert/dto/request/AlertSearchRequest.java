package com.orbitguard.alert.dto.request;

import com.orbitguard.alert.enums.AlertSeverity;
import com.orbitguard.alert.enums.AlertSource;
import com.orbitguard.alert.enums.AlertStatus;
import com.orbitguard.alert.enums.AlertType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * ==============================================================
 * Alert Search Request
 * ==============================================================
 *
 * Request DTO used for searching and filtering
 * alert records.
 *
 * Supports:
 * • Search
 * • Severity Filter
 * • Status Filter
 * • Source Filter
 * • Type Filter
 * • Risk Filter
 * • Satellite Filter
 * • Debris Filter
 * • Date Range Filter
 *
 * Module : Alert Management
 *
 * @author OrbitGuard AI Team
 * @version 1.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AlertSearchRequest {

    /**
     * Search keyword.
     *
     * Searches by:
     * • Alert Code
     * • Title
     * • Message
     */
    private String search;

    /**
     * Filter by alert severity.
     */
    private AlertSeverity severity;

    /**
     * Filter by alert status.
     */
    private AlertStatus status;

    /**
     * Filter by alert source.
     */
    private AlertSource source;

    /**
     * Filter by alert type.
     */
    private AlertType type;

    /**
     * Filter by Risk ID.
     */
    private String riskId;

    /**
     * Filter by Satellite ID.
     */
    private String satelliteId;

    /**
     * Filter by Space Debris ID.
     */
    private String debrisId;

    /**
     * Search alerts generated from this date.
     */
    private LocalDateTime fromDate;

    /**
     * Search alerts generated until this date.
     */
    private LocalDateTime toDate;

}