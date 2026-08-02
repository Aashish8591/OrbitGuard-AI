package com.orbitguard.alert.dto.response;

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
 * Alert Response
 * ==============================================================
 *
 * Response DTO returned to clients for Alert APIs.
 *
 * This class contains all information required by the
 * frontend without exposing the database entity.
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
public class AlertResponse {

    /**
     * MongoDB document ID.
     */
    private String id;

    /**
     * Business Alert Code.
     * Example : ALT-000001
     */
    private String alertCode;

    /**
     * Related Collision Risk ID.
     */
    private String riskId;

    /**
     * Related Satellite ID.
     */
    private String satelliteId;

    /**
     * Related Space Debris ID.
     */
    private String debrisId;

    /**
     * Alert title.
     */
    private String title;

    /**
     * Alert description/message.
     */
    private String message;

    /**
     * Alert severity.
     */
    private AlertSeverity severity;

    /**
     * Alert status.
     */
    private AlertStatus status;

    /**
     * Alert source.
     */
    private AlertSource source;

    /**
     * Alert type.
     */
    private AlertType type;

    /**
     * Time when the alert was generated.
     */
    private LocalDateTime generatedAt;

    /**
     * Time when the alert was acknowledged.
     */
    private LocalDateTime acknowledgedAt;

    /**
     * Time when the alert was resolved.
     */
    private LocalDateTime resolvedAt;

    /**
     * Record creation timestamp.
     */
    private LocalDateTime createdAt;

    /**
     * Record last update timestamp.
     */
    private LocalDateTime updatedAt;
}