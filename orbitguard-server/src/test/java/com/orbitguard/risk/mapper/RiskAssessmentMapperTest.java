
package com.orbitguard.risk.mapper;

import com.orbitguard.risk.dto.request.AnalyzeRiskRequest;
import com.orbitguard.risk.dto.response.RiskAssessmentResponse;
import com.orbitguard.risk.entity.CollisionRisk;
import com.orbitguard.risk.enums.AssessmentType;
import com.orbitguard.risk.enums.RiskLevel;
import com.orbitguard.risk.enums.RiskStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

class RiskAssessmentMapperTest {

    private RiskAssessmentMapper mapper;

    @BeforeEach
    void setUp() {
        mapper = new RiskAssessmentMapper();
    }

    @Test
    void shouldMapRequestToEntity() {
        AnalyzeRiskRequest request = AnalyzeRiskRequest.builder()
                .satelliteId("satellite-123")
                .debrisId("debris-456")
                .build();

        CollisionRisk entity = mapper.toEntity(request);

        assertNotNull(entity);
        assertEquals("satellite-123", entity.getSatelliteId());
        assertEquals("debris-456", entity.getDebrisId());

        // Business-calculated fields should not come from the request.
        assertNull(entity.getCollisionProbability());
        assertNull(entity.getRiskLevel());
        assertNull(entity.getRiskCode());
    }

    @Test
    void shouldReturnNullWhenRequestIsNull() {
        assertNull(mapper.toEntity(null));
    }

    @Test
    void shouldMapEntityToResponse() {
        LocalDateTime now = LocalDateTime.of(2026, 10, 12, 1, 0);

        CollisionRisk entity = CollisionRisk.builder()
                .id("risk-document-123")
                .riskCode("RSK-000001")
                .satelliteId("satellite-123")
                .debrisId("debris-456")
                .closestApproachDistanceKm(2.0)
                .relativeVelocityKmPerSec(5.0)
                .collisionProbability(71.0)
                .riskLevel(RiskLevel.HIGH)
                .status(RiskStatus.ANALYZED)
                .assessmentType(AssessmentType.RULE_BASED)
                .recommendation("Increase monitoring.")
                .assessedAt(now)
                .createdAt(now)
                .updatedAt(now)
                .build();

        RiskAssessmentResponse response = mapper.toResponse(entity);

        assertNotNull(response);
        assertEquals("risk-document-123", response.getId());
        assertEquals("RSK-000001", response.getRiskCode());
        assertEquals("satellite-123", response.getSatelliteId());
        assertEquals("debris-456", response.getDebrisId());
        assertEquals(2.0, response.getClosestApproachDistanceKm());
        assertEquals(5.0, response.getRelativeVelocityKmPerSec());
        assertEquals(71.0, response.getCollisionProbability());
        assertEquals(RiskLevel.HIGH, response.getRiskLevel());
        assertEquals(RiskStatus.ANALYZED, response.getStatus());
        assertEquals(AssessmentType.RULE_BASED, response.getAssessmentType());
        assertEquals("Increase monitoring.", response.getRecommendation());
        assertEquals(now, response.getAssessedAt());
    }

    @Test
    void shouldReturnNullWhenEntityIsNull() {
        assertNull(mapper.toResponse(null));
    }
}
