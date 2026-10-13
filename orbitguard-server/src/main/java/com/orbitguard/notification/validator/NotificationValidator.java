package com.orbitguard.notification.validator;

import com.orbitguard.common.exception.BadRequestException;
import com.orbitguard.notification.dto.request.CreateNotificationRequest;
import com.orbitguard.notification.dto.request.MarkNotificationReadRequest;
import com.orbitguard.notification.dto.request.NotificationSearchRequest;
import com.orbitguard.notification.dto.request.UpdateNotificationRequest;
import com.orbitguard.notification.enums.NotificationAction;
import com.orbitguard.notification.enums.NotificationType;
import org.springframework.stereotype.Component;

@Component
public class NotificationValidator {

    private static final String SORT_FIELD_ID = "id";
    private static final String SORT_FIELD_NOTIFICATION_CODE =
            "notificationCode";
    private static final String SORT_FIELD_TITLE = "title";
    private static final String SORT_FIELD_PRIORITY = "priority";
    private static final String SORT_FIELD_STATUS = "status";
    private static final String SORT_FIELD_TYPE = "type";
    private static final String SORT_FIELD_CREATED_AT = "createdAt";

    /**
     * Validates a notification creation request, including required
     * business fields and type-specific references.
     */
    public void validateCreateRequest(
            CreateNotificationRequest request
    ) {

        if (request == null) {
            throw new BadRequestException(
                    "Create notification request cannot be null."
            );
        }

        validateRequiredText(
                request.getTitle(),
                "Notification title",
                5,
                150
        );

        validateRequiredText(
                request.getMessage(),
                "Notification message",
                10,
                1000
        );

        if (request.getType() == null) {
            throw new BadRequestException(
                    "Notification type is required."
            );
        }

        if (request.getPriority() == null) {
            throw new BadRequestException(
                    "Notification priority is required."
            );
        }

        validateRequiredText(
                request.getRecipientId(),
                "Recipient ID",
                1,
                Integer.MAX_VALUE
        );

        validateNotificationReferences(
                request.getType(),
                request.getAlertId(),
                request.getCollisionRiskId()
        );
    }

    /**
     * Validates notification update requests.
     */
    public void validateUpdateRequest(
            UpdateNotificationRequest request
    ) {

        if (request == null) {
            throw new BadRequestException(
                    "Update notification request cannot be null."
            );
        }
    }

    /**
     * Validates notification search parameters.
     */
    public void validateSearchRequest(
            NotificationSearchRequest request
    ) {

        if (request == null) {
            throw new BadRequestException(
                    "Notification search request cannot be null."
            );
        }

        validateSortField(request.getSortBy());
        validateSortDirection(request.getDirection());
    }

    /**
     * Validates read/unread actions.
     */
    public void validateNotificationAction(
            MarkNotificationReadRequest request
    ) {

        if (request == null) {
            throw new BadRequestException(
                    "Notification action request cannot be null."
            );
        }

        if (request.getAction() == null) {
            throw new BadRequestException(
                    "Notification action is required."
            );
        }

        if (request.getAction() != NotificationAction.READ
                && request.getAction() != NotificationAction.UNREAD) {

            throw new BadRequestException(
                    "Unsupported notification action."
            );
        }
    }

    /**
     * Validates type-specific notification reference requirements.
     *
     * Existence and active-status checks remain in
     * NotificationServiceImpl.
     */
    private void validateNotificationReferences(
            NotificationType type,
            String alertId,
            String collisionRiskId
    ) {

        if (type == NotificationType.ALERT) {

            validateRequiredText(
                    alertId,
                    "Alert ID",
                    1,
                    Integer.MAX_VALUE
            );
        }

        if (type == NotificationType.COLLISION) {

            validateRequiredText(
                    collisionRiskId,
                    "Collision Risk ID",
                    1,
                    Integer.MAX_VALUE
            );
        }
    }

    /**
     * Validates required text and its permitted length.
     */
    private void validateRequiredText(
            String value,
            String fieldName,
            int minLength,
            int maxLength
    ) {

        if (isBlank(value)) {
            throw new BadRequestException(
                    fieldName + " is required."
            );
        }

        String normalizedValue = value.trim();

        if (normalizedValue.length() < minLength
                || normalizedValue.length() > maxLength) {

            throw new BadRequestException(
                    fieldName + " must be between "
                            + minLength + " and "
                            + maxLength + " characters."
            );
        }
    }

    /**
     * Validates supported notification sort fields.
     */
    private void validateSortField(String sortBy) {

        if (isBlank(sortBy)) {
            throw new BadRequestException(
                    "Sort field is required."
            );
        }

        boolean valid =
                SORT_FIELD_ID.equals(sortBy)
                        || SORT_FIELD_NOTIFICATION_CODE.equals(sortBy)
                        || SORT_FIELD_TITLE.equals(sortBy)
                        || SORT_FIELD_PRIORITY.equals(sortBy)
                        || SORT_FIELD_STATUS.equals(sortBy)
                        || SORT_FIELD_TYPE.equals(sortBy)
                        || SORT_FIELD_CREATED_AT.equals(sortBy);

        if (!valid) {
            throw new BadRequestException(
                    "Unsupported notification sort field: " + sortBy
            );
        }
    }

    /**
     * Validates the requested sort direction.
     */
    private void validateSortDirection(String direction) {

        if (isBlank(direction)) {
            throw new BadRequestException(
                    "Sort direction is required."
            );
        }

        if (!"asc".equalsIgnoreCase(direction)
                && !"desc".equalsIgnoreCase(direction)) {

            throw new BadRequestException(
                    "Sort direction must be either 'asc' or 'desc'."
            );
        }
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
