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
import com.orbitguard.auth.security.CustomUserDetails;
import com.orbitguard.common.exception.BadRequestException;
import com.orbitguard.common.exception.ResourceNotFoundException;
import com.orbitguard.common.response.ApiResponse;
import com.orbitguard.common.response.PagedResponse;
import com.orbitguard.common.sequence.SequenceConstants;
import com.orbitguard.common.sequence.SequenceGeneratorService;
import com.orbitguard.common.util.BusinessCodeGenerator;
import com.orbitguard.common.util.ResponseBuilder;
import com.orbitguard.notification.dto.request.CreateNotificationRequest;
import com.orbitguard.notification.enums.NotificationPriority;
import com.orbitguard.notification.enums.NotificationType;
import com.orbitguard.notification.service.NotificationService;
import com.orbitguard.risk.entity.CollisionRisk;
import com.orbitguard.risk.repository.CollisionRiskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Alert Service Implementation.
 *
 * Responsibilities:
 * - Create and retrieve alerts.
 * - Search alerts using filters and pagination.
 * - Update alert status.
 * - Soft-delete alerts.
 * - Create a notification when an alert is created.
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

    /*
     * Existing notification module.
     */
    private final NotificationService notificationService;

    private static final String ALERT_PREFIX = "ALT";

    /**
     * Creates an alert and then creates its notification.
     *
     * The notification references the persisted alert and collision risk.
     * The authenticated user is used as the recipient.
     */
    @Override
    public ApiResponse<AlertResponse> createAlert(
            CreateAlertRequest request
    ) {
        validateCreateRequest(request);

        CollisionRisk collisionRisk =
                getActiveRisk(request.getRiskId());

        String alertCode = generateAlertCode();

        Alert alert = buildAlert(
                request,
                collisionRisk,
                alertCode
        );

        Alert savedAlert = saveAlert(alert);

        /*
         * Create the notification only after the alert has been saved,
         * so the notification can reference the persisted alert ID.
         */
        createAlertNotification(savedAlert);

        AlertResponse response =
                alertMapper.toResponse(savedAlert);

        return ResponseBuilder.success(
                "Alert created successfully.",
                response
        );
    }

    /**
     * Creates a notification for a persisted alert.
     */
    private void createAlertNotification(Alert alert) {

        if (alert == null || alert.getId() == null
                || alert.getId().isBlank()) {
            throw new BadRequestException(
                    "A persisted alert is required to create a notification."
            );
        }

        String recipientId = getAuthenticatedUserId();

        NotificationPriority notificationPriority =
                mapNotificationPriority(alert);

        CreateNotificationRequest notificationRequest =
                new CreateNotificationRequest();

        notificationRequest.setTitle(alert.getTitle());
        notificationRequest.setMessage(alert.getMessage());
        notificationRequest.setType(NotificationType.ALERT);
        notificationRequest.setPriority(notificationPriority);
        notificationRequest.setRecipientId(recipientId);
        notificationRequest.setAlertId(alert.getId());
        notificationRequest.setCollisionRiskId(alert.getRiskId());

        notificationService.createNotification(notificationRequest);
    }

    /**
     * Resolves the recipient from the authenticated Spring Security
     * principal. No user ID is hardcoded.
     */
    private String getAuthenticatedUserId() {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null
                || !authentication.isAuthenticated()
                || !(authentication.getPrincipal()
                instanceof CustomUserDetails userDetails)) {
            throw new BadRequestException(
                    "Cannot create an alert notification without an authenticated user."
            );
        }

        String userId = userDetails.getUserId();

        if (userId == null || userId.isBlank()) {
            throw new BadRequestException(
                    "The authenticated user does not have a valid user ID."
            );
        }

        return userId;
    }

    /**
     * Maps alert severity to notification priority.
     *
     * The enum names must match between AlertSeverity and
     * NotificationPriority: LOW, MEDIUM, HIGH, CRITICAL.
     */
    private NotificationPriority mapNotificationPriority(Alert alert) {

        if (alert.getSeverity() == null) {
            throw new BadRequestException(
                    "Alert severity is required to determine notification priority."
            );
        }

        try {
            return NotificationPriority.valueOf(
                    alert.getSeverity().name()
            );
        } catch (IllegalArgumentException exception) {
            throw new BadRequestException(
                    "Unsupported alert severity for notification priority: "
                            + alert.getSeverity()
            );
        }
    }

    private void validateCreateRequest(CreateAlertRequest request) {

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

    private CollisionRisk getActiveRisk(String riskId) {

        return collisionRiskRepository
                .findByIdAndIsActiveTrue(riskId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Collision Risk not found with ID: " + riskId
                        )
                );
    }

    private String generateAlertCode() {

        long sequence = sequenceGeneratorService.getNextSequence(
                SequenceConstants.ALERT_SEQUENCE
        );

        return businessCodeGenerator.generate(
                ALERT_PREFIX,
                sequence
        );
    }

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

    private Alert saveAlert(Alert alert) {

        if (alert == null) {
            throw new BadRequestException(
                    "Alert cannot be null."
            );
        }

        return alertRepository.save(alert);
    }

    private Alert getActiveAlert(String alertId) {

        validateAlertId(alertId);

        return alertRepository
                .findByIdAndIsActiveTrue(alertId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Alert not found with ID: " + alertId
                        )
                );
    }

    private void validateAlertId(String alertId) {

        if (alertId == null || alertId.isBlank()) {
            throw new BadRequestException(
                    "Alert ID is required."
            );
        }
    }

    @Override
    public ApiResponse<AlertResponse> getAlertById(String id) {

        Alert alert = getActiveAlert(id);

        AlertResponse response =
                alertMapper.toResponse(alert);

        return ResponseBuilder.success(
                "Alert retrieved successfully.",
                response
        );
    }

    @Override
    public ApiResponse<PagedResponse<AlertResponse>> getAllAlerts(
            AlertSearchRequest request,
            Pageable pageable
    ) {

        Query query = alertQueryBuilder.buildQuery(request);

        long totalElements =
                mongoTemplate.count(query, Alert.class);

        query.with(pageable);

        List<Alert> alerts =
                mongoTemplate.find(query, Alert.class);

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

    private PagedResponse<AlertResponse> buildPagedResponse(
            List<Alert> alerts,
            Pageable pageable,
            long totalElements
    ) {

        List<AlertResponse> responses =
                alerts.stream()
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
                .last(
                        totalPages == 0
                                || pageable.getPageNumber()
                                == totalPages - 1
                )
                .build();
    }

    @Override
    public ApiResponse<AlertResponse> updateAlertStatus(
            String id,
            UpdateAlertStatusRequest request
    ) {

        validateUpdateStatusRequest(request);

        Alert alert = getActiveAlert(id);

        validateStatusTransition(
                alert.getStatus(),
                request.getStatus()
        );

        LocalDateTime now = LocalDateTime.now();

        alert.setStatus(request.getStatus());
        alert.setRemarks(request.getRemarks());
        alert.setUpdatedAt(now);

        if (request.getStatus() == AlertStatus.ACKNOWLEDGED) {
            alert.setAcknowledgedAt(now);
        }

        if (request.getStatus() == AlertStatus.RESOLVED) {
            alert.setResolvedAt(now);
        }

        Alert updatedAlert = alertRepository.save(alert);

        AlertResponse response =
                alertMapper.toResponse(updatedAlert);

        return ResponseBuilder.success(
                "Alert status updated successfully.",
                response
        );
    }

    private void validateUpdateStatusRequest(
            UpdateAlertStatusRequest request
    ) {

        if (request == null) {
            throw new BadRequestException(
                    "Update Alert Status Request cannot be null."
            );
        }

        if (request.getStatus() == null) {
            throw new BadRequestException(
                    "Alert status cannot be null."
            );
        }
    }

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

    @Override
    public ApiResponse<Void> deleteAlert(String id) {

        Alert alert = getActiveAlert(id);

        alert.setIsActive(false);
        alert.setUpdatedAt(LocalDateTime.now());

        alertRepository.save(alert);

        return ResponseBuilder.success(
                "Alert deleted successfully."
        );
    }
}
