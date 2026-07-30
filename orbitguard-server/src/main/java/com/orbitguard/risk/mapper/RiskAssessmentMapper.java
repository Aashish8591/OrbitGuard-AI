package com.orbitguard.risk.mapper;

import com.orbitguard.risk.dto.request.AnalyzeRiskRequest;
import com.orbitguard.risk.dto.response.RiskAssessmentResponse;
import com.orbitguard.risk.entity.CollisionRisk;
import org.springframework.stereotype.Component;

@Component
public class RiskAssessmentMapper {

    /**
     * Convert AnalyzeRiskRequest to CollisionRisk Entity.
     * Only maps client supplied fields.
     * Business fields are populated by the service layer.
     */
    public CollisionRisk toEntity(AnalyzeRiskRequest request) {

        if (request == null) {
            return null;
        }

        return CollisionRisk.builder()
                .satelliteId(request.getSatelliteId())
                .debrisId(request.getDebrisId())
                .build();
    }

    /**
     * Convert CollisionRisk Entity to Response DTO.
     */
    public RiskAssessmentResponse toResponse(CollisionRisk collisionRisk) {

        if (collisionRisk == null) {
            return null;
        }

        return RiskAssessmentResponse.builder()
                .id(collisionRisk.getId())
                .riskCode(collisionRisk.getRiskCode())
                .satelliteId(collisionRisk.getSatelliteId())
                .debrisId(collisionRisk.getDebrisId())
                .closestApproachDistanceKm(collisionRisk.getClosestApproachDistanceKm())
                .relativeVelocityKmPerSec(collisionRisk.getRelativeVelocityKmPerSec())
                .collisionProbability(collisionRisk.getCollisionProbability())
                .riskLevel(collisionRisk.getRiskLevel())
                .status(collisionRisk.getStatus())
                .assessmentType(collisionRisk.getAssessmentType())
                .recommendation(collisionRisk.getRecommendation())
                .remarks(collisionRisk.getRemarks())
                .assessedAt(collisionRisk.getAssessedAt())
                .createdAt(collisionRisk.getCreatedAt())
                .updatedAt(collisionRisk.getUpdatedAt())
                .build();
    }

}