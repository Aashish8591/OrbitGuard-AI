package com.orbitguard.notification.validator;

import com.orbitguard.common.exception.BadRequestException;
import com.orbitguard.notification.dto.request.CreateNotificationRequest;
import com.orbitguard.notification.dto.request.MarkNotificationReadRequest;
import com.orbitguard.notification.dto.request.NotificationSearchRequest;
import com.orbitguard.notification.dto.request.UpdateNotificationRequest;
import com.orbitguard.notification.enums.NotificationAction;
import com.orbitguard.notification.enums.NotificationType;
import org.springframework.stereotype.Component;

/**
 * ===============================================================
 * Notification Validator
 * ===============================================================
 *
 * Contains business-level validation rules specific to the
 * Notification module.
 *
 * Field-level validation such as @NotBlank, @NotNull and @Size
 * is handled by Jakarta Bean Validation on request DTOs.
 *
 * This validator is responsible only for rules that require
 * business-level validation.
 *
 * Module : Notification Management
 *
 * @author OrbitGuard AI Team
 * @version 1.0
 */
@Component
public class NotificationValidator {

    /**
     * Allowed notification fields for sorting.
     *
     * These values must correspond to actual Notification
     * entity properties.
     */
    private static final String SORT_FIELD_ID = "id";
    private static final String SORT_FIELD_NOTIFICATION_CODE = "notificationCode";
    private static final String SORT_FIELD_TITLE = "title";
    private static final String SORT_FIELD_PRIORITY = "priority";
    private static final String SORT_FIELD_STATUS = "status";
    private static final String SORT_FIELD_TYPE = "type";
    private static final String SORT_FIELD_CREATED_AT = "createdAt";

    /**
     * Validates notification creation request.
     *
     * @param request create notification request
     * @throws BadRequestException when business validation fails
     */
    public void validateCreateRequest(CreateNotificationRequest request) {

        if (request == null) {
            throw new BadRequestException(
                    "Create notification request cannot be null."
            );
        }

        validateNotificationReferences(request.getType(),
                request.getAlertId(),
                request.getCollisionRiskId());
    }

    /**
     * Validates notification update request.
     *
     * @param request update notification request
     * @throws BadRequestException when business validation fails
     */
    public void validateUpdateRequest(UpdateNotificationRequest request) {

        if (request == null) {
            throw new BadRequestException(
                    "Update notification request cannot be null."
            );
        }
    }

    /**
     * Validates notification search request.
     *
     * @param request search request
     * @throws BadRequestException when search parameters are invalid
     */
    public void validateSearchRequest(NotificationSearchRequest request) {

        if (request == null) {
            throw new BadRequestException(
                    "Notification search request cannot be null."
            );
        }

        validateSortField(request.getSortBy());
        validateSortDirection(request.getDirection());
    }

    /**
     * Validates notification read/unread action.
     *
     * @param request mark notification request
     * @throws BadRequestException when action is invalid
     */
    public void validateNotificationAction(
            MarkNotificationReadRequest request) {

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
     * Validates notification reference relationships.
     *
     * <p>
     * Notification references are validated at the notification
     * domain level only. Existence checks against Alert or Risk
     * collections are intentionally handled by the Service layer
     * to avoid coupling this validator with other repositories.
     * </p>
     *
     * @param type notification type
     * @param alertId related alert identifier
     * @param collisionRiskId related collision risk identifier
     * @throws BadRequestException when the reference combination
     *         is invalid
     */
    private void validateNotificationReferences(
            NotificationType type,
            String alertId,
            String collisionRiskId) {

        if (type == null) {
            return;
        }

        if (type == NotificationType.ALERT
                && isBlank(alertId)) {

            throw new BadRequestException(
                    "Alert ID is required for ALERT notifications."
            );
        }

        if (type == NotificationType.COLLISION
                && isBlank(collisionRiskId)) {

            throw new BadRequestException(
                    "Collision Risk ID is required for COLLISION notifications."
            );
        }
    }

    /**
     * Validates the requested sorting field.
     *
     * @param sortBy requested sorting field
     * @throws BadRequestException when field is not supported
     */
    private void validateSortField(String sortBy) {

        if (isBlank(sortBy)) {
            throw new BadRequestException(
                    "Sort field is required."
            );
        }

        boolean valid = SORT_FIELD_ID.equals(sortBy)
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
     * Validates requested sort direction.
     *
     * @param direction requested sort direction
     * @throws BadRequestException when direction is invalid
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

    /**
     * Checks whether a String is null, empty or whitespace.
     *
     * @param value value to check
     * @return true when blank
     */
    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

}