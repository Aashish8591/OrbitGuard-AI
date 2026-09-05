package com.orbitguard.risk.service.impl;

import com.orbitguard.common.exception.BadRequestException;
import com.orbitguard.common.exception.ResourceNotFoundException;
import com.orbitguard.common.response.ApiResponse;
import com.orbitguard.common.response.PagedResponse;
import com.orbitguard.common.sequence.SequenceConstants;
import com.orbitguard.common.sequence.SequenceGeneratorService;
import com.orbitguard.common.util.BusinessCodeGenerator;
import com.orbitguard.common.util.ResponseBuilder;
import com.orbitguard.debris.entity.SpaceDebris;
import com.orbitguard.debris.repository.DebrisRepository;
import com.orbitguard.orbit.propagation.dto.PropagatedOrbitalState;
import com.orbitguard.orbit.propagation.service.OrbitalPropagationFacade;
import com.orbitguard.risk.dto.request.AnalyzeRiskRequest;
import com.orbitguard.risk.dto.request.UpdateRiskStatusRequest;
import com.orbitguard.risk.dto.response.RiskAssessmentResponse;
import com.orbitguard.risk.entity.CollisionRisk;
import com.orbitguard.risk.enums.AssessmentType;
import com.orbitguard.risk.enums.RiskLevel;
import com.orbitguard.risk.enums.RiskStatus;
import com.orbitguard.risk.mapper.RiskAssessmentMapper;
import com.orbitguard.risk.repository.CollisionRiskRepository;
import com.orbitguard.risk.service.RiskAssessmentService;
import com.orbitguard.risk.specification.RiskQueryBuilder;
import com.orbitguard.risk.util.ProbabilityCalculator;
import com.orbitguard.risk.util.RiskCalculator;
import com.orbitguard.satellite.entity.Satellite;
import com.orbitguard.satellite.repository.SatelliteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RiskAssessmentServiceImpl implements RiskAssessmentService {

    private final CollisionRiskRepository collisionRiskRepository;

    private final SatelliteRepository satelliteRepository;

    private final DebrisRepository spaceDebrisRepository;

    private final RiskAssessmentMapper riskAssessmentMapper;

    private final ProbabilityCalculator probabilityCalculator;

    private final RiskCalculator riskCalculator;

    private final RiskQueryBuilder riskQueryBuilder;

    private final MongoTemplate mongoTemplate;

    private final BusinessCodeGenerator businessCodeGenerator;

    private final SequenceGeneratorService sequenceGeneratorService;

    private final OrbitalPropagationFacade orbitalPropagationFacade;

    /**
     * ------------------------------------------------------------------
     * Analyze Risk
     * ------------------------------------------------------------------
     */
    @Override
    @Transactional
    public ApiResponse<RiskAssessmentResponse> analyzeRisk(
            AnalyzeRiskRequest request) {

        // Validate Request
        if (request == null) {
            throw new BadRequestException(
                    "Risk analysis request cannot be null."
            );
        }

        // Fetch Active Satellite
        Satellite satellite =
                getActiveSatellite(request.getSatelliteId());

        // Fetch Active Space Debris
        SpaceDebris debris =
                getActiveDebris(request.getDebrisId());

        /*
         * Use one common timestamp for both orbital propagations.
         *
         * This is important because the satellite and debris
         * orbital states must represent the same point in time
         * before calculating their relative position and velocity.
         */
        LocalDateTime assessmentTime = LocalDateTime.now();

        /*
         * Propagate Satellite using its NORAD Catalog ID.
         */
        PropagatedOrbitalState satelliteState =
                orbitalPropagationFacade.propagateSatellite(
                        satellite.getNoradCatalogId(),
                        assessmentTime
                );

        /*
         * Propagate Debris using its NORAD ID.
         */
        PropagatedOrbitalState debrisState =
                orbitalPropagationFacade.propagateDebris(
                        debris.getNoradId(),
                        assessmentTime
                );

        // Calculate actual propagated orbital parameters
        double closestDistance =
                calculateDistance(
                        satelliteState,
                        debrisState
                );

        double relativeVelocity =
                calculateRelativeVelocity(
                        satelliteState,
                        debrisState
                );

        // Calculate Collision Probability
        double collisionProbability =
                probabilityCalculator.calculateProbability(
                        closestDistance,
                        relativeVelocity
                );

        // Determine Risk Level
        RiskLevel riskLevel =
                riskCalculator.calculateRiskLevel(
                        collisionProbability
                );

        // Generate Recommendation
        String recommendation =
                riskCalculator.generateRecommendation(
                        riskLevel
                );

        // Generate Business Code
        String riskCode = generateRiskCode();

        // Build Entity
        CollisionRisk collisionRisk =
                CollisionRisk.builder()
                        .riskCode(riskCode)
                        .satelliteId(satellite.getId())
                        .debrisId(debris.getId())
                        .closestApproachDistanceKm(closestDistance)
                        .relativeVelocityKmPerSec(relativeVelocity)
                        .collisionProbability(collisionProbability)
                        .riskLevel(riskLevel)
                        .status(RiskStatus.ANALYZED)
                        .assessmentType(AssessmentType.RULE_BASED)
                        .remarks(null)
                        .recommendation(recommendation)
                        .isActive(true)
                        .assessedAt(assessmentTime)
                        .createdAt(assessmentTime)
                        .updatedAt(assessmentTime)
                        .build();

        // Save Assessment
        CollisionRisk savedRisk =
                collisionRiskRepository.save(collisionRisk);

        // Convert Entity to Response
        RiskAssessmentResponse response =
                riskAssessmentMapper.toResponse(savedRisk);

        // Return Success Response
        return ResponseBuilder.success(
                "Collision risk analyzed successfully.",
                response
        );
    }

    /**
     * ------------------------------------------------------------------
     * Calculate Distance Between Propagated Orbital States
     * ------------------------------------------------------------------
     *
     * Calculates the instantaneous 3D distance between
     * satellite and debris positions.
     *
     * Unit:
     * Kilometers
     */
    private double calculateDistance(
            PropagatedOrbitalState satelliteState,
            PropagatedOrbitalState debrisState) {

        double deltaX =
                satelliteState.getPositionX()
                        - debrisState.getPositionX();

        double deltaY =
                satelliteState.getPositionY()
                        - debrisState.getPositionY();

        double deltaZ =
                satelliteState.getPositionZ()
                        - debrisState.getPositionZ();

        return Math.sqrt(
                (deltaX * deltaX)
                        + (deltaY * deltaY)
                        + (deltaZ * deltaZ)
        );
    }

    /**
     * ------------------------------------------------------------------
     * Calculate Relative Velocity Between Propagated States
     * ------------------------------------------------------------------
     *
     * Calculates the magnitude of the relative velocity vector.
     *
     * Unit:
     * Kilometers per second
     */
    private double calculateRelativeVelocity(
            PropagatedOrbitalState satelliteState,
            PropagatedOrbitalState debrisState) {

        double deltaVelocityX =
                satelliteState.getVelocityX()
                        - debrisState.getVelocityX();

        double deltaVelocityY =
                satelliteState.getVelocityY()
                        - debrisState.getVelocityY();

        double deltaVelocityZ =
                satelliteState.getVelocityZ()
                        - debrisState.getVelocityZ();

        return Math.sqrt(
                (deltaVelocityX * deltaVelocityX)
                        + (deltaVelocityY * deltaVelocityY)
                        + (deltaVelocityZ * deltaVelocityZ)
        );
    }

    /**
     * ------------------------------------------------------------------
     * Get Risk By Id
     * ------------------------------------------------------------------
     */
    @Override
    @Transactional(readOnly = true)
    public ApiResponse<RiskAssessmentResponse> getRiskById(
            String riskId) {

        // Validate Input
        if (riskId == null || riskId.isBlank()) {
            throw new BadRequestException(
                    "Risk ID cannot be null or empty."
            );
        }

        // Fetch Risk
        CollisionRisk collisionRisk =
                collisionRiskRepository
                        .findByIdAndIsActiveTrue(riskId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Collision Risk not found with ID: "
                                                + riskId
                                ));

        // Convert Entity to Response DTO
        RiskAssessmentResponse response =
                riskAssessmentMapper.toResponse(collisionRisk);

        // Return Success Response
        return ResponseBuilder.success(
                "Collision risk retrieved successfully.",
                response
        );
    }

    /**
     * ------------------------------------------------------------------
     * Get All Risks
     * ------------------------------------------------------------------
     */
    @Override
    @Transactional(readOnly = true)
    public ApiResponse<PagedResponse<RiskAssessmentResponse>> getAllRisks(
            String search,
            RiskLevel riskLevel,
            RiskStatus status,
            AssessmentType assessmentType,
            String satelliteId,
            String debrisId,
            LocalDateTime fromDate,
            LocalDateTime toDate,
            Pageable pageable) {

        // Build Dynamic Query
        Query query = riskQueryBuilder.buildQuery(
                search,
                riskLevel,
                status,
                assessmentType,
                satelliteId,
                debrisId,
                fromDate,
                toDate
        );

        // Count Total Records
        long totalElements =
                mongoTemplate.count(
                        query,
                        CollisionRisk.class
                );

        // Apply Pagination
        query.with(pageable);

        // Fetch Records
        List<CollisionRisk> collisionRisks =
                mongoTemplate.find(
                        query,
                        CollisionRisk.class
                );

        // Convert Entity -> Response DTO
        List<RiskAssessmentResponse> responses =
                collisionRisks.stream()
                        .map(riskAssessmentMapper::toResponse)
                        .toList();

        // Create Spring Page
        Page<RiskAssessmentResponse> page =
                new PageImpl<>(
                        responses,
                        pageable,
                        totalElements
                );

        // Convert to PagedResponse
        PagedResponse<RiskAssessmentResponse> pagedResponse =
                PagedResponse.from(page);

        // Return Success Response
        return ResponseBuilder.success(
                "Collision risks retrieved successfully.",
                pagedResponse
        );
    }

    /**
     * ------------------------------------------------------------------
     * Update Risk Status
     * ------------------------------------------------------------------
     */
    @Override
    @Transactional
    public ApiResponse<RiskAssessmentResponse> updateRiskStatus(
            String id,
            UpdateRiskStatusRequest request) {

        // Validate Risk ID
        if (id == null || id.isBlank()) {
            throw new BadRequestException(
                    "Risk ID cannot be null or empty."
            );
        }

        // Validate Request
        if (request == null) {
            throw new BadRequestException(
                    "Update request cannot be null."
            );
        }

        // Fetch Active Risk
        CollisionRisk collisionRisk =
                collisionRiskRepository
                        .findByIdAndIsActiveTrue(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Collision Risk not found with ID: "
                                                + id
                                ));

        // Update Status
        collisionRisk.setStatus(request.getStatus());

        // Update Remarks
        collisionRisk.setRemarks(request.getRemarks());

        // Update Audit Fields
        updateAuditFields(collisionRisk);

        // Save Updated Risk
        CollisionRisk updatedRisk =
                collisionRiskRepository.save(collisionRisk);

        // Convert Entity to Response DTO
        RiskAssessmentResponse response =
                riskAssessmentMapper.toResponse(updatedRisk);

        // Return Success Response
        return ResponseBuilder.success(
                "Collision risk status updated successfully.",
                response
        );
    }

    /**
     * ------------------------------------------------------------------
     * Delete Risk
     * ------------------------------------------------------------------
     */
    @Override
    @Transactional
    public ApiResponse<Void> deleteRisk(String id) {

        // Validate Risk ID
        if (id == null || id.isBlank()) {
            throw new BadRequestException(
                    "Risk ID cannot be null or empty."
            );
        }

        // Fetch Active Risk
        CollisionRisk collisionRisk =
                collisionRiskRepository
                        .findByIdAndIsActiveTrue(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Collision Risk not found with ID: "
                                                + id
                                ));

        // Soft Delete
        collisionRisk.setIsActive(false);

        // Update Audit Fields
        updateAuditFields(collisionRisk);

        // Save Updated Entity
        collisionRiskRepository.save(collisionRisk);

        // Return Success Response
        return ResponseBuilder.success(
                "Collision risk deleted successfully."
        );
    }

    /**
     * Generates a unique business code for Collision Risk.
     *
     * Example:
     * RSK-000001
     *
     * @return Risk Business Code
     */
    private String generateRiskCode() {

        long sequence =
                sequenceGeneratorService.getNextSequence(
                        SequenceConstants.RISK_SEQUENCE
                );

        return businessCodeGenerator.generate(
                "RSK",
                sequence
        );
    }

    /**
     * Fetches an active satellite by its MongoDB ID.
     *
     * @param satelliteId Satellite ID
     * @return Active Satellite
     * @throws ResourceNotFoundException if satellite does not exist
     */
    private Satellite getActiveSatellite(
            String satelliteId) {

        return satelliteRepository
                .findByIdAndActiveTrue(satelliteId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Satellite not found with ID: "
                                        + satelliteId
                        ));
    }

    /**
     * Fetches an active space debris by its MongoDB ID.
     *
     * @param debrisId Debris ID
     * @return Active Space Debris
     * @throws ResourceNotFoundException if debris does not exist
     */
    private SpaceDebris getActiveDebris(
            String debrisId) {

        return spaceDebrisRepository
                .findByIdAndIsActiveTrue(debrisId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Space debris not found with ID: "
                                        + debrisId
                        ));
    }

    /**
     * Updates audit timestamp.
     *
     * @param collisionRisk Risk Entity
     */
    private void updateAuditFields(
            CollisionRisk collisionRisk) {

        collisionRisk.setUpdatedAt(
                LocalDateTime.now()
        );
    }
}