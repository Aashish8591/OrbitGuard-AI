package com.orbitguard.risk.service.impl;
import com.orbitguard.alert.dto.request.CreateAlertRequest;
import com.orbitguard.alert.service.AlertService;
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
import java.time.ZoneOffset;
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
    private final AlertService alertService;
    private final SequenceGeneratorService sequenceGeneratorService;
    private final OrbitalPropagationFacade orbitalPropagationFacade;

    /*
     * ================================================================
     * ANALYZE RISK
     * ================================================================
     */
    @Override
    @Transactional
    public ApiResponse<RiskAssessmentResponse> analyzeRisk(
            AnalyzeRiskRequest request
    ) {

        validateAnalyzeRiskRequest(request);

        Satellite satellite =
                getActiveSatellite(request.getSatelliteId());

        SpaceDebris debris =
                getActiveDebris(request.getDebrisId());

        validateSatelliteNoradId(
                satellite.getNoradCatalogId()
        );

        validateDebrisNoradId(
                debris.getNoradId()
        );

        /*
         * Use UTC consistently for both orbital propagation calls.
         *
         * Both objects must be propagated to the same target time
         * before their relative position and velocity are compared.
         */
        LocalDateTime assessmentTime =
                LocalDateTime.now(ZoneOffset.UTC);

        /*
         * Propagate satellite.
         *
         * The facade is responsible for choosing live CelesTrak data
         * or its configured MongoDB fallback.
         */
        PropagatedOrbitalState satelliteState =
                orbitalPropagationFacade.propagateSatellite(
                        satellite.getNoradCatalogId(),
                        assessmentTime
                );

        validatePropagatedState(
                satelliteState,
                "satellite",
                satellite.getNoradCatalogId()
        );

        /*
         * Propagate debris.
         *
         * This call still follows the existing debris propagation
         * implementation in OrbitalPropagationFacadeImpl.
         */
        PropagatedOrbitalState debrisState =
                orbitalPropagationFacade.propagateDebris(
                        debris.getNoradId(),
                        assessmentTime
                );

        validatePropagatedState(
                debrisState,
                "debris",
                debris.getNoradId()
        );

        /*
         * Calculate instantaneous separation distance.
         *
         * Unit: kilometers.
         */
        double separationDistance =
                calculateDistance(
                        satelliteState,
                        debrisState
                );

        /*
         * Calculate relative velocity magnitude.
         *
         * Unit: kilometers per second.
         */
        double relativeVelocity =
                calculateRelativeVelocity(
                        satelliteState,
                        debrisState
                );

        /*
         * Calculate probability using the existing rule-based
         * ProbabilityCalculator.
         */
        double collisionProbability =
                probabilityCalculator.calculateProbability(
                        separationDistance,
                        relativeVelocity
                );

        if (!Double.isFinite(collisionProbability)
                || collisionProbability < 0.0
                || collisionProbability > 100.0) {
            throw new IllegalStateException(
                    "Collision risk score must be a finite value between 0 and 100."
            );
        }

        /*
         * Determine risk level and recommendation using the
         * existing RiskCalculator.
         */
        RiskLevel riskLevel =
                riskCalculator.calculateRiskLevel(
                        collisionProbability
                );

        if (riskLevel == null) {
            throw new IllegalStateException(
                    "RiskCalculator returned a null risk level."
            );
        }

        String recommendation =
                riskCalculator.generateRecommendation(
                        riskLevel
                );

        /*
         * Generate the business risk code.
         */
        String riskCode = generateRiskCode();

        /*
         * Build the collision risk entity.
         *
         * Note: separationDistance is an instantaneous separation.
         * The existing entity field name is retained to avoid
         * changing the current persistence contract.
         */
        CollisionRisk collisionRisk =
                CollisionRisk.builder()
                        .riskCode(riskCode)
                        .satelliteId(satellite.getId())
                        .debrisId(debris.getId())
                        .closestApproachDistanceKm(separationDistance)
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

        /*
         * Persist the assessment.
         */
        CollisionRisk savedRisk =
                collisionRiskRepository.save(collisionRisk);

        if (savedRisk.getId() == null
                || savedRisk.getId().isBlank()) {

            throw new IllegalStateException(
                    "Saved collision risk does not contain a document ID."
            );
        }

        /*
         * Create an alert using the MongoDB document ID.
         * Do not use the business risk code as the document ID.
         */
        CreateAlertRequest alertRequest =
                CreateAlertRequest.builder()
                        .riskId(savedRisk.getId())
                        .build();

        alertService.createAlert(alertRequest);

        /*
         * Convert entity to response and return success.
         */
        RiskAssessmentResponse response =
                riskAssessmentMapper.toResponse(savedRisk);

        return ResponseBuilder.success(
                "Collision risk analyzed successfully.",
                response
        );
    }

    /*
     * ================================================================
     * VALIDATE ANALYZE RISK REQUEST
     * ================================================================
     */
    private void validateAnalyzeRiskRequest(
            AnalyzeRiskRequest request
    ) {

        if (request == null) {
            throw new BadRequestException(
                    "Risk analysis request cannot be null."
            );
        }

        if (request.getSatelliteId() == null
                || request.getSatelliteId().isBlank()) {

            throw new BadRequestException(
                    "Satellite ID cannot be null or empty."
            );
        }

        if (request.getDebrisId() == null
                || request.getDebrisId().isBlank()) {

            throw new BadRequestException(
                    "Debris ID cannot be null or empty."
            );
        }
    }

    /*
     * ================================================================
     * VALIDATE SATELLITE NORAD ID
     * ================================================================
     */
    private void validateSatelliteNoradId(
            Integer noradCatalogId
    ) {

        if (noradCatalogId == null || noradCatalogId <= 0) {
            throw new BadRequestException(
                    "Satellite NORAD catalog ID must be greater than zero."
            );
        }
    }

    /*
     * ================================================================
     * VALIDATE DEBRIS NORAD ID
     * ================================================================
     */
    private void validateDebrisNoradId(
            Long noradId
    ) {

        if (noradId == null || noradId <= 0) {
            throw new BadRequestException(
                    "Debris NORAD ID must be greater than zero."
            );
        }
    }

    /*
     * ================================================================
     * VALIDATE PROPAGATED ORBITAL STATE
     * ================================================================
     */
    private void validatePropagatedState(
            PropagatedOrbitalState state,
            String objectType,
            Number noradId
    ) {

        if (state == null) {
            throw new IllegalStateException(
                    "Propagated orbital state is null for " +
                            objectType +
                            " NORAD ID: " +
                            noradId
            );
        }

        if (state.getPositionX() == null
                || state.getPositionY() == null
                || state.getPositionZ() == null) {

            throw new IllegalStateException(
                    "Incomplete propagated position data for " +
                            objectType +
                            " NORAD ID: " +
                            noradId
            );
        }

        if (state.getVelocityX() == null
                || state.getVelocityY() == null
                || state.getVelocityZ() == null) {

            throw new IllegalStateException(
                    "Incomplete propagated velocity data for " +
                            objectType +
                            " NORAD ID: " +
                            noradId
            );
        }

        if (!isFinite(
                state.getPositionX(),
                state.getPositionY(),
                state.getPositionZ(),
                state.getVelocityX(),
                state.getVelocityY(),
                state.getVelocityZ()
        )) {

            throw new IllegalStateException(
                    "Invalid numerical values returned by orbital " +
                            "propagation for " +
                            objectType +
                            " NORAD ID: " +
                            noradId
            );
        }
    }

    /*
     * ================================================================
     * VALIDATE NUMERICAL VALUES
     * ================================================================
     */
    private boolean isFinite(
            double positionX,
            double positionY,
            double positionZ,
            double velocityX,
            double velocityY,
            double velocityZ
    ) {

        return Double.isFinite(positionX)
                && Double.isFinite(positionY)
                && Double.isFinite(positionZ)
                && Double.isFinite(velocityX)
                && Double.isFinite(velocityY)
                && Double.isFinite(velocityZ);
    }

    /*
     * ================================================================
     * CALCULATE DISTANCE BETWEEN PROPAGATED STATES
     * ================================================================
     *
     * Assumes both states use the same coordinate frame and units.
     *
     * Unit: kilometers.
     */
    private double calculateDistance(
            PropagatedOrbitalState satelliteState,
            PropagatedOrbitalState debrisState
    ) {

        double deltaX =
                satelliteState.getPositionX()
                        - debrisState.getPositionX();

        double deltaY =
                satelliteState.getPositionY()
                        - debrisState.getPositionY();

        double deltaZ =
                satelliteState.getPositionZ()
                        - debrisState.getPositionZ();

        double distance =
                Math.sqrt(
                        (deltaX * deltaX)
                                + (deltaY * deltaY)
                                + (deltaZ * deltaZ)
                );

        if (!Double.isFinite(distance)) {
            throw new IllegalStateException(
                    "Unable to calculate a valid separation distance."
            );
        }

        return distance;
    }

    /*
     * ================================================================
     * CALCULATE RELATIVE VELOCITY
     * ================================================================
     *
     * Assumes both velocity vectors use the same coordinate frame
     * and units.
     *
     * Unit: kilometers per second.
     */
    private double calculateRelativeVelocity(
            PropagatedOrbitalState satelliteState,
            PropagatedOrbitalState debrisState
    ) {

        double deltaVelocityX =
                satelliteState.getVelocityX()
                        - debrisState.getVelocityX();

        double deltaVelocityY =
                satelliteState.getVelocityY()
                        - debrisState.getVelocityY();

        double deltaVelocityZ =
                satelliteState.getVelocityZ()
                        - debrisState.getVelocityZ();

        double relativeVelocity =
                Math.sqrt(
                        (deltaVelocityX * deltaVelocityX)
                                + (deltaVelocityY * deltaVelocityY)
                                + (deltaVelocityZ * deltaVelocityZ)
                );

        if (!Double.isFinite(relativeVelocity)) {
            throw new IllegalStateException(
                    "Unable to calculate a valid relative velocity."
            );
        }

        return relativeVelocity;
    }

    /*
     * ================================================================
     * GET RISK BY ID
     * ================================================================
     */
    @Override
    @Transactional(readOnly = true)
    public ApiResponse<RiskAssessmentResponse> getRiskById(
            String riskId
    ) {

        if (riskId == null || riskId.isBlank()) {
            throw new BadRequestException(
                    "Risk ID cannot be null or empty."
            );
        }

        CollisionRisk collisionRisk =
                collisionRiskRepository
                        .findByIdAndIsActiveTrue(riskId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Collision Risk not found with ID: " +
                                                riskId
                                ));

        RiskAssessmentResponse response =
                riskAssessmentMapper.toResponse(collisionRisk);

        return ResponseBuilder.success(
                "Collision risk retrieved successfully.",
                response
        );
    }

    /*
     * ================================================================
     * GET ALL RISKS
     * ================================================================
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
            Pageable pageable
    ) {

        if (pageable == null) {
            throw new BadRequestException(
                    "Pageable cannot be null."
            );
        }

        if (fromDate != null
                && toDate != null
                && fromDate.isAfter(toDate)) {

            throw new BadRequestException(
                    "From date cannot be later than to date."
            );
        }

        Query query =
                riskQueryBuilder.buildQuery(
                        search,
                        riskLevel,
                        status,
                        assessmentType,
                        satelliteId,
                        debrisId,
                        fromDate,
                        toDate
                );

        long totalElements =
                mongoTemplate.count(
                        query,
                        CollisionRisk.class
                );

        query.with(pageable);

        List<CollisionRisk> collisionRisks =
                mongoTemplate.find(
                        query,
                        CollisionRisk.class
                );

        List<RiskAssessmentResponse> responses =
                collisionRisks.stream()
                        .map(riskAssessmentMapper::toResponse)
                        .toList();

        Page<RiskAssessmentResponse> page =
                new PageImpl<>(
                        responses,
                        pageable,
                        totalElements
                );

        PagedResponse<RiskAssessmentResponse> pagedResponse =
                PagedResponse.from(page);

        return ResponseBuilder.success(
                "Collision risks retrieved successfully.",
                pagedResponse
        );
    }

    /*
     * ================================================================
     * UPDATE RISK STATUS
     * ================================================================
     */
    @Override
    @Transactional
    public ApiResponse<RiskAssessmentResponse> updateRiskStatus(
            String id,
            UpdateRiskStatusRequest request
    ) {

        if (id == null || id.isBlank()) {
            throw new BadRequestException(
                    "Risk ID cannot be null or empty."
            );
        }

        if (request == null) {
            throw new BadRequestException(
                    "Update request cannot be null."
            );
        }

        CollisionRisk collisionRisk =
                collisionRiskRepository
                        .findByIdAndIsActiveTrue(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Collision Risk not found with ID: " +
                                                id
                                ));

        if (request.getStatus() == null) {
            throw new BadRequestException(
                    "Risk status cannot be null."
            );
        }

        collisionRisk.setStatus(request.getStatus());
        collisionRisk.setRemarks(request.getRemarks());

        updateAuditFields(collisionRisk);

        CollisionRisk updatedRisk =
                collisionRiskRepository.save(collisionRisk);

        RiskAssessmentResponse response =
                riskAssessmentMapper.toResponse(updatedRisk);

        return ResponseBuilder.success(
                "Collision risk status updated successfully.",
                response
        );
    }

    /*
     * ================================================================
     * DELETE RISK (SOFT DELETE)
     * ================================================================
     */
    @Override
    @Transactional
    public ApiResponse<Void> deleteRisk(
            String id
    ) {

        if (id == null || id.isBlank()) {
            throw new BadRequestException(
                    "Risk ID cannot be null or empty."
            );
        }

        CollisionRisk collisionRisk =
                collisionRiskRepository
                        .findByIdAndIsActiveTrue(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Collision Risk not found with ID: " +
                                                id
                                ));

        collisionRisk.setIsActive(false);

        updateAuditFields(collisionRisk);

        collisionRiskRepository.save(collisionRisk);

        return ResponseBuilder.success(
                "Collision risk deleted successfully."
        );
    }

    /*
     * ================================================================
     * GENERATE RISK BUSINESS CODE
     * ================================================================
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

    /*
     * ================================================================
     * FETCH ACTIVE SATELLITE
     * ================================================================
     */
    private Satellite getActiveSatellite(
            String satelliteId
    ) {

        return satelliteRepository
                .findByIdAndActiveTrue(satelliteId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Satellite not found with ID: " +
                                        satelliteId
                        ));
    }

    /*
     * ================================================================
     * FETCH ACTIVE SPACE DEBRIS
     * ================================================================
     */
    private SpaceDebris getActiveDebris(
            String debrisId
    ) {

        return spaceDebrisRepository
                .findByIdAndIsActiveTrue(debrisId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Space debris not found with ID: " +
                                        debrisId
                        ));
    }

    /*
     * ================================================================
     * UPDATE AUDIT FIELDS
     * ================================================================
     */
    private void updateAuditFields(
            CollisionRisk collisionRisk
    ) {

        collisionRisk.setUpdatedAt(
                LocalDateTime.now(ZoneOffset.UTC)
        );
    }
}
