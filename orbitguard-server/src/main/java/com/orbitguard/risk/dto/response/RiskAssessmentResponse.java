package com.orbitguard.risk.dto.response;

import com.orbitguard.risk.enums.AssessmentType;
import com.orbitguard.risk.enums.RiskLevel;
import com.orbitguard.risk.enums.RiskStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RiskAssessmentResponse {

    private String id;

    private String riskCode;

    private String satelliteId;

    private String debrisId;

    private Double closestApproachDistanceKm;

    private Double relativeVelocityKmPerSec;

    private Double collisionProbability;

    private RiskLevel riskLevel;

    private RiskStatus status;

    private AssessmentType assessmentType;

    private String recommendation;

    private String remarks;

    private LocalDateTime assessedAt;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

}