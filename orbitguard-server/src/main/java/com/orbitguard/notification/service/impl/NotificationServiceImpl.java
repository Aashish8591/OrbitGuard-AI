package com.orbitguard.notification.service.impl;

import com.orbitguard.alert.repository.AlertRepository;
import com.orbitguard.common.exception.BadRequestException;
import com.orbitguard.common.exception.DuplicateResourceException;
import com.orbitguard.common.exception.ResourceNotFoundException;
import com.orbitguard.common.response.ApiResponse;
import com.orbitguard.common.response.PagedResponse;
import com.orbitguard.common.sequence.SequenceGeneratorService;
import com.orbitguard.common.util.BusinessCodeGenerator;
import com.orbitguard.common.util.ResponseBuilder;
import com.orbitguard.notification.constants.NotificationConstants;
import com.orbitguard.notification.dto.request.CreateNotificationRequest;
import com.orbitguard.notification.dto.request.MarkNotificationReadRequest;
import com.orbitguard.notification.dto.request.NotificationFilterRequest;
import com.orbitguard.notification.dto.request.NotificationSearchRequest;
import com.orbitguard.notification.dto.request.UpdateNotificationRequest;
import com.orbitguard.notification.dto.response.NotificationResponse;
import com.orbitguard.notification.entity.Notification;
import com.orbitguard.notification.enums.NotificationAction;
import com.orbitguard.notification.enums.NotificationStatus;
import com.orbitguard.notification.mapper.NotificationMapper;
import com.orbitguard.notification.repository.NotificationRepository;
import com.orbitguard.notification.service.NotificationService;
import com.orbitguard.notification.specification.NotificationQueryBuilder;
import com.orbitguard.notification.validator.NotificationValidator;
import com.orbitguard.risk.repository.CollisionRiskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

/**
 * ===============================================================
 * Notification Service Implementation
 * ===============================================================
 *
 * Implements business operations for the Notification module.
 *
 * Responsibilities:
 * <ul>
 *     <li>Create notifications</li>
 *     <li>Retrieve notifications</li>
 *     <li>Update notifications</li>
 *     <li>Soft delete notifications</li>
 *     <li>Search and filter notifications</li>
 *     <li>Manage read/unread status</li>
 *     <li>Generate notification business codes</li>
 * </ul>
 *
 * Business logic belongs in this class.
 * HTTP-specific concerns remain in the Controller.
 *
 * Module : Notification Management
 *
 * @author OrbitGuard AI Team
 * @version 1.0
 */
@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    /**
     * Repository responsible for standard Notification
     * persistence operations.
     */
    private final NotificationRepository notificationRepository;

    /**
     * Repository used to validate referenced active alerts.
     */
    private final AlertRepository alertRepository;

    /**
     * Repository used to validate referenced active collision risks.
     */
    private final CollisionRiskRepository collisionRiskRepository;

    /**
     * MongoTemplate used for dynamic search and filtering.
     */
    private final MongoTemplate mongoTemplate;

    /**
     * Builds dynamic MongoDB search queries.
     */
    private final NotificationQueryBuilder notificationQueryBuilder;

    /**
     * Converts between request DTOs, entities and response DTOs.
     */
    private final NotificationMapper notificationMapper;

    /**
     * Handles Notification-specific business validation.
     */
    private final NotificationValidator notificationValidator;

    /**
     * Generates atomic MongoDB sequence numbers.
     */
    private final SequenceGeneratorService sequenceGeneratorService;

    /**
     * Converts sequence numbers into business codes.
     */
    private final BusinessCodeGenerator businessCodeGenerator;

    /**
     * Creates a new notification.
     *
     * @param request create notification request
     * @return API response containing created notification
     */
    @Override
    public ApiResponse<NotificationResponse> createNotification(
            CreateNotificationRequest request) {

        notificationValidator.validateCreateRequest(request);

        validateNotificationReferences(request);

        try {
            Notification notification =
                    notificationMapper.toEntity(request);

            long sequence =
                    sequenceGeneratorService.getNextSequence(
                            NotificationConstants.NOTIFICATION_SEQUENCE_NAME
                    );

            String notificationCode =
                    businessCodeGenerator.generate(
                            NotificationConstants.NOTIFICATION_CODE_PREFIX,
                            sequence
                    );

            LocalDateTime now = LocalDateTime.now();

            notification.setNotificationCode(notificationCode);
            notification.setStatus(NotificationStatus.UNREAD);
            notification.setReadAt(null);
            notification.setIsActive(true);
            notification.setCreatedAt(now);
            notification.setUpdatedAt(now);

            Notification savedNotification =
                    notificationRepository.save(notification);

            NotificationResponse response =
                    notificationMapper.toResponse(savedNotification);

            return ResponseBuilder.success(
                    NotificationConstants.NOTIFICATION_CREATED,
                    response
            );

        } catch (DuplicateKeyException ex) {

            throw new DuplicateResourceException(
                    "Notification could not be created because "
                            + "the generated notification code already exists."
            );
        }
    }

    /**
     * Retrieves an active notification by MongoDB ID.
     *
     * @param id notification identifier
     * @return API response containing notification
     */
    @Override
    public ApiResponse<NotificationResponse> getNotificationById(
            String id) {

        validateIdentifier(id, "Notification ID");

        Notification notification =
                notificationRepository
                        .findByIdAndIsActiveTrue(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        NotificationConstants.NOTIFICATION_NOT_FOUND
                                )
                        );

        NotificationResponse response =
                notificationMapper.toResponse(notification);

        return ResponseBuilder.success(
                NotificationConstants.NOTIFICATION_FETCHED,
                response
        );
    }

    /**
     * Retrieves an active notification by business code.
     *
     * @param notificationCode notification business code
     * @return API response containing notification
     */
    @Override
    public ApiResponse<NotificationResponse> getNotificationByCode(
            String notificationCode) {

        validateIdentifier(
                notificationCode,
                "Notification code"
        );

        Notification notification =
                notificationRepository
                        .findByNotificationCodeAndIsActiveTrue(
                                notificationCode
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        NotificationConstants.NOTIFICATION_NOT_FOUND
                                )
                        );

        NotificationResponse response =
                notificationMapper.toResponse(notification);

        return ResponseBuilder.success(
                NotificationConstants.NOTIFICATION_FETCHED,
                response
        );
    }

    /**
     * Updates an existing active notification.
     *
     * @param id notification identifier
     * @param request update notification request
     * @return API response containing updated notification
     */
    @Override
    public ApiResponse<NotificationResponse> updateNotification(
            String id,
            UpdateNotificationRequest request) {

        validateIdentifier(id, "Notification ID");

        notificationValidator.validateUpdateRequest(request);

        Notification notification =
                notificationRepository
                        .findByIdAndIsActiveTrue(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        NotificationConstants.NOTIFICATION_NOT_FOUND
                                )
                        );

        notificationMapper.updateEntity(
                notification,
                request
        );

        notification.setUpdatedAt(LocalDateTime.now());

        Notification updatedNotification =
                notificationRepository.save(notification);

        NotificationResponse response =
                notificationMapper.toResponse(updatedNotification);

        return ResponseBuilder.success(
                NotificationConstants.NOTIFICATION_UPDATED,
                response
        );
    }

    /**
     * Soft deletes an active notification.
     *
     * @param id notification identifier
     * @return API response indicating successful deletion
     */
    @Override
    public ApiResponse<Void> deleteNotification(String id) {

        validateIdentifier(id, "Notification ID");

        Notification notification =
                notificationRepository
                        .findByIdAndIsActiveTrue(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        NotificationConstants.NOTIFICATION_NOT_FOUND
                                )
                        );

        notification.setIsActive(false);
        notification.setUpdatedAt(LocalDateTime.now());

        notificationRepository.save(notification);

        return ResponseBuilder.success(
                NotificationConstants.NOTIFICATION_DELETED
        );
    }

    /**
     * Searches and filters notifications using dynamic
     * MongoDB criteria with pagination and sorting.
     *
     * @param searchRequest search parameters
     * @param filterRequest filter parameters
     * @param pageable pagination and sorting configuration
     * @return paginated notification response
     */
    @Override
    public ApiResponse<PagedResponse<NotificationResponse>>
    searchNotifications(
            NotificationSearchRequest searchRequest,
            NotificationFilterRequest filterRequest,
            Pageable pageable) {

        notificationValidator.validateSearchRequest(
                searchRequest
        );

        Query query =
                notificationQueryBuilder.buildQuery(
                        searchRequest,
                        filterRequest
                );

        long totalElements =
                mongoTemplate.count(
                        query,
                        Notification.class
                );

        query.with(pageable);

        List<Notification> notifications =
                mongoTemplate.find(
                        query,
                        Notification.class
                );

        List<NotificationResponse> responses =
                notifications.stream()
                        .map(notificationMapper::toResponse)
                        .toList();

        Page<NotificationResponse> page =
                new PageImpl<>(
                        responses,
                        pageable,
                        totalElements
                );

        PagedResponse<NotificationResponse> pagedResponse =
                PagedResponse.from(page);

        return ResponseBuilder.success(
                NotificationConstants.NOTIFICATIONS_FETCHED,
                pagedResponse
        );
    }

    /**
     * Updates the read/unread state of a notification.
     *
     * READ:
     * - Status becomes READ.
     * - readAt is populated.
     *
     * UNREAD:
     * - Status becomes UNREAD.
     * - readAt is cleared.
     *
     * @param id notification identifier
     * @param request read/unread action request
     * @return updated notification response
     */
    @Override
    public ApiResponse<NotificationResponse>
    updateNotificationReadStatus(
            String id,
            MarkNotificationReadRequest request) {

        validateIdentifier(id, "Notification ID");

        notificationValidator.validateNotificationAction(
                request
        );

        Notification notification =
                notificationRepository
                        .findByIdAndIsActiveTrue(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        NotificationConstants.NOTIFICATION_NOT_FOUND
                                )
                        );

        LocalDateTime now = LocalDateTime.now();

        if (request.getAction() == NotificationAction.READ) {

            notification.setStatus(
                    NotificationStatus.READ
            );

            notification.setReadAt(now);

        } else if (
                request.getAction() == NotificationAction.UNREAD) {

            notification.setStatus(
                    NotificationStatus.UNREAD
            );

            notification.setReadAt(null);

        } else {

            throw new BadRequestException(
                    "Unsupported notification action."
            );
        }

        notification.setUpdatedAt(now);

        Notification updatedNotification =
                notificationRepository.save(notification);

        NotificationResponse response =
                notificationMapper.toResponse(
                        updatedNotification
                );

        String message =
                request.getAction() == NotificationAction.READ
                        ? NotificationConstants.NOTIFICATION_MARKED_AS_READ
                        : NotificationConstants.NOTIFICATION_UPDATED;

        return ResponseBuilder.success(
                message,
                response
        );
    }

    /**
     * Returns the number of unread active notifications
     * belonging to a recipient.
     *
     * @param recipientId recipient identifier
     * @return API response containing unread count
     */
    @Override
    public ApiResponse<Long> getUnreadNotificationCount(
            String recipientId) {

        validateIdentifier(
                recipientId,
                "Recipient ID"
        );

        long count =
                notificationRepository
                        .countByRecipientIdAndStatusAndIsActiveTrue(
                                recipientId,
                                NotificationStatus.UNREAD
                        );

        return ResponseBuilder.success(
                "Unread notification count retrieved successfully.",
                count
        );
    }

    /**
     * Validates referenced Alert and Collision Risk entities.
     *
     * Only active referenced entities are accepted.
     *
     * @param request create notification request
     * @throws ResourceNotFoundException when a referenced entity
     *         does not exist or is inactive
     */
    private void validateNotificationReferences(
            CreateNotificationRequest request) {

        if (request.getType() == null) {
            return;
        }

        if (request.getType().name().equals("ALERT")) {

            alertRepository
                    .findByIdAndIsActiveTrue(request.getAlertId())
                    .orElseThrow(() ->
                            new ResourceNotFoundException(
                                    "Referenced alert not found or is inactive."
                            )
                    );
        }

        if (request.getType().name().equals("COLLISION")) {

            collisionRiskRepository
                    .findByIdAndIsActiveTrue(
                            request.getCollisionRiskId()
                    )
                    .orElseThrow(() ->
                            new ResourceNotFoundException(
                                    "Referenced collision risk not found or is inactive."
                            )
                    );
        }
    }

    /**
     * Validates an identifier used by the Notification module.
     *
     * @param value identifier value
     * @param fieldName identifier field name
     */
    private void validateIdentifier(
            String value,
            String fieldName) {

        if (value == null || value.isBlank()) {

            throw new BadRequestException(
                    fieldName + " is required."
            );
        }
    }

}