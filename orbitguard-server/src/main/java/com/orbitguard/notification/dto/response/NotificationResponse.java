package com.orbitguard.notification.dto.response;

import com.orbitguard.notification.enums.NotificationPriority;
import com.orbitguard.notification.enums.NotificationStatus;
import com.orbitguard.notification.enums.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * ===============================================================
 * Notification Response DTO
 * ===============================================================
 *
 * Response object returned to the client after notification
 * operations.
 *
 * This DTO exposes business-relevant information required
 * by the client while hiding internal database implementation
 * details.
 *
 * Module : Notification Management
 *
 * @author OrbitGuard AI Team
 * @version 1.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponse {

    /**
     * Business notification code.
     *
     * Example:
     * NOT-000001
     */
    private String notificationCode;

    /**
     * MongoDB document identifier.
     */
    private String id;

    /**
     * Recipient user identifier.
     */
    private String recipientId;

    /**
     * Notification title.
     */
    private String title;

    /**
     * Notification message.
     */
    private String message;

    /**
     * Notification category.
     */
    private NotificationType type;

    /**
     * Notification priority.
     */
    private NotificationPriority priority;

    /**
     * Current notification status.
     */
    private NotificationStatus status;

    /**
     * Related Alert ID.
     *
     * Nullable for notifications that are not related
     * to an Alert.
     */
    private String alertId;

    /**
     * Related Collision Risk ID.
     *
     * Nullable for notifications that are not related
     * to a Collision Risk.
     */
    private String collisionRiskId;

    /**
     * Time when the notification was read.
     */
    private LocalDateTime readAt;

    /**
     * Notification creation timestamp.
     */
    private LocalDateTime createdAt;

    /**
     * Notification last update timestamp.
     */
    private LocalDateTime updatedAt;

}