package com.orbitguard.alert.service.impl;

import com.orbitguard.alert.dto.request.AlertSearchRequest;
import com.orbitguard.alert.dto.request.CreateAlertRequest;
import com.orbitguard.alert.dto.request.UpdateAlertStatusRequest;
import com.orbitguard.alert.dto.response.AlertResponse;
import com.orbitguard.alert.entity.Alert;
import com.orbitguard.alert.enums.AlertSource;
import com.orbitguard.alert.enums.AlertStatus;
import com.orbitguard.alert.enums.AlertType;
import com.orbitguard.alert.mapper.AlertMapper;
import com.orbitguard.alert.repository.AlertRepository;
import com.orbitguard.alert.service.AlertService;
import com.orbitguard.alert.specification.AlertQueryBuilder;
import com.orbitguard.alert.util.AlertMessageGenerator;
import com.orbitguard.alert.util.AlertPriorityCalculator;
import com.orbitguard.common.exception.BadRequestException;
import com.orbitguard.common.exception.ResourceNotFoundException;
import com.orbitguard.common.response.ApiResponse;
import com.orbitguard.common.response.PagedResponse;
import com.orbitguard.common.util.ResponseBuilder;
import com.orbitguard.common.sequence.SequenceConstants;
import com.orbitguard.common.sequence.SequenceGeneratorService;
import com.orbitguard.common.util.BusinessCodeGenerator;
import com.orbitguard.risk.entity.CollisionRisk;
import com.orbitguard.risk.repository.CollisionRiskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;


/**
 * ==============================================================
 * Alert Service Implementation
 * ==============================================================
 *
 * Handles all business operations related to Alert Management.
 *
 * Responsibilities:
 *
 * • Create Alert
 * • Retrieve Alert
 * • Search Alerts
 * • Update Alert Status
 * • Soft Delete Alert
 *
 * Business Rules:
 *
 * • Only active alerts are processed.
 * • Alert Code is generated automatically.
 * • Alert Severity is calculated from Risk Level.
 * • Soft delete is used instead of permanent deletion.
 * * Module : Alert Management
 *
 * @author OrbitGuard AI Team
 * @version 1.0
 */
@Service
@RequiredArgsConstructor
public class AlertServiceImpl implements AlertService {

    private final AlertRepository alertRepository;

    private final CollisionRiskRepository collisionRiskRepository;

    private final AlertMapper alertMapper;

    private final MongoTemplate mongoTemplate;

    private final AlertQueryBuilder alertQueryBuilder;

    private final BusinessCodeGenerator businessCodeGenerator;

    private final SequenceGeneratorService sequenceGeneratorService;

    private final AlertPriorityCalculator alertPriorityCalculator;

    private final AlertMessageGenerator alertMessageGenerator;

    /**
     * Business Prefix.
     */
    private static final String ALERT_PREFIX = "ALT";


    @Override
    public ApiResponse<AlertResponse> createAlert(
            CreateAlertRequest request
    ) {

        // Validate incoming request
        validateCreateRequest(request);

        // Fetch active collision risk
        CollisionRisk collisionRisk =
                getActiveRisk(request.getRiskId());

        // Generate business alert code
        String alertCode = generateAlertCode();

        // Build alert entity
        Alert alert = buildAlert(
                request,
                collisionRisk,
                alertCode
        );

        // Persist alert
        Alert savedAlert = saveAlert(alert);

        // Convert entity to response
        AlertResponse response =
                alertMapper.toResponse(savedAlert);

        // Return success response
        return ResponseBuilder.success(
                "Alert created successfully.",
                response
        );
    }

    /**
     * ----------------------------------------------------------
     * Validate Create Alert Request
     * ----------------------------------------------------------
     *
     * Validates the incoming create alert request
     * before processing.
     *
     * Business Rules:
     * • Request must not be null.
     * • Risk ID must be provided.
     *
     * @param request Create Alert Request
     */
    private void validateCreateRequest(
            CreateAlertRequest request
    ) {

        if (request == null) {
            throw new BadRequestException(
                    "Create Alert Request cannot be null."
            );
        }

        if (request.getRiskId() == null
                || request.getRiskId().isBlank()) {

            throw new BadRequestException(
                    "Risk ID is required."
            );
        }

    }

    /**
     * ----------------------------------------------------------
     * Get Active Collision Risk
     * ----------------------------------------------------------
     *
     * Retrieves an active collision risk by its ID.
     *
     * @param riskId Collision Risk ID
     * @return Active Collision Risk
     * @throws ResourceNotFoundException if risk is not found
     */
    private CollisionRisk getActiveRisk(
            String riskId
    ) {

        CollisionRisk collisionRisk = collisionRiskRepository
                .findByIdAndIsActiveTrue(riskId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Collision Risk not found with ID: " + riskId
                        )
                );

        return collisionRisk;
    }


    /**
     * ----------------------------------------------------------
     * Generate Alert Code
     * ----------------------------------------------------------
     *
     * Generates a unique business Alert Code.
     *
     * Example:
     * ALT-000001
     * ALT-000002
     *
     * @return Generated Alert Code
     */
    private String generateAlertCode() {

        long sequence = sequenceGeneratorService.getNextSequence(
                SequenceConstants.ALERT_SEQUENCE
        );

        return businessCodeGenerator.generate(
                ALERT_PREFIX,
                sequence
        );
    }


    /**
     * ----------------------------------------------------------
     * Build Alert Entity
     * ----------------------------------------------------------
     *
     * Creates and populates an Alert entity using
     * request data and Collision Risk information.
     *
     * @param request Create Alert Request
     * @param collisionRisk Active Collision Risk
     * @param alertCode Generated Alert Code
     * @return Alert Entity
     */
    private Alert buildAlert(
            CreateAlertRequest request,
            CollisionRisk collisionRisk,
            String alertCode
    ) {

        LocalDateTime now = LocalDateTime.now();

        String title =
                (request.getTitle() != null
                        && !request.getTitle().isBlank())
                        ? request.getTitle()
                        : alertMessageGenerator.generateTitle(
                        collisionRisk.getRiskLevel()
                );

        String message =
                (request.getMessage() != null
                        && !request.getMessage().isBlank())
                        ? request.getMessage()
                        : alertMessageGenerator.generateMessage(
                        collisionRisk.getRiskLevel()
                );

        return Alert.builder()
                .alertCode(alertCode)
                .riskId(collisionRisk.getId())
                .satelliteId(collisionRisk.getSatelliteId())
                .debrisId(collisionRisk.getDebrisId())
                .title(title)
                .message(message)
                .severity(
                        alertPriorityCalculator.calculateSeverity(
                                collisionRisk.getRiskLevel()
                        )
                )
                .status(AlertStatus.PENDING)
                .source(AlertSource.SYSTEM)
                .type(AlertType.COLLISION)
                .generatedAt(now)
                .acknowledgedAt(null)
                .resolvedAt(null)
                .remarks(null)
                .isActive(true)
                .createdAt(now)
                .updatedAt(now)
                .build();
    }

    /**
     * ----------------------------------------------------------
     * Save Alert
     * ----------------------------------------------------------
     *
     * Persists the Alert entity into MongoDB.
     *
     * @param alert Alert Entity
     * @return Saved Alert Entity
     */
    private Alert saveAlert(Alert alert) {

        if (alert == null) {
            throw new BadRequestException(
                    "Alert cannot be null."
            );
        }

        return alertRepository.save(alert);
    }

    /**
     * ----------------------------------------------------------
     * Get Active Alert
     * ----------------------------------------------------------
     *
     * Retrieves an active Alert by its ID.
     *
     * @param alertId Alert ID
     * @return Active Alert
     * @throws ResourceNotFoundException if Alert is not found
     */
    private Alert getActiveAlert(
            String alertId
    ) {

        Alert alert = alertRepository
                .findByIdAndIsActiveTrue(alertId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Alert not found with ID: " + alertId
                        )
                );

        return alert;
    }


    /**
     * ----------------------------------------------------------
     * Get Alert By ID
     * ----------------------------------------------------------
     *
     * Retrieves an active Alert using its unique ID.
     *
     * @param id Alert ID
     * @return Alert Details
     */
    @Override
    public ApiResponse<AlertResponse> getAlertById(
            String id
    ) {

        Alert alert = getActiveAlert(id);

        AlertResponse response = alertMapper.toResponse(alert);

        return ResponseBuilder.success(
                "Alert retrieved successfully.",
                response
        );
    }


    /**
     * ----------------------------------------------------------
     * Get All Alerts
     * ----------------------------------------------------------
     *
     * Retrieves Alerts using dynamic filters,
     * pagination and sorting.
     *
     * @param request Search Request
     * @param pageable Pagination Information
     * @return Paged Alert Response
     */
    @Override
    public ApiResponse<PagedResponse<AlertResponse>> getAllAlerts(
            AlertSearchRequest request,
            Pageable pageable
    ) {

        Query query = alertQueryBuilder.buildQuery(request);

        long totalElements = mongoTemplate.count(
                query,
                Alert.class
        );

        query.with(pageable);

        List<Alert> alerts = mongoTemplate.find(
                query,
                Alert.class
        );

        PagedResponse<AlertResponse> response =
                buildPagedResponse(
                        alerts,
                        pageable,
                        totalElements
                );

        return ResponseBuilder.success(
                "Alerts retrieved successfully.",
                response
        );
    }

    /**
     * ----------------------------------------------------------
     * Build Paged Response
     * ----------------------------------------------------------
     *
     * Converts Alert entities into AlertResponse DTOs
     * and prepares a paginated response.
     *
     * @param alerts Alert Entity List
     * @param pageable Pageable Information
     * @param totalElements Total Records
     * @return Paged Alert Response
     */
    private PagedResponse<AlertResponse> buildPagedResponse(
            List<Alert> alerts,
            Pageable pageable,
            long totalElements
    ) {

        List<AlertResponse> responses = alerts.stream()
                .map(alertMapper::toResponse)
                .toList();

        int totalPages = (int) Math.ceil(
                (double) totalElements / pageable.getPageSize()
        );

        return PagedResponse.<AlertResponse>builder()
                .content(responses)
                .page(pageable.getPageNumber())
                .size(pageable.getPageSize())
                .totalElements(totalElements)
                .totalPages(totalPages)
                .last(totalPages == 0 || pageable.getPageNumber() == totalPages - 1)
                .build();
    }

    /**
     * ----------------------------------------------------------
     * Update Alert Status
     * ----------------------------------------------------------
     *
     * Updates the workflow status of an existing Alert.
     *
     * @param id Alert ID
     * @param request Update Alert Status Request
     * @return Updated Alert Response
     */
    @Override
    public ApiResponse<AlertResponse> updateAlertStatus(
            String id,
            UpdateAlertStatusRequest request
    ) {

        Alert alert = getActiveAlert(id);

        validateStatusTransition(
                alert.getStatus(),
                request.getStatus()
        );

        alert.setStatus(request.getStatus());

        alert.setRemarks(request.getRemarks());

        updateAuditFields(alert);

        if (request.getStatus() == AlertStatus.ACKNOWLEDGED) {
            alert.setAcknowledgedAt(LocalDateTime.now());
        }

        if (request.getStatus() == AlertStatus.RESOLVED) {
            alert.setResolvedAt(LocalDateTime.now());
        }

        Alert updatedAlert =
                alertRepository.save(alert);

        AlertResponse response =
                alertMapper.toResponse(updatedAlert);

        return ResponseBuilder.success(
                "Alert status updated successfully.",
                response
        );
    }

    /**
     * ----------------------------------------------------------
     * Validate Status Transition
     * ----------------------------------------------------------
     *
     * Validates whether an Alert can move
     * from the current status to the new status.
     *
     * Allowed Workflow:
     *
     * PENDING
     *      ↓
     * ACKNOWLEDGED
     *      ↓
     * RESOLVED
     *      ↓
     * CLOSED
     *
     * @param currentStatus Current Alert Status
     * @param newStatus New Alert Status
     */
    private void validateStatusTransition(
            AlertStatus currentStatus,
            AlertStatus newStatus
    ) {

        if (currentStatus == null || newStatus == null) {
            throw new BadRequestException(
                    "Alert status cannot be null."
            );
        }

        if (currentStatus == newStatus) {
            throw new BadRequestException(
                    "Alert is already in " + currentStatus + " status."
            );
        }

        switch (currentStatus) {

            case PENDING -> {

                if (newStatus != AlertStatus.ACKNOWLEDGED) {
                    throw new BadRequestException(
                            "A PENDING alert can only be moved to ACKNOWLEDGED."
                    );
                }
            }

            case ACKNOWLEDGED -> {

                if (newStatus != AlertStatus.RESOLVED) {
                    throw new BadRequestException(
                            "An ACKNOWLEDGED alert can only be moved to RESOLVED."
                    );
                }
            }

            case RESOLVED -> {

                if (newStatus != AlertStatus.CLOSED) {
                    throw new BadRequestException(
                            "A RESOLVED alert can only be moved to CLOSED."
                    );
                }
            }

            case CLOSED ->

                    throw new BadRequestException(
                            "A CLOSED alert cannot be updated."
                    );
        }

    }

    /**
     * ----------------------------------------------------------
     * Update Audit Fields
     * ----------------------------------------------------------
     *
     * Updates audit information before
     * persisting the Alert entity.
     *
     * Current Audit Fields:
     * • updatedAt
     *
     * Future:
     * • updatedBy
     * • modifiedBy
     * • audit logs
     *
     * @param alert Alert Entity
     */
    private void updateAuditFields(
            Alert alert
    ) {

        if (alert == null) {
            throw new BadRequestException(
                    "Alert cannot be null."
            );
        }

        alert.setUpdatedAt(
                LocalDateTime.now()
        );

    }


    /**
     * ----------------------------------------------------------
     * Delete Alert (Soft Delete)
     * ----------------------------------------------------------
     *
     * Marks an Alert as inactive instead of
     * permanently deleting it.
     *
     * Business Rules:
     * • Only active Alerts can be deleted.
     * • Alert history is preserved.
     *
     * @param id Alert ID
     * @return Success Response
     */
    @Override
    public ApiResponse<Void> deleteAlert(
            String id
    ) {

        Alert alert = getActiveAlert(id);

        alert.setIsActive(false);

        updateAuditFields(alert);

        alertRepository.save(alert);

        return ResponseBuilder.success(
                "Alert deleted successfully."
        );
    }

}