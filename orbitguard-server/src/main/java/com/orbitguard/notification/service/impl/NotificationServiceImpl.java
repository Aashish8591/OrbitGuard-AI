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
import com.orbitguard.notification.enums.NotificationType;
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
 * Notification Service Implementation.
 *
 * Responsibilities:
 * - Create and retrieve notifications.
 * - Update notifications.
 * - Soft-delete notifications.
 * - Search and filter notifications.
 * - Manage read/unread status.
 * - Generate notification business codes.
 */
@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final AlertRepository alertRepository;
    private final CollisionRiskRepository collisionRiskRepository;
    private final MongoTemplate mongoTemplate;
    private final NotificationQueryBuilder notificationQueryBuilder;
    private final NotificationMapper notificationMapper;
    private final NotificationValidator notificationValidator;
    private final SequenceGeneratorService sequenceGeneratorService;
    private final BusinessCodeGenerator businessCodeGenerator;

    /**
     * Creates a new notification.
     *
     * @param request create notification request
     * @return API response containing the created notification
     */
    @Override
    public ApiResponse<NotificationResponse> createNotification(
            CreateNotificationRequest request
    ) {

        notificationValidator.validateCreateRequest(request);

        validateNotificationReferences(request);

        try {
            Notification notification =
                    notificationMapper.toEntity(request);

            if (notification == null) {
                throw new BadRequestException(
                        "Notification mapper returned an empty notification."
                );
            }

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

        } catch (DuplicateKeyException exception) {
            throw new DuplicateResourceException(
                    "Notification could not be created because "
                            + "the generated notification code already exists."
            );
        }
    }

    /**
     * Retrieves an active notification by MongoDB ID.
     */
    @Override
    public ApiResponse<NotificationResponse> getNotificationById(
            String id
    ) {

        validateIdentifier(id, "Notification ID");

        Notification notification =
                notificationRepository
                        .findByIdAndIsActiveTrue(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        NotificationConstants.NOTIFICATION_NOT_FOUND
                                )
                        );

        return ResponseBuilder.success(
                NotificationConstants.NOTIFICATION_FETCHED,
                notificationMapper.toResponse(notification)
        );
    }

    /**
     * Retrieves an active notification by business code.
     */
    @Override
    public ApiResponse<NotificationResponse> getNotificationByCode(
            String notificationCode
    ) {

        validateIdentifier(notificationCode, "Notification code");

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

        return ResponseBuilder.success(
                NotificationConstants.NOTIFICATION_FETCHED,
                notificationMapper.toResponse(notification)
        );
    }

    /**
     * Updates an existing active notification.
     */
    @Override
    public ApiResponse<NotificationResponse> updateNotification(
            String id,
            UpdateNotificationRequest request
    ) {

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

        notificationMapper.updateEntity(notification, request);

        notification.setUpdatedAt(LocalDateTime.now());

        Notification updatedNotification =
                notificationRepository.save(notification);

        return ResponseBuilder.success(
                NotificationConstants.NOTIFICATION_UPDATED,
                notificationMapper.toResponse(updatedNotification)
        );
    }

    /**
     * Soft-deletes an active notification.
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
     * Searches notifications using dynamic filters,
     * pagination and sorting.
     */
    @Override
    public ApiResponse<PagedResponse<NotificationResponse>>
    searchNotifications(
            NotificationSearchRequest searchRequest,
            NotificationFilterRequest filterRequest,
            Pageable pageable
    ) {

        notificationValidator.validateSearchRequest(searchRequest);

        Query query =
                notificationQueryBuilder.buildQuery(
                        searchRequest,
                        filterRequest
                );

        long totalElements =
                mongoTemplate.count(query, Notification.class);

        query.with(pageable);

        List<Notification> notifications =
                mongoTemplate.find(query, Notification.class);

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
     * Updates a notification's read/unread state.
     */
    @Override
    public ApiResponse<NotificationResponse>
    updateNotificationReadStatus(
            String id,
            MarkNotificationReadRequest request
    ) {

        validateIdentifier(id, "Notification ID");

        notificationValidator.validateNotificationAction(request);

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

            notification.setStatus(NotificationStatus.READ);
            notification.setReadAt(now);

        } else if (request.getAction() == NotificationAction.UNREAD) {

            notification.setStatus(NotificationStatus.UNREAD);
            notification.setReadAt(null);

        } else {
            throw new BadRequestException(
                    "Unsupported notification action."
            );
        }

        notification.setUpdatedAt(now);

        Notification updatedNotification =
                notificationRepository.save(notification);

        String message =
                request.getAction() == NotificationAction.READ
                        ? NotificationConstants.NOTIFICATION_MARKED_AS_READ
                        : NotificationConstants.NOTIFICATION_UPDATED;

        return ResponseBuilder.success(
                message,
                notificationMapper.toResponse(updatedNotification)
        );
    }

    /**
     * Returns the unread active notification count for a recipient.
     */
    @Override
    public ApiResponse<Long> getUnreadNotificationCount(
            String recipientId
    ) {

        validateIdentifier(recipientId, "Recipient ID");

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
     * Validates references required by the notification type.
     *
     * ALERT notifications must reference an active alert.
     * COLLISION notifications must reference an active collision risk.
     */
    private void validateNotificationReferences(
            CreateNotificationRequest request
    ) {

        if (request == null) {
            throw new BadRequestException(
                    "Create Notification Request cannot be null."
            );
        }

        NotificationType type = request.getType();

        if (type == null) {
            throw new BadRequestException(
                    "Notification type is required."
            );
        }

        if (type == NotificationType.ALERT) {

            validateIdentifier(
                    request.getAlertId(),
                    "Alert ID"
            );

            alertRepository
                    .findByIdAndIsActiveTrue(request.getAlertId())
                    .orElseThrow(() ->
                            new ResourceNotFoundException(
                                    "Referenced alert not found or is inactive."
                            )
                    );
        }

        if (type == NotificationType.COLLISION) {

            validateIdentifier(
                    request.getCollisionRiskId(),
                    "Collision Risk ID"
            );

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
     * Validates an identifier before database operations.
     */
    private void validateIdentifier(
            String value,
            String fieldName
    ) {

        if (value == null || value.isBlank()) {
            throw new BadRequestException(
                    fieldName + " is required."
            );
        }
    }
}
