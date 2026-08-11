package com.orbitguard.notification.dto.request;

import com.orbitguard.notification.enums.NotificationPriority;
import com.orbitguard.notification.enums.NotificationStatus;
import com.orbitguard.notification.enums.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * ===============================================================
 * Notification Filter Request DTO
 * ===============================================================
 *
 * Request object used to filter notifications.
 *
 * This DTO is responsible only for filtering parameters.
 * Searching, pagination, and sorting are handled separately
 * by NotificationSearchRequest.
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
public class NotificationFilterRequest {

    /**
     * Filter notifications by status.
     */
    private NotificationStatus status;

    /**
     * Filter notifications by priority.
     */
    private NotificationPriority priority;

    /**
     * Filter notifications by notification type.
     */
    private NotificationType type;

    /**
     * Filter notifications by recipient.
     */
    private String recipientId;

    /**
     * Filter active or inactive notifications.
     *
     * true  -> Active notifications
     * false -> Soft deleted notifications
     * null  -> Active notifications by default
     */
    private Boolean isActive;

}