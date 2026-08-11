package com.orbitguard.notification.mapper;

import com.orbitguard.notification.dto.request.CreateNotificationRequest;
import com.orbitguard.notification.dto.request.UpdateNotificationRequest;
import com.orbitguard.notification.dto.response.NotificationResponse;
import com.orbitguard.notification.entity.Notification;
import org.springframework.stereotype.Component;

/**
 * ===============================================================
 * Notification Mapper
 * ===============================================================
 *
 * Responsible for converting Notification entities
 * to DTOs and vice versa.
 *
 * This class contains no business logic.
 *
 * Module : Notification Management
 *
 * @author OrbitGuard AI Team
 * @version 1.0
 */
@Component
public class NotificationMapper {

    /**
     * Converts CreateNotificationRequest into Notification entity.
     *
     * System-managed fields such as notificationCode,
     * status, timestamps and isActive are populated
     * by the Service layer.
     *
     * @param request create notification request
     * @return notification entity
     */
    public Notification toEntity(CreateNotificationRequest request) {

        if (request == null) {
            return null;
        }

        return Notification.builder()
                .title(request.getTitle())
                .message(request.getMessage())
                .type(request.getType())
                .priority(request.getPriority())
                .recipientId(request.getRecipientId())
                .alertId(request.getAlertId())
                .collisionRiskId(request.getCollisionRiskId())
                .build();
    }

    /**
     * Updates an existing Notification entity
     * using UpdateNotificationRequest.
     *
     * Only editable business fields are updated.
     *
     * @param notification existing notification
     * @param request update request
     */
    public void updateEntity(
            Notification notification,
            UpdateNotificationRequest request
    ) {

        if (notification == null || request == null) {
            return;
        }

        notification.setTitle(request.getTitle());
        notification.setMessage(request.getMessage());
        notification.setPriority(request.getPriority());
    }

    /**
     * Converts Notification entity
     * into NotificationResponse DTO.
     *
     * @param notification notification entity
     * @return response dto
     */
    public NotificationResponse toResponse(Notification notification) {

        if (notification == null) {
            return null;
        }

        return NotificationResponse.builder()
                .id(notification.getId())
                .notificationCode(notification.getNotificationCode())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .type(notification.getType())
                .priority(notification.getPriority())
                .status(notification.getStatus())
                .readAt(notification.getReadAt())
                .createdAt(notification.getCreatedAt())
                .build();
    }

}