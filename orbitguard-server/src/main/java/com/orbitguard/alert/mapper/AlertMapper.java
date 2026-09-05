package com.orbitguard.alert.mapper;

import com.orbitguard.alert.dto.request.CreateAlertRequest;
import com.orbitguard.alert.dto.response.AlertResponse;
import com.orbitguard.alert.entity.Alert;
import org.springframework.stereotype.Component;

/**
 * ==============================================================
 * Alert Mapper
 * ==============================================================
 *
 * Responsible for converting between:
 *
 * • CreateAlertRequest → Alert
 * • Alert → AlertResponse
 *
 * This class contains no business logic.
 *
 * Module : Alert Management
 *
 * @author OrbitGuard AI Team
 * @version 1.0
 */
@Component
public class AlertMapper {

    /**
     * --------------------------------------------------------------
     * Convert CreateAlertRequest to Alert Entity
     * --------------------------------------------------------------
     *
     * Only request fields are mapped here.
     *
     * Business fields such as:
     * • Alert Code
     * • Severity
     * • Status
     * • Source
     * • Type
     * • Audit Fields
     *
     * are populated inside the Service layer.
     *
     * @param request Create Alert Request
     * @return Alert Entity
     */
    public Alert toEntity(CreateAlertRequest request) {

        if (request == null) {
            return null;
        }

        return Alert.builder()
                .riskId(request.getRiskId())
                .title(request.getTitle())
                .message(request.getMessage())
                .build();
    }

    /**
     * --------------------------------------------------------------
     * Convert Alert Entity to AlertResponse
     * --------------------------------------------------------------
     *
     * @param alert Alert Entity
     * @return Alert Response DTO
     */
    public AlertResponse toResponse(Alert alert) {

        if (alert == null) {
            return null;
        }

        return AlertResponse.builder()
                .id(alert.getId())
                .alertCode(alert.getAlertCode())
                .riskId(alert.getRiskId())
                .satelliteId(alert.getSatelliteId())
                .debrisId(alert.getDebrisId())
                .title(alert.getTitle())
                .message(alert.getMessage())
                .remarks(alert.getRemarks())
                .severity(alert.getSeverity())
                .status(alert.getStatus())
                .source(alert.getSource())
                .type(alert.getType())
                .generatedAt(alert.getGeneratedAt())
                .acknowledgedAt(alert.getAcknowledgedAt())
                .resolvedAt(alert.getResolvedAt())
                .createdAt(alert.getCreatedAt())
                .updatedAt(alert.getUpdatedAt())
                .build();
    }

}